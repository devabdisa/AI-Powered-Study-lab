"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Headphones } from "lucide-react";

const faqs = [
  {
    question: "Is Study Buddy really free?",
    answer: "Yes! We offer a Free Freshman tier that gives you 10 AI generations per day and basic PDF uploads (up to 10 pages). You can study smarter without spending a dime. We also have a Pro tier for unlimited power.",
  },
  {
    question: "Is it a chatbot or a document maker?",
    answer: "It's both, but better. Study Buddy uses AI to generate structured, formatted documents (like PDFs, interactive exams, and slides) rather than just chat bubbles. You get real, printable study material instantly.",
  },
  {
    question: "How do I cancel my subscription?",
    answer: "If you upgrade to Pro, you can cancel anytime through your dashboard settings. There are no hidden fees or commitment periods.",
  },
  {
    question: "Can it really grade my mock exams?",
    answer: "Absolutely. When you generate an Interactive AI Exam, you can answer the questions directly in your browser. Study Buddy will grade your responses and show you the correct path if you make a mistake.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-slate-950 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Heading and Illustration pattern */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="sticky top-32"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Frequently<br />Asked Questions
            </h2>
            <p className="text-slate-400 text-lg mb-12">
              Everything you need to know about the ultimate AI Study Lab. Can't find the answer you're looking for? Reach out to support.
            </p>

            {/* Abstract techy pattern matching the Figma design */}
            <div className="hidden md:grid grid-cols-4 gap-4 opacity-10">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl border-2 border-slate-400 flex items-center justify-center p-2">
                   {i % 3 === 0 ? <div className="w-1/2 h-1/2 rounded-full border-2 border-slate-400" /> : null}
                   {i % 4 === 0 ? <div className="w-full h-1 bg-slate-400 rotate-45" /> : null}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Accordions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`item-${i}`}
                  className="border-b border-slate-800 py-2"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-slate-200 hover:text-cyan-400 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

        </div>

        {/* Floating Support Icon at Bottom */}
        <div className="flex justify-center mt-32">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Headphones className="w-8 h-8 text-cyan-400" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
