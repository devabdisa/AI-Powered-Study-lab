-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "title" TEXT,
    "inputText" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "difficulty" TEXT DEFAULT 'medium',
    "fileUsed" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);
