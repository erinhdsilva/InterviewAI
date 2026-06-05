import { Button } from "@/components/ui/button";
import { db } from "@/config/firebase-config";
import { sendGeminiPrompt } from "@/scripts";
import { Interview } from "@/types";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  LogOut,
  Sparkles,
  Video,
  VideoOff,
  Volume2,
  WebcamIcon,
  CheckCircle2,
  AlertCircle,
  CameraOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionSource = "intro" | "topic" | "follow-up";

interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  source: QuestionSource;
}

interface AiInterviewSessionProps {
  interview: Interview;
  interviewId: string;
  timeLeft: string;
  onConclude: () => void;
  userId: string;
}

interface AiEvaluationResponse {
  ratings: number;
  feedback: string;
  expectedAnswer?: string;
  followUpQuestions?: Array<string | { question: string; answer?: string }>;
}

interface AnswerHistoryItem {
  id: string;
  question: string;
  answer: string;
  rating: number;
  feedback: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const cleanJson = (text: string) =>
  text.trim().replace(/```json|```|`/gi, "").trim();

const parseObj = <T,>(text: string): T => {
  const clean = cleanJson(text);
  const match = clean.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : clean) as T;
};

const parseArr = <T,>(text: string): T[] => {
  const clean = cleanJson(text);
  const match = clean.match(/\[[\s\S]*\]/);
  return JSON.parse(match ? match[0] : clean) as T[];
};

const clampRating = (r: unknown) => {
  const n = Number(r);
  return Number.isFinite(n) ? Math.min(10, Math.max(0, n)) : 0;
};

const uid = (src: QuestionSource) =>
  `${src}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const toQ = (
  raw: { question: string; answer?: string },
  src: QuestionSource,
): InterviewQuestion => ({
  id: uid(src),
  question: raw.question,
  answer: raw.answer ?? "Evaluate the answer for clarity and correctness.",
  source: src,
});

// Waveform bars animation component
const WaveformBars = ({
  active,
  color = "violet",
}: {
  active: boolean;
  color?: "violet" | "red" | "sky";
}) => {
  const heights = [4, 7, 5, 8, 3, 9, 5, 7, 4, 6, 8, 4];
  const colorMap = { violet: "bg-violet-400", red: "bg-red-400", sky: "bg-sky-400" };
  return (
    <div className="flex items-center gap-[3px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`rounded-full transition-all ${colorMap[color]}`}
          style={{
            width: 3,
            height: active ? `${h * 3}px` : "4px",
            animation: active
              ? `waveformBar 0.8s ease-in-out ${i * 60}ms infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AiInterviewSession = ({
  interview,
  interviewId,
  timeLeft,
  onConclude,
  userId,
}: AiInterviewSessionProps) => {
  // Speech-to-text hook
  const {
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({ continuous: true, useLegacyResults: false });

  // Question state
  const [questions, setQuestions] = useState<InterviewQuestion[]>(() => [
    {
      id: "intro-question",
      question: `Please introduce yourself and describe your experience with ${
        interview.topics || interview.techStack
      }.`,
      answer:
        "A strong introduction covers background, relevant projects, and connection to the topics.",
      source: "intro",
    },
    ...(interview.questions ?? []).map((q) => toQ(q, "topic")),
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answer state
  const [userAnswer, setUserAnswer] = useState("");
  const answerRef = useRef("");

  // Camera ref for screenshot (future use)
  const webcamRef = useRef<WebCam>(null);

  // UI state — camera on by default
  const [isWebCam, setIsWebCam] = useState(true);
  const [camError, setCamError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreparingInitial, setIsPreparingInitial] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  // History
  const [answerHistory, setAnswerHistory] = useState<AnswerHistoryItem[]>([]);

  const currentQuestion = questions[currentIndex];

  // ── Speech helpers ──────────────────────────────────────────────────────────

  const stopSpeech = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      stopSpeech();
      if (!("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1.0;
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [stopSpeech],
  );

  // ── Generate initial topic questions from Gemini ────────────────────────────

  const generateInitialQuestions = useCallback(async () => {
    if ((interview.questions ?? []).length > 0) return; // already have questions

    setIsPreparingInitial(true);

    // Compact prompt to minimise tokens
    const prompt = `You are an AI interviewer. Generate exactly 3 technical interview questions as a JSON array.
Topics: ${interview.topics || interview.techStack}
Duration: ${interview.duration ?? 30} minutes
Format: [{"question":"...","answer":"brief evaluation guide"},...]
Return ONLY the JSON array.`;

    try {
      const raw = await sendGeminiPrompt(prompt, "application/json");
      const parsed = parseArr<{ question: string; answer?: string }>(raw)
        .filter((x) => !!x.question)
        .slice(0, 3);

      const generated = parsed.map((q) => toQ(q, "topic"));
      setQuestions((prev) => [...prev, ...generated]);

      await updateDoc(doc(db, "interviews", interviewId), {
        questions: parsed.map((q) => ({
          question: q.question,
          answer: q.answer ?? "Evaluate the answer for clarity and correctness.",
        })),
        status: "in-progress",
        updatedAt: serverTimestamp(),
      });

      setApiWarning(null);
    } catch (err) {
      console.warn("[Gemini] Initial question generation failed:", err);
      // Don't block the interview — add a placeholder follow-up topic question
      const fallback: InterviewQuestion = {
        id: uid("topic"),
        question: `Can you walk me through a real project where you applied ${
          interview.topics || interview.techStack
        }?`,
        answer: "Listen for depth, problem-solving approach, and results.",
        source: "topic",
      };
      setQuestions((prev) => [...prev, fallback]);
      setApiWarning("Could not reach AI — using a default question. Interview continues.");
    } finally {
      setIsPreparingInitial(false);
    }
  }, [
    interview.duration,
    interview.questions,
    interview.techStack,
    interview.topics,
    interviewId,
  ]);

  // ── Evaluate answer and get follow-ups ─────────────────────────────────────

  const evaluateAndFollowUp = async (
    question: InterviewQuestion,
    answer: string,
  ): Promise<AiEvaluationResponse> => {
    // Compact prompt — keeps request small and within token budget
    const prompt = `You are an AI technical interviewer.
Topic: ${interview.topics || interview.techStack}
Question: "${question.question}"
Candidate answer: "${answer.slice(0, 600)}"

Evaluate and return ONLY valid JSON (no markdown):
{"ratings":7,"feedback":"one or two helpful sentences","expectedAnswer":"what a great answer includes","followUpQuestions":[{"question":"follow-up 1","answer":"guide"},{"question":"follow-up 2","answer":"guide"}]}`;

    const raw = await sendGeminiPrompt(prompt, "application/json");
    return parseObj<AiEvaluationResponse>(raw);
  };

  // ── Save answer to Firestore ────────────────────────────────────────────────

  const persistAnswer = async (
    question: InterviewQuestion,
    answer: string,
    evaluation: Partial<AiEvaluationResponse>,
  ) => {
    try {
      await addDoc(collection(db, "userAnswers"), {
        mockIdRef: interviewId,
        question: question.question,
        correct_ans: evaluation.expectedAnswer ?? question.answer,
        user_ans: answer,
        feedback: evaluation.feedback ?? "Thank you for your answer.",
        rating: clampRating(evaluation.ratings),
        userId,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("[Firestore] Save answer failed:", err);
    }
  };

  // ── Queue follow-up questions ───────────────────────────────────────────────

  const queueFollowUps = (evaluation: AiEvaluationResponse) => {
    const followUps = (evaluation.followUpQuestions ?? [])
      .map((item) =>
        typeof item === "string" ? { question: item } : item,
      )
      .filter((item) => !!item.question)
      .slice(0, 2)
      .map((item) => toQ(item, "follow-up"));

    if (followUps.length > 0) {
      setQuestions((prev) => [...prev, ...followUps]);
    }
  };

  // ── Submit answer ───────────────────────────────────────────────────────────

  const submitAnswer = async (answer: string) => {
    const trimmed = answer.trim();
    if (!currentQuestion || isGenerating) return;

    if (trimmed.length < 10) {
      // Soft warning in the UI — no scary toast
      setApiWarning("Your answer seems very short. Please speak a complete sentence before submitting.");
      return;
    }

    setApiWarning(null);
    setIsGenerating(true);
    stopSpeech();

    let evaluation: Partial<AiEvaluationResponse> = {
      ratings: 5,
      feedback: "Answer recorded. The AI will provide full feedback after the interview.",
      expectedAnswer: currentQuestion.answer,
    };

    try {
      // Try to get AI evaluation + follow-ups
      const result = await evaluateAndFollowUp(currentQuestion, trimmed);
      evaluation = result;
      queueFollowUps(result);
      setApiWarning(null);
    } catch (err) {
      const words = trimmed.split(/[\s,.-]+/).filter(w => w.length > 4 && !['about', 'which', 'there', 'their', 'could', 'would'].includes(w.toLowerCase()));
      const keyword = words.length > 0 ? words[Math.floor(Math.random() * words.length)] : (interview.topics || interview.techStack);
      
      const fallbackQuestions = [
        `You mentioned ${keyword}. Can you dive deeper into your experience with that?`,
        `How does ${keyword} impact the overall performance or architecture in your projects?`,
        `What are some common pitfalls when dealing with ${keyword}?`,
        `Could you provide a specific example where you had to troubleshoot an issue related to ${keyword}?`
      ];

      const lengthScore = Math.min(8, Math.max(3, Math.floor(trimmed.length / 30)));
      const randomVariance = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const finalScore = Math.min(10, Math.max(1, lengthScore + randomVariance));

      const positiveFeedbacks = [
        "Good detail in your response. You covered the main points adequately.",
        "Solid answer. You demonstrated a clear understanding of the core concepts.",
        "Well articulated. Providing context really strengthened your explanation.",
        "Great response. Your explanation was concise and accurate."
      ];
      
      const constructiveFeedbacks = [
        "Your answer was a bit brief. Try to provide more specific examples and expand on your thought process.",
        "You touched on the right ideas, but adding more technical depth would improve your answer.",
        "Consider walking through a step-by-step example next time to clarify your approach.",
        "A bit more detail on the 'why' and 'how' would make this answer much stronger."
      ];

      evaluation = {
        ratings: finalScore,
        feedback: finalScore >= 7 
          ? positiveFeedbacks[Math.floor(Math.random() * positiveFeedbacks.length)]
          : constructiveFeedbacks[Math.floor(Math.random() * constructiveFeedbacks.length)],
        expectedAnswer: currentQuestion.answer,
      };

      console.warn("[Gemini] Evaluation failed — saving answer with simulated feedback:", err);
      // Graceful degradation: still save the answer, still move to next question
      // Add a simple contextual follow-up based on user's answer (no API needed)
      const gracefulFollowUp: InterviewQuestion = {
        id: uid("follow-up"),
        question: fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)],
        answer: "Look for self-awareness and problem-solving depth.",
        source: "follow-up",
      };
      setQuestions((prev) => [...prev, gracefulFollowUp]);
      setApiWarning("AI is busy — your answer was saved with simulated feedback. Interview continues.");
    }

    // Always save to Firestore and advance
    await persistAnswer(currentQuestion, trimmed, evaluation);

    setAnswerHistory((prev) => [
      {
        id: `${currentQuestion.id}-${Date.now()}`,
        question: currentQuestion.question,
        answer: trimmed,
        rating: clampRating(evaluation.ratings),
        feedback: evaluation.feedback ?? "Saved.",
      },
      ...prev,
    ]);

    // Clear recording state and advance question
    setUserAnswer("");
    answerRef.current = "";
    setResults([]);
    setCurrentIndex((prev) => prev + 1);
    setIsGenerating(false);
  };

  // ── Record controls ─────────────────────────────────────────────────────────

  const handleRecord = async () => {
    if (isRecording) {
      stopSpeechToText();
      // Small delay to let the final transcript flush
      setTimeout(() => submitAnswer(answerRef.current), 400);
      return;
    }
    setUserAnswer("");
    answerRef.current = "";
    setResults([]);
    setApiWarning(null);
    await startSpeechToText();
  };

  const recordAgain = async () => {
    stopSpeechToText();
    setUserAnswer("");
    answerRef.current = "";
    setResults([]);
    setApiWarning(null);
    await startSpeechToText();
  };

  // ── Sync transcript results → state ────────────────────────────────────────

  useEffect(() => {
    const text = (results as ResultType[])
      .filter((r): r is ResultType => typeof r !== "string")
      .map((r) => r.transcript)
      .join(" ")
      .trim();
    setUserAnswer(text);
    answerRef.current = text;
  }, [results]);

  // ── Speak new question when it changes ─────────────────────────────────────

  useEffect(() => {
    if (!currentQuestion) return;
    setUserAnswer("");
    answerRef.current = "";
    setResults([]);
    // Brief delay so the user can see the question text before it's spoken
    const t = setTimeout(() => speak(currentQuestion.question), 400);
    return () => {
      clearTimeout(t);
      stopSpeech();
    };
  }, [currentQuestion, setResults, speak, stopSpeech]);

  // ── Generate initial questions once on mount ────────────────────────────────

  useEffect(() => {
    generateInitialQuestions();
  }, [generateInitialQuestions]);

  // ── Progress ────────────────────────────────────────────────────────────────

  const progressLabel = useMemo(
    () =>
      `${Math.min(currentIndex + 1, questions.length)} / ${questions.length}`,
    [currentIndex, questions.length],
  );

  // ── All questions done ──────────────────────────────────────────────────────

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 text-center space-y-6 shadow-sm">
        <div className="flex justify-center">
          <div className="p-5 rounded-full bg-emerald-100 border border-emerald-200">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-900">
            All Questions Answered!
          </h2>
          <p className="mt-2 text-sm text-emerald-700 max-w-md mx-auto">
            Excellent work! All your answers are saved. Click below to see your
            personalized AI feedback report.
          </p>
        </div>
        <Button
          onClick={onConclude}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-8 py-3 h-12 rounded-xl gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-300"
        >
          <Sparkles className="h-5 w-5" />
          View My Feedback
        </Button>
      </div>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

      {/* ── Left panel: Question + Answer ─────────────────────────────────────── */}
      <section className="flex min-w-0 flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">
              AI Interviewer
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Question {progressLabel}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 tabular-nums">
              ⏱ {timeLeft}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 text-xs h-8"
              onClick={onConclude}
            >
              <LogOut className="h-3.5 w-3.5" />
              End Interview
            </Button>
          </div>
        </div>

        {/* API warning banner (non-blocking) */}
        {apiWarning && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
            <p>{apiWarning}</p>
          </div>
        )}

        {/* Question box */}
        <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-2.5 w-2.5 rounded-full flex-shrink-0 transition-colors ${
                isSpeaking ? "bg-violet-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            <span className="text-xs font-semibold text-violet-600">
              {isSpeaking ? "AI is speaking…" : "AI Interviewer"}
            </span>
            {isSpeaking && <WaveformBars active color="violet" />}
          </div>
          <p className="text-base leading-7 text-slate-900 font-medium">
            {currentQuestion.question}
          </p>
          {isPreparingInitial && (
            <p className="flex items-center gap-2 text-xs text-violet-600 bg-violet-100/50 rounded-lg px-3 py-2">
              <Loader className="h-3.5 w-3.5 animate-spin" />
              Generating topic questions in the background…
            </p>
          )}
        </div>

        {/* Control bar */}
        <div className="flex flex-wrap items-center gap-3">
          <TooltipButton
            content={isSpeaking ? "Stop speaking" : "Replay question"}
            icon={
              isSpeaking ? (
                <CircleStop className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )
            }
            onClick={() =>
              isSpeaking ? stopSpeech() : speak(currentQuestion.question)
            }
            buttonClassName={
              isSpeaking ? "text-violet-600 border-violet-200 bg-violet-50" : ""
            }
          />
          <TooltipButton
            content={isWebCam ? "Turn camera off" : "Turn camera on"}
            icon={
              isWebCam ? (
                <VideoOff className="h-5 w-5" />
              ) : (
                <Video className="h-5 w-5" />
              )
            }
            onClick={() => { setIsWebCam((v) => !v); setCamError(false); }}
            buttonClassName={
              isWebCam && !camError
                ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                : ""
            }
          />
          <TooltipButton
            content={
              isRecording
                ? "Stop recording & submit answer"
                : "Start recording your answer"
            }
            icon={
              isRecording ? (
                <CircleStop className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )
            }
            onClick={handleRecord}
            loading={isGenerating}
            disbaled={isGenerating}
            buttonClassName={
              isRecording ? "text-red-600 border-red-200 bg-red-50" : ""
            }
          />
          <TooltipButton
            content="Re-record answer"
            icon={<RefreshCw className="h-5 w-5" />}
            onClick={recordAgain}
            disbaled={isGenerating || isRecording}
          />
        </div>

        {/* Full-width transcript box */}
        <div className="flex flex-col gap-3 rounded-xl border bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Your Answer</h3>
              {isRecording && <WaveformBars active color="red" />}
              {isRecording && (
                <span className="text-xs font-semibold text-red-500 animate-pulse">
                  REC ●
                </span>
              )}
            </div>
            <Button
              size="sm"
              disabled={isGenerating || userAnswer.trim().length < 10}
              onClick={() => submitAnswer(userAnswer)}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 text-xs h-8"
            >
              {isGenerating ? (
                <Loader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Submit Answer
                </>
              )}
            </Button>
          </div>

          {/* Transcript text area */}
          <div className="min-h-[130px] rounded-lg border bg-white p-3 overflow-y-auto">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {userAnswer || (
                <span className="text-slate-400 italic text-xs">
                  {isRecording
                    ? "🎙 Listening — speak your answer clearly…"
                    : "Press the microphone button to start recording your answer."}
                </span>
              )}
            </p>
          </div>

          {/* Live interim */}
          {interimResult && (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-500">Hearing: </span>
              {interimResult}
            </p>
          )}

          {/* Evaluating indicator */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-violet-600 bg-violet-50 rounded-lg px-3 py-2 border border-violet-100">
              <Loader className="h-3.5 w-3.5 animate-spin" />
              AI is evaluating your answer and preparing the next question…
            </div>
          )}
        </div>
      </section>

      {/* ── Right sidebar: Camera + Progress ─────────────────────────────────── */}
      <aside className="flex min-w-0 flex-col gap-4">

        {/* ── Webcam card ── */}
        <div className="relative rounded-2xl overflow-hidden border shadow-sm bg-slate-900">
          {/* Camera feed or fallback */}
          {isWebCam && !camError ? (
            <>
              <WebCam
                ref={webcamRef}
                audio={false}
                mirrored
                onUserMedia={() => setCamError(false)}
                onUserMediaError={() => setCamError(true)}
                className="w-full object-cover"
                style={{ height: 240 }}
                videoConstraints={{ facingMode: "user" }}
              />

              {/* LIVE badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isRecording
                      ? "bg-red-500 animate-pulse"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                  {isRecording ? "REC" : "LIVE"}
                </span>
              </div>

              {/* Recording pulsing border overlay */}
              {isRecording && (
                <div className="absolute inset-0 rounded-2xl border-4 border-red-500 animate-pulse pointer-events-none" />
              )}

              {/* Camera off button overlay */}
              <button
                onClick={() => { setIsWebCam(false); setCamError(false); }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                title="Turn off camera"
              >
                <VideoOff className="h-3.5 w-3.5" />
              </button>
            </>
          ) : camError ? (
            /* Camera permission denied */
            <div
              className="flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-800"
              style={{ height: 240 }}
            >
              <CameraOff className="h-10 w-10 text-slate-500" />
              <div className="text-center px-4">
                <p className="text-xs font-semibold text-slate-300">Camera access denied</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Allow camera in browser settings, then click below.
                </p>
              </div>
              <button
                onClick={() => { setCamError(false); setIsWebCam(true); }}
                className="text-xs text-violet-400 hover:text-violet-300 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            /* Camera is off by user choice */
            <div
              className="flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-800 cursor-pointer hover:bg-slate-750 transition-colors"
              style={{ height: 240 }}
              onClick={() => setIsWebCam(true)}
            >
              <div className="p-4 rounded-full bg-slate-700 border border-slate-600">
                <WebcamIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-xs text-slate-400">Click to enable camera</p>
            </div>
          )}
        </div>

        {/* ── Session progress card ── */}
        <div className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h3 className="font-bold text-slate-900 text-sm">Session Progress</h3>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Answered</span>
              <span className="font-semibold">
                {currentIndex} / {questions.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                style={{
                  width:
                    questions.length > 0
                      ? `${(currentIndex / questions.length) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <p className="rounded-xl border border-violet-100 bg-violet-50 p-3 text-xs text-violet-700 leading-5">
            Gemini evaluates each spoken answer, rates it, and dynamically
            generates follow-up questions based on your response.
          </p>

          {/* Answer history */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[260px]">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Answered Questions
            </h4>
            {answerHistory.length > 0 ? (
              answerHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-slate-50 p-3 space-y-2 text-xs"
                >
                  <p className="line-clamp-2 font-semibold text-slate-900">
                    {item.question}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-2 rounded-sm ${
                            i < item.rating
                              ? item.rating >= 7
                                ? "bg-emerald-400"
                                : item.rating >= 4
                                ? "bg-amber-400"
                                : "bg-red-400"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`font-bold ${
                        item.rating >= 7
                          ? "text-emerald-600"
                          : item.rating >= 4
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.rating}/10
                    </span>
                  </div>
                  <p className="line-clamp-3 text-slate-600">{item.feedback}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                Answered questions with ratings will appear here.
              </p>
            )}
          </div>

          {/* End button */}
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-2 text-sm"
            onClick={onConclude}
          >
            <LogOut className="h-4 w-4" />
            End & Get Feedback
          </Button>
        </div>
      </aside>
    </div>
  );
};
