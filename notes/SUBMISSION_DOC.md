# Deadline — The Last-Minute Life Saver
## Vibe2Ship Hackathon Submission

---

## Problem Statement Selected

**The Last-Minute Life Saver**

Build an AI-powered productivity companion that proactively helps users plan, prioritize, and complete tasks before deadlines. The solution should go beyond a simple chatbot — it should act as an autonomous agent that understands context, breaks down complex goals, and helps users make better decisions under time pressure.

---

## Solution Overview

**Deadline** is an AI productivity companion built with Next.js and Google Gemini that transforms how users interact with their to-do lists. Instead of manually managing tasks, users have a conversation with an AI assistant that actively plans, prioritizes, and monitors their workload.

The user describes their tasks, deadlines, and goals in plain language. The Gemini-powered agent parses this input, creates structured task records, prioritizes them by urgency, breaks large goals into actionable weekly plans, and proactively alerts users when deadlines are at risk.

All data is persisted locally using SQLite, ensuring fast, private, and offline-capable operation with no accounts or cloud sync required.

### How it works

1. User opens the chat and describes what they need to accomplish
2. The AI creates tasks with priorities, deadlines, and subtasks automatically
3. Users can view, toggle, and filter tasks in a dedicated Tasks view
4. Goals with milestones are tracked visually with progress indicators
5. The AI proactively surfaces overdue items, at-risk tasks, and focus recommendations

---

## Key Features

### AI-Native Task Management
Create, prioritize, and complete tasks through natural conversation. No forms to fill — just describe what you need to do and the AI handles the rest.

### Proactive Workload Analysis
The assistant actively monitors your task list and surfaces suggestions based on your current situation — overdue items, upcoming deadlines, and areas where you're overloaded.

### Autonomous Goal Breakdown
Set a high-level goal with a deadline and available hours per week — the AI generates a proportional weekly task plan automatically.

### At-Risk Deadline Detection
Tasks nearing their deadline (within a configurable risk window) are flagged and rescheduling suggestions are generated, so nothing silently falls through the cracks.

### Time-Block Scheduling
Get a suggested daily schedule that allocates time blocks to your pending tasks based on priority and estimated effort.

### Three-Pane Interface
- **Chat** — primary interaction surface with the AI assistant
- **Tasks** — filterable, sortable task list with priority badges
- **Goals** — long-term objectives with milestone tracking and progress bars

### Local-First Privacy
All data lives in a SQLite database on your machine. No accounts, no cloud sync, no third-party analytics.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Full-stack React framework with API routes |
| **React 19** | Client-side UI rendering |
| **Tailwind CSS v4** | Design system and styling |
| **Google Gemini API** (`@google/genai`) | AI reasoning and function calling |
| **better-sqlite3** | Local database persistence |
| **TypeScript 5** | Type safety across the codebase |
| **Node.js Runtime** | Server-side execution for SQLite and API routes |

---

## Google Technologies Utilized

| Technology | How it's used |
|---|---|
| **Google AI Studio** | Source of the Gemini API key; used to generate and manage the API credential |
| **Gemini API** (`@google/genai`) | The core AI engine — powers all agent reasoning, natural language understanding, and response generation |
| **Gemini Function Calling** | The architectural backbone of agentic behavior — 9 tools are defined as function declarations, Gemini decides when and how to call them, and the results drive real state changes in the user's task store |
| **Gemini Model: `gemini-2.5-flash`** | The specific model powering all inference — selected for its speed, multimodal capability, and native function-calling support |

### Function Calling implementation

The agent declares 9 tools to Gemini via `functionDeclarations`:

1. **add_task** — create tasks with deadline, priority, category, subtasks
2. **prioritize_tasks** — re-sort pending tasks by urgency/impact
3. **complete_task** — mark a task done by ID
4. **add_goal** — create goals with milestone checklists
5. **suggest_schedule** — generate a time-blocked daily plan
6. **get_reminders** — surface urgent/overdue tasks
7. **suggest_proactive_actions** — workload analysis and suggestions
8. **break_down_goal** — split goals into proportional weekly tasks
9. **reschedule_at_risk_tasks** — extend deadlines with safety buffers

Gemini operates in `AUTO` mode — it decides which tools to call based on the user's message, executes them against the in-memory state, and generates a natural-language follow-up response.

---

## Submission Links

- **GitHub Repository:** https://github.com/itsdivyanshuno/vibe2ship-lastminute-lifesaver
- **Deployed App:** [Add your Vercel / Cloud Run URL here after deployment]

---

*Submitted for Vibe2Ship Hackathon — June 2026*
