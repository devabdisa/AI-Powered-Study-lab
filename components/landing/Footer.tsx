"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-slate-950 py-12 border-t border-slate-800 text-center">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Study Buddy
          </span>
        </div>

        <nav className="flex gap-6 text-sm text-slate-500 font-medium">
          <Link href="#features" className="hover:text-cyan-400 transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
        </nav>

        <p className="text-slate-600 text-xs mt-4">
          &copy; {year || "2026"} Study Buddy AI. All rights reserved. 
          <br className="md:hidden" /> Developed for universities everywhere.
        </p>

      </div>
    </footer>
  );
}
