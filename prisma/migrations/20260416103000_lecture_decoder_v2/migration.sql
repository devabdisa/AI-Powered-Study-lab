-- CreateTable
CREATE TABLE "LectureDecodeJob" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureDecodeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureChunkResult" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureChunkResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LectureChunkResult_jobId_chunkIndex_key" ON "LectureChunkResult"("jobId", "chunkIndex");

-- CreateIndex
CREATE INDEX "LectureChunkResult_jobId_status_idx" ON "LectureChunkResult"("jobId", "status");

-- AddForeignKey
ALTER TABLE "LectureChunkResult" ADD CONSTRAINT "LectureChunkResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LectureDecodeJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
