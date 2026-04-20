import { NormalizedDocument, SourceType } from "@/lib/lecture-decoder/schemas";

interface IngestionInput {
  file: File | null;
  textInput: string;
}

interface ExtractedSource {
  sourceType: SourceType;
  fileName: string;
  text: string;
}

async function extractFromFile(file: File): Promise<ExtractedSource> {
  const fileName = file.name;
  const fileExt = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (fileExt === ".pdf") {
    const pdfParse = require("pdf-parse") as (b: Buffer) => Promise<{
      text: string;
    }>;
    const pdfData = await pdfParse(buffer);
    const withPages = pdfData.text
      .split("\f")
      .map((chunk, index) => `[PAGE ${index + 1}]\n${chunk}`)
      .join("\n");
    return { sourceType: "pdf", fileName, text: withPages };
  }

  if (fileExt === ".docx") {
    const mammoth = require("mammoth") as {
      extractRawText(input: { buffer: Buffer }): Promise<{ value: string }>;
    };
    const mResult = await mammoth.extractRawText({ buffer });
    return { sourceType: "docx", fileName, text: mResult.value };
  }

  if (fileExt === ".pptx") {
    try {
      // Avoid static bundling of officeparser, which can break in Next.js webpack builds.
      const dynamicRequire = eval("require") as NodeJS.Require;
      const officeparserModuleName = ["office", "parser"].join("");
      const officeparser = dynamicRequire(officeparserModuleName) as {
        parseOffice(
          input: Buffer,
          callback: (data: string, err: Error | null) => void,
        ): void;
      };
      const text = await new Promise<string>((resolve, reject) => {
        officeparser.parseOffice(buffer, (data: string, err: Error | null) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
      return { sourceType: "pptx", fileName, text };
    } catch (error) {
      throw new Error(
        `PPTX parsing failed in this server build. Please paste key slide text for now. ${
          error instanceof Error ? error.message : ""
        }`.trim(),
      );
    }
  }

  if (fileExt === ".txt") {
    return { sourceType: "txt", fileName, text: buffer.toString("utf-8") };
  }

  if (fileExt === ".md") {
    return { sourceType: "md", fileName, text: buffer.toString("utf-8") };
  }

  throw new Error(
    `Unsupported file type: ${fileExt}. Supported: PDF, DOCX, PPTX, TXT, MD.`,
  );
}

function detectTranscriptStyle(text: string): boolean {
  const markers = [
    /\b\d{1,2}:\d{2}\b/g,
    /\bSpeaker\s*\d*\b/gi,
    /\b(um|uh|you know)\b/gi,
  ];
  let hits = 0;
  for (const marker of markers) {
    if (marker.test(text)) hits += 1;
  }
  return hits >= 2;
}

export function normalizeDocument(input: {
  title: string;
  sourceType: SourceType;
  rawText: string;
}): NormalizedDocument {
  const normalized = input.rawText
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ \u00A0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = normalized.split("\n");
  const blocks: NormalizedDocument["blocks"] = [];

  let currentPage: number | null = null;
  let codeFence = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const pageMatch = trimmed.match(/^\[PAGE\s+(\d+)\]$/);
    if (pageMatch) {
      currentPage = Number(pageMatch[1]);
      continue;
    }

    if (trimmed.startsWith("```")) {
      codeFence = !codeFence;
      blocks.push({ type: "code", text: line, page: currentPage });
      continue;
    }

    if (codeFence) {
      blocks.push({ type: "code", text: line, page: currentPage });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        headingLevel: headingMatch[1].length,
        text: headingMatch[2],
        page: currentPage,
      });
      continue;
    }

    if (
      /^[A-Z0-9][A-Z0-9 \-:]{4,}$/.test(trimmed) &&
      trimmed.length <= 90 &&
      !/[.;,]/.test(trimmed)
    ) {
      blocks.push({
        type: "heading",
        headingLevel: 2,
        text: trimmed,
        page: currentPage,
      });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      blocks.push({
        type: "list_item",
        text: trimmed.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""),
        page: currentPage,
      });
      continue;
    }

    if (/[=+\-*/^]/.test(trimmed) && /[A-Za-z]/.test(trimmed) && /\d/.test(trimmed)) {
      blocks.push({ type: "formula", text: trimmed, page: currentPage });
      continue;
    }

    blocks.push({ type: "paragraph", text: trimmed, page: currentPage });
  }

  return {
    title: input.title,
    sourceType: input.sourceType,
    rawText: input.rawText,
    normalizedText: normalized,
    blocks,
  };
}

export async function ingestLectureSource({
  file,
  textInput,
}: IngestionInput): Promise<NormalizedDocument> {
  if (!file && !textInput.trim()) {
    throw new Error("Provide text input or upload a supported file.");
  }

  if (file) {
    const extracted = await extractFromFile(file);
    const mergedText = textInput.trim()
      ? `${extracted.text}\n\n[USER CONTEXT]\n${textInput.trim()}`
      : extracted.text;
    return normalizeDocument({
      title: extracted.fileName,
      sourceType: extracted.sourceType,
      rawText: mergedText,
    });
  }

  const inferredType = detectTranscriptStyle(textInput) ? "transcript" : "notes";
  return normalizeDocument({
    title: inferredType === "transcript" ? "Pasted Transcript" : "Pasted Notes",
    sourceType: inferredType,
    rawText: textInput,
  });
}
