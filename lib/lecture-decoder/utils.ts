import { ZodSchema } from "zod";

export function estimateTokens(input: string): number {
  return Math.max(1, Math.ceil(input.length / 4));
}

export function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function extractLikelyJson(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return trimmed.slice(first, last + 1);
  }
  return trimmed;
}

export function parseWithSchema<T>(
  schema: ZodSchema<T>,
  raw: string,
): { ok: true; data: T } | { ok: false; error: string } {
  const candidate = extractLikelyJson(raw);
  const parsed = safeJsonParse<unknown>(candidate);
  if (!parsed) {
    return { ok: false, error: "Model response was not valid JSON." };
  }
  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    return { ok: false, error: validated.error.message };
  }
  return { ok: true, data: validated.data };
}

export function hashString(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `fnv1a_${(hash >>> 0).toString(16)}`;
}

export function truncate(input: string, max = 500): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max)}...`;
}

