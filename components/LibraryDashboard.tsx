"use client";

import React, { useEffect, useState } from "react";
import { 
  Library, BookOpen, Code2, GraduationCap, Layers, Search, 
  Trash2, Loader2, ArrowRight, Bookmark, Clock, Network, 
  Sparkles, Dumbbell, Presentation, FileText, HelpCircle, BrainCircuit
} from "lucide-react";

interface HistoryItem {
  id: string;
  mode: string;
  title: string | null;
  difficulty: string | null;
  course: string | null;
  year: string | null;
  isSaved: boolean;
  createdAt: string;
}

const modeIcons: Record<string, React.ElementType> = {
  notes: FileText,
  exam: BookOpen,
  quiz: HelpCircle,
  summary: Sparkles,
  code: Code2,
  practice: Dumbbell,
  assignment: GraduationCap,
  slides: Presentation,
  flashcards: Layers,
  concept_map: Network,
  adaptive_learning: BrainCircuit,
};

const modeColors: Record<string, string> = {
  notes: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  exam: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  quiz: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  summary: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  code: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  practice: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  assignment: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  slides: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  flashcards: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  concept_map: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
  adaptive_learning: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

const modeLabels: Record<string, string> = {
  notes: "Generate Notes",
  exam: "Generate Exam",
  quiz: "Generate Quiz",
  summary: "Summarize",
  code: "Code Explanation",
  practice: "Practice Problems",
  assignment: "Solve Exam/Assignment",
  slides: "Lecture Slides",
  flashcards: "Flashcards",
  concept_map: "Concept Map",
  adaptive_learning: "Adaptive Tutor",
};

// Categories
const CATEGORIES = [
  { id: "all", label: "All Items", icon: Library },
  { id: "docs", label: "Docs & Notes", icon: FileText, modes: ["notes", "summary"] },
  { id: "code", label: "Code Structures", icon: Code2, modes: ["code"] },
  { id: "uni", label: "University & Exams", icon: GraduationCap, modes: ["exam", "assignment", "practice"] },
  { id: "interactive", label: "Interactive Study", icon: BrainCircuit, modes: ["quiz", "flashcards", "concept_map", "adaptive_learning", "slides"] },
];

export default function LibraryDashboard({ 
  onLoadItem,
  refreshTrigger 
}: { 
  onLoadItem: (id: string) => void;
  refreshTrigger: number;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/history");
      const data = await res.json();
      setItems(data.generations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter(item => {
    // Search match
    const searchMatch = (item.title || "Untitled Document").toLowerCase().includes(search.toLowerCase()) ||
                        (item.course || "").toLowerCase().includes(search.toLowerCase());
    
    // Category match
    if (activeCategory === "all") return searchMatch;
    
    const category = CATEGORIES.find(c => c.id === activeCategory);
    const categoryMatch = category?.modes?.includes(item.mode);

    return searchMatch && categoryMatch;
  });

  const savedItems = filteredItems.filter(i => i.isSaved);
  const unsavedItems = filteredItems.filter(i => !i.isSaved);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 bg-slate-950">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
              <Library className="text-cyan-400" size={32} />
              My Studio Library
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              All your generated documentations, university courses, code architectures, and study materials organized in one place.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, course..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="max-w-6xl mx-auto">
          
          {/* Categories Segment Control */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {CATEGORIES.map(category => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    isActive 
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon size={16} />
                  {category.label}
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-1">No items found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* SAVED SECTION */}
              {savedItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Bookmark className="text-emerald-400" size={18} />
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Saved Materials</h2>
                    <div className="h-px bg-slate-800 flex-1 ml-4" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {savedItems.map(item => <LibraryCard key={item.id} item={item} onLoadItem={onLoadItem} onDelete={handleDelete} deletingId={deletingId} />)}
                  </div>
                </section>
              )}

              {/* RECENT UNSAVED SECTION */}
              {unsavedItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-slate-400" size={18} />
                    <h2 className="text-lg font-bold text-slate-300 uppercase tracking-wider">Recent Generations</h2>
                    <div className="h-px bg-slate-800 flex-1 ml-4" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {unsavedItems.map(item => <LibraryCard key={item.id} item={item} onLoadItem={onLoadItem} onDelete={handleDelete} deletingId={deletingId} />)}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LibraryCard({ 
  item, 
  onLoadItem, 
  onDelete, 
  deletingId 
}: { 
  item: HistoryItem; 
  onLoadItem: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  deletingId: string | null;
}) {
  const Icon = modeIcons[item.mode] || FileText;
  const colorClass = modeColors[item.mode] || "text-slate-400 bg-slate-800 border-slate-700";
  
  return (
    <div 
      onClick={() => onLoadItem(item.id)}
      className="group relative bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(6,182,212,0.1)] hover:-translate-y-1 flex flex-col h-full overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
          <Icon size={20} />
        </div>
        <button
          onClick={(e) => onDelete(item.id, e)}
          disabled={deletingId === item.id}
          className="opacity-0 group-hover:opacity-100 p-2 bg-slate-950/50 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
        >
          {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
      
      <div className="flex-1 relative z-10">
        <h3 className="text-base font-bold text-slate-200 line-clamp-2 mb-2 group-hover:text-cyan-400 transition-colors">
          {item.title || "Untitled Document"}
        </h3>
        {item.course && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 mb-3">
            <GraduationCap size={12} className="text-cyan-500" />
            {item.course} {item.year && `• ${item.year}`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/60 relative z-10">
        <span className="text-[11px] font-semibold text-slate-500">
          {modeLabels[item.mode] || item.mode}
        </span>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          Open <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}
