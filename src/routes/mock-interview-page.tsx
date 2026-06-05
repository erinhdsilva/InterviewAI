import { AiInterviewSession } from "@/components/ai-interview-session";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebase-config";
import { Interview } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  CalendarClock,
  Clock,
  Tags,
  Sparkles,
  Loader2,
  PartyPopper,
  Radio,
  Timer,
  OctagonX,
  Camera,
  Mic,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { toast } from "sonner";

export const MockInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConcluding, setIsConcluding] = useState(false);
  const [wasStoppedEarly, setWasStoppedEarly] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  const concludedRef = useRef(false);
  const sessionStartRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const { userId } = useAuth();

  const requestPermissions = async () => {
    setIsRequestingPermissions(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      // Stop the stream tracks immediately so they aren't kept busy
      stream.getTracks().forEach((track) => track.stop());
      setPermissionsGranted(true);
    } catch (err) {
      console.error("Permission error:", err);
      toast.error("Camera and microphone access denied.", {
        description: "Please allow permissions in your browser settings to continue.",
      });
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) { navigate("/generate", { replace: true }); return; }
      setIsLoading(true);
      try {
        const snap = await getDoc(doc(db, "interviews", interviewId));
        if (snap.exists()) setInterview({ id: snap.id, ...snap.data() } as Interview);
      } catch (e) { console.log(e); }
      finally { setIsLoading(false); }
    };
    fetchInterview();
  }, [interviewId, navigate]);

  // Record actual session start time
  useEffect(() => {
    if (isInterviewStarted && !sessionStartRef.current) {
      sessionStartRef.current = Date.now();
    }
  }, [isInterviewStarted]);

  // The conclusion handler
  const concludeInterview = useCallback(async (stoppedEarly = false) => {
    if (concludedRef.current) return;
    concludedRef.current = true;
    setWasStoppedEarly(stoppedEarly);
    setIsConcluding(true);

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    // Calculate actual time taken
    const timeTaken = sessionStartRef.current
      ? Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60_000))
      : interview?.duration ?? 0;

    if (interviewId) {
      try {
        await updateDoc(doc(db, "interviews", interviewId), {
          status: "completed",
          stoppedEarly,
          timeTaken,
          endedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (e) { console.log("Status update failed:", e); }
    }

    // TTS conclusion
    const concludeMsg = stoppedEarly
      ? `You have ended the interview early. Thank you for your time. Redirecting to your feedback page.`
      : `Thank you for completing the interview. The session has ended. Redirecting you to your feedback page.`;

    await new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      const msg = new SpeechSynthesisUtterance(concludeMsg);
      msg.rate = 0.95;
      msg.onend = () => resolve();
      msg.onerror = () => resolve();
      window.speechSynthesis.speak(msg);
      setTimeout(resolve, 7000);
    });

    navigate(`/generate/feedback/${interviewId}`, { replace: true });
  }, [interviewId, navigate, interview?.duration]);

  // Session countdown timer
  useEffect(() => {
    if (!interview) return;
    const startTime = interview.scheduledStart
      ? new Date(interview.scheduledStart).getTime() : Date.now();
    const duration = interview.duration ?? 30;
    const endTime = startTime + duration * 60_000;

    const tick = () => {
      const now = Date.now();
      if (now >= endTime) { concludeInterview(false); return; }
      if (now >= startTime) {
        setIsInterviewStarted(true);
        const rem = endTime - now;
        const m = Math.floor(rem / 60_000);
        const s = Math.floor((rem % 60_000) / 1_000);
        setCountdown(`${m}m ${s}s`);
      } else {
        setIsInterviewStarted(false);
        const rem = startTime - now;
        const m = Math.floor(rem / 60_000);
        const s = Math.floor((rem % 60_000) / 1_000);
        setCountdown(`Starts in ${m}m ${s}s`);
      }
    };

    tick();
    const timer = window.setInterval(tick, 1_000);
    return () => window.clearInterval(timer);
  }, [interview, concludeInterview]);

  if (isLoading) return <LoaderPage className="h-[70vh] w-full" />;

  if (!interview || !interviewId) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Interview not found</h2>
        <Link to="/generate"><Button variant="outline">Back to dashboard</Button></Link>
      </div>
    );
  }

  // ── Concluding Overlay ──────────────────────────────────────────────────────
  if (isConcluding) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
        <div className="text-center space-y-6 px-6 max-w-md">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full conclude-glow animate-ping" />
              <div className="relative p-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                {wasStoppedEarly
                  ? <OctagonX className="h-16 w-16 text-amber-400" />
                  : <PartyPopper className="h-16 w-16 text-yellow-400" />}
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white">
            {wasStoppedEarly ? "Interview Ended Early" : "Interview Complete! 🎉"}
          </h1>
          <p className="text-white/60 text-lg">
            {wasStoppedEarly
              ? "You ended the session before completion. Generating partial feedback..."
              : "Great session! Generating your personalized feedback..."}
          </p>
          <div className="flex items-center justify-center gap-3 text-violet-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Redirecting to feedback...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Interview Page ─────────────────────────────────────────────────────
  return (
    <div className="flex w-full flex-col gap-5 py-5">
      <CustomBreadCrumb
        breadCrumbPage="Interview"
        breadCrumpItems={[
          { label: "Dashboard", link: "/generate" },
          { label: interview.position || "Scheduled Interview", link: `/generate/interview/${interview.id}` },
        ]}
      />

      {/* Info bar - Only show when NOT started */}
      {!isInterviewStarted && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: <CalendarClock className="h-4 w-4 text-violet-500" />, label: "Scheduled Start",
              value: interview.scheduledStart ? new Date(interview.scheduledStart).toLocaleString() : "Starts now" },
            { icon: <Clock className="h-4 w-4 text-emerald-500" />, label: "Duration",
              value: `${interview.duration ?? 30} minutes` },
            { icon: <Tags className="h-4 w-4 text-sky-500" />, label: "Topics",
              value: interview.topics || interview.techStack },
          ].map((card, i) => (
            <div key={i} className="rounded-xl border bg-white p-4 shadow-sm space-y-1">
              <p className="flex items-center gap-2 text-xs text-gray-500 font-medium">{card.icon}{card.label}</p>
              <p className="font-semibold text-gray-900 text-sm line-clamp-1">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Permissions Check */}
      {!permissionsGranted ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-10 text-center space-y-6">
          <div className="flex justify-center gap-4">
            <div className="p-4 rounded-full bg-indigo-100 text-indigo-600">
              <Camera className="h-8 w-8" />
            </div>
            <div className="p-4 rounded-full bg-violet-100 text-violet-600">
              <Mic className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-xl">Camera & Microphone Access</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Before the interview begins, we need to ensure your camera and microphone are working correctly. 
              The AI will use these to interact with you.
            </p>
          </div>
          <Button 
            onClick={requestPermissions} 
            disabled={isRequestingPermissions}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 gap-2 px-8 py-6 text-lg hover:scale-105 transition-all"
          >
            {isRequestingPermissions ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
            Grant Permissions
          </Button>
        </div>
      ) : (
        <>
          {/* Status Banner */}
          {isInterviewStarted ? (
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                <div>
                  <p className="font-bold text-indigo-900 text-sm">Interview Live</p>
                  <p className="text-indigo-600 text-xs">Speak your answer → AI evaluates → generates follow-up questions.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white/80 px-3 py-1.5 text-sm font-bold text-indigo-800 tabular-nums">
                  <Timer className="h-3.5 w-3.5" />{countdown}
                </div>
                <Button size="sm" variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1.5"
                  onClick={() => concludeInterview(true)}>
                  <OctagonX className="h-3.5 w-3.5" />End Interview
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-4">
              <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">{countdown || "Preparing..."}</p>
                <p className="text-amber-700 text-xs mt-0.5">Interview will begin automatically at the scheduled time.</p>
              </div>
            </div>
          )}

          {/* Session or waiting */}
          {isInterviewStarted ? (
            <AiInterviewSession
              interview={interview} interviewId={interviewId}
              timeLeft={countdown} onConclude={() => concludeInterview(true)} userId={userId ?? ""}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-10 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-violet-100">
                  <Sparkles className="h-8 w-8 text-violet-500" />
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Waiting for interview to begin...</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Stay on this page. The AI interview starts automatically. You'll hear the first question read aloud.
              </p>
              <p className="font-bold text-violet-700 tabular-nums text-2xl">{countdown}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
