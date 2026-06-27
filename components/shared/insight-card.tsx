"use client";

import { motion } from "framer-motion";
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/* ── Types ──────────────────────────────────────────────────────────────── */

/**
 * A proactive insight surfaced by the AI agent.
 *
 * `variant` determines the visual treatment:
 * - "danger"  → overdue/at-risk items
 * - "warning" → upcoming deadlines (within 24h)
 * - "info"    → workload analysis, suggestions
 * - "success" → positive progress signals
 */
export interface Insight {
  /** Display title */
  title: string;
  /** One-line description or actionable hint */
  description: string;
  /** Visual severity/type */
  variant: "danger" | "warning" | "info" | "success";
  /** Optional linked task/goal ID for click-through */
  linkId?: string;
}

/* ── Config ─────────────────────────────────────────────────────────────── */

const VARIANT_CONFIG: Record<
  Insight["variant"],
  { icon: typeof Flame; bg: string; iconBg: string; iconText: string; border: string }
> = {
  danger: {
    icon: AlertTriangle,
    bg: "bg-danger-soft",
    iconBg: "bg-danger/10",
    iconText: "text-danger",
    border: "border-danger/10",
  },
  warning: {
    icon: Flame,
    bg: "bg-warning-soft",
    iconBg: "bg-warning/10",
    iconText: "text-warning",
    border: "border-warning/10",
  },
  info: {
    icon: Info,
    bg: "bg-info-soft",
    iconBg: "bg-info/10",
    iconText: "text-info",
    border: "border-info/10",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-success-soft",
    iconBg: "bg-success/10",
    iconText: "text-success",
    border: "border-success/10",
  },
};

/* ── Component ──────────────────────────────────────────────────────────── */

interface InsightCardProps {
  insight: Insight;
  index?: number;
  onClick?: () => void;
  compact?: boolean;
}

export function InsightCard({ insight, index = 0, onClick, compact = false }: InsightCardProps) {
  const config = VARIANT_CONFIG[insight.variant];
  const Icon = config.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.25 }}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer",
          "transition-all duration-200 hover:shadow-sm",
          config.bg,
          config.border
        )}
      >
        <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", config.iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", config.iconText)} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-text truncate">{insight.title}</p>
        </div>
        <ArrowUpRight className="h-3 w-3 text-text-muted shrink-0" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3.5 px-4 py-3.5 rounded-xl border cursor-pointer",
        "transition-all duration-200 hover:shadow-sm group",
        config.bg,
        config.border
      )}
    >
      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", config.iconBg)}>
        <Icon className={cn("h-[18px] w-[18px]", config.iconText)} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-text leading-snug">{insight.title}</p>
        <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">{insight.description}</p>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-text-muted group-hover:text-text transition-colors shrink-0 mt-1" />
    </motion.div>
  );
}

/* ── Deriving insights from data ───────────────────────────────────────── */

interface DerivedInsightOptions {
  tasks: Array<{
    status: string;
    priority: string;
    deadline: string;
    title: string;
    id: string;
    estimatedTime: string;
  }>;
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    deadline: string;
    milestones: Array<{ done: boolean }>;
  }>;
}

/**
 * Derives proactive insights purely from local task/goal state.
 *
 * This runs on the client — no LLM call needed — so insights are instant.
 */
export function deriveInsights({ tasks, goals }: DerivedInsightOptions): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);
  const dayAfterTomorrow = new Date(tomorrowStart.getTime() + 86400000);

  const activeTasks = tasks.filter((t) => t.status !== "completed" && t.status !== "deleted");

  // Overdue
  const overdue = activeTasks.filter((t) => new Date(t.deadline) < todayStart);
  if (overdue.length > 0) {
    insights.push({
      title: `${overdue.length} task${overdue.length > 1 ? "s" : ""} overdue`,
      description: `${overdue[0].title}${overdue.length > 1 ? ` and ${overdue.length - 1} more` : ""} — past their deadline`,
      variant: "danger",
      linkId: overdue[0].id,
    });
  }

  // Due today
  const dueToday = activeTasks.filter(
    (t) => {
      const d = new Date(t.deadline);
      return d >= todayStart && d < tomorrowStart;
    }
  );
  if (dueToday.length > 0 && overdue.length === 0) {
    const urgentToday = dueToday.filter((t) => t.priority === "urgent" || t.priority === "high");
    const focusTask = urgentToday[0] || dueToday[0];
    insights.push({
      title: `${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today`,
      description: `Focus: "${focusTask.title}" (${focusTask.estimatedTime}, ${focusTask.priority} priority)`,
      variant: "warning",
      linkId: focusTask.id,
    });
  }

  // Overdue guard
  if (dueToday.length === 0 && overdue.length === 0) {
    // Due tomorrow
    const dueTomorrow = activeTasks.filter(
      (t) => {
        const d = new Date(t.deadline);
        return d >= tomorrowStart && d < dayAfterTomorrow;
      }
    );
    if (dueTomorrow.length > 0) {
      insights.push({
        title: `${dueTomorrow.length} task${dueTomorrow.length > 1 ? "s" : ""} due tomorrow`,
        description: `${dueTomorrow[0].title} — get a head start now`,
        variant: "warning",
        linkId: dueTomorrow[0].id,
      });
    }

    // Goals at risk
    const atRiskGoals = goals
      .filter((g) => g.progress < 50)
      .filter((g) => new Date(g.deadline) < addDays(now, 7));
    if (atRiskGoals.length > 0) {
      insights.push({
        title: `Goal progress at risk`,
        description: `"${atRiskGoals[0].title}" is ${atRiskGoals[0].progress}% done due soon`,
        variant: "info",
        linkId: atRiskGoals[0].id,
      });
    }

    // All clear
    if (insights.length === 0 && activeTasks.length === 0) {
      insights.push({
        title: "All clear",
        description: "No pending tasks — time to plan something new",
        variant: "success",
      });
    }
  }

  return insights;
}

/* ── Date helpers used by insights ─────────────────────────────────────── */

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
