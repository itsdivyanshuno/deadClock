"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, Goal } from "@/lib/agent";
type Message = { role: "user" | "assistant"; content: string };
import { AppShell } from "@/components/layout/app-shell";
import { ChatView } from "@/components/chat/chat-view";
import { TasksView } from "@/components/tasks/tasks-view";
import { GoalsView } from "@/components/goals/goals-view";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AnalyticsView } from "@/components/views/analytics-view";
import { HeatmapView } from "@/components/views/heatmap-view";
import { SettingsView } from "@/components/settings/settings-view";
import { ReflectionView } from "@/components/views/reflection-view";
import { CommandPalette, useCommandPalette } from "@/components/shared/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";

type View = "chat" | "tasks" | "goals" | "dashboard" | "analytics" | "heatmap" | "reflection" | "settings";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolActive, setToolActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("chat");
  const [darkMode, setDarkMode] = useState(false);
  const [streakData, setStreakData] = useState<{
    current: number;
    longest: number;
    totalCompletions: number;
    achievements: Array<{ id?: string; title: string; icon?: string }>;
  } | null>(null);
  const [dailyLogs, setDailyLogs] = useState<
    Array<{ date: string; tasksCompleted: number; focusMinutes: number }>
  >([]);
const [heatmapData, setHeatmapData] = useState<
Array<{ date: string; tasksCompleted: number; focusMinutes: number }>
>([]);

  const commandPalette = useCommandPalette(setView);

  /* Hydrate dark mode from localStorage before paint */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("deadclock-dark");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        setDarkMode(parsed);
        if (parsed) document.documentElement.classList.add("dark");
      }
    } catch { /* ignore */ }
  }, []);

  /* Apply + persist dark mode */
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("deadclock-dark", JSON.stringify(darkMode)); } catch { /* ignore */ }
  }, [darkMode]);

  /* ── Hydrate from DB on first mount ─────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          if (data.tasks) setTasks(data.tasks);
          if (data.goals) setGoals(data.goals);
          if (data.toolCalled) setToolActive(true);
          if (data.messages && data.messages.length > 0) setMessages(data.messages);
        }
        const analyticsRes = await fetch("/api/analytics");
        if (analyticsRes.ok) {
          const snapshot = await analyticsRes.json();
          setStreakData({
            current: snapshot.streaks.current ?? 0,
            longest: snapshot.streaks.longest ?? 0,
            totalCompletions: snapshot.streaks.totalCompletions ?? 0,
            achievements: (snapshot.achievements ?? []).map(
              (a: Record<string, unknown>) => ({
                id: (a.id as string | undefined) ?? undefined,
                title: a.title as string,
                icon: (a.icon as string | undefined) ?? undefined,
              })
            ),
          });
          setDailyLogs(snapshot.dailyLogs ?? []);
          setHeatmapData(
    (snapshot.heatmap ?? []).map((h: { date: string; count: number }) => ({
      date: h.date,
      tasksCompleted: h.count,
      focusMinutes: 0,
    }))
  );
        }
      } catch { /* silent */ }
      setHydrated(true);
    })();
  }, []);

  /* ── Chat handlers ─────────────────────────────────────────── */
  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((p) => [...p, { role: "assistant", content: data.response }]);
        if (data.tasks) setTasks(data.tasks);
        if (data.goals) setGoals(data.goals);
        if (data.toolCalled) setToolActive(true);
      } else {
        setMessages((p) => [
          ...p,
          {
            role: "assistant",
            content: "Something went wrong. Check if your API key is set.",
          },
        ]);
      }
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Error connecting to AI. Please try again." },
      ]);
    }
    setLoading(false);
  }, [input, loading]);

  const handleQuickStart = useCallback((msg: string) => {
    setInput(msg);
    setView("chat");
  }, []);

  /* ── Task CRUD via natural language API ─────────────────────── */
  const handleToggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      const completing = task?.status !== "completed";
  setTasks((p) =>
    p.map((t) =>
      t.id === id ? { ...t, status: completing ? "completed" : "pending" } : t
    )
  );
      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: completing ? `complete task ${id}` : `reopen task ${id}` }),
        });
        if (completing && task) {
          fetch("/api/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task }),
          }).catch(() => {});
        }
      } catch { /* best-effort */ }
    },
    [tasks]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      setTasks((p) => p.filter((t) => t.id !== id));
      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `delete task ${id}` }),
        });
      } catch { /* best-effort */ }
    },
    []
  );

  const handleToggleMilestone = useCallback(
    async (goalId: string, idx: number) => {
      setGoals((p) =>
        p.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: g.milestones.map((m, i) =>
                  i === idx ? { ...m, done: !m.done } : m
                ),
              }
            : g
        )
      );
      try {
        const goal = goals.find((g) => g.id === goalId);
        const milestone = goal?.milestones[idx];
        if (milestone) {
          const cmd = milestone.done
            ? `reopen milestone ${idx} on goal ${goalId}`
            : `complete milestone ${idx} on goal ${goalId}`;
          await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: cmd }),
          });
        }
      } catch { /* best-effort */ }
    },
    [goals]
  );

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <TooltipProvider delay={300}>
      <CommandPalette
        open={commandPalette.open}
        onOpenChange={commandPalette.setOpen}
        onNavigate={setView}
      />
      <AppShell
        view={view}
        onViewChange={setView}
        tasks={tasks}
        goals={goals}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        loading={!hydrated}
        streakData={streakData}
      >
        {view === "chat" && (
          <ChatView
            messages={messages}
            input={input}
            loading={loading}
            toolActive={toolActive}
            onInputChange={setInput}
            onSend={handleSend}
            onQuickStart={handleQuickStart}
          />
        )}
        {view === "tasks" && (
          <TasksView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            loading={!hydrated}
          />
        )}
        {view === "goals" && (
          <GoalsView
            goals={goals}
            onToggleMilestone={handleToggleMilestone}
            loading={!hydrated}
          />
        )}
        {view === "dashboard" && (
          <DashboardOverview
            tasks={tasks}
            goals={goals}
            streakData={streakData}
            loading={!hydrated}
          />
        )}
        {view === "analytics" && (
          <AnalyticsView
            dailyLogs={dailyLogs}
            streakData={streakData}
            tasks={tasks}
          />
        )}
        {view === "heatmap" && (
          <HeatmapView dailyLogs={heatmapData} />
        )}
        {view === "reflection" && (
          <ReflectionView
            onSubmit={async ({
              wentWell,
              toImprove,
              tomorrowFocus,
              mood,
            }: {
              wentWell: string;
              toImprove: string;
              tomorrowFocus: string;
              mood: string;
            }) => {
              try {
                await fetch("/api/reflection", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ wentWell, toImprove, tomorrowFocus, mood }),
                });
              } catch { /* best-effort */ }
            }}
            loading={false}
          />
        )}
        {view === "settings" && (
          <SettingsView
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
          />
        )}
      </AppShell>
    </TooltipProvider>
  );
}
