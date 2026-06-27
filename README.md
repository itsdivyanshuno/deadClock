<div align="center">

# deadClock

### The Last-Minute Life Saver

AI-powered productivity companion that turns chaos into a realistic plan in seconds.

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js"/>
  <img src="https://img.shields.io/badge/React-19-black?style=flat-square&logo=react"/>
  <img src="https://img.shields.io/badge/Tailwind-v4-black?style=flat-square&logo=tailwindcss"/>
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-black?style=flat-square&logo=google"/>
  <img src="https://img.shields.io/badge/SQLite-black?style=flat-square&logo=sqlite"/>
</p>

[Live Demo](#) • [Demo Video](#) • [Report](#)

</div>

---

![deadClock Demo](./docs/demo.gif)

## Why deadClock?

Most productivity apps create more work.

deadClock removes forms, boards, and manual prioritisation.

Simply tell the AI what you need to do.

```text
"I have an exam on Friday, a presentation tomorrow,
and three assignments pending. Help me plan."
```

Within seconds deadClock:

* Creates tasks automatically
* Prioritises by urgency and impact
* Breaks goals into milestones
* Detects risky deadlines
* Suggests what to focus on next

---

## Features

|                               |                                                         |
| ----------------------------- | ------------------------------------------------------- |
| **AI-native task management** | Natural conversation powered by Gemini function calling |
| **Goal decomposition**        | Converts long-term goals into realistic milestones      |
| **Risk detection**            | Identifies deadlines that may slip                      |
| **Proactive suggestions**     | Recommends what to work on next                         |
| **Conversation-first UX**     | Zero forms. Just chat.                                  |
| **Local-first storage**       | Everything persists in SQLite                           |

---

## Architecture

```text
User
  ↓
Next.js API
  ↓
Gemini Agent
  ↓
Tool Layer
  ↓
SQLite
```

---

## Tech Stack

* **Frontend:** Next.js 16, React 19
* **Styling:** Tailwind CSS v4
* **AI:** Gemini 2.5 Flash
* **Database:** SQLite + better-sqlite3
* **Runtime:** Node.js

---

<details>
<summary>Gemini Tools</summary>

* add_task
* prioritise_tasks
* complete_task
* add_goal
* suggest_schedule
* get_reminders
* suggest_proactive_actions
* break_down_goal
* reschedule_at_risk_tasks

</details>

<details>
<summary>Project Structure</summary>

```bash
app/
lib/
notes/
```

</details>

## Getting Started

```bash
git clone https://github.com/itsdivyanshuno/vibe2ship-lastminute-lifesaver.git

cd vibe2ship-lastminute-lifesaver

npm install

cp .env.local.example .env.local

npm run dev
```
