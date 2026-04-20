import { prisma } from "@/lib/db";

let ensured = false;

export async function ensureLectureDecoderStorage(): Promise<void> {
  if (ensured) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LectureDecodeJob" (
      "id" TEXT NOT NULL,
      "title" TEXT,
      "sourceType" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'queued',
      "normalizedText" TEXT NOT NULL,
      "sourceDigest" TEXT,
      "subjectLabel" TEXT,
      "metadata" JSONB,
      "finalArtifact" JSONB,
      "mergedMarkdown" TEXT,
      "errorMessage" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LectureDecodeJob_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LectureChunkResult" (
      "id" TEXT NOT NULL,
      "jobId" TEXT NOT NULL,
      "chunkIndex" INTEGER NOT NULL,
      "sectionTitle" TEXT,
      "sourceType" TEXT NOT NULL,
      "pageStart" INTEGER,
      "pageEnd" INTEGER,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "rawModelOutput" TEXT,
      "decoded" JSONB,
      "errorMessage" TEXT,
      "isComplete" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LectureChunkResult_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'LectureChunkResult_jobId_fkey'
      ) THEN
        ALTER TABLE "LectureChunkResult"
        ADD CONSTRAINT "LectureChunkResult_jobId_fkey"
        FOREIGN KEY ("jobId") REFERENCES "LectureDecodeJob"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "LectureChunkResult_jobId_chunkIndex_key"
    ON "LectureChunkResult"("jobId", "chunkIndex");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "LectureChunkResult_jobId_status_idx"
    ON "LectureChunkResult"("jobId", "status");
  `);

  ensured = true;
}

