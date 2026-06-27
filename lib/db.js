/**
 * @module db
 * @description SQLite persistence layer for the deadClock application.
 *
 * Responsibilities:
 *  - Initialise the on-disk schema (tasks, goals, chat history).
 *  - Load the complete application state from disk.
 *  - Save the complete application state back to disk atomically.
 *
 * @remarks Uses `better-sqlite3`, which provides synchronous, blocking I/O.
 *          This module MUST only be imported from server-side code (Node.js runtime).
 *          Do NOT import it from Client Components — doing so will throw at build time.
 *
 * @see {@link https://github.com/WiseLibs/better-sqlite3} better-sqlite3 documentation
 */

const Database = require("better-sqlite3");
const path = require("path");


// ─────────────────────────────────────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the SQLite database file path.
 *
 * Priority (first match wins):
 *  1. `DATABASE_PATH` environment variable  (useful for custom deployments).
 *  2. `<project-root>/data.db`             (default — checked into .gitignore).
 */
const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data.db");

/** @type {import("better-sqlite3").Database} Singleton SQLite connection kept open for the process lifetime. */
const db = new Database(dbPath);


// ─────────────────────────────────────────────────────────────────────────────
//  Schema initialisation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create all application tables if they do not already exist.
 *
 * Called exactly once at module load time (see bootstrap section at the bottom of
 * this file), so every caller that imports this module is guaranteed to see a
 * fully-initialised schema.
 *
 * Tables created:
 *  - `tasks`       Individual actionable items with priority, deadlines, and subtasks.
 *  - `goals`       Long-term objectives with milestone tracking.
 *  - `chatHistory` Chronological record of the user ↔ AI conversation.
 */
function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id            TEXT    PRIMARY KEY,
      title         TEXT    NOT NULL,
      description   TEXT,
      priority      TEXT    CHECK(priority IN ('urgent','high','medium','low')),
      deadline      TEXT    NOT NULL,
      status        TEXT    CHECK(status IN ('pending','in_progress','completed','overdue')),
      category      TEXT,
      estimatedTime TEXT,
      subtasks      TEXT,   -- JSON-serialised string[]
      createdAt     TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS goals (
      id          TEXT    PRIMARY KEY,
      title       TEXT    NOT NULL,
      description TEXT,
      deadline    TEXT    NOT NULL,
      progress    INTEGER NOT NULL DEFAULT 0,
      milestones  TEXT    -- JSON-serialised { title: string, done: boolean }[]
    );

    CREATE TABLE IF NOT EXISTS chatHistory (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      role      TEXT    NOT NULL,   -- "user" | "assistant" | "model"
      content   TEXT    NOT NULL,
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}


// ─────────────────────────────────────────────────────────────────────────────
//  Serialisation helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a JSON-encoded database field back to its native JavaScript type.
 *
 * @param {string | null} field - Raw value retrieved from the database.
 *   Typically a `JSON.stringify` output stored in a TEXT column, or NULL.
 * @returns {any} The parsed JavaScript value, or `null` when the input is null
 *   or unparseable (falls back to the raw string for legacy non-JSON data).
 */
function parseJSON(field) {
  if (!field) return null;
  try {
    return JSON.parse(field);
  } catch {
    // Graceful fallback: return raw string for legacy / corrupted data
    // rather than crashing the entire load cycle.
    return field;
  }
}

/**
 * Serialise a value for safe storage in a SQLite TEXT column.
 *
 * Arrays and objects are JSON-stringified; primitives pass through unchanged
 * so that simple string fields (title, description, etc.) are not double-wrapped.
 *
 * @param {any} val - Value to serialise.
 * @returns {string | null} A value safe to bind to a named SQL parameter.
 */
function stringifyJSON(val) {
  if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
    return JSON.stringify(val);
  }
  return val;
}


// ─────────────────────────────────────────────────────────────────────────────
//  Public state access API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load the full application state from the database.
 *
 * This is the single source of truth for the in-memory store on every API call.
 * The AI agent layer loads fresh state at the start of each turn so that
 * concurrent requests do not corrupt each other's writes.
 *
 * @returns {Object} A complete snapshot of the current application state:
 *   @property {Task[]}    tasks       - All tasks stored in the DB, with
 *     `subtasks` deserialised from JSON strings to `string[]`.
 *   @property {Goal[]}    goals       - All goals stored in the DB, with
 *     `milestones` deserialised from JSON strings to `Milestone[]`.
 *   @property {Message[]} chatHistory - Conversation messages ordered by insertion.
 */
function loadState() {
  const tasks = db
    .prepare("SELECT * FROM tasks")
    .all()
    .map((t) => ({
      ...t,
      subtasks: parseJSON(t.subtasks) || [],
    }));

  const goals = db
    .prepare("SELECT * FROM goals")
    .all()
    .map((g) => ({
      ...g,
      milestones: parseJSON(g.milestones) || [],
    }));

  // NOTE: chatHistory is not part of the single write-back transaction in
  // saveState — it is appended rather than fully replaced, so we simply
  // load rows in chronological order (id ASC = insertion order).
  const chatHistory = db
    .prepare("SELECT role, content FROM chatHistory ORDER BY id ASC")
    .all();

  return { tasks, goals, chatHistory };
}

/**
 * Atomically persist the entire application state to the database.
 *
 * Uses a single SQLite transaction, ensuring the following all-or-nothing contract:
 *  - If every INSERT succeeds → all rows are visible to the next reader.
 *  - If any INSERT fails  → NO rows are changed (SQLite rolls back the transaction).
 *
 * This prevents the store from ever landing in a state where tasks were written
 * but goals were not (or vice versa).
 *
 * @param {Object} state - Complete state object as produced by the AI agent layer.
 *   @property {Task[]}    tasks       - The definitive task list to persist.
 *   @property {Goal[]}    goals       - The definitive goal list to persist.
 *   @property {Message[]} chatHistory - Conversation history; only the most recent
 *     100 messages are retained to prevent unbounded growth over long sessions.
 */
function saveState(state) {
  db.transaction(() => {
    // Remove all existing records so the DB is an exact mirror of the
    // in-memory state (no orphan rows, no stale records from deleted tasks).
    db.prepare("DELETE FROM tasks").run();
    db.prepare("DELETE FROM goals").run();
    db.prepare("DELETE FROM chatHistory").run();

    // ── Persist tasks ──────────────────────────────────────────────────────
    const insertTask = db.prepare(`
      INSERT INTO tasks (
        id, title, description, priority, deadline,
        status, category, estimatedTime, subtasks, createdAt
      ) VALUES (
        @id, @title, @description, @priority, @deadline,
        @status, @category, @estimatedTime, @subtasks, @createdAt
      )
    `);
    for (const task of state.tasks) {
      insertTask.run({
        ...task,
        subtasks: stringifyJSON(task.subtasks),
      });
    }

    // ── Persist goals ──────────────────────────────────────────────────────
    const insertGoal = db.prepare(`
      INSERT INTO goals (
        id, title, description, deadline, progress, milestones
      ) VALUES (
        @id, @title, @description, @deadline, @progress, @milestones
      )
    `);
    for (const goal of state.goals) {
      insertGoal.run({
        ...goal,
        milestones: stringifyJSON(goal.milestones),
      });
    }

    // ── Persist chat history ───────────────────────────────────────────────
    // Cap at the most recent 100 messages.
    // Rationale: the AI's context window is finite; early messages from long
    // sessions add noise without adding signal. 100 messages is a generous
    // ceiling for most conversational sessions.
    const CHAT_HISTORY_LIMIT = 100;
    const recentHistory = state.chatHistory.slice(-CHAT_HISTORY_LIMIT);
    const insertChat = db.prepare(
      "INSERT INTO chatHistory (role, content) VALUES (@role, @content)"
    );
    for (const msg of recentHistory) {
      insertChat.run(msg);
    }
  })(); // ← immediately executes the transaction
}

/**
 * Expose the raw database connection for advanced / ad-hoc queries.
 *
 * @remarks New code should prefer `loadState` / `saveState` over direct SQL.
 *   Direct access is provided here for migration scripts, debugging, or
 *   one-off analytics queries without changing the public API surface.
 *
 * @returns {Database.Database} The singleton SQLite connection.
 */
function getDB() {
  return db;
}


// ─────────────────────────────────────────────────────────────────────────────
//  Module bootstrap
// ─────────────────────────────────────────────────────────────────────────────

/** Ensure the schema is created before any other code can use this module. */
initDB();

module.exports = { loadState, saveState, getDB };
