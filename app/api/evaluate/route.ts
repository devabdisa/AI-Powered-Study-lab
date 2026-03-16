import { NextRequest, NextResponse } from "next/server";
import { generateJsonResponse } from "@/lib/gemini";
import { buildEvaluationPrompt } from "@/lib/prompt-builder";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { content, userAnswers } = payload;

    if (!content || !userAnswers || !Array.isArray(userAnswers)) {
      return NextResponse.json(
        { error: "Invalid payload. Expected content and userAnswers array." },
        { status: 400 }
      );
    }

    // Build the heavily engineered prompt that locks the AI into JSON mode
    const prompt = buildEvaluationPrompt(content, userAnswers);
    
    // Hit the specialized gemini-2.5-flash JSON endpoint
    const outputJSON = await generateJsonResponse(prompt);

    // Safely parse it out
    let evaluation;
    try {
      evaluation = JSON.parse(outputJSON);
    } catch (parseError) {
      console.error("AI returned unparseable JSON string:", outputJSON);
      return NextResponse.json(
        { error: "AI failed to format evaluation cleanly." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      evaluation 
    });

  } catch (error) {
    console.error("Evaluation error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
