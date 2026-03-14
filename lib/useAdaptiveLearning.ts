import { useState } from "react";

export type AdaptiveState = 
  | "IDLE"
  | "GENERATING_DIAGNOSTIC"
  | "QUIZ_ACTIVE"
  | "EVALUATING"
  | "SHOWING_RESULTS"
  | "GENERATING_REINFORCEMENT"
  | "REINFORCEMENT_ACTIVE"
  | "COMPLETED";

export interface EvaluationResult {
  score: number;
  weak_topics: string[];
  explanations: { topic: string; explanation: string }[];
}

/**
 * A perfectly typed React Hook that acts as the core State Machine 
 * for the Adaptive Learning Mode loop.
 */
export function useAdaptiveLearning() {
  const [state, setState] = useState<AdaptiveState>("IDLE");
  
  // The raw markdown/text returned from the AI containing the 8 initial questions
  const [diagnosticContent, setDiagnosticContent] = useState<string>("");
  
  // The student's recorded answers to be sent to the AI format { question, answer }
  const [userAnswers, setUserAnswers] = useState<{ question: string; answer: string }[]>([]);
  
  // The strictly structured JSON evaluation from the AI containing weaknesses
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  
  // The raw markdown/text returned from the AI containing targeted reviews and 3 new questions
  const [reinforcementContent, setReinforcementContent] = useState<string>("");

  const reset = () => {
    setState("IDLE");
    setDiagnosticContent("");
    setUserAnswers([]);
    setEvaluation(null);
    setReinforcementContent("");
  };

  const startDiagnostic = () => setState("GENERATING_DIAGNOSTIC");
  
  const finishDiagnosticGeneration = (content: string) => {
    setDiagnosticContent(content);
    setState("QUIZ_ACTIVE");
  };

  const startEvaluation = (answers: { question: string; answer: string }[]) => {
    setUserAnswers(answers);
    setState("EVALUATING");
  };

  const finishEvaluation = (result: EvaluationResult) => {
    setEvaluation(result);
    // Adaptive Logic: If they get 8/8 (or have 0 weak topics), they automatically skip the review!
    if (result.weak_topics.length === 0 || result.score >= 8) {
      setState("COMPLETED");
    } else {
      setState("SHOWING_RESULTS");
    }
  };

  const startGeneratingReinforcement = () => setState("GENERATING_REINFORCEMENT");
  
  const finishReinforcementGeneration = (content: string) => {
    setReinforcementContent(content);
    setState("REINFORCEMENT_ACTIVE");
  };

  const completeLearning = () => setState("COMPLETED");

  return {
    state,
    diagnosticContent,
    userAnswers,
    evaluation,
    reinforcementContent,
    actions: {
      reset,
      startDiagnostic,
      finishDiagnosticGeneration,
      startEvaluation,
      finishEvaluation,
      startGeneratingReinforcement,
      finishReinforcementGeneration,
      completeLearning
    }
  };
}
