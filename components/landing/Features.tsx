"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Lightbulb, CheckCircle2, FileDown, Download, Layers, Maximize } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-6"
          >
            Features You Don't Want To Miss
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 font-medium"
          >
            Study Buddy has everything you need to prepare for your exams. Stop bouncing between scattered apps, messy Google Docs, and basic chatbots.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Box 1: All Tools (Large, col-span-2) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 md:col-span-2 bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors rounded-3xl p-8 md:p-10 relative overflow-hidden group shadow-lg shadow-black/20"
          >
            <div className="relative z-10 mb-8 max-w-md">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Layers className="text-blue-400 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">All Your Study Tools in One Place</h3>
              <p className="text-slate-400 leading-relaxed">
                Connect the dots between your syllabus quickly. Generate lecture notes, mock exams, targeted quizzes, and code explanations perfectly formatted in seconds.
              </p>
            </div>
            {/* Imagemock */}
            <div className="absolute -bottom-4 -right-4 w-[85%] md:w-[70%] h-auto rounded-tl-xl overflow-hidden border-t-4 border-l-4 border-slate-800 shadow-2xl transition-transform duration-700 group-hover:-translate-y-2 group-hover:-translate-x-2">
              <Image 
                src="/readmescreenshot/generate note page.png" 
                alt="All Study Tools" 
                width={800} 
                height={500} 
                className="object-cover object-left-top"
              />
            </div>
          </motion.div>

          {/* Box 2: Dynamic Exams (Square, col-span-1) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors rounded-3xl p-8 md:p-10 relative overflow-hidden group shadow-lg shadow-black/20 flex flex-col"
          >
            <div className="relative z-10 mb-8">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="text-purple-400 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Interactive AI Exams</h3>
              <p className="text-slate-400 leading-relaxed">
                Test your knowledge before the real thing. Answer multiple-choice questions natively within the dashboard and get graded instantly.
              </p>
            </div>
            <div className="mt-auto relative w-full h-48 rounded-xl overflow-hidden border border-slate-800 shadow-xl transition-transform duration-700 group-hover:scale-105">
              <Image 
                src="/readmescreenshot/exam answer.png" 
                alt="AI Exam Mode" 
                fill 
                className="object-cover object-top"
              />
            </div>
          </motion.div>

          {/* Box 3: Immersive Reading (Square, col-span-1) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="col-span-1 bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors rounded-3xl p-8 md:p-10 relative overflow-hidden group shadow-lg shadow-black/20 flex flex-col"
          >
            <div className="relative z-10 mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <Maximize className="text-emerald-400 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Focus Without Distractions</h3>
              <p className="text-slate-400 leading-relaxed">
                Engage "Full-Screen Reading" mode. Strip away sidebars, buttons, and notifications to deeply absorb your study materials in complete silence.
              </p>
            </div>
            <div className="mt-auto relative w-full h-48 rounded-xl overflow-hidden border border-slate-800 shadow-xl transition-transform duration-700 group-hover:scale-105">
              <Image 
                src="/readmescreenshot/full screen reading.png" 
                alt="Focus Reading Mode" 
                fill 
                className="object-cover object-top"
              />
            </div>
          </motion.div>

          {/* Box 4: Export (Large, col-span-2) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900/50 to-cyan-950/20 border border-slate-800 hover:border-cyan-500/30 transition-colors rounded-3xl p-8 md:p-10 relative overflow-hidden group shadow-lg shadow-black/20"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center h-full relative z-10">
              <div>
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Download className="text-cyan-400 w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Universal Seamless Export.</h3>
                <p className="text-slate-400 leading-relaxed text-lg mb-6">
                  Export your generated study manuals directly into beautiful PDFs, editable Word Documents, Raw Markdown, or even fully interactive HTML lecture slides. Take your notes anywhere.
                </p>
                
                <ul className="space-y-3">
                  {['Download as high-res PDF', 'Export to .DOCX Word Files', 'Generate standalone HTML Presentations', 'Copy Markdown to Notion or Obsidian'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative w-full aspect-square md:aspect-auto md:h-full min-h-[250px] bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_60%)]" />
                  
                  {/* Floating abstract export icons */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-16 h-16 bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                     <span className="text-red-400 font-bold">PDF</span>
                  </motion.div>
                  
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-blue-500/10 backdrop-blur-md border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                     <span className="text-blue-400 font-bold">DOC</span>
                  </motion.div>
                  
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
                    className="absolute top-1/3 right-1/4 w-16 h-16 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                     <span className="text-emerald-400 font-bold">MD</span>
                  </motion.div>

                  <div className="w-24 h-24 bg-cyan-500/20 backdrop-blur-xl border border-cyan-400/50 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/20 z-10">
                    <FileDown className="w-10 h-10 text-cyan-400" />
                  </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
