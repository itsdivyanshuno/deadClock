/**
 * @module db
 * @description Remote SQLite persistence via Turso (libSQL).
 *
 * Uses @libsql/client high-level API:
 *   - client.execute(sql, params?) — returns { rows, rowsAffected, lastInsertRowid }
 *   - client.batch([{sql, params}, ...])) — multiple ops in one round-trip
 *   No prepare()/run()/get()/all() chain.
 */

const { createClient } = require("@libsql/client");

// ── Config ──────────────────────────────────────────────────────────────────
const TURSO_URL = process.env.TURSO_DB_URL || null;
const TURSO_TOKEN = process.env.TURSO_DB_TOKEN || null;

let dbPromise = null;

async function getClient() {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    if (TURSO_URL && TURSO_TOKEN) {
      const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
      await bootstrapSchema(client);
      return client;
    }
    console.warn("[db] No TURSO_DB_URL/TOKEN - using local .local.db fallback");
    const Database = require("better-sqlite3");
    const path = require("path");
    const local = new Database(path.join(process.cwd(), ".local.db"));
    bootstrapSchemaSync(local);
    // Wrap sync DB in the same async interface used by the Turso path
    return {
      execute(sql, params) {
        const stmt = local.prepare(sql);
        const r = stmt.run(params);
        return Promise.resolve({ rows: [], rowsAffected: r.changes, lastInsertRowid: r.lastInsertRowid });
      },
      batch(stmts) {
        return Promise.resolve(stmts.map(s => {
          const stmt = local.prepare(s.sql);
          return stmt.run(s.params);
        }));
      },
      prepare(sql) {
        const stmt = local.prepare(sql);
        return {
          run: (...a) => Promise.resolve(stmt.run(...a)),
          get: (...a) => Promise.resolve(stmt.get(...a)),
          all: (...a) => Promise.resolve(stmt.all(...a)),
        };
      },
    };
  })();
  return dbPromise;
}

// ── Schema bootstrap (Turso) ─────────────────────────────────────────────────
// Each CREATE TABLE is a separate execute() call.
// @libsql/client does NOT allow multiple statements per execute().

async function bootstrapSchema(client) {
  await client.execute(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    priority TEXT CHECK(priority IN ('urgent','high','medium','low')),
    deadline TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending','in_progress','completed','overdue')),
    category TEXT, estimatedTime TEXT, subtasks TEXT, completedAt TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    deadline TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0, milestones TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS chatHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL,
    content TEXT NOT NULL, timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS daily_logs (
    date TEXT PRIMARY KEY, tasksCompleted INTEGER NOT NULL DEFAULT 0,
    tasksCreated INTEGER NOT NULL DEFAULT 0, focusMinutes INTEGER NOT NULL DEFAULT 0,
    categoryBreakdown TEXT, createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1), currentStreak INTEGER NOT NULL DEFAULT 0,
    longestStreak INTEGER NOT NULL DEFAULT 0, totalCompletions INTEGER NOT NULL DEFAULT 0,
    lastActiveDate TEXT, updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, icon TEXT,
    unlockedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await client.execute("INSERT OR IGNORE INTO user_stats (id) VALUES (1)");
}

// ── Schema bootstrap (local file fallback) ────────────────────────────────────

function bootstrapSchemaSync(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
      priority TEXT CHECK(priority IN ('urgent','high','medium','low')),
      deadline TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending','in_progress','completed','overdue')),
      category TEXT, estimatedTime TEXT, subtasks TEXT, completedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
      deadline TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0, milestones TEXT
    );
    CREATE TABLE IF NOT EXISTS chatHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL,
      content TEXT NOT NULL, timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS daily_logs (
      date TEXT PRIMARY KEY, tasksCompleted INTEGER NOT NULL DEFAULT 0,
      tasksCreated INTEGER NOT NULL DEFAULT 0, focusMinutes INTEGER NOT NULL DEFAULT 0,
      categoryBreakdown TEXT, createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1), currentStreak INTEGER NOT NULL DEFAULT 0,
      longestStreak INTEGER NOT NULL DEFAULT 0, totalCompletions INTEGER NOT NULL DEFAULT 0,
      lastActiveDate TEXT, updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, icon TEXT,
      unlockedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.prepare("INSERT OR IGNORE INTO user_stats (id) VALUES (1)").run();
}

// ── Task/Goal normalisation (pure logic, unchanged) ──────────────────────────

const TASK_DEFAULTS = Object.freeze({
  completedAt: null, subtasks: [], priority: "medium",
  category: "General", estimatedTime: "1 hour",
});

function normalizeTask(task) {
  if (!task || typeof task !== "object") return { ...TASK_DEFAULTS };
  const raw = task;
  const subtasks = Array.isArray(raw.subtasks) ? raw.subtasks : TASK_DEFAULTS.subtasks;
  const validPriorities = ["urgent","high","medium","low"];
  const priority = validPriorities.includes(raw.priority) ? raw.priority : TASK_DEFAULTS.priority;
  const validStatuses = ["pending","in_progress","completed","overdue"];
  const status = validStatuses.includes(raw.status) ? raw.status : "pending";
  const completedAt = (status === "completed" && raw.completedAt) ? raw.completedAt : null;
  return {
    id: raw.id, title: raw.title ?? "Untitled Task", description: raw.description ?? "",
    priority, deadline: raw.deadline ?? new Date().toISOString(), status,
    category: raw.category ?? TASK_DEFAULTS.category,
    estimatedTime: raw.estimatedTime ?? TASK_DEFAULTS.estimatedTime,
    subtasks, completedAt,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

function normalizeGoal(goal) {
  if (!goal || typeof goal !== "object") return { milestones: [], progress: 0 };
  const raw = goal;
  const milestones = Array.isArray(raw.milestones)
    ? raw.milestones.map(m => typeof m === "object" && m !== null
        ? { title: m.title ?? "", done: Boolean(m.done) }
        : { title: String(m ?? ""), done: false })
    : Array.isArray(parseJSON(raw.milestones))
      ? parseJSON(raw.milestones).map(m => typeof m === "object" && m !== null
          ? { title: m.title ?? "", done: Boolean(m.done) }
          : { title: String(m ?? ""), done: false })
      : [];
  return {
    id: raw.id, title: raw.title ?? "Untitled Goal", description: raw.description ?? "",
    deadline: raw.deadline ?? new Date().toISOString(),
    progress: typeof raw.progress === "number" ? raw.progress : 0, milestones,
  };
}

function parseJSON(field) {
  if (!field) return null;
  try { return JSON.parse(field); } catch { return field; }
}

function stringifyJSON(val) {
  if (Array.isArray(val) || (typeof val === "object" && val !== null)) return JSON.stringify(val);
  return val;
}

// ── Public state API (all async, using client.execute) ───────────────────────

async function loadState() {
  const db = await getClient();

  const tasks = (await db.execute("SELECT * FROM tasks")).rows.map(normalizeTask);
  const goals = (await db.execute("SELECT * FROM goals")).rows.map(normalizeGoal);
  const chatHistory = (await db.execute("SELECT role, content FROM chatHistory ORDER BY id ASC")).rows;

  return { tasks, goals, chatHistory };
}

async function saveState(state) {
  const db = await getClient();

  await db.execute("DELETE FROM tasks");
  await db.execute("DELETE FROM goals");
  await db.execute("DELETE FROM chatHistory");

  for (const raw of state.tasks) {
    const t = normalizeTask(raw);
    await db.execute(
      "INSERT INTO tasks (id,title,description,priority,deadline,status,category,estimatedTime,subtasks,completedAt,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [t.id, t.title, t.description, t.priority, t.deadline, t.status, t.category, t.estimatedTime, stringifyJSON(t.subtasks), t.completedAt, t.createdAt]
    );
  }

  for (const raw of state.goals) {
    const g = normalizeGoal(raw);
    await db.execute(
      "INSERT INTO goals (id,title,description,deadline,progress,milestones) VALUES (?,?,?,?,?,?)",
      [g.id, g.title, g.description, g.deadline, g.progress, stringifyJSON(g.milestones)]
    );
  }

  for (const msg of state.chatHistory.slice(-100)) {
    await db.execute("INSERT INTO chatHistory (role, content) VALUES (?, ?)", [msg.role, msg.content]);
  }
}

// ── Analytics helpers (all async, using client.execute) ──────────────────────

async function recordCompletion(task) {
  const db = await getClient();
  const today = new Date().toISOString().slice(0,10);
  const category = task.category || "General";

  await db.execute(
    `INSERT INTO daily_logs (date,tasksCompleted,categoryBreakdown) VALUES (?,1,?)
     ON CONFLICT(date) DO UPDATE SET tasksCompleted = tasksCompleted + 1,
       categoryBreakdown = json_set(COALESCE(daily_logs.categoryBreakdown,'{}'),?,json_extract(COALESCE(daily_logs.categoryBreakdown,'{}'),?)+1)`,
    [today, JSON.stringify({[category]:1}), `$.${category}`, `$.${category}`]
  );

  await db.execute("UPDATE tasks SET completedAt = ? WHERE id = ?", [new Date().toISOString(), task.id]);

  const yesterday = new Date(Date.now()-864e5).toISOString().slice(0,10);
  await db.execute(
    `UPDATE user_stats SET totalCompletions = totalCompletions + 1,
      currentStreak = CASE WHEN lastActiveDate = ? THEN currentStreak
        WHEN lastActiveDate = ? THEN currentStreak + 1 ELSE 1 END,
      longestStreak = MAX(longestStreak, CASE WHEN lastActiveDate = ? THEN currentStreak
        WHEN lastActiveDate = ? THEN currentStreak + 1 ELSE 1 END),
      lastActiveDate = ?, updatedAt = datetime('now') WHERE id = 1`,
    [today, yesterday, today, yesterday, today]
  );

  await checkAchievements();
}

async function getCurrentStreak() {
  const row = (await db.execute("SELECT currentStreak FROM user_stats WHERE id = 1")).rows[0];
  return row?.currentStreak ?? 0;
}
async function getLongestStreak() {
  const row = (await db.execute("SELECT longestStreak FROM user_stats WHERE id = 1")).rows[0];
  return row?.longestStreak ?? 0;
}
async function getTotalCompletions() {
  const row = (await db.execute("SELECT totalCompletions FROM user_stats WHERE id = 1")).rows[0];
  return row?.totalCompletions ?? 0;
}
async function getHeatmapData() {
  const today = new Date().toISOString().slice(0,10);
  const yearAgo = new Date(Date.now()-365*864e5).toISOString().slice(0,10);
  return (await db.execute(
    "SELECT date, tasksCompleted as count, focusMinutes FROM daily_logs WHERE date >= ? ORDER BY date ASC",
    [yearAgo]
  )).rows;
}
async function getDailyLogs(days=30) {
  const rows = (await db.execute(
    "SELECT date, tasksCompleted, focusMinutes FROM daily_logs ORDER BY date DESC LIMIT ?",
    [days]
  )).rows;
  return rows.reverse();
}
async function getAchievements() {
  return (await db.execute("SELECT * FROM achievements ORDER BY unlockedAt DESC")).rows;
}
async function unlockAchievement(id, title, description, icon) {
  await db.execute(
    "INSERT OR IGNORE INTO achievements (id,title,description,icon) VALUES (?,?,?,?)",
    [id, title, description, icon]
  );
}
async function checkAchievements() {
  const db = await getClient();
  const stats = (await db.execute("SELECT totalCompletions,currentStreak FROM user_stats WHERE id = 1")).rows[0];
  const tasks = (await db.execute("SELECT * FROM tasks")).rows;
  const goals = (await db.execute("SELECT * FROM goals")).rows;
  const today = new Date().toISOString().slice(0,10);
  const totalToday = (await db.execute("SELECT tasksCompleted FROM daily_logs WHERE date = ?", [today])).rows[0]?.tasksCompleted ?? 0;
  const checks = {
    first_task: stats.totalCompletions >= 1, five_tasks: totalToday >= 5, ten_tasks: totalToday >= 10,
    streak_3: stats.currentStreak >= 3, streak_7: stats.currentStreak >= 7,
    streak_14: stats.currentStreak >= 14, streak_30: stats.currentStreak >= 30,
    first_goal: goals.length >= 1, goal_half: goals.some(g => (g.progress||0) >= 50),
    goal_complete: goals.some(g => (g.progress||100) >= 100),
  };
  const ACHIEVEMENT_DEFS = Object.freeze({
    first_task:  { title:"Getting Started", description:"Complete your first task", icon:"CheckCircle2" },
    five_tasks:  { title:"On a Roll",        description:"Complete 5 tasks in one day",  icon:"Zap" },
    ten_tasks:   { title:"Productivity Beast",description:"Complete 10 tasks in one day", icon:"Flame" },
    streak_3:    { title:"3-Day Streak",      description:"Stay active for 3 consecutive days", icon:"Flame" },
    streak_7:    { title:"Week Warrior",      description:"A full week of activity", icon:"Trophy" },
    streak_14:   { title:"Two Fortnights",    description:"14-day streak achieved", icon:"Award" },
    streak_30:   { title:"Unstoppable",       description:"30 days of consistent activity", icon:"Crown" },
    first_goal:  { title:"Goal Setter",       description:"Set your first long-term goal", icon:"Target" },
    goal_half:   { title:"Halfway There",     description:"Reach 50% on any goal", icon:"TrendingUp" },
    goal_complete:{ title:"Goal Crusher",     description:"Fully complete a goal", icon:"Star" },
  });
  for (const [slug, def] of Object.entries(ACHIEVEMENT_DEFS)) {
    if (checks[slug]) await unlockAchievement(slug, def.title, def.description, def.icon);
  }
}

async function getDB() { return await getClient(); }

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  loadState, saveState, getDB, normalizeTask, normalizeGoal,
  getCurrentStreak, getLongestStreak, getTotalCompletions,
  recordCompletion, getHeatmapData, getDailyLogs,
  getAchievements, unlockAchievement, checkAchievements,
};
