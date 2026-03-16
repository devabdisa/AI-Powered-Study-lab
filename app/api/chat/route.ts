import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { message, history, contextText } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Convert existing history into a string format for Gemini
    const formattedHistory = history
      .map((msg: { role: string; content: string }) => `${msg.role === "user" ? "User" : "AI Tutor"}: ${msg.content}`)
      .join("\n\n");

    const prompt = `
You are a brilliant, conversational, and highly supportive AI Tutor inside an EdTech application called "AI Study Lab".
Your goal is to answer the User's questions based EXPLICITLY on the study context provided below.

INSTRUCTIONS:
1. Always be encouraging and friendly, like a world-class mentor.
2. If the user asks a question that is answered in the [Study Context], use that context to form your answer.
3. If the user asks a question not related to the [Study Context], it's okay to answer it using your general knowledge, but try to tie it back to their studies if possible.
4. Keep your answers concise unless they specifically ask for a deep dive. Provide short, punchy paragraphs with formatting like bolding or bullets where appropriate. 
5. You must speak markdown fluently.

[Study Context (The material the user is currently looking at)]:
"""
${contextText || "No context provided. The user is currently in the lobby."}
"""

[Previous Chat History]:
${formattedHistory}

User's New Message: ${message}

Provide your helpful response (format using markdown):
`.trim();

    const output = await generateContent(prompt);

    return NextResponse.json({ success: true, output });

  } catch (error) {
    console.error("Chat generation error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
