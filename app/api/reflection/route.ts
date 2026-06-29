import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const runtime = "nodejs";

interface ReflectionEntry {
  id?: number;
  wentWell: string;
  toImprove: string;
  tomorrowFocus: string;
  mood: string;
  createdAt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wentWell, toImprove, tomorrowFocus, mood } = body as Partial<ReflectionEntry>;

    if (!wentWell?.trim() || !toImprove?.trim() || !tomorrowFocus?.trim()) {
      return NextResponse.json(
        { error: "wentWell, toImprove, and tomorrowFocus are required." },
        { status: 400 }
      );
    }

    const db = await getDB();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wentWell TEXT NOT NULL,
        toImprove TEXT NOT NULL,
        tomorrowFocus TEXT NOT NULL,
        mood TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const result = await db.execute(
      "INSERT INTO reflections (wentWell, toImprove, tomorrowFocus, mood) VALUES (?, ?, ?, ?)",
      [wentWell.trim(), toImprove.trim(), tomorrowFocus.trim(), mood?.trim() || null]
    );

    return NextResponse.json({ ok: true, id: result.lastInsertRowid });
  } catch (error: any) {
    console.error("[reflection POST]", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to save reflection." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDB();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wentWell TEXT NOT NULL,
        toImprove TEXT NOT NULL,
        tomorrowFocus TEXT NOT NULL,
        mood TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const rows = (await db.execute(
      "SELECT id, wentWell, toImprove, tomorrowFocus, mood, createdAt FROM reflections ORDER BY createdAt DESC LIMIT 50"
    )).rows;

    return NextResponse.json({ reflections: rows });
  } catch (error: any) {
    console.error("[reflection GET]", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to load reflections." },
      { status: 500 }
    );
  }
}
