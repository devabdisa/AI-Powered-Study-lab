"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MainArea from "@/components/MainArea";

export default function DashboardPage() {
  const [selectedMode, setSelectedMode] = useState<string>("Generate Notes");
  const [output, setOutput] = useState<string>("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [details, setDetails] = useState<{
    title: string | null;
    course: string | null;
    year: string | null;
    isSaved: boolean;
  }>({ title: null, course: null, year: null, isSaved: false });
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleLoadHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`);
      const data = await res.json();
      if (data.generation) {
        // Map mode id back to label
        const modeLabels: Record<string, string> = {
          notes: "Generate Notes",
          exam: "Generate Exam",
          quiz: "Generate Quiz",
          summary: "Summarize",
          code: "Explain Code",
          practice: "Practice Problems",
          assignment: "Solve Exam/Assignment",
          slides: "Lecture Slides",
        };
        setSelectedMode(modeLabels[data.generation.mode] || "Generate Notes");
        setOutput(data.generation.output);
        setCurrentId(data.generation.id);
        setDetails({
          title: data.generation.title,
          course: data.generation.course,
          year: data.generation.year,
          isSaved: data.generation.isSaved,
        });
      }
    } catch (e) {
      console.error("Failed to load history item", e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar
        selectedMode={selectedMode}
        onSelectMode={(mode) => {
          setSelectedMode(mode);
          setOutput("");
          setCurrentId(null);
          setDetails({ title: null, course: null, year: null, isSaved: false });
        }}
        onLoadHistory={handleLoadHistory}
        refreshTrigger={refreshHistory}
      />
      <MainArea
        selectedMode={selectedMode}
        output={output}
        setOutput={setOutput}
        currentId={currentId}
        setCurrentId={setCurrentId}
        details={details}
        setDetails={setDetails}
        onSaveSuccess={() => setRefreshHistory((prev) => prev + 1)}
      />
    </div>
  );
}
