/**
 * Seed the local SQLite DB with realistic dummy data for testing.
 * Usage: node scripts/seed-dummy-data.js
 */

const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(process.cwd(), "data.db"));

const now = new Date();
const iso = (d) => new Date(d).toISOString();

const DAY = 86400000;

function makeDate(hoursAgo) {
  return new Date(now.getTime() - hoursAgo * 3600000).toISOString();
}

function dateStr(daysAgo) {
  const d = new Date(now.getTime() - daysAgo * DAY);
  return d.toISOString().slice(0, 10);
}

// ─── Tasks ──────────────────────────────────────────────────────
const tasks = [
  { id: "task-1", title: "Finish project proposal", description: "Complete the Q4 proposal for the client meeting", priority: "urgent", deadline: makeDate(2), status: "in_progress", category: "Work", estimatedTime: "3 hours", subtasks: JSON.stringify(["Draft sections", "Add budget table"]), completedAt: null, createdAt: makeDate(48) },
  { id: "task-2", title: "Study for midterm exam", description: "Revise chapters 5-8 of Distributed Systems", priority: "high", deadline: makeDate(72), status: "pending", category: "Study", estimatedTime: "5 hours", subtasks: JSON.stringify(["Chapter 5 notes", "Past paper review"]), completedAt: null, createdAt: makeDate(72) },
  { id: "task-3", title: "Grocery shopping", description: "Pick up vegetables, milk, and bread", priority: "medium", deadline: makeDate(24), status: "pending", category: "Personal", estimatedTime: "30 minutes", subtasks: JSON.stringify([]), completedAt: null, createdAt: makeDate(24) },
  { id: "task-4", title: "Review pull requests", description: "Check 3 open PRs from the frontend team", priority: "high", deadline: makeDate(12), status: "pending", category: "Work", estimatedTime: "1 hour", subtasks: JSON.stringify([]), completedAt: null, createdAt: makeDate(12) },
  { id: "task-5", title: "Workout session", description: "Upper body + cardio at the gym", priority: "low", deadline: makeDate(6), status: "completed", category: "Personal", estimatedTime: "1 hour", subtasks: JSON.stringify([]), completedAt: makeDate(6), createdAt: makeDate(36) },
  { id: "task-6", title: "Read 20 pages of Atomic Habits", description: "Continue chapter on habit stacking", priority: "low", deadline: makeDate(48), status: "completed", category: "Personal", estimatedTime: "20 minutes", subtasks: JSON.stringify([]), completedAt: makeDate(48), createdAt: makeDate(72) },
  { id: "task-7", title: "Prepare presentation slides", description: "Sprint review slides for Friday", priority: "urgent", deadline: makeDate(72), status: "pending", category: "Work", estimatedTime: "2 hours", subtasks: JSON.stringify(["Outline", "Design", "Rehearse"]), completedAt: null, createdAt: makeDate(24) },
  { id: "task-8", title: "Call dentist for appointment", description: "Schedule routine checkup", priority: "medium", deadline: makeDate(168), status: "pending", category: "Personal", estimatedTime: "10 minutes", subtasks: JSON.stringify([]), completedAt: null, createdAt: makeDate(48) },
];

const insertTask = db.prepare(
  `INSERT INTO tasks (id, title, description, priority, deadline, status, category, estimatedTime, subtasks, completedAt, createdAt)
   VALUES (@id, @title, @description, @priority, @deadline, @status, @category, @estimatedTime, @subtasks, @completedAt, @createdAt)`
);
for (const t of tasks) insertTask.run(t);

// ─── Goals ──────────────────────────────────────────────────────
const goals = [
  {
    id: "goal-1",
    title: "Launch MVP by end of month",
    description: "Ship the core product to first 100 beta users",
    deadline: makeDate(480),
    progress: 65,
    milestones: JSON.stringify([
      { title: "Finalize feature list", done: true },
      { title: "Complete landing page", done: true },
      { title: "Deploy backend API", done: true },
      { title: "Run closed beta", done: false },
      { title: "Public launch", done: false },
    ]),
  },
  {
    id: "goal-2",
    title: "Improve fitness level",
    description: "Run 5km in under 25 minutes by end of quarter",
    deadline: makeDate(720),
    progress: 40,
    milestones: JSON.stringify([
      { title: "Run 3x per week", done: true },
      { title: "Sub 30 min 5k", done: true },
      { title: "Sub 27 min 5k", done: false },
      { title: "Sub 25 min 5k", done: false },
    ]),
  },
  {
    id: "goal-3",
    title: "Read 12 books this year",
    description: "One book per month across genres",
    deadline: makeDate(2000),
    progress: 50,
    milestones: JSON.stringify([
      { title: "Book 1", done: true },
      { title: "Book 2", done: true },
      { title: "Book 3", done: true },
      { title: "Book 4", done: false },
      { title: "Book 5", done: false },
      { title: "Book 6", done: false },
    ]),
  },
];

const insertGoal = db.prepare(
  `INSERT INTO goals (id, title, description, deadline, progress, milestones)
   VALUES (@id, @title, @description, @deadline, @progress, @milestones)`
);
for (const g of goals) insertGoal.run(g);

// ─── Chat History ───────────────────────────────────────────────
const chatMessages = [
  { role: "user", content: "Help me plan my week", timestamp: makeDate(48) },
  { role: "assistant", content: "Here's your weekly plan based on your deadlines and priorities. I've broken down the urgent tasks first, followed by high-priority items.", timestamp: makeDate(48) },
  { role: "user", content: "Create a study plan for my midterm", timestamp: makeDate(36) },
  { role: "assistant", content: "I've created a study schedule with dedicated blocks for each chapter. You have 5 hours allocated over the next 3 days.", timestamp: makeDate(36) },
  { role: "user", content: "Add workout session to my tasks", timestamp: makeDate(30) },
  { role: "assistant", content: "Added workout session (1 hour, low priority) to your Personal tasks. Good luck!", timestamp: makeDate(30) },
];

const insertChat = db.prepare(
  "INSERT INTO chatHistory (role, content, timestamp) VALUES (?, ?, ?)"
);
for (const m of chatMessages) insertChat.run(m.role, m.content, m.timestamp);

// ─── Daily Logs (last 14 days) ──────────────────────────────────
const insertLog = db.prepare(
  `INSERT OR REPLACE INTO daily_logs (date, tasksCompleted, tasksCreated, focusMinutes, categoryBreakdown)
   VALUES (?, ?, ?, ?, ?)`
);

const catBreakdown = (c) => JSON.stringify(c || {});
const categories = ["Work", "Study", "Personal"];

for (let i = 0; i < 14; i++) {
  const d = dateStr(i);
  const completed = Math.floor(Math.random() * 5);
  const created = Math.floor(Math.random() * 3) + 1;
  const focus = Math.floor(Math.random() * 180) + 60;
  insertLog.run(d, completed, created, focus, catBreakdown({ Work: Math.floor(completed * 0.5), Study: Math.floor(completed * 0.3), Personal: Math.floor(completed * 0.2) }));
}

// ─── User Stats ─────────────────────────────────────────────────
const insertStats = db.prepare(
  `INSERT OR REPLACE INTO user_stats (id, currentStreak, longestStreak, totalCompletions, lastActiveDate, updatedAt)
   VALUES (1, ?, ?, ?, ?, ?)`
);
insertStats.run(4, 7, 18, dateStr(0), new Date().toISOString());

// ─── Achievements ───────────────────────────────────────────────
const achievements = [
  { id: "first_task", title: "Getting Started", description: "Complete your first task", icon: "CheckCircle2", unlockedAt: makeDate(720) },
  { id: "streak_3", title: "3-Day Streak", description: "Stay active for 3 consecutive days", icon: "Flame", unlockedAt: makeDate(360) },
  { id: "five_tasks", title: "On a Roll", description: "Complete 5 tasks in one day", icon: "Zap", unlockedAt: makeDate(240) },
  { id: "first_goal", title: "Goal Setter", description: "Set your first long-term goal", icon: "Target", unlockedAt: makeDate(500) },
  { id: "streak_7", title: "Week Warrior", description: "A full week of activity", icon: "Trophy", unlockedAt: makeDate(168) },
];
const insertAch = db.prepare(
  "INSERT OR IGNORE INTO achievements (id, title, description, icon, unlockedAt) VALUES (?, ?, ?, ?, ?)"
);
for (const a of achievements) insertAch.run(a.id, a.title, a.description, a.icon, a.unlockedAt);

console.log("Dummy data seeded successfully!");
console.log("  Tasks:", tasks.length);
console.log("  Goals:", goals.length);
console.log("  Chat messages:", chatMessages.length);
console.log("  Daily logs: 14 days");
console.log("  Achievements:", achievements.length);
db.close();
