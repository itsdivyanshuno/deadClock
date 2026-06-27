"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sparkles, Clock } from "lucide-react";
import { View, Sidebar } from "@/components/layout/sidebar";
import { SidebarSkeleton } from "@/components/shared/loading-skeleton";

interface AppShellProps {
  view: View;
  onViewChange: (v: View) => void;
  tasks: unknown[];
  goals: unknown[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  loading: boolean;
  children: React.ReactNode;
}

const VIEW_TITLES: Record<View, string> = {
  chat: "deadClock",
  tasks: "Tasks",
  goals: "Goals",
  dashboard: "Dashboard",
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
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              onViewChange={(v) => {
                onViewChange(v);
                setSidebarOpen(false);
              }}
              tasks={tasks as any}
              goals={goals as any}
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
            tasks={tasks as any}
            goals={goals as any}
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        )}
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar - mobile only */}
        <header className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-surface shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 rounded-lg flex items-center justify-center border border-border hover:bg-border-light transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-text flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="display-font text-sm">dead<span className="text-accent">Clock</span></span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] font-medium text-accent">AI</span>
          </div>
        </header>

        {/* Page header */}
        <header className="hidden lg:flex items-center justify-between h-14 px-8 border-b border-border bg-surface/70 backdrop-blur-md shrink-0">
          <h2 className="display-font text-lg text-text">{VIEW_TITLES[view]}</h2>
          <div className="flex items-center gap-3" />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-texture">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
