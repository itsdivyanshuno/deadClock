"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, CheckSquare, Target, LayoutDashboard, Settings } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

type View = "chat" | "tasks" | "goals" | "dashboard" | "settings";

/* ── Palette keyboard hook (Cmd/Ctrl+K, Esc) ───────────────────────────── */

export function useCommandPalette(onNavigate: (v: View) => void) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggle]);

  return { open, setOpen, toggle };
}

/* ── Command palette component ─────────────────────────────────────────── */

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: View) => void;
}

interface CommandItem {
  id: View;
  label: string;
  description: string;
  icon: React.ElementType;
  shortcut?: string[];
  action: () => void;
}

export function CommandPalette({ open, onOpenChange, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const commands: CommandItem[] = [
    { id: "chat", label: "Chat", description: "Talk with AI", icon: MessageSquare,
      shortcut: ["G", "C"], action: () => { onNavigate("chat"); onOpenChange(false); } },
    { id: "tasks", label: "Tasks", description: "View all tasks", icon: CheckSquare,
      shortcut: ["G", "T"], action: () => { onNavigate("tasks"); onOpenChange(false); } },
    { id: "goals", label: "Goals", description: "Long-term objectives", icon: Target,
      shortcut: ["G", "G"], action: () => { onNavigate("goals"); onOpenChange(false); } },
    { id: "dashboard", label: "Dashboard", description: "Productivity overview", icon: LayoutDashboard,
      shortcut: ["G", "D"], action: () => { onNavigate("dashboard"); onOpenChange(false); } },
    { id: "settings", label: "Settings", description: "App preferences", icon: Settings,
      shortcut: [","], action: () => { onNavigate("settings"); onOpenChange(false); } },
  ];

  const normalized = query.trim().toLowerCase();
  const filtered = commands.filter((item) => {
    if (!normalized) return true;
    return (
      item.label.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[22vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="h-4 w-4 text-text-muted shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-sm py-3.5 text-text placeholder:text-text-muted"
              autoFocus
            />
            <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-text-muted border border-border rounded-md px-1.5 py-0.5">esc</kbd>
          </div>
          <div className="max-h-[320px] overflow-y-auto py-2">
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-text-muted">No results for &quot;{query}&quot;</div>
            )}
            <div className="px-2">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={item.action}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-border-light transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-border-light flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-text-secondary" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text font-medium">{item.label}</p>
                      <p className="text-[11px] text-text-muted">{item.description}</p>
                    </div>
                    {item.shortcut && (
                      <div className="flex items-center gap-1">
                        {item.shortcut.map((key) => (
                          <kbd key={key} className="text-[10px] font-mono text-text-muted border border-border rounded-md px-1.5 py-0.5">{key}</kbd>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-text-muted">
            <span className="flex items-center gap-1.5"><kbd className="font-mono border border-border rounded-md px-1 py-0.5">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1.5"><kbd className="font-mono border border-border rounded-md px-1 py-0.5">↵</kbd> Select</span>
            <span className="flex items-center gap-1.5"><kbd className="font-mono border border-border rounded-md px-1 py-0.5">esc</kbd> Close</span>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
}
