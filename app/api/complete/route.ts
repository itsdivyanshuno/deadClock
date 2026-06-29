import { NextRequest, NextResponse } from "next/server";
import { recordCompletion } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/complete
 *
 * Called when the user toggles a task to "completed."
 * Persists the completion in daily_logs, updates the streak
 * counters, and checks for any newly-unlocked achievements.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = body.task;

    if (!task || !task.id) {
      return NextResponse.json(
        { error: "A task object with an id is required." },
        { status: 400 }
      );
    }

    await recordCompletion(task);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[complete POST]", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to record completion." },
      { status: 500 }
    );
  }
}
