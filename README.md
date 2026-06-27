<div align="center">

# ⏱️ deadClock

### **The Last-Minute Life Saver**

**An AI-native productivity companion that plans, prioritises, and helps you beat every deadline.**

*Turns "I have too much to do" into an execution plan in a single message — no forms, no manual sorting, no cognitive overhead.*

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Local-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)

---

_📸 **Add your demo GIF here** → ![Demo](https://raw.githubusercontent.com/<your-username>/<repo>/main/docs/demo.gif)_

_🔗 **Add live demo badge here**_

</div>

---

## 🔥 Why deadClock?

Most productivity apps force you to do more admin work — filling out complex forms, managing tedious Kanban boards, manually tagging items, and maintaining filters. deadClock removes all of that friction.

You simply chat like you would with a friend, and the built-in AI handles everything else: creating tasks, sorting by urgency, breaking down massive goals, and sounding the alarm before something goes off the rails.

> 📝 **The Reality Check:**
> *"I have a project presentation due Friday, three reports to send, and I need to study for my exam this week. Help me plan."*
> 
> **deadClock Output** ⚡ 12 tasks instantly created, strictly ranked by deadline, massive goals broken into daily actions, and a crystal-clear "Focus Today" agenda delivered in 3 seconds flat.

---

## ✨ Core Features

* 🤖 **AI-Native Task Management:** Chat naturally with an assistant that dynamically creates, prioritises, and updates tasks using native Gemini function calling — zero forms required.
* 🎯 **Goal Tracking with Milestones:** Establish long-term objectives and watch the AI intelligently slice them into proportional weekly goals based on your actual available hours.
* ⚠️ **At-Risk Deadline Detection:** Tasks rapidly entering your risk threshold are automatically flagged. The AI steps in to suggest realistic, buffered schedules before failures happen.
* 🧠 **Proactive Suggestions:** Surface what you need to focus on right now without asking. The system automatically analyzes workload density, overdue items, and goal trajectories.
* 💬 **Clean Three-Pane Interface:** Enjoy an intuitive workspace divided into a sidebar overview, your main conversational interface, and dedicated real-time task/goal views.
* 🔒 **Fully Local Persistence:** Your privacy remains absolute. Tasks, goals, and chat histories live locally in an SQLite instance right on your machine. No cloud sync, no tracking.

---

## 🛠️ Tech Stack

| Layer | Technology | Operational Role |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Full-stack architecture with robust server-side API routing |
| **UI Layer** | React 19 + Tailwind CSS v4 | Cutting-edge client-side rendering alongside an optimized utility design system |
| **AI Engine** | Google Gemini API via @google/genai | Powering all core conversational reasoning and system tool dispatching |
| **Model** | gemini-2.5-flash | Lightning-fast multimodal LLM designed for high-performance function execution |
| **Persistence** | better-sqlite3 | Local high-speed SQLite data storage layer (data.db) |
| **Runtime** | Node.js | Required system foundation execution for native SQLite bindings |

---

## ⚡ How It Works

User types message -> POST /api/chat { message } -> Loads state -> Calls Gemini Engine -> State gets persisted back to SQLite -> Client UI updates.

The client never mutates the database directly. Every atomic state transition is completely mediated by the Gemini agent through strict tool execution contracts. saveState() utilizes unified single transactions to guarantee the database always operates as a consistent, corruption-free snapshot.

---

## 🔧 Gemini Tool Suite

The AI agent exposes 9 production-grade function-calling tools directly to Gemini:

| Tool Method | Operational Intent |
| :--- | :--- |
| add_task | Instantiates a structured task with a deadline, priority index, category, and subtasks. |
| prioritise_tasks | Dynamically re-sorts pending workload queues based on temporal urgency and overall impact. |
| complete_task | Formally flags a target task identifier as completed. |
| add_goal | Builds a long-term goal milestone timeline. |
| suggest_schedule | Automatically generates a time-blocked daily execution plan. |
| get_reminders | Aggressively surfaces upcoming, highly urgent, or overdue user assignments. |
| suggest_proactive_actions | Evaluates system workload densities to surface smart, automated contextual advice. |
| break_down_goal | Deconstructs a macro goal down into proportional, manageable weekly tasks. |
| reschedule_at_risk_tasks | Safely extends critical deadlines with an optimized safety buffer. |

---

## 📁 Project Structure

app/
├── page.tsx               <- Main Client View: handles chat, tasks, and goal rendering loops
├── layout.tsx             <- Root application HTML element wrappers + global SEO metadata
├── globals.css            <- Tailwind CSS tokens, core design system rules, color palettes
└── api/
    └── chat/
        └── route.ts       <- Core API: manages POST requests (AI context orchestration) & GET actions

lib/
├── agent.ts               <- Gemini Engine Core: tool schemas, agent dispatchers, conversational context
└── db.js                  <- Local SQLite Persistence System (handles safe loadState / saveState transactions)

notes/
├── REFERENCE.md           <- Active engineering scope and structural blueprint reference documentation
├── SUBMISSION_DOC.md      <- Raw Markdown containing project hackathon evaluation documentation
├── submission-doc.html    <- Generated local static HTML preview file for easy browser reading
└── submission-doc.docx    <- Word Document build target optimized for immediate Google Drive uploads

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18 or higher
* A package manager (npm, pnpm, or yarn)
* A valid Google Gemini API Key

### Installation & Initialization

1. Clone the project repository:
   git clone https://github.com/itsdivyanshuno/vibe2ship-lastminute-lifesaver.git
   cd vibe2ship-lastminute-lifesaver

2. Install all required node module dependencies:
   npm install

3. Establish your local environment configuration variables:
   cp .env.local.example .env.local
   # Open .env.local and paste your GEMINI_API_KEY inside

4. Boot up the local Next.js development engine:
   npm run dev

Navigate your browser over to http://localhost:3000 and dump your chaotic workload into the interface:
> "I have a project presentation due Friday and three reports to send. Help me plan my week."

---

## 🏗️ Architectural Guardrails

* **Server-Isolated Logic Execution:** All AI computational logic stays strictly isolated server-side. The orchestration function chat() inside lib/agent.ts is the single source of truth—it pulls state, commands Gemini, executes tools, and commits shifts.
* **Thin Orchestrated Client:** app/page.tsx acts purely as an interface event listener, tracking reactive display states and delegating heavy logic to a unified fetch pipeline targeting /api/chat.
* **Append-and-Replace Storage Operations:** To prevent data decay and structural fragmentation, saveState() cleans out tables and batch re-inserts complete structures within an isolated SQLite transaction.
* **True Local-First Footprint:** The application operates with no external account generation requirements, zero server cloud handshakes, and absolute tracking immunity. SQLite acts as your secure private machine vault.

---

## 🏆 Hackathon Reviewers — Vibe2Ship June 22–29, 2026

| Submission Artifact | Location & Direct Access Links |
| :--- | :--- |
| **🎬 Project Demo Video** | <!-- TODO: paste your demo video link here -> [▶ Watch Demo](url) --> |
| **📄 Written Submission Document** | <!-- TODO: paste your submission doc link here -> [📝 Read Doc](url) --> |
| **🎨 Strategic Pitch Deck** | <!-- TODO: paste slide deck link here if you have one -> [📊 View Slides](url) --> |

---

## 💡 What Makes deadClock Different?

* **Deep Agentic Autonomy:** Powered by 9 distinct Gemini calling tools executing real-time workload balancing, objective deconstruction, and threat indexing.
* **Pure Local-First Sovereignty:** Blazing-fast file read/writes using better-sqlite3. Zero reliance on tracking mechanisms, external databases, or cookie systems.
* **Optimized Performance Execution:** Leveraging Turbopack capabilities via Next.js 16 framework builds, ensuring instant page response times and single-cycle transactions.
* **Strict Code Architecture:** Complete JSDoc code documentation across every internal function, highly predictable typed interfaces, and clear structural error tracking.
* **Zero Onboarding Friction:** No sign-up walls or setup fatigue. Drop straight into the conversational workspace and get immediate scheduling results.

---

<div align="center">

Built with ⚡ for the [Vibe2Ship](https://vibe2ship.com) Hackathon — June 22–29, 2026

[⬆ Back to top](#-deadclock)

</div>
