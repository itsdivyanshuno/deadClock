"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, CheckCircle2, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyLog {
  date: string;
  tasksCompleted: number;
  focusMinutes: number;
}

interface HeatmapViewProps {
  dailyLogs: DailyLog[];
}

function dateFromString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateMonth(dateStr: string): string {
  const d = dateFromString(dateStr);
  return d.toLocaleString("en-US", { month: "short" });
}

function getCellColor(tasksCompleted: number): string {
  if (tasksCompleted === 0) return "bg-border-light";
  if (tasksCompleted === 1) return "bg-success/30";
  if (tasksCompleted <= 3) return "bg-success/50";
  return "bg-success";
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = 6;

export function HeatmapView({ dailyLogs }: HeatmapViewProps) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Build a lookup map from date-string to log data
  const logMap = new Map<string, DailyLog>();
  for (const log of dailyLogs) {
    logMap.set(log.date, log);
  }

  // Generate week columns, each starting on Monday
  const columns: Array<Array<{ date: Date; dateStr: string; log?: DailyLog }>> = [];

  // Grid start = Monday of the week (WEEKS-1) weeks ago.
  // Was buggy: added WEEKS*7 days into the future, pushing the entire grid
  // past today so all seed activity (Jun 9–28) fell outside the visible window.
  const gridStart = new Date(today);
  gridStart.setDate(
    gridStart.getDate() - ((gridStart.getDay() + 6) % 7) - (WEEKS - 1) * 7
  );

  for (let w = 0; w < WEEKS; w++) {
    const weekCol: Array<{ date: Date; dateStr: string; log?: DailyLog }> = [];
    const weekMonday = new Date(gridStart);
    weekMonday.setDate(weekMonday.getDate() + w * 7);

    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(weekMonday);
      cellDate.setDate(cellDate.getDate() + d);
      // Skip cells beyond today
      if (cellDate > today) {
        weekCol.push({ date: cellDate, dateStr: "" });
        continue;
      }
      const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;
      weekCol.push({ date: cellDate, dateStr, log: logMap.get(dateStr) });
    }
    columns.push(weekCol);
  }

  // Stats computation
  const totalSessions = dailyLogs.length;
  const totalFocusMinutes = dailyLogs.reduce((sum, log) => sum + log.focusMinutes, 0);
  const avgMinutesPerDay = totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;

  const dayTotals = new Map<string, number>();
  for (const log of dailyLogs) {
    const d = dateFromString(log.date);
    const dayName = d.toLocaleString("en-US", { weekday: "long" });
    dayTotals.set(dayName, (dayTotals.get(dayName) ?? 0) + log.tasksCompleted);
  }
  let mostProductiveDay: string | null = null;
  let maxDayTotal = 0;
  dayTotals.forEach((total, day) => {
    if (total > maxDayTotal) {
      maxDayTotal = total;
      mostProductiveDay = day;
    }
  });

  // Format duration display
  const formatMinutes = (mins: number): string => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.03 },
    },
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.7 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
  } as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="display-font rounded-xl border border-border bg-surface p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text tracking-tight">
          Activity Heatmap
        </h2>
        <span className="text-xs text-text-muted">
          Last {WEEKS} weeks
        </span>
      </div>

      {/* Grid */}
      <div className="relative">
        {/* Day-of-week labels */}
        <div className="flex gap-1 mb-1 ml-7">
          {columns.map((_, colIdx) => (
            <div key={`spacer-${colIdx}`} className="flex-1" />
          ))}
        </div>

        <div className="flex gap-1">
          {/* Row labels — all 7 days visible */}
          <div className="flex flex-col gap-1 mr-1 pt-0">
            {DAY_NAMES.map((day, i) => (
              <div
                key={day}
                className="h-2.5 w-2.5 flex items-center justify-center"
              >
                <span className="text-[9px] text-text-muted leading-none -translate-x-0.5">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Column groups */}
          <div className="flex gap-1 flex-1">
            {columns.map((week, colIdx) => {
              // Label the first cell of each week with a month header
              const firstVisible = week.find((c) => c.dateStr);
              const showMonth = firstVisible &&
                (colIdx === 0 ||
                  (firstVisible.date.getDate() <= 7 &&
                    firstVisible.date.getDate() >= 1));

              return (
                <div key={`week-${colIdx}`} className="flex-1 flex flex-col gap-1">
                  {showMonth && firstVisible && (
                    <div className="text-[9px] text-text-muted h-3 leading-none mb-0.5">
                      {formatDateMonth(firstVisible.dateStr)}
                    </div>
                  )}
                  {/* Spacer if no month shown */}
                  {!showMonth && <div className="h-3 mb-0.5" />}

                  {/* Day cells */}
                  {week.map((cell, dIdx) => (
                    <motion.div
                      key={`${colIdx}-${dIdx}-${cell.dateStr || "gap"}`}
                      variants={cellVariants}
                      className={cn(
                        "h-2.5 w-full rounded-sm",
                        cell.dateStr === "" && "bg-transparent",
                        cell.dateStr !== "" && getCellColor(cell.log?.tasksCompleted ?? 0),
                      )}
                    >
                      {/* CSS-only tooltip */}
                      {cell.dateStr && (
                        <span className="group relative">
                          {/* Invisible hit area */}
                          <span className="absolute inset-0" />

                          {/* Tooltip bubble — appears on cell group-hover */}
                          <span
                            className={cn(
                              "pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5",
                              "hidden group-hover:flex flex-col items-center",
                              "whitespace-nowrap rounded-md px-2 py-1.5",
                              "bg-[#1c1917] text-[10px] text-white shadow-lg",
                              "after:content-[''] after:absolute after:top-full",
                              "after:left-1/2 after:-translate-x-1/2",
                              "after:border-4 after:border-transparent",
                              "after:border-t-[#1c1917]",
                            )}
                          >
                            <span className="font-medium">
                              {cell.date.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span
                              className={cn(
                                "mt-0.5",
                                (cell.log?.tasksCompleted ?? 0) > 0
                                  ? "text-success"
                                  : "text-stone-400",
                              )}
                            >
                              {cell.log?.tasksCompleted ?? 0} task{(cell.log?.tasksCompleted ?? 0) !== 1 ? "s" : ""} completed
                            </span>
                            <span className="text-stone-400">
                              {cell.log
                                ? formatMinutes(cell.log.focusMinutes) + " focused"
                                : "No activity"}
                            </span>
                          </span>
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day-of-week row headers */}
      <div className="flex gap-1 mt-1 ml-7">
        {columns.map((_, colIdx) => (
          <div key={`spacer-bottom-${colIdx}`} className="flex-1" />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 ml-7">
        <span className="text-[10px] text-text-muted shrink-0">Less</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-border-light" />
        <div className="h-2.5 w-2.5 rounded-sm bg-success/30" />
        <div className="h-2.5 w-2.5 rounded-sm bg-success/50" />
        <div className="h-2.5 w-2.5 rounded-sm bg-success" />
        <span className="text-[10px] text-text-muted">More</span>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatItem
          icon={<Flame className="h-3.5 w-3.5 text-accent" />}
          label="Total Sessions"
          value={totalSessions.toString()}
        />
        <StatItem
          icon={<Flame className="h-3.5 w-3.5 text-accent" />}
          label="Focus Minutes"
          value={formatMinutes(totalFocusMinutes)}
        />
        <StatItem
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />}
          label="Avg / Day"
          value={`${avgMinutesPerDay}m`}
        />
        <StatItem
          icon={<Trophy className="h-3.5 w-3.5 text-warning" />}
          label="Top Day"
          value={mostProductiveDay ?? "—"}
        />
      </motion.div>
    </motion.div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border-light bg-raised px-3 py-2">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-text tracking-tight">{value}</p>
    </div>
  );
}
