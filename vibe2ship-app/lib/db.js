const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Initialize tables
function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT,
      deadline TEXT,
      status TEXT,
      category TEXT,
      estimatedTime TEXT,
      subtasks TEXT,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      progress INTEGER,
      milestones TEXT
    );
    CREATE TABLE IF NOT EXISTS chatHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Helper to parse JSON fields safely
function parseJSON(field) {
  if (!field) return null;
  try {
    return JSON.parse(field);
  } catch (e) {
    return field; // return as is if not JSON
  }
}

// Stringify for storage
function stringifyJSON(val) {
  if (Array.isArray(val)) return JSON.stringify(val);
  return val;
}

// Load entire state from DB
function loadState() {
  const tasks = db.prepare('SELECT * FROM tasks').all().map(t => ({
    ...t,
    subtasks: parseJSON(t.subtasks) || []
  }));

  const goals = db.prepare('SELECT * FROM goals').all().map(g => ({
    ...g,
    milestones: parseJSON(g.milestones) || []
  }));

  const chatHistory = db.prepare('SELECT role, content FROM chatHistory ORDER BY id').all();

  return { tasks, goals, chatHistory };
}

// Save state to DB (replace all)
function saveState(state) {
  db.transaction(() => {
    // Clear tables
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM goals').run();
    db.prepare('DELETE FROM chatHistory').run();

    // Insert tasks
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, description, priority, deadline, status, category, estimatedTime, subtasks, createdAt)
      VALUES (@id, @title, @description, @priority, @deadline, @status, @category, @estimatedTime, @subtasks, @createdAt)
    `);
    for (const task of state.tasks) {
      insertTask.run({
        ...task,
        subtasks: stringifyJSON(task.subtasks)
      });
    }

    // Insert goals
    const insertGoal = db.prepare(`
      INSERT INTO goals (id, title, description, deadline, progress, milestones)
      VALUES (@id, @title, @description, @deadline, @progress, @milestones)
    `);
    for (const goal of state.goals) {
      insertGoal.run({
        ...goal,
        milestones: stringifyJSON(goal.milestones)
      });
    }

    // Insert chatHistory (limit to last 100 messages to avoid unlimited growth)
    const recentHistory = state.chatHistory.slice(-100);
    const insertChat = db.prepare(`
      INSERT INTO chatHistory (role, content)
      VALUES (@role, @content)
    `);
    for (const msg of recentHistory) {
      insertChat.run(msg);
    }
  })();
}

// Get a fresh DB instance (for reuse)
function getDB() {
  return db;
}

initDB();

module.exports = { loadState, saveState, getDB };