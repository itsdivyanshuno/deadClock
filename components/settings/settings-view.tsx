"use client";

import { motion } from "framer-motion";
import { Settings2, Moon, Sun, Keyboard } from "lucide-react";

interface SettingsViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function SettingsView({ darkMode, onToggleDarkMode }: SettingsViewProps) {
  return (
    <div className="h-full flex flex-col">
      <header className="px-6 lg:px-8 py-5 border-b border-border bg-surface/70 backdrop-blur-md shrink-0">
        <h2 className="display-font text-xl text-text leading-none">Settings</h2>
        <p className="text-[13px] text-text-secondary mt-1">
          App preferences and shortcuts
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-xl space-y-6">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <h3 className="text-sm font-semibold text-text mb-4">Appearance</h3>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-4 w-full p-4 rounded-lg border border-border hover:border-border-strong hover:bg-border-light/50 transition-all cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-border-light flex items-center justify-center">
                {darkMode ? (
                  <Sun className="h-5 w-5 text-text" strokeWidth={2} />
                ) : (
                  <Moon className="h-5 w-5 text-text" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-text">
                  {darkMode ? "Light mode" : "Dark mode"}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Currently using {darkMode ? "dark" : "light"} theme
                </p>
              </div>
              <div className="h-6 w-12 rounded-full bg-border-light relative transition-colors">
                <div
                  className={`absolute top-1 h-4 w-4 rounded-full bg-primary transition-all ${
                    darkMode ? "left-6" : "left-1"
                  }`}
                />
              </div>
            </button>
          </motion.div>

          {/* Keyboard shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-text">Keyboard shortcuts</h3>
            </div>
            <div className="space-y-3">
              <ShortcutRow keys={["⌘", "K"]} label="Open command palette" />
              <ShortcutRow keys={["Enter"]} label="Send message" />
              <ShortcutRow keys={["Shift", "Enter"]} label="New line in chat" />
              <ShortcutRow keys={["Esc"]} label="Close palette / dialog" />
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <h3 className="text-sm font-semibold text-text mb-2">About</h3>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-text flex items-center justify-center">
                <Settings2 className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium text-text">
                  dead<span className="text-accent">Clock</span>
                </p>
                <p className="text-xs text-text-muted">v1.0 · Last-minute life saver</p>
              </div>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              AI-powered productivity companion built with Next.js, Google Gemini,
              and Framer Motion. All data is stored locally in your browser.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="text-[10px] font-mono text-text-muted border border-border rounded-md px-1.5 py-0.5 bg-border-light/50"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
