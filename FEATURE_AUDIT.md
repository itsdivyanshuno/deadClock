# deadClock — Complete Feature Inventory

**Project:** deadClock — The Last-Minute Life Saver
**Hackathon:** Vibe2Ship (June 22–29, 2026)
**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Google Gemini API (`gemini-2.5-flash`), SQLite (`better-sqlite3`), Framer Motion, shadcn/ui, Base UI, Lucide React

---

## Feature Inventory by Category

---

### 1. AI Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 1.1 | **AI Chat Interface** | Primary NL interface — user describes tasks/goals in plain language | ✅ Fully Working | `components/chat/chat-view.tsx`, `app/api/chat/route.ts`, `lib/agent.ts` | Gemini API, SQLite |
| 1.2 | **Time-of-Day Greeting** | "Good morning/afternoon/evening" greeting adapting to current time | ✅ Fully Working | `components/chat/chat-view.tsx` (GreetingState) | None |
| 1.3 | **Quick-Start Suggestion Cards** | 4 pre-written prompts (study, work, goal, prioritise) for new users | ✅ Fully Working | `components/chat/chat-view.tsx` (GreetingState, QUICK_STARTS) | Chat handler |
| 1.4 | **9 AI Function-Calling Tools** | Full task/goal/planning CRUD via Gemini tool declarations | ✅ Fully Working | `lib/agent.ts` (`taskTools` array) | Gemini API, SQLite |
| 1.4a | `add_task` | Create task with title, deadline, priority, category, est. time, subtasks | ✅ Fully Working | `lib/agent.ts:340-359` | Task model, DB |
| 1.4b | `prioritize_tasks` | Re-sort pending tasks by urgency | ✅ Fully Working | `lib/agent.ts:363-382` | Task model |
| 1.4c | `complete_task` | Mark a task done by ID | ✅ Fully Working | `lib/agent.ts:386-395` | Task model, /api/complete |
| 1.4d | `add_goal` | Create long-term goal with milestones | ✅ Fully Working | `lib/agent.ts:399-413` | Goal model, DB |
| 1.4e | `suggest_schedule` | Generate greedy time-blocked daily plan | ✅ Fully Working | `lib/agent.ts:417-432` | Task model |
| 1.4f | `get_reminders` | Surface urgent/overdue tasks within timeframe | ✅ Fully Working | `lib/agent.ts:436-484` | Task model |
| 1.4g | `suggest_proactive_actions` | Workload analysis — overdue, upcoming, at-risk goals, big tasks | ✅ Fully Working | `lib/agent.ts:488-581` | Task + Goal models |
| 1.4h | `break_down_goal` | Split goal into proportional weekly tasks by available hours | ✅ Fully Working | `lib/agent.ts:585-647` | Goal model, Task model |
| 1.4i | `reschedule_at_risk_tasks` | Extend deadlines of tasks within risk window with buffer | ✅ Fully Working | `lib/agent.ts:657-707` | Task model |
| 1.5 | **Two-Turn Agent Orchestration** | Prompt → tool call → result → follow-up response cycle | ✅ Fully Working | `lib/agent.ts:739-834` (`chat()` function) | Gemini SDK |
| 1.6 | **Tool Execution Indicator** | Animated status messages while AI is calling tools | ✅ Fully Working | `components/chat/chat-view.tsx` (ToolExecutionIndicator) | Framer Motion |
| 1.7 | **Typing Indicator** | Bouncing dots while AI is thinking | ✅ Fully Working | `components/chat/chat-view.tsx` (TypingIndicator) | CSS animation (`typing-bounce`) |
| 1.8 | **Message Copy Button** | Copy AI response to clipboard on hover | ✅ Fully Working | `components/chat/chat-view.tsx` (SingleMessage) | Clipboard API |
| 1.9 | **System Prompt Persona** | "deadClock" productivity companion persona with user-type hints | ✅ Fully Working | `lib/agent.ts:129-143` | Gemini system prompt |

---

### 2. Task Management Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 2.1 | **Task List View** | Filterable/sortable card list of all tasks | ✅ Fully Working | `components/tasks/tasks-view.tsx` | Task data |
| 2.2 | **Task Filtering** | Tabs: All / Pending / Completed with counts | ✅ Fully Working | `components/tasks/tasks-view.tsx` (Tabs) | shadcn/ui Tabs |
| 2.3 | **Task Completion Toggle** | Animated checkbox to mark done/reopen | ✅ Fully Working | `components/tasks/tasks-view.tsx` (SingleTask) | /api/complete, Framer Motion |
| 2.4 | **Task Deletion** | Hover-reveal delete button per task card | ✅ Fully Working | `components/tasks/tasks-view.tsx`, `lib/agent.ts` | AI agent |
| 2.5 | **Priority System** | 4-tier: Urgent/High/Medium/Low with color badges | ✅ Fully Working | `components/shared/priority-badge.tsx`, `lib/helpers.ts` | Task model |
| 2.6 | **Category System** | Work/Study/Personal/Health/Finance/General with emoji icons | ✅ Fully Working | `components/tasks/tasks-view.tsx` (CATEGORY_EMOJI), `lib/agent.ts` | Task model |
| 2.7 | **Subtask Display** | Expandable list of breakdown steps per task | ✅ Fully Working | `components/tasks/tasks-view.tsx` (SingleTask) | Task model (subtasks array) |
| 2.8 | **Deadline Display** | Formatted deadline with calendar icon | ✅ Fully Working | `components/tasks/tasks-view.tsx`, `lib/helpers.ts` | Task model |
| 2.9 | **Estimated Time Badge** | Clock icon + human-readable time estimate | ✅ Fully Working | `components/tasks/tasks-view.tsx` | Task model |
| 2.10 | **Overdue Highlighting** | Red visual treatment for past-deadline tasks | ✅ Fully Working | `components/tasks/tasks-view.tsx`, `lib/helpers.ts` (`isOverdue`) | Deadline comparison |
| 2.11 | **Task Card Animation** | Spring-physics layout animation on add/remove/complete | ✅ Fully Working | `components/tasks/tasks-view.tsx` (SingleTask) | Framer Motion |
| 2.12 | **Completion Persistence** | Records completion in daily_logs, updates streaks, checks achievements | ✅ Fully Working | `app/api/complete/route.ts`, `lib/db.js` (`recordCompletion`) | SQLite |

---

### 3. Goal Management Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 3.1 | **Goal List View** | Cards showing goal title, description, deadline, progress | ✅ Fully Working | `components/goals/goals-view.tsx` | Goal data |
| 3.2 | **Milestone Tracking** | Toggle individual milestones done/undone | ✅ Fully Working | `components/goals/goals-view.tsx` (GoalCard) | Goal model |
| 3.3 | **Progress Indicators** | Percentage + progress bar per goal | ✅ Fully Working | `components/goals/goals-view.tsx`, shadcn Progress | Goal model |
| 3.4 | **Expandable Milestone List** | Click to expand/collapse milestone checklist with animation | ✅ Fully Working | `components/goals/goals-view.tsx` (GoalCard) | Framer Motion AnimatePresence |
| 3.5 | **Goal Sorting** | Goals sorted by lowest completion percentage first | ✅ Fully Working | `components/goals/goals-view.tsx` | Goal model |
| 3.6 | **AI Goal Breakdown** | Break goal into proportional weekly tasks based on available hours | ✅ Fully Working | `lib/agent.ts` (`break_down_goal` tool) | Goal + Task models |
| 3.7 | **Goal Empty State** | Helpful prompt when no goals exist | ✅ Fully Working | `components/goals/goals-view.tsx` | EmptyState component |

---

### 4. Dashboard Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 4.1 | **Time-of-Day Greeting** | "Good morning/afternoon/evening" on dashboard header | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` (getTimeOfDay) | None |
| 4.2 | **Briefing Insight** | Contextual summary of due/overdue/active task counts | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` (getBriefingInsight) | Task + Goal models |
| 4.3 | **Focus Today Card** | Highlighted top-priority active task with full details | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` (FocusTodayCard) | Task model, Framer Motion |
| 4.4 | **Stat Cards** | Pending/Overdue/Completed/Completion Rate with icons and sub-labels | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` (StatCard) | Task model, Framer Motion |
| 4.5 | **Quick Action Buttons** | Add task / Set goal / Chat with AI buttons | ⚠️ Partially Working | `components/dashboard/dashboard-overview.tsx` | Calls `onViewChange` but buttons share same handler — doesn't differentiate navigation targets |
| 4.6 | **Insights Panel** | Derives 4 insight types: overdue, due-today, due-tomorrow, at-risk goals, all-clear | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` (`deriveInsights`), `components/shared/insight-card.tsx` | Task + Goal models |
| 4.7 | **Insight Cards (compact)** | Compact danger/warning/info/success insight items in dashboard | ✅ Fully Working | `components/shared/insight-card.tsx` | deriveInsights |
| 4.8 | **Urgent Tasks Panel** | Lists overdue + urgent/high priority tasks with "Overdue" badging | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` | Task model |
| 4.9 | **Goals Progress Card** | Mini progress bars for each goal on dashboard | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` | Goal model |
| 4.10 | **Active Tasks Overview** | List of all pending tasks sorted by priority + deadline | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` | Task model, sortTasks helper |
| 4.11 | **Streak Card (on Dashboard)** | Current/longest streak + total completions + achievements | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx`, `components/analytics/streak-display.tsx` | Streak data from DB |
| 4.12 | **Loading Skeletons** | Full dashboard skeleton layout while data loads | ✅ Fully Working | `components/dashboard/dashboard-overview.tsx` | Skeleton components |

---

### 5. Analytics Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 5.1 | **Streak Tracking** | Current streak, longest streak, total task completions | ✅ Fully Working | `lib/db.js` (getCurrentStreak, getLongestStreak, getTotalCompletions, recordCompletion), `app/api/analytics/route.ts` | SQLite |
| 5.2 | **Streak Display Component** | 3-stat grid with color-coded flame icon + achievement list | ✅ Fully Working | `components/analytics/streak-display.tsx` | Streak data, Framer Motion |
| 5.3 | **Activity Heatmap** | GitHub-style 6-week contribution grid showing daily task completions | 🟡 Partially Working | `components/views/heatmap-view.tsx` | **dailyLogs prop is hardcoded to `[]` in page.tsx — no real data** |
| 5.4 | **Heatmap Stats Strip** | Total sessions, focus minutes, avg/day, most productive day | 🟢 Code works | `components/views/heatmap-view.tsx` | Depends on dailyLogs prop |
| 5.5 | **Focus Trend Chart** | Bar chart showing focus minutes for last 14 days | 🟡 Partially Working | `components/views/analytics-view.tsx` | **dailyLogs prop is `[]`** |
| 5.6 | **Category Breakdown** | Pill chips + stacked horizontal bar showing task distribution by category | ✅ Code works, 🟡 limited by data | `components/views/analytics-view.tsx` | Tasks array (works from task data, not daily logs) |
| 5.7 | **Completion Rate** | Large percentage display with progress bar | ✅ Fully Working | `components/views/analytics-view.tsx` | Tasks array |
| 5.8 | **Daily Logs Table** | Per-day aggregates: tasksCompleted, tasksCreated, focusMinutes, categoryBreakdown | ✅ DB layer | `lib/db.js` (getDailyLogs, daily_logs table) | SQLite |
| 5.9 | **Achievements System** | 10 unlockable badges tied to milestones (first task, streaks, goals) | ✅ Fully Working | `lib/db.js` (ACHIEVEMENT_DEFS, checkAchievements, unlockAchievement) | SQLite |
| 5.10 | **Heatmap Tooltips** | Hover tooltip showing date, task count, focus minutes | ✅ Fully Working | `components/views/heatmap-view.tsx` (CSS-only tooltip) | dailyLogs data |

---

### 6. Navigation Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 6.1 | **Sidebar Navigation** | 7-view sidebar: Dashboard, Chat, Tasks, Goals, Analytics, Activity, Reflect | ✅ Fully Working | `components/layout/sidebar.tsx`, `components/layout/app-shell.tsx` | View state |
| 6.2 | **Sidebar Collapse** | Collapsible sidebar (272px → 68px) with floating expand button | ✅ Fully Working | `components/layout/sidebar.tsx` | None |
| 6.3 | **Mobile Sidebar** | Hamburger menu triggering animated slide-in overlay sidebar | ✅ Fully Working | `components/layout/app-shell.tsx` (mobile breakpoint at `lg:`) | Framer Motion, AnimatePresence |
| 6.4 | **Active Nav Indicator** | Spring-animated pill indicator (`layoutId`) on active sidebar item | ✅ Fully Working | `components/layout/sidebar.tsx` (NavButton) | Framer Motion layoutId |
| 6.5 | **Collapsible Goals Section** | Expandable goals mini-list in sidebar with progress bars | ✅ Fully Working | `components/layout/sidebar.tsx` | Goals data |
| 6.6 | **Collapsible Tasks Section** | Expandable pending tasks mini-list in sidebar | ✅ Fully Working | `components/layout/sidebar.tsx` | Tasks data |
| 6.7 | **Urgent Banner in Sidebar** | Red-highlighted section for urgent tasks needing attention | ✅ Fully Working | `components/layout/sidebar.tsx` | Tasks data |
| 6.8 | **Command Palette (Cmd/Ctrl+K)** | Fuzzy-searchable command palette for fast view navigation | ✅ Fully Working | `components/shared/command-palette.tsx` | useCommandPalette hook |
| 6.9 | **Keyboard Navigation in Palette** | ↑↓ arrow keys + Enter to select + Esc to close | ✅ Fully Working | `components/shared/command-palette.tsx` | Keyboard events |
| 6.10 | **Page Transition Animations** | Fade+slide transition when switching between views | ✅ Fully Working | `components/layout/app-shell.tsx` (AnimatePresence on main content) | Framer Motion |
| 6.11 | **View Header** | Dynamic title updates based on active view | ✅ Fully Working | `components/layout/app-shell.tsx` (VIEW_TITLES map) | View state |

---

### 7. Productivity Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 7.1 | **AI Schedule Suggestion** | Greedy time-block plan for pending tasks (9 AM start, 2-hr slots) | ✅ Fully Working | `lib/agent.ts` (`suggest_schedule` tool) | Task model |
| 7.2 | **Reminders System** | AI surfaces urgent/overdue tasks for today/tomorrow/this_week | ✅ Fully Working | `lib/agent.ts` (`get_reminders` tool) | Task model |
| 7.3 | **Proactive Suggestions** | AI analyses workload, overdue items, goal risk, and big unbroken tasks | ✅ Fully Working | `lib/agent.ts` (`suggest_proactive_actions` tool) | Task + Goal models |
| 7.4 | **At-Risk Task Rescheduling** | Identifies tasks within a configurable risk window and suggests new deadlines | ✅ Fully Working | `lib/agent.ts` (`reschedule_at_risk_tasks` tool) | Task model |
| 7.5 | **Streak Tracking** | Consecutive-day tracking via daily_logs + user_stats | ✅ Fully Working | `lib/db.js` (getCurrentStreak, recordCompletion, streak math) | SQLite, daily_logs |
| 7.6 | **Achievement Unlocks** | 10 milestones: first_task, five_tasks, ten_tasks, streak_3/7/14/30, first_goal, goal_half, goal_complete | ✅ Fully Working | `lib/db.js` (ACHIEVEMENT_DEFS, checkAchievements) | SQLite |
| 7.7 | **Completion Rate** | Calculates percentage of completed vs total tasks | ✅ Fully Working | `lib/helpers.ts` (countByStatus used in dashboard) | Task model |
| 7.8 | **Daily Logs** | Per-day record: tasksCompleted, tasksCreated, focusMinutes, categoryBreakdown | ✅ Fully Working | `lib/db.js` (daily_logs table, recordCompletion) | SQLite |

---

### 8. UX/UI Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 8.1 | **6-Tiered Hover System** | Distinct hover interaction feel per element class (Hero → Subtle) | ✅ Fully Working | `lib/utils.ts` (tier1Hover–tier6Hover), `docs/interaction-hierarchy.md` | CSS transitions |
| 8.2 | **Framer Motion Animations** | Spring-physics on cards, staggered loading, page transitions | ✅ Fully Working | Throughout all view components | Framer Motion |
| 8.3 | **Dark Mode** | Complete dark theme with CSS custom properties | ✅ Fully Working | `app/globals.css` (.dark overrides), `app/page.tsx` (darkMode state) | CSS custom properties |
| 8.4 | **Focus Ring System** | Accessible focus-visible outlines on all interactive elements | ✅ Fully Working | `app/globals.css` (:focus-visible rules) | None |
| 8.5 | **Custom Typography** | Display font (Geist), mono font, tight letter-spacing | ✅ Fully Working | `app/globals.css` (.display-font), `app/layout.tsx` (Geist font) | Next.js font loader |
| 8.6 | **Background Texture** | Subtle radial gradient noise pattern | ✅ Fully Working | `app/globals.css` (.bg-texture) | None |
| 8.7 | **Text Selection Styling** | Brand-colored selection highlight | ✅ Fully Working | `app/globals.css` (::selection) | None |
| 8.8 | **Shimmer Loading Effect** | CSS gradient shimmer animation on skeleton cards | ✅ Fully Working | `app/globals.css` (.skeleton-shimmer), `components/shared/loading-skeleton.tsx` | CSS |
| 8.9 | **Animated Empty States** | Floating icon animation, context-aware empty messages | ✅ Fully Working | `components/shared/empty-state.tsx` | Framer Motion |
| 8.10 | **Scroll-Aware Sidebar** | Scrollable overflow area with task/goal summaries | ✅ Fully Working | `components/layout/sidebar.tsx` (ScrollArea) | Base UI ScrollArea |
| 8.11 | **Responsive Layout** | Mobile hamburger menu, responsive grids, mobile sidebar overlay | ✅ Fully Working | `components/layout/app-shell.tsx` (lg: breakpoints) | Tailwind responsive |
| 8.12 | **Geist Font Integration** | Google-hosted Geist variable font | ✅ Fully Working | `app/layout.tsx` | Next.js font/google |
| 8.13 | **Semantic Color Palette** | 50+ CSS custom properties for surfaces, borders, text, accents | ✅ Fully Working | `app/globals.css` (@theme block) | CSS |

---

### 9. Data & Persistence Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 9.1 | **SQLite Persistence** | `better-sqlite3` for all app state | ✅ Fully Working | `lib/db.js` | better-sqlite3 (Node.js only) |
| 9.2 | **State Hydration** | Client hydrates from `/api/chat` GET on mount | ✅ Fully Working | `app/page.tsx` (useEffect), `app/api/chat/route.ts` (GET) | SQLite, fetch |
| 9.3 | **Atomic State Save** | Single-transaction wipe-and-reinsert to avoid orphaned records | ✅ Fully Working | `lib/db.js` (saveState with transaction) | better-sqlite3 |
| 9.4 | **Chat History Capping** | Limits stored history to last 100 messages | ✅ Fully Working | `lib/db.js` (CHAT_HISTORY_LIMIT = 100) | SQLite |
| 9.5 | **Schema Initialization** | Creates all 6 tables on first load | ✅ Fully Working | `lib/db.js` (initDB) | SQLite |
| 9.6 | **Error Recovery** | Try/catch on hydration and API calls; graceful fallback messages | ✅ Fully Working | `app/page.tsx`, `app/api/chat/route.ts`, `app/api/complete/route.ts` | None |

---

### 10. Power User Features

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 10.1 | **Cmd/Ctrl+K Palette Shortcuts** | Cmd+K opens/closes palette; Esc closes | ✅ Fully Working | `components/shared/command-palette.tsx` (useCommandPalette) | Keyboard events |
| 10.2 | **Enter-to-Send, Shift+Enter Newline** | Standard chat input conventions | ✅ Fully Working | `components/chat/chat-view.tsx` (onKeyDown handler) | Textarea events |
| 10.3 | **View Shortcut Keys** | G+C (Chat), G+T (Tasks), G+G (Goals), G+D (Dashboard), , (Settings) | ✅ Fully Working | `components/shared/command-palette.tsx` (CommandItem shortcuts) | Keyboard events |
| 10.4 | **Sidebar Collapse/Expand** | Keyboard-accessible sidebar collapse | ✅ Fully Working | `components/layout/sidebar.tsx` | None |
| 10.5 | **Shift+Enter for multiline chat** | Multi-line message input | ✅ Fully Working | `components/chat/chat-view.tsx` | Textarea |

---

### 11. Settings & Customization

| # | Feature | Purpose | Status | Files | Dependencies |
|---|---------|---------|--------|-------|--------------|
| 11.1 | **Dark/Light Mode Toggle** | Switches between light and dark themes | ✅ Fully Working | `app/page.tsx` (darkMode state + useEffect), `components/settings/settings-view.tsx` | CSS custom properties |
| 11.2 | **Settings View** | Appearance toggle, keyboard shortcuts reference, about section | ✅ Fully Working | `components/settings/settings-view.tsx` | None |
| 11.3 | **Keyboard Shortcuts Reference** | Lists all available shortcuts in settings | ✅ Fully Working | `components/settings/settings-view.tsx` (ShortcutRow) | None |

---

### 12. Accessibility Features

| # | Feature | Purpose | Status | Files |
|---|---------|---------|--------|-------|
| 12.1 | **aria-label on all icon buttons** | Screen reader labels | ✅ Working |
| 12.2 | **aria-current="page"** | Active navigation state | ✅ Working |
| 12.3 | **aria-expanded** | Collapsible section states | ✅ Working |
| 12.4 | **Focus-visible outlines** | Keyboard focus indicators | ✅ Working |
| 12.5 | **Semantic HTML** | Proper button, form, heading elements | ✅ Working |
| 12.6 | **Role attributes** | Where needed for composite widgets | ✅ Working |

---

## Issues Found

### Bugs

| Bug | Severity | Location | Description |
|-----|----------|----------|-------------|
| B1 | 🔴 High | `app/page.tsx:226-235` | `AnalyticsView` receives `dailyLogs={[]}` — hardcoded empty array means focus trend, heatmap stats, and daily log data is always empty |
| B2 | 🔴 High | `app/page.tsx:232-234` | `HeatmapView` receives `dailyLogs={[]}` — hardcoded empty array means heatmap grid is always blank |
| B3 | 🟠 Medium | `app/page.tsx:238-240` | ReflectionView `onSubmit` only `console.log`s — reflection entries never persisted to DB |
| B4 | 🟠 Medium | `components/dashboard/dashboard-overview.tsx:353-381` | Quick action buttons (Add task / Set goal / Chat with AI) all call the same `onViewChange?.()` with no view argument — clicking them does nothing useful |
| B5 | 🟡 Low | `components/settings/settings-view.tsx:31` | Settings toggle calls `onToggleDarkMode` which works, but there's no persistence (no localStorage) — dark mode resets on refresh |
| B6 | 🟡 Low | `lib/agent.ts:248` | Streak logic bug: `same-day completions don't advance it` — the condition `new Date().toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)` is always true, making the `isConsecutive` variable meaningless |

### Unfinished Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Focus Timer** | 🔴 Missing | `focusMinutes` column exists in daily_logs, referenced in heatmap/analytics, but no timer UI or running timer implementation exists |
| **Reflection Persistence** | 🔴 Not Implemented | UI captures 4 fields but never writes to DB or any storage |
| **Reflection History** | 🔴 Missing | No view to see past reflections |
| **Focus Timer View** | 🔴 Missing | No dedicated timer page/component |
| **Onboarding Flow** | 🔴 Missing | No first-run experience beyond greeting |

### Duplicate/Redundant Code

| Code | Locations | Notes |
|------|-----------|-------|
| `CategoryIcon` | `components/tasks/tasks-view.tsx:40-42` AND `components/shared/priority-badge.tsx:47-57` | Two separate implementations with slightly different emoji maps |
| `CATEGORY_EMOJI` map | `components/tasks/tasks-view.tsx:36-39` | Should be unified with the one in priority-badge.tsx |
| `addDays()` helper | `components/dashboard/dashboard-overview.tsx:757-760` AND `components/shared/insight-card.tsx:277-280` AND `lib/agent.ts:939-942` | Three copies of the same function |
| `isOverdue()` | `components/tasks/tasks-view.tsx:33-34` AND `lib/helpers.ts:24-26` | Duplicated |
| `PRIORITY_ORDER` | `components/tasks/tasks-view.tsx:25` (local) AND `lib/helpers.ts:12-17` AND `lib/agent.ts:150` | Three copies |
| `QUICK_STARTS` array | `components/chat/chat-view.tsx:22-26` AND `components/chat/chat-view.tsx:122-126` | Identical arrays defined twice |
| `deriveInsights()` | `components/dashboard/dashboard-overview.tsx:651-752` AND `components/shared/insight-card.tsx:184-273` | Nearly identical insight derivation logic in two files |
| `formatDeadline()` | `lib/helpers.ts:34-39` AND `lib/agent.ts:882-892` (`formatDate`) | Same logic, different names |

### Dead Code

| Item | Location | Notes |
|------|----------|-------|
| `lib/agent.ts.bak` | `lib/agent.ts.bak` | Backup file — should be removed |
| `.tsbuildinfo` | `tsconfig.tsbuildinfo` | TypeScript build artifact — in .gitignore? |
| Dummy data generator | `scripts/seed-dummy-data.js` | Dev utility — fine to keep but not for production |
| `addDays` in analytics-view | `components/views/analytics-view.tsx` | Unused local function |

---

## Summary

### Total Feature Count: ~80 distinct features across 12 categories

---

### Top 10 Most Important Features

1. **AI Chat Interface** — The primary user-facing interface; everything flows through it
2. **9 AI Function-Calling Tools** — Core agentic capability; the entire AI-driven task/goal management
3. **Task CRUD via Natural Language** — The fundamental unit of work in the app
4. **Goal Management with Milestones** — Long-term planning differentiator
5. **Dashboard Overview** — Central hub users land on; comprehensive productivity picture
6. **SQLite Persistence** — All data survival; without it the app is stateless
7. **Streak & Achievement System** — Gamification driving daily re-engagement
8. **Proactive AI Suggestions** — Differentiates from passive task managers
9. **Command Palette Navigation** — Power-user efficiency; differentiates from basic apps
10. **Animated Chat Experience** — Polished feel (typing indicator, tool execution status, message animations)

---

### Biggest Wow Factor Features

1. **Tool Execution Indicator** — The cycling emoji + status messages while AI is processing (executive presence)
2. **AI Proactive Suggestions** — Agent surfaces overdue items, at-risk goals, and load imbalances unprompted
3. **AI Goal Breakdown** — Splits long-term goals into proportional weekly tasks automatically
4. **Streak Display with Achievements** — Gamification with animated, color-coded streak stats
5. **Focus Today Card** — Single most important task highlighted with glow effect on dashboard
6. **Command Palette (Cmd+K)** — Desktop-class navigation that surprises users
7. **Priority-Aware Time-Block Scheduling** — AI generates daily schedule from pending task list
8. **Tiered Hover System** — 6 distinct interaction feels (documented in design doc)
9. **Responsive Mobile Sidebar** — Slide-in overlay with spring animation
10. **Reschedule At-Risk Tasks** — Autonomous deadline extension with configurable risk window

---

### Features That Need Immediate Bug Fixing (Pre-Hackathon)

| Priority | Bug | Fix Required |
|----------|-----|-------------|
| 🔴 P0 | B1 + B2: Analytics/Heatmap get `dailyLogs={[]}` | Wire `dailyLogs` from `/api/analytics` hydration in `page.tsx` |
| 🔴 P0 | B3: Reflection submissions console.log only | Add reflection table to SQLite or persist to existing daily_logs |
| 🟠 P1 | B4: Dashboard quick action buttons do nothing | Pass correct `onViewChange` targets or use `setView` |
| 🟠 P1 | B5: Dark mode resets on refresh | Persist to localStorage + hydrate from it |
| 🟡 P2 | B6: Streak same-day logic is broken | Fix the tautological date comparison in `recordCompletion` |
| 🟡 P2 | Duplicate code | Consolidate `addDays`, `isOverdue`, `PRIORITY_ORDER`, `CategoryIcon`, `QUICK_STARTS`, `deriveInsights` |
| 🟡 P2 | Remove `lib/agent.ts.bak` | Delete backup file |
