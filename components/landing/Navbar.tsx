"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-700/50 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Study Buddy
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="#features" className="hover:text-cyan-400 transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full px-6 shadow-lg shadow-cyan-500/25 border-0">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
