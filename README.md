<div align="center">

# ⏱ deadClock

### The Last-Minute Life Saver

**An AI productivity companion that plans, prioritises, and helps you beat every deadline.**

Turns *"I have too much to do"* into a structured plan in one message — no forms, no manual sorting.

🛠 **Built with**

| | | | | | | |
|---|---|---|---|---|---|---|
| ⚡ **[Next.js 16](https://nextjs.org/)** | ⚛️ **[React 19](https://react.dev/)** | 🎨 **[Tailwind CSS v4](https://tailwindcss.com/)** | 🤖 **[Google Gemini](https://ai.google.dev/)** | 🧩 **[shadcn/ui](https://ui.shadcn.com/)** | 🎬 **[Framer Motion](https://www.framer.com/motion/)** | 🗄️ **[SQLite](https://github.com/WiseLibs/better-sqlite3)** |

[🔗 Live Demo](#) • [🎬 Demo Video](#) • [📄 Report](#)

</div>

---

## 🎬 Demo

![deadClock Demo](./docs/demo.gif)

---

## 🔥 Why deadClock?

Most productivity apps create more work — forms, boards, tags, filters. deadClock removes all of that.

You **chat like you would with a friend**, and the AI handles the rest.

```text
"I have an exam on Friday, a presentation tomorrow,
and three assignments pending. Help me plan."
```

Within seconds deadClock:

- ✅ Creates and prioritises tasks automatically
- 🎯 Breaks long-term goals into weekly milestones
- ⚠️ Flags deadlines at risk before they slip
- 🧠 Surfaces what you should focus on right now

---

## ✨ Core features

| | |
|---|---|
| 🤖 **AI-native task management** | Natural conversation powered by Gemini function calling — no forms needed |
| 🎯 **Goal decomposition** | Converts long-term goals into realistic, proportional milestones |
| ⚠️ **Risk detection** | Identifies deadlines that may slip and suggests reschedules |
| 🧠 **Proactive suggestions** | Recommends what to work on next based on your actual workload |
| 💬 **Conversation-first UX** | Zero onboarding. Just chat. |
| 🔒 **Local-first storage** | Everything persists in SQLite on your machine. No cloud, no accounts |
| 🌙 **Dark mode** | Full light / dark theme with CSS custom properties |
| 📱 **Responsive design** | Mobile drawer sidebar, tablet-optimized grid, desktop layout |

---

## ⚡ How it works

```
┌─────────────────────────────────────────────────────────────────────┐
│ User types message                                                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ POST /api/chat { message }                                          │
│  • Loads state from SQLite                                          │
│  • Sends system prompt + chat history → Gemini                      │
│  • Gemini calls tools: add_task, prioritise_tasks, …               │
│  • Tool results mutate in-memory state                              │
│  • Gemini produces a text response                                  │
│  • State persisted back to SQLite (1 transaction)                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                  │
                                  ▼
{ response, tasks[], goals[] } ──► Client updates
```

Every meaningful change is mediated by the Gemini agent — the client never touches the server-side store directly. `saveState()` uses a single SQLite transaction so the DB is always a consistent snapshot.

---

## 🛠 Tech stack

| Layer | Choice | Role |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) | Full-stack React with API routes |
| UI Library | [shadcn/ui](https://ui.shadcn.com/) (base-nova) | Accessible component primitives via Base UI |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first design system with CSS `@theme` tokens |
| Animations | [Framer Motion](https://www.framer.com/motion/) | Orchestrated page transitions, message entrances |
| Icons | [Lucide](https://lucide.dev/) | Consistent icon set throughout the app |
| AI engine | [Google Gemini API](https://ai.google.dev/) via `@google/genai` | All reasoning and function calling |
| Model | `gemini-2.5-flash` | Fast multimodal LLM with native function calling |
| Persistence | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Local SQLite database (`data.db`) |
| Runtime | Node.js | Required for the native SQLite addon |

---

## 🔧 Gemini tools

<details>
<summary>10 function-calling tools exposed to Gemini</summary>

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
| `delete_task` | Remove a task permanently |

</details>

---

## 📁 Project structure

<details>
<summary>Click to expand</summary>

```
app/
├── page.tsx            ← Client root: state orchestration + view routing
├── layout.tsx          ← Root HTML wrapper, TooltipProvider, Geist font
├── globals.css         ← Tailwind v4 @theme tokens, dark mode, animations
└── api/chat/
    └── route.ts        ← POST (AI chat) + GET (DB hydration)

components/
├── layout/
│   ├── app-shell.tsx   ← Responsive shell: mobile drawer, desktop sidebar
│   └── sidebar.tsx     ← Nav, collapsible task/goal previews, urgent banner
├── chat/
│   └── chat-view.tsx   ← Message list, typing indicator, quick-start chips
├── tasks/
│   └── tasks-view.tsx  ← Filterable task cards with priority badges
├── goals/
│   └── goals-view.tsx  ← Expandable goal cards with milestone checkboxes
├── dashboard/
│   └── dashboard-overview.tsx ← Stat cards, urgent spotlight, progress
└── shared/
    ├── priority-badge.tsx     ← Lucide-backed priority pills (Urgent/High/Med/Low)
    ├── loading-skeleton.tsx   ← Skeleton loaders for chat/tasks/goals/sidebar
    └── empty-state.tsx        ← Animated empty states with icons + CTAs

lib/
├── agent.ts        ← Gemini agent, 10 tool definitions, orchestrator
└── db.js           ← SQLite persistence layer (load/save)

components/ui/     ← shadcn/ui primitives (Button, Card, Badge, Tabs, …)
```

</details>

---

## 🚀 Getting started

### Prerequisites

- Node.js 18+
- npm
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

- **All AI logic lives server-side.** `lib/agent.ts` is the single entry point — loads state, calls Gemini, dispatches tools, persists results.
- **The client is a thin orchestrator.** `app/page.tsx` holds UI state and delegates to a single `/api/chat` fetch.
- **State is append-and-replace.** `saveState()` clears all rows then re-inserts them inside one SQLite transaction — the DB is always a perfect snapshot.
- **Local-first.** No accounts, no cloud sync, no cookies. SQLite is the only backing store.
- **Component-based UI.** 15+ extracted components across 6 directories, all typed, all animated.

---

## 🏆 Vibe2Ship — June 22–29 2026

| Resource | Link |
|---|---|
| 🎬 Demo video | [▶ Watch](#) |
| 📄 Submission doc | [📝 Read](#) |
| 🎨 Pitch deck | [📊 Slides](#) |

---

## 💡 What makes this different

| Area | Highlights |
|---|---|
| Agentic depth | 10 Gemini tools, proactive workload analysis, autonomous goal breakdown |
| Local-first | SQLite via `better-sqlite3`, no accounts, no cloud, no cookies |
| Performance | Turbopack, static page generation, single-transaction writes |
| Component architecture | shadcn/ui + Framer Motion + Lucide, fully typed, responsive |
| Code quality | JSDoc everywhere, typed interfaces, explicit error contracts |
| UX | Conversation-first — zero onboarding friction, instant first value |

---

<div align="center">

Built with ❤️ for the [Vibe2Ship](https://vibe2ship.com) hackathon

[⬆ back to top](#-deadclock)

</div>
