"use client";

import React, { useRef, useEffect, useState } from "react";
import { marked } from "marked";

// Import Prism core + languages + theme
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");

  // Parse markdown
  useEffect(() => {
    if (!content) return;
    const parsed = marked.parse(content) as string;
    setHtml(parsed);
  }, [content]);

  // Post-process: highlight code blocks + inject copy buttons + line numbers
  useEffect(() => {
    if (!containerRef.current || !html) return;

    const codeBlocks = containerRef.current.querySelectorAll("pre");

    codeBlocks.forEach((pre) => {
      // Skip already processed blocks
      if (pre.dataset.enhanced === "true") return;
      pre.dataset.enhanced = "true";

      const codeEl = pre.querySelector("code");
      if (!codeEl) return;

      // Detect language from class (e.g., "language-typescript")
      const langClass = Array.from(codeEl.classList).find(c => c.startsWith("language-"));
      const lang = langClass ? langClass.replace("language-", "") : "text";
      const displayLang = lang.toUpperCase();

      // Apply Prism highlighting
      const grammar = Prism.languages[lang] || Prism.languages["javascript"];
      if (grammar) {
        codeEl.innerHTML = Prism.highlight(codeEl.textContent || "", grammar, lang);
      }

      // Style the pre element
      pre.style.position = "relative";
      pre.style.borderRadius = "12px";
      pre.style.border = "1px solid rgba(148, 163, 184, 0.1)";
      pre.style.background = "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)";
      pre.style.padding = "44px 20px 20px 20px";
      pre.style.marginTop = "16px";
      pre.style.marginBottom = "16px";
      pre.style.overflow = "auto";
      pre.style.fontSize = "13px";

      // Create top bar with language label + copy button
      const topBar = document.createElement("div");
      topBar.style.position = "absolute";
      topBar.style.top = "0";
      topBar.style.left = "0";
      topBar.style.right = "0";
      topBar.style.display = "flex";
      topBar.style.alignItems = "center";
      topBar.style.justifyContent = "space-between";
      topBar.style.padding = "8px 14px";
      topBar.style.borderBottom = "1px solid rgba(148, 163, 184, 0.08)";
      topBar.style.background = "rgba(15, 23, 42, 0.6)";
      topBar.style.backdropFilter = "blur(8px)";
      topBar.style.borderRadius = "12px 12px 0 0";

      // Language label
      const langLabel = document.createElement("span");
      langLabel.textContent = displayLang === "TEXT" ? "CODE" : displayLang;
      langLabel.style.fontSize = "10px";
      langLabel.style.fontWeight = "700";
      langLabel.style.letterSpacing = "0.1em";
      langLabel.style.color = "#94a3b8";
      langLabel.style.fontFamily = "monospace";
      topBar.appendChild(langLabel);

      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span style="margin-left:6px">Copy</span>`;
      copyBtn.style.display = "flex";
      copyBtn.style.alignItems = "center";
      copyBtn.style.gap = "4px";
      copyBtn.style.padding = "4px 10px";
      copyBtn.style.borderRadius = "6px";
      copyBtn.style.border = "1px solid rgba(148, 163, 184, 0.15)";
      copyBtn.style.background = "rgba(148, 163, 184, 0.08)";
      copyBtn.style.color = "#94a3b8";
      copyBtn.style.fontSize = "11px";
      copyBtn.style.fontWeight = "600";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.transition = "all 0.2s";
      copyBtn.style.fontFamily = "system-ui, sans-serif";

      copyBtn.addEventListener("mouseenter", () => {
        copyBtn.style.background = "rgba(56, 189, 248, 0.15)";
        copyBtn.style.borderColor = "rgba(56, 189, 248, 0.3)";
        copyBtn.style.color = "#38bdf8";
      });
      copyBtn.addEventListener("mouseleave", () => {
        if (!copyBtn.dataset.copied) {
          copyBtn.style.background = "rgba(148, 163, 184, 0.08)";
          copyBtn.style.borderColor = "rgba(148, 163, 184, 0.15)";
          copyBtn.style.color = "#94a3b8";
        }
      });

      copyBtn.addEventListener("click", async () => {
        const text = codeEl.textContent || "";
        await navigator.clipboard.writeText(text);
        
        copyBtn.dataset.copied = "true";
        copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span style="margin-left:6px">Copied!</span>`;
        copyBtn.style.background = "rgba(16, 185, 129, 0.15)";
        copyBtn.style.borderColor = "rgba(16, 185, 129, 0.3)";
        copyBtn.style.color = "#10b981";

        setTimeout(() => {
          delete copyBtn.dataset.copied;
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span style="margin-left:6px">Copy</span>`;
          copyBtn.style.background = "rgba(148, 163, 184, 0.08)";
          copyBtn.style.borderColor = "rgba(148, 163, 184, 0.15)";
          copyBtn.style.color = "#94a3b8";
        }, 2000);
      });

      topBar.appendChild(copyBtn);
      pre.insertBefore(topBar, pre.firstChild);

      // Add line numbers to code
      const lines = (codeEl.textContent || "").split("\n");
      if (lines.length > 1) {
        codeEl.style.counterReset = "line";
        codeEl.style.display = "block";
        codeEl.style.lineHeight = "1.7";
        codeEl.style.fontFamily = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";
      }
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={`markdown-output prose prose-invert max-w-none
        prose-headings:text-white prose-headings:font-bold
        prose-p:text-slate-300 prose-p:leading-relaxed
        prose-strong:text-white 
        prose-li:text-slate-300
        prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-500/5 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
        prose-code:text-pink-400 prose-code:bg-slate-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
        prose-table:border-collapse
        prose-th:bg-slate-800/80 prose-th:border prose-th:border-slate-700 prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:text-sm prose-th:font-semibold
        prose-td:border prose-td:border-slate-800 prose-td:px-4 prose-td:py-2.5 prose-td:text-sm
        prose-hr:border-slate-800
        prose-img:rounded-xl prose-img:shadow-xl
        ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
