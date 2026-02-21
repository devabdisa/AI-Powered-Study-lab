'use client';

import { useState } from 'react';
import { Upload, Send, Copy, Check } from 'lucide-react';

interface MainAreaProps {
  selectedMode: string;
  output: string;
  setOutput: (output: string) => void;
}

export default function MainArea({ selectedMode, output, setOutput }: MainAreaProps) {
  const [textInput, setTextInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedMode_internal, setSelectedMode_internal] = useState('standard');
  const [difficulty, setDifficulty] = useState('medium');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!textInput.trim() && !uploadedFile) {
      alert('Please provide input or upload a file');
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      const sampleOutputs: { [key: string]: string } = {
        'Generate Notes': `## Chapter 1: Fundamentals\n\n### Key Concepts\n- Understanding the core principles\n- Building foundational knowledge\n- Application scenarios\n\n### Summary Points\n1. First principle of ${selectedMode}\n2. Integration techniques\n3. Best practices\n\n*Generated with AI assistance*`,
        'Generate Exam': `## Exam Questions\n\n**Question 1:** ${selectedMode} is essential because...\nA) Option A\nB) Option B\nC) Option C\nD) Option D\n\n**Question 2:** Which of the following best describes...?\n\n**Question 3:** Explain the relationship between X and Y.\n\n*${difficulty} difficulty level selected*`,
        'Generate Quiz': `## Quick Quiz\n\n1. True or False: Statement about ${selectedMode}\n2. Multiple Choice: What is the primary purpose?\n3. Fill in the blank: The concept of ___ is fundamental.\n4. Short Answer: Define and explain.\n\nEstimated completion time: 5-10 minutes`,
        'Summarize': `## Summary\n\n${selectedMode} focuses on key points:\n\n• Point 1: Core concept explanation\n• Point 2: Related methodology\n• Point 3: Practical applications\n• Point 4: Advanced considerations\n\nLength: Concise overview (2-3 minutes read)`,
        'Explain Code': `## Code Explanation\n\n\`\`\`javascript\nfunction example() {\n  // This demonstrates the concept\n  return process(data);\n}\n\`\`\`\n\n**What it does:** Processes the input and returns the result.\n**Why it matters:** Fundamental pattern in modern development.\n**Edge cases:** Null handling, async operations.`,
        'Practice Problems': `## Practice Problems\n\n### Problem 1 (${difficulty})\nSolve: [Problem statement]\nHint: Consider the fundamental principle\n\n### Problem 2 (${difficulty})\nImplement: [Problem statement]\nConstraints: Must be efficient\n\n### Problem 3 (${difficulty})\nDesign: [Problem statement]\nRequirements: Scalable solution`,
      };

      setOutput(
        sampleOutputs[selectedMode] ||
          `Output for ${selectedMode} mode at ${difficulty} difficulty level`,
      );
      setIsProcessing(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="border-b border-cyan-900/30 bg-slate-900/50 backdrop-blur-sm px-8 py-6">
        <div className="flex justify-between items-start gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{selectedMode}</h2>
            <p className="text-sm text-slate-400">
              {uploadedFile ? (
                <>
                  📎 <span className="text-cyan-400">{uploadedFile.name}</span> loaded
                </>
              ) : (
                'Provide content or upload a file to get started'
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-hidden flex gap-6 p-8">
        {/* Left Panel - Inputs */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          {/* File Upload */}
          <div className="bg-slate-900/50 border border-cyan-900/30 rounded-lg p-4 hover:border-cyan-700/50 transition-colors">
            <label className="flex flex-col items-center justify-center gap-3 cursor-pointer py-6">
              <Upload size={24} className="text-cyan-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">Upload File</p>
                <p className="text-xs text-slate-400 mt-1">PDF, TXT, or Image</p>
              </div>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.txt,.jpg,.png,.jpeg"
              />
            </label>
          </div>

          {/* Text Input */}
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
              Text Input
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your content, questions, or code here..."
              className="flex-1 bg-slate-900/50 border border-cyan-900/30 rounded-lg p-4 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Mode Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Mode
            </label>
            <select
              value={selectedMode_internal}
              onChange={(e) => setSelectedMode_internal(e.target.value)}
              className="bg-slate-900/50 border border-cyan-900/30 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            >
              <option value="standard">Standard</option>
              <option value="advanced">Advanced</option>
              <option value="creative">Creative</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>

          {/* Difficulty Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-slate-900/50 border border-cyan-900/30 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            <Send size={18} />
            {isProcessing ? 'Processing...' : 'Generate'}
          </button>
        </div>

        {/* Right Panel - Output */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Output
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-cyan-400 text-xs font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          {/* Output Panel */}
          <div className="flex-1 bg-slate-900/50 border border-cyan-900/30 rounded-lg p-6 overflow-y-auto">
            {output ? (
              <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                {output.split('\n').map((line, idx) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-lg font-bold text-cyan-400 mt-4 mb-2">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-base font-semibold text-slate-200 mt-3 mb-1">
                        {line.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={idx} className="font-semibold text-slate-100">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  if (line.startsWith('- ') || line.startsWith('• ')) {
                    return (
                      <p key={idx} className="text-slate-300 ml-4">
                        {line}
                      </p>
                    );
                  }
                  if (line.startsWith('```')) {
                    return null;
                  }
                  if (line.trim() === '') {
                    return <br key={idx} />;
                  }
                  return (
                    <p key={idx} className="text-slate-300">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="text-4xl mb-3 opacity-50">✨</div>
                  <p className="text-sm">Your generated content will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
