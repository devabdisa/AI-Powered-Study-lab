"use client";

import React, { useState, useEffect } from "react";
import { useAdaptiveLearning } from "@/lib/useAdaptiveLearning";
import { marked } from "marked";
import { Loader2, Send, BrainCircuit, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

interface AdaptiveLearningAreaProps {
  diagnosticContent: string;
  contextText: string;
}

export default function AdaptiveLearningArea({ 
  diagnosticContent, 
  contextText 
}: AdaptiveLearningAreaProps) {
  const engine = useAdaptiveLearning();
  const [studentAnswer, setStudentAnswer] = useState("");

  // Initialize engine when component mounts with the generated questions
  useEffect(() => {
    if (diagnosticContent && engine.state === "IDLE") {
      engine.actions.finishDiagnosticGeneration(diagnosticContent);
    }
  }, [diagnosticContent, engine]);

  const handleSubmitQuiz = async () => {
    // Structure the answers
    const payload = [{ question: "All Diagnostic Questions", answer: studentAnswer }];
    engine.actions.startEvaluation(payload);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contextText, userAnswers: payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      engine.actions.finishEvaluation(data.evaluation);
    } catch (err) {
      console.error(err);
      // Fallback in case the evaluation fails
      engine.actions.finishEvaluation({
        score: 0,
        weak_topics: ["Error parsing evaluation. Please review manually."],
        explanations: []
      });
    }
  };

  const handleStartReinforcement = async () => {
    engine.actions.startGeneratingReinforcement();
    try {
      const res = await fetch("/api/reinforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weakTopics: engine.evaluation?.weak_topics })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      engine.actions.finishReinforcementGeneration(data.output);
    } catch (err) {
      console.error(err);
      engine.actions.finishReinforcementGeneration("An error occurred generating your practice. Please click finish.");
    }
  };

  if (engine.state === "IDLE" || engine.state === "GENERATING_DIAGNOSTIC") {
    return (
      <div className="flex flex-col items-center justify-center p-24 h-full bg-slate-900/50 rounded-xl border border-cyan-500/20">
        <Loader2 className="animate-spin text-cyan-500 w-12 h-12 mb-4" />
        <h2 className="text-xl text-cyan-400 font-medium animate-pulse">Building your custom diagnostic...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl overflow-hidden border border-cyan-500/20">
      {/* HEADER PROGRESS */}
      <div className="bg-slate-950 border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-cyan-400 w-6 h-6" />
          <h3 className="text-white font-semibold">Adaptive Tutor</h3>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-mono uppercase tracking-widest text-cyan-500/70 border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 rounded-full">
             {engine.state.replace(/_/g, " ")}
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        
        {engine.state === "QUIZ_ACTIVE" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div 
              className="prose prose-invert prose-p:leading-relaxed prose-headings:text-cyan-400 bg-slate-950/80 p-8 rounded-2xl border border-slate-800 shadow-xl" 
              dangerouslySetInnerHTML={{ __html: marked.parse(engine.diagnosticContent) as string }} 
            />
            
            <div className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-cyan-500/20">
              <p className="text-cyan-400 font-medium flex items-center gap-2">
                <BrainCircuit size={18} /> Type your answers below (e.g. 1A, 2B... or write them out):
              </p>
              <textarea 
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                className="w-full h-48 bg-slate-950/50 border border-cyan-500/30 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none transition-all placeholder:text-slate-600"
                placeholder="1. A&#10;2. I think it's because of pointer allocation...&#10;3. C"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleSubmitQuiz}
                  disabled={!studentAnswer.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  Submit for Evaluation <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {engine.state === "EVALUATING" && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 animate-spin text-cyan-400 relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl text-white font-bold">The Tutor is Grading...</h2>
              <p className="text-slate-400">Analyzing your conceptual gaps and forming a learning path.</p>
            </div>
          </div>
        )}

        {engine.state === "SHOWING_RESULTS" && engine.evaluation && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-950/80 p-8 rounded-3xl border border-rose-500/20 shadow-2xl flex flex-col items-center justify-center text-center">
              <span className="text-rose-400 font-bold tracking-widest uppercase mb-4 text-sm">Diagnostic Score</span>
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                  <circle 
                    cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" 
                    className="text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-1000 ease-out" 
                    strokeDasharray={440} 
                    strokeDashoffset={440 - (440 * (engine.evaluation.score / 8))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-black text-white">{engine.evaluation.score}</span>
                  <span className="text-slate-500 font-medium">/ 8</span>
                </div>
              </div>
            </div>

             <div className="space-y-6">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <AlertTriangle className="text-rose-500" /> Knowledge Gaps Detected
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {engine.evaluation.explanations.map((exp, idx) => (
                   <div key={idx} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl hover:border-rose-500/50 transition-colors">
                     <span className="inline-block px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                       {exp.topic}
                     </span>
                     <p className="text-slate-300 text-sm leading-relaxed">{exp.explanation}</p>
                   </div>
                 ))}
               </div>
             </div>

             <button 
                onClick={handleStartReinforcement}
                className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white px-6 py-5 rounded-xl font-bold text-lg shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-1 transition-all"
              >
                Start Targeted Reinforcement Lesson <RefreshCw size={22} />
              </button>
          </div>
        )}

        {engine.state === "GENERATING_REINFORCEMENT" && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in fade-in">
             <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 animate-spin text-rose-400 relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl text-white font-bold">Designing Your Custom Lesson...</h2>
              <p className="text-slate-400">Generating hyper-specific practice questions just for you.</p>
            </div>
          </div>
        )}

        {engine.state === "REINFORCEMENT_ACTIVE" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 p-8 rounded-3xl">
              <h2 className="text-2xl font-black text-rose-400 mb-6 flex items-center gap-2">
                <BrainCircuit /> Targeted Practice
              </h2>
              <div 
                className="prose prose-invert prose-rose max-w-none prose-p:leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: marked.parse(engine.reinforcementContent) as string }} 
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => engine.actions.completeLearning()}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all"
              >
                I've Mastered This <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        )}

        {engine.state === "COMPLETED" && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full animate-pulse" />
               <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border-4 border-emerald-500 relative z-10 shadow-2xl">
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Mastery Achieved</h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto">You've successfully completed the Adaptive Tutor loop, reinforced your weaknesses, and leveled up your brain!</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
