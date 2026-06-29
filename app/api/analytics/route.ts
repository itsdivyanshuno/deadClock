import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentStreak,
  getLongestStreak,
  getTotalCompletions,
  getHeatmapData,
  getDailyLogs,
  getAchievements,
} from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshot = {
      streaks: {
        current: await getCurrentStreak(),
        longest: await getLongestStreak(),
        totalCompletions: await getTotalCompletions(),
      },
      heatmap: await getHeatmapData(),
      dailyLogs: await getDailyLogs(30),
      achievements: await getAchievements(),
    };
    return NextResponse.json(snapshot);
  } catch (error: any) {
    console.error("[analytics GET]", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to load analytics." },
      { status: 500 }
    );
  }
}
