"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, CheckCircle2, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AnalyticsViewProps {
  dailyLogs: Array<{ date: string; tasksCompleted: number; focusMinutes: number }>;
  streakData?: { current: number; longest: number; totalCompletions: number } | null;
  tasks: Array<{ status: string; priority: string; category?: string; estimatedTime?: string }>;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_NAMES[d.getDay()];
}

const CATEGORY_COLORS: Record<string, { soft: string; solid: string; text: string }> = {
  Work: { soft: "bg-primary-soft", solid: "bg-primary", text: "text-white" },
  Study: { soft: "bg-accent-soft", solid: "bg-accent", text: "text-accent" },
  Personal: { soft: "bg-success-soft", solid: "bg-success", text: "text-success" },
  Uncategorized: { soft: "bg-info-soft", solid: "bg-info", text: "text-info" },
};

const FALLBACK_COLOR = CATEGORY_COLORS["Uncategorized"];

function getCategoryColors(category: string) {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}

export function AnalyticsView({ dailyLogs, streakData, tasks }: AnalyticsViewProps) {
  const recentLogs = useMemo(() => {
    const sorted = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-14);
  }, [dailyLogs]);

  const maxFocus = useMemo(() => {
    if (recentLogs.length === 0) return 1;
    return Math.max(...recentLogs.map((l) => l.focusMinutes), 1);
  }, [recentLogs]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const task of tasks) {
      const cat = task.category?.trim() || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [tasks]);

  const categoryEntries = useMemo(
    () => Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]),
    [categoryCounts]
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-6 space-y-6">
      {/* Focus Hours Trend */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-2xl border border-border bg-surface p-5 lg:p-6"
      >
        <h2 className="display-font text-lg font-semibold text-text mb-5">Focus Trend</h2>
        <p className="text-xs text-text-muted mb-6">Last 14 days · minutes focused per day</p>
        {recentLogs.length === 0 ? (
          <div className="flex h-[160px] items-center justify-center">
            <p className="text-sm text-text-muted">No focus data yet. Start a timer to begin tracking.</p>
          </div>
        ) : (
          <div className="flex items-end gap-1.5 sm:gap-2">
            {recentLogs.map((log) => {
              const barHeight = Math.max(4, (log.focusMinutes / maxFocus) * 120);
              const dayName = getDayName(log.date);
              return (
                <div
                  key={log.date}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      "group relative w-full rounded-md bg-primary/70 transition-colors duration-200 hover:bg-primary"
                    )}
                    style={{ height: `${barHeight}px` }}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-2 py-0.5 text-xs font-medium text-surface opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                      {log.focusMinutes} min
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-text-muted sm:text-xs">
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* Category Breakdown + Completion Rate */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.07 }}
          className="rounded-2xl border border-border bg-surface p-5 lg:p-6"
        >
          <h2 className="display-font text-lg font-semibold text-text mb-4">Tasks by Category</h2>
          {categoryEntries.length === 0 ? (
            <p className="text-sm text-text-muted py-8 text-center">No tasks to categorize yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Pill chips */}
              <div className="flex flex-wrap gap-2">
                {categoryEntries.map(([category, count]) => {
                  const colors = getCategoryColors(category);
                  return (
                    <span
                      key={category}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                        colors.soft,
                        colors.text
                      )}
                    >
                      {category}
                      <span
                        className={cn(
                          "inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                          colors.solid,
                          colors.text
                        )}
                      >
                        {count}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* Horizontal stacked bar */}
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                {categoryEntries.map(([category, count]) => {
                  const colors = getCategoryColors(category);
                  const pct = (count / totalTasks) * 100;
                  return (
                    <div
                      key={category}
                      className={cn("h-full transition-all", colors.solid)}
                      style={{ width: `${pct}%` }}
                      title={`${category}: ${count}`}
                    />
                  );
                })}
              </div>
              <p className="text-[11px] text-text-muted">
                {categoryEntries.length} category
                {categoryEntries.length !== 1 ? "ies" : "y"} · {totalTasks} total task
                {totalTasks !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </motion.section>

        {/* Completion Rate */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
          className="rounded-2xl border border-border bg-surface p-5 lg:p-6"
        >
          <h2 className="display-font text-lg font-semibold text-text mb-2">Completion Rate</h2>
          <p className="text-xs text-text-muted mb-5">
            {completedTasks} of {totalTasks} tasks completed
          </p>
          <div className="flex items-baseline justify-between mb-3">
            <span className="display-font text-3xl font-bold text-primary">
              {completionRate.toFixed(0)}%
            </span>
            {completionRate >= 70 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <ChevronUp className="h-3.5 w-3.5" />
                On track
              </span>
            )}
          </div>
          <Progress value={completionRate} />
          {completionRate === 100 && totalTasks > 0 && (
            <p className="mt-3 text-xs text-success font-medium">All tasks completed — great job!</p>
          )}
        </motion.section>
      </div>

      {/* Streak Callout */}
      {streakData && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.18 }}
          className="rounded-2xl border border-border bg-surface p-5 lg:p-6"
        >
          <h2 className="display-font text-lg font-semibold text-text mb-4">
            Productivity Streak
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft">
                <Flame className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="display-font text-2xl font-bold text-text">{streakData.current}</p>
                <p className="text-xs text-text-muted">Current streak</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="display-font text-2xl font-bold text-text">{streakData.longest}</p>
                <p className="text-xs text-text-muted">Longest streak</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-success-soft">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="display-font text-2xl font-bold text-text">{streakData.totalCompletions}</p>
                <p className="text-xs text-text-muted">Total completions</p>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
