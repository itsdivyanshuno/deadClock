<div align="center">

# ⏱ deadClock

### The Last-Minute Life Saver

**An AI productivity companion that plans, prioritises, and helps you beat every deadline.**

Turns *"I have too much to do"* into a structured plan in one message — no forms, no manual sorting, no cognitive overhead.

🛠 **Built with**

| | | | | |
|---|---|---|---|---|
| ⚡ **[Next.js 16](https://nextjs.org/)** | ⚛️ **[React 19](https://react.dev/)** | 🎨 **[Tailwind CSS v4](https://tailwindcss.com/)** | 🤖 **[Google Gemini](https://ai.google.dev/)** | 🗄️ **[SQLite](https://github.com/WiseLibs/better-sqlite3)** |

<!--
🎬 DEMO GIF — replace the line below with your screen recording.
Record in 720p, keep it under 10 seconds. Show: user types a message → AI creates + prioritises tasks.
Example: `![Demo](https://raw.githubusercontent.com/<your-username>/<repo>/main/docs/demo.gif)`
-->
_<!-- 📸 Add demo GIF here → [![Demo](https://via.placeholder.com/800x450/111/fff?text=📸+Add+your+demo+GIF+here)] -->_

<!--
🔗 LIVE DEMO — replace with your deployed URL after pushing to Vercel / Netlify / Railway.
Example: `[![Live Demo](https://img.shields.io/badge/-🚀+Live+Demo-000?logo=vercel&logoColor=white)](https://your-app.vercel.app)`
-->
_<!-- 🔗 Add live demo badge here -->_

</div>

---

## 🔥 Why deadClock?

Most productivity apps make you *do more admin* — filling out forms, dragging Kanban cards, tagging, filtering. deadClock removes all of that.

You **chat like you would with a friend**, and the AI handles the rest: creating tasks, sorting by urgency, breaking down big goals, and warning you when something is at risk.

> 📝 **"I have a project presentation due Friday, three reports to send, and I need to study for my exam this week. Help me plan."**
>
> deadClock → 12 tasks created, ranked by deadline, goal milestones broken into daily actions, and a clear "focus today" list in 3 seconds.

---

## ✨ Core features

|  |  |
|---|---|
| 🤖 **AI-native task management** | Chat naturally with an assistant that creates, prioritises, and completes tasks using **Gemini function calling** — no forms, no click-work. |
| 🎯 **Goal tracking with milestones** | Set long-term goals and the AI breaks them into proportional weekly tasks based on how many hours you can actually dedicate. |
| ⚠️ **At-risk deadline detection** | Tasks within your risk window are flagged automatically; the AI suggests realistic reschedules so nothing silently slips. |
| 🧠 **Proactive suggestions** | Based on your workload, overdue items, and goal progress — surfaces what you should focus on right now, without you asking. |
| 💬 **Clean three-pane interface** | Sidebar overview, main chat surface, and task/goal views. Everything stays in sync automatically. |
| 🔒 **Fully local persistence** | Tasks, goals, and chat history live in SQLite on your machine. No accounts, no cloud sync, no third-party storage. |

---

## 🛠 Tech stack

| Layer | Choice | Role |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) | Full-stack React framework with API routes |
| UI | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Client rendering and design system |
| AI engine | [Google Gemini API](https://ai.google.dev/) via `@google/genai` | All reasoning and function calling |
| Model | `gemini-2.5-flash` | Fast multimodal LLM with native function calling |
| Persistence | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Local SQLite database (`data.db`) |
| Runtime | Node.js | Required for the native SQLite addon |

---

## ⚡ How it works

```
┌────────────────────────────────────────────────────────────────────┐
│  User types message                                                │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  POST /api/chat { message }                                        │
│  • Loads state from SQLite                                         │
│  • Sends system prompt + chat history → Gemini                     │
│  • Gemini may call tools: add_task, prioritise_tasks, …           │
│  • Tool results mutate in-memory state                             │
│  • Gemini produces a follow-up text response                       │
│  • State is persisted back to SQLite (1 transaction)               │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
              { response, tasks[], goals[] } ──► Client updates
```

The client never mutates the server-side store directly. Every change is mediated by the Gemini agent through defined tool contracts. `saveState()` uses a single SQLite transaction so the DB is always a consistent snapshot.

---

## 🔧 Gemini tools

The AI agent exposes **9 function-calling tools** to Gemini:

| Tool | What it does |
|---|---|
| `add_task` | Create a task with deadline, priority, category, and subtasks |
| `prioritise_tasks` | Re-sort pending tasks by urgency and impact |
| `complete_task` | Mark a task as done |
| `add_goal` | Create a long-term goal with milestones |
| `suggest_schedule` | Generate a time-blocked daily plan |
| `get_reminders` | Surface urgent / overdue tasks |
| `suggest_proactive_actions` | Analyse workload and surface proactive suggestions |
| `break_down_goal` | Split a goal into proportional weekly tasks |
| `reschedule_at_risk_tasks` | Extend deadlines with a safety buffer |

---

## 📁 Project structure

```
app/
├── page.tsx              ← Client UI: chat, tasks, goals views
├── layout.tsx            ← Root HTML/body wrapper + SEO metadata
├── globals.css           ← Tailwind tokens, design system, light palette
└── api/
    └── chat/
        └── route.ts      ← POST (AI chat) + GET (state hydration)

lib/
├── agent.ts              ← Gemini agent: tools, chat orchestrator, helpers
└── db.js                 ← SQLite persistence (loadState / saveState)

notes/
├── REFERENCE.md          ← Active project context
├── SUBMISSION_DOC.md     ← Hackathon submission content (Markdown)
├── submission-doc.html   ← Submission preview (browser-ready)
└── submission-doc.docx   ← Upload to Google Drive → Google Docs
```

---

## 🚀 Getting started

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)
- A [Gemini API key](https://aistudio.google.com/app/apikey)

### Install and run

```bash
# 1. Clone
git clone https://github.com/itsdivyanshuno/vibe2ship-lastminute-lifesaver.git
cd vibe2ship-lastminute-lifesaver

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
cp .env.local.example .env.local   # paste in your key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and describe your day:

> *"I have a project presentation due Friday and three reports to send. Help me plan my week."*

---

## 🏗 Architecture

- **All AI logic lives server-side.** The `chat()` function in `lib/agent.ts` is the single entry point — it loads state, calls Gemini, dispatches tools, and persists results.
- **The client is a thin orchestrator.** `app/page.tsx` holds UI state and delegates to a single fetch against `/api/chat`.
- **State is append-and-replace.** `saveState()` clears all rows then re-inserts them inside one SQLite transaction, so the DB is always a perfect snapshot.
- **Local-first.** No accounts, no cloud sync, no cookies. SQLite is the only backing store.

---

## 🏆 For judges — Vibe2Ship June 22–29 2026

<!--
📦 SUBMISSION — fill these in before submitting to the hackathon.
- `DEMO_VIDEO`: your screen recording link (YouTube / Loom / Google Drive)
- `SUBMISSION_LINK`: link to your Google Docs / Devpost submission
- `SLIDES`: link to your pitch deck if you made one
Leave the placeholders visible as TODO reminders until you fill them.
-->

| Resource | Link |
|---|---|
| 🎬 Demo video | `<!-- TODO: paste your demo video link here → [▶ Watch](url) -->` |
| 📄 Submission doc | `<!-- TODO: paste your submission doc link here → [📝 Read](url) -->` |
| 🎨 Pitch deck | `<!-- TODO: paste slide deck link here if you have one → [📊 Slides](url) -->` |

---

## 💡 What makes this different

| Area | Highlights |
|---|---|
| Agentic depth | 9 Gemini tools, proactive workload analysis, autonomous goal breakdown |
| Local-first | SQLite via `better-sqlite3`, no accounts, no cloud, no cookies |
| Performance | Turbopack (Next 16), static page generation, single-transaction writes |
| Code quality | JSDoc on every public function, typed interfaces, explicit error contracts |
| UX | Conversation-first — zero onboarding friction, instant first value |

---

<div align="center">

Built for the [Vibe2Ship](https://vibe2ship.com) hackathon — June 22–29, 2026

[⬆ back to top](#-deadclock)

</div>
