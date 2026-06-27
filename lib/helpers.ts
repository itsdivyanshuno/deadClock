/**
 * Shared helpers — single source of truth for constants and small utilities
 * used across the deadClock UI layer.
 *
 * Importing from here eliminates duplicated logic that previously lived
 * independently in sidebar, tasks-view, goals-view, and dashboard-overview.
 */

/* ── Priority sort order ────────────────────────────────────────────────── */

/** Maps priority level to a numeric sort key (lower = higher priority). */
export const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/* ── Date helpers ───────────────────────────────────────────────────────── */

/**
 * Returns `true` if the given ISO deadline has already passed.
 */
export function isOverdue(deadline: string): boolean {
  return new Date(deadline) < new Date();
}

/**
 * Formats a deadline as a short display string.
 *
 * Uses `en-US` locale consistently across all UI components so AI-generated
 * dates and UI dates look identical.
 */
export function formatDeadline(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a deadline including the year (used for goal cards where the
 * year provides useful context).
 */
export function formatDeadlineFull(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Sort tasks so active tasks come first, then by priority, then by deadline.
 * Completed tasks sink to the bottom.
 */
export function sortTasks(a: { status: string; priority: string; deadline: string }, b: { status: string; priority: string; deadline: string }): number {
  const aPending = a.status === "completed" ? 1 : 0;
  const bPending = b.status === "completed" ? 1 : 0;
  if (aPending !== bPending) return aPending - bPending;
  return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
}

/**
 * Counts tasks matching a status filter.
 */
export function countByStatus(tasks: Array<{ status: string }>, status: string): number {
  return tasks.filter((t) => t.status === status).length;
}
