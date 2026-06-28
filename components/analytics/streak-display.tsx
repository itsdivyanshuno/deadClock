"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakData {
  current: number;
  longest: number;
  totalCompletions: number;
  achievements: Array<{ title: string; icon?: string; unlockedAt?: string }>;
}

export function StreakDisplay({ data }: { data: StreakData }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame
          className={`h-4 w-4 ${
            data.current >= 7
              ? "text-warning"
              : data.current >= 3
                ? "text-accent"
                : "text-text-muted"
          }`}
          strokeWidth={2}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Streak
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatBox label="Current" value={`${data.current}d`} highlight />
        <StatBox label="Best" value={`${data.longest}d`} />
        <StatBox label="Done" value={String(data.totalCompletions)} />
      </div>

      {data.achievements.length > 0 && (
        <div className="space-y-1.5">
          {data.achievements.slice(0, 4).map((a) => (
            <div key={a.title} className="flex items-center gap-2">
              <span className="text-sm">{a.icon}</span>
              <span className="text-[11px] text-text-secondary truncate">{a.title}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center py-1.5 rounded-lg ${
        highlight ? "bg-accent-soft/60" : "bg-border-light/60"
      }`}
    >
      <span
        className={`text-sm font-bold tabular-nums ${
          highlight ? "text-accent" : "text-text"
        }`}
      >
        {value}
      </span>
      <span className="text-[9px] text-text-muted uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
