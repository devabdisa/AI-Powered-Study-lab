import { DecoderChunk, SubjectLabel } from "@/lib/lecture-decoder/schemas";

const sharedSystemPrompt = `
You are Lecture Decoder v2, a strict academic decoding engine for messy university materials.
Rules:
1. Use only source evidence from the chunk(s).
2. Do not hallucinate missing facts. Mark uncertainty explicitly.
3. Output valid JSON only.
4. Keep wording concise and exam-oriented.
5. Prefer actionable explanations over generic summaries.
`.trim();

function subjectVariantPrompt(subject: SubjectLabel): string {
  if (subject === "technical") {
    return `
Technical focus:
- Explain formulas, derivation intuition, and algorithm steps.
- Include edge cases and common implementation mistakes.
- When code appears, explain logic and pitfalls.
`.trim();
  }
  if (subject === "general") {
    return `
General focus:
- Identify key themes, chronology, cause/effect, and argument structure.
- Surface likely essay angles and comparison points.
`.trim();
  }
  return `
Mixed focus:
- Capture both technical mechanics and thematic/argumentative structure.
`.trim();
}

export function buildChunkDecodePrompt(
  chunk: DecoderChunk,
  subject: SubjectLabel,
): string {
  return `
${sharedSystemPrompt}
${subjectVariantPrompt(subject)}

Decode this chunk into the required schema.

Chunk metadata:
${JSON.stringify(chunk.metadata, null, 2)}

Chunk text:
"""
${chunk.text}
"""

Return JSON object with keys:
sectionTitle, overview, concepts, definitions, formulas, examples, confusionPoints, examHotspots, recallQuestions, uncertaintyFlags, technicalDetails?, generalDetails?, completion

completion rules:
- "isComplete" = true if you fully decoded this chunk.
- If incomplete, set "stoppedBecause" and "missingTailHint".
`.trim();
}

export function buildContinuationPrompt(params: {
  subject: SubjectLabel;
  chunk: DecoderChunk;
  partialResponse: string;
  validationError: string;
}): string {
  return `
${sharedSystemPrompt}
${subjectVariantPrompt(params.subject)}

Previous response was truncated or malformed.
You must continue and repair it into ONE complete valid JSON object.
Do not repeat fully completed entries.

Validation error:
${params.validationError}

Chunk metadata:
${JSON.stringify(params.chunk.metadata, null, 2)}

Chunk text:
"""
${params.chunk.text}
"""

Partial model response:
"""
${params.partialResponse}
"""

Output only the repaired final JSON object.
`.trim();
}

export function buildMergePrompt(input: {
  subject: SubjectLabel;
  completedChunks: Array<{ chunkIndex: number; decoded: unknown }>;
  totalChunks: number;
  missingChunks: number[];
  hadContinuation: boolean;
}): string {
  return `
${sharedSystemPrompt}
${subjectVariantPrompt(input.subject)}

Merge the chunk-level decoded outputs into one unified lecture artifact.
Prioritize consistency, deduplicate overlaps, preserve exam relevance.

Context:
- Total chunks: ${input.totalChunks}
- Completed chunks: ${input.completedChunks.length}
- Missing chunk indexes: [${input.missingChunks.join(", ")}]
- Continuation used: ${input.hadContinuation}

Chunk outputs:
${JSON.stringify(input.completedChunks, null, 2)}

Return JSON object with keys:
lectureOverview, coreConcepts, keyDefinitions, formulasRules, whyConceptsMatter, examples, commonConfusionPoints, highYieldExamTopics, quickRevisionSheet, selfTestQuestions, uncertaintyFlags, subjectLabel, technicalDetails?, generalDetails?, completion
`.trim();
}

