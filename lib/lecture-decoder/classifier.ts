import { SubjectLabel } from "@/lib/lecture-decoder/schemas";

const technicalKeywords = [
  "algorithm",
  "complexity",
  "proof",
  "derivative",
  "integral",
  "matrix",
  "vector",
  "compiler",
  "runtime",
  "api",
  "equation",
  "theorem",
  "circuit",
  "voltage",
  "molecule",
  "stoichiometry",
  "kinematics",
  "calculus",
  "function",
  "class",
  "data structure",
  "pseudocode",
];

const generalKeywords = [
  "history",
  "society",
  "policy",
  "argument",
  "essay",
  "theme",
  "economy",
  "culture",
  "timeline",
  "case study",
  "ethics",
  "governance",
  "law",
  "market",
  "leadership",
  "psychology",
  "sociology",
];

function countKeywordHits(text: string, words: string[]): number {
  const lowered = text.toLowerCase();
  return words.reduce((acc, word) => (lowered.includes(word) ? acc + 1 : acc), 0);
}

export function classifySubject(text: string): {
  label: SubjectLabel;
  score: { technical: number; general: number };
  reason: string;
} {
  const technicalHits = countKeywordHits(text, technicalKeywords);
  const generalHits = countKeywordHits(text, generalKeywords);
  const symbolBoost =
    (text.match(/[=+\-*/^]/g)?.length ?? 0) > 20 &&
    (text.match(/[{}()[\]]/g)?.length ?? 0) > 10
      ? 4
      : 0;
  const codeBoost = /```|class\s+\w+|function\s+\w+|def\s+\w+/.test(text)
    ? 5
    : 0;

  const technical = technicalHits + symbolBoost + codeBoost;
  const general = generalHits;

  if (technical >= general + 4) {
    return {
      label: "technical",
      score: { technical, general },
      reason: "Detected technical vocabulary, notation, or code-like structure.",
    };
  }

  if (general >= technical + 4) {
    return {
      label: "general",
      score: { technical, general },
      reason: "Detected mostly thematic, argumentative, or narrative lecture language.",
    };
  }

  return {
    label: "mixed",
    score: { technical, general },
    reason: "Detected both technical and general signals in comparable amounts.",
  };
}

