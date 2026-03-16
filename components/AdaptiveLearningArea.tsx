"use client";

import React, { useState, useEffect } from "react";
import { marked } from "marked";
import MarkdownRenderer from "./MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BrainCircuit, RefreshCw, CheckCircle2, AlertTriangle, ChevronRight, XCircle } from "lucide-react";

interface AdaptiveQuestion {
  q: string;
  options: string[];
  answer: string;
  explanation: string;
  topic: string;
}

interface AdaptiveLearningAreaProps {
  diagnosticContent: string;
  contextText: string;
}

export default function AdaptiveLearningArea({ 
  diagnosticContent, 
  contextText 
}: AdaptiveLearningAreaProps) {
  
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [error, setError] = useState("");
  
  // Interactive Quiz States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [weakTopics, setWeakTopics] = useState<Set<string>>(new Set());
  
  // Loop States
  const [isDiagnosticComplete, setIsDiagnosticComplete] = useState(false);
  const [isGeneratingReinforcement, setIsGeneratingReinforcement] = useState(false);
  const [reinforcementContent, setReinforcementContent] = useState("");
  const [isMastered, setIsMastered] = useState(false);

  // Parse Initial JSON Output
  useEffect(() => {
    try {
      if (!diagnosticContent) return;
      
      const parsed = JSON.parse(diagnosticContent);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        setQuestions(parsed.questions);
      } else {
        setError("Invalid JSON schema returned by AI Tutor.");
      }
    } catch (err) {
      try {
        const cleaned = diagnosticContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const fallbackParse = JSON.parse(cleaned);
        if (fallbackParse.questions) {
          setQuestions(fallbackParse.questions);
        } else {
          setError("Failed to parse diagnostic questions.");
        }
      } catch (e) {
        setError("The AI generated invalid JSON structures.");
      }
    }
  }, [diagnosticContent]);

  // Quiz Handlers
  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    
    const currentQ = questions[currentIndex];
    if (selectedOption === currentQ.answer) {
      setScore(s => s + 1);
    } else {
      // Collect the weak topic instantly!
      setWeakTopics(prev => {
        const next = new Set(prev);
        if (currentQ.topic) next.add(currentQ.topic);
        return next;
      });
    }
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setIsDiagnosticComplete(true);
    } else {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const handleStartReinforcement = async () => {
    setIsGeneratingReinforcement(true);
    try {
      const res = await fetch("/api/reinforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weakTopics: Array.from(weakTopics) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReinforcementContent(data.output);
    } catch (err) {
      console.error(err);
      setReinforcementContent("An error occurred generating your practice. Please try again.");
    } finally {
      setIsGeneratingReinforcement(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-rose-500/10 border border-rose-500/20 rounded-xl h-full shadow-inner">
        <AlertTriangle className="text-rose-400 w-12 h-12 mb-4" />
        <h2 className="text-2xl text-rose-400 font-black mb-3 text-center">{error}</h2>
        <div className="w-full max-w-xl bg-slate-950 p-4 rounded-lg border border-red-500/20 mt-6 overflow-auto max-h-48 text-xs text-slate-400 font-mono scrollbar-thin">
          {diagnosticContent}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-24 bg-slate-900/50 rounded-xl border border-cyan-500/20">
        <Loader2 className="animate-spin text-cyan-500 w-12 h-12 mb-4" />
        <h2 className="text-xl text-cyan-400 font-medium animate-pulse">Building your custom diagnostic...</h2>
      </div>
    );
  }

  // --- STAGE 1: DIAGNOSTIC QUIZ ---
  if (!isDiagnosticComplete) {
    const currentQ = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="flex flex-col h-full bg-slate-900/40 rounded-xl overflow-hidden border border-cyan-500/20 shadow-2xl">
        <div className="bg-slate-950 border-b border-cyan-500/10 p-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-cyan-400 w-6 h-6" />
            <h3 className="text-white font-bold tracking-wide">Adaptive Tutor</h3>
          </div>
          <div className="text-cyan-300 font-mono text-xs font-bold tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
            DIAGNOSTIC {currentIndex + 1}/{questions.length}
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-900/80">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 relative flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto w-full flex-1 flex flex-col"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-8">
                {currentQ.q}
              </h2>

              <div className="space-y-3 flex-1">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrectOption = isAnswered && opt === currentQ.answer;
                  const isWrongSelection = isAnswered && isSelected && opt !== currentQ.answer;

                  let btnStyles = "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/50 text-slate-300";
                  if (isSelected && !isAnswered) btnStyles = "bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]";
                  else if (isCorrectOption) btnStyles = "bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                  else if (isWrongSelection) btnStyles = "bg-rose-500/20 border-rose-500 text-rose-100";
                  else if (isAnswered) btnStyles = "bg-slate-800/30 border-slate-800/50 text-slate-500 opacity-60";

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      disabled={isAnswered}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${btnStyles}`}
                    >
                      <span className="text-lg font-medium pr-4">{opt}</span>
                      {isCorrectOption && <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={24} />}
                      {isWrongSelection && <XCircle className="text-rose-400 flex-shrink-0" size={24} />}
                      {isSelected && !isAnswered && <div className="w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] flex-shrink-0" />}
                      {!isSelected && !isAnswered && <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-cyan-400 flex-shrink-0 transition-colors" />}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  className={`mt-8 p-6 rounded-xl border ${
                    selectedOption === currentQ.answer ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 ${selectedOption === currentQ.answer ? "text-emerald-400" : "text-rose-400"}`}>
                      {selectedOption === currentQ.answer ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg mb-2 ${selectedOption === currentQ.answer ? "text-emerald-300" : "text-rose-300"}`}>
                        {selectedOption === currentQ.answer ? "Spot On!" : "Knowledge Gap Detected"}
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{currentQ.explanation}</p>
                      {selectedOption !== currentQ.answer && (
                        <div className="mt-3 inline-block px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider rounded-full border border-rose-500/30">
                          Topic Logged: {currentQ.topic}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="bg-slate-950/80 p-4 sm:px-8 border-t border-white/5 flex items-center justify-between">
          {!isAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`ml-auto px-8 py-3.5 rounded-xl font-bold transition-all ${
                selectedOption 
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="ml-auto flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
            >
              {currentIndex === questions.length - 1 ? "Finish Diagnostic" : "Next Question"} <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- STAGE 2: DIAGNOSTIC COMPLETED (Show Weaknesses) ---
  if (isDiagnosticComplete && !isGeneratingReinforcement && !reinforcementContent && !isMastered) {
    const percentage = Math.round((score / questions.length) * 100);
    const hasWeaknesses = weakTopics.size > 0;

    return (
      <div className="flex flex-col h-full bg-slate-900/50 rounded-xl overflow-hidden border border-cyan-500/20">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="bg-slate-950/80 p-8 rounded-3xl border border-cyan-500/20 shadow-2xl flex flex-col items-center justify-center text-center">
            <span className="text-cyan-400 font-bold tracking-widest uppercase mb-4 text-sm">Diagnostic Complete</span>
            <div className="relative mb-6">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-800" />
                <circle 
                  cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" 
                  className={`${hasWeaknesses ? "text-rose-500" : "text-emerald-400"} transition-all duration-1000 ease-out`} 
                  strokeDasharray={2 * Math.PI * 88} 
                  strokeDashoffset={2 * Math.PI * 88 * (1 - percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-black text-white">{percentage}%</span>
                <span className="text-slate-500 font-medium">{score} / {questions.length} Correct</span>
              </div>
            </div>
          </div>

          {!hasWeaknesses ? (
            <div className="text-center space-y-6">
               <h3 className="text-3xl font-black text-emerald-400">Perfect Score! 🏆</h3>
               <p className="text-slate-300">You have no conceptual gaps in this material. Incredible work!</p>
               <button 
                  onClick={() => setIsMastered(true)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all"
                >
                  Complete Session
                </button>
            </div>
          ) : (
            <div className="space-y-6">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <AlertTriangle className="text-rose-500" /> Detected Knowledge Gaps
               </h3>
               <div className="flex flex-wrap gap-3">
                 {Array.from(weakTopics).map((topic, idx) => (
                   <span key={idx} className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl font-medium shadow-sm">
                     {topic}
                   </span>
                 ))}
               </div>
               
               <button 
                  onClick={handleStartReinforcement}
                  className="w-full mt-4 flex justify-center items-center gap-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-6 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all"
                >
                  Start Reinforcement Lesson <RefreshCw size={22} />
                </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STAGE 3: GENERATING REINFORCEMENT ---
  if (isGeneratingReinforcement) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in fade-in h-full bg-slate-900/50 rounded-xl border border-cyan-500/20">
         <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 animate-spin text-indigo-400 relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl text-white font-bold">Designing Your Custom Lesson...</h2>
          <p className="text-slate-400">Generating hyper-specific practice material for your weak topics.</p>
        </div>
      </div>
    );
  }

  // --- STAGE 4: REINFORCEMENT ACTIVE ---
  if (reinforcementContent && !isMastered) {
    return (
      <div className="flex flex-col h-full bg-slate-900/50 rounded-xl overflow-hidden border border-indigo-500/30 shadow-2xl">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 p-8 rounded-3xl">
            <h2 className="text-2xl font-black text-indigo-400 mb-6 flex items-center gap-2">
              <BrainCircuit /> Targeted Practice Lesson
            </h2>
            <MarkdownRenderer content={reinforcementContent} />
          </div>
          
          <div className="flex justify-end pb-8">
            <button 
              onClick={() => setIsMastered(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all"
            >
              I've Mastered This <CheckCircle2 size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STAGE 5: COMPLETED ---
  if (isMastered) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 bg-slate-900/40 rounded-xl border border-emerald-500/20 shadow-2xl">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}
          className="relative mb-8"
        >
           <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full animate-pulse" />
           <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border-4 border-emerald-500 relative z-10 shadow-2xl">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
        </motion.div>
        
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Mastery Achieved</h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            You successfully completed the Adaptive Tutor loop and reinforced your weaknesses. Incredible work!
          </p>
        </div>
      </div>
    );
  }

  return null;
}
