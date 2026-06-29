/**
 * One-time seed script for Turso/libSQL database.
 *
 * Usage:
 *   export TURSO_DB_URL=libsql://your-db.turso.io
 *   export TURSO_DB_TOKEN=your-token
 *   node scripts/seed-turso.js
 */

require("dotenv").config();
const { createClient } = require("@libsql/client");

const url = process.env.TURSO_DB_URL;
const token = process.env.TURSO_DB_TOKEN;

if (!url || !token) {
  console.error("Set TURSO_DB_URL and TURSO_DB_TOKEN first.");
  process.exit(1);
}

const db = createClient({ url, authToken: token });

const DAY = 86400000;
const now = new Date();
const today = now.toISOString().slice(0, 10);

function daysAgo(n) {
  return new Date(now.getTime() - n * DAY).toISOString().slice(0, 10);
}

// ── helpers ──────────────────────────────────────────────────────────────────
async function wipe() {
  await db.execute("DELETE FROM tasks");
  await db.execute("DELETE FROM goals");
  await db.execute("DELETE FROM chatHistory");
  await db.execute("DELETE FROM daily_logs");
  await db.execute("DELETE FROM achievements");
  await db.execute("DELETE FROM user_stats");
  await db.execute("INSERT INTO user_stats (id) VALUES (1)");
}

async function seed() {
  await wipe();
  console.log("Tables wiped.");

  // ── Tasks (Arjun Mehta student persona) ───────────────────────────────
  const tasks = [
    // completed — spread over last 21 days
    { id: "stud-001", title: "Solve 10 LeetCode problems — DP & Graphs", description: "Focus on memoization: House Robber, Coin Change, LIS, then BFS/DFS graph problems", priority: "high", deadline: daysAgo(1), status: "completed", category: "Study", estimatedTime: "4 hours", subtasks: '["5 DP problems","5 Graph problems","Review solutions"]', completedAt: daysAgo(1), createdAt: daysAgo(3) },
    { id: "stud-002", title: "Mock interview with PrepBuddy", description: "45-min DSA mock + resume walkthrough on Coderpad", priority: "high", deadline: daysAgo(1), status: "completed", category: "Study", estimatedTime: "1.5 hours", subtasks: "[]", completedAt: daysAgo(1), createdAt: daysAgo(2) },
    { id: "stud-003", title: "Push final version of Expense Tracker project", description: "Clean README, add live demo link, write setup guide. Push to GitHub.", priority: "high", deadline: daysAgo(2), status: "completed", category: "Work", estimatedTime: "2 hours", subtasks: '["Polish README","Add demo link","Clean code"]', completedAt: daysAgo(2), createdAt: daysAgo(6) },
    { id: "stud-004", title: "Complete DBMS assignment — Normalisation forms", description: "Answer 3NF, BCNF problems and ER diagram for library management system", priority: "medium", deadline: daysAgo(2), status: "completed", category: "Study", estimatedTime: "2 hours", subtasks: "[]", completedAt: daysAgo(2), createdAt: daysAgo(4) },
    { id: "stud-005", title: "Finish OS lab — CPU scheduling simulation", description: "Implement Round Robin and SJF in C", priority: "medium", deadline: daysAgo(3), status: "completed", category: "Study", estimatedTime: "3 hours", subtasks: '["RR implementation","SJF implementation","Report"]', completedAt: daysAgo(3), createdAt: daysAgo(5) },
    { id: "stud-006", title: "Review 3 FAANG intern offer threads on Blind", description: "Read comp breakdowns and prepare questions for the upcoming session.", priority: "low", deadline: daysAgo(3), status: "completed", category: "Study", estimatedTime: "1 hour", subtasks: "[]", completedAt: daysAgo(3), createdAt: daysAgo(4) },
    // in_progress
    { id: "stud-010", title: "Start ML mini-project — iris classifier", description: "Use scikit-learn, log results, write a short blog post.", priority: "high", deadline: daysAgo(1), status: "in_progress", category: "Work", estimatedTime: "5 hours", subtasks: '["Dataset exploration","Model training","Writeup"]', completedAt: null, createdAt: daysAgo(2) },
    { id: "stud-011", title: "DSA sheet revision — Trees + Backtracking", description: "Flip through handwritten notes, solve 5 new problems.", priority: "high", deadline: daysAgo(1), status: "in_progress", category: "Study", estimatedTime: "3 hours", subtasks: '["Revise theory","5 problems","Debug solutions"]', completedAt: null, createdAt: daysAgo(3) },
    { id: "stud-012", title: "Update resume + LinkedIn banner for placements", description: "Add the Expense Tracker project, update CGPA.", priority: "medium", deadline: daysAgo(1), status: "in_progress", category: "Work", estimatedTime: "1 hour", subtasks: "[]", completedAt: null, createdAt: daysAgo(1) },
    // overdue (relative to today — keep them technically past deadline)
    { id: "stud-020", title: "CN assignment — TCP handshake diagram", description: "Due 2 days ago — submit to the LMS now.", priority: "urgent", deadline: daysAgo(2), status: "overdue", category: "Study", estimatedTime: "1 hour", subtasks: "[]", completedAt: null, createdAt: daysAgo(4) },
    { id: "stud-021", title: "Sign up for campus hackathon", description: "Registration closed yesterday — still check if walk-ins allowed.", priority: "high", deadline: daysAgo(1), status: "overdue", category: "Work", estimatedTime: "30 mins", subtasks: "[]", completedAt: null, createdAt: daysAgo(3) },
    // pending
    { id: "stud-030", title: "Prepare 5-min elevator pitch for placements", description: "Record yourself, get feedback from a senior.", priority: "high", deadline: daysAhead(2), status: "pending", category: "Study", estimatedTime: "1 hour", subtasks: "[]", completedAt: null, createdAt: today },
    { id: "stud-031", title: "React Native tutorial — navigation + state", description: "Follow the official docs example, build a mini app.", priority: "medium", deadline: daysAhead(5), status: "pending", category: "Work", estimatedTime: "3 hours", subtasks: '["Navigation basics","State mgmt","Mini app"]', completedAt: null, createdAt: today },
    { id: "stud-032", title: "Group discussion practice with friends", description: "Topic: AI in education. Practice speaking clearly.", priority: "low", deadline: daysAhead(3), status: "pending", category: "Study", estimatedTime: "1 hour", subtasks: "[]", completedAt: null, createdAt: daysAgo(1) },
    { id: "stud-033", title: "Plan timetable for next semester", description: "Balance DSA, projects, and CGPA subjects.", priority: "medium", deadline: daysAhead(7), status: "pending", category: "Study", estimatedTime: "2 hours", subtasks: "[]", completedAt: null, createdAt: today },
  ];

  const insertTaskSql = `INSERT INTO tasks (id,title,description,priority,deadline,status,category,estimatedTime,subtasks,completedAt,createdAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

  for (const t of tasks) {
    await db.execute(insertTaskSql, [t.id, t.title, t.description, t.priority, t.deadline, t.status, t.category, t.estimatedTime, t.subtasks, t.completedAt, t.createdAt]);
  }
  console.log(`Inserted ${tasks.length} tasks.`);

  // ── Goals ──────────────────────────────────────────────────────────────
  const goals = [
    { id: "goal-1", title: "Land a top-tier SDE summer internship", description: "Target: FAANG/MANGO company by end of summer break.", deadline: daysAhead(60), progress: 55, milestones: '[{"title":"Finalize resume","done":true},{"title":"Complete 150 LeetCode","done":false},{"title":"3 mock interviews/week","done":false},{"title":"Apply to 30 companies","done":false},{"title":"Convert offer","done":false}]' },
    { id: "goal-2", title: "Maintain 9+ CGPA this semester", description: "Focus on consistent study and assignment submission.", deadline: daysAhead(90), progress: 70, milestones: '[{"title":"Submit all assignments on time","done":true},{"title":"Score 10/10 in mid-terms","done":false},{"title":"Complete all lab practicals","done":false}]' },
    { id: "goal-3", title: "Ship 2 production-ready projects by summer", description: "One ML + one mobile app.", deadline: daysAhead(75), progress: 30, milestones: '[{"title":"Expense Tracker deployed","done":true},{"title":"IRIS classifier live","done":false},{"title":"React Native app shipped","done":false}]' },
  ];

  const insertGoalSql = `INSERT INTO goals (id,title,description,deadline,progress,milestones) VALUES (?,?,?,?,?,?)`;
  for (const g of goals) {
    await db.execute(insertGoalSql, [g.id, g.title, g.description, g.deadline, g.progress, g.milestones]);
  }
  console.log(`Inserted ${goals.length} goals.`);

  // ── Daily logs (last 21 days) — varied student activity ─────────────────
  const patterns = [2, 1, 0, 3, 2, 1, 0, 4, 3, 2, 0, 5, 2, 1, 3, 2, 0, 4, 3, 2, 0]; // 21 days
  for (let i = 0; i < 21; i++) {
    const date = daysAgo(21 - i);
    const completed = patterns[i];
    const focus = completed * 40 + Math.floor(Math.random() * 30); // 40-70 mins per task
    await db.execute(
      "INSERT OR REPLACE INTO daily_logs (date,tasksCompleted,tasksCreated,focusMinutes,categoryBreakdown,createdAt) VALUES (?,?,?,?,?,?)",
      [date, completed, i < 5 ? 1 : 0, focus, '{"Study":' + completed + '}', date]
    );
  }
  console.log("Inserted 21 days of daily logs.");

  // ── User stats ─────────────────────────────────────────────────────────
  await db.execute(
    `UPDATE user_stats SET currentStreak = ?, longestStreak = ?, totalCompletions = ?, lastActiveDate = ? WHERE id = 1`,
    [7, 12, 25, today]
  );
  console.log("User stats set: streak 7, longest 12, 25 completions.");

  // ── Achievements ───────────────────────────────────────────────────────
  const achievements = [
    { id: "first_task", title: "Getting Started", description: "Complete your first task", icon: "CheckCircle2", unlockedAt: daysAgo(14) },
    { id: "five_tasks", title: "On a Roll", description: "Complete 5 tasks in one day", icon: "Zap", unlockedAt: daysAgo(10) },
    { id: "streak_7", title: "Week Warrior", description: "A full week of activity", icon: "Trophy", unlockedAt: daysAgo(7) },
    { id: "first_goal", title: "Goal Setter", description: "Set your first long-term goal", icon: "Target", unlockedAt: daysAgo(12) },
  ];
  for (const a of achievements) {
    await db.execute("INSERT OR IGNORE INTO achievements (id,title,description,icon,unlockedAt) VALUES (?,?,?,?,?)", [a.id, a.title, a.description, a.icon, a.unlockedAt]);
  }
  console.log(`Inserted ${achievements.length} achievements.`);

  console.log("Seed complete!");
}

seed().catch((err) => { console.error(err); process.exit(1); });
