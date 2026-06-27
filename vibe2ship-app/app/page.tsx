"use client";

import { useState, useRef, useEffect } from "react";
import type { Task, Goal } from "@/lib/agent";

type Message = { role: "user" | "assistant"; content: string };

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-danger/20 text-danger border-danger/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-accent/20 text-accent border-accent/30",
};

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Check if your API key is set." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI." }]);
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-surface-light flex flex-col border-r border-surface-lighter">
        <div className="p-5 border-b border-surface-lighter">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            ⚡ Deadline
          </h1>
          <p className="text-xs text-gray-400 mt-1">Your AI productivity companion</p>
        </div>

        <nav className="flex gap-1 p-3">
          {(["chat", "tasks", "goals"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                view === v ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-surface-lighter"
              }`}
            >
              {v === "chat" ? "💬" : v === "tasks" ? "📝" : "🎯"} {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {goals.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">🎯 Goals</h3>
              {goals.map((g) => (
                <div key={g.id} className="p-3 bg-surface rounded-lg mb-2 border border-surface-lighter">
                  <div className="text-sm font-medium text-white">{g.title}</div>
                  <div className="text-xs text-gray-400 mt-1">Due {new Date(g.deadline).toLocaleDateString()}</div>
                  <div className="mt-2 h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tasks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">📝 Tasks ({tasks.length})</h3>
              {tasks
                .filter((t) => t.status !== "completed")
                .sort((a, b) => {
                  const order = { urgent: 0, high: 1, medium: 2, low: 3 };
                  return (order[a.priority] || 2) - (order[b.priority] || 2);
                })
                .map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg mb-2 border ${PRIORITY_COLORS[t.priority] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}
                  >
                    <div className="text-xs font-medium">{CATEGORY_ICONS[t.category] || "📋"} {t.title}</div>
                    <div className="text-[11px] opacity-75 mt-1">Due {new Date(t.deadline).toLocaleDateString()}</div>
                    {t.subtasks.length > 0 && (
                      <div className="mt-2 text-[11px] opacity-60">
                        {t.subtasks.length} subtask{t.subtasks.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {tasks.length === 0 && goals.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs">
              <p>No tasks yet.</p>
              <p className="mt-1">Chat with AI to get started!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-surface-lighter">
          <div className="text-xs text-gray-500 text-center">
            🔒 Built with Google Gemini AI
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {view === "chat" && (
          <>
            {/* Header */}
            <header className="p-5 border-b border-surface-lighter flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{getGreeting()}, Divyansh</h2>
                <p className="text-sm text-gray-400">I'll help you crush your deadlines. What's on your plate?</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                AI Active
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to be productive</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    Tell me about your tasks, deadlines, or goals. I'll break them down, prioritize, and help
                    you stay on track.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-6 max-w-lg">
                    {[
                      { label: "📚 Study for midterms", msg: "I have my midterm exams next week. Help me create a study plan." },
                      { label: "💼 Work tasks", msg: "I need to prepare a project presentation by Friday and send 3 reports." },
                      { label: "🎯 Set a goal", msg: "I want to build a fitness habit — help me set milestones." },
                      { label: "📋 Prioritize my day", msg: "I have 5 tasks due today, help me figure out what to do first." },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setInput(s.msg)}
                        className="p-3 bg-surface-light rounded-lg border border-surface-lighter text-left text-xs text-gray-300 hover:border-primary transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                        m.role === "user"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-surface-light text-gray-200 rounded-bl-md border border-surface-lighter"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface-light rounded-2xl rounded-bl-md px-5 py-3 border border-surface-lighter">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-surface-lighter">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell me about your tasks, deadlines, or goals..."
                  className="flex-1 bg-surface-light border border-surface-lighter rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}

        {view === "tasks" && (
          <TasksView tasks={tasks} setTasks={setTasks} />
        )}

        {view === "goals" && (
          <GoalsView goals={goals} setGoals={setGoals} />
        )}
      </main>
    </div>
  );
}

function TasksView({ tasks, setTasks }: { tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>> }) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  async function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t)));
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: id.includes("completed") ? `complete todo id ${id}` : `reopen task ${id}` }),
      });
    } catch {}
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="h-full overflow-y-auto">
      <header className="p-6 border-b border-surface-lighter">
        <h2 className="text-2xl font-bold text-white">Your Tasks</h2>
        <div className="flex gap-4 mt-3">
          {(["all", "pending", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                filter === f ? "bg-primary text-white" : "bg-surface-lighter text-gray-400 hover:text-white"
              }`}
            >
              {f === "all" ? `All (${tasks.length})` : f === "pending" ? `Pending (${pendingCount})` : `Done (${completedCount})`}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm">No {filter === "completed" ? "completed" : filter === "pending" ? "pending" : ""} tasks yet.</p>
            <p className="text-xs mt-1 text-gray-600">Use the AI chat to add tasks.</p>
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
                className={`p-4 rounded-xl border transition-all ${
                  t.status === "completed"
                    ? "bg-surface-light/50 border-surface-lighter opacity-60"
                    : "bg-surface-light border-surface-lighter hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      t.status === "completed"
                        ? "bg-success border-success"
                        : "border-gray-500 hover:border-primary"
                    }`}
                  >
                    {t.status === "completed" && <span className="text-white text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${t.status === "completed" ? "line-through text-gray-500" : "text-white"}`}>
                      {CATEGORY_ICONS[t.category] || "📋"} {t.title}
                    </div>
                    {t.description && <p className="text-xs text-gray-400 mt-1">{t.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[t.priority] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
                        {t.priority.toUpperCase()}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-lighter text-gray-400">
                        📅 {new Date(t.deadline).toLocaleDateString()}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-lighter text-gray-400">
                        ⏱ {t.estimatedTime}
                      </span>
                    </div>
                    {t.subtasks.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {t.subtasks.map((sub, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                            {sub}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="text-gray-500 hover:text-danger transition-colors text-xs"
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

function GoalsView({ goals, setGoals }: { goals: Goal[]; setGoals: React.Dispatch<React.SetStateAction<Goal[]>> }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      <header className="p-6 border-b border-surface-lighter">
        <h2 className="text-2xl font-bold text-white">Your Goals</h2>
        <p className="text-sm text-gray-400 mt-1">Long-term objectives with milestones</p>
      </header>

      <div className="p-6 space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-sm">No goals yet.</p>
            <p className="text-xs mt-1 text-gray-600">Tell the AI about your long-term goals.</p>
          </div>
        ) : (
          goals.map((g) => {
            const completedMilestones = g.milestones.filter((m) => m.done).length;
            const isExpanded = expandedId === g.id;
            return (
              <div key={g.id} className="bg-surface-light rounded-xl border border-surface-loverflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{g.title}</h3>
                      {g.description && <p className="text-xs text-gray-400 mt-1">{g.description}</p>}
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {Math.round((completedMilestones / g.milestones.length) * 100) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 bg-surface-lighter rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(completedMilestones / g.milestones.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {completedMilestones}/{g.milestones.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">📅 Due {new Date(g.deadline).toLocaleDateString()}</span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : g.id)}
                      className="text-xs text-primary hover:text-accent transition-colors"
                    >
                      {isExpanded ? "Hide" : "View"} milestones ↓
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-2 border-t border-surface-lighter pt-4">
                    {g.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            m.done ? "bg-success border-success" : "border-gray-500"
                          }`}
                        >
                          {m.done && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className={`text-sm ${m.done ? "text-gray-500 line-through" : "text-gray-300"}`}>
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
