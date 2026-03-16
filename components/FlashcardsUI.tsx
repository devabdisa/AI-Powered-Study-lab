"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { marked } from "marked";

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardsUI({ rawOutput }: { rawOutput: string }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (!rawOutput) return;
      const parsed = JSON.parse(rawOutput);
      if (parsed.cards && Array.isArray(parsed.cards)) {
        setCards(parsed.cards);
      } else {
        setError("Invalid flashcards format received from AI.");
      }
    } catch (err) {
      console.error("Failed to parse flashcards JSON:", err);
      // Sometimes the AI might still wrap the JSON in markdown blocks despite instructions
      try {
        const cleaned = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        const fallbackParse = JSON.parse(cleaned);
        if (fallbackParse.cards) {
          setCards(fallbackParse.cards);
        } else {
          setError("The AI generated an invalid JSON format.");
        }
      } catch (e) {
        setError("The AI generated an invalid JSON format.");
      }
    }
  }, [rawOutput]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, 150);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-rose-500/10 border border-rose-500/20 rounded-xl h-full shadow-inner">
        <h2 className="text-2xl text-rose-400 font-black mb-3">Generation Error</h2>
        <p className="text-rose-300 text-sm text-center font-medium max-w-md">
          {error}
        </p>
        <p className="text-slate-500 text-xs mt-2 text-center max-w-md">
          The AI failed to format the flashcards correctly. Try generating again, or use a smaller text sample.
        </p>
        <div className="w-full max-w-xl bg-slate-950 p-4 rounded-lg border border-red-500/20 mt-6 overflow-auto max-h-48 text-xs text-slate-400 font-mono scrollbar-thin">
          {rawOutput}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
          <Layers className="text-indigo-400 w-16 h-16 animate-bounce relative z-10" />
        </div>
        <span className="font-bold text-lg text-indigo-300 mt-6 tracking-wide animate-pulse">Shuffling the deck...</span>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl overflow-hidden border border-indigo-500/20 shadow-2xl">
      {/* Header */}
      <div className="bg-slate-950 border-b border-indigo-500/10 p-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="text-indigo-400 w-6 h-6" />
          <h3 className="text-white font-bold text-lg tracking-wide">Study Deck</h3>
        </div>
        <div className="text-indigo-300 font-mono text-xs font-bold tracking-widest bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
          CARD {currentIndex + 1} OF {cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-900/80">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card Arena - Utilizing perspective for 3D flip effect */}
      <div 
        className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 relative overflow-hidden" 
        style={{ perspective: "1500px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50, rotateY: -15, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, rotateY: isFlipped ? 180 : 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, rotateY: 15, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-full max-w-3xl aspect-[4/3] sm:aspect-[16/9] cursor-pointer group"
            style={{ transformStyle: "preserve-3d" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* FRONT OF CARD */}
            <div 
              className="absolute inset-0 bg-slate-800 border-[3px] border-slate-700/50 group-hover:border-indigo-500/50 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center p-8 sm:p-16 transition-colors duration-300"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="absolute top-8 left-8 text-indigo-500/10 font-black text-8xl leading-none select-none">Q</span>
              <div 
                className="prose prose-invert prose-indigo prose-h2:text-4xl prose-h3:text-3xl prose-p:text-2xl text-slate-100 text-center select-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(cards[currentIndex].front) as string }}
              />
              <p className="absolute bottom-8 text-slate-500 font-semibold text-sm flex items-center gap-2 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                <RotateCcw size={14} /> Click to flip
              </p>
            </div>

            {/* BACK OF CARD */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 border-[3px] border-indigo-400/30 rounded-[2rem] shadow-[0_0_50px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center p-8 sm:p-16 text-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div 
                className="prose prose-invert prose-p:leading-relaxed prose-2xl font-medium text-white select-none drop-shadow-md"
                dangerouslySetInnerHTML={{ __html: marked.parse(cards[currentIndex].back) as string }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-4 sm:p-6 flex items-center justify-between gap-4 bg-slate-950/80 border-t border-white/5 backdrop-blur-md">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={28} />
        </button>
        
        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex-1 max-w-sm py-4 rounded-xl font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 active:bg-indigo-500/30 transition-all flex items-center justify-center gap-3 text-lg"
        >
          <RotateCcw size={20} /> {isFlipped ? "Show Question" : "Reveal Answer"}
        </button>
        
        <button 
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="p-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
