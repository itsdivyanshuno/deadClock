# Project Reference

Last updated: 2026-06-26

## What this is

**Deadline** — *The Last-Minute Life Saver* — an AI productivity companion built for
the [Vibe2Ship](https://vibe2ship.com) hackathon (June 22–29, 2026).

The application lets users talk to a Gemini-powered assistant that creates tasks,
prioritises them, breaks goals into weekly plans, and surfaces at-risk deadlines.
All state is persisted to a local SQLite database via `better-sqlite3`.

- **Repo:** https://github.com/itsdivyanshuno/vibe2ship-lastminute-lifesaver
- **Problem Statement:** The Last-Minute Life Saver
- **Tech stack:** Next.js 16, React 19, Tailwind CSS v4, Google Gemini API, SQLite

## Evaluation criteria (relevant)

| Criteria | Weight |
|---|---|
| Agentic Depth | 20% |
| Innovation & Creativity | 20% |
| Problem Solving & Impact | 20% |
| Usage of Google Technologies | 15% |
| Product Experience & Design | 10% |
| Technical Implementation | 10% |
| Completeness & Usability | 5% |

## How the code is structured

```
app/
  page.tsx              ← Client UI: chat, tasks, goals views
  layout.tsx            ← Root HTML/body wrapper
  globals.css           ← Tailwind tokens, animations, glass styles
  api/chat/route.ts     ← POST (AI chat) + GET (state hydration)
lib/
  agent.ts              ← Gemini agent: 9 function-calling tools, chat() orchestrator
  db.js                 ← SQLite CRUD: loadState / saveState / schema init
notes/
  REFERENCE.md          ← this file
  archive/              ← old session notes, PDF, submission HTML
```

## Gemini function-calling tools

1. `add_task` — create a task with deadline, priority, category, subtasks
2. `prioritize_tasks` — re-sort pending tasks by urgency
3. `complete_task` — mark a task done
4. `add_goal` — create a goal with milestones
5. `suggest_schedule` — time-blocked daily plan for pending tasks
6. `get_reminders` — surface urgent/overdue tasks within a timeframe
7. `suggest_proactive_actions` — workload analysis + suggestions
8. `break_down_goal` — split a goal into proportional weekly tasks
9. `reschedule_at_risk_tasks` — extend deadlines with a safety buffer

## Google technologies used

- **Google AI Studio** — API key origin
- **Gemini API (`@google/genai`)** — all agent reasoning and function calling
  - Model: `gemini-2.5-flash`
  - Function calling mode: `AUTO`

## Key architectural decisions

- The client never mutates tasks/goals directly on the server — all changes flow
  through `/api/chat` via natural-language messages or async checkbox toggles.
- `saveState()` wipes all rows and re-inserts them in a single transaction;
  this keeps the SQLite store as an exact mirror of the in-memory agent state
  and avoids orphaned records.
- Chat history is capped at the last 100 messages to prevent unbounded DB growth.

## Archived material

Older session notes, the hackathon PDF, and the BlockseBlock submission HTML are
in `notes/archive/` for reference only. They are not needed for development.
