"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Copy,
  Check,
  Download,
  FileText,
  Loader2,
  X,
  AlertCircle,
  ChevronDown,
  Sparkles,
  BookOpen,
  HelpCircle,
  Code2,
  Dumbbell,
  Zap,
  FileDown,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  GraduationCap,
  Bookmark,
  Library,
  Presentation,
  ChevronLeft,
  ChevronRight,
  MonitorPlay,
} from "lucide-react";
import { marked } from "marked";
import AdaptiveLearningArea from "./AdaptiveLearningArea";
import FlashcardsUI from "./FlashcardsUI";
import QuizUI from "./QuizUI";
import ConceptMapUI from "./ConceptMapUI";

interface MainAreaProps {
  selectedMode: string;
  output: string;
  setOutput: (output: string) => void;
  currentId: string | null;
  setCurrentId: (id: string | null) => void;
  details?: {
    title: string | null;
    course: string | null;
    year: string | null;
    isSaved: boolean;
  };
  setDetails?: (details: any) => void;
  onSaveSuccess?: () => void;
}

const modeMap: Record<string, string> = {
  "Generate Notes": "notes",
  "Generate Exam": "exam",
  "Generate Quiz": "quiz",
  Summarize: "summary",
  "Explain Code": "code",
  "Practice Problems": "practice",
  "Solve Exam/Assignment": "assignment",
  "Lecture Slides": "slides",
  "Generate Flashcards": "flashcards",
  "Concept Map": "concept_map",
  "Adaptive Tutor": "adaptive_learning",
};

const modeDescriptions: Record<string, string> = {
  "Generate Notes":
    "Transform your PDFs into beautiful, structured study notes with emojis and examples 📚",
  "Generate Exam":
    "Create university-level exam questions from your content 📝",
  "Generate Quiz":
    "Generate 10 multiple choice quiz questions to test yourself 🎯",
  Summarize: "Get a concise, exam-ready summary in minutes ⚡",
  "Explain Code": "Deep-dive explanation for code or programming concepts 💻",
  "Practice Problems": "Hands-on practice problems with full solutions 🏋️",
  "Solve Exam/Assignment":
    "High-quality, meticulously formatted exam & assignment solutions 🎓",
  "Lecture Slides":
    "Generate beautiful lecture slides — beginner-friendly, clear and visual 🎨",
  "Generate Flashcards": "Generate optimized spaced-repetition flashcards 🗂️",
  "Concept Map": "Generate hierarchical mind-maps of complex topics 🗺️",
  "Adaptive Tutor": "An AI tutor that tests you and dynamically reinforces your weaknesses 🧠",
};

const modeGradients: Record<string, string> = {
  "Generate Notes": "from-cyan-500/20 to-blue-500/10",
  "Generate Exam": "from-violet-500/20 to-purple-500/10",
  "Generate Quiz": "from-amber-500/20 to-yellow-500/10",
  Summarize: "from-emerald-500/20 to-green-500/10",
  "Explain Code": "from-pink-500/20 to-rose-500/10",
  "Practice Problems": "from-orange-500/20 to-amber-500/10",
  "Solve Exam/Assignment": "from-rose-500/20 to-red-500/10",
  "Lecture Slides": "from-sky-500/20 to-blue-500/10",
  "Generate Flashcards": "from-indigo-500/20 to-blue-500/10",
  "Concept Map": "from-fuchsia-500/20 to-pink-500/10",
  "Adaptive Tutor": "from-cyan-500/20 to-indigo-500/10",
};

const modeIcons: Record<string, React.ReactNode> = {
  "Generate Notes": <FileText size={20} className="text-cyan-400" />,
  "Generate Exam": <BookOpen size={20} className="text-violet-400" />,
  "Generate Quiz": <HelpCircle size={20} className="text-amber-400" />,
  Summarize: <Sparkles size={20} className="text-emerald-400" />,
  "Explain Code": <Code2 size={20} className="text-pink-400" />,
  "Practice Problems": <Dumbbell size={20} className="text-orange-400" />,
  "Solve Exam/Assignment": (
    <GraduationCap size={20} className="text-rose-400" />
  ),
  "Lecture Slides": <Presentation size={20} className="text-sky-400" />,
};

const modeBorderColors: Record<string, string> = {
  "Generate Notes": "border-cyan-500/30 hover:border-cyan-400/50",
  "Generate Exam": "border-violet-500/30 hover:border-violet-400/50",
  "Generate Quiz": "border-amber-500/30 hover:border-amber-400/50",
  Summarize: "border-emerald-500/30 hover:border-emerald-400/50",
  "Explain Code": "border-pink-500/30 hover:border-pink-400/50",
  "Practice Problems": "border-orange-500/30 hover:border-orange-400/50",
  "Solve Exam/Assignment": "border-rose-500/30 hover:border-rose-400/50",
  "Lecture Slides": "border-sky-500/30 hover:border-sky-400/50",
  "Generate Flashcards": "border-indigo-500/30 hover:border-indigo-400/50",
  "Concept Map": "border-fuchsia-500/30 hover:border-fuchsia-400/50",
  "Adaptive Tutor": "border-cyan-500/30 hover:border-cyan-400/50",
};

const modeButtonColors: Record<string, string> = {
  "Generate Notes":
    "from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25",
  "Generate Exam":
    "from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 shadow-violet-500/25",
  "Generate Quiz":
    "from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 shadow-amber-500/25",
  Summarize:
    "from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-emerald-500/25",
  "Explain Code":
    "from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 shadow-pink-500/25",
  "Practice Problems":
    "from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-orange-500/25",
  "Solve Exam/Assignment":
    "from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 shadow-rose-500/25",
  "Lecture Slides":
    "from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-500/25",
  "Generate Flashcards":
    "from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 shadow-indigo-500/25",
  "Concept Map":
    "from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 shadow-fuchsia-500/25",
  "Adaptive Tutor":
    "from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/25",
};

export default function MainArea({
  selectedMode,
  output,
  setOutput,
  currentId,
  setCurrentId,
  details,
  setDetails,
  onSaveSuccess,
}: MainAreaProps) {
  const [textInput, setTextInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contextText, setContextText] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Library Save states
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveForm, setSaveForm] = useState({ title: "", course: "", year: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Slide viewer state
  const [slides, setSlides] = useState<{ title: string; body: string }[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Re-parse slides whenever output or mode changes (fixes library load)
  useEffect(() => {
    if (selectedMode === "Lecture Slides" && output) {
      const parsed = parseSlides(output);
      setSlides(parsed);
      setCurrentSlide(0);
    } else {
      setSlides([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output, selectedMode]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File too large. Max 20MB.");
      return;
    }
    setUploadedFile(file);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleProcess = async () => {
    if (!textInput.trim() && !uploadedFile) {
      setError("Please provide text or upload a PDF file.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setOutput("");
    setCurrentId(null);

    try {
      const formData = new FormData();
      formData.append("mode", modeMap[selectedMode] || "notes");
      formData.append("difficulty", difficulty);
      if (textInput.trim()) formData.append("textInput", textInput.trim());
      if (uploadedFile) formData.append("file", uploadedFile);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setOutput(data.output);
      setContextText(data.extractedContent || textInput);
      setCurrentId(data.id);
      if (setDetails) {
        setDetails({ title: null, course: null, year: null, isSaved: false });
      }
      setShowSaveForm(false);
      setSaveForm({ title: "", course: "", year: "" });

      // Parse slides if in slides mode
      if (selectedMode === "Lecture Slides") {
        const parsed = parseSlides(data.output);
        setSlides(parsed);
        setCurrentSlide(0);
      } else {
        setSlides([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as plain text / markdown
  const exportAsMarkdown = () => {
    const brandedOutput = `${output}\n\n---\n\n> 🐼 Generated by **Study Buddy Study Lab**  \n> 📺 YouTube • 📱 Telegram • 🎵 TikTok — **@ethiopandatech** — Subscribe & Follow!`;
    const blob = new Blob([brandedOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedMode.replace(/ /g, "_")}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsTxt = () => {
    const brandedOutput = `${output}\n\n---\nGenerated by Study Buddy Study Lab\nYouTube • Telegram • TikTok: @ethiopandatech — Subscribe & Follow!`;
    const blob = new Blob([brandedOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedMode.replace(/ /g, "_")}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsPDF = () => {
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error(
          "Popup blocked! Please allow popups to export the PDF.",
        );
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${selectedMode}</title>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #111827;
                line-height: 1.7;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: white;
              }
              h1, h2, h3, h4, h5, h6 {
                color: #000000;
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                font-weight: 700;
              }
              h1 { font-size: 2.25rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; margin-top: 0; }
              h2 { font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
              p, ul, ol { margin-bottom: 1.2em; }
              ul, ol { padding-left: 2em; }
              li { margin-bottom: 0.5em; }
              strong { font-weight: 700; color: #000000; }
              em { font-style: italic; }
              blockquote {
                border-left: 4px solid #d1d5db;
                padding-left: 1rem;
                margin: 1.5em 0;
                color: #4b5563;
                font-style: italic;
              }
              code {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                background-color: #f3f4f6;
                padding: 0.2em 0.4em;
                border-radius: 3px;
                font-size: 0.85em;
                color: #111827;
              }
              pre {
                background-color: #f8fafc;
                padding: 1rem;
                border-radius: 6px;
                overflow-x: auto;
                border: 1px solid #e2e8f0;
                margin: 1.5em 0;
              }
              pre code {
                background-color: transparent;
                padding: 0;
                color: inherit;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5em 0;
              }
              th, td {
                border: 1px solid #d1d5db;
                padding: 0.75rem;
                text-align: left;
              }
              th { background-color: #f9fafb; font-weight: 600; }
              hr {
                border: 0;
                border-top: 1px solid #e5e7eb;
                margin: 2em 0;
              }
              .header {
                text-align: left;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e7eb;
              }
              .header-title { font-weight: 700; font-size: 1.5rem; color: #111827; margin: 0; }
              .header-meta { color: #6b7280; font-size: 0.875rem; margin-top: 5px; }
              
              @media print {
                body { padding: 0; margin: 0; max-width: 100%; }
                @page { margin: 20mm; }
                pre, code, th { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <p class="header-title">🐼 Study Buddy &bull; ${selectedMode}</p>
              <p class="header-meta">Generated on ${new Date().toLocaleString()}</p>
              <p class="header-meta" style="margin-top:3px;">📺 YouTube &bull; 📱 Telegram &bull; 🎵 TikTok &mdash; <strong>@ethiopandatech</strong> &mdash; Subscribe &amp; Follow!</p>
            </div>
            
            <div class="content">
              ${marked(output)}
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 250);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (e) {
      console.error("PDF export failed", e);
      setError(
        e instanceof Error ? e.message : "Failed to open PDF export tool",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsDoc = () => {
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${selectedMode}</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #111; max-width: 800px; margin: 0 auto; padding: 20px;}
            h1, h2, h3, h4, h5, h6 { color: #000; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: bold; }
            h1 { font-size: 24pt; border-bottom: 1px solid #000; padding-bottom: 5px; }
            h2 { font-size: 18pt; }
            p, ul, ol { margin-bottom: 1em; }
            li { margin-bottom: 0.5em; }
            ul, ol { margin-left: 20px; }
            pre { background-color: #f4f4f4; padding: 10px; border: 1px solid #ddd; }
            code { font-family: 'Courier New', monospace; font-size: 10.5pt; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: bold; }
            blockquote { border-left: 3px solid #ccc; margin-left: 0; padding-left: 10px; font-style: italic; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; border-bottom: none;">🐼 Study Buddy &bull; ${selectedMode}</h1>
          <p style="text-align: center; color: #666; font-size: 10pt;">Generated on ${new Date().toLocaleString()}</p>
          <p style="text-align: center; color: #888; font-size: 9pt; margin-top: 4px;">📺 YouTube &bull; 📱 Telegram &bull; 🎵 TikTok &mdash; @ethiopandatech &mdash; Subscribe &amp; Follow!</p>
          <hr>
          ${marked(output)}
        </body>
        </html>
      `;

      const blob = new Blob(["\ufeff", htmlContent], {
        type: "application/msword",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedMode.replace(/ /g, "_")}_${Date.now()}.doc`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("DOC export failed", e);
      setError("Failed to export as DOC");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsImage = async () => {
    if (!outputRef.current) return;
    setIsExporting(true);
    setShowExportMenu(false);

    const element = outputRef.current;
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;

    try {
      const { toPng } = await import("html-to-image");

      element.style.height = `${element.scrollHeight}px`;
      element.style.overflow = "visible";

      const imgData = await toPng(element, {
        backgroundColor: "#0f172a",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `${selectedMode.replace(/ /g, "_")}_${Date.now()}.png`;
      link.href = imgData;
      link.click();
    } catch (e) {
      console.error("Image export failed", e);
    } finally {
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      setIsExporting(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!currentId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/history", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentId,
          title: saveForm.title || "Untitled Document",
          course: saveForm.course || "",
          year: saveForm.year || "",
          isSaved: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (setDetails) {
          setDetails({
            title: data.updated.title,
            course: data.updated.course,
            year: data.updated.year,
            isSaved: true,
          });
        }
        setShowSaveForm(false);
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setError("Failed to save to library");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // Parse the AI slide output into an array of slide objects
  const parseSlides = (
    rawOutput: string,
  ): { title: string; body: string }[] => {
    const cleaned = rawOutput.replace(/===END===/g, "");
    const parts = cleaned.split("===SLIDE===").filter((s) => s.trim());
    return parts.map((part) => {
      const lines = part.trim().split("\n");
      const title = lines[0]?.trim() || "Slide";
      const body = lines.slice(1).join("\n").trim();
      return { title, body };
    });
  };

  // Export as a standalone beautiful HTML presentation
  const exportAsPresentation = () => {
    if (!slides.length) return;
    const slideHTML = slides
      .map(
        (slide, i) => `
      <div class="slide" id="slide-${i}" style="display: ${i === 0 ? "flex" : "none"}">
        <div class="slide-number">${i + 1} / ${slides.length}</div>
        <div class="slide-content">
          <h2 class="slide-title">${slide.title}</h2>
          <div class="slide-body">${slide.body
            .split("\n")
            .filter((l) => l.trim())
            .map((line) => {
              const cleaned = line.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>",
              );
              return line.trim().startsWith("-")
                ? `<div class="bullet">${cleaned.replace(/^-\s*/, "")}</div>`
                : `<p>${cleaned}</p>`;
            })
            .join("")}</div>
        </div>
      </div>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Study Buddy — Lecture Slides</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f0c29; font-family: 'Segoe UI', sans-serif; height: 100vh; overflow: hidden; }
    .slide {
      width: 100vw; height: 100vh;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 5vw; position: relative;
    }
    .slide-number {
      position: absolute; top: 24px; right: 32px;
      color: rgba(255,255,255,0.3); font-size: 14px; letter-spacing: 1px;
    }
    .slide-content { max-width: 900px; width: 100%; }
    .slide-title {
      font-size: clamp(28px, 4vw, 52px); font-weight: 800; color: #fff;
      margin-bottom: 40px; line-height: 1.2;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .slide-body { display: flex; flex-direction: column; gap: 16px; }
    .bullet {
      background: rgba(255,255,255,0.06); border-left: 3px solid #38bdf8;
      padding: 14px 20px; border-radius: 10px;
      color: #e2e8f0; font-size: clamp(14px, 2vw, 22px); line-height: 1.5;
    }
    p { color: #94a3b8; font-size: clamp(13px, 1.6vw, 20px); line-height: 1.6; }
    strong { color: #38bdf8; }
    nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      display: flex; justify-content: center; gap: 12px; padding: 18px;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
    }
    nav button {
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      color: #fff; border-radius: 8px; padding: 10px 24px;
      cursor: pointer; font-size: 14px; transition: all 0.2s;
    }
    nav button:hover { background: rgba(56,189,248,0.3); border-color: #38bdf8; }
    #progress {
      position: fixed; top: 0; left: 0; height: 3px;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      transition: width 0.3s ease;
    }
    .keys { position: fixed; bottom: 72px; right: 24px; color: rgba(255,255,255,0.2); font-size: 11px; }
    .brand {
      position: fixed; bottom: 72px; left: 24px;
      color: rgba(255,255,255,0.35); font-size: 12px; letter-spacing: 0.3px;
    }
    .brand strong { color: #38bdf8; }
  </style>
</head>
<body>
  <div id="progress" style="width: ${(1 / slides.length) * 100}%"></div>
  ${slideHTML}
  <div class="keys">← → or Space to navigate</div>
  <div class="brand">🐼 <strong>@ethiopandatech</strong> &bull; YouTube &bull; Telegram &bull; TikTok</div>
  <nav>
    <button onclick="prev()">← Previous</button>
    <button onclick="next()">Next →</button>
  </nav>
  <script>
    let cur = 0;
    const total = ${slides.length};
    function show(n) {
      document.querySelectorAll('.slide').forEach((s, i) => s.style.display = i === n ? 'flex' : 'none');
      document.getElementById('progress').style.width = ((n+1)/total*100) + '%';
    }
    function next() { if (cur < total - 1) show(++cur); }
    function prev() { if (cur > 0) show(--cur); }
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'Space') next();
      if (e.key === 'ArrowLeft') prev();
    });
  <\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Lecture_Slides_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const showDifficulty = [
    "Generate Exam",
    "Generate Quiz",
    "Practice Problems",
  ].includes(selectedMode);
  const gradient =
    modeGradients[selectedMode] || "from-cyan-500/20 to-blue-500/10";
  const borderColor = modeBorderColors[selectedMode] || "border-cyan-500/30";
  const buttonGradient =
    modeButtonColors[selectedMode] ||
    "from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25";

  return (
    <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <header
        className={`border-b border-slate-800 bg-gradient-to-r ${gradient} backdrop-blur-sm px-8 py-5`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-700/50">
            {modeIcons[selectedMode]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{selectedMode}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {modeDescriptions[selectedMode]}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-0">
        {/* Left Panel */}
        <div className="w-80 border-r border-slate-800 flex flex-col gap-4 p-5 overflow-y-auto bg-slate-900/30">
          {/* File Upload Zone */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">
              Upload PDF
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-cyan-400 bg-cyan-500/10"
                  : uploadedFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : `${borderColor} bg-slate-900/50 hover:bg-slate-800/50`
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileUpload(e.target.files[0])
                }
                className="hidden"
                accept=".pdf"
              />
              <div className="flex flex-col items-center justify-center gap-2 py-6 px-4">
                {uploadedFile ? (
                  <>
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <FileText size={20} className="text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-emerald-400 truncate max-w-[180px]">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors mt-1"
                    >
                      <X size={12} /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                      <Upload size={18} className="text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-300">
                        {isDragging ? "Drop it here!" : "Drop PDF here"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        or click to browse • Max 20MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Text Input */}
          <div className="flex-1 flex flex-col mt-4">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">
              {selectedMode === "Solve Assignment"
                ? "Paste Guidelines / Rubric"
                : "Paste Text / Notes"}
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                selectedMode === "Solve Assignment"
                  ? "Paste your exact assignment instructions, grading rubric, or formatting requirements here..."
                  : "Paste your lecture notes, textbook content, code, or any study material here..."
              }
              className={`flex-1 min-h-[140px] bg-slate-900/60 border rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 resize-none focus:outline-none transition-all ${borderColor} focus:ring-1 focus:ring-cyan-500/30`}
            />
            {textInput && (
              <p className="text-[10px] text-slate-600 text-right mt-1">
                {textInput.length.toLocaleString()} chars
              </p>
            )}
          </div>

          {/* Difficulty (conditional) */}
          {showDifficulty && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["easy", "medium", "hard", "expert"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                      difficulty === d
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                        : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className={`w-full bg-gradient-to-r ${buttonGradient} disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg text-sm mt-auto`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap size={16} />
                Generate with Study Buddy
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Output */}
        <div
          className={`flex flex-col min-w-0 bg-slate-950 transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50" : "flex-1 relative"}`}
        >
          {/* Output Toolbar */}
          {output && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/40">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden sm:inline-block">
                Generated Output
              </span>
              <div className="flex items-center gap-2 ml-auto">
                {/* Save to Library button */}
                {currentId && details && !details.isSaved && !showSaveForm && (
                  <button
                    onClick={() => setShowSaveForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium transition-colors border border-cyan-500/30"
                  >
                    <Bookmark size={12} />
                    Save to Library
                  </button>
                )}
                {details?.isSaved && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700/50">
                    <Check size={12} className="text-emerald-400" />
                    Saved
                  </span>
                )}

                {/* Fullscreen button */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-medium transition-colors border border-slate-700"
                >
                  {isFullscreen ? (
                    <Minimize2 size={12} />
                  ) : (
                    <Maximize2 size={12} />
                  )}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-medium transition-colors border border-slate-700"
                >
                  {copied ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>

                {/* Export button */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-medium transition-colors border border-slate-700"
                  >
                    {isExporting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Download size={12} />
                    )}
                    Export
                    <ChevronDown size={10} />
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                      <button
                        onClick={exportAsMarkdown}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                      >
                        <FileText size={13} className="text-cyan-400" />
                        Export as Markdown
                      </button>
                      <button
                        onClick={exportAsTxt}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                      >
                        <FileDown size={13} className="text-emerald-400" />
                        Export as TXT
                      </button>
                      <button
                        onClick={exportAsPDF}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-red-400 transition-colors"
                      >
                        <FileText size={13} className="text-red-400" />
                        Export as PDF
                      </button>
                      <button
                        onClick={exportAsDoc}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-blue-400 transition-colors"
                      >
                        <FileText size={13} className="text-blue-400" />
                        Export as DOCX
                      </button>
                      <button
                        onClick={exportAsImage}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-violet-400 transition-colors"
                      >
                        <ImageIcon size={13} className="text-violet-400" />
                        Export as Image
                      </button>
                      {selectedMode === "Lecture Slides" &&
                        slides.length > 0 && (
                          <>
                            <div className="border-t border-slate-700 my-1" />
                            <button
                              onClick={() => {
                                exportAsPresentation();
                                setShowExportMenu(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-sky-400 transition-colors"
                            >
                              <MonitorPlay size={13} className="text-sky-400" />
                              Export Presentation ✨
                            </button>
                          </>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Library Save Form Inline */}
          {showSaveForm && !details?.isSaved && (
            <div className="bg-slate-900 border-b border-slate-800 p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Document Title (e.g. Bio Midterm Notes)"
                  value={saveForm.title}
                  onChange={(e) =>
                    setSaveForm({ ...saveForm, title: e.target.value })
                  }
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Course (Optional)"
                  value={saveForm.course}
                  onChange={(e) =>
                    setSaveForm({ ...saveForm, course: e.target.value })
                  }
                  className="w-full md:w-40 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Year (Optional)"
                  value={saveForm.year}
                  onChange={(e) =>
                    setSaveForm({ ...saveForm, year: e.target.value })
                  }
                  className="w-full md:w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSaveToLibrary}
                  disabled={isSaving}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Library size={14} />
                  )}
                  Save
                </button>
                <button
                  onClick={() => setShowSaveForm(false)}
                  className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Output Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            {isProcessing ? (
              /* Loading Skeleton */
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-800/60 rounded-lg w-full" />
                <div className="h-4 bg-slate-800/60 rounded-lg w-5/6" />
                <div className="h-4 bg-slate-800/60 rounded-lg w-4/6" />
                <div className="h-6 bg-slate-800 rounded-lg w-2/4 mt-6" />
                <div className="h-4 bg-slate-800/60 rounded-lg w-full" />
                <div className="h-4 bg-slate-800/60 rounded-lg w-3/4" />
                <div className="h-24 bg-slate-800/40 rounded-xl mt-4" />
                <div className="h-4 bg-slate-800/60 rounded-lg w-5/6" />
                <div className="h-4 bg-slate-800/60 rounded-lg w-2/3" />
              </div>
            ) : output ? (
              selectedMode === "Adaptive Tutor" ? (
                <AdaptiveLearningArea diagnosticContent={output} contextText={contextText} />
              ) : selectedMode === "Generate Flashcards" ? (
                <FlashcardsUI rawOutput={output} />
              ) : selectedMode === "Generate Quiz" ? (
                <QuizUI rawOutput={output} />
              ) : selectedMode === "Concept Map" ? (
                <ConceptMapUI rawOutput={output} />
              ) : selectedMode === "Lecture Slides" && slides.length > 0 ? (
                <div className="flex flex-col h-full">
                  {/* Slide Stage */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-3xl">
                      {/* Slide Card */}
                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-sky-500/20 rounded-2xl p-8 shadow-2xl shadow-sky-500/10 min-h-[320px] flex flex-col">
                        {/* Slide count badge */}
                        <div className="absolute top-4 right-5 text-[10px] text-slate-500 font-mono">
                          {currentSlide + 1} / {slides.length}
                        </div>
                        {/* Title */}
                        <h2 className="text-2xl font-extrabold mb-5 bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent leading-tight pr-12">
                          {slides[currentSlide]?.title}
                        </h2>
                        {/* Body — smart block renderer */}
                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                          {(() => {
                            const body = slides[currentSlide]?.body || "";
                            const blocks: Array<
                              | { type: "code"; lang: string; code: string }
                              | { type: "bullet"; text: string }
                              | { type: "text"; text: string }
                            > = [];

                            // Parse the body into blocks
                            const lines = body.split("\n");
                            let i = 0;
                            while (i < lines.length) {
                              const line = lines[i];
                              // Fenced code block
                              if (line.trim().startsWith("```")) {
                                const lang =
                                  line.trim().replace(/^```/, "").trim() ||
                                  "code";
                                const codeLines: string[] = [];
                                i++;
                                while (
                                  i < lines.length &&
                                  !lines[i].trim().startsWith("```")
                                ) {
                                  codeLines.push(lines[i]);
                                  i++;
                                }
                                blocks.push({
                                  type: "code",
                                  lang,
                                  code: codeLines.join("\n"),
                                });
                              } else if (line.trim().startsWith("-")) {
                                blocks.push({
                                  type: "bullet",
                                  text: line
                                    .replace(/^-\s*/, "")
                                    .replace(/\*\*(.*?)\*\*/g, "$1"),
                                });
                              } else if (line.trim()) {
                                blocks.push({
                                  type: "text",
                                  text: line.replace(/\*\*(.*?)\*\*/g, "$1"),
                                });
                              }
                              i++;
                            }

                            return (blocks as any[]).map(
                              (block: any, idx: number) => {
                                if (block.type === "code") {
                                  return (
                                    <div
                                      key={idx}
                                      className="rounded-xl overflow-hidden border border-slate-700/60"
                                    >
                                      <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 border-b border-slate-700/60">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                                        <span className="text-[10px] text-slate-500 ml-1 font-mono">
                                          {block.lang}
                                        </span>
                                      </div>
                                      <pre className="bg-slate-950 text-emerald-300 text-xs p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
                                        {block.code}
                                      </pre>
                                    </div>
                                  );
                                }
                                if (block.type === "bullet") {
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-3 bg-white/5 border-l-2 border-sky-400 rounded-lg px-4 py-2.5"
                                    >
                                      <span className="text-sm text-slate-200 leading-relaxed">
                                        {block.text}
                                      </span>
                                    </div>
                                  );
                                }
                                return (
                                  <p
                                    key={idx}
                                    className="text-sm text-slate-400 leading-relaxed"
                                  >
                                    {block.text}
                                  </p>
                                );
                              },
                            );
                          })()}
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between mt-5">
                        <button
                          onClick={() =>
                            setCurrentSlide((s) => Math.max(0, s - 1))
                          }
                          disabled={currentSlide === 0}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium border border-slate-700"
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>

                        {/* Dot indicators */}
                        <div className="flex gap-1.5">
                          {slides.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentSlide(i)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                i === currentSlide
                                  ? "bg-sky-400 w-5"
                                  : "bg-slate-600 hover:bg-slate-500"
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentSlide((s) =>
                              Math.min(slides.length - 1, s + 1),
                            )
                          }
                          disabled={currentSlide === slides.length - 1}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Markdown Output */
                <div ref={outputRef} className="bg-slate-950 p-2">
                  <div
                    className="markdown-output max-w-none text-sm"
                    dangerouslySetInnerHTML={{
                      __html: marked(output) as string,
                    }}
                  />
                </div>
              )
            ) : (
              /* Empty State */
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">
                    Ready to Generate
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Upload a PDF or paste your notes on the left, then hit
                    <span className="text-cyan-400 font-medium">
                      {" "}
                      Generate with Panda
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {[
                      "📚 Structured Notes",
                      "📝 Exam Questions",
                      "🎯 Quiz MCQs",
                      "⚡ Quick Summary",
                      "🗂️ Generate Flashcards",
                      "🧠 Adaptive Tutor",
                    ].map((tip) => (
                      <div
                        key={tip}
                        className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-400"
                      >
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
