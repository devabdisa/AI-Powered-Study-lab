"use client";

import { motion } from "framer-motion";
import { Star, User } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Computer Science Major",
    content: "The 'Explain Code' feature saved my finals. It breaks down complex algorithms into simple English faster than my TA ever could.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Pre-Med Student",
    content: "Uploading my 50-page biology lecture slides and turning them into an interactive exam within 30 seconds feels like magic. Best study app ever.",
    rating: 5,
  },
  {
    name: "Michael Johnson",
    role: "Law Student",
    content: "The distraction-free reading mode combined with the PDF summarizer makes reviewing dense case law actually manageable.",
    rating: 5,
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-slate-950 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Happy Students, <span className="bg-white text-slate-900 px-3 py-1 rounded-lg ml-2">Higher Grades</span>
            </h2>
          </div>
          <p className="text-slate-400 text-lg">Don't just take our word for it. See what top university students are saying.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, index) => (
                  <Star key={index} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              
              <p className="text-slate-300 mb-8 leading-relaxed min-h-[100px]">
                "{t.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <User className="text-slate-400 w-6 h-6" />
                </div>
                <div>
                  <div className="text-white font-semibold">{t.name}</div>
                  <div className="text-cyan-400 text-sm">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
