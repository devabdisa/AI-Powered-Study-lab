import { NextRequest, NextResponse } from "next/server";
import { generateContent, generateJsonResponse } from "@/lib/gemini";
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

    if (file && file.size > 0) {
      fileUsed = true;
      fileName = file.name;
      const fileExt = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let parsedText = "";

      try {
        if (fileExt === ".pdf") {
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          parsedText = pdfData.text;
        } else if (fileExt === ".docx") {
          const mammoth = require("mammoth");
          const mResult = await mammoth.extractRawText({ buffer: buffer });
          parsedText = mResult.value;
        } else if (fileExt === ".pptx") {
          const officeparser = require("officeparser");
          const pptxText = await new Promise<string>((resolve, reject) => {
            officeparser.parseOffice(buffer, (data: any, err: any) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          parsedText = pptxText;
        } else if (fileExt === ".txt" || fileExt === ".md") {
          parsedText = buffer.toString("utf-8");
        }

        if (!parsedText || (!parsedText.trim() && fileExt !== ".pptx")) {
           throw new Error(`Could not extract text from the ${fileExt.toUpperCase()} file.`);
        }

        if (textInput.trim()) {
          extractedContent = `[Attached Document (${fileExt.toUpperCase()})]:\n${parsedText}\n\n[User Guidelines / Instructions]:\n${textInput.trim()}`;
        } else {
          extractedContent = parsedText;
        }
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "File parsing failed" },
          { status: 400 }
        );
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

    // Generate with Gemini based on output modality
    const jsonModes = ["flashcards", "adaptive_learning", "quiz", "concept_map"];
    const output = jsonModes.includes(mode) 
      ? await generateJsonResponse(prompt) 
      : await generateContent(prompt);

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
      extractedContent,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
