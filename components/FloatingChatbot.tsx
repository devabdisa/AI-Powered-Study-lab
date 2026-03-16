"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, User, Loader2, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { marked } from "marked";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface FloatingChatbotProps {
  contextText: string;
}

export default function FloatingChatbot({ contextText }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const maxHistory = 5;

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      setMessages([
        {
          role: "ai",
          content: "Hi there! I'm your AI Study Assistant. I'm currently looking at your materials. How can I help you understand them better?"
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Handle auto-scrolling to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue.trim() };
    const chatHistory = [...messages, userMessage].slice(-maxHistory * 2); // Send recent back-and-forth

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-maxHistory * 2), // Don't include the current message in 'history', just pass it directly
          contextText: contextText
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "ai", content: data.output }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "ai", content: "⚠️ I'm sorry, my systems are experiencing a brief hiccup. Could you ask that again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "ai",
        content: "Chat cleared. What else would you like to discuss about your materials?"
      }
    ]);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_10px_40px_rgba(59,130,246,0.6)] flex items-center justify-center z-50 hover:shadow-[0_10px_50px_rgba(79,70,229,0.8)] border-2 border-white/10 group"
          >
            <Sparkles className="absolute inset-0 m-auto text-white/30 animate-ping" size={24} />
            <MessageSquare size={28} className="relative z-10 group-hover:-rotate-12 transition-transform duration-300" />
            
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 border-2 border-slate-900 rounded-full" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`
              fixed z-50 flex flex-col bg-slate-900 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-700/60
              ${isExpanded 
                ? "inset-4 md:inset-10 rounded-2xl" 
                : "bottom-6 right-6 w-[360px] h-[580px] sm:w-[420px] rounded-2xl md:bottom-8 md:right-8"
              }
            `}
          >
            {/* Window Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="bg-slate-950 border-b border-white/10 p-4 flex items-center justify-between z-10 cursor-default">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50 animate-pulse" />
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center relative border border-white/20">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                </div>
                <div>
                  <h3 className="text-white font-bold leading-none">Study Assistant</h3>
                  <p className="text-xs text-blue-400 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Currently Context Aware
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClear}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                  title={isExpanded ? "Minimize" : "Maximize"}
                >
                  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md
                    ${msg.role === "user" ? "bg-slate-700 text-white" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"}
                  `}>
                    {msg.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] rounded-2xl px-5 py-4
                    ${msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-sm shadow-indigo-500/20 shadow-lg" 
                      : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm shadow-xl"}
                  `}>
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div 
                        className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700"
                        dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <Sparkles size={16} />
                  </div>
                  <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 shadow-xl">
                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                    <span className="text-slate-400 text-sm font-medium animate-pulse">Reading context...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-950 border-t border-white/5 z-10">
              <div className="relative flex items-end gap-2 bg-slate-900 rounded-2xl border border-slate-700/50 p-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-inner">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your notes..."
                  className="w-full bg-transparent text-white placeholder-slate-500 resize-none max-h-32 min-h-[44px] py-3 pl-4 pr-2 focus:outline-none text-sm leading-relaxed"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-11 h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shrink-0 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Send size={18} className={`${inputValue.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest mt-3 font-semibold">
                AI can make mistakes. Check important info.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
