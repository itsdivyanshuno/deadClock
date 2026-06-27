"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, CheckCircle2, AlertTriangle, TrendingUp, Clock, Target, Zap } from "lucide-react";
import type { Task, Goal } from "@/lib/agent";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardOverviewProps {
  tasks: Task[];
  goals: Goal[];
  loading?: boolean;
}

const ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

function isOverdue(deadline: string) {
  return new Date(deadline) < new Date();
}

function sortTasks(a: Task, b: Task) {
  if (a.status === "completed" && b.status !== "completed") return 1;
  if (a.status !== "completed" && b.status === "completed") return -1;
  return (ORDER[a.priority] ?? 2) - (ORDER[b.priority] ?? 2);
}

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: typeof Flame;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "accent" | "danger" | "success" | "info";
}) {
  const accentBg: Record<string, string> = {
    accent: "bg-accent-soft text-accent",
    danger: "bg-danger-soft text-danger",
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
  };

  return (
    <Card className="p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={[
          "h-9 w-9 rounded-lg flex items-center justify-center",
          accent ? accentBg[accent] : "bg-border-light text-text-secondary",
        ].join(" ")}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <span className="text-2xl display-font text-text leading-none">{value}</span>
      </div>
      <p className="text-[12px] font-medium text-text-secondary">{label}</p>
      {sub && <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>}
    </Card>
  );
}

export function DashboardOverview({ tasks, goals, loading = false }: DashboardOverviewProps) {
  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status !== "completed");
    const completed = tasks.filter((t) => t.status === "completed");
    const overdue = pending.filter((t) => isOverdue(t.deadline));
    const urgent = pending.filter((t) => ["urgent", "high"].includes(t.priority));
    const rate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
    return { pending: pending.length, completed: completed.length, overdue: overdue.length, urgent: urgent.length, rate };
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

  const topGoal = useMemo(() => {
    if (goals.length === 0) return null;
    return [...goals].sort((a, b) => {
      const ap = Math.round((a.milestones.filter((m) => m.done).length / Math.max(a.milestones.length, 1)) * 100);
      const bp = Math.round((b.milestones.filter((m) => m.done).length / Math.max(b.milestones.length, 1)) * 100);
      return ap - bp;
    })[0];
  }, [goals]);

  const statCards = [
    { icon: Zap, label: "Tasks pending", value: stats.pending, sub: `${stats.overdue} overdue`, accent: "accent" as const },
    { icon: AlertTriangle, label: "Overdue tasks", value: stats.overdue, sub: stats.overdue > 0 ? "Needs attention" : "All clear", accent: "danger" as const },
    { icon: CheckCircle2, label: "Completed", value: stats.completed, sub: `${stats.rate}% completion rate`, accent: "success" as const },
    { icon: TrendingUp, label: "Completion rate", value: `${stats.rate}%`, sub: stats.overdue === 0 && stats.pending > 0 ? "On track" : undefined, accent: "info" as const },
  ];

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-40 mb-1" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (tasks.length === 0 && goals.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-border-light flex items-center justify-center mb-5">
          <TrendingUp className="h-7 w-7 text-text-muted" strokeWidth={1.5} />
        </div>
        <h3 className="display-font text-[15px] text-text mb-1.5">Your dashboard is empty</h3>
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
        <div>
          <h2 className="display-font text-xl text-text leading-none">Dashboard</h2>
          <p className="text-[13px] text-text-secondary mt-1">Your productivity overview</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Urgent & overdue tasks */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-danger" />
                <h3 className="display-font text-sm text-text">Urgent tasks</h3>
              </div>
              {stats.urgent > 0 && (
                <span className="text-[11px] font-semibold text-danger bg-danger-soft px-2 py-0.5 rounded-full">
                  {stats.urgent} active
                </span>
              )}
            </div>

            {urgentTasks.length === 0 && overdueTasks.length > 0 ? (
              <div className="space-y-2">
                {overdueTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-danger-soft/60">
                    <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-text truncate">{t.title}</p>
                      <p className="text-[10px] text-text-muted">
                        Due {new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-danger bg-danger-soft px-2 py-0.5 rounded-full shrink-0">
                      OVERDUE
                    </span>
                  </div>
                ))}
              </div>
            ) : urgentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-xs text-text-secondary">No urgent tasks right now</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {urgentTasks.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-border-light/50"
                    >
                      <PriorityBadge priority={t.priority} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-text truncate">{t.title}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Due {new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      {isOverdue(t.deadline) && (
                        <span className="text-[10px] font-semibold text-danger bg-danger-soft px-2 py-0.5 rounded-full shrink-0">
                          OVERDUE
                        </span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>

          {/* Goals progress */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="display-font text-sm text-text">Goals progress</h3>
              </div>
              <span className="text-[11px] text-text-muted">
                {goals.length} goal{goals.length !== 1 ? "s" : ""}
              </span>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-8 w-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs text-text-secondary">No goals yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 4).map((g) => {
                  const done = g.milestones.filter((m) => m.done).length;
                  const pct = Math.round((done / g.milestones.length) * 100) || 0;
                  return (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-medium text-text truncate flex-1">{g.title}</p>
                        <span className="text-[10px] text-text-muted tabular-nums ml-2">{done}/{g.milestones.length}</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}

            {topGoal && (
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                  <Clock className="h-3 w-3" />
                  Next deadline: <span className="font-medium text-text-secondary">{new Date(topGoal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Active tasks table */}
        {stats.pending > 0 && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="display-font text-sm text-text">All active tasks</h3>
              <span className="text-[11px] text-text-muted ml-1">({stats.pending})</span>
            </div>
            <div className="space-y-1.5">
              {tasks
                .filter((t) => t.status !== "completed")
                .sort(sortTasks)
                .slice(0, 8)
                .map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-border-light/50 transition-colors"
                  >
                    <PriorityBadge priority={t.priority} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-text truncate">{t.title}</p>
                      <p className="text-[10px] text-text-muted">
                        Due {new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    {isOverdue(t.deadline) && (
                      <span className="text-[10px] font-semibold text-danger shrink-0">Overdue</span>
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
