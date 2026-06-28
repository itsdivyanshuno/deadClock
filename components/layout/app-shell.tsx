"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sparkles, Flame, Zap, PanelLeftOpen } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { type View } from "@/lib/types";
import { SidebarSkeleton } from "@/components/shared/loading-skeleton";
import { Progress } from "@/components/ui/progress";

interface AppShellProps {
  view: View;
  onViewChange: (v: View) => void;
  tasks: unknown[];
  goals: unknown[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  loading: boolean;
  streakData?:
    | {
        current: number;
        longest: number;
        totalCompletions: number;
        achievements: Array<{ id?: string; title: string; icon?: string }>;
      }
    | null;
  children: React.ReactNode;
}

const VIEW_TITLES: Record<View, string> = {
  chat: "Chat",
  tasks: "Tasks",
  goals: "Goals",
  dashboard: "Dashboard",
  analytics: "Analytics",
  heatmap: "Activity",
  reflection: "Reflection",
  settings: "Settings",
};

export function AppShell({
  view,
  onViewChange,
  tasks,
  goals,
  darkMode,
  onToggleDarkMode,
  loading,
  streakData,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Derive compact metrics from prop data
  const pendingCount = (tasks as Array<{ status: string }>).filter(
    (t) => t.status !== "completed"
  ).length;
  const completedCount = (tasks as Array<{ status: string }>).filter(
    (t) => t.status === "completed"
  ).length;
  const total = tasks.length || 1;
  const completionRate = Math.round((completedCount / total) * 100);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <Sidebar
              view={view}
              onViewChange={(v: View) => {
                onViewChange(v);
                setSidebarOpen(false);
              }}
              darkMode={darkMode}
              onToggleDarkMode={onToggleDarkMode}
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {loading ? (
          <SidebarSkeleton />
        ) : (
          <Sidebar
            view={view}
            onViewChange={onViewChange}
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((c: boolean) => !c)}
          />
        )}
      </div>

      {/* Main column */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="h-12 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-surface/70 backdrop-blur-md shrink-0">
          {/* Left: mobile menu + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center border border-border hover:bg-border-light transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h2 className="display-font text-sm text-text">{VIEW_TITLES[view]}</h2>
          </div>

          {/* Right: compact metrics */}
          <div className="flex items-center gap-4">
            {/* Streak pulse */}
            {streakData && (
              <div className="flex items-center gap-1">
                <Flame
                  className={`h-4 w-4 ${
                    streakData.current >= 7
                      ? "text-warning"
                      : streakData.current >= 3
                        ? "text-accent"
                        : "text-text-muted"
                  }`}
                  strokeWidth={2}
                />
                <span className="text-xs font-bold tabular-nums text-text">
                  {streakData.current}d
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div className="flex items-center gap-2 min-w-[100px]">
              <Zap className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={2} />
              <Progress value={completionRate} className="h-1.5 flex-1" />
              <span className="text-[10px] font-bold tabular-nums text-text-muted w-8 text-right">
                {completionRate}%
              </span>
            </div>

            {/* AI badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent/10 text-accent">
              <Sparkles className="h-3 w-3" />
              <span className="text-[10px] font-semibold">AI</span>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => { setSidebarCollapsed((c: boolean) => !c); }}
              className="flex h-7 w-7 rounded-md items-center justify-center text-text-muted hover:text-text hover:bg-border-light transition-colors"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeftOpen className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-texture">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10, scale: 0.998 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.998 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
