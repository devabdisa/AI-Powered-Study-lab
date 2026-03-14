"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Pricing that Scales with You
          </h2>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
            Study Buddy is your single smartest investment for college. Start studying for free right now, and upgrade when you're ready to conquer the finals.
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? "text-white font-semibold" : "text-slate-500"}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-7 bg-slate-800 rounded-full relative border border-slate-700 p-1 cursor-pointer transition-colors hover:bg-slate-700"
            >
              <div 
                className={`w-5 h-5 bg-cyan-500 rounded-full transition-transform ${isAnnual ? "translate-x-7" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm flex items-center gap-2 ${isAnnual ? "text-white font-semibold" : "text-slate-500"}`}>
              Annually <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col relative overflow-hidden transition-colors hover:border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">Free Freshman</h3>
            <p className="text-slate-400 text-sm mb-6 h-10">Essential AI tools to get you through your first midterms.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-slate-500">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "10 AI Generations per Day",
                "Basic PDF Uploads (up to 10 pages)",
                "Standard Note Generation",
                "Text & Markdown Export"
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 text-sm">{feat}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 opacity-50">
                <X className="w-5 h-5 text-slate-500 shrink-0" />
                <span className="text-slate-500 text-sm line-through">Unlimited AI Exam Generation</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <X className="w-5 h-5 text-slate-500 shrink-0" />
                <span className="text-slate-500 text-sm line-through">PDF Export & Custom HTML Slides</span>
              </li>
            </ul>

            <Link href="/dashboard">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-full py-6">
                Start for Free
              </Button>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-cyan-900/20">
            <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Study Master</h3>
            <p className="text-slate-400 text-sm mb-6 h-10">Unlimited power to completely crush your finals.</p>
            <div className="mb-8 relative">
              <span className="text-4xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
                ${isAnnual ? "9.99" : "12.99"}
              </span>
              <span className="text-slate-400">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Unlimited AI Generations",
                "Massive PDF Uploads (up to 200 pages)",
                "All 8 specialized Study Modes",
                "Export to PDF, Docx, MD",
                "Generate Interactive HTML Slide Decks",
                "Priority Gemini 1.5 Pro Processing"
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="text-slate-200 text-sm font-medium">{feat}</span>
                </li>
              ))}
            </ul>

            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full py-6 shadow-lg shadow-cyan-500/30 border-0">
                Get StudyBuddy Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
