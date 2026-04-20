import { z } from "zod";

export const sourceTypeSchema = z.enum([
  "pdf",
  "docx",
  "pptx",
  "txt",
  "md",
  "transcript",
  "notes",
]);

export const subjectLabelSchema = z.enum(["technical", "general", "mixed"]);

export const examPrioritySchema = z.enum(["high", "medium", "low"]);

export const chunkMetadataSchema = z.object({
  chunkIndex: z.number().int().nonnegative(),
  sectionTitle: z.string().min(1),
  pageStart: z.number().int().positive().nullable(),
  pageEnd: z.number().int().positive().nullable(),
  sourceType: sourceTypeSchema,
  approxTokens: z.number().int().positive(),
});

export const conceptSchema = z.object({
  name: z.string().min(1),
  explanation: z.string().min(1),
  whyItMatters: z.string().min(1),
  examPriority: examPrioritySchema,
});

export const definitionSchema = z.object({
  term: z.string().min(1),
  meaning: z.string().min(1),
});

export const formulaSchema = z.object({
  expression: z.string().min(1),
  explanation: z.string().min(1),
  intuition: z.string().min(1),
});

export const exampleSchema = z.object({
  title: z.string().min(1),
  walkthrough: z.string().min(1),
});

export const recallQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const uncertaintyFlagSchema = z.object({
  issue: z.string().min(1),
  chunkIndex: z.number().int().nonnegative(),
  actionNeeded: z.string().min(1),
});

export const technicalDetailsSchema = z.object({
  formulaExplanations: z.array(z.string()).default([]),
  derivationIntuition: z.array(z.string()).default([]),
  codeSnippetExplanations: z.array(z.string()).default([]),
  workedExamples: z.array(z.string()).default([]),
  algorithmSteps: z.array(z.string()).default([]),
  commonMistakesAndEdgeCases: z.array(z.string()).default([]),
});

export const generalDetailsSchema = z.object({
  keyThemes: z.array(z.string()).default([]),
  comparisons: z.array(z.string()).default([]),
  chronology: z.array(z.string()).default([]),
  causeEffect: z.array(z.string()).default([]),
  argumentStructure: z.array(z.string()).default([]),
  likelyEssayAngles: z.array(z.string()).default([]),
});

export const chunkDecodeSchema = z.object({
  sectionTitle: z.string().min(1),
  overview: z.string().min(1),
  concepts: z.array(conceptSchema).default([]),
  definitions: z.array(definitionSchema).default([]),
  formulas: z.array(formulaSchema).default([]),
  examples: z.array(exampleSchema).default([]),
  confusionPoints: z.array(z.string()).default([]),
  examHotspots: z.array(z.string()).default([]),
  recallQuestions: z.array(recallQuestionSchema).default([]),
  uncertaintyFlags: z.array(uncertaintyFlagSchema).default([]),
  technicalDetails: technicalDetailsSchema.optional(),
  generalDetails: generalDetailsSchema.optional(),
  completion: z.object({
    isComplete: z.boolean(),
    stoppedBecause: z.string().nullable(),
    missingTailHint: z.string().nullable(),
  }),
});

export const mergedLectureArtifactSchema = z.object({
  lectureOverview: z.string().min(1),
  coreConcepts: z.array(conceptSchema).default([]),
  keyDefinitions: z.array(definitionSchema).default([]),
  formulasRules: z.array(formulaSchema).default([]),
  whyConceptsMatter: z.array(z.string()).default([]),
  examples: z.array(exampleSchema).default([]),
  commonConfusionPoints: z.array(z.string()).default([]),
  highYieldExamTopics: z.array(z.string()).default([]),
  quickRevisionSheet: z.array(z.string()).default([]),
  selfTestQuestions: z.array(recallQuestionSchema).default([]),
  uncertaintyFlags: z.array(
    z.object({
      issue: z.string().min(1),
      sourceHint: z.string().min(1),
      recommendedAction: z.string().min(1),
    }),
  ),
  subjectLabel: subjectLabelSchema,
  technicalDetails: technicalDetailsSchema.optional(),
  generalDetails: generalDetailsSchema.optional(),
  completion: z.object({
    completedChunkCount: z.number().int().nonnegative(),
    totalChunkCount: z.number().int().positive(),
    missingChunks: z.array(z.number().int().nonnegative()).default([]),
    hadContinuation: z.boolean(),
  }),
});

export type SourceType = z.infer<typeof sourceTypeSchema>;
export type SubjectLabel = z.infer<typeof subjectLabelSchema>;
export type ChunkMetadata = z.infer<typeof chunkMetadataSchema>;
export type ChunkDecode = z.infer<typeof chunkDecodeSchema>;
export type MergedLectureArtifact = z.infer<typeof mergedLectureArtifactSchema>;

export interface NormalizedDocument {
  title: string;
  sourceType: SourceType;
  rawText: string;
  normalizedText: string;
  blocks: DocumentBlock[];
}

export interface DocumentBlock {
  type: "heading" | "paragraph" | "list_item" | "code" | "formula";
  text: string;
  headingLevel?: number;
  page?: number | null;
}

export interface SourceInput {
  textInput?: string;
  file?: File | null;
}

export interface DecoderChunk {
  id: string;
  metadata: ChunkMetadata;
  text: string;
}

export interface LectureDecoderViews {
  learn: string;
  revise: string;
  test: string;
  deepDive: string;
}

export interface LectureDecoderResult {
  jobId: string;
  status: "completed" | "partial" | "failed";
  subjectLabel: SubjectLabel;
  artifact: MergedLectureArtifact | null;
  views: LectureDecoderViews | null;
  completedChunks: number;
  totalChunks: number;
  logs: string[];
}

