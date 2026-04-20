import { GoogleGenerativeAI } from "@google/generative-ai";

type Provider = "gemini" | "deepseek";

const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash";
const DEEPSEEK_DEFAULT_MODEL = "deepseek-chat";

const RETRYABLE_ERROR_MARKERS = [
  "503",
  "service unavailable",
  "high demand",
  "429",
  "rate limit",
  "timeout",
  "500",
  "502",
  "504",
];

export class GeminiQuotaError extends Error {
  retryAfterMs: number | null;
  isDailyExhausted: boolean;

  constructor(
    message: string,
    options?: { retryAfterMs?: number | null; isDailyExhausted?: boolean },
  ) {
    super(message);
    this.name = "GeminiQuotaError";
    this.retryAfterMs = options?.retryAfterMs ?? null;
    this.isDailyExhausted = options?.isDailyExhausted ?? false;
  }
}

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectProvider(override?: Provider): Provider {
  if (override) return override;
  const explicit = (process.env.LLM_PROVIDER || "").trim().toLowerCase();
  if (explicit === "gemini" || explicit === "deepseek") return explicit;

  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";

  throw new Error(
    "No AI provider configured. Set LLM_PROVIDER=deepseek (or gemini) and provide matching API key.",
  );
}

function extractRetryDelayMs(error: unknown): number | null {
  const message = error instanceof Error ? error.message : String(error);

  const retryInMatch = message.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
  if (retryInMatch) {
    return Math.max(500, Math.ceil(Number(retryInMatch[1]) * 1000));
  }

  const retryDelayMatch = message.match(/retryDelay"\s*:\s*"(\d+)s"/i);
  if (retryDelayMatch) {
    return Math.max(500, Number(retryDelayMatch[1]) * 1000);
  }

  const retryAfterHeader = message.match(/retry-after[:=]\s*(\d+)/i);
  if (retryAfterHeader) {
    return Math.max(500, Number(retryAfterHeader[1]) * 1000);
  }

  return null;
}

function isQuotaExceededError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("quota exceeded") ||
    message.includes("billing details") ||
    message.includes("rate-limits") ||
    message.includes("too many requests")
  );
}

function isHardZeroQuotaError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("limit: 0");
}

function isDailyQuotaError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("perday") ||
    message.includes("requestsperday") ||
    message.includes("free_tier_requests, limit: 20")
  );
}

function isRetryableError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return RETRYABLE_ERROR_MARKERS.some((marker) => message.includes(marker));
}

function getGeminiModelCandidates(): string[] {
  const fallbackEnv = process.env.GEMINI_FALLBACK_MODELS;
  if (!fallbackEnv) return [GEMINI_DEFAULT_MODEL];
  const parsed = fallbackEnv
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (parsed.length === 0) return [GEMINI_DEFAULT_MODEL];
  if (!parsed.includes(GEMINI_DEFAULT_MODEL)) parsed.unshift(GEMINI_DEFAULT_MODEL);
  return parsed;
}

async function generateWithGemini(params: {
  prompt: string;
  generationConfig: {
    temperature: number;
    topP: number;
    maxOutputTokens: number;
    responseMimeType?: "application/json";
  };
}): Promise<string> {
  if (!geminiClient) {
    throw new Error("GEMINI_API_KEY is not set while LLM provider is gemini.");
  }

  const models = getGeminiModelCandidates();
  let lastError: unknown = null;

  for (const modelName of models) {
    const model = geminiClient.getGenerativeModel({
      model: modelName,
      generationConfig: params.generationConfig,
    });

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        const result = await model.generateContent(params.prompt);
        return result.response.text();
      } catch (error) {
        lastError = error;

        if (isQuotaExceededError(error)) {
          const retryAfterMs = extractRetryDelayMs(error);
          const dailyExhausted = isHardZeroQuotaError(error) || isDailyQuotaError(error);
          if (dailyExhausted) {
            throw new GeminiQuotaError(
              "Gemini daily quota is exhausted for this API key/project. Wait for quota reset or use another provider key.",
              { retryAfterMs, isDailyExhausted: true },
            );
          }

          if (attempt >= 2) {
            throw new GeminiQuotaError(
              "Gemini rate limit hit. Retry shortly.",
              { retryAfterMs, isDailyExhausted: false },
            );
          }

          await sleep(Math.min(retryAfterMs ?? 1500, 5000));
          continue;
        }

        if (!isRetryableError(error)) throw error;
        if (attempt === 4) break;
        const backoffMs =
          extractRetryDelayMs(error) ??
          (600 * 2 ** (attempt - 1) + Math.floor(Math.random() * 350));
        await sleep(backoffMs);
      }
    }
  }

  throw lastError instanceof Error
    ? new Error(
        `Gemini request failed after retries and fallbacks: ${lastError.message}`,
      )
    : new Error("Gemini request failed after retries and fallbacks.");
}

async function generateWithDeepSeek(params: {
  prompt: string;
  config: {
    temperature: number;
    topP: number;
    maxOutputTokens: number;
    json: boolean;
  };
}): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error("DEEPSEEK_API_KEY is not set while LLM provider is deepseek.");
  }
  if (key.includes("replace_with_your_deepseek_api_key")) {
    throw new Error(
      "DEEPSEEK_API_KEY is still a placeholder. Put your real DeepSeek key in .env.local and restart the server.",
    );
  }

  const model = process.env.DEEPSEEK_MODEL || DEEPSEEK_DEFAULT_MODEL;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: params.prompt }],
          temperature: params.config.temperature,
          top_p: params.config.topP,
          max_tokens: params.config.maxOutputTokens,
          response_format: params.config.json ? { type: "json_object" } : undefined,
        }),
      });

      if (!res.ok) {
        const bodyText = await res.text();
        const message = `DeepSeek API ${res.status}: ${bodyText}`;
        throw new Error(message);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("DeepSeek returned an empty response body.");
      }
      return text;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        lastError = new Error("DeepSeek request timeout after 45s.");
      } else {
        lastError = error;
      }

      if (isQuotaExceededError(error)) {
        const retryAfterMs = extractRetryDelayMs(error);
        const dailyExhausted = isHardZeroQuotaError(error) || isDailyQuotaError(error);
        if (dailyExhausted) {
          throw new GeminiQuotaError(
            "DeepSeek quota appears exhausted. Wait for reset or top up balance.",
            { retryAfterMs, isDailyExhausted: true },
          );
        }
        if (attempt >= 2) {
          throw new GeminiQuotaError("DeepSeek rate limit hit. Retry shortly.", {
            retryAfterMs,
            isDailyExhausted: false,
          });
        }
        await sleep(Math.min(retryAfterMs ?? 1500, 5000));
        continue;
      }

      if (!isRetryableError(error) || attempt === 4) break;
      await sleep(600 * 2 ** (attempt - 1) + Math.floor(Math.random() * 350));
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? new Error(`DeepSeek request failed after retries: ${lastError.message}`)
    : new Error("DeepSeek request failed after retries.");
}

async function generateWithProvider(params: {
  prompt: string;
  generationConfig: {
    temperature: number;
    topP: number;
    maxOutputTokens: number;
    responseMimeType?: "application/json";
  };
  providerOverride?: Provider;
}): Promise<string> {
  const provider = detectProvider(params.providerOverride);
  if (provider === "deepseek") {
    return generateWithDeepSeek({
      prompt: params.prompt,
      config: {
        temperature: params.generationConfig.temperature,
        topP: params.generationConfig.topP,
        maxOutputTokens: params.generationConfig.maxOutputTokens,
        json: params.generationConfig.responseMimeType === "application/json",
      },
    });
  }
  return generateWithGemini(params);
}

export const geminiModel =
  geminiClient?.getGenerativeModel({
    model: GEMINI_DEFAULT_MODEL,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  }) ?? null;

export async function generateContent(prompt: string): Promise<string> {
  return generateWithProvider({
    prompt,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  });
}

export async function generateContentByProvider(
  prompt: string,
  provider: Provider,
): Promise<string> {
  return generateWithProvider({
    prompt,
    providerOverride: provider,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  });
}

export async function generateContentWithConfig(
  prompt: string,
  config?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
  },
): Promise<string> {
  return generateWithProvider({
    prompt,
    generationConfig: {
      temperature: config?.temperature ?? 0.6,
      topP: config?.topP ?? 0.9,
      maxOutputTokens: config?.maxOutputTokens ?? 8192,
    },
  });
}

export async function generateJsonResponse(prompt: string): Promise<string> {
  return generateWithProvider({
    prompt,
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });
}

export async function generateJsonResponseByProvider(
  prompt: string,
  provider: Provider,
): Promise<string> {
  return generateWithProvider({
    prompt,
    providerOverride: provider,
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });
}

export async function generateJsonResponseWithConfig(
  prompt: string,
  config?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
  },
): Promise<string> {
  return generateWithProvider({
    prompt,
    generationConfig: {
      temperature: config?.temperature ?? 0.3,
      topP: config?.topP ?? 0.9,
      maxOutputTokens: config?.maxOutputTokens ?? 4096,
      responseMimeType: "application/json",
    },
  });
}
