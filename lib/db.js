/**
 * @module db
 * @description SQLite persistence layer for the deadClock application.
 *
 * Resilience contract (v2 — named-param safety):
 * Every task row inserted via `saveState()` goes through `normalizeTask()`
 * before hitting SQLite.  This guarantees all optional fields required by
 * the INSERT's named parameters (`@completedAt`, `@subtasks`, …) are present
 * with safe defaults, preventing the `RangeError: Missing named parameter`
 * that occurred when the AI agent created tasks without `completedAt`.
 *
 * Responsibilities:
 * - Initialise the on-disk schema (tasks, goals, chat history, analytics tables).
 * - Load the complete application state from disk.
 * - Save the complete application state back to disk atomically.
 * - Provide analytics helpers: streak computation, daily logs, achievement queries.
 *
 * @remarks Uses `better-sqlite3`, which provides synchronous, blocking I/O.
 * This module MUST only be imported from server-side code (Node.js runtime).
 * Do NOT import it from Client Components — doing so will throw at build time.
 *
 * @see {@link https://github.com/WiseLibs/better-sqlite3} better-sqlite3 documentation
 */

const Database = require("better-sqlite3");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the SQLite database file path.
 *
 * Priority (first match wins):
 * 1. `DATABASE_PATH` environment variable (useful for custom deployments).
 * 2. `<project-root>/data.db` (default — checked into .gitignore).
 */
const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data.db");

/** @type {import("better-sqlite3").Database} Singleton SQLite connection kept open for the process lifetime. */
const db = new Database(dbPath);

// ─────────────────────────────────────────────────────────────────────────────
// Schema initialisation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create all application tables if they do not already exist.
 *
 * Called exactly once at module load time (see bootstrap section at the bottom of
 * this file), so every caller that imports this module is guaranteed to see a
 * fully-initialised schema.
 *
 * @remarks The `tasks` table accepts `null` for optional TEXT columns.
 * `normalizeTask()` guarantees that rows inserted by `saveState()` always
 * provide explicit values matching the schema's nullable columns.
 */
function initDB() {
  db.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('urgent','high','medium','low')),
    deadline TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending','in_progress','completed','overdue')),
    category TEXT,
    estimatedTime TEXT,
    subtasks TEXT, -- JSON-serialised string[]
    completedAt TEXT, -- ISO date when task was completed (nullable until completion)
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  milestones TEXT -- JSON-serialised { title: string, done: boolean }[]
);
CREATE TABLE IF NOT EXISTS chatHistory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS daily_logs (
  date TEXT PRIMARY KEY,
  tasksCompleted INTEGER NOT NULL DEFAULT 0,
  tasksCreated INTEGER NOT NULL DEFAULT 0,
  focusMinutes INTEGER NOT NULL DEFAULT 0,
  categoryBreakdown TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS user_stats (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  currentStreak INTEGER NOT NULL DEFAULT 0,
  longestStreak INTEGER NOT NULL DEFAULT 0,
  totalCompletions INTEGER NOT NULL DEFAULT 0,
  lastActiveDate TEXT,
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlockedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

  // Bootstrap singleton stats row if missing
  db.prepare("INSERT OR IGNORE INTO user_stats (id) VALUES (1)").run();
}

// ─────────────────────────────────────────────────────────────────────────────
// Task canonical schema normaliser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default values used when an incoming task object is missing optional fields.
 *
 * These defaults are applied uniformly — regardless of whether the missing field
 * arrived because:
 *   - the AI agent's `add_task` / `break_down_goal` tools didn't supply it,
 *   - a legacy DB row has a NULL column (pre-fix data),
 *   - or a caller constructed a task object ad-hoc.
 */
const TASK_DEFAULTS = Object.freeze({
  completedAt: null,
  subtasks: [],
  priority: "medium",
  category: "General",
  estimatedTime: "1 hour",
});

/**
 * Normalise a raw task object so it always conforms to the canonical schema
 * expected by `saveState()`'s named-parameter INSERT.
 *
 * Rules:
 *   - `subtasks` is always an array (never `undefined` / `null`)
 *   - `completedAt` is always `null` for incomplete tasks, ISO string for completed
 *   - `priority` falls back to `"medium"` when absent or invalid
 *   - `category` falls back to `"General"` when absent
 *   - `estimatedTime` falls back to `"1 hour"` when absent
 *   - `description` defaults to `""` when absent
 *   - `status` falls back to `"pending"` when absent or invalid
 *
 * @param {object} task - Raw task object (may be incomplete, from AI or legacy DB)
 * @returns {object} A fully-shaded task object safe for SQLite INSERT
 */
function normalizeTask(task) {
  if (!task || typeof task !== "object") return { ...TASK_DEFAULTS };

  const raw = task;

  // Normalise subtasks — must be an array for JSON serialisation + UI rendering
  const subtasks = Array.isArray(raw.subtasks) ? raw.subtasks : TASK_DEFAULTS.subtasks;

  // Normalise priority — clamp to valid enum
  const validPriorities = ["urgent", "high", "medium", "low"];
  const priority = validPriorities.includes(raw.priority) ? raw.priority : TASK_DEFAULTS.priority;

  // Normalise status — clamp to valid enum
  const validStatuses = ["pending", "in_progress", "completed", "overdue"];
  const status = validStatuses.includes(raw.status) ? raw.status : "pending";

  // completedAt: only set when the task is actually completed
  // When re-normalising a task that is already completed but has no timestamp,
  // fall back to null (best-effort — the completion recordCompletion() flow
  // will set it via UPDATE when the user marks it done through the UI).
  const completedAt =
    status === "completed" && raw.completedAt ? raw.completedAt : null;

  return {
    id: raw.id,
    title: raw.title ?? "Untitled Task",
    description: raw.description ?? "",
    priority,
    deadline: raw.deadline ?? new Date().toISOString(),
    status,
    category: raw.category ?? TASK_DEFAULTS.category,
    estimatedTime: raw.estimatedTime ?? TASK_DEFAULTS.estimatedTime,
    subtasks,
    completedAt,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Normalise a raw goal object so optional fields have safe defaults.
 *
 * @param {object} goal - Raw goal object (may be incomplete)
 * @returns {object} A fully-shaded goal object safe for SQLite INSERT
 */
function normalizeGoal(goal) {
  if (!goal || typeof goal !== "object") {
    return { milestones: [], progress: 0 };
  }
  const raw = goal;
  const milestones = Array.isArray(raw.milestones)
    ? raw.milestones.map((m) =>
        typeof m === "object" && m !== null
          ? { title: m.title ?? "", done: Boolean(m.done) }
          : { title: String(m ?? ""), done: false }
      )
    : [];
  return {
    id: raw.id,
    title: raw.title ?? "Untitled Goal",
    description: raw.description ?? "",
    deadline: raw.deadline ?? new Date().toISOString(),
    progress: typeof raw.progress === "number" ? raw.progress : 0,
    milestones,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Serialisation helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseJSON(field) {
  if (!field) return null;
  try {
    return JSON.parse(field);
  } catch {
    return field;
  }
}

function stringifyJSON(val) {
  if (Array.isArray(val) || (typeof val === "object" && val !== null))
    return JSON.stringify(val);
  return val;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public state access API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load the full application state from SQLite.
 *
 * @remarks Legacy rows with NULL columns are back-filled with sensible
 * defaults via `normalizeTask()` / `normalizeGoal()` so downstream consumers
 * (components, agent orchestrator) always receive fully-shaded objects.
 *
 * @returns {{ tasks: object[], goals: object[], chatHistory: object[] }}
 */
function loadState() {
  const tasks = db
    .prepare("SELECT * FROM tasks")
    .all()
    .map((t) => normalizeTask(t));

  const goals = db
    .prepare("SELECT * FROM goals")
    .all()
    .map((g) => normalizeGoal(g));

  const chatHistory = db
    .prepare("SELECT role, content FROM chatHistory ORDER BY id ASC")
    .all();

  return { tasks, goals, chatHistory };
}

/**
 * Atomically persist the full application state to SQLite.
 *
 * Strategy: wipe all rows → re-insert normalised objects in a single transaction.
 *
 * @remarks Every task in `state.tasks` is run through `normalizeTask()` before
 * the INSERT, eliminating the `RangeError: Missing named parameter` crash
 * that occurred when the AI agent created tasks without optional fields like
 * `completedAt`.
 *
 * @param {{ tasks: object[], goals: object[], chatHistory: object[] }} state
 */
function saveState(state) {
  db.transaction(() => {
    db.prepare("DELETE FROM tasks").run();
    db.prepare("DELETE FROM goals").run();
    db.prepare("DELETE FROM chatHistory").run();

    // ── Insert tasks (normalise every row before INSERT) ──────────────────
    const insertTask = db.prepare(
      `INSERT INTO tasks (id, title, description, priority, deadline,
       status, category, estimatedTime, subtasks, completedAt, createdAt)
       VALUES (@id, @title, @description, @priority, @deadline,
       @status, @category, @estimatedTime, @subtasks, @completedAt, @createdAt)`
    );

    for (const rawTask of state.tasks) {
      const task = normalizeTask(rawTask);
      insertTask.run({
        ...task,
        subtasks: stringifyJSON(task.subtasks),
      });
    }

    // ── Insert goals (normalise every row before INSERT) ──────────────────
    const insertGoal = db.prepare(
      `INSERT INTO goals (id, title, description, deadline, progress, milestones)
       VALUES (@id, @title, @description, @deadline, @progress, @milestones)`
    );

    for (const rawGoal of state.goals) {
      const goal = normalizeGoal(rawGoal);
      insertGoal.run({
        ...goal,
        milestones: stringifyJSON(goal.milestones),
      });
    }

    // ── Insert chat history (cap at last 100 messages) ────────────────────
    const CHAT_HISTORY_LIMIT = 100;
    const recentHistory = state.chatHistory.slice(-CHAT_HISTORY_LIMIT);
    const insertChat = db.prepare(
      "INSERT INTO chatHistory (role, content) VALUES (@role, @content)"
    );
    for (const msg of recentHistory) insertChat.run(msg);
  })();
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record today's activity in daily_logs and update streak counters.
 * Called after each successful task completion via the API.
 */
function recordCompletion(task) {
  const today = new Date().toISOString().slice(0, 10);
  const category = task.category || "General";

  db.transaction(() => {
    // Upsert daily log with category breakdown
    db.prepare(
      `INSERT INTO daily_logs (date, tasksCompleted, categoryBreakdown)
       VALUES (@date, 1, @breakdown)
       ON CONFLICT(date) DO UPDATE SET
         tasksCompleted = tasksCompleted + 1,
         categoryBreakdown = json_set(
           COALESCE(daily_logs.categoryBreakdown, '{}'),
           @catPath,
           json_extract(COALESCE(daily_logs.categoryBreakdown, '{}'), @catPath) + 1
         )`
    ).run({
      date: today,
      breakdown: JSON.stringify({ [category]: 1 }),
      catPath: `$.${category}`,
    });

    // Update task completedAt timestamp
    db.prepare(
      "UPDATE tasks SET completedAt = @ts WHERE id = @id"
    ).run({
      ts: new Date().toISOString(),
      id: task.id,
    });

    // Update streak counters
    const yesterday = new Date(Date.now() - 864e5)
      .toISOString()
      .slice(0, 10);

    db.prepare(
      `UPDATE user_stats SET
        totalCompletions = totalCompletions + 1,
        currentStreak = CASE
          WHEN lastActiveDate = @today THEN currentStreak
          WHEN lastActiveDate = @yesterday THEN currentStreak + 1
          ELSE 1
        END,
        longestStreak = MAX(longestStreak,
          CASE
            WHEN lastActiveDate = @today THEN currentStreak
            WHEN lastActiveDate = @yesterday THEN currentStreak + 1
            ELSE 1
          END
        ),
        lastActiveDate = @today,
        updatedAt = datetime('now')
      WHERE id = 1`
    ).run({ today, yesterday });
  })();

  checkAchievements();
}

/** @returns {number} Current consecutive-day streak */
function getCurrentStreak() {
  const row = db.prepare("SELECT currentStreak FROM user_stats WHERE id = 1").get();
  return row?.currentStreak ?? 0;
}

/** @returns {number} All-time best streak */
function getLongestStreak() {
  const row = db.prepare("SELECT longestStreak FROM user_stats WHERE id = 1").get();
  return row?.longestStreak ?? 0;
}

/** @returns {number} Total tasks completed all time */
function getTotalCompletions() {
  const row = db.prepare("SELECT totalCompletions FROM user_stats WHERE id = 1").get();
  return row?.totalCompletions ?? 0;
}

/**
 * @returns {Array<{date: string, count: number}>} Heatmap data for last 365 days
 */
function getHeatmapData() {
  const today = new Date().toISOString().slice(0, 10);
  const yearAgo = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
  return db
    .prepare(
      "SELECT date, tasksCompleted as count FROM daily_logs WHERE date >= @from ORDER BY date ASC"
    )
    .all({ from: yearAgo });
}

/** @returns {Array<{date: string, tasksCompleted: number, focusMinutes: number}>} */
function getDailyLogs(days = 30) {
  return db
    .prepare(
      `SELECT date, tasksCompleted, focusMinutes FROM daily_logs
       ORDER BY date DESC LIMIT @limit`
    )
    .all({ limit: days })
    .reverse();
}

/** @returns {Array<{id: string, title: string, description: string, icon: string, unlockedAt: string}>} */
function getAchievements() {
  return db.prepare("SELECT * FROM achievements ORDER BY unlockedAt DESC").all();
}

/** Unlock a new achievement if not already unlocked. */
function unlockAchievement(id, title, description, icon) {
  db.prepare(
    "INSERT OR IGNORE INTO achievements (id, title, description, icon) VALUES (?, ?, ?, ?)"
  ).run(id, title, description, icon);
}

/** Map of achievement definitions keyed by slug */
const ACHIEVEMENT_DEFS = Object.freeze({
  first_task: { title: "Getting Started", description: "Complete your first task", icon: "CheckCircle2" },
  five_tasks: { title: "On a Roll", description: "Complete 5 tasks in one day", icon: "Zap" },
  ten_tasks: { title: "Productivity Beast", description: "Complete 10 tasks in one day", icon: "Flame" },
  streak_3: { title: "3-Day Streak", description: "Stay active for 3 consecutive days", icon: "Flame" },
  streak_7: { title: "Week Warrior", description: "A full week of activity", icon: "Trophy" },
  streak_14: { title: "Two Fortnights", description: "14-day streak achieved", icon: "Award" },
  streak_30: { title: "Unstoppable", description: "30 days of consistent activity", icon: "Crown" },
  first_goal: { title: "Goal Setter", description: "Set your first long-term goal", icon: "Target" },
  goal_half: { title: "Halfway There", description: "Reach 50% on any goal", icon: "TrendingUp" },
  goal_complete: { title: "Goal Crusher", description: "Fully complete a goal", icon: "Star" },
});

function checkAchievements() {
  const stats = db.prepare("SELECT totalCompletions, currentStreak FROM user_stats WHERE id = 1").get();
  const tasks = db.prepare("SELECT * FROM tasks").all();
  const goals = db.prepare("SELECT * FROM goals").all();
  const today = new Date().toISOString().slice(0, 10);
  const totalToday = db.prepare("SELECT tasksCompleted FROM daily_logs WHERE date = ?").get(today)?.tasksCompleted ?? 0;

  const checks = {
    first_task: stats.totalCompletions >= 1,
    five_tasks: totalToday >= 5,
    ten_tasks: totalToday >= 10,
    streak_3: stats.currentStreak >= 3,
    streak_7: stats.currentStreak >= 7,
    streak_14: stats.currentStreak >= 14,
    streak_30: stats.currentStreak >= 30,
    first_goal: goals.length >= 1,
    goal_half: goals.some((g) => (g.progress || 0) >= 50),
    goal_complete: goals.some((g) => (g.progress || 100) >= 100),
  };

  for (const [slug, def] of Object.entries(ACHIEVEMENT_DEFS)) {
    if (checks[slug]) unlockAchievement(slug, def.title, def.description, def.icon);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw DB access for ad-hoc analytics queries
// ─────────────────────────────────────────────────────────────────────────────

function getDB() {
  return db;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module bootstrap
// ─────────────────────────────────────────────────────────────────────────────

initDB();

module.exports = {
  loadState,
  saveState,
  getDB,
  // Normalizers — exported so other modules (and tests) can use them
  normalizeTask,
  normalizeGoal,
  // Analytics
  getCurrentStreak,
  getLongestStreak,
  getTotalCompletions,
  recordCompletion,
  getHeatmapData,
  getDailyLogs,
  getAchievements,
  unlockAchievement,
  checkAchievements,
};
