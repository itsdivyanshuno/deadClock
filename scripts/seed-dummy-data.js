/**
 * Seed the local SQLite DB with realistic, multi-scenario test data.
 * Run: node scripts/seed-dummy-data.js
 */

const path = require("path");
const {
  saveState, recordCompletion, unlockAchievement, loadState,
} = require(path.join(__dirname, "..", "lib", "db"));

const now = new Date();
const DAY = 86400000;

function iso(d) { return new Date(d).toISOString(); }
function daysAgo(n) { return iso(new Date(now.getTime() - n * DAY)); }
function daysAhead(n) { return iso(new Date(now.getTime() + n * DAY)); }

// ── 1. wipe ──────────────────────────────────────────────────────────────────
saveState({ tasks: [], goals: [], chatHistory: [] });

// ── 2. tasks ─────────────────────────────────────────────────────────────────
const tasks = [
  // ══ completed (spread across the past 5 days → multi-day streak) ══════════
  { id: "task-1",  title: "Review Q3 board slide deck",         description: "Leave comments on VP's draft before Friday all-hands",             priority: "high",      deadline: daysAgo(1),    status: "completed",   category: "Work",   estimatedTime: "1 hour",    subtasks: [], completedAt: daysAgo(1),    createdAt: daysAgo(5) },
  { id: "task-2",  title: "Fix login timeout bug",              description: "Token refresh silently fails on mobile Safari in production",         priority: "urgent",    deadline: daysAgo(1),    status: "completed",   category: "Work",   estimatedTime: "2 hours",   subtasks: ["Reproduce","Patch","Deploy hotfix"], completedAt: daysAgo(1), createdAt: daysAgo(3) },
  { id: "task-3",  title: "Morning run — 5 km",                 description: "Park loop. Target pace 5:30/km.",                                      priority: "medium",    deadline: daysAgo(4),    status: "completed",   category: "Health", estimatedTime: "30 mins",   subtasks: [], completedAt: daysAgo(4),    createdAt: daysAgo(6) },
  { id: "task-4",  title: "Read ch. 5-6 of The Design of Everyday Things", description: "Notes for Thursday book club",                           priority: "low",       deadline: daysAgo(3),    status: "completed",   category: "Personal", estimatedTime: "40 mins",  subtasks: [], completedAt: daysAgo(3),    createdAt: daysAgo(7) },
  { id: "task-5",  title: "Update expense report for June",     description: "Upload receipts, get manager sign-off before month-end close",       priority: "medium",    deadline: daysAgo(1),    status: "completed",   category: "Finance",estimatedTime: "45 mins",   subtasks: [], completedAt: daysAgo(0),    createdAt: daysAgo(8) },

  // ══ in progress ════════════════════════════════════════════════════════════
  { id: "task-10", title: "Finish project proposal",            description: "Q4 client proposal — budget table still to add",                       priority: "urgent",    deadline: daysAhead(2),  status: "in_progress",  category: "Work",   estimatedTime: "3 hours",   subtasks: ["Draft sections", "Add budget table"], createdAt: daysAgo(3) },
  { id: "task-11", title: "Design system audit for mobile",     description: "Review 40+ screens vs latest Figma tokens; file in Linear",           priority: "high",      deadline: daysAhead(2),  status: "in_progress",  category: "Work",   estimatedTime: "4 hours",   subtasks: ["Audit buttons/inputs", "Audit dialogs", "Write findings doc"], createdAt: daysAgo(2) },
  { id: "task-12", title: "Plan weekend hiking trip",           description: "Check trail conditions, reserve parking, prep pack list",              priority: "low",       deadline: daysAhead(3),  status: "in_progress",  category: "Personal", estimatedTime: "1 hour",   subtasks: [], createdAt: daysAgo(0) },

  // ══ pending (future) ════════════════════════════════════════════════════════
  { id: "task-20", title: "Study for midterm exam",             description: "Revise chapters 5-8 of Distributed Systems",                            priority: "high",      deadline: daysAhead(3),  status: "pending",      category: "Study",  estimatedTime: "5 hours",   subtasks: ["Chapter 5 notes", "Past paper review"], createdAt: daysAgo(4) },
  { id: "task-21", title: "Prepare sprint review slides",       description: "Include demo video link and updated burndown chart",                   priority: "urgent",    deadline: daysAhead(3),  status: "pending",      category: "Work",   estimatedTime: "2 hours",   subtasks: ["Outline", "Record demo", "Rehearse talk track"], createdAt: daysAgo(3) },
  { id: "task-22", title: "Grocery shopping",                   description: "Vegetables, milk, sourdough, olive oil",                                priority: "medium",    deadline: daysAhead(1),  status: "pending",      category: "Personal", estimatedTime: "30 mins",  subtasks: [], createdAt: daysAgo(1) },
  { id: "task-23", title: "Refactor auth middleware",           description: "Migrate session cookies to JWT + refresh-token rotation",              priority: "high",      deadline: daysAhead(7),  status: "pending",      category: "Work",   estimatedTime: "6 hours",   subtasks: ["Research rotation strategy", "Implement endpoint", "Write tests", "Deploy to staging"], createdAt: daysAgo(0) },
  { id: "task-24", title: "Review monthly bank statement",      description: "Flag unexpected charges before auto-pay runs",                         priority: "medium",    deadline: daysAhead(5),  status: "pending",      category: "Finance",estimatedTime: "20 mins",   subtasks: [], createdAt: daysAgo(2) },
  { id: "task-25", title: "Call dentist for appointment",       description: "Schedule routine 6-month checkup",                                     priority: "medium",    deadline: daysAhead(14), status: "pending",      category: "Personal", estimatedTime: "10 mins",  subtasks: [], createdAt: daysAgo(4) },

  // ══ overdue (past deadline, not done) ═══════════════════════════════════════
  { id: "task-30", title: "Submit Q2 OKR self-assessment",      description: "Deadline was yesterday — flag manager if still incomplete",             priority: "high",      deadline: daysAgo(1),    status: "overdue",      category: "Work",   estimatedTime: "30 mins",   subtasks: [], createdAt: daysAgo(8) },
  { id: "task-31", title: "Pay electricity bill",               description: "Due 2 days ago — avoid late fee",                                       priority: "high",      deadline: daysAgo(2),    status: "overdue",      category: "Finance",estimatedTime: "5 mins",    subtasks: [], createdAt: daysAgo(11) },
  { id: "task-32", title: "Water the plants before trip",       description: "3 planters on the balcony",                                             priority: "low",       deadline: daysAgo(3),    status: "overdue",      category: "Home",   estimatedTime: "10 mins",   subtasks: [], createdAt: daysAgo(9) },
];

// ── 3. goals with milestones ─────────────────────────────────────────────────
const goals = [
  {
    id: "goal-1",
    title: "Ship v2.0 of the mobile app",
    description: "Complete redesign with offline mode and dark-theme support by end of quarter.",
    deadline: daysAhead(60),
    progress: 55,
    milestones: JSON.stringify([
      { title: "Finalise design specs", done: true  },
      { title: "Implement offline data sync", done: true  },
      { title: "Dark-theme token migration",  done: false },
      { title: "Beta release to 20% of users", done: false },
      { title: "Full rollout + marketing comms",done: false },
    ]),
  },
  {
    id: "goal-2",
    title: "Run a sub-4-hour marathon",
    description: "Current PB is 4:22. Target: Berlin Marathon in late September.",
    deadline: daysAhead(90),
    progress: 30,
    milestones: JSON.stringify([
      { title: "Complete 16-week base-building plan", done: true  },
      { title: "Hit a 1:58 half-marathon",            done: false },
      { title: "Run two 35 km long runs back-to-back",done: false },
      { title: "Taper week — 3 weeks out from race",  done: false },
      { title: "Race day — Berlin, Sep 2026",         done: false },
    ]),
  },
];

// ── 4. chat history ──────────────────────────────────────────────────────────
const chatHistory = [
  { role: "user", content: "Good morning! What's on my plate today?" },
  { role: "model", content: "You have 4 tasks due today:\n\n• 🔴 URGENT — Customer satisfaction survey report (2h est.)\n• 🟡 HIGH — Design system audit (in progress, 4h est.)\n• 🟡 HIGH — Auth middleware refactor (due in 7 days, 6h est.)\n• ⚪ LOW — Meal prep & book-club notes (both this week)\n\nI'd start with the survey report before EOD." },
  { role: "user", content: "Can you break down the auth middleware refactor into steps?" },
  { role: "model", content: "Here's a 4-step plan:\n\n1. **Research (1h):** Review JWT rotation best practices.\n2. **Implementation (2h):** Refactor `middleware/auth.ts` — add refresh-token endpoint and HttpOnly cookies.\n3. **Tests (2h):** Write integration tests for login, refresh, logout.\n4. **Staging deploy (1h):** Push to staging, run smoke tests, file PR.\n\nWant me to create these as individual tasks?" },
  { role: "user", content: "Yes, schedule them starting next Monday." },
  { role: "model", content: "Done! 4 tasks created under Work, all linked to the auth-refactor effort. Scheduled Mon–Thu, 2 hours per day. Friday left as a code-review buffer." },
  { role: "user", content: "Also add a goal to run a sub-4-hour marathon by September." },
  { role: "model", content: "🎯 Goal created: \"Run a sub-4-hour marathon\" — 5 milestones, target Sep 2026. Current progress: 30% (base-building done). I've broken remaining milestones into weekly training tasks." },
];

// ── 5. persist ───────────────────────────────────────────────────────────────
saveState({ tasks, goals, chatHistory });

// ── 6. record completions (generates daily_logs via recordCompletion) ────────
tasks.filter(t => t.status === "completed").forEach(t => recordCompletion(t));

// ── 7. 14-day heatmap — fill in gaps so streak spans multiple real days ──────
// recordCompletion wrote entries for each completed task's date, but may have
// left rest days with zero activity. Backfill a realistic 14-day pattern.
const heatDb = require("better-sqlite3")(path.join(__dirname, "..", "data.db"));

const pattern = [
  { offs: -13, done: 3, focus: 170 },
  { offs: -12, done: 4, focus: 230 },
  { offs: -11, done: 2, focus: 90  },
  { offs: -10, done: 0, focus: 0   },   // rest day
  { offs: -9,  done: 5, focus: 310 },
  { offs: -8,  done: 1, focus: 45  },
  { offs: -7,  done: 0, focus: 0   },   // weekend
  { offs: -6,  done: 4, focus: 210 },
  { offs: -5,  done: 3, focus: 160 },
  { offs: -4,  done: 2, focus: 85  },
  { offs: -3,  done: 6, focus: 370 },
  { offs: -2,  done: 1, focus: 55  },
  { offs: -1,  done: 3, focus: 145 },
  { offs:  0,  done: 4, focus: 195 },
];

const upsertLog = heatDb.prepare(
  `INSERT INTO daily_logs (date, tasksCompleted, tasksCreated, focusMinutes, categoryBreakdown)
   VALUES (?, ?, ?, ?, ?)
   ON CONFLICT(date) DO UPDATE SET
     tasksCompleted = tasksCompleted + excluded.tasksCompleted,
     focusMinutes   = focusMinutes   + excluded.focusMinutes,
     categoryBreakdown = json_set(
       COALESCE(daily_logs.categoryBreakdown, '{}'),
       '$.' || excluded.categoryBreakdown,
       COALESCE(json_extract(daily_logs.categoryBreakdown, '$.' || excluded.categoryBreakdown), 0)
       + excluded.tasksCompleted
     )`
);

pattern.forEach(({ offs, done, focus }) => {
  const date   = new Date(now.getTime() + offs * DAY).toISOString().slice(0, 10);
  const cats   = {};
  if (done > 0) {
    cats.Work     = Math.ceil(done * 0.55);
    cats.Study    = Math.ceil(done * 0.25);
    cats.Personal = Math.max(0, done - cats.Work - cats.Study);
  }
  upsertLog.run(date, done, done, focus, JSON.stringify(cats));
});

// ── 8. fix streak stats from the 14-day log ─────────────────────────────────
const logRows = heatDb
  .prepare("SELECT date, tasksCompleted FROM daily_logs WHERE date >= ? ORDER BY date ASC")
  .all(new Date(now.getTime() - 20 * DAY).toISOString().slice(0, 10));

let currentStreak = 0;
let longestStreak = 0;
let run = 0;
for (const row of logRows) {
  if (row.tasksCompleted > 0) { run++; longestStreak = Math.max(longestStreak, run); }
  else run = 0;
}
// current streak: walk backwards from most recent
for (let i = logRows.length - 1; i >= 0; i--) {
  if (logRows[i].tasksCompleted > 0) currentStreak++;
  else break;
}
const totalCompletions = logRows.reduce((a, r) => a + r.tasksCompleted, 0);
const lastActiveDate   = [...logRows].reverse().find(r => r.tasksCompleted > 0)?.date
                         ?? new Date().toISOString().slice(0, 10);

heatDb.prepare(
  `UPDATE user_stats SET
     currentStreak   = ?,
     longestStreak   = ?,
     totalCompletions= ?,
     lastActiveDate  = ?,
     updatedAt       = datetime('now')
   WHERE id = 1`
).run(currentStreak, Math.max(currentStreak, longestStreak, 7), totalCompletions, lastActiveDate);
heatDb.close();

// ── 9. achievements ──────────────────────────────────────────────────────────
unlockAchievement("first_task",  "Getting Started", "Complete your first task",                    "CheckCircle2");
unlockAchievement("five_tasks",  "On a Roll",      "Complete 5 tasks in one day",               "Zap");
unlockAchievement("streak_3",    "3-Day Streak",   "Stay active for 3 consecutive days",        "Flame");
unlockAchievement("first_goal",  "Goal Setter",    "Set your first long-term goal",             "Target");
unlockAchievement("goal_half",   "Halfway There",  "Reach 50% on any goal",                     "TrendingUp");
unlockAchievement("streak_7",    "Week Warrior",   "A full week of activity",                   "Trophy");

// ── 10. report ───────────────────────────────────────────────────────────────
const s = loadState();
const {
  getCurrentStreak, getLongestStreak, getTotalCompletions,
  getHeatmapData, getDailyLogs, getAchievements,
} = require(path.join(__dirname, "..", "lib", "db"));

console.log("\n✅ Seed complete!");
console.log(
  ` Tasks     : ${s.tasks.length}  (${s.tasks.filter(t => t.status === "completed").length} completed, ${s.tasks.filter(t => t.status === "in_progress").length} in_progress, ${s.tasks.filter(t => t.status === "pending").length} pending, ${s.tasks.filter(t => t.status === "overdue").length} overdue)`,
);
console.log(
  ` Goals     : ${s.goals.length}  |  Milestones: ${s.goals.reduce((a, g) => a + g.milestones.length, 0)} total, ${s.goals.reduce((a, g) => a + g.milestones.filter(m => m.done).length, 0)} done`,
);
console.log(` Chat msgs : ${s.chatHistory.length}`);
console.log(`\n Analytics`);
console.log(`   Streak      : ${getCurrentStreak()} active (best: ${getLongestStreak()})`);
console.log(`   Completions : ${getTotalCompletions()}`);
console.log(`   Heatmap     : ${getHeatmapData().length} days with activity`);
console.log(`   Daily logs  : ${getDailyLogs(14).length} entries (14d)`);
console.log(`   Achievements: ${getAchievements().length} unlocked\n`);
