import { NextRequest, NextResponse } from "next/server";
import { chat, getStore } from "@/lib/agent";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }
    // Debug: check if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return NextResponse.json({ error: "Server configuration error: missing API key" }, { status: 500 });
    }
    const result = await chat(message);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(getStore());
}
