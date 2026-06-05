import { InterviewPin } from "@/components/pin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/config/firebase-config";
import { Interview } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  Plus, Sparkles, CalendarClock, CheckCircle2,
  Clock, Radio, BrainCircuit,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Dashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "interviews"), where("userId", "==", userId));
    const unsub = onSnapshot(q,
      (snap) => {
        setInterviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interview)));
        setLoading(false);
      },
      (err) => {
        console.log(err);
        toast.error("Error", { description: "Could not load your interviews." });
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId]);

  const scheduled = interviews.filter((i) => i.status === "scheduled" || !i.status);
  const inProgress = interviews.filter((i) => i.status === "in-progress");
  const completed = interviews.filter((i) => i.status === "completed");

  return (
    <div className="flex flex-col w-full gap-8 py-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 p-8 text-white shadow-2xl shadow-violet-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-24 translate-x-24" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-24 -translate-x-24" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-violet-200 text-sm font-semibold">
              <BrainCircuit className="h-4 w-4" />AI Interview Dashboard
            </div>
            <h1 className="text-3xl font-extrabold">My Interviews</h1>
            <p className="text-violet-200 text-sm">
              Schedule, manage, and review all your AI mock interviews in one place.
            </p>
          </div>
          <Link to="/generate/schedule">
            <Button className="bg-white text-violet-700 hover:bg-violet-50 font-bold gap-2 shadow-lg hover:scale-[1.03] transition-all duration-200">
              <Plus className="h-4 w-4" />Schedule New Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      {!loading && interviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Sparkles className="h-5 w-5 text-violet-500 mx-auto" />, value: interviews.length, label: "Total", color: "text-violet-600" },
            { icon: <CalendarClock className="h-5 w-5 text-sky-500 mx-auto" />, value: scheduled.length, label: "Scheduled", color: "text-sky-600" },
            { icon: <Radio className="h-5 w-5 text-emerald-500 mx-auto" />, value: inProgress.length, label: "In Progress", color: "text-emerald-600" },
            { icon: <CheckCircle2 className="h-5 w-5 text-indigo-500 mx-auto" />, value: completed.length, label: "Completed", color: "text-indigo-600" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm text-center space-y-1 hover:shadow-md transition-shadow">
              {s.icon}
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Interview Sections ────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 gap-6 rounded-3xl border border-dashed border-violet-200 bg-gradient-to-br from-violet-50/40 to-indigo-50/40">
          <div className="p-6 rounded-full bg-violet-100">
            <BrainCircuit className="h-12 w-12 text-violet-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-800">No interviews yet</h2>
            <p className="text-slate-500 text-sm max-w-sm">
              Schedule your first AI mock interview to start practising. The AI will ask questions, evaluate your answers, and give detailed feedback.
            </p>
          </div>
          <Link to="/generate/schedule">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white gap-2 hover:scale-[1.03] transition-all duration-200 shadow-lg shadow-violet-500/25">
              <Plus className="h-4 w-4" />Schedule First Interview
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* In-progress */}
          {inProgress.length > 0 && (
            <Section
              title="In Progress"
              icon={<Radio className="h-4 w-4 text-emerald-500" />}
              color="emerald"
              items={inProgress}
            />
          )}
          {/* Scheduled */}
          {scheduled.length > 0 && (
            <Section
              title="Scheduled"
              icon={<CalendarClock className="h-4 w-4 text-sky-500" />}
              color="sky"
              items={scheduled}
            />
          )}
          {/* Completed */}
          {completed.length > 0 && (
            <Section
              title="Completed"
              icon={<CheckCircle2 className="h-4 w-4 text-indigo-500" />}
              color="indigo"
              items={completed}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ── Section sub-component ──────────────────────────────────────────────────────
const Section = ({
  title, icon, color, items,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: Interview[];
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="font-bold text-slate-800 text-base">{title}</h2>
      <span className={`text-xs font-bold rounded-full px-2 py-0.5 bg-${color}-100 text-${color}-700`}>
        {items.length}
      </span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((interview) => (
        <InterviewPin key={interview.id} interview={interview} />
      ))}
    </div>
  </div>
);
