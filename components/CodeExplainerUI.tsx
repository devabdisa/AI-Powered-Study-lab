"use client";

import React, { useState } from "react";
import { marked } from "marked";
import MarkdownRenderer from "./MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderTree, FileCode2, ChevronRight, ChevronDown, 
  Search, Code2, Layers, BookOpen 
} from "lucide-react";

interface CodeFile {
  path: string;
  content: string;
}

interface TreeNode {
  name: string;
  isFile: boolean;
  path?: string;
  children: TreeNode[];
}

function buildTree(files: CodeFile[]): TreeNode {
  const root: TreeNode = { name: "root", isFile: false, children: [] };

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, idx) => {
      const isLast = idx === parts.length - 1;
      let child = current.children.find((c) => c.name === part);
      
      if (!child) {
        child = { 
          name: part, 
          isFile: isLast, 
          path: isLast ? file.path : undefined, 
          children: [] 
        };
        current.children.push(child);
      }
      current = child;
    });
  });

  // If root has only one child (the project folder), use that as root
  if (root.children.length === 1 && !root.children[0].isFile) {
    return root.children[0];
  }
  return root;
}

// Color mapping per file extension
function getFileColor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "text-blue-400", tsx: "text-blue-400",
    js: "text-yellow-400", jsx: "text-yellow-400",
    css: "text-pink-400", scss: "text-pink-400",
    html: "text-orange-400",
    json: "text-emerald-400",
    md: "text-slate-300",
    py: "text-green-400",
    prisma: "text-indigo-400",
    sql: "text-cyan-400",
    yml: "text-rose-300", yaml: "text-rose-300",
    env: "text-amber-300",
  };
  return map[ext] || "text-slate-400";
}

// Recursive Tree Item
function TreeItem({ 
  node, 
  depth = 0, 
  selectedFile, 
  onSelect 
}: { 
  node: TreeNode; 
  depth?: number; 
  selectedFile: string | null; 
  onSelect: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.isFile) {
    const isActive = selectedFile === node.path;
    return (
      <button
        onClick={() => node.path && onSelect(node.path)}
        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
          isActive 
            ? "bg-pink-500/15 text-pink-300 border border-pink-500/30" 
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileCode2 size={13} className={getFileColor(node.name)} />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <FolderTree size={13} className="text-amber-400" />
        <span>{node.name}</span>
        <span className="text-[10px] text-slate-600 ml-auto">{node.children.length}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Sort: folders first, then files */}
            {[...node.children]
              .sort((a, b) => {
                if (a.isFile === b.isFile) return a.name.localeCompare(b.name);
                return a.isFile ? 1 : -1;
              })
              .map((child, i) => (
                <TreeItem 
                  key={i} 
                  node={child} 
                  depth={depth + 1} 
                  selectedFile={selectedFile}
                  onSelect={onSelect}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CodeExplainerUI({ 
  rawOutput, 
  files 
}: { 
  rawOutput: string; 
  files: CodeFile[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "files">("overview");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const tree = buildTree(files);

  const selectedFileData = selectedFile 
    ? files.find(f => f.path === selectedFile)
    : null;

  const filteredFiles = searchQuery 
    ? files.filter(f => f.path.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex h-full bg-slate-950 rounded-xl overflow-hidden border border-pink-500/20 shadow-2xl">
      {/* Left Sidebar - File Tree */}
      <div className="w-72 border-r border-slate-800 flex flex-col bg-slate-900/50 shrink-0">
        {/* Tree Header */}
        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <FolderTree size={16} className="text-pink-400" />
            <h3 className="text-sm font-bold text-white">Project Explorer</h3>
            <span className="ml-auto text-[10px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded-full">
              {files.length} files
            </span>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg py-2 pl-8 pr-3 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-pink-500/50"
            />
          </div>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
          {searchQuery ? (
            filteredFiles.map((f, i) => (
              <button
                key={i}
                onClick={() => { setSelectedFile(f.path); setActiveTab("files"); setSearchQuery(""); }}
                className="w-full flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
              >
                <FileCode2 size={13} className={getFileColor(f.path)} />
                <span className="truncate">{f.path}</span>
              </button>
            ))
          ) : (
            <TreeItem 
              node={tree} 
              selectedFile={selectedFile} 
              onSelect={(path) => { setSelectedFile(path); setActiveTab("files"); }}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "overview"
                ? "text-pink-400 border-pink-500 bg-pink-500/5"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <BookOpen size={15} /> Architecture Overview
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "files"
                ? "text-blue-400 border-blue-500 bg-blue-500/5"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <Code2 size={15} /> 
            {selectedFileData ? selectedFileData.path.split("/").pop() : "Source Code"}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 lg:p-8"
              >
                <MarkdownRenderer content={rawOutput} />
              </motion.div>
            ) : (
              <motion.div
                key="files"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                {selectedFileData ? (
                  <div className="flex-1 overflow-y-auto">
                    {/* File Header */}
                    <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center gap-3 z-10">
                      <FileCode2 size={16} className={getFileColor(selectedFileData.path)} />
                      <span className="text-sm font-mono text-slate-300 truncate">{selectedFileData.path}</span>
                      <span className="ml-auto text-[10px] text-slate-500 font-mono">
                        {selectedFileData.content.split("\n").length} lines
                      </span>
                    </div>

                    {/* Code Block */}
                    <div className="p-4">
                      <pre className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-x-auto">
                        <code className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre">
                          {selectedFileData.content}
                        </code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-12">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                        <Layers size={28} className="text-slate-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-400">Select a file</h3>
                      <p className="text-sm text-slate-500 max-w-sm">
                        Click on any file in the Project Explorer to view its source code here.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
