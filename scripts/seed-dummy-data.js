const path = require("path");
const { saveState, recordCompletion, unlockAchievement, loadState } = require(path.join(__dirname, "..", "lib", "db"));

const now = new Date();
const DAY = 86400000;

function iso(d) { return new Date(d).toISOString(); }

// ── 1. wipe ──────────────────────────────────────────────────────────────────
saveState({ tasks: [], goals: [], chatHistory: [] });

// ── 2. tasks ─────────────────────────────────────────────────────────────────
const tasks = [
  // ── completed — spread over the past 5 days (drives a realistic 5-day streak) ──
  { id: "task-1", title: "Review Q3 board slide deck", description: "Add comments on VP's draft before Friday all-hands", priority: "high", deadline: iso(new Date(now.getTime() - 1*DAY)), status: "completed", category: "Work", estimatedTime: "1 hour", subtasks: [], completedAt: iso(new Date(now.getTime() - 1*DAY)), createdAt: iso(new Date(now.getTime() - 4*DAY)) },
  { id: "task-2", title: "Fix login timeout bug", description: "Token refresh silently fails on mobile Safari in production", priority: "urgent", deadline: iso(new Date(now.getTime() - 5*3600000)), status: "completed", category: "Work", estimatedTime: "2 hours", subtasks: ["Reproduce locally", "Patch token refresh", "Deploy hotfix to staging"], completedAt: iso(new Date(now.getTime() - 1*DAY)), createdAt: iso(new Date(now.getTime() - 3*DAY)) },
  { id: "task-3", title: "Morning run — 5 km", description: "Park loop, target pace 5:30/km", priority: "medium", deadline: iso(new Date(now.getTime() - 3*DAY)), status: "completed", category: "Health", estimatedTime: "30 mins", subtasks: [], completedAt: iso(new Date(now.getTime() - 2*DAY)), createdAt: iso(new Date(now.getTime() - 4*DAY)) },
  { id: "task-4", title: "Read ch. 5-6 of The Design of Everyday Things", description: "Notes for book club on Thursday", priority: "low", deadline: iso(new Date(now.getTime() - 2*DAY)), status: "completed", category: "Personal", estimatedTime: "40 mins", subtasks: [], completedAt: iso(new Date(now.getTime() - 2*DAY)), createdAt: iso(new Date(now.getTime() - 5*DAY)) },
  { id: "task-20", title: "Update expense report for June", description: "Upload receipts, get manager sign-off before month-end close", priority: "medium", deadline: iso(new Date(now.getTime() - 1*DAY)), status: "completed", category: "Finance", estimatedTime: "45 mins", subtasks: [], completedAt: iso(new Date(now.getTime() - 0*DAY)), createdAt: iso(new Date(now.getTime() - 6*DAY)) },

  // ── in progress ────────────────────────────────────────────────────────────
  { id: "task-5", title: "Finish project proposal", description: "Q4 proposal for the client meeting — budget table still to add", priority: "urgent", deadline: iso(new Date(now.getTime() + 2*DAY)), status: "in_progress", category: "Work", estimatedTime: "3 hours", subtasks: ["Draft sections", "Add budget table"], createdAt: iso(new Date(now.getTime() - 2*DAY)) },
  { id: "task-6", title: "Design system audit for mobile", description: "Review 40+ screens vs latest Figma tokens; file issues in Linear", priority: "high", deadline: iso(new Date(now.getTime() + 2*DAY)), status: "in_progress", category: "Work", estimatedTime: "4 hours", subtasks: ["Audit buttons/inputs", "Audit dialogs", "Write findings doc"], createdAt: iso(new Date(now.getTime() - 1*DAY)) },
  { id: "task-21", title: "Plan weekend hiking trip", description: "Check trail conditions, reserve parking, pack list", priority: "low", deadline: iso(new Date(now.getTime() + 3*DAY)), status: "in_progress", category: "Personal", estimatedTime: "1 hour", subtasks: [], createdAt: iso(new Date(now.getTime())) },

  // ── pending (future) ───────────────────────────────────────────────────────
  { id: "task-7", title: "Study for midterm exam", description: "Revise chapters 5-8 of Distributed Systems", priority: "high", deadline: iso(new Date(now.getTime() + 3*DAY)), status: "pending", category: "Study", estimatedTime: "5 hours", subtasks: ["Chapter 5 notes", "Past paper review"], createdAt: iso(new Date(now.getTime() - 3*DAY)) },
  { id: "task-8", title: "Prepare sprint review slides", description: "Include demo video link and updated burndown chart", priority: "urgent", deadline: iso(new Date(now.getTime() + 3*DAY)), status: "pending", category: "Work", estimatedTime: "2 hours", subtasks: ["Outline", "Record demo", "Rehearse talk track"], createdAt: iso(new Date(now.getTime() - 2*DAY)) },
  { id: "task-9", title: "Grocery shopping", description: "Vegetables, milk, sourdough, olive oil", priority: "medium", deadline: iso(new Date(now.getTime() + 1*DAY)), status: "pending", category: "Personal", estimatedTime: "30 mins", subtasks: [], createdAt: iso(new Date(now.getTime() - 1*DAY)) },
  { id: "task-10", title: "Refactor auth middleware", description: "Migrate from session cookies to JWT + refresh-token rotation", priority: "high", deadline: iso(new Date(now.getTime() + 7*DAY)), status: "pending", category: "Work", estimatedTime: "6 hours", subtasks: ["Research rotation strategy", "Implement endpoint", "Write tests", "Deploy to staging"], createdAt: iso(new Date(now.getTime())) },
  { id: "task-11", title: "Review monthly bank statement", description: "Flag any unexpected charges before auto-pay runs", priority: "medium", deadline: iso(new Date(now.getTime() + 5*DAY)), status: "pending", category: "Finance", estimatedTime: "20 mins", subtasks: [], createdAt: iso(new Date(now.getTime() - 2*DAY)) },
  { id: "task-12", title: "Call dentist for appointment", description: "Schedule routine 6-month checkup", priority: "medium", deadline: iso(new Date(now.getTime() + 14*DAY)), status: "pending", category: "Personal", estimatedTime: "10 mins", subtasks: [], createdAt: iso(new Date(now.getTime() - 3*DAY)) },

  // ── overdue (past deadline, not done) ─────────────────────────────────────
  { id: "task-30", title: "Submit Q2 OKR self-assessment", description: "Deadline was yesterday — flag to manager if still incomplete", priority: "high", deadline: iso(new Date(now.getTime() - 1*DAY)), status: "overdue", category: "Work", estimatedTime: "30 mins", subtasks: [], createdAt: iso(new Date(now.getTime() - 7*DAY)) },
  { id: "task-31", title: "Pay electricity bill", description: "Due date was 2 days ago — avoid late fee", priority: "high", deadline: iso(new Date(now.getTime() - 2*DAY)), status: "overdue", category: "Finance", estimatedTime: "5 mins", subtasks: [], createdAt: iso(new Date(now.getTime() - 10*DAY)) },
  { id: "task-32", title: "Water the plants before trip", description: "3 planters on the balcony", priority: "low", deadline: iso(new Date(now.getTime() - 3*DAY)), status: "overdue", category: "Home", estimatedTime: "10 mins", subtasks: [], createdAt: iso(new Date(now.getTime() - 8*DAY)) },
];

// ── 3. goals ─────────────────────────────────────────────────────────────────
const goals = [
  { id: "goal-1", title: "Launch MVP by end of month", description: "Ship the core product to first 100 beta users", deadline: iso(new Date(now.getTime() + 480*3600000)), progress: 65, milestones: JSON.stringify([{ title: "Finalize feature list", done: true }, { title: "Complete landing page", done: true }, { title: "Deploy backend API", done: true }, { title: "Run closed beta", done: false }, { title: "Public launch", done: false }]) },
  { id: "goal-2", title: "Improve fitness level", description: "Run 5km in under 25 minutes by end of quarter", deadline: iso(new Date(now.getTime() + 720*3600000)), progress: 40, milestones: JSON.stringify([{ title: "Run 3x per week", done: true }, { title: "Sub 30 min 5k", done: true }, { title: "Sub 27 min 5k", done: false }, { title: "Sub 25 min 5k", done: false }]) },
  { id: "goal-3", title: "Read 12 books this year", description: "One book per month across genres", deadline: iso(new Date(now.getTime() + 2000*3600000)), progress: 50, milestones: JSON.stringify([{ title: "Book 1", done: true }, { title: "Book 2", done: true }, { title: "Book 3", done: true }, { title: "Book 4", done: false }, { title: "Book 5", done: false }, { title: "Book 6", done: false }]) },
];

// ── 4. chat history ──────────────────────────────────────────────────────────
const chatHistory = [
  { role: "user", content: "Help me plan my week" },
  { role: "model", content: "Here's your weekly plan: urgent tasks first, then high-priority. I've marked the Q3 board presentation and ticket analysis as top of the list." },
  { role: "user", content: "Create a study plan for my midterm" },
  { role: "model", content: "I've set up a 5-hour study schedule — 2h tonight, 3h split across the next two evenings. Subtasks are queued in the Study section." },
  { role: "user", content: "Add workout session to my tasks" },
  { role: "model", content: "Added! 1 hour, low priority, Personal category. I'll remind you after work hours." },
];

saveState({ tasks, goals, chatHistory });

// ── 5. completions → streak / heatmap ────────────────────────────────────────
tasks.filter(t => t.status === "completed").forEach(t => recordCompletion(t));

// ── 6. achievements ──────────────────────────────────────────────────────────
unlockAchievement("first_task", "Getting Started", "Complete your first task", "CheckCircle2");
unlockAchievement("five_tasks", "On a Roll", "Complete 5 tasks in one day", "Zap");
unlockAchievement("streak_3", "3-Day Streak", "Stay active for 3 consecutive days", "Flame");
unlockAchievement("first_goal", "Goal Setter", "Set your first long-term goal", "Target");
unlockAchievement("goal_half", "Halfway There", "Reach 50% on any goal", "TrendingUp");
unlockAchievement("streak_7", "Week Warrior", "A full week of activity", "Trophy");

// ── 7. report ────────────────────────────────────────────────────────────────
const s = loadState();
console.log("\n✅ Seed complete!");
console.log(`   ${s.tasks.length} tasks  (${s.tasks.filter(t=>t.status==="completed").length} completed, ${s.tasks.filter(t=>t.status==="in_progress").length} in_progress, ${s.tasks.filter(t=>t.status==="pending").length} pending, ${s.tasks.filter(t=>t.status==="overdue").length} overdue)`);
console.log(`   ${s.goals.length} goals, ${s.chatHistory.length} chat messages`);
