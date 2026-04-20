"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload, Loader2, AlertCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface DecoderViews {
  learn: string;
  revise: string;
  test: string;
  deepDive: string;
}

interface DecoderPayload {
  jobId: string;
  status: "completed" | "partial" | "failed";
  subjectLabel: "technical" | "general" | "mixed";
  artifact: unknown;
  views: DecoderViews | null;
}

interface DecoderApiResult {
  success: boolean;
  result: DecoderPayload & {
    completedChunks: number;
    totalChunks: number;
    logs: string[];
  };
  error?: string;
  code?: string;
  retryAfterSeconds?: number | null;
  isDailyExhausted?: boolean;
}

const tabs = ["Learn", "Revise", "Test", "Deep Dive"] as const;
type TabName = (typeof tabs)[number];

const tabToView: Record<TabName, keyof DecoderViews> = {
  Learn: "learn",
  Revise: "revise",
  Test: "test",
  "Deep Dive": "deepDive",
};

export default function LectureDecoderStudio({
  initialPayload,
  onSaveSuccess,
}: {
  initialPayload?: DecoderPayload | null;
  onSaveSuccess?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabName>("Learn");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<DecoderPayload | null>(
    initialPayload ?? null,
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(
    null,
  );

  useEffect(() => {
    setPayload(initialPayload ?? null);
  }, [initialPayload]);

  const currentView = useMemo(() => {
    if (!payload?.views) return "";
    return payload.views[tabToView[activeTab]];
  }, [activeTab, payload]);

  const runDecode = async (resumeJobId?: string) => {
    if (!textInput.trim() && !file) {
      setError("Paste lecture text/transcript or upload a file first.");
      return;
    }
    setError(null);
    setIsDecoding(true);
    setLogs([]);
    let timeout: ReturnType<typeof setTimeout> | null = null;

    try {
      const formData = new FormData();
      formData.append("textInput", textInput.trim());
      if (file) formData.append("file", file);
      if (resumeJobId) formData.append("jobId", resumeJobId);

      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 90000);
      const res = await fetch("/api/lecture-decoder", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = (await res.json()) as DecoderApiResult;
      if (!res.ok || !data.success) {
        if (data.code === "GEMINI_QUOTA_EXCEEDED") {
          if (data.isDailyExhausted) {
            throw new Error(
              "Gemini daily quota is exhausted for this API key. Switch to a paid/active key or wait for daily reset.",
            );
          }
          if (typeof data.retryAfterSeconds === "number") {
            throw new Error(
              `Gemini rate limit hit. Retry in about ${data.retryAfterSeconds}s.`,
            );
          }
        }
        throw new Error(data.error || "Lecture decoding failed.");
      }
      setPayload({
        jobId: data.result.jobId,
        status: data.result.status,
        subjectLabel: data.result.subjectLabel,
        artifact: data.result.artifact,
        views: data.result.views ?? null,
      });
      setProgress({
        completed: data.result.completedChunks,
        total: data.result.totalChunks,
      });
      setLogs(data.result.logs || []);
      onSaveSuccess?.();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          "Decoder request timed out after 90s. Try again with smaller input, or run Resume/Retry to continue chunk-by-chunk.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Unexpected decoder error.");
      }
    } finally {
      if (timeout) clearTimeout(timeout);
      setIsDecoding(false);
    }
  };

  const handleDecode = async () => runDecode();
  const handleResume = async () => {
    if (!payload?.jobId) return;
    await runDecode(payload.jobId);
  };

  return (
    <main className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-bold text-white">Lecture Decoder v2</h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload material, decode once, then study through Learn, Revise, Test, and Deep Dive views.
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[380px_1fr]">
        <section className="border-r border-slate-800 p-5">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Upload Material
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-300 hover:border-cyan-500/50">
                <Upload size={16} className="text-cyan-400" />
                <span className="truncate">
                  {file?.name ?? "PDF, DOCX, PPTX, TXT, MD"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.pptx,.txt,.md"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pasted Notes / Transcript
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste transcript, rough notes, or lecturer text..."
                className="h-52 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleDecode}
              disabled={isDecoding}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {isDecoding ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Decoding Lecture
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Decode Lecture
                </>
              )}
            </button>

            {payload?.jobId && (
              <button
                onClick={handleResume}
                disabled={isDecoding}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300"
              >
                <RefreshCcw size={14} />
                Resume / Retry Incomplete Chunks
              </button>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              </div>
            )}

            {payload && (
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-400">
                <p>
                  Subject profile: <span className="text-cyan-300">{payload.subjectLabel}</span>
                </p>
                <p>
                  Job status: <span className="text-cyan-300">{payload.status}</span>
                </p>
                {progress && (
                  <p>
                    Chunk progress:{" "}
                    <span className="text-cyan-300">
                      {progress.completed}/{progress.total}
                    </span>
                  </p>
                )}
              </div>
            )}

            {logs.length > 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Decoder Log
                </p>
                <div className="max-h-36 overflow-y-auto text-xs text-slate-400">
                  {logs.map((log, index) => (
                    <p key={`${log}-${index}`}>- {log}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col">
          <div className="border-b border-slate-800 px-5 pt-4">
            <div className="flex flex-wrap gap-2 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {payload && payload.views ? (
              <MarkdownRenderer content={currentView} className="text-sm" />
            ) : (
              <div className="flex h-full items-center justify-center text-center text-slate-500">
                {payload && !payload.views
                  ? "This decoder job is partial/failed and has no final views yet. Use Resume/Retry to continue."
                  : "Decode a lecture to unlock Learn, Revise, Test, and Deep Dive."}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
