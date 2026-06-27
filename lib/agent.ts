import { GoogleGenAI } from "@google/genai";
import { loadState, saveState } from "./db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "urgent" | "high" | "medium" | "low";
  deadline: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  category: string;
  estimatedTime: string;
  subtasks: string[];
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number;
  milestones: { title: string; done: boolean }[];
}

interface TaskStore {
  tasks: Task[];
  goals: Goal[];
  chatHistory: { role: string; content: string }[];
}

// Helper to deep copy state (we'll work on a copy per request)
function cloneState(state: any): any {
  return JSON.parse(JSON.stringify(state));
}

// Helper to safely parse time estimates
function parseTimeEstimate(timeStr: string): number {
  const parsed = parseInt(timeStr);
  return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
}

// Helper to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// Helper to format date (same as before)
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const SYSTEM_PROMPT = `You are "Deadline", an AI productivity companion. Your job is to help users plan, prioritize, and complete tasks before deadlines.

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

const taskTools = [
  {
    functionDeclarations: [
      {
        name: "add_task",
        description: "Create a new task for the user",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short task title" },
            description: { type: "string", description: "Detailed description" },
            deadline: { type: "string", description: "Deadline date/time in ISO format" },
            category: { type: "string", description: "Category like 'Work', 'Study', 'Personal', 'Health'" },
            estimatedTime: { type: "string", description: "Estimated completion time like '2 hours', '30 mins'" },
            priority: { type: "string", description: "Priority: urgent, high, medium, or low" },
            subtasks: { type: "array", items: { type: "string" }, description: "Break into smaller steps if applicable" },
          },
          required: ["title", "deadline"],
        },
      },
      {
        name: "prioritize_tasks",
        description: "Prioritize and reorder all pending tasks by urgency/impact",
        parameters: {
          type: "object",
          properties: {
            reason: { type: "string", description: "Brief explanation of the prioritization strategy" },
          },
        },
      },
      {
        name: "complete_task",
        description: "Mark a task as completed",
        parameters: {
          type: "object",
          properties: {
            taskId: { type: "string", description: "The ID of the task to complete" },
          },
          required: ["taskId"],
        },
      },
      {
        name: "add_goal",
        description: "Create a long-term goal with milestones",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Goal title" },
            description: { type: "string", description: "What this goal means to the user" },
            deadline: { type: "string", description: "Target completion date" },
            milestones: { type: "array", items: { type: "string" }, description: "Key milestones to track progress" },
          },
          required: ["title", "deadline"],
        },
      },
      {
        name: "suggest_schedule",
        description: "Suggest an optimal schedule for completing pending tasks",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Date to plan for (default: today)" },
          },
        },
      },
      {
        name: "get_reminders",
        description: "Get a list of urgent/overdue tasks that need attention",
        parameters: {
          type: "object",
          properties: {
            timeframe: { type: "string", description: "How far ahead: 'today', 'tomorrow', 'this_week'" },
          },
        },
      },
      // NEW: Proactive agent features for Agentic Depth
      {
        name: "suggest_proactive_actions",
        description: "Suggest proactive actions based on user's current workload and patterns",
        parameters: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              enum: ["today", "tomorrow", "this_week"],
              description: "Timeframe for suggestions",
            },
            focusArea: {
              type: "string",
              enum: ["work", "study", "health", "personal"],
              description: "Area to focus suggestions on",
            },
          },
          required: ["timeframe"],
        },
      },
      {
        name: "break_down_goal",
        description: "Autonomously break a high-level goal into weekly/daily actionable tasks",
        parameters: {
          type: "object",
          properties: {
            goalTitle: { type: "string", description: "The high-level goal to break down" },
            deadline: { type: "string", description: "Target completion date (ISO format)" },
            availableHoursPerWeek: {
              type: "number",
              description: "How many hours per week the user can dedicate",
            },
          },
          required: ["goalTitle", "deadline", "availableHoursPerWeek"],
        },
      },
      {
        name: "reschedule_at_risk_tasks",
        description: "Identify tasks at risk of missing deadlines and suggest realistic new deadlines",
        parameters: {
          type: "object",
          properties: {
            riskThresholdHours: {
              type: "number",
              description: "Hours before deadline to consider 'at risk' (default: 24)",
              default: 24,
            },
          },
        },
      },
    ],
  },
];

function handleToolCall(name: string, args: any, state: TaskStore) {
  switch (name) {
    case "add_task": {
      const task: Task = {
        id: generateId("task"),
        title: args.title,
        description: args.description || "",
        priority: (args.priority || "medium") as Task["priority"],
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
    case "prioritize_tasks": {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      state.tasks.sort((a, b) => {
        const pendingA = a.status === "pending" ? 0 : 1;
        const pendingB = b.status === "pending" ? 0 : 1;
        return pendingA - pendingB || (order[a.priority as keyof typeof order] || 2) - (order[b.priority as keyof typeof order] || 2);
      });
      const summary = state.tasks
        .filter((t) => t.status === "pending")
        .map((t) => `• ${t.priority.toUpperCase()}: ${t.title} (${formatDate(t.deadline)})`)
        .join("\n");
      return {
        success: true,
        message: `📋 Prioritized ${state.tasks.filter((t) => t.status === "pending").length} pending tasks:\n${summary || "No pending tasks — you're all clear!"}`,
      };
    }
    case "complete_task": {
      const task = state.tasks.find((t) => t.id === args.taskId);
      if (!task) return { success: false, message: "Task not found." };
      task.status = "completed";
      return { success: true, message: `🎉 Nice work! "${task.title}" marked as completed.` };
    }
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
        message: `🎯 Goal created: "${goal.title}" — ${goal.milestones.length} milestones set`,
      };
    }
    case "suggest_schedule": {
      const pending = state.tasks.filter((t) => t.status === "pending");
      if (pending.length === 0) return { success: true, message: "📅 No pending tasks to schedule. Enjoy your free time!" };
      const schedule = pending.slice(0, 5).map((t, i) => {
        const hour = 9 + i * 2;
        const endHour = hour + parseTimeEstimate(t.estimatedTime);
        return `• ${hour}:00 - ${endHour}:00 → ${t.title} (${t.estimatedTime}, ${t.priority} priority)`;
      });
      return {
        success: true,
        message: `📅 Suggested schedule:\n${schedule.join("\n")}\n\n💡 Adjust based on your energy levels — hard tasks first if you're a morning person!`,
      };
    }
    case "get_reminders": {
      const now = new Date();
      const urgent = state.tasks.filter((t) => {
        if (t.status !== "pending") return false;
        const deadline = new Date(t.deadline);
        const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (args.timeframe === "today") return diffHours <= 24;
        if (args.timeframe === "tomorrow") return diffHours > 24 && diffHours <= 48;
        if (args.timeframe === "this_week") return diffHours > 48 && diffHours <= 168;
        return t.priority === "urgent" || t.priority === "high";
      });
      if (urgent.length === 0) return { success: true, message: "✅ No urgent reminders right now. You're on top of things!" };
      const list = urgent
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .map((t) => `• 🔴 ${t.title} — due ${formatDate(t.deadline)} (${t.priority})`)
        .join("\n");
      return { success: true, message: `⚠️ ${urgent.length} task(s) need your attention:\n${list}` };
    }
    // NEW IMPLEMENTATIONS
    case "suggest_proactive_actions": {
      const { timeframe, focusArea } = args;
      // Analyze current tasks and goals to generate suggestions
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);
      const weekStart = new Date(todayStart);
      weekStart.setDate(todayStart.getDate() - todayStart.getDay()); // start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      let periodStart: Date, periodEnd: Date;
      switch (timeframe) {
        case "today":
          periodStart = todayStart;
          periodEnd = new Date(todayStart);
          periodEnd.setDate(todayStart.getDate() + 1);
          break;
        case "tomorrow":
          periodStart = tomorrowStart;
          periodEnd = new Date(tomorrowStart);
          periodEnd.setDate(tomorrowStart.getDate() + 1);
          break;
        case "this_week":
          periodStart = weekStart;
          periodEnd = weekEnd;
          break;
      }

      const suggestions: string[] = [];

      // 1. Overdue tasks
      const overdue = state.tasks.filter(t => t.status === "pending" && new Date(t.deadline) < now);
      if (overdue.length > 0) {
        suggestions.push(`🚨 You have ${overdue.length} overdue task(s). Consider tackling them first or renegotiating deadlines.`);
      }

      // 2. Upcoming deadlines in period
      const upcoming = state.tasks.filter(t => t.status === "pending" && new Date(t.deadline) >= periodStart && new Date(t.deadline) < periodEnd);
      if (upcoming.length > 0) {
        suggestions.push(`📅 You have ${upcoming.length} task(s) due in the selected timeframe. Consider time-blocking for: ${upcoming.map(t => t.title).join(", ")}`);
      }

      // 3. Load balancing: suggest focusing on area with most tasks
      if (focusArea) {
        const areaTasks = state.tasks.filter(t => t.category.toLowerCase() === focusArea.toLowerCase() && t.status === "pending");
        if (areaTasks.length > 0) {
          suggestions.push(`🎯 Focus on ${focusArea}: you have ${areaTasks.length} pending ${focusArea.toLowerCase()} tasks. Consider dedicating a block to clear them.`);
        }
      }

      // 4. Goal progress check
      const goalsWithProgress = state.goals.map(g => {
        const completed = g.milestones.filter(m => m.done).length;
        const total = g.milestones.length;
        return { goal: g, percent: total ? Math.round((completed / total) * 100) : 0 };
      }).filter(g => g.percent < 100);
      if (goalsWithProgress.length > 0) {
        const lowest = goalsWithProgress.reduce((min, g) => g.percent < min.percent ? g : min, goalsWithProgress[0]);
        suggestions.push(`🎯 Goal "${lowest.goal.title}" is at ${lowest.percent}% completion. Next milestone: "${lowest.goal.milestones.find(m => !m.done)?.title || "N/A"}"`);
      }

      // 5. Suggest breaking down large tasks
      const bigTasks = state.tasks.filter(t => t.subtasks.length === 0 && t.estimatedTime && parseTimeEstimate(t.estimatedTime) > 2); // >2 hours
      if (bigTasks.length > 0) {
        suggestions.push(`🔧 Consider breaking down these larger tasks into subtasks: ${bigTasks.map(t => t.title).join(", ")}`);
      }

      const msg = suggestions.length > 0 ? suggestions.join("\n\n") : "✅ Everything looks good! Keep up the great work.";
      return { success: true, message: `💡 Proactive Suggestions for ${timeframe}:\n\n${msg}` };
    }

    case "break_down_goal": {
      const { goalTitle, deadline, availableHoursPerWeek } = args;
      // Input validation
      if (availableHoursPerWeek <= 0) {
        return { success: false, message: "Available hours per week must be positive." };
      }

      const goal = state.goals.find(g => g.title === goalTitle);
      if (!goal) return { success: false, message: `Goal "${goalTitle}" not found.` };

      const dueDate = new Date(deadline);
      const today = new Date();

      // Check if deadline is in the past
      if (dueDate <= today) {
        return { success: false, message: "Goal deadline must be in the future." };
      }

      const weeksDiff = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)));
      const totalHours = weeksDiff * availableHoursPerWeek;
      if (totalHours <= 0) return { success: false, message: "Not enough time left to break down this goal." };

      // Simple breakdown: allocate hours to milestones evenly
      const milestones = goal.milestones.map(m => ({ title: m.title, done: m.done }));

      // Handle edge case where goal has no milestones
      if (milestones.length === 0) {
        return {
          success: false,
          message: "Goal has no milestones to break down. Please add milestones first."
        };
      }

      const hoursPerMilestone = totalHours / milestones.length;
      const tasks: Task[] = [];

      // Distribute deadlines evenly across the timeline
      milestones.forEach((m, index) => {
        // Calculate proportional time for this milestone
        const progress = (index + 1) / milestones.length;
        const milestoneDeadline = new Date(today.getTime() + (dueDate.getTime() - today.getTime()) * progress);

        const task: Task = {
          id: generateId("task"),
          title: `Work on milestone: ${m.title}`,
          description: `Part of goal "${goalTitle}". Estimated time: ${hoursPerMilestone.toFixed(1)} hours.`,
          priority: "medium",
          deadline: milestoneDeadline.toISOString(),
          status: "pending",
          category: goal.title,
          estimatedTime: `${hoursPerMilestone.toFixed(1)} hours`,
          subtasks: [],
          createdAt: new Date().toISOString(),
        };
        tasks.push(task);
      });

      state.tasks.push(...tasks);
      return {
        success: true,
        message: `🎯 Goal "${goalTitle}" broken down into ${tasks.length} tasks over ${weeksDiff} week(s).`,
        tasks: tasks,
      };
    }

    case "reschedule_at_risk_tasks": {
      const { riskThresholdHours = 24 } = args;
      const now = new Date();
      const atRisk: Task[] = [];
      const suggestions: string[] = [];

      state.tasks.forEach(task => {
        if (task.status !== "pending") return;
        const deadline = new Date(task.deadline);
        const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= riskThresholdHours) {
          atRisk.push(task);
          // Suggest a new deadline: add some buffer
          const newDeadline = new Date(deadline.getTime() + (riskThresholdHours * 2 * 60 * 60 * 1000)); // add 2x threshold hours as buffer
          suggestions.push(`• "${task.title}" originally due ${formatDate(task.deadline)} → consider moving to ${formatDate(newDeadline.toISOString())}`);
        }
      });

      if (atRisk.length === 0) return { success: true, message: "✅ No tasks at risk of missing deadlines in the specified timeframe." };

      return {
        success: true,
        message: `⚠️ ${atRisk.length} task(s) at risk of missing deadlines (within ${riskThresholdHours} hours):\n${suggestions.join("\n")}`,
        atRiskTasks: atRisk.map(t => ({ id: t.id, title: t.title, originalDeadline: t.deadline, suggestedDeadline: suggestNewDeadline(t.deadline, riskThresholdHours) })),
      };
    }

    default:
      return { success: false, message: `Unknown tool: ${name}` };
  }
}

// Helper for reschedule function
function suggestNewDeadline(originalDeadline: string, riskThresholdHours: number): string {
  const date = new Date(originalDeadline);
  const bufferMs = riskThresholdHours * 2 * 60 * 60 * 1000; // 2x threshold as buffer
  return new Date(date.getTime() + bufferMs).toISOString();
}

// Helper function to safely access enum values (since we can't guarantee args.priority is valid)
function safePriority(p: string): "urgent" | "high" | "medium" | "low" {
  const valid: ("urgent" | "high" | "medium" | "low")[] = ["urgent", "high", "medium", "low"];
  return valid.includes(p as any) ? (p as any) : "medium";
}

export async function chat(userMessage: string) {
  // Load current state from DB
  const rawState = loadState();
  // Ensure proper typing (cast)
  const state: TaskStore = {
    tasks: rawState.tasks,
    goals: rawState.goals,
    chatHistory: rawState.chatHistory
  };

  // Add user message to history
  state.chatHistory.push({ role: "user", content: userMessage });

  let messages = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    ...state.chatHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })),
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { tools: taskTools as any, toolConfig: { functionCallingConfig: { mode: "AUTO" as any } } },
    contents: messages,
  });

  const toolCalls = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall) || [];
  const textParts = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) || [];

  if (toolCalls.length > 0) {
    let finalText = textParts.map((p: any) => p.text).join("") || "Let me handle that for you...";
    const functionResponses: any[] = [];

    for (const call of toolCalls) {
      const _fc = (call as any).functionCall!;
      const result = handleToolCall(_fc.name, _fc.args, state);
      functionResponses.push({
        functionResponse: {
          name: _fc.name,
          response: result,
        },
      });
    }

    const followUp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...messages,
        { role: "model", parts: toolCalls },
        { role: "user", parts: functionResponses },
      ],
    });

    const followUpText = followUp.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) || [];
    const fullResponse = textParts.map((p: any) => p.text).join("") + "\n" + followUpText.map((p: any) => p.text).join("");
    state.chatHistory.push({ role: "model", content: fullResponse });

    // Save updated state back to DB
    saveState(state);

    return {
      response: fullResponse,
      tasks: state.tasks,
      goals: state.goals,
    };
  }

  const reply = textParts.map((p: any) => p.text).join("");
  state.chatHistory.push({ role: "model", content: reply });
  // Save state (to persist chat history)
  saveState(state);

  return { response: reply, tasks: state.tasks, goals: state.goals };
}

export function getStore() {
  const raw = loadState();
  return { tasks: raw.tasks, goals: raw.goals, chatHistory: raw.chatHistory };
}