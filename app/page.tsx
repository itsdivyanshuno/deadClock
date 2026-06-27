"use client";

import { useState, useRef, useEffect } from "react";
import type { Task, Goal } from "@/lib/agent";

/* ─── Types ─── */
type Message = {
  role: "user" | "assistant";
  content: string;
};
type View = "chat" | "tasks" | "goals";

/* ─── Constants ─── */
const PRIORITY_CONFIG: Record<string, { pill: string; dot: string }> = {
  urgent: {
    pill: "pill-urgent",
    dot: "bg-danger shadow-[0_0_8px_rgba(248,113,113,0.5)]",
  },
  high: {
    pill: "pill-high",
    dot: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]",
  },
  medium: {
    pill: "pill-medium",
    dot: "bg-warning shadow-[0_0_6px_rgba(251,191,36,0.3)]",
  },
  low: {
    pill: "pill-low",
    dot: "bg-accent shadow-[0_0_6px_rgba(6,182,212,0.3)]",
  },
};

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string }> = {
  Work:    { emoji: "💼", color: "text-blue-400" },
  Study:   { emoji: "📚", color: "text-purple-400" },
  Personal:{ emoji: "👤", color: "text-pink-400" },
  Health:  { emoji: "❤️", color: "text-red-400" },
  Finance: { emoji: "💰", color: "text-emerald-400" },
  General: { emoji: "📋", color: "text-gray-400" },
};

const QUICK_STARTERS = [
  { emoji: "📚", label: "Study plan",  msg: "I have my midterm exams next week. Help me create a study plan." },
  { emoji: "💼", label: "Work tasks",  msg: "I need to prepare a project presentation by Friday and send 3 reports." },
  { emoji: "🎯", label: "Set a goal",  msg: "I want to build a fitness habit — help me set milestones." },
  { emoji: "📋", label: "Prioritize",  msg: "I have 5 tasks due today, help me figure out what to do first." },
];

/* ─── Header greeting ─── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}


/* ─── Component ─── */
export default function Home() {
  /* state */
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [goals, setGoals]               = useState<Goal[]>([]);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [view, setView]                 = useState<View>("chat");
  const [taskFilter, setTaskFilter]     = useState<"all" | "pending" | "completed">("all");
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [greeting]                      = useState(getGreeting());
  const [intensity, setIntensity]       = useState(100);

  /* refs */
  const chatEndRef    = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);

  /* scroll-to-bottom on new messages */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* random intensity — client-only to avoid hydration mismatch */
  useEffect(() => {
    setIntensity(95 + Math.floor(Math.random() * 5));
  }, []);

  /* auto-focus input on chat view */
  useEffect(() => {
    if (view === "chat") inputRef.current?.focus();
  }, [view]);

  /* ─── Send message ─── */
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        setTasks(data.tasks || []);
        setGoals(data.goals || []);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Something went wrong. Check that your API key is configured and try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to the AI. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ─── Task actions ─── */
  async function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: id.includes("completed") ? `complete todo id ${id}` : `reopen task ${id}`,
        }),
      });
    } catch { /* non-critical */ }
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  /* ─── Derived data ─── */
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "pending")    return t.status !== "completed";
    if (taskFilter === "completed")  return t.status === "completed";
    return true;
  });

  const pendingCount    = tasks.filter((t) => t.status !== "completed").length;
  const completedCount  = tasks.filter((t) => t.status === "completed").length;

  /* ─── Sidebar nav item ─── */
  function NavItem({ view: v, emoji, label }: { view: View; emoji: string; label: string }) {
    const isActive = view === v;
    return (
      <button
        onClick={() => setView(v)}
        className={`
          group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200
          ${
            isActive
              ? "bg-primary/15 text-white shadow-lg shadow-primary/10"
              : "text-gray-400 hover:text-gray-200 hover:bg-surface-lighter/40"
          }
        `}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.6)]"
          />
        )}
        <span className="text-base leading-none">{emoji}</span>
        <span>{label}</span>
      </button>
    );
  }

  /* ─── Quick starter button ─── */
  function StarterButton({ s }: { s: (typeof QUICK_STARTERS)[number] }) {
    return (
      <button
        onClick={() => {
          setInput(s.msg);
          inputRef.current?.focus();
        }}
        className="chip flex items-center gap-2"
      >
        <span className="text-sm">{s.emoji}</span>
        <span>{s.label}</span>
      </button>
    );
  }

  /* ─── Task card ─── */
  function TaskCard({ task, index }: { task: Task; index: number }) {
    const isDone = task.status === "completed";
    const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const cConfig = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.General;

    return (
      <div
        style={{ animationDelay: `${index * 50}ms` }}
        className={`
          group flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200
          animate-fade-in-up
          ${
            isDone
              ? "bg-surface-light/40 border-surface-lighter/30 opacity-60"
              : "bg-surface-light border-surface-lighter/50 hover:border-primary/30 hover:bg-surface-hover"
          }
        `}
      >
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          aria-label={isDone ? "Reopen task" : "Complete task"}
          className={`
            mt-0.5 w-[22px] h-[22px] rounded-lg border-2 flex items-center justify-center
            flex-shrink-0 transition-all duration-200
            ${isDone ? "task-checkbox checked" : "border-gray-600 hover:border-primary"}
          `}
        >
          {isDone && (
            <svg
              className="w-3 h-3 text-white animate-check-pop"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium leading-snug ${isDone ? "text-gray-500 line-through" : "text-gray-100"}`}>
            <span className={cConfig.color}>{cConfig.emoji}</span>{" "}
            <span className="ml-0.5">{task.title}</span>
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`pill ${pConfig.pill}`}>{task.priority}</span>
            <span className="pill bg-surface-lighter text-gray-400">
              📅 {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="pill bg-surface-lighter text-gray-400">⏱ {task.estimatedTime}</span>
          </div>
          {!isDone && task.subtasks.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {task.subtasks.map((sub, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                  <span className="truncate">{sub}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => deleteTask(task.id)}
          className="
            opacity-0 group-hover:opacity-100
            text-gray-600 hover:text-danger
            transition-all duration-200 p-1 rounded-lg
            hover:bg-danger/10
          "
          aria-label="Delete task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  /* ─── Goal card ─── */
  function GoalCard({ goal }: { goal: Goal }) {
    const isExpanded = expandedGoal === goal.id;
    const completed  = goal.milestones.filter((m) => m.done).length;
    const total      = goal.milestones.length;
    const pct        = total ? Math.round((completed / total) * 100) : 0;

    return (
      <div
        className="card card-hover overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "0ms" }}
      >
        <div className="p-5">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-white leading-snug truncate">{goal.title}</h3>
              {goal.description && (
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{goal.description}</p>
              )}
            </div>
            <span className="pill bg-primary/10 text-primary border border-primary/20 flex-shrink-0 tabular-nums">
              {pct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 relative">
            <div className="progress-bar">
              <div
                className={`${pct === 100 ? "progress-success" : "progress-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[11px] text-gray-500 tabular-nums">
                {completed}/{total} milestones
              </span>
              <span className="text-[11px] text-gray-600 tabular-nums">{pct === 100 ? "🎉 Done!" : "In progress"}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-lighter/40">
            <span className="text-xs text-gray-500">
              📅 {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <button
              onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
              className="
                text-xs font-medium text-primary hover:text-primary-light
                transition-colors duration-200 flex items-center gap-1
              "
            >
              {isExpanded ? "Hide" : "View"} milestones
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded milestones */}
        {isExpanded && (
          <div className="px-5 pb-5 animate-fade-in border-t border-surface-lighter/40">
            <div className="pt-4 space-y-3">
              {goal.milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-3 group/milestone">
                  <div
                    className={`
                      mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                      transition-all duration-200
                      ${m.done ? "bg-success border-success" : "border-gray-600 group-hover/milestone:border-gray-500"}
                    `}
                  >
                    {m.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm leading-relaxed ${m.done ? "text-gray-600 line-through" : "text-gray-300"}`}>
                    {m.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Message bubble ─── */
  function MessageBubble({ msg, index }: { msg: Message; index: number }) {
    const isUser = msg.role === "user";
    return (
      <div
        className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div
          className={`
            max-w-[75%] rounded-2xl px-5 py-3.5
            ${isUser
              ? "bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-lg shadow-lg shadow-primary/20"
              : "bg-surface-light/80 text-gray-200 rounded-bl-lg border border-surface-lighter/50"
            }
          `}
        >
          {/* Avatar indicator */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs">
                ⚡
              </div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Deadline</span>
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
      </div>
    );
  }

  /* ─── Typing indicator ─── */
  function TypingIndicator() {
    return (
      <div className="flex justify-start animate-fade-in">
        <div className="bg-surface-light/80 rounded-2xl rounded-bl-lg px-5 py-4 border border-surface-lighter/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs">
              ⚡
            </div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Deadline</span>
          </div>
          <div className="flex gap-1.5 pt-1">
            <span className="typing-dot w-2 h-2 rounded-full bg-gray-400" />
            <span className="typing-dot w-2 h-2 rounded-full bg-gray-400" />
            <span className="typing-dot w-2 h-2 rounded-full bg-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* ─── Decorative orbs ─── */}
      <div className="orb orb-primary" />
      <div className="orb orb-accent" />

      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-72 glass flex flex-col flex-shrink-0 z-10">
        {/* Brand */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl shadow-lg shadow-primary/25">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Deadline</h1>
              <p className="text-[11px] text-gray-500 -mt-0.5">AI productivity companion</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-surface-lighter to-transparent" />

        {/* Navigation */}
        <nav className="flex gap-1.5 px-4 mt-4">
          <NavItem view="chat"  emoji="💬" label="Chat" />
          <NavItem view="tasks" emoji="📝" label="Tasks" />
          <NavItem view="goals" emoji="🎯" label="Goals" />
        </nav>

        {/* Divider */}
        <div className="mx-6 mt-4 h-px bg-gradient-to-r from-transparent via-surface-lighter to-transparent" />

        {/* Dynamic content summary */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Summary header */}
          <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest px-2 mb-3">
            Overview
          </p>

          {/* Status pill */}
          <div className="glass-light rounded-xl px-3.5 py-3 mb-4 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping opacity-40" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-200">AI Active</p>
              <p className="text-[11px] text-gray-500">Ready to help</p>
            </div>
          </div>

          {/* Mini goals */}
          {goals.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2.5 flex items-center gap-1.5">
                <span>🎯</span> Goals
              </p>
              <div className="space-y-2">
                {goals.slice(0, 4).map((g) => {
                  const done  = g.milestones.filter((m) => m.done).length;
                  const total = g.milestones.length;
                  const pct   = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={g.id} className="glass-light rounded-lg px-3 py-2.5">
                      <p className="text-xs font-medium text-gray-200 truncate">{g.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-surface-lighter rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 tabular-nums w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mini tasks */}
          {tasks.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2.5 flex items-center gap-1.5">
                <span>📝</span> Tasks ({tasks.length})
              </p>
              <div className="space-y-1.5">
                {tasks
                  .filter((t) => t.status !== "completed")
                  .sort((a, b) => {
                    const o = { urgent: 0, high: 1, medium: 2, low: 3 };
                    return (o[a.priority] ?? 2) - (o[b.priority] ?? 2);
                  })
                  .slice(0, 5)
                  .map((t) => {
                    const pConfig = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
                    const cConfig = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.General;
                    return (
                      <div key={t.id} className="glass-light rounded-lg px-3 py-2 flex items-center gap-2.5 group/t">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pConfig.dot}`} />
                        <span className={`text-xs truncate flex-1 ${cConfig.color}`}>
                          {cConfig.emoji} <span className="text-gray-300 ml-0.5">{t.title}</span>
                        </span>
                        <span className="text-[10px] text-gray-600 flex-shrink-0 tabular-nums">
                          {new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Empty state in sidebar */}
          {goals.length === 0 && tasks.length === 0 && (
            <div className="text-center px-4 py-6">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-xs text-gray-600">No tasks yet</p>
              <p className="text-[11px] text-gray-700 mt-0.5">Chat to get started</p>
            </div>
          )}
        </div>

        {/* Sidebar footer */}
        <div className="px-4 py-4 border-t border-surface-lighter/40">
          <div className="glass-light rounded-xl px-3.5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm">
              👤
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-300 truncate">User</p>
              <p className="text-[11px] text-gray-600">Local session</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 flex flex-col min-w-0 relative z-[1]">

        {/* ─── CHAT VIEW ─── */}
        {view === "chat" && (
          <div key="chat" className="flex-1 flex flex-col min-h-0 animate-fade-in">
            {/* Header */}
            <header className="px-8 py-5 border-b border-surface-lighter/40 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {greeting} <span className="gradient-text-animated">User</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  I'll help you stay on top of your deadlines. What's on your plate?
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 glass-light rounded-full px-3.5 py-1.5">
                <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="font-medium text-gray-300">AI Active</span>
                <span className="text-gray-600">·</span>
                <span className="tabular-nums text-gray-500">{intensity}%</span>
              </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {messages.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full text-center view-enter">
                  {/* Illustration */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center text-4xl animate-float">
                      ⚡
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/30 border border-primary/30 flex items-center justify-center text-[10px]">
                      ✨
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">Ready to be productive</h3>
                  <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">
                    Tell me about your tasks, deadlines, or goals.
                    I'll break them down, prioritize, and help you stay on track.
                  </p>

                  {/* Quick starters */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                    {QUICK_STARTERS.map((s) => (
                      <StarterButton key={s.label} s={s} />
                    ))}
                  </div>

                  {/* Feature highlights */}
                  <div className="flex items-center gap-6 mt-10 text-[11px] text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Task prioritization
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      AI scheduling
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Goal tracking
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="space-y-4 pb-2">
                    {messages.map((m, i) => (
                      <MessageBubble key={i} msg={m} index={i} />
                    ))}
                    {loading && <TypingIndicator />}
                    <div ref={chatEndRef} />
                  </div>
                </>
              )}
            </div>

            {/* Input area */}
            <div className="px-8 py-5 border-t border-surface-lighter/30 flex-shrink-0 bg-gradient-to-t from-surface via-surface to-transparent">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
                <div
                  className={`
                    input-glow flex items-center gap-3
                    bg-surface-light/80 border border-surface-lighter/40 rounded-2xl
                    px-4 py-2 transition-all duration-200
                  `}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tell me about your tasks, deadlines, or goals..."
                    disabled={loading}
                    className="
                      flex-1 bg-transparent text-sm text-white placeholder-gray-600
                      focus:outline-none disabled:opacity-40
                      py-2
                    "
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="
                      btn-primary px-5 py-2.5 rounded-xl text-sm font-medium
                      flex items-center gap-2
                    "
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="hidden sm:inline">Thinking...</span>
                      </>
                    ) : (
                      <>
                        <span>Send</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-700 mt-3">
                  Powered by Google Gemini AI · Tasks are stored locally
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ─── TASKS VIEW ─── */}
        {view === "tasks" && (
          <div key="tasks" className="flex-1 flex flex-col min-h-0 view-enter">
            {/* Header */}
            <header className="px-8 py-6 border-b border-surface-lighter/40 flex-shrink-0 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">
                    📝
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Your Tasks</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tasks.length} total · {pendingCount} pending · {completedCount} done
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Filters */}
            <div className="px-8 pt-5 pb-2 flex gap-2.5 flex-shrink-0">
              {(["all", "pending", "completed"] as const).map((f) => {
                const isActive = taskFilter === f;
                const label = f === "all" ? `All` : f === "pending" ? `Pending` : `Done`;
                const count = f === "all" ? tasks.length : f === "pending" ? pendingCount : completedCount;
                return (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`
                      text-xs font-medium px-4 py-2 rounded-full transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20 border border-primary"
                          : "bg-surface-light text-gray-400 hover:text-gray-200 border border-surface-lighter/60 hover:bg-surface-hover"
                      }
                    `}
                  >
                    <span className="tabular-nums">{label}</span>
                    <span className={`
                      ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums
                      ${isActive ? "bg-white/15 text-white" : "bg-surface-lighter text-gray-500"}
                    `}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto px-8 py-4">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center view-enter">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {taskFilter === "all" ? "No tasks yet" : taskFilter === "pending" ? "No pending tasks" : "Nothing completed yet"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {taskFilter === "all"
                      ? "Switch to Chat view and tell the AI about your tasks"
                      : "Keep up the great work!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks
                    .sort((a, b) => {
                      if (a.status === "completed" && b.status !== "completed") return 1;
                      if (a.status !== "completed" && b.status === "completed") return -1;
                      const o = { urgent: 0, high: 1, medium: 2, low: 3 };
                      return (o[a.priority] ?? 2) - (o[b.priority] ?? 2);
                    })
                    .map((t, i) => <TaskCard key={t.id} task={t} index={i} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── GOALS VIEW ─── */}
        {view === "goals" && (
          <div key="goals" className="flex-1 flex flex-col min-h-0 view-enter">
            {/* Header */}
            <header className="px-8 py-6 border-b border-surface-lighter/40 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-lg">
                  🎯
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Your Goals</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {goals.length} goal{goals.length !== 1 ? "s" : ""} · Track your long-term progress
                  </p>
                </div>
              </div>
            </header>

            {/* Goals list */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center view-enter">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-base font-semibold text-white mb-1">No goals yet</h3>
                  <p className="text-sm text-gray-500">
                    Tell the AI about your long-term goals and it'll help you break them down
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-2xl">
                  {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}