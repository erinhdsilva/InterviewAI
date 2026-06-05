import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebase-config";
import { Interview } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import {
  CalendarClock,
  Clock,
  Tags,
  Sparkles,
  Mic,
  Video,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";

const padTwo = (n: number) => String(n).padStart(2, "0");

interface TimeComponents {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const getTimeLeft = (scheduledStart: string): TimeComponents => {
  const diff = new Date(scheduledStart).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds, total: diff };
};

export const MockLoadPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeComponents | null>(null);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) {
        navigate("/generate", { replace: true });
        return;
      }
      setIsLoading(true);
      try {
        const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
        if (interviewDoc.exists()) {
          setInterview({ id: interviewDoc.id, ...interviewDoc.data() } as Interview);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterview();
  }, [interviewId, navigate]);

  useEffect(() => {
    if (!interview?.scheduledStart) {
      setIsReady(true);
      return;
    }

    const tick = () => {
      const t = getTimeLeft(interview.scheduledStart!);
      setTimeLeft(t);
      if (t.total <= 0) {
        setIsReady(true);
        navigate(`/generate/interview/${interviewId}/start`, { replace: true });
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [interview, interviewId, navigate]);

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  if (!interview) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Interview not found</h2>
        <Link to="/generate">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  const isStartable = !interview.scheduledStart || isReady ||
    new Date(interview.scheduledStart).getTime() <= Date.now();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
        <div className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(261,80%,60%) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, hsl(220,80%,55%) 0%, transparent 50%)`
          }}
        />
        <div className="wait-orb wait-orb-1" />
        <div className="wait-orb wait-orb-2" />
      </div>

      <div className="relative z-10 flex w-full flex-col gap-8 py-8 px-4 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-white/60">
          <CustomBreadCrumb
            breadCrumbPage="Waiting Room"
            breadCrumpItems={[{ label: "Dashboard", link: "/generate" }]}
          />
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-violet-400 font-semibold tracking-widest text-sm uppercase">
            Interview Scheduled
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Your Interview is Ready
          </h1>
          <p className="text-white/50 text-base max-w-lg mx-auto">
            {isStartable
              ? "Your interview is about to begin. Click Start when you're ready!"
              : "The AI interviewer will launch automatically at the scheduled time."}
          </p>
        </div>

        {/* Countdown Timer Card */}
        {!isStartable && timeLeft && (
          <div className="flex justify-center py-4">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full countdown-pulse-ring" />
              <div className="relative rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl p-8 md:p-12 shadow-2xl text-center min-w-[320px]">
                <p className="text-white/50 text-sm uppercase tracking-widest mb-6 font-semibold">
                  Interview starts in
                </p>
                <div className="flex items-center justify-center gap-4 md:gap-6">
                  {timeLeft.hours > 0 && (
                    <>
                      <div className="flex flex-col items-center">
                        <div className="countdown-digit">
                          {padTwo(timeLeft.hours)}
                        </div>
                        <span className="text-white/40 text-xs mt-2 uppercase tracking-wider">Hours</span>
                      </div>
                      <span className="countdown-colon">:</span>
                    </>
                  )}
                  <div className="flex flex-col items-center">
                    <div className="countdown-digit">
                      {padTwo(timeLeft.minutes)}
                    </div>
                    <span className="text-white/40 text-xs mt-2 uppercase tracking-wider">Minutes</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="flex flex-col items-center">
                    <div className={`countdown-digit ${timeLeft.total < 60000 ? "countdown-urgent" : ""}`}>
                      {padTwo(timeLeft.seconds)}
                    </div>
                    <span className="text-white/40 text-xs mt-2 uppercase tracking-wider">Seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-2">
            <p className="flex items-center gap-2 text-sm text-white/50 font-medium">
              <CalendarClock className="h-4 w-4 text-violet-400" />
              Scheduled For
            </p>
            <p className="font-bold text-white text-base">
              {interview.scheduledStart
                ? new Date(interview.scheduledStart).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Immediate Start"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-2">
            <p className="flex items-center gap-2 text-sm text-white/50 font-medium">
              <Clock className="h-4 w-4 text-emerald-400" />
              Duration
            </p>
            <p className="font-bold text-white text-base">
              {interview.duration || 30} minutes
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-2">
            <p className="flex items-center gap-2 text-sm text-white/50 font-medium">
              <Tags className="h-4 w-4 text-sky-400" />
              Topics
            </p>
            <p className="font-bold text-white text-sm leading-relaxed line-clamp-2">
              {interview.topics || interview.techStack}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm p-6 space-y-4">
          <p className="text-amber-400 font-semibold text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Before Your Interview — Quick Checklist
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: <Mic className="h-4 w-4 text-emerald-400" />, text: "Microphone enabled & working" },
              { icon: <Video className="h-4 w-4 text-sky-400" />, text: "Webcam enabled (optional)" },
              { icon: <CheckCircle2 className="h-4 w-4 text-violet-400" />, text: "Quiet, distraction-free environment" },
              { icon: <CheckCircle2 className="h-4 w-4 text-amber-400" />, text: "Stay on this page — interview starts automatically" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Start button (shown when it's time) */}
        {isStartable && (
          <div className="flex justify-center">
            <Link to={`/generate/interview/${interviewId}/start`}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-10 py-4 h-14 rounded-2xl gap-3 text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:scale-[1.03]">
                <Sparkles className="h-5 w-5" />
                Start Interview Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Not started yet CTA */}
        {!isStartable && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-6 text-center text-white/40 text-sm">
            <p>Stay on this page. The interview will launch automatically when the countdown reaches zero.</p>
          </div>
        )}
      </div>
    </div>
  );
};
