"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, RotateCcw, Award, AlertCircle } from "lucide-react";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function QuizUI({ rawOutput }: { rawOutput: string }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    try {
      if (!rawOutput) return;
      const parsed = JSON.parse(rawOutput);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        setQuestions(parsed.questions);
      } else {
        setError("Invalid quiz format received from AI.");
      }
    } catch (err) {
      console.error("Failed to parse quiz JSON:", err);
      try {
        const cleaned = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        const fallbackParse = JSON.parse(cleaned);
        if (fallbackParse.questions) {
          setQuestions(fallbackParse.questions);
        } else {
          setError("The AI generated an invalid JSON format.");
        }
      } catch (e) {
        setError("The AI generated an invalid JSON format.");
      }
    }
  }, [rawOutput]);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    if (selectedOption === questions[currentIndex].answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setIsCompleted(true);
    } else {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-rose-500/10 border border-rose-500/20 rounded-xl h-full shadow-inner">
        <h2 className="text-2xl text-rose-400 font-black mb-3">Generation Error</h2>
        <p className="text-rose-300 text-sm text-center font-medium max-w-md">{error}</p>
        <div className="w-full max-w-xl bg-slate-950 p-4 rounded-lg border border-red-500/20 mt-6 overflow-auto max-h-48 text-xs text-slate-400 font-mono scrollbar-thin">
          {rawOutput}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
          <HelpCircle className="text-blue-400 w-16 h-16 animate-bounce relative z-10" />
        </div>
        <span className="font-bold text-lg text-blue-300 mt-6 tracking-wide animate-pulse">Building your quiz...</span>
      </div>
    );
  }

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "Keep studying!";
    let ringColor = "text-rose-500";
    if (percentage >= 90) { message = "Outstanding! 🏆"; ringColor = "text-emerald-400"; }
    else if (percentage >= 70) { message = "Great Job! 🚀"; ringColor = "text-blue-400"; }
    else if (percentage >= 50) { message = "Good Effort! 👍"; ringColor = "text-amber-400"; }

    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900/40 rounded-xl p-8 border border-slate-800 shadow-2xl">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative mb-8"
        >
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="88" className="stroke-slate-800" strokeWidth="12" fill="none" />
            <circle 
              cx="96" cy="96" r="88" 
              className={`${ringColor} transition-all duration-1000 ease-out`} 
              strokeWidth="12" 
              strokeDasharray={2 * Math.PI * 88} 
              strokeDashoffset={2 * Math.PI * 88 * (1 - percentage / 100)}
              strokeLinecap="round" 
              fill="none" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white">{percentage}%</span>
            <span className="text-slate-400 text-sm mt-1">{score} / {questions.length}</span>
          </div>
        </motion.div>

        <h2 className="text-3xl font-extrabold text-white mb-2">{message}</h2>
        <p className="text-slate-400 text-center max-w-md mb-8">
          You have completed the quiz. Review your notes and try again to improve your score!
        </p>

        <button 
          onClick={handleRestart}
          className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw size={20} /> Retake Quiz
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl overflow-hidden border border-blue-500/20 shadow-2xl">
      {/* Header */}
      <div className="bg-slate-950 border-b border-blue-500/10 p-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-blue-400 w-6 h-6" />
          <h3 className="text-white font-bold text-lg tracking-wide">Interactive Quiz</h3>
        </div>
        <div className="text-blue-300 font-mono text-xs font-bold tracking-widest bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
          Q{currentIndex + 1} OF {questions.length}
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-900/80">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
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
                // If answered, check if it's the correct option or the wrong selected option
                const isCorrectOption = isAnswered && opt === currentQ.answer;
                const isWrongSelection = isAnswered && isSelected && opt !== currentQ.answer;

                let btnStyles = "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-blue-500/50 text-slate-300";
                if (isSelected && !isAnswered) {
                  btnStyles = "bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]";
                } else if (isCorrectOption) {
                  btnStyles = "bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                } else if (isWrongSelection) {
                  btnStyles = "bg-rose-500/20 border-rose-500 text-rose-100";
                } else if (isAnswered) {
                  btnStyles = "bg-slate-800/30 border-slate-800/50 text-slate-500 opacity-60"; // fade out others
                }

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
                    {isSelected && !isAnswered && <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] flex-shrink-0" />}
                    {!isSelected && !isAnswered && <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-blue-400 flex-shrink-0 transition-colors" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation Area */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                className={`mt-8 p-6 rounded-xl border ${
                  selectedOption === currentQ.answer 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : "bg-amber-500/10 border-amber-500/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${selectedOption === currentQ.answer ? "text-emerald-400" : "text-amber-400"}`}>
                    {selectedOption === currentQ.answer ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg mb-2 ${selectedOption === currentQ.answer ? "text-emerald-300" : "text-amber-300"}`}>
                      {selectedOption === currentQ.answer ? "Correct!" : "Not quite!"}
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                      {currentQ.explanation}
                    </p>
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
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="ml-auto w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
          >
            {currentIndex === questions.length - 1 ? "View Results" : "Next Question"} <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
