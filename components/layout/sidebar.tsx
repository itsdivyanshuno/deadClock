"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckSquare,
  Target,
  Settings2,
  ChevronDown,
  Clock,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PriorityBadge } from "@/components/shared/priority-badge";
import type { Task, Goal } from "@/lib/agent";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type View = "chat" | "tasks" | "goals" | "dashboard" | "settings";

interface SidebarProps {
  view: View;
  onViewChange: (v: View) => void;
  tasks: Task[];
  goals: Goal[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: View;
  label: string;
  icon: typeof MessageSquare;
}

const MAIN_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Target },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "goals", label: "Goals", icon: Target },
];

const FOOTER_NAV: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings2 },
];

/* ------------------------------------------------------------------ */
/*  Components                                                        */
/* ------------------------------------------------------------------ */

function NavButton({
  item,
  active,
  onClick,
  collapsed,
  tooltipLabel,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
  tooltipLabel?: string;
}) {
  const content = (
    <button
      onClick={onClick}
      aria-label={tooltipLabel || item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium",
        "transition-all duration-200",
        active
          ? "bg-primary/10 text-primary"
          : "text-text-muted hover:bg-border-light hover:text-text-secondary"
      )}
    >
      <item.icon
        className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")}
        strokeWidth={active ? 2 : 1.75}
      />
      <span className="truncate">{item.label}</span>
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <p className="text-xs">{tooltipLabel || item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function TaskPillRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-2 py-1 px-3 rounded-lg hover:bg-border-light transition-colors cursor-pointer group">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-text truncate">{task.title}</p>
        <p className="text-[10px] text-text-muted mt-0.5">
          {new Date(task.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
      <PriorityBadge priority={task.priority} />
    </div>
  );
}

function TaskMiniItem({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-2 py-1 px-3 rounded-lg hover:bg-border-light transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-text truncate">{task.title}</p>
        <p className="text-[10px] text-text-muted mt-0.5">
          Due {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      <PriorityBadge priority={task.priority} className="scale-[0.82]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                          */
/* ------------------------------------------------------------------ */

export function Sidebar({
  view,
  onViewChange,
  tasks,
  goals,
  darkMode,
  onToggleDarkMode,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  const [tasksSidebarExpanded, setTasksSidebarExpanded] = useState(true);

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const urgentTasks = pendingTasks.filter((t) => t.priority === "urgent");
  const pendingList = pendingTasks
    .sort((a, b) => {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority] || 2) - (order[b.priority] || 2);
    })
    .slice(0, 5);

  return (
    <aside
      className={cn(
        "h-screen border-r border-border bg-sidebar flex flex-col shrink-0",
        "transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[272px]"
      )}
      aria-label="Main navigation"
    >
      {/* ── Brand header ──────────────────────────────────────────── */}
      <div className={cn("px-4 pt-5 pb-3 flex items-center", collapsed && "justify-center")}>
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-primary via-primary to-text shadow-md"
          )}
        >
          <Clock className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 overflow-hidden"
          >
            <h1 className="display-font text-[15px] text-text leading-none tracking-tight">
              dead<span className="text-accent">Clock</span>
            </h1>
            <p className="text-[11px] text-text-muted mt-0.5 font-medium">
              Last-minute life saver
            </p>
          </motion.div>
        )}
        {/* Collapse toggle */}
        {onToggleCollapse && !collapsed && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto h-7 w-7 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-border-light transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        )}
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-2 top-5 h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm text-text-muted hover:text-text transition-colors z-10"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <div className={cn("px-3 space-y-0.5", collapsed && "px-2")}>
        {MAIN_NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={view === item.id}
            onClick={() => onViewChange(item.id)}
            collapsed={collapsed}
            tooltipLabel={item.label}
          />
        ))}
      </div>

      <div className="mx-4 my-3 border-t border-border" />

      {/* ── Scrollable content ─────────────────────────────────────── */}
      {!collapsed && (
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-4 pb-2">
            {/* Goals overview */}
            <AnimatePresence>
              {goals.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => setGoalsExpanded(!goalsExpanded)}
                    className="flex items-center gap-1.5 w-full mb-2 text-text-muted hover:text-text-secondary transition-colors group"
                    aria-expanded={goalsExpanded}
                  >
                    <Target className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Goals
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 ml-auto transition-transform duration-200",
                        goalsExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  {goalsExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1"
                    >
                      {goals.slice(0, 4).map((g) => {
                        const done = g.milestones.filter((m) => m.done).length;
                        const pct = Math.round((done / g.milestones.length) * 100) || 0;
                        return (
                          <div
                            key={g.id}
                            className="px-3 py-2 rounded-lg hover:bg-border-light transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[12px] font-medium text-text truncate flex-1">
                                {g.title}
                              </p>
                              <span className="text-[10px] text-text-muted tabular-nums ml-2">
                                {pct}%
                              </span>
                            </div>
                            <div className="h-1 rounded-full bg-border-light overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            {/* Tasks overview */}
            <AnimatePresence>
              {pendingList.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => setTasksSidebarExpanded(!tasksSidebarExpanded)}
                    className="flex items-center gap-1.5 w-full mb-2 text-text-muted hover:text-text-secondary transition-colors group"
                    aria-expanded={tasksSidebarExpanded}
                  >
                    <CheckSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Tasks
                    </span>
                    <span className="text-[10px] text-text-muted font-normal ml-1">
                      ({pendingList.length})
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 ml-auto transition-transform duration-200",
                        tasksSidebarExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  {tasksSidebarExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-0.5"
                    >
                      {pendingList.map((t) => (
                        <TaskMiniItem key={t.id} task={t} />
                      ))}
                    </motion.div>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            {/* Urgent banner */}
            {urgentTasks.length > 0 && (
              <div className="px-3 py-3 rounded-xl bg-danger-soft border border-danger/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-danger" />
                  <span className="text-[11px] font-semibold text-danger uppercase tracking-wider">
                    Needs attention
                  </span>
                </div>
                <div className="space-y-0.5">
                  {urgentTasks.slice(0, 2).map((t) => (
                    <TaskMiniItem key={t.id} task={t} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Collapsed nav icons */}
      {collapsed && (
        <div className="flex flex-col items-center gap-1 py-3">
          {MAIN_NAV.slice(0, 3).map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={view === item.id}
              onClick={() => onViewChange(item.id)}
              collapsed
              tooltipLabel={item.label}
            />
          ))}
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="border-t border-border">
        {!collapsed && (
          <div className="px-4 py-2">
            <p className="text-[10px] text-text-muted flex items-center gap-1.5 px-1">
              <Clock className="h-3 w-3" />
              Powered by Google Gemini
            </p>
          </div>
        )}
        <button
          onClick={onToggleDarkMode}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-2.5 hover:bg-border-light transition-colors text-left",
            collapsed && "justify-center"
          )}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
              DU
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-text truncate">Divyansh</p>
              <p className="text-[10px] text-text-muted">Pro Member</p>
            </div>
          )}
          <span className="text-[11px]">{darkMode ? "☀️" : "🌙"}</span>
        </button>
      </div>
    </aside>
  );
}
