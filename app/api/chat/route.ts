/**
 * @module routes/chat
 * @description Next.js API Route — chat endpoint for the deadClock assistant.
 *
 * Endpoints:
 *  POST /api/chat   Accepts a user message, forwards it to the Gemini AI agent,
 *                   and returns the AI response along with the updated task/goal state.
 *  GET  /api/chat   Returns the current application state snapshot (tasks, goals,
 *                   and chat history) without modifying anything.
 *
 * Runtime: Node.js (required because `better-sqlite3` is a native module).
 */

import { NextRequest, NextResponse } from "next/server";
import { chat, getStore } from "@/lib/agent";


/**
 * Declare the runtime so Next.js knows this handler runs on the server.
 *
 * This is essential — without it Next.js would attempt to bundle `better-sqlite3`
 * (a native Node addon) for the Edge Runtime, which would fail at build time.
 */
export const runtime = "nodejs";


/**
 * POST /api/chat
 *
 * Accepts a chat message from the client, passes it to the AI agent for
 * processing, and returns the agent's response plus the updated task/goal list.
 *
 * @param {NextRequest} req - The incoming Next.js request.
 *   @property {string} req.body.message - The user's chat message.
 *
 * @returns {Promise<NextResponse<ChatResponse>>} JSON response with:
 *   @property {string}  response      - The AI's natural-language reply.
 *   @property {Task[]}  tasks         - Updated task list after any tool calls.
 *   @property {Goal[]}  goals         - Updated goal list after any tool calls.
 *
 * Error responses:
 *   400 — Missing `message` field in the request body.
 *   500 — Server misconfiguration (missing API key) or unhandled runtime error.
 */
export async function POST(req: NextRequest) {
  try {
    // ── 1. Validate input ────────────────────────────────────────────────
    const body = await req.json();
    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A non-empty 'message' string is required in the request body." },
        { status: 400 }
    );
    }

    // ── 2. Guard: ensure the Gemini API key is configured ────────────────
    // This check surfaces misconfiguration early with a clear error rather
    // than a confusing stack trace from deep inside the AI SDK.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[chat route] GEMINI_API_KEY is not set in the environment.");
      return NextResponse.json(
        { error: "Server configuration error: Gemini API key is missing." },
        { status: 500 }
    );
    }

    // ── 3. Delegate to the AI agent ──────────────────────────────────────
    // `chat()` handles: loading state from DB, building the Gemini request
    // with tool definitions, executing any tool calls, persisting state, and
    // returning a structured response.
    const result = await chat(message);

    // ── 4. Return structured result ──────────────────────────────────────
    return NextResponse.json(result);
  } catch (error: any) {
    // Catch-all for unexpected errors (network issues, SDK failures, etc.)
    console.error("[chat route] Unhandled error:", error);
    return NextResponse.json(
      { error: error?.message ?? "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}


/**
 * GET /api/chat
 *
 * Lightweight endpoint that returns the current application state without
 * triggering an AI call. Used by the client on initial load to hydrate the
 * Tasks and Goals views from the persisted store.
 *
 * @returns {Promise<NextResponse<StoreSnapshot>>} JSON mirror of the SQLite store:
 *   @property {Task[]}    tasks       - All tasks (live data from DB).
 *   @property {Goal[]}    goals       - All goals (live data from DB).
 *   @property {Message[]} chatHistory - Full conversation history (live data from DB).
 */
export async function GET() {
  const store = getStore();
  return NextResponse.json(store);
}
