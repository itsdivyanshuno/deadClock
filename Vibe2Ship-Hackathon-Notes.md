# Vibe2Ship Hackathon - Session Notes

## 🗓️ Timeline
- **Build Phase:** June 22, 3 PM → June 29, 2 PM
- **Submission Deadline:** June 29, 2026, 2:00 PM (late entries NOT accepted)
- **Mentor Session:** June 24, 4–6 PM (problem walkthrough + Google AI Studio guidance)

## 🔧 Core Requirement
- Must use **Google AI Studio** as the core tool to build and deploy the solution
- Deploy using: https://ai.google.dev/gemini-api/docs/aistudio-deploying

## 📦 Mandatory Submission
1. **Deployed App Link** (hosted via Google AI Studio, must stay active during evaluation)
2. **GitHub Repo Link** (source code + documentation)
3. **Google Doc** containing:
   - Problem Statement Selected
   - Solution Overview
   - Key Features
   - Technologies Used
   - Google Technologies Utilized
   - (Must be publicly accessible with link sharing enabled)

## 🏆 Evaluation Matrix

| Criteria | Weightage |
|---|---|
| Problem Solving & Impact | 20% |
| Agentic Depth | 20% |
| Innovation & Creativity | 20% |
| Usage of Google Technologies | 15% |
| Product Experience & Design | 10% |
| Technical Implementation | 10% |
| Completeness & Usability | 5% |

## 📋 Problem Statement Selected: The Last-Minute Life Saver

Build an **AI-powered productivity companion** that proactively helps users plan, prioritize, and complete tasks before deadlines.

**Example Features:**
- Intelligent task prioritization
- AI-powered scheduling assistance
- Personalized productivity recommendations
- Context-aware reminders
- Calendar integration
- Goal and habit tracking
- Voice-enabled assistance
- Autonomous task planning and execution

**Evaluation Focus:** How AI improves productivity by helping users make better decisions and complete tasks effectively.

**Why chosen:** Best alignment with "Agentic Depth" (20%) score — autonomous task planning is naturally agentic. Google AI Studio's AI capabilities showcase well here.

## 🛠️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) | All in one — frontend + API routes, deploy anywhere |
| Styling | Tailwind CSS | Fast, looks good with minimal effort |
| AI Engine | Google Gemini API (Function Calling) | Agentic depth — AI calls tools, not just chats |
| Backend | Next.js API routes | No separate server needed |
| Storage | JSON (in-memory for demo) | Simple, no DB setup for hackathon |
| Deploy | Google Cloud Run / Vercel | Vercel is faster to set up |

## 🤖 Agentic Features (Function Calling Tools)
- `add_task()` — create and break down tasks
- `prioritize_tasks()` — rank by urgency/impact/effort
- `schedule_task()` — suggest time slots
- `send_reminder()` — trigger notifications
- `track_goal()` — monitor habit progress

## 📝 Submission Steps (BlockseBlock)
1. Go to https://blockseblock.com/dashboard → Click "Create Project"
2. Enter Project Name → Select Problem Statement → Click "Save & Next"
3. Provide mandatory links → Click "Submit Now"
4. Toggle On both → Click "Continue"
5. Click "Final Submit" (no edits after this!)

## 🔜 Next Steps
1. [ ] Create Google AI Studio account (https://aistudio.google.com)
2. [ ] Get Gemini API key
3. [ ] Initialize Next.js project
4. [ ] Build core AI agent with function calling
5. [ ] Build UI
6. [ ] Deploy
7. [ ] Create GitHub repo
8. [ ] Write Google Doc
9. [ ] Submit via BlockseBlock

## ✅ Rules & Permissions
- Use of AI tools, open-source libraries, and public resources is PERMITTED and encouraged
- Submission must reflect own work, understanding, and implementation
- Organizers may review submission version history
- Jury's decision on shortlisting/rankings is final

---

_Generated: 2026-06-24_
_Last updated: 2026-06-24_
