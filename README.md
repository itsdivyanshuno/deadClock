<div align="center">

# ⏱️ deadClock

### **The Last-Minute Life Saver**

#### 🚀 AI-powered productivity companion that transforms chaos into an actionable plan in seconds.

<p align="center">
  <strong>Stop managing tasks. Start completing them.</strong>
</p>

<p align="center">
  Chat naturally • Prioritize automatically • Never miss a deadline
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss"/>
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google"/>
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite"/>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/🚀_Live_Demo-Visit-black?style=for-the-badge"/></a>
  <a href="#"><img src="https://img.shields.io/badge/🎥_Demo_Video-Watch-red?style=for-the-badge"/></a>
  <a href="#"><img src="https://img.shields.io/github/stars/itsdivyanshuno/vibe2ship-lastminute-lifesaver?style=for-the-badge"/></a>
</p>

</div>

---

## 🎬 Demo

> Replace with your GIF or screen recording.

![Demo](https://via.placeholder.com/1200x600/0F172A/FFFFFF?text=📹+Add+Your+Demo+GIF+Here)

---

## 🌟 Why deadClock?

Traditional productivity apps require users to:

❌ Fill forms
❌ Organize boards
❌ Drag cards
❌ Manually prioritize tasks

**deadClock eliminates all of this.**

> 💬 *"I have a project presentation due Friday, three reports to send, and an exam this week. Help me plan."*

⚡ **deadClock instantly:**

* Creates actionable tasks
* Prioritizes by urgency & impact
* Breaks goals into milestones
* Detects risky deadlines
* Suggests what to focus on today

---

## ✨ Features

| Feature                           | Description                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| 🤖 **AI-native task management**  | Natural language task creation powered by Gemini function calling |
| 🎯 **Goal tracking & milestones** | Converts long-term goals into realistic weekly plans              |
| ⚠️ **At-risk deadline detection** | Flags risky tasks and recommends rescheduling                     |
| 🧠 **Proactive suggestions**      | AI surfaces important actions before you ask                      |
| 💬 **Conversation-first UX**      | No forms, no drag-and-drop, just chat                             |
| 🔒 **Local-first storage**        | SQLite persistence with zero cloud dependency                     |

---

## 🏗️ Architecture

```text
User Message
      │
      ▼
Next.js API Route
      │
      ▼
Gemini Agent
      │
 ┌────┼─────────────────────┐
 ▼    ▼      ▼      ▼      ▼
Tools Function Calling Logic
      │
      ▼
SQLite Persistence
      │
      ▼
Updated UI State
```

---

## 🧰 Gemini Tool Ecosystem

| Tool                        | Purpose                               |
| --------------------------- | ------------------------------------- |
| `add_task`                  | Create tasks with metadata & subtasks |
| `prioritise_tasks`          | Rank tasks automatically              |
| `complete_task`             | Mark tasks complete                   |
| `add_goal`                  | Create long-term goals                |
| `break_down_goal`           | Generate milestones                   |
| `suggest_schedule`          | Create daily schedules                |
| `get_reminders`             | Surface urgent tasks                  |
| `suggest_proactive_actions` | Recommend next actions                |
| `reschedule_at_risk_tasks`  | Protect deadlines                     |

---

## 🛠️ Tech Stack

| Layer           | Technologies            |
| --------------- | ----------------------- |
| **Frontend**    | Next.js 16, React 19    |
| **Styling**     | Tailwind CSS v4         |
| **AI Engine**   | Google Gemini 2.5 Flash |
| **Persistence** | SQLite + better-sqlite3 |
| **Runtime**     | Node.js                 |
| **Deployment**  | Vercel                  |

---

## 📁 Project Structure

```bash
app/
├── page.tsx
├── layout.tsx
├── globals.css
└── api/chat/route.ts

lib/
├── agent.ts
└── db.js

notes/
├── REFERENCE.md
├── SUBMISSION_DOC.md
└── submission-doc.docx
```

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/itsdivyanshuno/vibe2ship-lastminute-lifesaver.git

# Move into project
cd vibe2ship-lastminute-lifesaver

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open:

```text
http://localhost:3000
```

---

<details>
<summary><b>🧠 Technical Design Details</b></summary>

* All AI orchestration lives server-side in `lib/agent.ts`
* Gemini performs reasoning and tool selection
* Client never directly mutates storage
* SQLite transactions guarantee consistency
* Local-first architecture ensures privacy

</details>

<details>
<summary><b>🏆 What Makes deadClock Different?</b></summary>

| Area         | Highlights                   |
| ------------ | ---------------------------- |
| Agentic AI   | 9 Gemini tools               |
| UX           | Zero onboarding friction     |
| Privacy      | Fully local-first            |
| Performance  | Turbopack + optimized writes |
| Intelligence | Proactive suggestions        |

</details>

---

## 📹 Submission Resources

| Resource          | Link |
| ----------------- | ---- |
| 🎬 Demo Video     | TODO |
| 📄 Submission Doc | TODO |
| 📊 Pitch Deck     | TODO |
| 🚀 Live App       | TODO |

---

<div align="center">

### ⭐ Built for Vibe2Ship 2026

**Conversation-first productivity for the last-minute generation.**

[⬆ Back to Top](#-deadclock)

</div>
