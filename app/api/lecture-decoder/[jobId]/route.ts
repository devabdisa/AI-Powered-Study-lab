import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureLectureDecoderStorage } from "@/lib/lecture-decoder/storage";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    await ensureLectureDecoderStorage();
    const job = await prisma.lectureDecodeJob.findUnique({
      where: { id: jobId },
      include: {
        chunks: {
          orderBy: { chunkIndex: "asc" },
          select: {
            chunkIndex: true,
            sectionTitle: true,
            status: true,
            attempts: true,
            errorMessage: true,
            isComplete: true,
          },
        },
      },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Lecture decoder GET job failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch lecture decoder job." },
      { status: 500 },
    );
  }
}
