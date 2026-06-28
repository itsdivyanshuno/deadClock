/**
 * Seed the local SQLite DB with realistic data for a 2nd-year Engineering student
 * targeting top tech companies (FAANG / top-product roles).
 *
 * Run: node scripts/seed-student-dummy-data.js
 *
 * Persona ─
 *   Name  : Arjun Mehta
 *   Branch: Computer Science, 2nd year (Sem 4)
 *   Goal  : Summer internship @ a top-tier tech company
 *   Focus : DSA, projects, placements prep
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
const iso = (d) => new Date(d).toISOString();
const daysAgo = (n) => iso(new Date(now.getTime() - n * DAY));
const daysAhead = (n) => iso(new Date(now.getTime() + n * DAY));
const daysAgoDate = (n) => new Date(now.getTime() - n * DAY)
  .toISOString().slice(0, 10);

// ── 1. wipe ───────────────────────────────────────────────────────────────────
saveState({ tasks: [], goals: [], chatHistory: [] });

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TASKS  (~40 tasks across 3 weeks, various statuses)
// ═══════════════════════════════════════════════════════════════════════════════

// ── completed tasks  (spread over past 21 days) ───────────────────────────────

const completedTasks = [
  // ─ Week 3 (most recent) ──────────────────────────────────────────────────
  {
    id: "stud-001",
    title: "Solve 10 LeetCode problems — DP & Graphs",
    description: "Focus on memoization patterns: House Robber, Coin Change, Longest Increasing Subsequence, then BFS/DFS problems on Graph theory",
    priority: "high",
    deadline: daysAgo(1),
    status: "completed",
    category: "Study",
    estimatedTime: "4 hours",
    subtasks: ["5 DP problems", "5 Graph problems", "Review solutions"],
    completedAt: daysAgo(1),
    createdAt: daysAgo(3),
  },
  {
    id: "stud-002",
    title: "Mock interview with PrepBuddy",
    description: "45-min DSA mock + resume walkthrough on Coderpad",
    priority: "high",
    deadline: daysAgo(1),
    status: "completed",
    category: "Study",
    estimatedTime: "1.5 hours",
    subtasks: [],
    completedAt: daysAgo(1),
    createdAt: daysAgo(2),
  },
  {
    id: "stud-003",
    title: "Push final version of Expense Tracker project",
    description: "Clean up README, add live demo link, write setup guide. Push to GitHub with proper commit messages",
    priority: "high",
    deadline: daysAgo(2),
    status: "completed",
    category: "Work",
    estimatedTime: "2 hours",
    subtasks: ["Polish README", "Add demo link", "Clean code"],
    completedAt: daysAgo(2),
    createdAt: daysAgo(6),
  },
  {
    id: "stud-004",
    title: "Complete DBMS assignment — Normalisation forms",
    description: "Answer 3NF, BCNF problems and ER diagram for library management system. Submit before midnight",
    priority: "medium",
    deadline: daysAgo(2),
    status: "completed",
    category: "Study",
    estimatedTime: "2 hours",
    subtasks: [],
    completedAt: daysAgo(2),
    createdAt: daysAgo(4),
  },
  {
    id: "stud-005",
    title: "Gym — Upper body + cardio",
    description: "Bench press, shoulder press, pull-ups + 15 min HIIT. Focus on consistency for placement physicals",
    priority: "medium",
    deadline: daysAgo(1),
    status: "completed",
    category: "Health",
    estimatedTime: "1.5 hours",
    subtasks: [],
    completedAt: daysAgo(1),
    createdAt: daysAgo(5),
  },
  {
    id: "stud-006",
    title: "Read OS chapter — Process Scheduling",
    description: "FCFS, SJF, Round Robin, Priority scheduling algorithms. Make notes for upcoming sem exam",
    priority: "medium",
    deadline: daysAgo(3),
    status: "completed",
    category: "Study",
    estimatedTime: "3 hours",
    subtasks: ["Read textbook", "Annotate notes", "Solve 5 practice Qs"],
    completedAt: daysAgo(3),
    createdAt: daysAgo(6),
  },
  {
    id: "stud-007",
    title: "Update resume — add internship experience",
    description: "Add summer intern deliverables at TechStart. Quantify impact: features shipped, bugs fixed, team size",
    priority: "high",
    deadline: daysAgo(3),
    status: "completed",
    category: "Work",
    estimatedTime: "1.5 hours",
    subtasks: ["Draft bullets", "Get peer review", "Finalise PDF"],
    completedAt: daysAgo(3),
    createdAt: daysAgo(7),
  },
  {
    id: "stud-008",
    title: "Practice system design — Design URL shortener",
    description: "Draw HLD, discuss DB schema, caching strategy, scaling approach. Post solution on LinkedIn",
    priority: "high",
    deadline: daysAgo(4),
    status: "completed",
    category: "Study",
    estimatedTime: "2 hours",
    subtasks: ["Sketch HLD", "Write explanation", "Post on LinkedIn"],
    completedAt: daysAgo(4),
    createdAt: daysAgo(8),
  },
  // ─ Week 2 ────────────────────────────────────────────────────────────────
  {
    id: "stud-009",
    title: "Complete Codeforces Div-2 round #842",
    description: "Target: solve at least 2/5 problems. Review editorial for unsolved after contest",
    priority: "high",
    deadline: daysAgo(5),
    status: "completed",
    category: "Study",
    estimatedTime: "2.5 hours",
    subtasks: ["Warm-up", "Contest participation", "Editorial review"],
    completedAt: daysAgo(5),
    createdAt: daysAgo(6),
  },
  {
    id: "stud-010",
    title: "Build REST API for Chat Application project",
    description: "Node.js + Express backend. Implement auth, CRUD for messages, WebSocket for real-time. All tests passing",
    priority: "high",
    deadline: daysAgo(7),
    status: "completed",
    category: "Work",
    estimatedTime: "5 hours",
    subtasks: ["Setup Express", "Auth routes", "Message routes", "WebSocket"],
    completedAt: daysAgo(7),
    createdAt: daysAgo(10),
  },
  {
    id: "stud-011",
    title: "CN assignment — TCP/IP model & subnetting",
    description: "Solve 8 subnetting problems and explain TCP 3-way handshake. Due before lab session",
    priority: "medium",
    deadline: daysAgo(7),
    status: "completed",
    category: "Study",
    estimatedTime: "2 hours",
    subtasks: [],
    completedAt: daysAgo(7),
    createdAt: daysAgo(9),
  },
  {
    id: "stud-012",
    title: "Morning jog — 3 km",
    description: "Uni campus loop. Goal: build stamina for upcoming placement fitness test",
    priority: "low",
    deadline: daysAgo(6),
    status: "completed",
    category: "Health",
    estimatedTime: "25 mins",
    subtasks: [],
    completedAt: daysAgo(6),
    createdAt: daysAgo(8),
  },
  {
    id: "stud-013",
    title: "LinkedIn post — System Design article",
    description: "Write about scaling challenges learned from URL shortener project. Tag placement cell and seniors",
    priority: "medium",
    deadline: daysAgo(6),
    status: "completed",
    category: "Work",
    estimatedTime: "1 hour",
    subtasks: ["Draft post", "Add diagram", "Publish + share"],
    completedAt: daysAgo(6),
    createdAt: daysAgo(8),
  },
  // ─ Week 1 ────────────────────────────────────────────────────────────────
  {
    id: "stud-014",
    title: "Solve Striver's SDE Sheet — Day 1: Arrays",
    description: "20 array problems from must-do list. Focus on two-pointer and sliding window technique",
    priority: "high",
    deadline: daysAgo(9),
    status: "completed",
    category: "Study",
    estimatedTime: "4 hours",
    subtasks: ["Problems 1-10", "Problems 11-20", "Doubt clearing"],
    completedAt: daysAgo(9),
    createdAt: daysAgo(10),
  },
  {
    id: "stud-015",
    title: "Complete CN lab report — Ethernet & Switching",
    description: "Observe packet flow in Wireshark, document findings per lab manual. Submit on LMS",
    priority: "medium",
    deadline: daysAgo(9),
    status: "completed",
    category: "Study",
    estimatedTime: "3 hours",
    subtasks: [],
    completedAt: daysAgo(9),
    createdAt: daysAgo(11),
  },
  {
    id: "stud-016",
    title: "Connect with 3 alumni in product companies",
    description: "Reach out to alumni at Google, Microsoft, Atlassian on LinkedIn. Ask about interview process and tips",
    priority: "high",
    deadline: daysAgo(11),
    status: "completed",
    category: "Work",
    estimatedTime: "1 hour",
    subtasks: ["Find alumni", "Personalised messages", "Follow up"],
    completedAt: daysAgo(11),
    createdAt: daysAgo(13),
  },
  {
    id: "stud-017",
    title: "Attend placement talk — Google recruiters on campus",
    description: "Take notes on their ideal candidate profile, ask about open intern roles. Update tracker sheet",
    priority: "high",
    deadline: daysAgo(12),
    status: "completed",
    category: "Work",
    estimatedTime: "1.5 hours",
    subtasks: ["Attend talk", "Network with recruiters", "Capture action items"],
    completedAt: daysAgo(12),
    createdAt: daysAgo(14),
  },
  {
    id: "stud-018",
    title: "Grocery shopping for the week",
    description: "Grocer: milk, eggs, oats, fruits, protein powder. Cook meal prep for next 3 days",
    priority: "low",
    deadline: daysAgo(8),
    status: "completed",
    category: "Personal",
    estimatedTime: "1 hour",
    subtasks: [],
    completedAt: daysAgo(8),
    createdAt: daysAgo(8),
  },
  {
    id: "stud-019",
    title: "Finish DSA notes — Recursion & Backtracking",
    description: "Summarise all patterns: subsets, permutations, N-Queens, Sudoku solver. Add to personal Notion notes",
    priority: "medium",
    deadline: daysAgo(14),
    status: "completed",
    category: "Study",
    estimatedTime: "3 hours",
    subtasks: [],
    completedAt: daysAgo(14),
    createdAt: daysAgo(16),
  },
  {
    id: "stud-020",
    title: "Automate college assignment submission reminder",
    description: "Python script to scrape LMS deadlines and send Telegram alerts 24h before due date",
    priority: "low",
    deadline: daysAgo(13),
    status: "completed",
    category: "Work",
    estimatedTime: "2 hours",
    subtasks: ["Scraper logic", "Telegram bot", "Cron scheduling"],
    completedAt: daysAgo(13),
    createdAt: daysAgo(15),
  },
];

// ── in-progress tasks  (active work right now) ────────────────────────────────

const inProgressTasks = [
  {
    id: "stud-101",
    title: "Build a real-time Chat Application (frontend)",
    description: "React + Socket.io client. Group chat, online indicators, message timestamps. Must deploy to Vercel by end of week",
    priority: "urgent",
    deadline: daysAhead(3),
    status: "in_progress",
    category: "Work",
    estimatedTime: "6 hours",
    subtasks: ["Setup React + Socket.io", "Build chat UI", "Real-time messages", "Deploy to Vercel"],
    createdAt: daysAgo(4),
  },
  {
    id: "stud-102",
    title: "Prepare for TCS NQT (aptitude + coding)",
    description: "Practice quantitative aptitude, logical reasoning and coding MCQs. Past papers available on PrepInsta",
    priority: "high",
    deadline: daysAhead(5),
    status: "in_progress",
    category: "Study",
    estimatedTime: "3 hours",
    subtasks: ["Quant practice", "LR practice", "Coding round prep"],
    createdAt: daysAgo(3),
  },
  {
    id: "stud-103",
    title: "LeetCode 75 Blind 75 — complete 30 more",
    description: "On problem 45/75. Focus on Trees, Heaps, and Graphs remaining. Review every wrong solution",
    priority: "high",
    deadline: daysAhead(10),
    status: "in_progress",
    category: "Study",
    estimatedTime: "8 hours",
    subtasks: ["Problems 46-55 (Trees)", "Problems 56-65 (Heaps)", "Problems 66-75 (Graphs)"],
    createdAt: daysAgo(10),
  },
  {
    id: "stud-104",
    title: "Write Blog — How I cracked my first coding contest",
    description: "Draft a post on Hashnode covering preparation strategy, mistakes made, and key takeaways. Share with college community",
    priority: "medium",
    deadline: daysAhead(4),
    status: "in_progress",
    category: "Work",
    estimatedTime: "2 hours",
    subtasks: ["Outline structure", "Write draft", "Add code snippets", "Publish on Hashnode"],
    createdAt: daysAgo(2),
  },
  {
    id: "stud-105",
    title: "Revise OOP concepts for upcoming quiz",
    description: "Topics: inheritance, polymorphism, abstract classes, virtual functions, design patterns (Singleton, Factory)",
    priority: "medium",
    deadline: daysAhead(2),
    status: "in_progress",
    category: "Study",
    estimatedTime: "3 hours",
    subtasks: [],
    createdAt: daysAgo(1),
  },
  {
    id: "stud-106",
    title: "Plan study schedule for end-semester exams",
    description: "Map out 4 weeks of study blocks. Prioritise weak subjects: OS, CN, DBMS. Allocate 2h/day for DSA too",
    priority: "high",
    deadline: daysAhead(2),
    status: "in_progress",
    category: "Study",
    estimatedTime: "2 hours",
    subtasks: ["List all subjects", "Mark weak topics", "Create calendar block"],
    createdAt: daysAgo(1),
  },
  {
    id: "stud-107",
    title: "Update GitHub portfolio site",
    description: "Add new projects (Expense Tracker, Chat App). Update About section with placement goals. Make it responsive",
    priority: "medium",
    deadline: daysAhead(6),
    status: "in_progress",
    category: "Work",
    estimatedTime: "3 hours",
    subtasks: ["Add project cards", "Update About", "Test on mobile"],
    createdAt: daysAgo(5),
  },
];

// ── pending tasks  (upcoming, not started yet) ────────────────────────────────

const pendingTasks = [
  // Future Study tasks
  {
    id: "stud-201",
    title: "Complete Striver's SDE Sheet — Trees & BST",
    description: "Problems on inorder/preorder/postorder traversal, level order, vertical order, BST operations, LCA",
    priority: "high",
    deadline: daysAhead(6),
    status: "pending",
    category: "Study",
    estimatedTime: "5 hours",
    subtasks: ["Traversal problems", "BST problems", "LCA & tree DP"],
    createdAt: daysAgo(1),
  },
  {
    id: "stud-202",
    title: "Practice DP — tabulation approach",
    description: "Convert earlier memoised solutions to iterative DP. Problems: Knapsack, LCS, LIS, Edit Distance",
    priority: "high",
    deadline: daysAhead(8),
    status: "pending",
    category: "Study",
    estimatedTime: "4 hours",
    subtasks: ["0/1 Knapsack", "LCS variants", "LIS", "Edit Distance"],
    createdAt: daysAgo(0),
  },
  {
    id: "stud-203",
    title: "Complete DBMS mini-project: Library Management System",
    description: "Tech stack: React + Node.js + MongoDB. Features: issue/return books, fine calculation, search",
    priority: "high",
    deadline: daysAhead(12),
    status: "pending",
    category: "Work",
    estimatedTime: "10 hours",
    subtasks: ["Design ER diagram", "Build backend API", "Build React frontend", "Write README"],
    createdAt: daysAgo(0),
  },
  {
    id: "stud-204",
    title: "Give 2 HackerRank contests this weekend",
    description: "Contest focus: Data Structures + Problem Solving. Target: top 20% ranking. Review post-contest",
    priority: "medium",
    deadline: daysAhead(4),
    status: "pending",
    category: "Study",
    estimatedTime: "3 hours",
    subtasks: [],
    createdAt: daysAgo(0),
  },
  {
    id: "stud-205",
    title: "Prepare PPT on Operating Systems — CPU Scheduling",
    description: "Group project with college team. Divide slides: Arjun covers Round Robin & Priority Scheduling",
    priority: "medium",
    deadline: daysAhead(7),
    status: "pending",
    category: "Study",
    estimatedTime: "3 hours",
    subtasks: ["Research Round Robin", "Create slides", "Coordinate with team"],
    createdAt: daysAgo(2),
  },
  {
    id: "stud-206",
    title: "Contribute to open source — Hacktoberfest project",
    description: "Find a good first issue on a beginner-friendly repo. Target: 1 PR merged before month-end",
    priority: "high",
    deadline: daysAhead(15),
    status: "pending",
    category: "Work",
    estimatedTime: "5 hours",
    subtasks: ["Find repo", "Read CONTRIBUTING.md", "Fix issue", "Submit PR"],
    createdAt: daysAgo(1),
  },
  // Personal / Health / Finance
  {
    id: "stud-207",
    title: "Renew Netflix / Spotify student subscription",
    description: "Auto-renewal lapsed. Re-activate before exam stress — need study playlists",
    priority: "low",
    deadline: daysAhead(2),
    status: "pending",
    category: "Personal",
    estimatedTime: "10 mins",
    subtasks: [],
    createdAt: daysAgo(0),
  },
  {
    id: "stud-208",
    title: "Pay mobile & WiFi bills",
    description: "Postpaid + home WiFi. Avoid disconnection during DSA grind week",
    priority: "medium",
    deadline: daysAhead(3),
    status: "pending",
    category: "Finance",
    estimatedTime: "15 mins",
    subtasks: [],
    createdAt: daysAgo(1),
  },
  {
    id: "stud-209",
    title: "Plan weekend trip with college friends",
    description: "Check train tickets, budget split, identify tourist spots. End-semester break celebration",
    priority: "low",
    deadline: daysAhead(10),
    status: "pending",
    category: "Personal",
    estimatedTime: "1 hour",
    subtasks: [],
    createdAt: daysAgo(2),
  },
  {
    id: "stud-210",
    title: "Gym membership renewal",
    description: "Annual membership expiring next month. Compare with new-year offers at nearby gym",
    priority: "low",
    deadline: daysAhead(14),
    status: "pending",
    category: "Health",
    estimatedTime: "20 mins",
    subtasks: [],
    createdAt: daysAgo(5),
  },
  {
    id: "stud-211",
    title: "Help roommate debug his ML assignment",
    description: "TensorFlow image classifier throwing shape mismatch errors. Review notebook together after dinner",
    priority: "low",
    deadline: daysAhead(2),
    status: "pending",
    category: "Study",
    estimatedTime: "1 hour",
    subtasks: [],
    createdAt: daysAgo(1),
  },
  {
    id: "stud-212",
    title: "Submit seminar report — Cloud Computing",
    description: "Write 8-page report on serverless architecture. Cite 3 research papers. Submit on LMS before Friday",
    priority: "medium",
    deadline: daysAhead(4),
    status: "pending",
    category: "Study",
    estimatedTime: "4 hours",
    subtasks: ["Research", "Write sections", "Citations & formatting"],
    createdAt: daysAgo(2),
  },
];

// ── overdue tasks  (missed deadlines — realistic for a student) ──────────────

const overdueTasks = [
  {
    id: "stud-301",
    title: "Submit CN lab journal — Week 4",
    description: "Forgot to submit on LMS. Must upload by tomorrow to avoid attendance penalty",
    priority: "high",
    deadline: daysAgo(1),
    status: "overdue",
    category: "Study",
    estimatedTime: "30 mins",
    subtasks: [],
    createdAt: daysAgo(6),
  },
  {
    id: "stud-302",
    title: "Pay semester exam form fee",
    description: "Last date was yesterday. Check if late fee applies, pay ASAP through college portal",
    priority: "urgent",
    deadline: daysAgo(1),
    status: "overdue",
    category: "Finance",
    estimatedTime: "15 mins",
    subtasks: [],
    createdAt: daysAgo(8),
  },
  {
    id: "stud-303",
    title: "Reply to Microsoft recruiter email",
    description: "Got pre-placement talk follow-up from Microsoft HR. Draft a short, professional reply showing interest",
    priority: "high",
    deadline: daysAgo(2),
    status: "overdue",
    category: "Work",
    estimatedTime: "20 mins",
    subtasks: [],
    createdAt: daysAgo(5),
  },
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
  {
    id: "goal-1",
    title: "Land a Summer Internship at a Top Tech Company",
    description:
      "Targeting FAANG/MANGO companies for SDE intern role in Summer 2026. Focus: DSA mastery, project portfolio, and strong resume + LinkedIn presence.",
    deadline: daysAhead(45),
    progress: 35,
    milestones: JSON.stringify([
      { title: "Complete Striver's SDE Sheet (75 problems)", done: true },
      { title: "Build 3 production-grade projects with live demos", done: false },
      { title: "Solve 150+ problems on LeetCode (rating 1600+)", done: false },
      { title: "Secure 2 referrals + apply to 30+ companies", done: false },
      { title: "Pass technical interviews & get offer", done: false },
    ]),
  },
  {
    id: "goal-2",
    title: "Maintain 9.0+ CGPA for Placement Eligibility",
    description:
      "Many top companies enforce a minimum CGPA cutoff. Target 9.0+ in Sem 4 and beyond to keep all doors open.",
    deadline: daysAhead(120),
    progress: 45,
    milestones: JSON.stringify([
      { title: "Score 9.0+ in End-Semester Exams (Sem 4)", done: false },
      { title: "Maintain 9.0+ in Sem 5 (OS, CN, DBMS)", done: false },
      { title: "Complete all assignments on time (no late submissions)", done: false },
      { title: "Ace mid-semester exams for all 6 subjects", done: false },
    ]),
  },
  {
    id: "goal-3",
    title: "Build a Strong Developer Portfolio Online",
    description:
      "Recruiters spend ~6 seconds on a resume. A personal brand + GitHub + LinkedIn presence is critical for standing out.",
    deadline: daysAhead(60),
    progress: 50,
    milestones: JSON.stringify([
      { title: "Launch personal portfolio website with 3+ projects", done: false },
      { title: "GitHub: 200+ contributions in the last year (green squares)", done: false },
      { title: "Write 5 technical blog posts (Hashnode / Medium)", done: false },
      { title: "Connect with 100+ professionals on LinkedIn", done: false },
      { title: "Get 2+ recommendations from seniors / mentors", done: false },
    ]),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CHAT HISTORY  (student-like conversation with the AI assistant)
// ═══════════════════════════════════════════════════════════════════════════════

const chatHistory = [
  {
    role: "user",
    content:
      "Hey! I'm a 2nd year CS student. I'm trying to get into a top tech company for a summer internship. Can you help me track my prep?",
  },
  {
    role: "model",
    content:
      "Absolutely! Here's what I can help you with:\n\n🎯 **Goals tracking** — let's set your long-term milestones (DSA targets, project deadlines, application timeline)\n📋 **Daily task management** — break big prep goals into daily actionable tasks\n📊 **Analytics** — track your coding streak, practice hours, and progress\n📅 **Smart scheduling** — I can block your day around college classes, assignments, and coding practice\n\nWhere do you want to start?",
  },
  {
    role: "user",
    content: "Let's set up my goals. I want to finish Striver's SDE sheet, build 3 projects, and maintain 9+ CGPA.",
  },
  {
    role: "model",
    content:
      "Great goals! Here's what I've created for you:\n\n🎯 **Goal 1:** Complete Striver's SDE Sheet (75 problems)\n   Progress: 0% — let's chip away daily, 5-8 problems/day\n\n🎯 **Goal 2:** Build 3 production-grade projects\n   Progress: 0% — I recommend: Expense Tracker → Chat App → Open Source PR\n\n🎯 **Goal 3:** Maintain 9.0+ CGPA\n   Progress: 0% — Practice tests + daily revision blocks\n\nShall I break the SDE sheet into daily tasks starting today?",
  },
  {
    role: "user",
    content:
      "Yes! Schedule 10 DSA problems for today and also remind me to start the Chat App project — I have a deadline this Friday.",
  },
  {
    role: "model",
    content:
      "Done! Here's today's plan:\n\n🔴 URGENT — 10 DSA problems (Arrays + Strings, ~3h)\n🟡 HIGH — Chat App project — set up skeleton + Socket.io (~4h)\n🟡 HIGH — DBMS assignment — Normalisation problems (~2h)\n⚪ MEDIUM — Gym + meal prep (1.5h)\n\nI've also set a reminder to submit the Chat App by Friday EOD. Want me to break down the Chat App into subtasks?",
  },
  {
    role: "user",
    content:
      "Break the Chat App into subtasks — frontend, backend, and deployment separately.",
  },
  {
    role: "model",
    content:
      "Split into 4 tasks:\n\n1. ✅ **Backend API** — Express + Socket.io auth & message routes (completed)\n2. 🔨 **Frontend UI** — React chat interface with real-time messaging (in progress)\n3. ⏳ **Testing & polish** — edge cases, error handling\n4. ⏳ **Deploy to Vercel** — CI/CD + env setup\n\nI can see you've already completed the backend this week — nice work! Need me to adjust any deadlines?",
  },
  {
    role: "user",
    content:
      "Hey, I missed submitting my CN lab journal yesterday 😅. Also the Microsoft recruiter email — I got it 2 days ago but haven't replied. Can you set them up as urgent tasks?",
  },
  {
    role: "model",
    content:
      "Added both as overdue tasks:\n\n🔴 URGENT — Submit CN lab journal (1 day overdue — possible attendance penalty)\n🟡 HIGH — Reply to Microsoft recruiter (2 days overdue — move fast, they won't wait forever)\n\n⚠️ Pro tip: For the Microsoft email, keep it concise — express genuine interest, mention a specific thing they said in the talk, and ask about next steps. Want me to draft one for you?",
  },
  {
    role: "user",
    content:
      "That would be great! Also, I have 2 end-sem exams next week. Let me reschedule some pending tasks so I don't overload.",
  },
  {
    role: "model",
    content:
      "Smart move. I've rescheduled:\n\n- DBMS mini-project → pushed 5 days out (after exams)\n- HackerRank contests → moved to after exams\n\nKept active:\n- DSA practice (2h/day — non-negotiable for placement prep)\n- OOP revision (on track with college syllabus)\n\nDuring exams: 3h/day for DSA minimum, rest for subject prep. Sound fair?",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 5. DAILY LOGS  (21 days of realistic student activity)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Pattern logic:
//   Weekdays (Mon-Fri): 2–6 tasks, moderate focus minutes
//   Weekends (Sat–Sun): 0–3 tasks, lighter
//   Exam week (days -4, -3): high activity, study-heavy
//   Random rest days: days -10 (light), -7 (weekend rest)

const heatDb = require("better-sqlite3")(
  path.join(__dirname, "..", "data.db")
);

const dailyPattern = [
  // offset, tasksCompleted, focusMinutes
  { offs: -20, done: 3, focus: 200 },
  { offs: -19, done: 4, focus: 260 },
  { offs: -18, done: 2, focus: 140 },
  { offs: -17, done: 5, focus: 320 },  // busy prep day
  { offs: -16, done: 0, focus: 0 },    // rest day
  { offs: -15, done: 4, focus: 270 },
  { offs: -14, done: 3, focus: 190 },
  { offs: -13, done: 5, focus: 310 },  // coding contest day
  { offs: -12, done: 2, focus: 130 },  // light — early start
  { offs: -11, done: 0, focus: 0 },    // weekend
  { offs: -10, done: 1, focus: 60 },   // lazy Sunday
  { offs: -9,  done: 4, focus: 270 },
  { offs: -8,  done: 3, focus: 210 },
  { offs: -7,  done: 0, focus: 0 },    // weekend
  { offs: -6,  done: 5, focus: 340 },  // exam week starts
  { offs: -5,  done: 6, focus: 400 },  // exam week peak
  { offs: -4,  done: 4, focus: 280 },
  { offs: -3,  done: 3, focus: 220 },
  { offs: -2,  done: 2, focus: 150 },
  { offs: -1,  done: 4, focus: 260 },
  { offs: 0,   done: 4, focus: 190 },  // today
];

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

dailyPattern.forEach(({ offs, done, focus }) => {
  const date = daysAgoDate(-offs); // offs is negative → daysAgo
  // recompute properly: offs -20 → daysAgo(20) → 20 days back
  const dateStr = new Date(now.getTime() + offs * DAY)
    .toISOString().slice(0, 10);

  // category breakdown: Study-heavy for a student
  const cats = {};
  if (done > 0) {
    cats.Study   = Math.ceil(done * 0.50);
    cats.Work    = Math.ceil(done * 0.30);
    cats.Personal= Math.max(0, Math.ceil(done * 0.10));
    cats.Health  = Math.max(0, Math.ceil(done * 0.08));
    cats.Finance = Math.max(0, Math.ceil(done * 0.02));
    // pad to reach `done`
    const total = Object.values(cats).reduce((a, b) => a + b, 0);
    if (total > 0 && total < done) cats.Study += done - total;
  }

  // json_set needs a string key for the category path
  // we store the cats as categoryBreakdown JSON, and pass one key as `categoryBreakdown` param
  upsertLog.run(
    dateStr,
    done,
    done,
    focus,
    JSON.stringify(cats)
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PERSIST
// ═══════════════════════════════════════════════════════════════════════════════

saveState({ tasks, goals, chatHistory });

// ═══════════════════════════════════════════════════════════════════════════════
// 7. RECORD COMPLETIONS (generates daily_logs + updates streak)
// ═══════════════════════════════════════════════════════════════════════════════

completedTasks.forEach((t) => recordCompletion(t));

// ═══════════════════════════════════════════════════════════════════════════════
// 8. FIX STREAK STATS from the actual daily_logs data
// ═══════════════════════════════════════════════════════════════════════════════

const logRows = heatDb
  .prepare(
    "SELECT date, tasksCompleted FROM daily_logs WHERE date >= ? ORDER BY date ASC"
  )
  .all(new Date(now.getTime() - 30 * DAY).toISOString().slice(0, 10));

let currentStreak = 0;
let longestStreak = 0;
let run = 0;

for (const row of logRows) {
  if (row.tasksCompleted > 0) {
    run++;
    longestStreak = Math.max(longestStreak, run);
  } else {
    run = 0;
  }
}

// current streak — walk backwards from today
for (let i = logRows.length - 1; i >= 0; i--) {
  if (logRows[i].tasksCompleted > 0) currentStreak++;
  else break;
}

const totalCompletions = logRows.reduce((a, r) => a + r.tasksCompleted, 0);
const lastActiveDate =
  [...logRows].reverse().find((r) => r.tasksCompleted > 0)?.date ??
  new Date().toISOString().slice(0, 10);

heatDb
  .prepare(
    `UPDATE user_stats SET
       currentStreak    = ?,
       longestStreak    = ?,
       totalCompletions = ?,
       lastActiveDate   = ?,
       updatedAt        = datetime('now')
     WHERE id = 1`
  )
  .run(
    currentStreak,
    Math.max(currentStreak, longestStreak, 7),
    totalCompletions,
    lastActiveDate
  );

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ACHIEVEMENTS (student-relevant)
// ═══════════════════════════════════════════════════════════════════════════════

unlockAchievement("first_task", "Getting Started", "Complete your first task", "CheckCircle2");
unlockAchievement("five_tasks", "On a Roll", "Complete 5 tasks in one day", "Zap");
unlockAchievement("streak_3", "3-Day Streak", "Stay active for 3 consecutive days", "Flame");
unlockAchievement("first_goal", "Goal Setter", "Set your first long-term goal", "Target");
unlockAchievement("goal_half", "Halfway There", "Reach 50% progress on any goal", "TrendingUp");
unlockAchievement("streak_7", "Week Warrior", "A full week of activity", "Trophy");
unlockAchievement("first_project", "Builder", "Ship your first project", "Rocket");
unlockAchievement("dsa_10", "Problem Solver", "Solve 10 DSA problems in one day", "Brain");

heatDb.close();

// ═══════════════════════════════════════════════════════════════════════════════
// 10. REPORT
// ═══════════════════════════════════════════════════════════════════════════════

const s = loadState();
const {
  getCurrentStreak,
  getLongestStreak,
  getTotalCompletions,
  getHeatmapData,
  getDailyLogs,
  getAchievements,
} = require(path.join(__dirname, "..", "lib", "db"));

console.log("\n🎓 Student seed complete! (Arjun Mehta — 2nd Year CS)");

console.log(
  `  Tasks  : ${s.tasks.length} ` +
    `(${s.tasks.filter((t) => t.status === "completed").length} completed, ` +
    `${s.tasks.filter((t) => t.status === "in_progress").length} in-progress, ` +
    `${s.tasks.filter((t) => t.status === "pending").length} pending, ` +
    `${s.tasks.filter((t) => t.status === "overdue").length} overdue)`,
);

console.log(
  `  Goals  : ${s.goals.length} | ` +
    `Milestones: ${s.goals.reduce((a, g) => a + g.milestones.length, 0)} total, ` +
    `${s.goals.reduce((a, g) => a + g.milestones.filter((m) => m.done).length, 0)} done`,
);

console.log("\n  Chat   : " + s.chatHistory.length + " messages");
console.log("\n  Analytics");
console.log("  Streak     : " + getCurrentStreak() + " active (best: " + getLongestStreak() + ")");
console.log("  Completions: " + getTotalCompletions());
console.log("  Heatmap    : " + getHeatmapData().length + " days with activity");
console.log("  Daily logs : " + getDailyLogs(14).length + " entries (14d)");
console.log("  Achievements: " + getAchievements().length + " unlocked\n");
