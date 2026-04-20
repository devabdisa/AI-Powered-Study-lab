import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { runLectureDecoder } from "@/lib/lecture-decoder/orchestrator";
import { ensureLectureDecoderStorage } from "@/lib/lecture-decoder/storage";
import { GeminiQuotaError } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 120;

function isPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P1017" || error.code === "P1001";
  }
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("server has closed the connection") ||
    message.includes("can't reach database server")
  );
}

async function createGenerationWithRetry(data: {
  mode: string;
  title: string;
  inputText: string;
  output: string;
  difficulty: string;
  fileUsed: boolean;
  fileName: string | null;
}) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await prisma.generation.create({ data });
    } catch (error) {
      if (!isPrismaConnectionError(error) || attempt === 2) throw error;
      await prisma.$disconnect();
      await prisma.$connect();
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const isForm = contentType.includes("multipart/form-data");

    let textInput = "";
    let jobId: string | undefined;
    let file: File | null = null;

    if (isForm) {
      const formData = await req.formData();
      textInput = (formData.get("textInput") as string) || "";
      jobId = (formData.get("jobId") as string) || undefined;
      file = (formData.get("file") as File | null) || null;
    } else {
      const body = await req.json();
      textInput = body.textInput ?? "";
      jobId = body.jobId ?? undefined;
    }

    if (!jobId && !textInput.trim() && !file) {
      return NextResponse.json(
        { error: "Provide lecture text or a supported file." },
        { status: 400 },
      );
    }

    await ensureLectureDecoderStorage();

    const result = await runLectureDecoder({
      jobId,
      textInput,
      file,
    });

    if (result.artifact && result.views) {
      await createGenerationWithRetry({
        mode: "lecture_decoder_v2",
        title: `Lecture Decoder - ${new Date().toLocaleDateString()}`,
        inputText: textInput.slice(0, 5000),
        output: JSON.stringify(
          {
            jobId: result.jobId,
            status: result.status,
            subjectLabel: result.subjectLabel,
            artifact: result.artifact,
            views: result.views,
          },
          null,
          2,
        ),
        difficulty: "adaptive",
        fileUsed: Boolean(file),
        fileName: file?.name ?? null,
      });
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Lecture decoder route error:", error);
    if (error instanceof GeminiQuotaError) {
      return NextResponse.json(
        {
          error: error.message,
          code: "GEMINI_QUOTA_EXCEEDED",
          retryAfterSeconds:
            error.retryAfterMs !== null
              ? Math.max(1, Math.ceil(error.retryAfterMs / 1000))
              : null,
          isDailyExhausted: error.isDailyExhausted,
        },
        { status: 429 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Unknown decoder error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
