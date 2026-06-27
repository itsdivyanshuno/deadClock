/**
 * @module app/page
 * @description Root Client Component — the single UI orchestrator for deadClock.
 *
 * Owns all client-side state: chat transcript, active view (chat/tasks/goals),
 * task list, goal list, input value, and loading flag.
 *
 * Data flow: user message → POST /api/chat → Gemini agent (lib/agent.ts) →
 * tool calls mutate in-memory state → saveState() to SQLite → response
 * returns updated { tasks, goals } → setTasks / setGoals here.
 *
 * @see app/api/chat/route.ts POST/GET API endpoints
 * @see lib/agent.ts AI agent + Gemini function calling
 * @see lib/db.js SQLite persistence layer
 */
"use client";

import { useState, useRef, useEffect } from "react";
import type { Task, Goal } from "@/lib/agent";

/**
 * A single message in the chat transcript.
 * @property {"user" | "assistant"} role - Who authored the message.
 * @property {string} content - Plain-text message body.
 */
type Message = { role: "user" | "assistant"; content: string };

/**
 * Maps each priority level to a pill CSS class.
 * Used for the small priority badges on task cards.
 */
const PRIORITY_PILLS: Record<string, string> = {
  urgent: "pill-urgent",
  high: "pill-high",
  medium: "pill-medium",
  low: "pill-low",
};

/**
 * Maps a task category string to a display emoji.
 * Falls back to General 📋 when the category isn't in this map.
 */
const CATEGORY_ICONS: Record<string, string> = {
  Work: "💼",
  Study: "📚",
  Personal: "👤",
  Health: "❤️",
  Finance: "💰",
  General: "📋",
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"chat" | "tasks" | "goals">("chat");
  const [greeting, setGreeting] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

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
          { role: "assistant", content: "Something went wrong. Check if your API key is set." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI." },
      ]);
    }
    setLoading(false);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "☀️ Good morning";
    if (hour < 17) return "🌤️ Good afternoon";
    return "🌙 Good evening";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-texture">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="sidebar w-72 flex flex-col">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-white font-bold text-base shadow-sm">
              ⏱
            </div>
            <div>
              <h1 className="display-font text-base text-text leading-tight">
                deadClock
              </h1>
              <p className="text-[11px] text-text-muted tracking-wide">
                Last‑minute life saver
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1.5 px-3 mb-4">
          {(["chat", "tasks", "goals"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`nav-btn ${view === v ? "active" : ""}`}
            >
              {v === "chat" ? "💬" : v === "tasks" ? "📝" : "🎯"} {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </nav>

        <div className="divider mx-5 mb-4" />

        {/* Scrollable sidebar content */}
        <div className="flex-1 overflow-y-auto px-3 space-y-5">
          {/* Goals overview */}
          {goals.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
                🎯 Goals
              </h3>
              <div className="space-y-2">
                {goals.map((g) => {
                  const done = g.milestones.filter((m) => m.done).length;
                  const pct = Math.round((done / g.milestones.length) * 100) || 0;
                  return (
                    <div
                      key={g.id}
                      className="card goal-accent p-3.5 pl-4"
                    >
                      <p className="text-[13px] font-medium text-text truncate">
                        {g.title}
                      </p>
                      <p className="text-[11px] text-text-muted mt-1">
                        Due {new Date(g.deadline).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="progress-track flex-1">
                          <div
                            className="progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-muted w-7 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks overview */}
          {tasks.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
                📝 Tasks ({tasks.filter((t) => t.status !== "completed").length})
              </h3>
              <div className="space-y-1.5">
                {tasks
                  .filter((t) => t.status !== "completed")
                  .sort((a, b) => {
                    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
                    return (order[a.priority] || 2) - (order[b.priority] || 2);
                  })
                  .slice(0, 8)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-surface transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-text truncate">
                          {CATEGORY_ICONS[t.category] || "📋"} {t.title}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Due {new Date(t.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`pill ${PRIORITY_PILLS[t.priority] || ""}`}>
                        {t.priority}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {tasks.length === 0 && goals.length === 0 && (
            <div className="text-center py-10">
              <p className="text-3xl mb-2 opacity-40">🗂</p>
              <p className="text-xs text-text-muted">No tasks or goals yet</p>
              <p className="text-[11px] text-text-muted mt-1">
                Start a chat to populate this list
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="divider mx-5" />
        <div className="px-5 py-3.5 text-center">
          <p className="text-[11px] text-text-muted flex items-center justify-center gap-1.5">
            <span className="status-dot" />
            Powered by Google Gemini
          </p>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {view === "chat" && (
          <>
            {/* Header */}
            <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-white/60 backdrop-blur-sm">
              <div>
                <h2 className="display-font text-lg text-text">
                  {greeting}, Divyansh
                </h2>
                <p className="text-[13px] text-text-secondary mt-0.5">
                  I&apos;ll help you beat your deadlines. What&apos;s on your plate?
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="status-dot" />
                <span className="font-medium">live</span>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full anim-fade-up">
                  {/* Logo mark */}
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-5">
                    ⏱
                  </div>
                  <h3 className="display-font text-xl text-text mb-2">
                    What needs to get done?
                  </h3>
                  <p className="text-text-secondary text-sm max-w-sm text-center leading-relaxed">
                    Tell me about your tasks, deadlines, or goals and I&apos;ll
                    plan, prioritise, and keep you on track.
                  </p>

                  {/* Quick starters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg w-full">
                    {[
                      {
                        icon: "📚",
                        label: "Study for midterms",
                        msg: "I have my midterm exams next week. Help me create a study plan.",
                      },
                      {
                        icon: "💼",
                        label: "Work tasks",
                        msg: "I need to prepare a project presentation by Friday and send 3 reports.",
                      },
                      {
                        icon: "🎯",
                        label: "Set a goal",
                        msg: "I want to build a fitness habit — help me set milestones.",
                      },
                      {
                        icon: "⚡",
                        label: "Prioritise my day",
                        msg: "I have 5 tasks due today, help me figure out what to do first.",
                      },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setInput(s.msg)}
                        className="quick-chip"
                      >
                        <span className="text-base mr-2">{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} anim-fade-in`}
                  >
                    <div
                      className={`max-w-[68%] px-5 py-3.5 ${
                        m.role === "user"
                          ? "msg-user"
                          : "msg-ai"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start anim-fade-in">
                  <div className="msg-ai px-5 py-4">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 rounded-full bg-text-muted typing-dot" />
                      <span className="w-2 h-2 rounded-full bg-text-muted typing-dot" />
                      <span className="w-2 h-2 rounded-full bg-text-muted typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="px-8 pb-6 pt-3">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
                <div className="flex gap-3 items-center bg-white border border-border rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow focus-within:shadow-lg focus-within:border-primary">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What needs to get done?"
                    className="input-main flex-1 border-none shadow-none bg-transparent text-sm focus:shadow-none focus:border-none"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="btn-primary py-2.5 px-5 text-sm"
                  >
                    Send
                  </button>
                </div>
              </form>
              <p className="text-center text-[11px] text-text-muted mt-3">
                deadClock plans your tasks — you just tell it what&apos;s due.
              </p>
            </div>
          </>
        )}

        {view === "tasks" && <TasksView tasks={tasks} setTasks={setTasks} />}
        {view === "goals" && <GoalsView goals={goals} setGoals={setGoals} />}
      </main>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────
   Tasks view
   ─────────────────────────────────────────────────────────────────────── */

function TasksView({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

 async function toggleTask(id: string) {
  // Resolve the task's current status from the tasks prop (not the ID string)
  const task = tasks.find((t) => t.id === id);
  const isCompleting = task?.status !== "completed";

  setTasks((prev) =>
    prev.map((t) =>
      t.id === id
        ? { ...t, status: isCompleting ? "completed" : "pending" }
        : t
    )
  );
  try {
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: isCompleting
          ? `complete task ${id}`
          : `reopen task ${id}`,
      }),
    });
  } catch {
    // non-critical — optimistic UI update already applied
  }
 }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `delete task ${id}` }),
      });
    } catch {
      // best-effort server sync
    }
  }

  return (
    <div className="h-full overflow-y-auto anim-fade-up">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border bg-white/70 backdrop-blur-sm">
        <h2 className="display-font text-xl text-text">Your Tasks</h2>
        <p className="text-[13px] text-text-secondary mt-1">
          {pendingCount} pending · {completedCount} completed
        </p>
        <div className="flex gap-2 mt-4">
          {(["all", "pending", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip ${filter === f ? "active" : ""}`}
            >
              {f === "all" && `All (${tasks.length})`}
              {f === "pending" && `Pending (${pendingCount})`}
              {f === "completed" && `Done (${completedCount})`}
            </button>
          ))}
        </div>
      </header>

      {/* Task list */}
      <div className="p-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3 opacity-30">📝</p>
            <p className="text-sm text-text-secondary">No {filter === "completed" ? "completed" : filter === "pending" ? "pending" : ""} tasks yet.</p>
            <p className="text-xs text-text-muted mt-1">Chat with the AI to get started.</p>
          </div>
        ) : (
          filtered
            .sort((a, b) => {
              if (a.status === "completed" && b.status !== "completed") return 1;
              if (a.status !== "completed" && b.status === "completed") return -1;
              const order = { urgent: 0, high: 1, medium: 2, low: 3 };
              return (order[a.priority] || 2) - (order[b.priority] || 2);
            })
            .map((t) => (
              <div
                key={t.id}
                className={`card p-4 anim-slide-in ${
                  t.status === "completed" ? "opacity-50 bg-surface" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`task-check mt-0.5 ${
                      t.status === "completed" ? "checked" : ""
                    }`}
                  >
                    {t.status === "completed" && (
                      <span className="text-white text-[11px]">✓</span>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] font-semibold ${
                        t.status === "completed"
                          ? "line-through text-text-muted"
                          : "text-text"
                      }`}
                    >
                      {CATEGORY_ICONS[t.category] || "📋"} {t.title}
                    </p>
                    {t.description && (
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span className={`pill ${PRIORITY_PILLS[t.priority] || ""}`}>
                        {t.priority}
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-border-light text-text-muted">
                        📅 {new Date(t.deadline).toLocaleDateString()}
                      </span>
                      {t.estimatedTime && (
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-border-light text-text-muted">
                          ⏱ {t.estimatedTime}
                        </span>
                      )}
                    </div>
                    {t.subtasks.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {t.subtasks.map((sub, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-text-secondary"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                            {sub}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="text-text-muted hover:text-danger transition-colors p-1 text-xs rounded-md hover:bg-danger-soft"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────
   Goals view
   ─────────────────────────────────────────────────────────────────────── */

function GoalsView({
  goals,
  setGoals,
}: {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto anim-fade-up">
      <header className="px-8 py-6 border-b border-border bg-white/70 backdrop-blur-sm">
        <h2 className="display-font text-xl text-text">Your Goals</h2>
        <p className="text-[13px] text-text-secondary mt-1">
          Long‑term objectives, one milestone at a time
        </p>
      </header>

      <div className="p-6 space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3 opacity-30">🎯</p>
            <p className="text-sm text-text-secondary">No goals yet.</p>
            <p className="text-xs text-text-muted mt-1">
              Tell the AI about a long‑term goal you want to hit.
            </p>
          </div>
        ) : (
          goals.map((g) => {
            const done = g.milestones.filter((m) => m.done).length;
            const pct = Math.round((done / g.milestones.length) * 100) || 0;
            const isExpanded = expandedId === g.id;

            return (
              <div
                key={g.id}
                className="card goal-accent pl-5 anim-fade-up"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-text leading-snug">
                        {g.title}
                      </h3>
                      {g.description && (
                        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                          {g.description}
                        </p>
                      )}
                    </div>
                    <span className="pill bg-primary-soft text-primary border border-primary/20 whitespace-nowrap mt-1">
                      {pct}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <div className="progress-track flex-1">
                      <div
                        className={`progress-fill ${pct === 100 ? "progress-fill-success" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-text-muted tabular-nums w-9 text-right">
                      {done}/{g.milestones.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3.5">
                    <span className="text-xs text-text-muted">
                      📅 Due {new Date(g.deadline).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : g.id)
                      }
                      className="text-xs font-medium text-primary hover:text-accent transition-colors"
                    >
                      {isExpanded ? "Hide" : "View"} milestones{" "}
                      <span className="text-[10px]">{isExpanded ? "↑" : "↓"}</span>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="divider" />
                )}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-4 space-y-3">
                    {g.milestones.map((m, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <button
                          onClick={() => {
                            // Toggle milestone locally; server sync handled by next chat call
                            setGoals((prev) =>
                              prev.map((goal) =>
                                goal.id === g.id
                                  ? {
                                      ...goal,
                                      milestones: goal.milestones.map(
                                        (milestone, idx) =>
                                          idx === i
                                            ? {
                                                ...milestone,
                                                done: !milestone.done,
                                              }
                                            : milestone
                                      ),
                                    }
                                  : goal
                              )
                            );
                            fetch("/api/chat", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                message: m.done
                                  ? `reopen milestone ${i} on goal ${g.id}`
                                  : `complete milestone ${i} on goal ${g.id}`,
                              }),
                            }).catch(() => {});
                          }}
                          className={`task-check mt-0.5 ${m.done ? "checked" : ""}`}
                        >
                          {m.done && (
                            <span className="text-white text-[11px]">✓</span>
                          )}
                        </button>
                        <span
                          className={`text-[13px] leading-relaxed ${
                            m.done
                              ? "text-text-muted line-through"
                              : "text-text"
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
