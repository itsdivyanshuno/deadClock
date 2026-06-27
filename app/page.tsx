"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, Goal } from "@/lib/agent";
type Message = { role: "user" | "assistant"; content: string };
import { AppShell } from "@/components/layout/app-shell";
import { ChatView } from "@/components/chat/chat-view";
import { TasksView } from "@/components/tasks/tasks-view";
import { GoalsView } from "@/components/goals/goals-view";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { TooltipProvider } from "@/components/ui/tooltip";

type View = "chat" | "tasks" | "goals" | "dashboard" | "settings";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("chat");
  const [darkMode, setDarkMode] = useState(false);

  /* ── Hydrate from DB on first mount ─────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          if (data.tasks) setTasks(data.tasks);
          if (data.goals) setGoals(data.goals);
          if (data.messages && data.messages.length > 0) setMessages(data.messages);
        }
      } catch { /* silent */ }
      setHydrated(true);
    })();
  }, []);

  /* ── Persist dark mode preference ───────────────────────────── */
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

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
      } else {
        setMessages((p) => [...p, {
          role: "assistant",
          content: "Something went wrong. Check if your API key is set.",
        }]);
      }
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Error connecting to AI. Please try again." }]);
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
      <AppShell
        view={view}
        onViewChange={setView}
        tasks={tasks}
        goals={goals}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        loading={!hydrated}
      >
        {view === "chat" && (
          <ChatView
            messages={messages}
            input={input}
            loading={loading}
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
          <DashboardOverview tasks={tasks} goals={goals} loading={!hydrated} />
        )}
      </AppShell>
    </TooltipProvider>
  );
}
