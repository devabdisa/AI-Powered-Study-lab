"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MainArea from "@/components/MainArea";
import LibraryDashboard from "@/components/LibraryDashboard";
import LectureDecoderStudio from "@/components/LectureDecoderStudio";

interface DecoderHistoryPayload {
  jobId: string;
  status: "completed" | "partial" | "failed";
  subjectLabel: "technical" | "general" | "mixed";
  artifact: unknown;
  views: {
    learn: string;
    revise: string;
    test: string;
    deepDive: string;
  } | null;
}

export default function DashboardPage() {
  const [selectedMode, setSelectedMode] = useState<string>("Lecture Decoder");
  const [output, setOutput] = useState<string>("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [decoderPayload, setDecoderPayload] =
    useState<DecoderHistoryPayload | null>(null);
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
          lecture_decoder_v2: "Lecture Decoder",
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
        if (data.generation.mode === "lecture_decoder_v2") {
          try {
            const parsed = JSON.parse(data.generation.output) as Partial<DecoderHistoryPayload>;
            if (
              parsed &&
              typeof parsed.jobId === "string" &&
              typeof parsed.status === "string" &&
              typeof parsed.subjectLabel === "string"
            ) {
              setDecoderPayload({
                jobId: parsed.jobId,
                status: parsed.status as DecoderHistoryPayload["status"],
                subjectLabel:
                  parsed.subjectLabel as DecoderHistoryPayload["subjectLabel"],
                artifact: parsed.artifact ?? null,
                views: parsed.views ?? null,
              });
            } else {
              setDecoderPayload(null);
            }
            setOutput("");
          } catch {
            setDecoderPayload(null);
            setOutput(data.generation.output);
          }
        } else {
          setDecoderPayload(null);
          setOutput(data.generation.output);
        }
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
          if (mode !== "Library Dashboard") {
            if (mode !== "Lecture Decoder") {
              setDecoderPayload(null);
            }
            setOutput("");
            setCurrentId(null);
            setDetails({ title: null, course: null, year: null, isSaved: false });
          }
        }}
        onLoadHistory={handleLoadHistory}
        refreshTrigger={refreshHistory}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {selectedMode === "Library Dashboard" ? (
          <LibraryDashboard 
            refreshTrigger={refreshHistory} 
            onLoadItem={handleLoadHistory} 
          />
        ) : selectedMode === "Lecture Decoder" ? (
          <LectureDecoderStudio
            initialPayload={decoderPayload}
            onSaveSuccess={() => setRefreshHistory((prev) => prev + 1)}
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}
