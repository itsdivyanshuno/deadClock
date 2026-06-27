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
} from "lucide-react";
import type { Task, Goal as GoalType } from "@/lib/agent";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightCard, type Insight } from "@/components/shared/insight-card";
import {
  PRIORITY_ORDER,
  isOverdue,
  formatDeadline,
  sortTasks,
  countByStatus,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface DashboardOverviewProps {
  tasks: Task[];
  goals: GoalType[];
  loading?: boolean;
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
      <Card className="p-4 hover:shadow-sm transition-all group cursor-default">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", accentClass[accent])}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <span className="text-[22px] leading-none tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
            {value}
          </span>
        </div>
        <p className="text-[12px] font-medium text-text-secondary">{label}</p>
        {sub && <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>}
      </Card>
    </motion.div>
  );
}

/* ── Focus today card ───────────────────────────────────────────────────── */

function FocusTodayCard({
  tasks,
  onViewChange,
}: {
  tasks: Task[];
  onViewChange?: () => void;
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
        onClick={onViewChange}
        className="p-5 cursor-pointer border-primary/10 hover:border-primary/25 hover:shadow-md transition-all group bg-gradient-to-br from-surface to-surface/80"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">
                  Focus today
                </span>
                <span className="text-[10px] text-text-muted font-mono">
                  {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-text leading-snug truncate">
                {focusTask.title}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <PriorityBadge priority={focusTask.priority} />
                <span className="text-[11px] text-text-muted flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {focusTask.estimatedTime}
                </span>
                <span className="text-[11px] text-text-muted">
                  Due {formatDeadline(focusTask.deadline)}
                </span>
                <span className="text-[11px] text-text-muted">
                  {focusTask.category}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 mt-1 h-8 w-8 rounded-lg bg-border-light flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ── Main dashboard ─────────────────────────────────────────────────────── */

export function DashboardOverview({ tasks, goals, loading = false }: DashboardOverviewProps) {
  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status !== "completed");
    const completed = tasks.filter((t) => t.status === "completed");
    const overdueCount = pending.filter((t) => isOverdue(t.deadline)).length;
    const highUrgent = pending.filter((t) => ["urgent", "high"].includes(t.priority)).length;
    const rate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
    return { pending: pending.length, completed: completed.length, overdue: overdueCount, urgent: highUrgent, rate };
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
    () => tasks.filter((t) => t.status !== "completed" && isOverdue(t.deadline)).slice(0, 4),
    [tasks]
  );

  const insights = useMemo(
    () =>
      deriveInsights({
        tasks,
        goals,
      }),
    [tasks, goals]
  );

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const isEmpty = tasks.length === 0 && goals.length === 0;

  if (isEmpty) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-border-light flex items-center justify-center mb-5">
          <TrendingUp className="h-7 w-7 text-text-muted" strokeWidth={1.5} />
        </div>
        <h3 className="display-font text-[17px] text-text mb-2">Your dashboard is empty</h3>
        <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
          Start chatting with the AI to create tasks and goals, then come back here for your productivity overview.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="display-font text-[22px] text-text leading-none">Dashboard</h2>
          <p className="text-[13px] text-text-secondary mt-1.5">Your productivity overview</p>
        </motion.div>

        {/* Focus today — full-width */}
        <FocusTodayCard tasks={tasks} />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Zap} label="Tasks pending" value={stats.pending} sub={`${stats.overdue} overdue`} accent="accent" delay={0} />
          <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} sub={stats.overdue > 0 ? "Needs attention" : "All clear"} accent="danger" delay={1} />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} sub={`${stats.rate}% completion rate`} accent="success" delay={2} />
          <StatCard icon={TrendingUp} label="Completion rate" value={`${stats.rate}%`} sub={stats.overdue === 0 && stats.pending > 0 ? "On track" : undefined} accent="info" delay={3} />
        </div>

        {/* Two-column: Insights + Left col, Urgent + Right col */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Insights — 3/5 width */}
          <div className="lg:col-span-3">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-accent" />
                <h3 className="display-font text-[14px] text-text">Insights</h3>
              </div>
              {insights.length > 0 ? (
                <div className="space-y-2.5">
                  {insights.map((insight, i) => (
                    <InsightCard key={insight.title + i} insight={insight} index={i} compact />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="h-7 w-7 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-xs text-text-secondary">No insights right now — you&apos;re all caught up</p>
                </div>
              )}
            </Card>
          </div>

          {/* Urgent tasks — 2/5 width */}
          <div className="lg:col-span-2">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-4 w-4 text-danger" />
                <h3 className="display-font text-[14px] text-text">Urgent</h3>
                {stats.urgent > 0 && (
                  <span className="text-[11px] font-semibold text-danger bg-danger-soft px-2 py-0.5 rounded-full">
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
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-danger-soft/60"
                    >
                      <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-text truncate">{t.title}</p>
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
                <div className="text-center py-6">
                  <CheckCircle2 className="h-7 w-7 text-success mx-auto mb-2" />
                  <p className="text-xs text-text-secondary">No urgent tasks right now</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {urgentTasks.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-border-light/50 hover:bg-border-light transition-colors"
                    >
                      <PriorityBadge priority={t.priority} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-text truncate">{t.title}</p>
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

        {/* Goal progress */}
        {goals.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="display-font text-[14px] text-text">Goals progress</h3>
              </div>
              <span className="text-[11px] text-text-muted">
                {goals.length} goal{goals.length !== 1 ? "s" : ""}
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
                      <p className="text-[13px] font-medium text-text truncate flex-1">{g.title}</p>
                      <span className="text-[11px] text-text-muted tabular-nums ml-3">
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

        {/* Active tasks overview — expandable */}
        {stats.pending > 0 && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-4 w-4 text-primary" />
              <h3 className="display-font text-[14px] text-text">Active tasks</h3>
              <span className="text-[11px] text-text-muted ml-1">({stats.pending})</span>
            </div>
            <div className="space-y-1.5">
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isOverdue(t.deadline) ? "bg-danger-soft/50" : "hover:bg-border-light/60"
                    )}
                  >
                    <PriorityBadge priority={t.priority} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[12px] font-medium truncate", isOverdue(t.deadline) && "text-danger")}>
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
      </div>
    </div>
  );
}

/* ── Client-side insight derivation ────────────────────────────────────── */

function deriveInsights({ tasks, goals }: { tasks: Task[]; goals: GoalType[] }): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);
  const dayAfterTomorrow = new Date(tomorrowStart.getTime() + 86400000);
  const weekFromNow = new Date(todayStart.getTime() + 7 * 86400000);

  const active = tasks.filter((t) => t.status !== "completed");

  // Overdue
  const overdue = active.filter((t) => new Date(t.deadline) < todayStart);
  if (overdue.length > 0) {
    insights.push({
      title: `${overdue.length} task${overdue.length > 1 ? "s" : ""} overdue`,
      description: `${overdue[0].title}${overdue.length > 1 ? ` and ${overdue.length - 1} more` : ""} — past deadline`,
      variant: "danger",
      linkId: overdue[0].id,
    });
  }

  // Due today
  const dueToday = active.filter((t) => {
    const d = new Date(t.deadline);
    return d >= todayStart && d < tomorrowStart;
  });
  if (dueToday.length > 0 && overdue.length === 0) {
    const urgentToday = dueToday.filter((t) => ["urgent", "high"].includes(t.priority));
    const focus = urgentToday[0] || dueToday[0];
    insights.push({
      title: `${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today`,
      description: `Start with "${focus.title}" (${focus.estimatedTime}, ${focus.priority} priority)`,
      variant: "warning",
      linkId: focus.id,
    });
  }

  // Due tomorrow
  if (dueToday.length === 0 && overdue.length === 0) {
    const dueTomorrow = active.filter((t) => {
      const d = new Date(t.deadline);
      return d >= tomorrowStart && d < dayAfterTomorrow;
    });

    if (dueTomorrow.length > 0) {
      insights.push({
        title: `${dueTomorrow.length} task${dueTomorrow.length > 1 ? "s" : ""} due tomorrow`,
        description: `${dueTomorrow[0].title} — get a head start today`,
        variant: "warning",
        linkId: dueTomorrow[0].id,
      });
    }

    // Goals at risk
    const atRisk = goals
      .filter((g) => g.progress < 60)
      .filter((g) => new Date(g.deadline) < weekFromNow);

    if (atRisk.length > 0) {
      insights.push({
        title: `Goal progress at risk`,
        description: `"${atRisk[0].title}" is ${atRisk[0].progress}% complete, due ${formatDeadline(atRisk[0].deadline)}`,
        variant: "info",
        linkId: atRisk[0].id,
      });
    }

    // All clear
    if (insights.length === 0 && active.length === 0) {
      insights.push({
        title: "All clear",
        description: "No pending tasks — a good time to plan something new",
        variant: "success",
      });
    }

    // Productive streak
    if (insights.length === 0 && active.length > 0) {
      const completedToday = tasks.filter((t) => {
        if (t.status !== "completed") return false;
        const created = new Date(t.createdAt);
        return created >= todayStart;
      }).length;
      if (completedToday > 0) {
        insights.push({
          title: `${completedToday} task${completedToday > 1 ? "s" : ""} completed today`,
          description: "Keep the momentum going",
          variant: "success",
        });
      }
    }
  }

  return insights;
}

/* ── Helper: addDays (used by deriveInsights above) ────────────────────── */

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
