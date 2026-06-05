import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/config/firebase-config";
import { useAuth } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  CalendarClock,
  Clock,
  Loader2,
  Sparkles,
  Tags,
  Brain,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const getDefaultStartTime = () => {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const scheduleSchema = z.object({
  topics: z
    .string()
    .min(2, "Please enter at least one interview topic")
    .max(300, "Topics must be 300 characters or less"),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(180, "Duration must be 180 minutes or less"),
  scheduledStart: z
    .string()
    .min(1, "Schedule start time is required")
    .refine((value) => {
      const startTime = new Date(value).getTime();
      return Number.isFinite(startTime) && startTime > Date.now() - 60 * 1000;
    }, "Schedule start time cannot be in the past"),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const quickDurations = [15, 30, 45, 60];

export const ScheduleInterviewPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    mode: "onChange",
    defaultValues: {
      topics: "",
      duration: 30,
      scheduledStart: getDefaultStartTime(),
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: ScheduleFormData) => {
    if (!userId) {
      toast.error("Sign in required", {
        description: "Please sign in before scheduling an interview.",
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "interviews"), {
        position: "AI Mock Interview",
        description: `Scheduled AI mock interview on ${data.topics}`,
        experience: 0,
        techStack: data.topics,
        topics: data.topics,
        duration: data.duration,
        scheduledStart: data.scheduledStart,
        questions: [],
        status: "scheduled",
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Interview scheduled!", {
        description: "Your AI interview has been saved. Redirecting to the waiting room...",
      });
      navigate(`/generate/interview/${docRef.id}`, { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Error", {
        description: "Something went wrong while scheduling the interview.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, hsl(261,80%,60%) 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, hsl(220,80%,55%) 0%, transparent 50%),
                              radial-gradient(circle at 50% 50%, hsl(280,70%,40%) 0%, transparent 70%)`
          }}
        />
        {/* Floating orbs */}
        <div className="schedule-orb schedule-orb-1" />
        <div className="schedule-orb schedule-orb-2" />
        <div className="schedule-orb schedule-orb-3" />
      </div>

      <div className="relative z-10 flex w-full flex-col gap-6 py-8 px-4 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-white/60">
          <CustomBreadCrumb
            breadCrumbPage="Schedule Interview"
            breadCrumpItems={[{ label: "Dashboard", link: "/generate" }]}
          />
        </div>

        {/* Header */}
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 schedule-icon-glow">
              <Brain className="h-8 w-8 text-violet-300" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Schedule Your{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              AI Interview
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Set your topics, duration, and start time — the AI interviewer will
            be ready exactly when you are.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 space-y-8">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Topics Field */}
              <FormField
                control={form.control}
                name="topics"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="flex items-center gap-2 text-white/90 text-base font-semibold">
                        <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30">
                          <Tags className="h-4 w-4 text-sky-400" />
                        </div>
                        Interview Topics
                      </FormLabel>
                      <FormMessage className="text-red-400 text-xs" />
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-28 resize-y bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-violet-500/60 focus:ring-violet-500/20 rounded-xl transition-all duration-200"
                        placeholder="e.g. React hooks, system design, REST APIs, Node.js, databases..."
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-white/40">
                      Separate multiple topics with commas. The AI will ask questions on all listed topics.
                    </p>
                  </FormItem>
                )}
              />

              {/* Duration + Scheduled Time Row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2 text-white/90 text-base font-semibold">
                          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                            <Clock className="h-4 w-4 text-emerald-400" />
                          </div>
                          Duration (minutes)
                        </FormLabel>
                        <FormMessage className="text-red-400 text-xs" />
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={180}
                          className="h-12 bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-emerald-500/60 focus:ring-emerald-500/20 rounded-xl"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      {/* Quick select buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {quickDurations.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => form.setValue("duration", d, { shouldValidate: true })}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 border ${
                              field.value === d
                                ? "bg-emerald-500/30 border-emerald-500/60 text-emerald-300"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                            }`}
                          >
                            {d} min
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Scheduled Start */}
                <FormField
                  control={form.control}
                  name="scheduledStart"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2 text-white/90 text-base font-semibold">
                          <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30">
                            <CalendarClock className="h-4 w-4 text-violet-400" />
                          </div>
                          Scheduled Start Time
                        </FormLabel>
                        <FormMessage className="text-red-400 text-xs" />
                      </div>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="h-12 bg-white/5 border-white/15 text-white focus:border-violet-500/60 focus:ring-violet-500/20 rounded-xl [color-scheme:dark]"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-white/40">
                        The AI interview will start automatically at this time.
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview Summary */}
              {form.watch("topics") && (
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3">
                  <p className="text-violet-300 text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Interview Preview
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Tags className="h-3.5 w-3.5 text-sky-400" />
                      <span className="text-white/50">Topics:</span>
                      <span className="text-white/90 line-clamp-1">{form.watch("topics")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-white/50">Duration:</span>
                      <span className="text-white/90">{form.watch("duration")} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-3.5 w-3.5 text-violet-400" />
                      <span className="text-white/50">Starts:</span>
                      <span className="text-white/90">
                        {form.watch("scheduledStart")
                          ? new Date(form.watch("scheduledStart")).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() =>
                    form.reset({
                      topics: "",
                      duration: 30,
                      scheduledStart: getDefaultStartTime(),
                    })
                  }
                  className="text-white/50 hover:text-white/80 hover:bg-white/5 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 h-12 rounded-xl gap-2 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      Schedule Interview
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};
