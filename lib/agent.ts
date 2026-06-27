/**
 * @module agent
 * @description Core AI agent logic for the deadClock productivity assistant.
 *
 * This module:
 * 1. Defines the TypeScript interfaces for all domain objects (Task, Goal, Message).
 * 2. Declares the Gemini function/tool definitions that give the AI the ability
 *    to read and mutate the user's task/goal/chat store.
 * 3. Implements a `handleToolCall` dispatcher that executes each tool against
 *    an in-memory state clone.
 * 4. Orchestrates the two-turn Gemini conversation: prompt → tool call → result
 *    → follow-up text response.
 * 5. Persists all state changes to SQLite after every turn via `saveState`.
 *
 * @see {@link https://ai.google.dev/gemini-api/docs/function-calling} Gemini function calling docs
 */

import { GoogleGenAI } from "@google/genai";
import { loadState, saveState } from "./db";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

/** Gemini API key loaded from the server environment (injected by Next.js). */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

/**
 * Singleton Gemini client.
 *
 * Created at module scope because the SDK manages its own internal connection
 * pool; creating one instance per request is unnecessary and would add latency.
 *
 * @type {GoogleGenAI}
 */
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// Type definitions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Represents a single actionable task created by or for the user.
 */
export interface Task {
  /** Globally unique identifier (prefixed with `task_` for easy grep). */
  id: string;
  /** Short, human-readable label displayed in task lists and cards. */
  title: string;
  /** Optional extended description shown on expand / hover. */
  description: string;
  /**
   * Urgency tier used for sorting and visual priority indicators.
   * @see {@link PRIORITY_ORDER} in the prioritise implementation.
   */
  priority: "urgent" | "high" | "medium" | "low";
  /** ISO-8601 timestamp marking when this task must be completed. */
  deadline: string;
  /**
   * Current lifecycle state.
   * - `pending` → not yet started.
   * - `in_progress`→ actively being worked on.
   * - `completed` → done.
   * - `overdue` → deadline has passed without completion.
   */
  status: "pending" | "in_progress" | "completed" | "overdue";
  /** Freeform classification (e.g. "Work", "Study", "Health"). */
  category: string;
  /** Human-readable estimate (e.g. "2 hours", "30 mins") — not parsed computationally. */
  estimatedTime: string;
  /** Optional breakdown of this task into smaller, executable steps. */
  subtasks: string[];
  /** ISO-8601 timestamp marking when this record was first created. */
  createdAt: string;
}

/**
 * Represents a long-term, outcome-oriented goal with milestone tracking.
 */
export interface Goal {
  /** Globally unique identifier (prefixed with `goal_`). */
  id: string;
  /** Short, aspirational label. */
  title: string;
  /** Optional personal context — why this goal matters to the user. */
  description: string;
  /** ISO-8601 target completion date. */
  deadline: string;
  /** Derived completion percentage (0–100), computed from milestone status. */
  progress: number;
  /** Ordered checklist of milestones under this goal. */
  milestones: { title: string; done: boolean }[];
}

/**
 * A single message in the conversation transcript.
 */
interface Message {
  role: "user" | "assistant" | "model";
  content: string;
}

/**
 * The in-memory state shape managed by the agent on each request.
 *
 * This is a working copy — the agent mutates this object freely during a turn
 * and only persists it to SQLite *after* all tool calls have resolved.
 */
interface TaskStore {
  tasks: Task[];
  goals: Goal[];
  chatHistory: Message[];
}

// ─────────────────────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Injected as the first message every Gemini turn so the model always has
 * consistent context about its role, available tools, and user persona hints.
 *
 * This prompt is intentionally concise — the bulk of the agent's "knowledge"
 * about *how* to act comes from the tool descriptions and parameter schemas,
 * which Gemini reads directly from the function declarations below.
 */
const SYSTEM_PROMPT = `You are "deadClock", an AI productivity companion. Your job is to help users plan, prioritize, and complete tasks before deadlines.

When a user mentions tasks, deadlines, or goals:
1. Break large tasks into smaller subtasks
2. Prioritize by urgency, impact, and effort
3. Suggest optimal time slots
4. Set context-aware reminders
5. Track goal progress

Be proactive, concise, and actionable. Use tools to actually manage their tasks.

Available user profile hints (infer from their messages):
- Student: study deadlines, assignments, exam prep
- Professional: meetings, reports, project deadlines
- Entrepreneur: business milestones, client commitments`;

// ─────────────────────────────────────────────────────────────────────────────
// Gemini tool (function) declarations
// ─────────────────────────────────────────────────────────────────────────────

/** Ordered priority mapping used by both the prioritise tool and the task card sort. */
const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

/**
 * Tool definitions exposed to Gemini via the function calling API.
 *
 * Each entry declares:
 * - `name` → matched in `handleToolCall`'s switch statement.
 * - `description`→ what Gemini tells the user this tool does.
 * - `parameters` → JSON Schema; Gemini uses this to extract structured args.
 *
 * Only `name` and `description` are visible to the user; `parameters` guide
 * the model's internal argument extraction.
 */
const taskTools = [
  {
    functionDeclarations: [
      // ── add_task ──────────────────────────────────────────────────────────
      {
        name: "add_task",
        description: "Create a new task for the user with title, deadline, priority, and optional details.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short task title" },
            description: { type: "string", description: "Detailed description of the task" },
            deadline: { type: "string", description: "Deadline date/time in ISO format (e.g. 2026-06-30T17:00:00)" },
            category: { type: "string", description: "Category like 'Work', 'Study', 'Personal', 'Health'" },
            estimatedTime: { type: "string", description: "Estimated completion time like '2 hours', '30 mins'" },
            priority: { type: "string", description: "Priority: urgent, high, medium, or low" },
            subtasks: { type: "array", items: { type: "string" }, description: "Break into smaller steps if applicable" },
          },
          required: ["title", "deadline"],
        },
      },
      // ── prioritize_tasks ──────────────────────────────────────────────────
      {
        name: "prioritize_tasks",
        description: "Re-sort all pending tasks by urgency and importance; returns an ordered summary.",
        parameters: {
          type: "object",
          properties: {
            reason: { type: "string", description: "Brief explanation of the prioritisation strategy used" },
          },
        },
      },
      // ── complete_task ─────────────────────────────────────────────────────
      {
        name: "complete_task",
        description: "Mark a task as completed by its ID.",
        parameters: {
          type: "object",
          properties: {
            taskId: { type: "string", description: "The ID of the task to mark as complete" },
          },
          required: ["taskId"],
        },
      },
      // ── add_goal ──────────────────────────────────────────────────────────
      {
        name: "add_goal",
        description: "Create a long-term goal with an optional list of milestones.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Goal title" },
            description: { type: "string", description: "What this goal means to the user" },
            deadline: { type: "string", description: "Target completion date (ISO format)" },
            milestones: { type: "array", items: { type: "string" }, description: "Key milestones to track progress toward the goal" },
          },
          required: ["title", "deadline"],
        },
      },
      // ── suggest_schedule ──────────────────────────────────────────────────
      {
        name: "suggest_schedule",
        description: "Generate a time-blocked schedule for completing the user's pending tasks.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Date to plan for (ISO date string); defaults to today" },
          },
        },
      },
      // ── get_reminders ─────────────────────────────────────────────────────
      {
        name: "get_reminders",
        description: "Return tasks that are urgent, overdue, or due within a given timeframe.",
        parameters: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              description: "How far ahead to look: 'today', 'tomorrow', 'this_week'",
            },
          },
        },
      },
      // ── suggest_proactive_actions ─────────────────────────────────────────
      {
        name: "suggest_proactive_actions",
        description: "Analyses current workload and surfaces proactive suggestions (overdue items, load imbalances, at-risk goals).",
        parameters: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              enum: ["today", "tomorrow", "this_week"],
              description: "Timeframe for the suggestion window",
            },
            focusArea: {
              type: "string",
              enum: ["work", "study", "health", "personal"],
              description: "Optional area to focus the suggestions on",
            },
          },
          required: ["timeframe"],
        },
      },
      // ── break_down_goal ───────────────────────────────────────────────────
      {
        name: "break_down_goal",
        description: "Autonomously break a high-level goal into weekly/daily actionable tasks based on available hours.",
        parameters: {
          type: "object",
          properties: {
            goalTitle: { type: "string", description: "The exact title of the goal to break down" },
            deadline: { type: "string", description: "Target completion date (ISO format)" },
            availableHoursPerWeek: { type: "number", description: "How many hours per week the user can dedicate to this goal" },
          },
          required: ["goalTitle", "deadline", "availableHoursPerWeek"],
        },
      },
// ── delete_task ────────────────────────────────────────────────────
{
  name: "delete_task",
  description: "Permanently delete a task from the project by id.",
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The exact id of the task to delete."
      }
    },
    required: ["id"],
  },
},
      // ── reschedule_at_risk_tasks ──────────────────────────────────────────
      {
        name: "reschedule_at_risk_tasks",
        description: "Identify tasks whose deadlines are within a risk window and propose realistic new deadlines.",
        parameters: {
          type: "object",
          properties: {
            riskThresholdHours: {
              type: "number",
              description: "Hours before deadline that a task is considered 'at risk' (default: 24)",
              default: 24,
            },
          },
        },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tool-call dispatcher
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute a single Gemini tool call against the provided mutable state clone.
 *
 * All mutations happen in-memory on the `state` object passed in; the caller
 * is responsible for persisting the final state via `saveState` after all tool
 * calls in a turn have resolved.
 *
 * @param {string} name - The tool name (must match a case in this switch).
 * @param {any} args - Structured arguments extracted by Gemini from the user's message.
 * @param {TaskStore} state - Mutable in-memory state this turn (treated as a working copy).
 *
 * @returns {{ success: boolean; message: string; [key: string]: any }}
 * A structured result object. The `message` property is shown to the user.
 * Additional properties (e.g. `task`, `goal`, `tasks`, `atRiskTasks`) are
 * contextual and depend on which tool was called.
 */
function handleToolCall(name: string, args: any, state: TaskStore) {
  switch (name) {
    // ── add_task ────────────────────────────────────────────────────────────
    case "add_task": {
      const task: Task = {
        id: generateId("task"),
        title: args.title,
        description: args.description || "",
        // Normalise priority to a valid enum value; default to "medium" when
        // the model returns something outside the allowed set.
        priority: safePriority(args.priority),
        deadline: args.deadline,
        status: "pending",
        category: args.category || "General",
        estimatedTime: args.estimatedTime || "1 hour",
        subtasks: args.subtasks || [],
        createdAt: new Date().toISOString(),
      };
      state.tasks.push(task);
      return {
        success: true,
        task,
        message: `✅ Task added: "${task.title}" — due ${formatDate(task.deadline)}`,
      };
    }

    // ── prioritize_tasks ────────────────────────────────────────────────────
    case "prioritize_tasks": {
      // Stable sort: pending tasks first, then by PRIORITY_ORDER; completed /
      // overdue tasks sink to the bottom regardless of priority.
      state.tasks.sort((a, b) => {
        const pendingA = a.status === "pending" ? 0 : 1;
        const pendingB = b.status === "pending" ? 0 : 1;
        return (
          pendingA - pendingB ||
          (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
        );
      });
      const pending = state.tasks.filter((t) => t.status === "pending");
      const summary =
        pending
          .map((t) => `• ${t.priority.toUpperCase()}: ${t.title} (${formatDate(t.deadline)})`)
          .join("\n") || "No pending tasks — you're all clear!";
      return {
        success: true,
        message: `📋 Prioritised ${pending.length} pending task(s):\n${summary}`,
      };
    }

    // ── complete_task ───────────────────────────────────────────────────────
    case "complete_task": {
      const task = state.tasks.find((t) => t.id === args.taskId);
      if (!task) {
        return { success: false, message: "Task not found — please check the ID and try again." };
      }
      task.status = "completed";
      return {
        success: true,
        message: `🎉 Nice work! "${task.title}" marked as completed.`,
      };
    }

    // ── add_goal ────────────────────────────────────────────────────────────
    case "add_goal": {
      const goal: Goal = {
        id: generateId("goal"),
        title: args.title,
        description: args.description || "",
        deadline: args.deadline,
        progress: 0,
        milestones: (args.milestones || []).map((m: string) => ({ title: m, done: false })),
      };
      state.goals.push(goal);
      return {
        success: true,
        goal,
        message: `🎯 Goal created: "${goal.title}" — ${goal.milestones.length} milestone(s) set`,
      };
    }

    // ── suggest_schedule ────────────────────────────────────────────────────
    case "suggest_schedule": {
      const pending = state.tasks.filter((t) => t.status === "pending");
      if (pending.length === 0) {
        return { success: true, message: "📅 No pending tasks to schedule. Enjoy your free time!" };
      }
      // Simple greedy time-block: assign slots from 9 AM, 2-hour windows, skip completed.
      const schedule = pending.map((t, i) => {
        const startHour = 9 + i * 2;
        const durationHours = parseTimeEstimate(t.estimatedTime);
        const endHour = startHour + durationHours;
        return `• ${startHour}:00 – ${endHour}:00 → ${t.title} (${t.estimatedTime}, ${t.priority} priority)`;
      });
      return {
        success: true,
        message: `📅 Suggested schedule:\n${schedule.join("\n")}\n\n💡 Adjust based on your energy levels — tackle hard tasks first if you're a morning person!`,
      };
    }

    // ── get_reminders ───────────────────────────────────────────────────────
    case "get_reminders": {
      const now = new Date();
      const urgent = state.tasks.filter((t) => {
        if (
          t.status !== "pending" &&
          t.status !== "in_progress" &&
          t.status !== "overdue"
        )
          return false;
        const diffHours =
          (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);

        switch (args.timeframe) {
          case "today":
            return (
              (t.status === "pending" || t.status === "in_progress" || t.status === "overdue") &&
              diffHours <= 24
            );
          case "tomorrow":
            return (
              (t.status === "pending" || t.status === "in_progress" || t.status === "overdue") &&
              diffHours > 24 &&
              diffHours <= 48
            );
          case "this_week":
            return (
              (t.status === "pending" || t.status === "in_progress" || t.status === "overdue") &&
              diffHours > 48 &&
              diffHours <= 168
            );
          default:
            // When no timeframe specified, surface urgent/high priority items.
            return t.priority === "urgent" || t.priority === "high";
        }
      });

      if (urgent.length === 0) {
        return { success: true, message: "✅ No urgent reminders right now. You're on top of things!" };
      }

      const list = urgent
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .map((t) => `• 🔴 ${t.title} — due ${formatDate(t.deadline)} (${t.priority})`)
        .join("\n");

      return {
        success: true,
        message: `⚠️ ${urgent.length} task(s) need your attention:\n${list}`,
      };
    }

    // ── suggest_proactive_actions ───────────────────────────────────────────
    case "suggest_proactive_actions": {
      const { timeframe, focusArea } = args;
      const now = new Date();

      // Compute period boundaries for the selected timeframe.
      const todayStart = startOfDay(now);
      let periodStart: Date, periodEnd: Date;

      switch (timeframe) {
        case "today":
          periodStart = todayStart;
          periodEnd = addDays(todayStart, 1);
          break;
        case "tomorrow":
          periodStart = addDays(todayStart, 1);
          periodEnd = addDays(todayStart, 2);
          break;
        case "this_week":
          periodStart = startOfWeek(todayStart);
          periodEnd = addDays(periodStart, 7);
          break;
      }

      const suggestions: string[] = [];

      // 1. Overdue tasks
      const overdue = state.tasks.filter(
        (t) => t.status === "pending" && new Date(t.deadline) < now
      );
      if (overdue.length > 0) {
        suggestions.push(
          `🚨 You have ${overdue.length} overdue task(s). Consider tackling them first or renegotiating deadlines.`
        );
      }

      // 2. Upcoming deadlines in the selected window
      const upcoming = state.tasks.filter(
        (t) =>
          t.status === "pending" &&
          new Date(t.deadline) >= periodStart &&
          new Date(t.deadline) < periodEnd
      );
      if (upcoming.length > 0) {
        const titles = upcoming.map((t) => t.title).join(", ");
        suggestions.push(
          `📅 You have ${upcoming.length} task(s) due in this timeframe. Consider time-blocking for: ${titles}`
        );
      }

      // 3. Focus-area load check
      if (focusArea) {
        const areaTasks = state.tasks.filter(
          (t) =>
            t.status === "pending" &&
            t.category.toLowerCase() === focusArea.toLowerCase()
        );
        if (areaTasks.length > 0) {
          suggestions.push(
            `🎯 Focus on ${focusArea}: ${areaTasks.length} pending task(s). Consider dedicating a focused block to clear them.`
          );
        }
      }

      // 4. Goal progress check — surface the least-progressed open goal.
      const openGoals = state.goals
        .map((g) => {
          const done = g.milestones.filter((m) => m.done).length;
          const total = g.milestones.length;
          return { goal: g, pct: total ? Math.round((done / total) * 100) : 0 };
        })
        .filter((g) => g.pct < 100);

      if (openGoals.length > 0) {
        const lagging = openGoals.reduce((min, g) => (g.pct < min.pct ? g : min), openGoals[0]);
        const nextMilestone = lagging.goal.milestones.find((m) => !m.done)?.title ?? "N/A";
        suggestions.push(
          `🎯 Goal "${lagging.goal.title}" is at ${lagging.pct}% completion. Next milestone: "${nextMilestone}"`
        );
      }

      // 5. Large tasks that should be broken down
      const bigTasks = state.tasks.filter(
        (t) => t.subtasks.length === 0 && parseTimeEstimate(t.estimatedTime) > 2
      );
      if (bigTasks.length > 0) {
        const titles = bigTasks.map((t) => t.title).join(", ");
        suggestions.push(`🔧 Consider breaking these larger tasks into subtasks: ${titles}`);
      }

      const msg =
        suggestions.length > 0
          ? suggestions.join("\n\n")
          : "✅ Everything looks good! Keep up the great work.";
      return { success: true, message: `💡 Proactive Suggestions for ${timeframe}:\n\n${msg}` };
    }

    // ── break_down_goal ─────────────────────────────────────────────────────
    case "break_down_goal": {
      const { goalTitle, deadline, availableHoursPerWeek } = args;

      if (availableHoursPerWeek <= 0) {
        return { success: false, message: "Available hours per week must be a positive number." };
      }

      const goal = state.goals.find((g) => g.title === goalTitle);
      if (!goal) {
        return { success: false, message: `Goal "${goalTitle}" not found. Create it first or check the spelling.` };
      }

      const due = new Date(deadline);
      if (due <= new Date()) {
        return { success: false, message: "The goal deadline must be in the future." };
      }

      if (goal.milestones.length === 0) {
        return {
          success: false,
          message:
            'This goal has no milestones yet. Add milestones first using the "add_goal" tool with a milestones array.',
        };
      }

      const weeksRemaining = Math.max(
        0,
        Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))
      );
      const totalAvailableHours = weeksRemaining * availableHoursPerWeek;
      if (totalAvailableHours <= 0) {
        return { success: false, message: "Not enough time remaining to break down this goal meaningfully." };
      }

      const hoursPerMilestone = totalAvailableHours / goal.milestones.length;
      const tasks: Task[] = goal.milestones.map((m, index) => {
        // Distribute milestone deadlines proportionally across the timeline.
        const progress = (index + 1) / goal.milestones.length;
        const milestoneDeadline = new Date(
          new Date().getTime() + (due.getTime() - new Date().getTime()) * progress
        );

        return {
          id: generateId("task"),
          title: `Work on milestone: ${m.title}`,
          description: `Part of goal "${goalTitle}". Estimated effort: ${hoursPerMilestone.toFixed(1)} hours.`,
          priority: "medium" as const,
          deadline: milestoneDeadline.toISOString(),
          status: "pending" as const,
          category: goal.title,
          estimatedTime: `${hoursPerMilestone.toFixed(1)} hours`,
          subtasks: [],
          createdAt: new Date().toISOString(),
        };
      });

      state.tasks.push(...tasks);
      return {
        success: true,
        message: `🎯 Goal "${goalTitle}" broken down into ${tasks.length} task(s) across ${weeksRemaining} week(s).`,
        tasks,
      };
    }


// ── delete_task ─────────────────────────────────────────────────────
case "delete_task": {
  const { id } = args;
  state.tasks = state.tasks.filter((t) => t.id !== id);
  return { success: true, message: "Task deleted." };
}
    // ── reschedule_at_risk_tasks ────────────────────────────────────────────
    case "reschedule_at_risk_tasks": {
      const { riskThresholdHours = 24 } = args;
      const now = new Date();
      const suggestions: string[] = [];
      const atRiskTasks: {
        id: string;
        title: string;
        originalDeadline: string;
        suggestedDeadline: string;
      }[] = [];

      for (const task of state.tasks) {
        if (task.status !== "pending") continue;

        const hoursRemaining =
          (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);

        // A task is at risk when it still has time left, but less than the threshold.
        if (hoursRemaining > 0 && hoursRemaining <= riskThresholdHours) {
          const suggested = suggestNewDeadline(task.deadline, riskThresholdHours);
          suggestions.push(
            `• "${task.title}" — originally due ${formatDate(task.deadline)} → suggest moving to ${formatDate(suggested)}`
          );
          atRiskTasks.push({
            id: task.id,
            title: task.title,
            originalDeadline: task.deadline,
            suggestedDeadline: suggested,
          });
        }
      }

      if (atRiskTasks.length === 0) {
        return {
          success: true,
          message: `✅ No tasks are at risk of missing their deadline (within ${riskThresholdHours}h window).`,
        };
      }

      // Mutate at-risk tasks directly so the user sees updated deadlines in the UI.
      for (const entry of atRiskTasks) {
        const task = state.tasks.find((t) => t.id === entry.id);
        if (task) task.deadline = entry.suggestedDeadline;
      }

      return {
        success: true,
        message: `⚠️ ${atRiskTasks.length} task(s) at risk of missing deadlines (within ${riskThresholdHours}h):\n${suggestions.join("\n")}`,
        atRiskTasks,
      };
    }

    // ── fallback ────────────────────────────────────────────────────────────
    default:
      return { success: false, message: `Unknown tool: "${name}". Please try rephrasing your request.` };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public orchestration function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a user message to the Gemini AI agent and return the result.
 *
 * Conversation flow:
 * 1. Load fresh state from SQLite (ensures we start from the persisted truth).
 * 2. Append the user's message to chat history.
 * 3. Send system prompt + full history to Gemini with tool definitions.
 * 4. If Gemini requests tool calls → execute each one against a state clone,
 *    collect the results, send them back to Gemini for a follow-up response.
 * 5. Append the AI's final reply to chat history.
 * 6. Persist the updated state to SQLite.
 * 7. Return the response text, updated task list, and updated goal list.
 *
 * @param {string} userMessage - Raw text from the user.
 *
 * @returns {Promise<ChatResult>} Structured result sent back to the client:
 * @property {string} response - AI's natural-language reply to display in chat.
 * @property {Task[]} tasks - Updated task list after any tool mutations.
 * @property {Goal[]} goals - Updated goal list after any tool mutations.
 */
export async function chat(userMessage: string) {
  // Step 1: Load the persisted state as our starting point for this turn.
  // `loadState` is imported from a CommonJS module (lib/db.js), so TypeScript
  // sees its return as `any`; cast it for type safety.
  const rawState = loadState() as { tasks: Task[]; goals: Goal[]; chatHistory: Message[] };
  const state: TaskStore = {
    tasks: rawState.tasks,
    goals: rawState.goals,
    chatHistory: [...rawState.chatHistory], // copy so we can mutate freely
  };

  // Step 2: Record the user's message in the working history.
  state.chatHistory.push({ role: "user", content: userMessage });

  // ── Build the messages array for Gemini ───────────────────────────────────
  // The system prompt is delivered as a synthetic user message so that Gemini
  // always sees it as the first context-setting turn, regardless of chat length.
  const messages = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    ...state.chatHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  ];

  // Step 3: Ask Gemini to generate a response (potentially with tool calls).
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      tools: taskTools as any,
      toolConfig: { functionCallingConfig: { mode: "AUTO" as any } },
    },
    contents: messages,
  });

  // Separate text parts (plain response) from function-call parts.
  const toolCalls = (response?.candidates?.[0]?.content?.parts ?? []).filter(
    (p: any) => p.functionCall
  );
  const textParts = (response?.candidates?.[0]?.content?.parts ?? []).filter(
    (p: any) => p.text
  );

  let fullResponse: string;
  let finalTasks: Task[];
  let finalGoals: Goal[];

  // Step 4: Handle tool calls if Gemini triggered any.
  if (toolCalls.length > 0) {
    // Seed the visible response with any text Gemini returned alongside the call.
    fullResponse = textParts.map((p: any) => p.text).join("") || "Let me handle that for you…";

    // Execute each tool call and collect the function results to send back.
    const functionResponses: any[] = [];
    for (const call of toolCalls) {
      const fc = (call as any).functionCall;
      const result = handleToolCall(fc.name, fc.args, state);
      functionResponses.push({
        functionResponse: { name: fc.name, response: result },
      });
    }

    // Ask Gemini to compose a human-readable follow-up after seeing tool results.
    const followUp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...messages,
        { role: "model", parts: toolCalls },
        { role: "user", parts: functionResponses },
      ],
    });

    const followUpText = (followUp?.candidates?.[0]?.content?.parts ?? [])
      .filter((p: any) => p.text)
      .map((p: any) => p.text)
      .join("");

    fullResponse += "\n" + followUpText;
    finalTasks = state.tasks;
    finalGoals = state.goals;
  } else {
    // No tools called — Gemini replied with plain text only.
    fullResponse = textParts.map((p: any) => p.text).join("");
    finalTasks = state.tasks;
    finalGoals = state.goals;
  }

  // Step 5: Record the AI's reply in history.
  state.chatHistory.push({ role: "model", content: fullResponse });

  // Step 6: Persist the mutated state (tasks, goals, chat history) to SQLite.
  saveState(state);

  // Step 7: Return a structured payload for the API route to serialise.
  return { response: fullResponse, tasks: finalTasks, goals: finalGoals };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper exports & utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the current persisted state without triggering an AI turn.
 * Used by `GET /api/chat` to hydrate the client on initial load.
 *
 * @returns {{ tasks: Task[]; goals: Goal[]; chatHistory: Message[] }}
 * A read-only snapshot of the SQLite store.
 */
export function getStore() {
  // `loadState` returns `any` (CommonJS module); cast for downstream type safety.
  const raw = loadState() as { tasks: Task[]; goals: Goal[]; chatHistory: Message[] };
  return {
    tasks: raw.tasks,
    goals: raw.goals,
    chatHistory: raw.chatHistory,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Private utility functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a prefixed unique ID using the current timestamp and a random suffix.
 *
 * Format: `<prefix>_<unix-ms>_<0-9999>`
 *
 * Sufficient for a single-user local app; not cryptographically unique.
 * For a multi-user production system, switch to UUID v7 or Snowflake IDs.
 *
 * @param {string} prefix - "task" or "goal" to namespace the ID.
 * @returns {string} A unique identifier string.
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/**
 * Format an ISO date string into a human-friendly short form for UI display.
 *
 * @param {string} iso - ISO-8601 date string.
 * @returns {string} E.g. "12 Jun 2026"
 */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso; // fallback: return raw string if parsing fails
  }
}

/**
 * Parse a human-readable time estimate (e.g. "2 hours", "30 mins") into a number.
 *
 * @param {string} timeStr - Free-form time string from the user or AI.
 * @returns {number} Hours as a positive number. Returns 1 for unparseable / zero / negative inputs.
 */
function parseTimeEstimate(timeStr: string): number {
  const lower = timeStr.toLowerCase();

  // Handle "mins" / "minutes" — divide by 60 to convert to hours
  if (lower.includes("min")) {
    const parsed = parseInt(timeStr, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed / 60;
    return 0.5; // default half-hour for vague minute estimates
  }

  // Handle decimal hours like "1.5 hours"
  const parsed = parseFloat(timeStr);
  if (!isNaN(parsed) && parsed > 0) return parsed;
  return 1;
}

/**
 * Normalise an arbitrary priority string to a valid `Task["priority"]` value.
 * Falls back to `"medium"` when the input is outside the allowed set.
 *
 * @param {string} p - Raw priority value (may come from AI argument extraction).
 * @returns {"urgent" | "high" | "medium" | "low"}
 */
function safePriority(p: string): "urgent" | "high" | "medium" | "low" {
  const valid: Array<"urgent" | "high" | "medium" | "low"> = [
    "urgent",
    "high",
    "medium",
    "low",
  ];
  return valid.includes(p as any) ? (p as any) : "medium";
}

/** @returns {Date} Start of the current day (midnight) in local time. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** @returns {Date} `date` plus `n` calendar days. */
function addDays(date: Date, n: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

/** @returns {Date} Start of the week (Sunday) containing `date`. */
function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

/**
 * Calculate a suggested new deadline by adding a buffer to the original.
 * The buffer is `2 × riskThresholdHours` — generous enough for replanning.
 *
 * @param {string} originalDeadline - ISO deadline string of the at-risk task.
 * @param {number} riskThresholdHours - Hours currently used as the risk window.
 * @returns {string} New ISO deadline string (original + buffer).
 */
function suggestNewDeadline(originalDeadline: string, riskThresholdHours: number): string {
  const date = new Date(originalDeadline);
  const bufferMs = riskThresholdHours * 2 * 60 * 60 * 1000;
  return new Date(date.getTime() + bufferMs).toISOString();
}
