"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, AlertCircle, Loader2, Workflow, Maximize2, Minimize2 } from "lucide-react";

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

// Recursive Node Component
const ConceptNode = ({ node, depth = 0, index = 0, parentColor = "fuchsia" }: { node: TreeNode, depth?: number, index?: number, parentColor?: string }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Stagger children rendering
  const hasChildren = node.children && node.children.length > 0;
  
  // Map depth to beautiful colors
  const depthColors = ["fuchsia", "purple", "indigo", "blue", "cyan", "emerald"];
  const color = depthColors[depth % depthColors.length];

  return (
    <div className="relative flex flex-col items-start font-sans">
      <motion.div 
        initial={{ opacity: 0, x: -10, y: -5 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: depth * 0.1 + index * 0.05, duration: 0.3 }}
        className="flex items-center mb-4"
      >
        {/* Connector Line to Parent */}
        {depth > 0 && (
          <div className={`w-6 sm:w-10 h-0.5 bg-${parentColor}-500/30`} />
        )}
        
        {/* The Node Box */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasChildren}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 z-10 shadow-lg text-sm sm:text-base font-medium
            ${hasChildren ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
            ${depth === 0 ? `bg-${color}-900/40 border-${color}-400 text-${color}-200 shadow-${color}-500/20 text-lg py-3` : 
              `bg-${color}-950/80 border-${color}-500/40 text-${color}-300 hover:border-${color}-400/80`}
          `}
        >
          {depth === 0 && <Workflow size={18} className={`text-${color}-400`} />}
          {node.name}
          {hasChildren && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full bg-${color}-500/20 text-${color}-300`}>
              {node.children!.length}
            </span>
          )}
        </button>
      </motion.div>

      {/* Children Container */}
      {hasChildren && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative pl-6 sm:pl-10 ml-4 sm:ml-8"
            >
              {/* Vertical Branch Line */}
              <div 
                className={`absolute top-[-16px] bottom-6 left-0 w-0.5 bg-gradient-to-b from-${color}-500/30 to-transparent`}
              />
              
              {node.children!.map((child, idx) => (
                <ConceptNode key={idx} node={child} depth={depth + 1} index={idx} parentColor={color} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};


export default function ConceptMapUI({ rawOutput }: { rawOutput: string }) {
  const [rootNode, setRootNode] = useState<TreeNode | null>(null);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    try {
      if (!rawOutput) return;
      const parsed = JSON.parse(rawOutput);
      if (parsed.name) {
        setRootNode(parsed);
      } else {
        setError("Invalid Concept Map format received from AI.");
      }
    } catch (err) {
      console.error("Failed to parse map JSON:", err);
      try {
        const cleaned = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        const fallbackParse = JSON.parse(cleaned);
        if (fallbackParse.name) {
          setRootNode(fallbackParse);
        } else {
          setError("The AI generated an invalid JSON format.");
        }
      } catch (e) {
        setError("The AI generated an invalid JSON format.");
      }
    }
  }, [rawOutput]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-rose-500/10 border border-rose-500/20 rounded-xl h-full shadow-inner">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
        <h2 className="text-2xl text-rose-400 font-black mb-3">Map Generation Error</h2>
        <p className="text-rose-300 text-sm text-center font-medium max-w-md">{error}</p>
        <div className="w-full max-w-xl bg-slate-950 p-4 rounded-lg border border-red-500/20 mt-6 overflow-auto max-h-48 text-xs text-slate-400 font-mono scrollbar-thin">
          {rawOutput}
        </div>
      </div>
    );
  }

  if (!rootNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-24 bg-slate-900/50 rounded-xl border border-fuchsia-500/20">
        <div className="relative">
          <div className="absolute inset-0 bg-fuchsia-500/20 blur-xl rounded-full animate-pulse" />
          <Network className="text-fuchsia-400 w-16 h-16 animate-bounce relative z-10" />
        </div>
        <span className="font-bold text-lg text-fuchsia-300 mt-6 tracking-wide animate-pulse">Mapping out concepts...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-slate-900/40 rounded-xl overflow-hidden border border-fuchsia-500/20 shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 rounded-none' : ''}`}>
      {/* Header */}
      <div className="bg-slate-950/80 backdrop-blur-md border-b border-fuchsia-500/10 p-4 sm:px-6 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Network className="text-fuchsia-400 w-6 h-6" />
          <h3 className="text-white font-bold text-lg tracking-wide">Interactive Mind Map</h3>
        </div>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 hover:border-fuchsia-500/50"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Render Area */}
      <div className="flex-1 overflow-auto p-8 sm:p-12 lg:p-16 relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#d946ef 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
        />
        
        <div className="min-w-max relative z-10">
          <ConceptNode node={rootNode} />
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-slate-950/80 p-3 flex justify-between items-center text-xs text-slate-500 border-t border-fuchsia-500/10">
        <span>Click on any node with a number to expand/collapse its children.</span>
        <span>Scroll to explore full map.</span>
      </div>
    </div>
  );
}
