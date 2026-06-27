# deadClock — The Last-Minute Life Saver

> An AI productivity companion that plans, prioritises, and helps you beat every deadline.

---

## Tech Stack

| Layer | Choice | Role |
|-------|--------|------|
| Framework | Next.js 14 (App Router) | — |
| Language | TypeScript + React | — |
| Styling | Tailwind CSS v3 | — |
| AI Engine | OpenAI API (GPT-4o / GPT-4o Mini) | — |
| State Management | Zustand | — |
| Charts | Recharts | — |
| Rich Text | Tiptap | — |
| Persistence | LocalStorage / sessionStorage | — |
| Routing | Next.js App Router (file-based) | — |
| Animations | Framer Motion | — |
| Icons | Lucide React | — |

---
## Core Features

- AI-native task management – chat naturally with an assistant that creates, prioritises, and completes tasks (OpenAI function calling).
- Goal tracking with milestones – set long-term goals and break them into proportional weekly tasks automatically.
- At-risk deadline detection – the AI identifies tasks within a 24-hour risk window and suggests realistic reschedules.
- Proactive workload assistant – based on your current load, overdue items, and goal progress, the assistant surfaces what you should focus on right now.
- Clean three-pane interface – sidebar overview, main chat surface, and task/goal views that stay in sync automatically.
- Local-first persistence – all data stays in your browser (Zustand + LocalStorage). No accounts, no cloud sync.

---
## How It Works

```
User types message → POST /api/chat → OpenAI agent (lib/agent.ts)
  ├─ Loads state from LocalStorage
  ├─ Sends system prompt + chat history → GPT-4o
  ├─ GPT-4o may call tools: add_task, prioritise_tasks, …
  ├─ Tool results mutate in-memory state
  ├─ GPT-4o produces a follow-up text response
  ├─ State is persisted to LocalStorage (Zustand)
  └─ Returns { response, tasks[], goals[] } → Client updates state
```

The client never mutates the server-side store directly. Every change flows through the OpenAI agent via defined tool contracts.

---
## OpenAI Tools (Function Calling)

| Tool | Purpose |
|------|---------|
| `add_task` | Create a task with title, deadline, priority, category, and subtasks. |
| `prioritize_tasks` | Re-sort pending tasks by urgency and impact. |
| `complete_task` | Mark a task done by ID. |
| `add_goal` | Create a long-term goal with milestones. |
| `suggest_schedule` | Generate a time-blocked daily plan. |
| `get_reminders` | Surface urgent / overdue tasks. |
| `suggest_proactive_actions` | Analyse workload and surface proactive suggestions. |
| `break_down_goal` | Split a goal into proportional weekly tasks. |
| `reschedule_at_risk_tasks` | Extend deadlines with a safety buffer. |

---
## Agentic Depth

- **9 OpenAI function-calling tools** — the AI has full CRUD + planning authority.
- **Proactive workload analysis** — surfaces overdue items and load imbalances unprompted.
- **Autonomous goal breakdown** — splits long-term goals into proportional weekly tasks.
- **Risk-aware rescheduling** — tasks due within 24 h get a safety-buffer extension.

---
## UI / UX

- **Three-pane desktop layout** — sidebar (overview + quick-nav), main canvas (chat / tasks / goals).
- **Smooth animations** — Framer Motion transitions on view switches, message bubbles, and card hover states.
- **Custom minimap** — visual task-progress renderer in the sidebar.
- **Slash commands** — type `/help`, `/schedule`, `/goals`, `/clear` in chat for fast actions.

---
## Project Structure

```
app/
├── layout.tsx       ← Root HTML wrapper + global providers
├── page.tsx         ← Main app shell (sidebar + canvas)
├── globals.css      ← Tailwind + design tokens
├── api/
│   └── openai/
│       └── route.ts ← Chat endpoint (Node.js runtime)
├── chat/
│   └── page.tsx     ← Dedicated full-screen chat view
└── components/
    ├── Chat/…       ← Message bubbles, input bar, slash commands
    ├── TaskBoard/…  ← Kanban-style task management
    ├── GoalTracker/ ← Timeline + milestone progress
    ├── Analytics/   ← Charts (Recharts)
    └── Settings/    ← Preferences pane

lib/
├── agent.ts      ← OpenAI agent: tools, orchestrator, helpers
├── store.ts      ← Zustand store + LocalStorage sync
└── utils.ts      ← Date helpers, ID generation

notes/
└── SUBMISSION_DOC.md ← This document
```

---

**Built with ❤️ for Vibe2Ship Hackathon 2026**  
Repository: https://github.com/itsdivyanshuno/vibe2ship-lastminute-lifesaver