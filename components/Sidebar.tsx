"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  HelpCircle,
  Sparkles,
  Code2,
  Dumbbell,
  History,
  Trash2,
  ChevronRight,
  GraduationCap,
  Clock,
  X,
  Library,
  Bookmark,
  Loader2,
  Presentation,
  Layers,
  Network,
  BrainCircuit,
} from "lucide-react";

interface SidebarProps {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  onLoadHistory: (id: string) => void;
  refreshTrigger?: number;
}

interface HistoryItem {
  id: string;
  mode: string;
  title: string | null;
  difficulty: string | null;
  fileUsed: boolean;
  fileName: string | null;
  course?: string | null;
  year?: string | null;
  isSaved?: boolean;
  createdAt: string;
}

const modes = [
  {
    label: "Generate Notes",
    icon: FileText,
    id: "notes",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/40",
  },
  {
    label: "Generate Exam",
    icon: BookOpen,
    id: "exam",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/40",
  },
  {
    label: "Generate Quiz",
    icon: HelpCircle,
    id: "quiz",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/40",
  },
  {
    label: "Summarize",
    icon: Sparkles,
    id: "summary",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/40",
  },
  {
    label: "Explain Code",
    icon: Code2,
    id: "code",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/40",
  },
  {
    label: "Practice Problems",
    icon: Dumbbell,
    id: "practice",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/40",
  },
  {
    label: "Solve Exam/Assignment",
    icon: GraduationCap,
    id: "assignment",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/40",
  },
  {
    label: "Lecture Slides",
    icon: Presentation,
    id: "slides",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/40",
  },
  {
    label: "Generate Flashcards",
    icon: Layers,
    id: "flashcards",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-400/40",
  },
  {
    label: "Concept Map",
    icon: Network,
    id: "concept_map",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10 border-fuchsia-500/40",
  },
  {
    label: "Adaptive Tutor",
    icon: BrainCircuit,
    id: "adaptive_learning",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/40",
  },
];

const modeColors: Record<string, string> = {
  notes: "text-cyan-400",
  exam: "text-violet-400",
  quiz: "text-amber-400",
  summary: "text-emerald-400",
  code: "text-pink-400",
  practice: "text-orange-400",
  assignment: "text-rose-400",
  slides: "text-sky-400",
  flashcards: "text-indigo-400",
  concept_map: "text-fuchsia-400",
  adaptive_learning: "text-cyan-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Sidebar({
  selectedMode,
  onSelectMode,
  onLoadHistory,
  refreshTrigger,
}: SidebarProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(data.generations || []);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory, refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 bg-linear-to-br from-cyan-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Study Buddy
            </h1>
            <p className="text-[10px] text-slate-500">
              Study Lab • @ethiopandatech
            </p>
          </div>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setShowHistory(false)}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
            !showHistory
              ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Sparkles size={12} />
          Tools
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
            showHistory
              ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Library size={12} />
          Library
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {!showHistory ? (
          /* Tools List */
          <nav className="space-y-1">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = selectedMode === mode.label;
              return (
                <button
                  key={mode.id}
                  onClick={() => onSelectMode(mode.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? `${mode.bg} border ${mode.color}`
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isActive ? mode.color : "group-hover:text-slate-200"
                    }
                  />
                  <span className="text-sm font-medium flex-1 text-left">
                    {mode.label}
                  </span>
                  {isActive && (
                    <ChevronRight size={14} className={mode.color} />
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          /* History List */
          <div className="space-y-4">
            <button
              onClick={() => onSelectMode("Library Dashboard")}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Library size={16} />
              Open Full Library
            </button>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 px-2">
                <Library size={28} className="text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">
                  Your library is empty.
                  <br />
                  Generate and save something!
                </p>
              </div>
            ) : (
              <>
                {/* Saved Library Section */}
                {history.filter((h) => h.isSaved).length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-1">
                      <Bookmark size={10} />
                      Saved Notes & Exams
                    </h3>
                    <div className="space-y-1.5">
                      {history
                        .filter((h) => h.isSaved)
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => onLoadHistory(item.id)}
                            className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-cyan-500/30 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                                  {item.title || "Untitled Document"}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span
                                    className={`text-[10px] font-medium ${modeColors[item.mode] || "text-slate-400"}`}
                                  >
                                    {modes.find((m) => m.id === item.mode)
                                      ?.label || item.mode}
                                  </span>
                                  {item.course && (
                                    <>
                                      <span className="text-slate-600 text-[8px]">
                                        &bull;
                                      </span>
                                      <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                                        {item.course}
                                      </span>
                                    </>
                                  )}
                                  {item.year && (
                                    <>
                                      <span className="text-slate-600 text-[8px]">
                                        &bull;
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {item.year}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleDelete(item.id, e)}
                                disabled={deletingId === item.id}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                              >
                                {deletingId === item.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recent Unsaved Generations */}
                {history.filter((h) => !h.isSaved).length > 0 && (
                  <div
                    className={
                      history.filter((h) => h.isSaved).length > 0
                        ? "pt-2 border-t border-slate-800"
                        : ""
                    }
                  >
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-1">
                      <Clock size={10} />
                      Recent Generations
                    </h3>
                    <div className="space-y-1.5">
                      {history
                        .filter((h) => !h.isSaved)
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => onLoadHistory(item.id)}
                            className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/80 border border-transparent hover:border-slate-700/50 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-cyan-400 transition-colors">
                                  {item.title || "Untitled Document"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-[10px] font-medium ${modeColors[item.mode] || "text-slate-400"}`}
                                  >
                                    {modes.find((m) => m.id === item.mode)
                                      ?.label || item.mode}
                                  </span>
                                  <span className="text-slate-600 text-[8px]">
                                    &bull;
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {timeAgo(item.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleDelete(item.id, e)}
                                disabled={deletingId === item.id}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                              >
                                {deletingId === item.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800">
        <div className="text-[10px] text-slate-600 text-center">
          Study Buddy Study Lab ✨
        </div>
      </div>
    </aside>
  );
}
