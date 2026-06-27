"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Trash2, ListChecks, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/agent";
import { PriorityBadge, CategoryIcon } from "@/components/shared/priority-badge";
import { TaskCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Filter = "all" | "pending" | "completed";

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  loading?: boolean;
}

const ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

function taskSort(a: Task, b: Task) {
  if (a.status === "completed" && b.status !== "completed") return 1;
  if (a.status !== "completed" && b.status === "completed") return -1;
  return (ORDER[a.priority] ?? 2) - (ORDER[b.priority] ?? 2);
}

function isOverdue(deadline: string) {
  return new Date(deadline) < new Date();
}

function SingleTask({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const overdue = isOverdue(task.deadline) && task.status !== "completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        "group relative rounded-xl border p-4 transition-all duration-200",
        task.status === "completed"
          ? "bg-surface/40 border-border/50 opacity-60"
          : "bg-surface border-border hover:border-border-strong hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={onToggle}
          aria-label={task.status === "completed" ? "Reopen task" : "Complete task"}
          title={task.status === "completed" ? "Reopen" : "Complete"}
          className={cn(
            "mt-0.5 shrink-0 h-[22px] w-[22px] rounded-md border-2 flex items-center justify-center transition-all duration-200",
            task.status === "completed"
              ? "bg-gradient-to-br from-success to-emerald-500 border-transparent"
              : "border-border hover:border-primary hover:bg-primary-soft"
          )}
        >
          {task.status === "completed" && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white text-[11px]">
              ✓
            </motion.span>
          )}
        </button>

        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <p className={cn("text-[13px] leading-snug", task.status === "completed" ? "text-text-muted line-through" : "text-text font-medium")}>
              <span className="mr-1">{CategoryIcon({ category: task.category })}</span>
              {task.title}
            </p>
            <button
              onClick={onDelete}
              aria-label="Delete task"
              title="Delete"
              className="opacity-0 group-hover:opacity-100 shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-soft transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <span className={cn("inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full", overdue ? "bg-danger-soft text-danger font-medium" : "bg-border-light text-text-muted")}>
              <Calendar className="h-3 w-3" />
              {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            {task.estimatedTime && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-border-light text-text-muted">
                <Clock className="h-3 w-3" />
                {task.estimatedTime}
              </span>
            )}
          </div>

          {task.subtasks.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {task.subtasks.map((sub, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/50 shrink-0" />
                  {sub}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TasksView({ tasks, onToggleTask, onDeleteTask, loading = false }: TasksViewProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => tasks.filter((t) => {
      if (filter === "pending") return t.status !== "completed";
      if (filter === "completed") return t.status === "completed";
      return true;
    }),
    [tasks, filter]
  );

  const sorted = useMemo(() => [...filtered].sort(taskSort), [filtered]);

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 lg:px-8 py-5 border-b border-border bg-surface/70 backdrop-blur-md shrink-0">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="display-font text-xl text-text leading-none">Your Tasks</h2>
            <p className="text-[13px] text-text-secondary mt-1">
              {pendingCount} pending · {completedCount} completed
            </p>
          </div>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs h-7 px-3">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs h-7 px-3">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs h-7 px-3">Done ({completedCount})</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {loading ? (
          <TaskCardSkeleton />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks"
            description={
              filter === "completed"
                ? "No completed tasks yet. Finish one to see it here."
                : filter === "pending"
                ? "No pending tasks. You're all caught up!"
                : "Chat with the AI to create your first task."
            }
          />
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {sorted.map((t) => (
                <SingleTask key={t.id} task={t} onToggle={() => onToggleTask(t.id)} onDelete={() => onDeleteTask(t.id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
