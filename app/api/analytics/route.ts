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
        current: getCurrentStreak(),
        longest: getLongestStreak(),
        totalCompletions: getTotalCompletions(),
      },
      heatmap: getHeatmapData(),
      dailyLogs: getDailyLogs(30),
      achievements: getAchievements(),
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
