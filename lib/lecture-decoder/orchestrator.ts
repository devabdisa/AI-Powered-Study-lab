import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { chunkDocument } from "@/lib/lecture-decoder/chunker";
import { classifySubject } from "@/lib/lecture-decoder/classifier";
import { ingestLectureSource } from "@/lib/lecture-decoder/ingestion";
import {
  buildChunkDecodePrompt,
  buildContinuationPrompt,
  buildMergePrompt,
} from "@/lib/lecture-decoder/prompts";
import { buildLectureViews } from "@/lib/lecture-decoder/renderer";
import {
  chunkDecodeSchema,
  mergedLectureArtifactSchema,
  LectureDecoderResult,
  MergedLectureArtifact,
  NormalizedDocument,
  SubjectLabel,
} from "@/lib/lecture-decoder/schemas";
import {
  hashString,
  parseWithSchema,
  truncate,
} from "@/lib/lecture-decoder/utils";
import { generateJsonResponseWithConfig } from "@/lib/gemini";

const MAX_CHUNK_ATTEMPTS = 3;

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

async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  label: string,
  logs?: string[],
): Promise<T> {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isPrismaConnectionError(error) || attempt === 2) throw error;
      logs?.push(`${label}: DB connection dropped, reconnecting and retrying.`);
      await prisma.$disconnect();
      await prisma.$connect();
    }
  }
  throw new Error(`${label}: DB operation failed after retry.`);
}

interface RunDecoderInput {
  jobId?: string;
  textInput: string;
  file: File | null;
}

async function decodeChunkWithContinuation(params: {
  subjectLabel: SubjectLabel;
  chunk: ReturnType<typeof chunkDocument>[number];
  logs: string[];
}): Promise<{
  ok: boolean;
  decoded: Prisma.JsonValue | null;
  raw: string;
  hadContinuation: boolean;
  error?: string;
}> {
  const chunkPrompt = buildChunkDecodePrompt(params.chunk, params.subjectLabel);
  let raw = await generateJsonResponseWithConfig(chunkPrompt, {
    maxOutputTokens: 4096,
    temperature: 0.25,
  });

  let parsed = parseWithSchema(chunkDecodeSchema, raw);
  let hadContinuation = false;

  if (!parsed.ok) {
    params.logs.push(
      `Chunk ${params.chunk.metadata.chunkIndex}: malformed output, attempting continuation repair.`,
    );
    hadContinuation = true;
    const continuationPrompt = buildContinuationPrompt({
      subject: params.subjectLabel,
      chunk: params.chunk,
      partialResponse: raw,
      validationError: parsed.error,
    });
    const repaired = await generateJsonResponseWithConfig(continuationPrompt, {
      maxOutputTokens: 4096,
      temperature: 0.2,
    });
    raw = repaired;
    parsed = parseWithSchema(chunkDecodeSchema, repaired);
  }

  if (!parsed.ok) {
    return {
      ok: false,
      decoded: null,
      raw,
      hadContinuation,
      error: parsed.error,
    };
  }

  if (!parsed.data.completion.isComplete && !parsed.data.completion.missingTailHint) {
    return {
      ok: false,
      decoded: null,
      raw,
      hadContinuation,
      error: "Chunk decoder marked incomplete without a continuation hint.",
    };
  }

  return {
    ok: true,
    decoded: parsed.data as unknown as Prisma.JsonValue,
    raw,
    hadContinuation,
  };
}

async function createOrLoadJob(
  input: RunDecoderInput,
): Promise<{
  jobId: string;
  subjectLabel: SubjectLabel;
  document: NormalizedDocument;
  chunks: ReturnType<typeof chunkDocument>;
}> {
  if (input.jobId) {
    const existing = await withPrismaRetry(
      () =>
        prisma.lectureDecodeJob.findUnique({
          where: { id: input.jobId },
          include: {
            chunks: { orderBy: { chunkIndex: "asc" } },
          },
        }),
      "load-job",
    );
    if (!existing) {
      throw new Error("Lecture decode job not found.");
    }

    const parsedMeta = (existing.metadata ?? {}) as {
      title?: string;
      sourceType?: NormalizedDocument["sourceType"];
      chunks?: ReturnType<typeof chunkDocument>;
      subjectLabel?: SubjectLabel;
    };

    if (!parsedMeta.chunks || !parsedMeta.sourceType || !parsedMeta.title) {
      throw new Error("Existing job metadata is corrupted.");
    }

    const document: NormalizedDocument = {
      title: parsedMeta.title,
      sourceType: parsedMeta.sourceType,
      rawText: existing.normalizedText,
      normalizedText: existing.normalizedText,
      blocks: [],
    };

    return {
      jobId: existing.id,
      subjectLabel: parsedMeta.subjectLabel ?? "mixed",
      document,
      chunks: parsedMeta.chunks,
    };
  }

  const document = await ingestLectureSource({
    file: input.file,
    textInput: input.textInput,
  });

  const chunks = chunkDocument(document);
  if (chunks.length === 0) {
    throw new Error("Could not produce decodable chunks from the lecture material.");
  }

  const classifier = classifySubject(document.normalizedText);
  const sourceDigest = hashString(document.normalizedText);

  const created = await withPrismaRetry(
    () =>
      prisma.lectureDecodeJob.create({
        data: {
          title: document.title,
          sourceType: document.sourceType,
          status: "queued",
          normalizedText: document.normalizedText,
          sourceDigest,
          subjectLabel: classifier.label,
          metadata: {
            title: document.title,
            sourceType: document.sourceType,
            chunks,
            subjectLabel: classifier.label,
            classifierReason: classifier.reason,
          } as unknown as Prisma.InputJsonValue,
          chunks: {
            create: chunks.map((chunk) => ({
              chunkIndex: chunk.metadata.chunkIndex,
              sectionTitle: chunk.metadata.sectionTitle,
              sourceType: chunk.metadata.sourceType,
              pageStart: chunk.metadata.pageStart,
              pageEnd: chunk.metadata.pageEnd,
              status: "pending",
            })),
          },
        },
      }),
    "create-job",
  );

  return {
    jobId: created.id,
    subjectLabel: classifier.label,
    document,
    chunks,
  };
}

export async function runLectureDecoder(
  input: RunDecoderInput,
): Promise<LectureDecoderResult> {
  const logs: string[] = [];
  const jobBundle = await createOrLoadJob(input);
  const { jobId, chunks, subjectLabel } = jobBundle;
  logs.push(
    `Initialized job ${jobId} with ${chunks.length} chunks. Subject=${subjectLabel}.`,
  );

  await withPrismaRetry(
    () =>
      prisma.lectureDecodeJob.update({
        where: { id: jobId },
        data: { status: "processing" },
      }),
    "set-job-processing",
    logs,
  );

  let hadContinuation = false;

  for (const chunk of chunks) {
    const row = await withPrismaRetry(
      () =>
        prisma.lectureChunkResult.findUnique({
          where: {
            jobId_chunkIndex: {
              jobId,
              chunkIndex: chunk.metadata.chunkIndex,
            },
          },
        }),
      `load-chunk-${chunk.metadata.chunkIndex}`,
      logs,
    );

    if (!row) continue;
    if (row.status === "completed" && row.decoded) {
      logs.push(`Chunk ${chunk.metadata.chunkIndex}: already completed; skipping.`);
      continue;
    }
    if (row.attempts >= MAX_CHUNK_ATTEMPTS) {
      logs.push(
        `Chunk ${chunk.metadata.chunkIndex}: max attempts reached; leaving as failed.`,
      );
      continue;
    }

    await withPrismaRetry(
      () =>
        prisma.lectureChunkResult.update({
          where: {
            jobId_chunkIndex: { jobId, chunkIndex: chunk.metadata.chunkIndex },
          },
          data: {
            status: "processing",
            attempts: { increment: 1 },
            errorMessage: null,
          },
        }),
      `set-chunk-processing-${chunk.metadata.chunkIndex}`,
      logs,
    );

    const decode = await decodeChunkWithContinuation({
      subjectLabel,
      chunk,
      logs,
    });

    hadContinuation = hadContinuation || decode.hadContinuation;

    if (!decode.ok) {
      await withPrismaRetry(
        () =>
          prisma.lectureChunkResult.update({
            where: {
              jobId_chunkIndex: { jobId, chunkIndex: chunk.metadata.chunkIndex },
            },
            data: {
              status: "failed",
              rawModelOutput: decode.raw,
              errorMessage: decode.error ?? "Failed to decode chunk.",
              isComplete: false,
            },
          }),
        `set-chunk-failed-${chunk.metadata.chunkIndex}`,
        logs,
      );
      logs.push(
        `Chunk ${chunk.metadata.chunkIndex}: failed (${truncate(
          decode.error ?? "unknown",
          120,
        )}).`,
      );
      continue;
    }

    await withPrismaRetry(
      () =>
        prisma.lectureChunkResult.update({
          where: {
            jobId_chunkIndex: { jobId, chunkIndex: chunk.metadata.chunkIndex },
          },
          data: {
            status: "completed",
            rawModelOutput: decode.raw,
            decoded: decode.decoded as Prisma.InputJsonValue,
            isComplete: true,
          },
        }),
      `set-chunk-completed-${chunk.metadata.chunkIndex}`,
      logs,
    );
    logs.push(`Chunk ${chunk.metadata.chunkIndex}: completed.`);
  }

  const finalized = await withPrismaRetry(
    () =>
      prisma.lectureDecodeJob.findUnique({
        where: { id: jobId },
        include: { chunks: { orderBy: { chunkIndex: "asc" } } },
      }),
    "finalize-load-job",
    logs,
  );

  if (!finalized) {
    throw new Error("Decoder job vanished before merge.");
  }

  const completedChunks = finalized.chunks.filter(
    (chunk) => chunk.status === "completed" && chunk.decoded,
  );
  const missingChunks = finalized.chunks
    .filter((chunk) => chunk.status !== "completed")
    .map((chunk) => chunk.chunkIndex);

  if (completedChunks.length === 0) {
    await withPrismaRetry(
      () =>
        prisma.lectureDecodeJob.update({
          where: { id: jobId },
          data: { status: "failed" },
        }),
      "set-job-failed",
      logs,
    );
    return {
      jobId,
      status: "failed",
      subjectLabel,
      artifact: null,
      views: null,
      completedChunks: 0,
      totalChunks: finalized.chunks.length,
      logs: [...logs, "No chunk could be decoded successfully."],
    };
  }

  const mergePrompt = buildMergePrompt({
    subject: subjectLabel,
    completedChunks: completedChunks.map((chunk) => ({
      chunkIndex: chunk.chunkIndex,
      decoded: chunk.decoded as unknown,
    })),
    totalChunks: finalized.chunks.length,
    missingChunks,
    hadContinuation,
  });
  const mergedRaw = await generateJsonResponseWithConfig(mergePrompt, {
    maxOutputTokens: 6144,
    temperature: 0.25,
  });
  const mergedParsed = parseWithSchema(mergedLectureArtifactSchema, mergedRaw);

  if (!mergedParsed.ok) {
    const repairPrompt = `
Return a valid merged lecture decoder JSON object that matches the target schema.
Repair this malformed merge output:
${mergedRaw}
Error: ${mergedParsed.error}
`.trim();
    const repaired = await generateJsonResponseWithConfig(repairPrompt, {
      maxOutputTokens: 6144,
      temperature: 0.15,
    });
    const repairedParsed = parseWithSchema(mergedLectureArtifactSchema, repaired);
    if (!repairedParsed.ok) {
      await withPrismaRetry(
        () =>
          prisma.lectureDecodeJob.update({
            where: { id: jobId },
            data: {
              status: "partial",
              mergedMarkdown: null,
              finalArtifact: Prisma.JsonNull,
              errorMessage: repairedParsed.error,
            },
          }),
        "set-job-partial-merge-failed",
        logs,
      );
      return {
        jobId,
        status: "partial",
        subjectLabel,
        artifact: null,
        views: null,
        completedChunks: completedChunks.length,
        totalChunks: finalized.chunks.length,
        logs: [...logs, "Merge failed after repair."],
      };
    }

    const repairedArtifact = repairedParsed.data as MergedLectureArtifact;
    const views = buildLectureViews(repairedArtifact);
    await withPrismaRetry(
      () =>
        prisma.lectureDecodeJob.update({
          where: { id: jobId },
          data: {
            status: missingChunks.length > 0 ? "partial" : "completed",
            finalArtifact: repairedArtifact as unknown as Prisma.InputJsonValue,
            mergedMarkdown: views.learn,
          },
        }),
      "set-job-merged-repaired",
      logs,
    );
    return {
      jobId,
      status: missingChunks.length > 0 ? "partial" : "completed",
      subjectLabel,
      artifact: repairedArtifact,
      views,
      completedChunks: completedChunks.length,
      totalChunks: finalized.chunks.length,
      logs,
    };
  }

  const mergedArtifact = mergedParsed.data as MergedLectureArtifact;
  const views = buildLectureViews(mergedArtifact);
  await withPrismaRetry(
    () =>
      prisma.lectureDecodeJob.update({
        where: { id: jobId },
        data: {
          status: missingChunks.length > 0 ? "partial" : "completed",
          finalArtifact: mergedArtifact as unknown as Prisma.InputJsonValue,
          mergedMarkdown: views.learn,
        },
      }),
    "set-job-merged",
    logs,
  );

  return {
    jobId,
    status: missingChunks.length > 0 ? "partial" : "completed",
    subjectLabel,
    artifact: mergedArtifact,
    views,
    completedChunks: completedChunks.length,
    totalChunks: finalized.chunks.length,
    logs,
  };
}
