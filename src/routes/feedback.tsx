import { db } from "@/config/firebase-config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  Star, CircleCheck, Trophy, TrendingUp, MessageSquare,
  LayoutDashboard, CalendarPlus, Tags, Clock, AlertTriangle,
  CheckCircle2, XCircle, Lightbulb, Target, Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Helpers ────────────────────────────────────────────────────────────────────

const getRatingColor = (r: number) =>
  r >= 8 ? "text-emerald-600" : r >= 5 ? "text-amber-600" : "text-red-500";

const getRatingBg = (r: number) =>
  r >= 8 ? "bg-emerald-50 border-emerald-200" : r >= 5 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

const getRatingLabel = (r: number) =>
  r >= 9 ? "Excellent" : r >= 7 ? "Good" : r >= 5 ? "Average" : r >= 3 ? "Needs Work" : "Poor";

// Derives improvement areas from low-rated answers
const deriveImprovements = (feedbacks: UserAnswer[]) => {
  return feedbacks
    .filter((f) => f.rating < 7)
    .filter((f) => 
      !f.feedback.includes("Answer recorded") && 
      !f.feedback.includes("AI is busy") &&
      f.feedback.length > 10
    )
    .map((f) => ({
      question: f.question,
      feedback: f.feedback,
      rating: f.rating,
      answer: f.user_ans,
    }))
    .slice(0, 5);
};

// ── Component ──────────────────────────────────────────────────────────────────

export const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [activeFeed, setActiveFeed] = useState("");
  const { userId } = useAuth();
  const navigate = useNavigate();

  if (!interviewId) navigate("/generate", { replace: true });

  useEffect(() => {
    if (!interviewId) return;
    const fetchInterview = async () => {
      try {
        const snap = await getDoc(doc(db, "interviews", interviewId));
        if (snap.exists()) setInterview({ id: snap.id, ...snap.data() } as Interview);
      } catch (e) { console.log(e); }
    };
    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "userAnswers"),
          where("userId", "==", userId),
          where("mockIdRef", "==", interviewId),
        );
        const snap = await getDocs(q);
        setFeedbacks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserAnswer)));
      } catch (e) { console.log(e); }
      finally { setIsLoading(false); }
    };
    fetchInterview();
    fetchFeedbacks();
  }, [interviewId, navigate, userId]);

  const overallRating = useMemo(() => {
    if (!feedbacks.length) return "0.0";
    return (feedbacks.reduce((a, f) => a + f.rating, 0) / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const numericOverall = parseFloat(overallRating);
  const improvements = useMemo(() => deriveImprovements(feedbacks), [feedbacks]);
  const strongAnswers = feedbacks.filter((f) => f.rating >= 7).length;

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  return (
    <div className="flex flex-col w-full gap-8 py-6">
      <CustomBreadCrumb
        breadCrumbPage="Feedback"
        breadCrumpItems={[
          { label: "Dashboard", link: "/generate" },
          { label: interview?.position || "Interview", link: `/generate/interview/${interview?.id}` },
        ]}
      />

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 p-8 md:p-10 text-white shadow-2xl shadow-violet-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 translate-y-28 -translate-x-28" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-violet-200 text-sm font-semibold">
              <Trophy className="h-4 w-4" />
              {interview?.stoppedEarly ? "Interview Ended Early" : "Interview Complete"}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {interview?.stoppedEarly ? "Partial Session Results" : "Your Interview Report 🎉"}
            </h1>
            <p className="text-violet-200 text-sm max-w-lg leading-6">
              {interview?.stoppedEarly
                ? "You ended the session before all questions were answered. Your responses up to that point have been evaluated."
                : "All questions have been answered and evaluated. Here is your personalized AI feedback report."}
            </p>

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-violet-200">
              {interview?.topics && (
                <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                  <Tags className="h-3 w-3" />{interview.topics}
                </span>
              )}
              {interview?.duration && (
                <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                  <Clock className="h-3 w-3" />{interview.duration} min session
                </span>
              )}
              {interview?.timeTaken !== undefined && (
                <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                  <Timer className="h-3 w-3" />Time taken: {interview.timeTaken} min
                </span>
              )}
            </div>
          </div>

          {/* Score ring */}
          <div className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 min-w-[140px] flex-shrink-0">
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3"
                  strokeDasharray={`${numericOverall * 10}, 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute text-xl font-extrabold">{overallRating}</span>
            </div>
            <p className="text-white/70 text-xs font-medium">Overall Score</p>
            <p className="text-sm font-bold">{getRatingLabel(numericOverall)} /10</p>
          </div>
        </div>
      </div>

      {/* ── Early Stop Warning ───────────────────────────────────────────────── */}
      {interview?.stoppedEarly && (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900">Interview was ended early</p>
            <p className="text-sm text-amber-700">
              You manually stopped the interview
              {interview.timeTaken !== undefined && ` after ${interview.timeTaken} minute${interview.timeTaken !== 1 ? "s" : ""}`}
              {interview.duration ? ` out of ${interview.duration} minutes planned` : ""}.
              Only {feedbacks.length} question{feedbacks.length !== 1 ? "s" : ""} were answered and evaluated.
              For a complete assessment, consider scheduling a full-length interview.
            </p>
          </div>
        </div>
      )}

      {/* ── Stats Grid ───────────────────────────────────────────────────────── */}
      {feedbacks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <MessageSquare className="h-5 w-5 text-sky-500 mx-auto" />,
              value: feedbacks.length, label: "Answered", color: "text-sky-600" },
            { icon: <Star className="h-5 w-5 text-amber-500 mx-auto" />,
              value: overallRating, label: "Avg Rating", color: getRatingColor(numericOverall) },
            { icon: <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto" />,
              value: strongAnswers, label: "Strong Answers", color: "text-emerald-600" },
            { icon: <Target className="h-5 w-5 text-rose-500 mx-auto" />,
              value: improvements.length, label: "Areas to Improve", color: "text-rose-600" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm text-center space-y-1 hover:shadow-md transition-shadow">
              {s.icon}
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Areas to Improve ─────────────────────────────────────────────────── */}
      {improvements.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-rose-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-rose-500" />
            Areas to Improve
          </h2>
          <p className="text-xs text-rose-700">
            These are the questions where your performance was below expectations (rated below 7/10). Focus on these areas before your next interview.
          </p>
          <div className="space-y-3">
            {improvements.map((item, i) => (
              <div key={i} className="rounded-xl border border-rose-200 bg-white p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900 flex-1">{item.question}</p>
                  <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${getRatingBg(item.rating)} ${getRatingColor(item.rating)}`}>
                    {item.rating}/10
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 rounded-lg px-3 py-2">
                  <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-rose-500" />
                  <p>{item.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Strong Answers Highlight ─────────────────────────────────────────── */}
      {strongAnswers > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 space-y-2">
          <h2 className="text-base font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Strong Answers ({strongAnswers})
          </h2>
          <div className="flex flex-wrap gap-2">
            {feedbacks.filter((f) => f.rating >= 7).map((f, i) => (
              <span key={i} className="text-xs bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full px-3 py-1 font-medium line-clamp-1 max-w-xs">
                ✓ {f.question.length > 60 ? f.question.slice(0, 60) + "…" : f.question}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Detailed Feedback Accordion ──────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-violet-600" />
          Detailed Question Breakdown
        </h2>

        {feedbacks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center space-y-3">
            <XCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm">No answers were recorded for this interview.</p>
            <p className="text-slate-400 text-xs">This can happen if you ended the session before answering any questions.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {feedbacks.map((feed, idx) => (
              <AccordionItem
                key={feed.id} value={feed.id}
                className={cn("border rounded-2xl shadow-sm overflow-hidden",
                  activeFeed === feed.id ? "border-violet-200" : "border-slate-100")}
              >
                <AccordionTrigger
                  onClick={() => setActiveFeed((p) => p === feed.id ? "" : feed.id)}
                  className={cn("px-5 py-4 flex items-center justify-between text-sm rounded-t-2xl hover:no-underline",
                    activeFeed === feed.id ? "bg-gradient-to-r from-violet-50 to-indigo-50" : "hover:bg-slate-50 bg-white")}
                >
                  <div className="flex items-center gap-3 text-left min-w-0">
                    <span className="flex-shrink-0 h-7 w-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                    <span className="font-medium text-slate-900 line-clamp-1">{feed.question}</span>
                  </div>
                  <div className={cn("flex-shrink-0 ml-4 text-sm font-bold px-3 py-1 rounded-full border", getRatingBg(feed.rating))}>
                    <span className={getRatingColor(feed.rating)}>{feed.rating}/10</span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="bg-white rounded-b-2xl">
                  <div className="px-5 py-5 space-y-4">
                    {/* Rating bar */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className={cn("h-2 flex-1 rounded-full",
                          i < feed.rating
                            ? feed.rating >= 7 ? "bg-emerald-400" : feed.rating >= 4 ? "bg-amber-400" : "bg-red-400"
                            : "bg-slate-100")} />
                      ))}
                      <span className={`ml-2 text-xs font-bold flex-shrink-0 ${getRatingColor(feed.rating)}`}>
                        {getRatingLabel(feed.rating)}
                      </span>
                    </div>

                    {/* Expected answer */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                        <CircleCheck className="h-4 w-4 text-emerald-600" />Model Answer
                      </p>
                      <p className="text-sm text-emerald-900 leading-6">{feed.correct_ans}</p>
                    </div>

                    {/* Your answer */}
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 space-y-2">
                      <p className="flex items-center gap-2 text-sm font-semibold text-sky-800">
                        <MessageSquare className="h-4 w-4 text-sky-600" />Your Response
                      </p>
                      <p className="text-sm text-sky-900 leading-6">{feed.user_ans || <span className="italic text-sky-400">No response recorded</span>}</p>
                    </div>

                    {/* Improvement tip */}
                    <div className={cn("rounded-xl border p-4 space-y-2",
                      feed.rating >= 7 ? "border-emerald-200 bg-emerald-50/50" : "border-violet-200 bg-violet-50")}>
                      <p className="flex items-center gap-2 text-sm font-semibold text-violet-800">
                        {feed.rating >= 7
                          ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" />What you did well</>
                          : <><Lightbulb className="h-4 w-4 text-violet-500" />How to improve</>}
                      </p>
                      <p className={cn("text-sm leading-6",
                        feed.rating >= 7 ? "text-emerald-900" : "text-violet-900")}>
                        {feed.feedback && !feed.feedback.includes("Answer recorded") && !feed.feedback.includes("AI is busy")
                          ? feed.feedback
                          : feed.rating >= 7
                            ? "Good answer! You demonstrated a solid understanding of the topic."
                            : "Review the model answer above and focus on clarity, depth, and specific examples in your next attempt."}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* ── Footer CTAs ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
        <Link to="/generate">
          <Button variant="outline" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />Back to Dashboard
          </Button>
        </Link>
        <Link to="/generate/schedule">
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:scale-[1.02] transition-all duration-300">
            <CalendarPlus className="h-4 w-4" />Schedule Another Interview
          </Button>
        </Link>
      </div>
    </div>
  );
};