import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { buildPrompt, StudyMode } from "@/lib/prompt-builder";
import { prisma } from "@/lib/db";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mode = formData.get("mode") as StudyMode;
    const difficulty = (formData.get("difficulty") as string) || "medium";
    const textInput = (formData.get("textInput") as string) || "";
    const file = formData.get("file") as File | null;

    if (!mode) {
      return NextResponse.json({ error: "Mode is required" }, { status: 400 });
    }

    let extractedContent = textInput;
    let fileUsed = false;
    let fileName: string | undefined;

    // Handle PDF file upload
    if (file && file.size > 0) {
      fileUsed = true;
      fileName = file.name;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract text from PDF buffer
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);

      const parsedText = pdfData.text;

      if (!parsedText || parsedText.trim().length < 10) {
        return NextResponse.json(
          {
            error:
              "Could not extract text from the PDF. Please try a text-based PDF.",
          },
          { status: 400 },
        );
      }

      // If they also typed something in the text box (like an assignment guideline)
      if (textInput.trim()) {
        extractedContent = `[Attached PDF Document]:\n${parsedText}\n\n[User Guidelines / Instructions]:\n${textInput.trim()}`;
      } else {
        extractedContent = parsedText;
      }
    }

    if (!extractedContent || extractedContent.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide some content (text or PDF file) to process." },
        { status: 400 },
      );
    }

    // Build the prompt
    const prompt = buildPrompt(mode, extractedContent, difficulty);

    // Generate with Gemini
    const output = await generateContent(prompt);

    // Save to database
    const saved = await prisma.generation.create({
      data: {
        mode,
        title: fileName
          ? `${mode} from ${fileName}`
          : `${mode} - ${new Date().toLocaleDateString()}`,
        inputText: extractedContent.slice(0, 5000), // limit stored input
        output,
        difficulty,
        fileUsed,
        fileName: fileName || null,
      },
    });

    return NextResponse.json({
      success: true,
      output,
      id: saved.id,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
