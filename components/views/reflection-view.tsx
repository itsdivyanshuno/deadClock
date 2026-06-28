"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReflectionViewProps {
  onSubmit: (entry: {
    wentWell: string;
    toImprove: string;
    tomorrowFocus: string;
    mood: string;
  }) => void;
  loading?: boolean;
}

const MOODS = ["😫", "😕", "😐", "🙂", "🚀"] as const;

const MOOD_LABELS: Record<string, string> = {
  "😫": "Rough day",
  "😕": "Uneasy",
  "😐": "Neutral",
  "🙂": "Good day",
  "🚀": "Amazing",
};

export function ReflectionView({ onSubmit, loading }: ReflectionViewProps) {
  const [wentWell, setWentWell] = useState("");
  const [toImprove, setToImprove] = useState("");
  const [tomorrowFocus, setTomorrowFocus] = useState("");
  const [mood, setMood] = useState("");

  const wentWellRef = useRef<HTMLTextAreaElement>(null);
  const toImproveRef = useRef<HTMLTextAreaElement>(null);
  const tomorrowFocusRef = useRef<HTMLTextAreaElement>(null);

  function autoGrow(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 4 * 24)}px`;
  }

  useEffect(() => {
    autoGrow(wentWellRef.current);
  }, [wentWell]);
  useEffect(() => {
    autoGrow(toImproveRef.current);
  }, [toImprove]);
  useEffect(() => {
    autoGrow(tomorrowFocusRef.current);
  }, [tomorrowFocus]);

  const canSubmit = wentWell.trim().length > 0 && toImprove.trim().length > 0 && tomorrowFocus.trim().length > 0 && !loading;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ wentWell: wentWell.trim(), toImprove: toImprove.trim(), tomorrowFocus: tomorrowFocus.trim(), mood });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-10"
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Moon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="display-font text-2xl font-bold text-text md:text-3xl">
          End-of-Day Reflection
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Take 2 minutes to close the loop on today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {/* What went well */}
        <div className="rounded-xl border border-border bg-surface p-5 transition-colors">
          <label
            htmlFor="went-well"
            className="mb-2 block text-sm font-medium text-text"
          >
            What went well today?
          </label>
          <textarea
            ref={wentWellRef}
            id="went-well"
            rows={1}
            maxLength={500}
            placeholder="A win, a moment of progress, something that felt good…"
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            className={cn(
              "w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted",
              "focus:border-border-strong focus:outline-none"
            )}
          />
        </div>

        {/* What could I improve */}
        <div className="rounded-xl border border-border bg-surface p-5 transition-colors">
          <label
            htmlFor="to-improve"
            className="mb-2 block text-sm font-medium text-text"
          >
            What could I improve tomorrow?
          </label>
          <textarea
            ref={toImproveRef}
            id="to-improve"
            rows={1}
            maxLength={500}
            placeholder="A friction point, a habit to shift, a lesson learned…"
            value={toImprove}
            onChange={(e) => setToImprove(e.target.value)}
            className={cn(
              "w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted",
              "focus:border-border-strong focus:outline-none"
            )}
          />
        </div>

        {/* Tomorrow focus */}
        <div className="rounded-xl border border-border bg-surface p-5 transition-colors">
          <label
            htmlFor="tomorrow-focus"
            className="mb-2 block text-sm font-medium text-text"
          >
            {"What's the one thing I'll focus on tomorrow?"}
          </label>
          <textarea
            ref={tomorrowFocusRef}
            id="tomorrow-focus"
            rows={1}
            maxLength={200}
            placeholder="Single priority that will make tomorrow count…"
            value={tomorrowFocus}
            onChange={(e) => setTomorrowFocus(e.target.value)}
            className={cn(
              "w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted",
              "focus:border-border-strong focus:outline-none"
            )}
          />
        </div>

        {/* Mood selector */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <label className="mb-3 block text-sm font-medium text-text">
            How does today feel?
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {MOODS.map((m) => {
              const selected = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  aria-label={MOOD_LABELS[m]}
                  title={MOOD_LABELS[m]}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-lg transition-all duration-150",
                    selected
                      ? "ring-2 ring-primary bg-primary/10"
                      : "hover:bg-border-light"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
            canSubmit
              ? "bg-primary text-white hover:shadow-lg hover:shadow-primary/20"
              : "cursor-not-allowed bg-border-light text-text-muted"
          )}
        >
          {loading ? "Saving…" : "Save reflection"}
        </button>
      </form>
    </motion.div>
  );
}
