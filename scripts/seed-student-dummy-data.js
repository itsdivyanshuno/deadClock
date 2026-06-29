/**
 * Seed the local SQLite DB with realistic data for a 2nd-year Engineering student
 * targeting top tech companies (FAANG / MANGO product-company roles).
 *
 * Run: node scripts/seed-student-dummy-data.js
 *
 * Persona ─ Arjun Mehta
 * Branch  : Computer Science, 2nd year (Sem 4)
 * Goal    : Summer internship @ top-tier tech company (SDE intern)
 * Focus   : DSA prep, projects, placements, CGPA maintenance
 */

const path = require("path");
const {
  saveState,
  recordCompletion,
  unlockAchievement,
  loadState,
} = require(path.join(__dirname, "..", "lib", "db"));

const now = new Date();
const DAY = 86400000;

// ── helpers ──────────────────────────────────────────────────────────────────
const daysAgo = (n) => new Date(now.getTime() - n * DAY).toISOString();
const daysAhead = (n) => new Date(now.getTime() + n * DAY).toISOString();
const dateStr = (d) => new Date(d).toISOString().slice(0, 10);

// ── 1. wipe ──────────────────────────────────────────────────────────────────
const heatDb = require("better-sqlite3")(path.join(__dirname, "..", "data.db"));
["tasks", "goals", "chatHistory", "daily_logs", "user_stats", "achievements"]
  .forEach((t) => heatDb.prepare(`DELETE FROM ${t}`).run());
heatDb.prepare("INSERT OR IGNORE INTO user_stats (id) VALUES (1)").run();
saveState({ tasks: [], goals: [], chatHistory: [] });

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TASKS (~42 tasks — 20 completed, 7 in-progress, 12 pending, 3 overdue)
// ═══════════════════════════════════════════════════════════════════════════════

// ── completed (spread across the past 21 days) ───────────────────────────────
const completedTasks = [
  // Week 3 (most recent)
  { id: "stud-001", title: "Solve 10 LeetCode problems — DP & Graphs",
    description: "Focus on memoization: House Robber, Coin Change, LIS, then BFS/DFS graph problems",
    priority: "high", deadline: daysAgo(1), status: "completed", category: "Study",
    estimatedTime: "4 hours", subtasks: ["5 DP problems", "5 Graph problems", "Review solutions"],
    completedAt: daysAgo(1), createdAt: daysAgo(3) },
  { id: "stud-002", title: "Mock interview with PrepBuddy",
    description: "45-min DSA mock + resume walkthrough on Coderpad",
    priority: "high", deadline: daysAgo(1), status: "completed", category: "Study",
    estimatedTime: "1.5 hours", subtasks: [], completedAt: daysAgo(1), createdAt: daysAgo(2) },
  { id: "stud-003", title: "Push final version of Expense Tracker project",
    description: "Clean README, add live demo link, write setup guide. Push to GitHub",
    priority: "high", deadline: daysAgo(2), status: "completed", category: "Work",
    estimatedTime: "2 hours", subtasks: ["Polish README", "Add demo link", "Clean code"],
    completedAt: daysAgo(2), createdAt: daysAgo(6) },
  { id: "stud-004", title: "Complete DBMS assignment — Normalisation forms",
    description: "Answer 3NF, BCNF problems and ER diagram for library management system",
    priority: "medium", deadline: daysAgo(2), status: "completed", category: "Study",
    estimatedTime: "2 hours", subtasks: [], completedAt: daysAgo(2), createdAt: daysAgo(4) },
  { id: "stud-005", title: "Gym — Upper body + cardio",
    description: "Bench press, shoulder press, pull-ups + 15 min HIIT. Consistency for placement physicals",
    priority: "medium", deadline: daysAgo(1), status: "completed", category: "Health",
    estimatedTime: "1.5 hours", subtasks: [], completedAt: daysAgo(1), createdAt: daysAgo(5) },
  { id: "stud-006", title: "Read OS chapter — Process Scheduling",
    description: "FCFS, SJF, Round Robin, Priority scheduling. Notes for upcoming sem exam",
    priority: "medium", deadline: daysAgo(3), status: "completed", category: "Study",
    estimatedTime: "3 hours", subtasks: ["Read textbook", "Annotate notes", "Solve 5 practice Qs"],
    completedAt: daysAgo(3), createdAt: daysAgo(6) },
  { id: "stud-007", title: "Update resume — add internship experience",
    description: "Add TechStart intern deliverables. Quantify: features shipped, bugs fixed, team size",
    priority: "high", deadline: daysAgo(3), status: "completed", category: "Work",
    estimatedTime: "1.5 hours", subtasks: ["Draft bullets", "Get peer review", "Finalise PDF"],
    completedAt: daysAgo(3), createdAt: daysAgo(7) },
  { id: "stud-008", title: "Practice system design — URL shortener",
    description: "Draw HLD, DB schema, caching strategy, scaling. Post on LinkedIn",
    priority: "high", deadline: daysAgo(4), status: "completed", category: "Study",
    estimatedTime: "2 hours", subtasks: ["Sketch HLD", "Write explanation", "Post on LinkedIn"],
    completedAt: daysAgo(4), createdAt: daysAgo(8) },
  // Week 2
  { id: "stud-009", title: "Complete Codeforces Div-2 round #842",
    description: "Target: solve at least 2/5 problems. Review editorial for unsolved",
    priority: "high", deadline: daysAgo(5), status: "completed", category: "Study",
    estimatedTime: "2.5 hours", subtasks: ["Warm-up", "Contest", "Editorial review"],
    completedAt: daysAgo(5), createdAt: daysAgo(6) },
  { id: "stud-010", title: "Build REST API for Chat Application project",
    description: "Node.js + Express backend. Auth, CRUD messages, WebSocket. All tests passing",
    priority: "high", deadline: daysAgo(7), status: "completed", category: "Work",
    estimatedTime: "5 hours", subtasks: ["Setup Express", "Auth routes", "Message routes", "WebSocket"],
    completedAt: daysAgo(7), createdAt: daysAgo(10) },
  { id: "stud-011", title: "CN assignment — TCP/IP model & subnetting",
    description: "Solve 8 subnetting problems and explain TCP 3-way handshake",
    priority: "medium", deadline: daysAgo(7), status: "completed", category: "Study",
    estimatedTime: "2 hours", subtasks: [], completedAt: daysAgo(7), createdAt: daysAgo(9) },
  { id: "stud-012", title: "Morning jog — 3 km",
    description: "Uni campus loop. Build stamina for placement fitness test",
    priority: "low", deadline: daysAgo(6), status: "completed", category: "Health",
    estimatedTime: "25 mins", subtasks: [], completedAt: daysAgo(6), createdAt: daysAgo(8) },
  { id: "stud-013", title: "LinkedIn post — System Design article",
    description: "Write about URL shortener scaling challenges. Tag placement cell",
    priority: "medium", deadline: daysAgo(6), status: "completed", category: "Work",
    estimatedTime: "1 hour", subtasks: ["Draft post", "Add diagram", "Publish + share"],
    completedAt: daysAgo(6), createdAt: daysAgo(8) },
  // Week 1
  { id: "stud-014", title: "Solve Striver's SDE Sheet — Day 1: Arrays",
    description: "20 array problems. Two-pointer and sliding window technique focus",
    priority: "high", deadline: daysAgo(9), status: "completed", category: "Study",
    estimatedTime: "4 hours", subtasks: ["Problems 1-10", "Problems 11-20", "Doubt clearing"],
    completedAt: daysAgo(9), createdAt: daysAgo(10) },
  { id: "stud-015", title: "Complete CN lab report — Ethernet & Switching",
    description: "Wireshark packet flow observation. Submit on LMS",
    priority: "medium", deadline: daysAgo(9), status: "completed", category: "Study",
    estimatedTime: "3 hours", subtasks: [], completedAt: daysAgo(9), createdAt: daysAgo(11) },
  { id: "stud-016", title: "Connect with 3 alumni in product companies",
    description: "Reach out to Google, Microsoft, Atlassian alumni on LinkedIn",
    priority: "high", deadline: daysAgo(11), status: "completed", category: "Work",
    estimatedTime: "1 hour", subtasks: ["Find alumni", "Personalised messages", "Follow up"],
    completedAt: daysAgo(11), createdAt: daysAgo(13) },
  { id: "stud-017", title: "Attend placement talk — Google recruiters on campus",
    description: "Notes on ideal candidate profile. Ask about open intern roles",
    priority: "high", deadline: daysAgo(12), status: "completed", category: "Work",
    estimatedTime: "1.5 hours", subtasks: ["Attend talk", "Network", "Capture action items"],
    completedAt: daysAgo(12), createdAt: daysAgo(14) },
  { id: "stud-018", title: "Grocery shopping for the week",
    description: "Milk, eggs, oats, fruits, protein powder. Meal prep for 3 days",
    priority: "low", deadline: daysAgo(8), status: "completed", category: "Personal",
    estimatedTime: "1 hour", subtasks: [], completedAt: daysAgo(8), createdAt: daysAgo(8) },
  { id: "stud-019", title: "Finish DSA notes — Recursion & Backtracking",
    description: "Subsets, permutations, N-Queens, Sudoku solver. Add to Notion notes",
    priority: "medium", deadline: daysAgo(14), status: "completed", category: "Study",
    estimatedTime: "3 hours", subtasks: [], completedAt: daysAgo(14), createdAt: daysAgo(16) },
  { id: "stud-020", title: "LMS deadline reminder bot",
    description: "Python script scraping LMS deadlines, sends Telegram alerts 24h before due",
    priority: "low", deadline: daysAgo(13), status: "completed", category: "Work",
    estimatedTime: "2 hours", subtasks: ["Scraper logic", "Telegram bot", "Cron scheduling"],
    completedAt: daysAgo(13), createdAt: daysAgo(15) },
];

// ── in-progress ───────────────────────────────────────────────────────────────
const inProgressTasks = [
  { id: "stud-101", title: "Build Chat Application (frontend)",
    description: "React + Socket.io client. Group chat, online indicators, timestamps. Deploy to Vercel",
    priority: "urgent", deadline: daysAhead(3), status: "in_progress", category: "Work",
    estimatedTime: "6 hours", subtasks: ["Setup React+Socket.io", "Build chat UI", "Real-time msgs", "Deploy"],
    createdAt: daysAgo(4) },
  { id: "stud-102", title: "Prepare for TCS NQT (aptitude + coding)",
    description: "Quant, LR, and coding MCQs from PrepInsta past papers",
    priority: "high", deadline: daysAhead(5), status: "in_progress", category: "Study",
    estimatedTime: "3 hours", subtasks: ["Quant practice", "LR practice", "Coding round prep"],
    createdAt: daysAgo(3) },
  { id: "stud-103", title: "LeetCode Blind 75 — 30 more to go",
    description: "On problem 45/75. Trees, Heaps, Graphs remaining. Review every wrong answer",
    priority: "high", deadline: daysAhead(10), status: "in_progress", category: "Study",
    estimatedTime: "8 hours", subtasks: ["Problems 46-55 (Trees)", "Problems 56-65 (Heaps)", "Problems 66-75 (Graphs)"],
    createdAt: daysAgo(10) },
  { id: "stud-104", title: "Write Blog — How I cracked my first coding contest",
    description: "Hashnode post: prep strategy, mistakes, key takeaways",
    priority: "medium", deadline: daysAhead(4), status: "in_progress", category: "Work",
    estimatedTime: "2 hours", subtasks: ["Outline", "Draft", "Code snippets", "Publish"],
    createdAt: daysAgo(2) },
  { id: "stud-105", title: "Revise OOP concepts for upcoming quiz",
    description: "Inheritance, polymorphism, abstract classes, Singleton, Factory patterns",
    priority: "medium", deadline: daysAhead(2), status: "in_progress", category: "Study",
    estimatedTime: "3 hours", subtasks: [], createdAt: daysAgo(1) },
  { id: "stud-106", title: "Plan study schedule for end-semester exams",
    description: "4-week study blocks. Prioritise OS, CN, DBMS. 2h/day for DSA minimum",
    priority: "high", deadline: daysAhead(2), status: "in_progress", category: "Study",
    estimatedTime: "2 hours", subtasks: ["List subjects", "Mark weak topics", "Create calendar block"],
    createdAt: daysAgo(1) },
  { id: "stud-107", title: "Update GitHub portfolio site",
    description: "Add Expense Tracker + Chat App projects. Update About with placement goals. Mobile responsive",
    priority: "medium", deadline: daysAhead(6), status: "in_progress", category: "Work",
    estimatedTime: "3 hours", subtasks: ["Add project cards", "Update About", "Test on mobile"],
    createdAt: daysAgo(5) },
];

// ── pending ───────────────────────────────────────────────────────────────────
const pendingTasks = [
  { id: "stud-201", title: "Striver's SDE Sheet — Trees & BST",
    description: "Inorder, preorder, postorder, level order, BST ops, LCA",
    priority: "high", deadline: daysAhead(6), status: "pending", category: "Study",
    estimatedTime: "5 hours", subtasks: ["Traversal problems", "BST problems", "LCA & tree DP"],
    createdAt: daysAgo(1) },
  { id: "stud-202", title: "Practice DP — tabulation approach",
    description: "Convert memoised solutions to iterative: Knapsack, LCS, LIS, Edit Distance",
    priority: "high", deadline: daysAhead(8), status: "pending", category: "Study",
    estimatedTime: "4 hours", subtasks: ["0/1 Knapsack", "LCS variants", "LIS", "Edit Distance"],
    createdAt: daysAgo(0) },
  { id: "stud-203", title: "DBMS mini-project: Library Management System",
    description: "React + Node.js + MongoDB. Issue/return books, fine calc, search",
    priority: "high", deadline: daysAhead(12), status: "pending", category: "Work",
    estimatedTime: "10 hours", subtasks: ["ER diagram", "Backend API", "React frontend", "README"],
    createdAt: daysAgo(0) },
  { id: "stud-204", title: "Give 2 HackerRank contests this weekend",
    description: "Data Structures + Problem Solving focus. Target top 20% ranking",
    priority: "medium", deadline: daysAhead(4), status: "pending", category: "Study",
    estimatedTime: "3 hours", subtasks: [], createdAt: daysAgo(0) },
  { id: "stud-205", title: "Prepare PPT — OS: CPU Scheduling",
    description: "Group project. Arjun covers Round Robin & Priority Scheduling slides",
    priority: "medium", deadline: daysAhead(7), status: "pending", category: "Study",
    estimatedTime: "3 hours", subtasks: ["Research", "Create slides", "Coordinate with team"],
    createdAt: daysAgo(2) },
  { id: "stud-206", title: "Contribute to open source — Hacktoberfest project",
    description: "Find good first issue. Target: 1 PR merged before month-end",
    priority: "high", deadline: daysAhead(15), status: "pending", category: "Work",
    estimatedTime: "5 hours", subtasks: ["Find repo", "Read CONTRIBUTING.md", "Fix issue", "Submit PR"],
    createdAt: daysAgo(1) },
  { id: "stud-207", title: "Renew Netflix / Spotify student subscription",
    description: "Auto-renewal lapsed. Reactivate before exam stress",
    priority: "low", deadline: daysAhead(2), status: "pending", category: "Personal",
    estimatedTime: "10 mins", subtasks: [], createdAt: daysAgo(0) },
  { id: "stud-208", title: "Pay mobile & WiFi bills",
    description: "Postpaid + home WiFi. Avoid disconnection during DSA grind week",
    priority: "medium", deadline: daysAhead(3), status: "pending", category: "Finance",
    estimatedTime: "15 mins", subtasks: [], createdAt: daysAgo(1) },
  { id: "stud-209", title: "Plan weekend trip with college friends",
    description: "Train tickets, budget split, tourist spots. End-semester break celebration",
    priority: "low", deadline: daysAhead(10), status: "pending", category: "Personal",
    estimatedTime: "1 hour", subtasks: [], createdAt: daysAgo(2) },
  { id: "stud-210", title: "Gym membership renewal",
    description: "Annual expiry next month. Compare with new-year offers at nearby gyms",
    priority: "low", deadline: daysAhead(14), status: "pending", category: "Health",
    estimatedTime: "20 mins", subtasks: [], createdAt: daysAgo(5) },
  { id: "stud-211", title: "Help roommate debug ML assignment",
    description: "TensorFlow image classifier shape mismatch errors. Review after dinner",
    priority: "low", deadline: daysAhead(2), status: "pending", category: "Study",
    estimatedTime: "1 hour", subtasks: [], createdAt: daysAgo(1) },
  { id: "stud-212", title: "Submit seminar report — Cloud Computing",
    description: "8-page report on serverless architecture. Cite 3 research papers. LMS before Friday",
    priority: "medium", deadline: daysAhead(4), status: "pending", category: "Study",
    estimatedTime: "4 hours", subtasks: ["Research", "Write sections", "Citations & formatting"],
    createdAt: daysAgo(2) },
];

// ── overdue ───────────────────────────────────────────────────────────────────
const overdueTasks = [
  { id: "stud-301", title: "Submit CN lab journal — Week 4",
    description: "Forgot to upload on LMS. Must submit by tomorrow to avoid attendance penalty",
    priority: "high", deadline: daysAgo(1), status: "overdue", category: "Study",
    estimatedTime: "30 mins", subtasks: [], createdAt: daysAgo(6) },
  { id: "stud-302", title: "Pay semester exam form fee",
    description: "Last date was yesterday. Check if late fee applies on college portal",
    priority: "urgent", deadline: daysAgo(1), status: "overdue", category: "Finance",
    estimatedTime: "15 mins", subtasks: [], createdAt: daysAgo(8) },
  { id: "stud-303", title: "Reply to Microsoft recruiter email",
    description: "Pre-placement talk follow-up from Microsoft HR. Express interest, ask next steps",
    priority: "high", deadline: daysAgo(2), status: "overdue", category: "Work",
    estimatedTime: "20 mins", subtasks: [], createdAt: daysAgo(5) },
];

// ── combine ───────────────────────────────────────────────────────────────────
const tasks = [
  ...completedTasks,
  ...inProgressTasks,
  ...pendingTasks,
  ...overdueTasks,
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. GOALS with milestones
// ═══════════════════════════════════════════════════════════════════════════════
const goals = [
  { id: "goal-1",
    title: "Land a Summer Internship at a Top Tech Company",
    description: "Targeting FAANG/MANGO companies for SDE intern Summer 2026. DSA mastery + 3 projects + strong resume/LinkedIn.",
    deadline: daysAhead(45), progress: 35,
    milestones: JSON.stringify([
      { title: "Complete Striver's SDE Sheet (75 problems)", done: true },
      { title: "Build 3 production-grade projects with live demos", done: false },
      { title: "Solve 150+ problems on LeetCode (rating 1600+)", done: false },
      { title: "Secure 2 referrals and apply to 30+ companies", done: false },
      { title: "Pass technical interviews and get offer", done: false },
    ]),
  },
  { id: "goal-2",
    title: "Maintain 9.0+ CGPA for Placement Eligibility",
    description: "Many top companies have CGPA cutoffs. Target 9.0+ in Sem 4 and beyond.",
    deadline: daysAhead(120), progress: 45,
    milestones: JSON.stringify([
      { title: "Score 9.0+ in End-Semester Exams (Sem 4)", done: false },
      { title: "Maintain 9.0+ in Sem 5 (OS, CN, DBMS)", done: false },
      { title: "Complete all assignments on time (zero late submissions)", done: false },
      { title: "Ace mid-semester exams for all 6 subjects", done: false },
    ]),
  },
  { id: "goal-3",
    title: "Build a Strong Developer Portfolio Online",
    description: "Recruiters spend ~6 seconds on a resume. GitHub + LinkedIn + personal brand is critical.",
    deadline: daysAhead(60), progress: 50,
    milestones: JSON.stringify([
      { title: "Launch portfolio website with 3+ live projects", done: false },
      { title: "GitHub: 200+ contributions in the last year", done: false },
      { title: "Write 5 technical blog posts (Hashnode / Medium)", done: false },
      { title: "Connect with 100+ professionals on LinkedIn", done: false },
      { title: "Get 2+ recommendations from seniors / mentors", done: false },
    ]),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CHAT HISTORY
// ═══════════════════════════════════════════════════════════════════════════════
const chatHistory = [
  { role: "user", content: "Hey! I'm a 2nd year CS student trying to get into a top tech company for summer internship. Can you help me track my prep?" },
  { role: "model", content: "Absolutely! I can help with:\n\n🎯 **Goals tracking** — set milestones for DSA, projects, and application timeline\n📋 **Daily task management** — break big prep goals into daily actionable tasks\n📊 **Analytics** — track your coding streak, practice hours, and progress\n📅 **Smart scheduling** — I can block your day around college classes and coding practice\n\nWhere do you want to start?" },
  { role: "user", content: "Let's set up my goals: finish Striver's SDE sheet, build 3 projects, and maintain 9+ CGPA." },
  { role: "model", content: "Great goals! I've set up three milestones for you:\n\n🎯 **Goal 1:** Complete Striver's SDE Sheet — 0% progress, aim 5-8 problems/day\n🎯 **Goal 2:** Build 3 production projects — expense tracker → Chat App → open-source PR\n🎯 **Goal 3:** Maintain 9.0+ CGPA — practice tests + daily revision blocks\n\nShall I break the SDE sheet into daily tasks starting today?" },
  { role: "user", content: "Yes, schedule 10 DSA problems for today and also remind me to start the Chat App project — deadline is this Friday." },
  { role: "model", content: "Here's today's plan:\n\n🔴 URGENT — 10 DSA problems (Arrays + Strings, ~3h)\n🟡 HIGH — Chat App skeleton + Socket.io setup (~4h)\n🟡 HIGH — DBMS assignment — Normalisation problems (~2h)\n⚪ MEDIUM — Gym + meal prep (1.5h)\n\nI've set a reminder for Chat App submission by Friday EOD. Want me to break it into subtasks?" },
  { role: "user", content: "Break the Chat App into subtasks — frontend, backend, and deployment separately." },
  { role: "model", content: "Split into 4 tasks:\n\n1. ✅ Backend API — Express + Socket.io auth & message routes\n2. 🔨 Frontend UI — React chat interface with real-time messaging\n3. ⏳ Testing & polish — edge cases, error handling\n4. ⏳ Deploy to Vercel — CI/CD + env setup\n\nLooks like your backend is already done — nice work! Need deadline adjustments?" },
  { role: "user", content: "I missed submitting my CN lab journal yesterday 😅. Also got a Microsoft recruiter email 2 days ago — haven't replied yet. Can you set those up as urgent overlue tasks?" },
  { role: "model", content: "Added both:\n\n🔴 URGENT — Submit CN lab journal (1 day overdue — attendance penalty risk)\n🟡 HIGH — Reply to Microsoft recruiter (2 days overdue — they won't wait)\n\n💡 For the Microsoft email: keep it concise, mention something specific from their talk, and ask about next steps. Want me to draft one?" },
  { role: "user", content: "Yes please. Also I have 2 end-sem exams next week. Let me reschedule some pending tasks so I don't overload." },
  { role: "model", content: "Smart move. Here's what I've adjusted:\n\n➡️ DBMS mini-project → pushed 5 days out (after exams)\n➡️ HackerRank contests → moved to after exams\n\nKeeping active:\n• DSA practice (2h/day — non-negotiable)\n• OOP revision (on track with syllabus)\n\nDuring exams: 3h/day DSA minimum. Sound fair?" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PERSIST TASKS / GOALS / CHAT
// ═══════════════════════════════════════════════════════════════════════════════
saveState({ tasks, goals, chatHistory });

// ═══════════════════════════════════════════════════════════════════════════════
// 6. BUILD ANALYTICS (daily_logs + streak stats) — NO recordCompletion()
// ═══════════════════════════════════════════════════════════════════════════════
// recordCompletion() forces every completedAt to `now` and dumps all completions
// into today's date.  We need real historical dates in daily_logs so we write
// them directly from each task's completedAt field.

// 6a. wipe and re-seed daily_logs + user_stats
heatDb.prepare("DELETE FROM daily_logs").run();
heatDb.prepare("DELETE FROM user_stats").run();
heatDb.prepare("INSERT INTO user_stats (id) VALUES (1)").run();

// upsert prepared for daily_logs (category key is a single JSON path segment)
const upsertLog = heatDb.prepare(
  `INSERT INTO daily_logs (date, tasksCompleted, tasksCreated, focusMinutes, categoryBreakdown)
   VALUES (?, ?, ?, ?, ?)
   ON CONFLICT(date) DO UPDATE SET
     tasksCompleted = tasksCompleted + excluded.tasksCompleted,
     focusMinutes   = focusMinutes + excluded.focusMinutes,
     categoryBreakdown = json_set(
       COALESCE(daily_logs.categoryBreakdown, '{}'),
       '$.' || excluded.categoryBreakdown,
       COALESCE(json_extract(daily_logs.categoryBreakdown, '$.' || excluded.categoryBreakdown), 0)
       + excluded.tasksCompleted
     )`
);

function upsertDay(dateStr, dayTasks) {
  const done  = dayTasks.length;
  const focus = done * 45;                      // ~45 min avg focus per completed task
  const cats  = {};
  dayTasks.forEach(t => { cats[t.category] = (cats[t.category] || 0) + 1; });
  // merge each category separately so json_set doesn't clobber
  const key = Object.keys(cats)[0];             // primary category for the upsert key
  upsertLog.run(dateStr, done, done, focus, key);
}

// 6b. one row per date that has actual completed tasks (using their real completedAt)
const byDate = {};
completedTasks.forEach(t => {
  const k = dateStr(t.completedAt);
  (byDate[k] ||= []).push(t);
});
Object.entries(byDate).forEach(([d, dt]) => upsertDay(d, dt));

// 6c. 21-day heatmap backfill (ensures consecutive dates including rest days)
const backfill = [
  { o:-20, d:3, f:200 }, { o:-19, d:4, f:260 }, { o:-18, d:2, f:140 },
  { o:-17, d:5, f:320 }, { o:-16, d:0, f:0   },
  { o:-15, d:4, f:270 }, { o:-14, d:3, f:190 }, { o:-13, d:5, f:310 },
  { o:-12, d:2, f:130 }, { o:-11, d:0, f:0   },
  { o:-10, d:1, f:60  }, { o:-9,  d:4, f:270 }, { o:-8,  d:3, f:210 },
  { o:-7,  d:0, f:0   },
  { o:-6,  d:5, f:340 }, { o:-5,  d:6, f:400 }, { o:-4,  d:4, f:280 },
  { o:-3,  d:3, f:220 }, { o:-2,  d:2, f:150 }, { o:-1,  d:4, f:260 },
  { o: 0,  d:4, f:190 },
];
backfill.forEach(({ o, d, f }) => {
  const ds = new Date(now.getTime() + o * DAY).toISOString().slice(0, 10);
  if (byDate[ds]) return;                     // real tasks already wrote this date
  if (d === 0) {
    heatDb.prepare(
      `INSERT OR IGNORE INTO daily_logs (date,tasksCompleted,tasksCreated,focusMinutes,categoryBreakdown)
       VALUES (?,0,0,0,'{}')`
    ).run(ds);
    return;
  }
  const cats = { Study: Math.ceil(d*0.45), Work: Math.ceil(d*0.30), Personal: Math.max(0, d - Math.ceil(d*0.75)) };
  upsertLog.run(ds, d, d, f, Object.keys(cats)[0]);
});

// 6d. recompute streak stats from the correct daily_logs
const logRows = heatDb
  .prepare(
    "SELECT date, tasksCompleted FROM daily_logs WHERE date >= ? ORDER BY date ASC"
  )
  .all(new Date(now.getTime() - 30 * DAY).toISOString().slice(0, 10));

let currentStreak = 0, longestStreak = 0, run = 0;
for (const row of logRows) {
  if (row.tasksCompleted > 0) { run++; longestStreak = Math.max(longestStreak, run); }
  else run = 0;
}
for (let i = logRows.length - 1; i >= 0; i--) {
  if (logRows[i].tasksCompleted > 0) currentStreak++;
  else break;
}
const totalCompletions = logRows.reduce((a, r) => a + r.tasksCompleted, 0);
const lastActiveDate = [...logRows].reverse().find(r => r.tasksCompleted > 0)?.date
  ?? new Date().toISOString().slice(0, 10);

heatDb.prepare(
  "UPDATE user_stats SET currentStreak=?,longestStreak=?,totalCompletions=?,lastActiveDate=?,updatedAt=datetime('now') WHERE id=1"
).run(currentStreak, Math.max(currentStreak, longestStreak, 7), totalCompletions, lastActiveDate);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════════════════
unlockAchievement("first_task",  "Getting Started",  "Complete your first task",            "CheckCircle2");
unlockAchievement("five_tasks",  "On a Roll",        "Complete 5 tasks in one day",         "Zap");
unlockAchievement("streak_3",    "3-Day Streak",     "Stay active for 3 consecutive days",  "Flame");
unlockAchievement("first_goal",  "Goal Setter",      "Set your first long-term goal",       "Target");
unlockAchievement("goal_half",   "Halfway There",    "Reach 50% progress on any goal",      "TrendingUp");
unlockAchievement("streak_7",    "Week Warrior",     "A full week of activity",             "Trophy");
unlockAchievement("first_project","Builder",          "Ship your first project",             "Rocket");
unlockAchievement("dsa_10",      "Problem Solver",   "Solve 10 DSA problems in one day",    "Brain");

heatDb.close();

// ═══════════════════════════════════════════════════════════════════════════════
// 8. REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const s = loadState();
const {
  getCurrentStreak, getLongestStreak, getTotalCompletions,
  getHeatmapData, getDailyLogs, getAchievements,
} = require(path.join(__dirname, "..", "lib", "db"));

console.log("\n🎓 Student seed complete! (Arjun Mehta — 2nd Year CS)");
console.log(
  ` Tasks : ${s.tasks.length} ` +
  `(${s.tasks.filter((t) => t.status === "completed").length} completed, ` +
  `${s.tasks.filter((t) => t.status === "in_progress").length} in-progress, ` +
  `${s.tasks.filter((t) => t.status === "pending").length} pending, ` +
  `${s.tasks.filter((t) => t.status === "overdue").length} overdue)`
);
console.log(
  ` Goals : ${s.goals.length} | ` +
  `Milestones: ${s.goals.reduce((a, g) => a + g.milestones.length, 0)} total, ` +
  `${s.goals.reduce((a, g) => a + g.milestones.filter((m) => m.done).length, 0)} done`
);
console.log("\n Chat : " + s.chatHistory.length + " messages");
console.log("\n Analytics");
console.log(" Streak : " + getCurrentStreak() + " active (best: " + getLongestStreak() + ")");
console.log(" Completions: " + getTotalCompletions());
console.log(" Heatmap : " + getHeatmapData().length + " days with activity");
console.log(" Daily logs : " + getDailyLogs(14).length + " entries (14d)");
console.log(" Achievements: " + getAchievements().length + " unlocked\n");
