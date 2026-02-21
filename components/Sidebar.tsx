'use client';

import { FileText, BookOpen, HelpCircle, Sparkles, Code2, Dumbbell } from 'lucide-react';

interface SidebarProps {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
}

const modes = [
  { label: 'Generate Notes', icon: FileText, id: 'notes' },
  { label: 'Generate Exam', icon: BookOpen, id: 'exam' },
  { label: 'Generate Quiz', icon: HelpCircle, id: 'quiz' },
  { label: 'Summarize', icon: Sparkles, id: 'summarize' },
  { label: 'Explain Code', icon: Code2, id: 'code' },
  { label: 'Practice Problems', icon: Dumbbell, id: 'practice' },
];

export default function Sidebar({ selectedMode, onSelectMode }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-cyan-900/30 flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold text-white">Study Lab</h1>
        </div>
        <p className="text-xs text-slate-400">Powered by AI</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = selectedMode === mode.label;

          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{mode.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-800">
        <div className="text-xs text-slate-500 leading-relaxed">
          <p className="mb-3">✨ Enhance your learning with AI-powered tools</p>
          <div className="w-full h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 mb-3"></div>
          <p className="text-slate-600">v1.0 • Study Lab</p>
        </div>
      </div>
    </aside>
  );
}
