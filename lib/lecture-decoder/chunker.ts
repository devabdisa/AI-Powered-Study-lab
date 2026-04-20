import {
  DecoderChunk,
  DocumentBlock,
  NormalizedDocument,
} from "@/lib/lecture-decoder/schemas";
import { estimateTokens } from "@/lib/lecture-decoder/utils";

interface ChunkOptions {
  targetTokens?: number;
  maxTokens?: number;
}

function blockToText(block: DocumentBlock): string {
  if (block.type === "heading") return `## ${block.text}`;
  if (block.type === "list_item") return `- ${block.text}`;
  return block.text;
}

function inferSectionTitle(blocks: DocumentBlock[], fallbackIndex: number): string {
  const heading = blocks.find((block) => block.type === "heading");
  if (heading) return heading.text;
  return `Section ${fallbackIndex + 1}`;
}

function inferPageRange(blocks: DocumentBlock[]): {
  start: number | null;
  end: number | null;
} {
  const pages = blocks
    .map((block) => block.page ?? null)
    .filter((page): page is number => page !== null);
  if (pages.length === 0) return { start: null, end: null };
  return { start: Math.min(...pages), end: Math.max(...pages) };
}

export function chunkDocument(
  document: NormalizedDocument,
  options: ChunkOptions = {},
): DecoderChunk[] {
  const targetTokens = options.targetTokens ?? 1200;
  const maxTokens = options.maxTokens ?? 1600;

  const chunks: DecoderChunk[] = [];
  let currentBlocks: DocumentBlock[] = [];
  let currentTokens = 0;

  const flush = () => {
    if (currentBlocks.length === 0) return;

    const metadataIndex = chunks.length;
    const sectionTitle = inferSectionTitle(currentBlocks, metadataIndex);
    const pageRange = inferPageRange(currentBlocks);
    const text = currentBlocks.map(blockToText).join("\n");

    chunks.push({
      id: `${document.title}-${metadataIndex}`,
      metadata: {
        chunkIndex: metadataIndex,
        sectionTitle,
        pageStart: pageRange.start,
        pageEnd: pageRange.end,
        sourceType: document.sourceType,
        approxTokens: estimateTokens(text),
      },
      text,
    });

    currentBlocks = [];
    currentTokens = 0;
  };

  for (const block of document.blocks) {
    const blockTokens = estimateTokens(blockToText(block));
    const isStrongBoundary = block.type === "heading";
    const wouldOverflowHard = currentTokens + blockTokens > maxTokens;
    const shouldSoftSplit =
      isStrongBoundary && currentTokens >= targetTokens * 0.6;

    if (currentBlocks.length > 0 && (wouldOverflowHard || shouldSoftSplit)) {
      flush();
    }

    currentBlocks.push(block);
    currentTokens += blockTokens;
  }

  flush();
  return chunks;
}

