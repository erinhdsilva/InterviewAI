import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

// Model priority list — if the first is quota-exhausted the next is tried
const MODEL_FALLBACKS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
];

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const baseGenerationConfig = {
  temperature: 0.85,
  topP: 0.95,
  topK: 40,
  // Keep tokens low to stay inside free-tier per-minute limits
  maxOutputTokens: 2048,
};

// ── Helpers ────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isQuotaError = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("quota") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("429") ||
    msg.includes("rate limit")
  );
};

// ── Core sendGeminiPrompt with retry + model fallback ─────────────────────

export const sendGeminiPrompt = async (
  prompt: string,
  responseMimeType: "text/plain" | "application/json" = "text/plain",
  maxRetries = 3,
): Promise<string> => {
  let lastError: unknown;

  for (let modelIdx = 0; modelIdx < MODEL_FALLBACKS.length; modelIdx++) {
    const modelName = MODEL_FALLBACKS[modelIdx];
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { ...baseGenerationConfig, responseMimeType },
          safetySettings,
        });
        return result.response.text();
      } catch (err) {
        lastError = err;

        if (isQuotaError(err)) {
          if (attempt < maxRetries - 1) {
            // Exponential back-off: 1 s, 2 s, 4 s …
            await sleep(1000 * Math.pow(2, attempt));
            continue;
          }
          // Exhausted retries on this model — try next model
          console.warn(`[Gemini] Quota exceeded on ${modelName}, trying fallback…`);
          break;
        }

        // Non-quota error — throw immediately
        throw err;
      }
    }
  }

  // All models exhausted
  throw lastError ?? new Error("All Gemini models are currently quota-limited. Please try again in a minute.");
};

// ── Legacy chat-session exports (kept for backward compat) ─────────────────

const primaryModel = genAI.getGenerativeModel({ model: MODEL_FALLBACKS[0] });

export const createChatSession = () =>
  primaryModel.startChat({
    generationConfig: baseGenerationConfig,
    safetySettings,
  });

export const chatSession = createChatSession();
