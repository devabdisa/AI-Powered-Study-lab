"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Glows mapped to Dashboard's Generate Notes color (Cyan/Blue) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-60 left-1/4 w-80 h-80 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" 
      />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-8 shadow-lg shadow-cyan-500/10"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Learning for University</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300"
        >
          Your Ultimate AI Study Buddy <br className="hidden md:block" />
          <span className="text-cyan-400 decoration-cyan-400/30 underline-offset-8">Ace Exams</span> One Click at a Time
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed font-medium"
        >
          Study Buddy is your all-in-one AI-powered study assistant. Instantly generate
          deep notes, mock exams, code explanations, and multi-format summaries.
          Everything you need to master your syllabus in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full px-8 py-6 text-lg group shadow-lg shadow-cyan-500/25 border-0">
              Start Studying Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-cyan-400 text-white rounded-full px-8 py-6 text-lg transition-colors">
              View Features
            </Button>
          </Link>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto max-w-6xl px-4 md:px-0"
        >
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20" />
          
          {/* Dashboard Container mimicking the app's MainArea & Sidebar */}
          <div className="relative rounded-3xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden shadow-black/50 p-2">
            
            {/* Inner Dashboard Frame */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <Image
                src="/readmescreenshot/generate note page.png"
                alt="Study Buddy Dashboard Notes Generator"
                width={1200}
                height={675}
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
