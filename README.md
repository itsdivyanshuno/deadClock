<div align="center">

# ⚡ Deadline

### The Last-Minute Life Saver

**An AI-powered productivity companion that proactively helps you plan, prioritize, and complete tasks before deadlines.**

Built with ❤️ using [Next.js](https://nextjs.org/) + [Google Gemini](https://ai.google.dev/)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_flash-4285f4?logo=google&logoColor=white)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003b57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)

</div>

---

## What it does

Deadline isn't a todo list you have to maintain — it's an AI agent that has a conversation with you, understands your workload, and actively manages your tasks and goals on your behalf.

Instead of manually creating and sorting tasks, you describe what's on your plate and the AI:

- Breaks big goals into weekly plans
- Ranks tasks by urgency and deadline
- Alerts you when something is at risk
- Adapts suggestions to your available hours

All your data stays local — persisted to a SQLite database on your machine.

---

## Core features

<table>
<tr>
<td width="50%" valign="top">

### 🤖 AI-native task management
Chat naturally with an assistant that creates, prioritizes, and completes tasks using **Gemini function calling** — no forms or click-work required.

### 🎯 Goal tracking with milestones
Set long-term goals and watch the AI break them into proportional weekly tasks based on how many hours you can actually dedicate.

### ⚡ At-risk deadline detection
The AI identifies tasks that are within your deadlined window and suggests realistic rescheduling so nothing silently slips through the cracks.

</td>
<td width="50%" valign="top">

### 🧠 Proactive suggestions
Based on your current workload, overdue items, and goal progress, the assistant surfaces what you should focus on right now — without you having to ask.

### 💬 Chat-first interface
Three-panel layout: sidebar overview, main chat surface, and task/goal views. Everything stays in sync automatically.

### 🔒 Fully local persistence
Tasks, goals, and chat history live in a SQLite database. No accounts, no cloud sync, no third-party storage.

</td>
</tr>
</table>

---

## Tech stack

| Layer | Choice | Role |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) | Full-stack React framework with API routes |
| UI | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Client rendering and design system |
| AI engine | [Google Gemini API](https://ai.google.dev/) via `@google/genai` | All reasoning and function calling |
| Model | `gemini-2.5-flash` | Fast, multimodal LLM |
| Persistence | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Local SQLite database (`data.db`) |
| Runtime | Node.js | Required for the native SQLite addon |

---

## How it works

```
┌─────────────────────────────────────────────────────────────────┐
│                         User types message                       │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POST /api/chat { message }                    │
│  • Loads state from SQLite (loadState)                           │
│  • Sends system prompt + chat history to Gemini                  │
│  • Gemini may call tools: add_task, prioritize_tasks, …         │
│  • Tool results mutate in-memory state                           │
│  • Gemini produces a follow-up text response                     │
│  • State is persisted back to SQLite (saveState in 1 txn)       │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
   { response, tasks[], goals[] }  ──►  Client updates state
```

The client never mutates the server-side store directly. Every meaningful change is mediated by the Gemini agent through defined tool contracts. `saveState()` uses a single SQLite transaction so the store is always a consistent mirror of the in-memory agent state.

---

## Gemini tools

The AI agent exposes **9 function-calling tools** to Gemini:

| Tool | What it does |
|---|---|
| `add_task` | Create a task with deadline, priority, category, and subtasks |
| `prioritize_tasks` | Re-sort pending tasks by urgency and impact |
| `complete_task` | Mark a task as completed |
| `add_goal` | Create a long-term goal with milestones |
| `suggest_schedule` | Generate a time-blocked daily plan |
| `get_reminders` | Surface urgent / overdue tasks in a timeframe |
| `suggest_proactive_actions` | Analyse workload and surface proactive suggestions |
| `break_down_goal` | Split a goal into proportional weekly tasks |
| `reschedule_at_risk_tasks` | Propose realistic new deadlines for at-risk tasks |

---

## Project structure

```
app/
├── page.tsx                  ← Client UI: chat, tasks, goals views
├── layout.tsx                ← Root HTML/body wrapper + SEO metadata
├── globals.css               ← Tailwind tokens, design system, animations
└── api/
    └── chat/
        └── route.ts          ← POST (AI chat) + GET (state hydration)

lib/
├── agent.ts                  ← Gemini agent: tools, chat orchestrator, helpers
└── db.js                     ← SQLite persistence (loadState / saveState)

notes/
├── REFERENCE.md              ← Active project context (this you are reading)
└── archive/                  ← Old session notes, hackathon PDF, submission HTML
```

---

## Getting started

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
cp .env.local.example .env.local   # then paste in your key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and describe your day:

> "I have a project presentation due Friday and three reports to send. Help me plan my week."

---

## Architecture notes

- **All AI logic lives server-side.** The `chat()` function in `lib/agent.ts` is the single entry point — it loads state, calls Gemini, dispatches tools, and persists results.
- **The client is a thin orchestrator.** `app/page.tsx` holds UI state and delegates to a single fetch against `/api/chat`.
- **State is append-and-replace.** `saveState()` clears all rows then re-inserts them inside one SQLite transaction, so the DB is always a perfect snapshot of the agent's last turn.

---

## What's inside

| Area | Highlights |
|---|---|
| Agentic depth | 9 Gemini tools, proactive workload analysis, autonomous goal breakdown |
| Local-first | SQLite via better-sqlite3, no accounts, no cloud, no cookies |
| Performance | Turbopack (Next 16), static page generation, single transaction writes |
| Code quality | JSDoc on every public function, typed interfaces, explicit error contracts |

---

<div align="center">

Built for the [Vibe2Ship](https://vibe2ship.com) hackathon — June 22–29, 2026

[⬆ back to top](#-deadline)

</div>
