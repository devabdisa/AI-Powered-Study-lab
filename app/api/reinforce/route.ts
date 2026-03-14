import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { buildReinforcementPrompt } from "@/lib/prompt-builder";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { weakTopics } = payload;

    if (!weakTopics || !Array.isArray(weakTopics) || weakTopics.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload. Expected an array of weakTopics." },
        { status: 400 }
      );
    }

    // Build the instruction to generate practice for ONLY the weak topics
    const prompt = buildReinforcementPrompt(weakTopics);
    
    // We can use standard Markdown generation for the practice questions
    const output = await generateContent(prompt);

    return NextResponse.json({ 
      success: true, 
      output 
    });

  } catch (error) {
    console.error("Reinforcement error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
