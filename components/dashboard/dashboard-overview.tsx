"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  ListChecks,
  Calendar,
} from "lucide-react";
import type { Task, Goal as GoalType } from "@/lib/agent";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightCard, type Insight, deriveInsights } from "@/components/shared/insight-card";
import { StreakDisplay } from "@/components/analytics/streak-display";
import {
  PRIORITY_ORDER,
  isOverdue,
  formatDeadline,
  sortTasks,
  countByStatus,
} from "@/lib/helpers";
import { cn, tier2Hover } from "@/lib/utils";

type View =
  | "chat"
  | "tasks"
  | "goals"
  | "dashboard"
  | "analytics"
  | "heatmap"
  | "reflection"
  | "settings";

interface DashboardOverviewProps {
  tasks: Task[];
  goals: GoalType[];
  loading?: boolean;
  streakData?: {
    current: number;
    longest: number;
    totalCompletions: number;
    achievements: { id?: string; title: string; icon?: string }[];
  } | null;
  onViewChange?: (v: View) => void;
}

/* ── Stat card ──────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: "accent" | "danger" | "success" | "info";
  delay?: number;
}) {
  const accentClass: Record<string, string> = {
    accent: "bg-accent-soft text-accent",
    danger: "bg-danger-soft text-danger",
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.06, duration: 0.3, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden p-4 hover:shadow-lg transition-all duration-200 cursor-default">
        {/* Glow orb */}
        <div
          className={cn(
            "absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] blur-xl transition-transform duration-500 group-hover:scale-150 group-hover:opacity-[0.14]",
            accent === "accent"
              ? "bg-accent"
              : accent === "danger"
              ? "bg-danger"
              : accent === "success"
              ? "bg-success"
              : "bg-info"
          )}
        />
        <div className="flex items-start justify-between mb-3 relative">
          <div
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center",
              accentClass[accent]
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <span
            className="text-[26px] leading-none font-bold tabular-nums relative"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </span>
        </div>
        <p className="text-[12px] font-semibold text-text-secondary relative">
          {label}
        </p>
        {sub && <p className="text-[11px] text-text-muted mt-1 relative">{sub}</p>}
      </Card>
    </motion.div>
  );
}

/* ── Focus today card ───────────────────────────────────────────────────── */

function FocusTodayCard({
  tasks,
  onNavigate,
}: {
  tasks: Task[];
  onNavigate?: (v: View) => void;
}) {
  const focusTask = useMemo(() => {
    const active = tasks.filter(
      (t) => t.status !== "completed" && !isOverdue(t.deadline)
    );
    const ordered = [...active].sort((a, b) => {
      const ap = PRIORITY_ORDER[a.priority] ?? 2;
      const bp = PRIORITY_ORDER[b.priority] ?? 2;
      if (ap !== bp) return ap - bp;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
    return ordered[0] || null;
  }, [tasks]);

  if (!focusTask) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.35 }}
    >
      <Card
        onClick={() => onNavigate?.("tasks")}
        className="relative overflow-hidden p-6 cursor-pointer border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-surface via-surface to-primary/5 group"
      >
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/[0.06] rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125" />

        <div className="flex items-start justify-between gap-4 relative">
          <div className="flex items-start gap-5 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-soft to-primary/20 flex items-center justify-center shrink-0 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-sm shadow-primary/10">
              <Zap className="h-6 w-6 text-primary" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary/90 bg-primary/10 px-2.5 py-1 rounded-full">
                  Focus today
                </span>
                <span className="text-[11px] text-text-muted font-mono font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h3 className="text-[18px] font-bold text-text leading-snug truncate">
                {focusTask.title}
              </h3>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <PriorityBadge priority={focusTask.priority} />
                <span className="text-[11px] text-text-secondary flex items-center gap-1.5 bg-border-light/70 px-2 py-0.5 rounded-md font-medium">
                  <Clock className="h-3 w-3" />
                  {focusTask.estimatedTime}
                </span>
                <span className="text-[11px] text-text-muted">
                  Due {formatDeadline(focusTask.deadline)}
                </span>
                <span className="text-[11px] text-text-muted bg-border-light/70 px-2 py-0.5 rounded-md">
                  {focusTask.category}
                </span>
              </div>
            </div>
          </div>
          <div
            title="View task"
            className="shrink-0 mt-1 h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
          >
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ── Quick action button ────────────────────────────────────────────────── */

function QuickActionButton({
  icon: Icon,
  label,
  view,
  onNavigate,
}: {
  icon: React.ElementType;
  label: string;
  view: View;
  onNavigate?: (v: View) => void;
}) {
  return (
    <button
      onClick={() => onNavigate?.(view)}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer",
        "border border-border bg-surface text-text-secondary",
        "hover:-translate-y-0.5 hover:shadow-md hover:shadow-border/30 hover:border-border-strong",
        "transition-all duration-200"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/* ── Main dashboard ─────────────────────────────────────────────────────── */

export function DashboardOverview({
  tasks,
  goals,
  loading = false,
  streakData,
  onViewChange,
}: DashboardOverviewProps) {
  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status !== "completed");
    const completed = tasks.filter((t) => t.status === "completed");
    const overdueCount = pending.filter((t) => isOverdue(t.deadline)).length;
    const highUrgent = pending.filter((t) =>
      ["urgent", "high"].includes(t.priority)
    ).length;
    const rate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
    return {
      pending: pending.length,
      completed: completed.length,
      overdue: overdueCount,
      urgent: highUrgent,
      rate,
    };
  }, [tasks, goals]);

  const urgentTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "completed" && ["urgent", "high"].includes(t.priority))
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5),
    [tasks]
  );

  const overdueTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "completed" && isOverdue(t.deadline))
        .slice(0, 4),
    [tasks]
  );

  const insights = useMemo(
    () => deriveInsights({ tasks, goals }),
    [tasks, goals]
  );

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const isEmpty = tasks.length === 0 && goals.length === 0;

  if (isEmpty) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-soft to-info-soft flex items-center justify-center mb-5 shadow-lg shadow-primary/10">
          <TrendingUp className="h-7 w-7 text-primary" strokeWidth={2} />
        </div>
        <h3 className="display-font text-[17px] text-text mb-2 font-semibold">
          Your dashboard is empty
        </h3>
        <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
          Start a conversation with the AI to create tasks and goals, then come
          back here for your productivity overview.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-2.5 py-1 rounded-full">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h2 className="display-font text-[24px] text-text leading-none font-bold">
            Good {getTimeOfDay()}
          </h2>
          <p className="text-[13px] text-text-secondary mt-1.5 font-medium">
            {getBriefingInsight(tasks, goals)}
          </p>
        </motion.div>

        {/* Focus today */}
        <FocusTodayCard tasks={tasks} onNavigate={onViewChange} />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Zap}
            label="Tasks pending"
            value={stats.pending}
            sub={`${stats.overdue} overdue`}
            accent="accent"
            delay={0}
          />
          <StatCard
            icon={AlertTriangle}
            label="Overdue"
            value={stats.overdue}
            sub={stats.overdue > 0 ? "Needs attention" : "All clear"}
            accent="danger"
            delay={1}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completed}
            sub={`${stats.rate}% completion rate`}
            accent="success"
            delay={2}
          />
          <StatCard
            icon={TrendingUp}
            label="Completion rate"
            value={`${stats.rate}%`}
            sub={
              stats.overdue === 0 && stats.pending > 0 ? "On track" : undefined
            }
            accent="info"
            delay={3}
          />
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          <QuickActionButton
            icon={Zap}
            label="Add task"
            view="tasks"
            onNavigate={onViewChange}
          />
          <QuickActionButton
            icon={Target}
            label="Set goal"
            view="goals"
            onNavigate={onViewChange}
          />
          <QuickActionButton
            icon={Sparkles}
            label="Chat with AI"
            view="chat"
            onNavigate={onViewChange}
          />
        </motion.div>

        {/* Two-column: Insights (3/5) + Urgent (2/5) */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Insights */}
          <div className="lg:col-span-3">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-md bg-accent/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                </div>
                <h3 className="display-font text-[14px] text-text font-semibold">
                  Insights
                </h3>
              </div>
              {insights.length > 0 ? (
                <div className="space-y-1">
                  {insights.map((insight, i) => (
                    <InsightCard
                      key={insight.title + i}
                      insight={insight}
                      index={i}
                      compact
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles
                    className="h-8 w-8 text-text-muted mx-auto mb-3"
                    strokeWidth={1.5}
                  />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    No insights right now — you&apos;re all caught up
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Urgent tasks (2/5) */}
          <div className="lg:col-span-2">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-danger/10 flex items-center justify-center">
                    <Flame className="h-3.5 w-3.5 text-danger" />
                  </div>
                  <h3 className="display-font text-[14px] text-text font-semibold">
                    Urgent
                  </h3>
                </div>
                {stats.urgent > 0 && (
                  <span className="text-[11px] font-bold text-danger bg-danger-soft px-2.5 py-0.5 rounded-full">
                    {stats.urgent}
                  </span>
                )}
              </div>
              {overdueTasks.length > 0 ? (
                <div className="space-y-2">
                  {overdueTasks.map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-danger-soft/60 border border-danger/10"
                    >
                      <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-text truncate">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          Due {formatDeadline(t.deadline)}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-danger shrink-0 uppercase tracking-wider">
                        Overdue
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : urgentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2
                    className="h-8 w-8 text-success mx-auto mb-2"
                    strokeWidth={1.5}
                  />
                  <p className="text-xs text-text-secondary">
                    No urgent tasks right now
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {urgentTasks.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-border-light/40 border border-transparent"
                    >
                      <PriorityBadge priority={t.priority} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-text truncate">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Due {formatDeadline(t.deadline)}
                        </p>
                      </div>
                      {isOverdue(t.deadline) && (
                        <span className="text-[10px] font-bold text-danger shrink-0 uppercase tracking-wider">
                          Overdue
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Goals progress */}
        {goals.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="display-font text-[14px] text-text font-semibold">
                  Goals progress
                </h3>
              </div>
              <span className="text-[11px] text-text-muted font-medium bg-border-light px-2.5 py-1 rounded-full">
                {goals.length} {goals.length === 1 ? "goal" : "goals"}
              </span>
            </div>
            <div className="space-y-4">
              {goals.slice(0, 5).map((g) => {
                const done = g.milestones.filter((m) => m.done).length;
                const pct = Math.round((done / g.milestones.length) * 100) || 0;
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-text truncate flex-1">
                        {g.title}
                      </p>
                      <span className="text-[11px] text-text-muted tabular-nums ml-3 font-medium">
                        {done}/{g.milestones.length}
                      </span>
                    </div>
                    <Progress value={pct} className="h-[6px]" />
                  </motion.div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Active tasks overview */}
        {stats.pending > 0 && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                <ListChecks className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="display-font text-[14px] text-text font-semibold">
                Active tasks
              </h3>
              <span className="text-[11px] text-text-muted ml-1 font-medium bg-border-light px-2 py-0.5 rounded-full">
                {stats.pending}
              </span>
            </div>
            <div className="space-y-1">
              {tasks
                .filter((t) => t.status !== "completed")
                .sort(sortTasks)
                .slice(0, 8)
                .map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent transition-all duration-200",
                      isOverdue(t.deadline)
                        ? "bg-danger-soft/50 hover:border-danger/20"
                        : "hover:bg-border-light/60 hover:border-border-strong/40"
                    )}
                  >
                    <PriorityBadge priority={t.priority} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[12px] font-semibold truncate",
                          isOverdue(t.deadline) && "text-danger"
                        )}
                      >
                        {t.title}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Due {formatDeadline(t.deadline)}
                      </p>
                    </div>
                    {isOverdue(t.deadline) && (
                      <span className="text-[10px] font-bold text-danger shrink-0 uppercase tracking-wider">
                        Overdue
                      </span>
                    )}
                  </motion.div>
                ))}
            </div>
          </Card>
        )}

        {/* Streak + achievements */}
        {streakData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="not-prose border-l-4 border-l-accent">
              <StreakDisplay data={streakData} />
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── Client-side insight derivation ────────────────────────────────────── */

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function getBriefingInsight(tasks: Task[], goals: GoalType[]): string {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);
  const active = tasks.filter((t) => t.status !== "completed");

  const dueToday = active.filter((t) => {
    const d = new Date(t.deadline);
    return d >= todayStart && d < tomorrowStart;
  });
  const overdue = active.filter((t) => new Date(t.deadline) < todayStart);

  if (overdue.length > 0)
    return `${overdue.length} task${overdue.length > 1 ? "s are" : " is"} overdue — let's tackle those first.`;
  if (dueToday.length > 0)
    return `You have ${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today — stay sharp.`;
  if (active.length === 0 && goals.length === 0)
    return "Everything's clear. A good time to plan something new.";
  if (active.length === 0) return "No pending tasks — you're ahead of the game.";
  return `${active.length} active task${active.length > 1 ? "s" : ""} in flight — keep the momentum going.`;
}


