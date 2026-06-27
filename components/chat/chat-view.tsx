"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Goal } from "@/lib/agent";

type Message = { role: "user" | "assistant"; content: string };

interface ChatViewProps {
  messages: Message[];
  input: string;
  loading: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onQuickStart: (msg: string) => void;
}

const QUICK_STARTS = [
  { icon: "📚", label: "Study for midterms", msg: "I have my midterm exams next week. Help me create a study plan." },
  { icon: "💼", label: "Work tasks", msg: "I need to prepare a project presentation by Friday and send 3 reports." },
  { icon: "🎯", label: "Set a goal", msg: "I want to build a fitness habit — help me set milestones." },
  { icon: "⚡", label: "Prioritise my day", msg: "I have 5 tasks due today, help me figure out what to do first." },
];

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="max-w-[80%] px-5 py-4 rounded-2xl rounded-bl-sm bg-surface border border-border shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-text-muted" style={{ animation: "typing-bounce 1.4s ease-in-out infinite", animationDelay: `${i * 0.2}s` } as React.CSSProperties} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SingleMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) { const t = setTimeout(() => setCopied(false), 1500); return () => clearTimeout(t); }
  }, [copied]);

  if (message.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[75%] px-5 py-3 bg-primary text-white rounded-2xl rounded-br-sm shadow-sm">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="max-w-[75%] px-5 py-3.5 rounded-2xl rounded-bl-sm bg-surface border border-border shadow-sm group relative">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {message.content.length > 20 && (
          <div className="absolute -top-5 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {copied ? (
              <span className="flex items-center gap-1 text-[10px] text-success font-medium bg-surface/90 border border-border rounded-md px-1.5 py-0.5">
                <Check className="h-3 w-3" /> Copied
              </span>
            ) : (
              <button
                onClick={() => { navigator.clipboard.writeText(message.content); setCopied(true); }}
                className="text-text-muted hover:text-text-secondary bg-surface/90 border border-border rounded-md p-1"
                aria-label="Copy message"
              >
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function GreetingState({ onQuickStart }: { onQuickStart: (msg: string) => void }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const starts = [
    { icon: "📚", label: "Study for midterms", msg: "I have my midterm exams next week. Help me create a study plan." },
    { icon: "💼", label: "Work tasks", msg: "I need to prepare a project presentation by Friday and send 3 reports." },
    { icon: "🎯", label: "Set a goal", msg: "I want to build a fitness habit — help me set milestones." },
    { icon: "⚡", label: "Prioritise my day", msg: "I have 5 tasks due today, help me figure out what to do first." },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex flex-col items-center justify-center h-full px-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-text flex items-center justify-center shadow-lg mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      </motion.div>
      <h2 className="display-font text-xl text-text mb-2">{greeting}. What needs to get done?</h2>
      <p className="text-sm text-text-secondary max-w-md text-center leading-relaxed mb-8">
        Tell me about your tasks, deadlines, or goals and I&apos;ll plan, prioritise, and keep you on track.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {starts.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onQuickStart(s.msg)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface text-left text-sm font-medium text-text-secondary hover:border-primary/40 hover:text-text hover:shadow-sm transition-all"
          >
            <span className="text-base">{s.icon}</span>
            <span>{s.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Chat View                                                   */
/* ------------------------------------------------------------------ */

export function ChatView({ messages, input, loading, onInputChange, onSend, onQuickStart }: ChatViewProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => { e.preventDefault(); onSend(); },
    [onSend]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
        {messages.length === 0 && !loading ? (
          <div className="h-full"><GreetingState onQuickStart={onQuickStart} /></div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m, i) => (
              <SingleMessage key={i} message={m} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={endRef} />
          </div>
        )}
      </div>
      <div className="shrink-0 px-4 pb-5 pt-2 lg:px-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="group flex items-end gap-2 bg-surface border border-border rounded-2xl px-4 py-2.5 shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all duration-200">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
              }}
              placeholder="Describe what you need to accomplish..."
              disabled={loading}
              className={cn("flex-1 resize-none bg-transparent border-none outline-none text-sm leading-relaxed placeholder:text-text-muted py-1 max-h-32 disabled:opacity-50")}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className={cn("shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 bg-primary text-white hover:bg-text disabled:opacity-30 disabled:cursor-not-allowed", input.trim() && !loading && "shadow-sm shadow-primary/20")}
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <p className="text-center text-[10px] text-text-muted mt-2.5">
            deadClock plans your tasks — you just tell it what&apos;s due.
          </p>
        </form>
      </div>
    </div>
  );
}
