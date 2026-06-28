"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Calendar, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { cn, tier2Hover } from "@/lib/utils";
import type { Goal } from "@/lib/agent";
import { GoalCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface GoalsViewProps {
  goals: Goal[];
  onToggleMilestone: (goalId: string, milestoneIndex: number) => void;
  loading?: boolean;
}

function GoalCard({
  goal,
  expanded,
  onToggleExpand,
  onToggleMilestone,
}: {
  goal: Goal;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleMilestone: (i: number) => void;
}) {
  const done = goal.milestones.filter((m) => m.done).length;
  const total = goal.milestones.length;
  const pct = Math.round((done / total) * 100) || 0;
  const isComplete = pct === 100;

  return (
    <motion.div
      layout
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.995 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md hover:shadow-border/25 hover:border-border-strong hover:border-border-strong transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary-soft flex items-center justify-center mt-0.5 shrink-0">
              <Target className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-text leading-snug">{goal.title}</h3>
              {goal.description && (
                <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">{goal.description}</p>
              )}
            </div>
          </div>
          <Badge
            className={cn(
              "shrink-0 font-mono tabular-nums text-[11px]",
              isComplete ? "bg-success text-white" : "bg-border-light text-text-secondary"
            )}
          >
            {pct}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-muted">
              {done} of {total} milestones
            </span>
            <Calendar className="h-3 w-3 text-text-muted" />
          </div>
          <Progress value={pct} className="h-1.5" />
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] text-text-muted">
              Due {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-[10px] text-text-muted">
              {isComplete ? "🎉 Complete!" : `${total - done} remaining`}
            </span>
          </div>
        </div>

        <button
          onClick={onToggleExpand}
          className="flex items-center gap-1 mt-4 text-xs font-medium text-primary hover:text-accent transition-colors cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Hide milestones
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> View milestones
            </>
          )}
          <span className="text-text-muted text-[10px] ml-1">({total})</span>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="p-5 space-y-1">
              {goal.milestones.map((m, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onToggleMilestone(i)}
                  className="flex items-start gap-3 w-full py-2.5 group cursor-pointer"
                >
                  {m.done ? (
                    <CheckCircle2 className="h-[18px] w-[18px] text-success shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-[18px] w-[18px] text-text-muted group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                  )}
                  <span
                    className={cn(
                      "text-[13px] leading-relaxed transition-all",
                      m.done ? "text-text-muted line-through" : "text-text"
                    )}
                  >
                    {m.title}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function GoalsView({ goals, onToggleMilestone, loading = false }: GoalsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const sorted = useMemo(
    () =>
      [...goals].sort((a, b) => {
        const ap = Math.round((a.milestones.filter((m) => m.done).length / a.milestones.length) * 100);
        const bp = Math.round((b.milestones.filter((m) => m.done).length / b.milestones.length) * 100);
        return ap - bp;
      }),
    [goals]
  );

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 lg:px-8 py-5 border-b border-border bg-surface/70 backdrop-blur-md shrink-0">
        <h2 className="display-font text-xl text-text leading-none">Your Goals</h2>
        <p className="text-[13px] text-text-secondary mt-1">Long-term objectives, one milestone at a time</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {loading ? (
          <GoalCardSkeleton />
        ) : goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals set"
            description="Tell the AI about a long-term goal you want to hit, and it'll break it down into milestones."
          />
        ) : (
          <div className="space-y-4 max-w-2xl">
            <AnimatePresence mode="popLayout">
              {sorted.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  expanded={expandedId === g.id}
                  onToggleExpand={() => handleToggleExpand(g.id)}
                  onToggleMilestone={(i) => onToggleMilestone(g.id, i)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
