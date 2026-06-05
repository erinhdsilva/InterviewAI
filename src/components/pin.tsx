import { Interview } from "@/types";
import { Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock, Clock, Tags, Sparkles, Newspaper,
  Play, CheckCircle2, Radio, CalendarCheck2, OctagonX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewPinProps {
  interview: Interview;
  onMockPage?: boolean;
}

// Status config
const STATUS_CONFIG = {
  scheduled:    { label: "Scheduled",   color: "bg-sky-100 text-sky-700 border-sky-200",    icon: <CalendarCheck2 className="h-3 w-3" /> },
  "in-progress": { label: "In Progress", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <Radio className="h-3 w-3" /> },
  completed:    { label: "Completed",   color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <CheckCircle2 className="h-3 w-3" /> },
} as const;

export const InterviewPin = ({ interview, onMockPage = false }: InterviewPinProps) => {
  const navigate = useNavigate();

  const interviewDate = interview?.scheduledStart
    ? new Date(interview.scheduledStart)
    : interview?.createdAt && typeof (interview.createdAt as Timestamp).toDate === "function"
      ? (interview.createdAt as Timestamp).toDate()
      : new Date();

  const status = interview.status ?? "scheduled";
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;
  const topicsText = interview.topics || interview.techStack || "";
  const topicTags = topicsText.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4);

  const handleAction = (to: string) => navigate(to, { replace: false });

  return (
    <div className={cn(
      "group flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer",
      status === "completed" && "hover:border-indigo-200",
      status === "in-progress" && "hover:border-emerald-200 border-l-4 border-l-emerald-400",
      status === "scheduled" && "hover:border-sky-200",
    )}>
      {/* Top row: title + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-violet-700 transition-colors">
            {interview.position || "Mock Interview"}
          </p>
          {interview.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{interview.description}</p>
          )}
        </div>
        <span className={cn(
          "flex-shrink-0 flex items-center gap-1 text-[10px] font-bold rounded-full border px-2.5 py-1",
          statusCfg.color,
        )}>
          {statusCfg.icon}{statusCfg.label}
          {interview.stoppedEarly && <OctagonX className="h-2.5 w-2.5 ml-0.5" />}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <CalendarClock className="h-3 w-3 text-slate-400" />
          {interviewDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          {" · "}
          {interviewDate.toLocaleTimeString("en-US", { timeStyle: "short" })}
        </span>
        {interview.duration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            {interview.duration} min
          </span>
        )}
        {interview.timeTaken !== undefined && status === "completed" && (
          <span className="flex items-center gap-1 text-indigo-500">
            <Clock className="h-3 w-3" />
            Took {interview.timeTaken} min
          </span>
        )}
      </div>

      {/* Topic tags */}
      {topicTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <Tags className="h-3 w-3 text-slate-400 flex-shrink-0" />
          {topicTags.map((tag, i) => (
            <span key={i} className="text-[10px] font-medium bg-violet-50 border border-violet-100 text-violet-700 rounded-full px-2.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons - based on status */}
      {!onMockPage && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          {/* Scheduled: can start or wait */}
          {status === "scheduled" && (
            <button
              onClick={() => handleAction(`/generate/interview/${interview.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold py-2 hover:opacity-90 transition-opacity"
            >
              <Play className="h-3.5 w-3.5" />Start Interview
            </button>
          )}

          {/* In-progress: resume */}
          {status === "in-progress" && (
            <button
              onClick={() => handleAction(`/generate/interview/${interview.id}/start`)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold py-2 hover:bg-emerald-500 transition-colors"
            >
              <Radio className="h-3.5 w-3.5" />Resume Interview
            </button>
          )}

          {/* Completed: view feedback */}
          {status === "completed" && (
            <button
              onClick={() => handleAction(`/generate/feedback/${interview.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold py-2 hover:bg-indigo-500 transition-colors"
            >
              <Newspaper className="h-3.5 w-3.5" />View Feedback
            </button>
          )}

          {/* All statuses can view detail */}
          {status !== "completed" && (
            <button
              onClick={() => handleAction(`/generate/feedback/${interview.id}`)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium py-2 px-3 hover:bg-slate-50 transition-colors"
              title="View partial feedback"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
