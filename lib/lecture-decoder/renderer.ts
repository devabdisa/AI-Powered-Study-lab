import {
  LectureDecoderViews,
  MergedLectureArtifact,
} from "@/lib/lecture-decoder/schemas";

function list(items: string[]): string {
  if (items.length === 0) return "- None detected";
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildLectureViews(
  artifact: MergedLectureArtifact,
): LectureDecoderViews {
  const learn = `
## Lecture Overview
${artifact.lectureOverview}

## Core Concepts
${artifact.coreConcepts
  .map(
    (concept) =>
      `- **${concept.name}** (${concept.examPriority})\n  ${concept.explanation}\n  Why it matters: ${concept.whyItMatters}`,
  )
  .join("\n") || "- None"}

## Definitions and Rules
${artifact.keyDefinitions
  .map((d) => `- **${d.term}**: ${d.meaning}`)
  .join("\n") || "- None"}

## Why These Concepts Matter
${list(artifact.whyConceptsMatter)}

## Examples
${artifact.examples
  .map((example) => `- **${example.title}**: ${example.walkthrough}`)
  .join("\n") || "- None"}
`.trim();

  const revise = `
## High-Yield Exam Topics
${list(artifact.highYieldExamTopics)}

## Quick Revision Sheet
${list(artifact.quickRevisionSheet)}

## Common Confusion Points
${list(artifact.commonConfusionPoints)}

## Unclear or Missing Source Areas
${artifact.uncertaintyFlags
  .map(
    (flag) =>
      `- **Issue:** ${flag.issue}\n  Source hint: ${flag.sourceHint}\n  Action: ${flag.recommendedAction}`,
  )
  .join("\n") || "- None"}
`.trim();

  const test = `
## Self-Test Questions
${artifact.selfTestQuestions
  .map(
    (q, index) =>
      `### Q${index + 1} (${q.difficulty})\n${q.question}\n\n<details><summary>Answer</summary>\n\n${q.answer}\n\n</details>`,
  )
  .join("\n\n")}
`.trim();

  const deepDive =
    artifact.subjectLabel === "technical"
      ? `
## Formula Explanations
${list(artifact.technicalDetails?.formulaExplanations ?? [])}

## Derivation Intuition
${list(artifact.technicalDetails?.derivationIntuition ?? [])}

## Code Snippet Explanations
${list(artifact.technicalDetails?.codeSnippetExplanations ?? [])}

## Worked Examples
${list(artifact.technicalDetails?.workedExamples ?? [])}

## Algorithm Steps
${list(artifact.technicalDetails?.algorithmSteps ?? [])}

## Common Mistakes and Edge Cases
${list(artifact.technicalDetails?.commonMistakesAndEdgeCases ?? [])}
`.trim()
      : `
## Key Themes
${list(artifact.generalDetails?.keyThemes ?? [])}

## Comparisons
${list(artifact.generalDetails?.comparisons ?? [])}

## Chronology
${list(artifact.generalDetails?.chronology ?? [])}

## Cause and Effect
${list(artifact.generalDetails?.causeEffect ?? [])}

## Argument Structure
${list(artifact.generalDetails?.argumentStructure ?? [])}

## Likely Essay Angles
${list(artifact.generalDetails?.likelyEssayAngles ?? [])}
`.trim();

  return { learn, revise, test, deepDive };
}

