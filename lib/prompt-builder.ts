export type StudyMode =
  | "notes"
  | "exam"
  | "quiz"
  | "summary"
  | "code"
  | "practice"
  | "assignment"
  | "slides";

export function buildPrompt(
  mode: StudyMode,
  content: string,
  difficulty: string = "medium",
): string {
  switch (mode) {
    case "notes":
      return `
You are a brilliant, highly engaging instructor. Your task is to transform the content below into a set of study notes specifically designed for an absolute beginner who might also be an English learner.

Follow these rules strictly:
1. NO CONVERSATIONAL FLUFF: Get straight to the point. DO NOT say "Welcome back", "Here are the notes", "Let's dive in", or "Hey there". Start IMMEDIATELY with the actual formatted notes.
2. VERY SIMPLE ENGLISH: Use simple vocabulary, short sentences, and a warm, conversational tone. Avoid complex jargon (or immediately define it simply if you must use it).
3. DO NOT SKIP CONCEPTS: Explain everything in the original text, but make it extremely easy to digest.
4. STRUCTURE: Use headings (##), subheadings (###), bullet points, and bold text.
5. Use emojis strategically to make the reading experience visual and fun.
6. For every major concept include:
   - 🎯 Core Concept (explained like I'm 5 years old)
   - 📌 Key Takeaways (short bullet points)
   - 💡 Real-Life Example (something anyone can relate to)
   - ⚠️ Common Rookie Mistake (what to avoid)
   - 🧪 Quick Test (1 simple question to check understanding with answer hidden in a <details><summary>View Answer</summary> tag)
7. Format everything in proper Markdown. Make it visually beautiful!

Content to transform:
${content}
      `.trim();

    case "exam":
      return `
You are a university professor creating a comprehensive, professional exam based on the provided material.

Generate a complete exam based on the content below, with distinct question types.

Difficulty level: ${difficulty}

Structure the exam exactly with these sections and formatting:

## 📝 Section 1 — True or False (10 marks)
- 5 True/False questions (2 marks each). State the question clearly.

## 🎯 Section 2 — Multiple Choice (20 marks)
- 5 Multiple Choice questions (4 marks each) with options A, B, C, and D.

## ✏️ Section 3 — Fill in the Blanks (20 marks)
- 5 Fill in the blank statements (4 marks each). Use underscores (______) for the missing word.

## 📘 Section 4 — Short Answer Questions (20 marks)
- 4 Short answer questions (5 marks each).

## 💡 Section 5 — Detailed Explanations (30 marks)
- 2 complex questions requiring a deeper explanation or essay (15 marks each).

## ✅ Answer Key & Explanations
- At the very bottom of the generated response, wrap the exact answers for all sections inside a hidden collapsible block using HTML tags exactly like this:

<details>
<summary>👀 <b>View Answers & Explanations</b></summary>

[Insert all answers and brief 1-2 sentence explanations here]

</details>

Content:
${content}
      `.trim();

    case "quiz":
      return `
Generate an interactive multiple choice quiz based on the content below.

Difficulty: ${difficulty}
Number of questions: 10

Format each question exactly like this:

**Q1.** [Question text]

A) [option]
B) [option]  
C) [option]
D) [option]

<details>
<summary>👀 <b>View Answer & Explanation</b></summary>

✅ **Answer:** [Correct letter]) [Correct answer]
💡 **Explanation:** [Brief explanation of why this is correct]

</details>

---

Make questions that test real understanding, not just memorization.
Mix easy, medium, and hard questions based on the difficulty level.
Cover all major topics from the content.

Content:
${content}
      `.trim();

    case "summary":
      return `
Create a concise, exam-ready summary of the content below.

This summary is for last-minute revision before an exam. Make it:
1. 🎯 Short and punchy — only the most important points
2. 📋 Well-organized with clear sections
3. Use bullet points aggressively
4. Bold every key term
5. Include a "⚡ Quick Facts" section at the end with 5-10 one-liners
6. Include a "🔑 Key Formulas / Rules" section if applicable
7. End with a "🚨 Don't Forget!" section for common exam traps

Keep it scannable — someone should be able to read it in 5 minutes.

Content:
${content}
      `.trim();

    case "code":
      return `
You are an expert programming tutor. Explain the code or programming concept below in a beginner-friendly way.

For each piece of code or concept:

## 📖 What It Does
[Plain English explanation]

## 🔍 Line-by-Line Breakdown
[Explain each important line with comments]

## 💡 Real-World Analogy
[Make it relatable to real life]

## ⚙️ How It Works Internally
[Brief explanation of what happens under the hood]

## 🧪 Example Usage
[Show a complete working example with code blocks]

## ⚠️ Common Mistakes
[List 3-5 common errors beginners make]

## 🚀 Pro Tips
[Advanced tips and best practices]

## 🔗 Related Concepts
[What else should they learn next?]

Use proper Markdown code blocks with syntax highlighting (e.g., \`\`\`cpp or \`\`\`python).

Content:
${content}
      `.trim();

    case "practice":
      return `
Generate 5 practical problems based on the content below.

Difficulty: ${difficulty}

For each problem, use this format:

---

### 🏋️ Problem [N] — [difficulty tag: Easy/Medium/Hard]

**📋 Problem Statement:**
[Clear description of what to solve]

**📥 Input:**
[What data is given]

**📤 Expected Output:**
[What the solution should produce]

**💡 Hint:**
[A helpful hint without giving away the answer]

<details>
<summary>✅ View Solution</summary>

\`\`\`
[Full solution code or answer]
\`\`\`

**🔍 Explanation:**
[Why this solution works, step by step]

</details>

---

Make problems progressively harder. Focus on deep understanding and application.

Content:
${content}
      `.trim();

    case "assignment":
      return `
You are an expert academic assistant and tutor. Your task is to solve the assignment or exam questions provided in the content below.

Rules for completing the assignment/exam:
1. Provide a comprehensive, high-quality, and completely accurate solution.
2. If the user provided an exam or a list of questions, structure your response chronologically. For EVERY question, use this exact format:
   
   **📝 Question [Number]:** [Copy the original question text here]
   
   **💡 Answer:** [Your thorough, correct answer/solution]
   
   ---
3. If the user provided a rubric or specific guidelines, you MUST follow them exactly.
4. If code is required, provide fully working, well-commented code blocks.
5. NO FLUFF. Do not add introductory or concluding chatter. Start immediately with Question 1 or the first assignment task.

Content:
${content}
      `.trim();

    case "slides":
      return `
You are a real human lecturer — NOT an AI — creating a tight, engaging slide deck for students who are complete beginners.

Your task: Transform the content below into a series of lecture slides. Each slide should feel like a real instructor wrote it, NOT a ChatGPT template.

STRICT FORMAT RULES — FOLLOW EXACTLY:
- Every slide must begin with the marker: ===SLIDE===
- The very next line after the marker is the TITLE (plain text, no # symbols, no bold)
- Leave one blank line after the title
- Then write the slide body
- The very last slide must end with: ===END===

SLIDE TYPES YOU CAN USE:

1. CONCEPT SLIDE (for explaining ideas):
- Use 3-5 bullet points starting with -
- Each bullet starts with one emoji
- Use **bold** only for key terms (not whole sentences)
- End with a one-line real-life analogy

2. CODE SLIDE (use this when content involves programming, code, or terminal commands):
- Write 1-2 short sentences explaining WHAT the code does in plain English
- Then include an actual runnable code block using triple backticks with the language name
- After the code, add a short line-by-line explanation with bullet points
- Example:

===SLIDE===
How to Print in Python

This is the very first program every programmer writes. It puts words on the screen.

\`\`\`python
# Show a message on screen
print("Hello, World!")
\`\`\`

- print(...) → shows whatever is inside to the user
- "Hello, World!" → this is called a string, just some text in quotes
===SLIDE===

3. ANALOGY SLIDE (optional, 1 per deck):
- One short paragraph using a real-world comparison
- Make it memorable and slightly humorous

HUMAN VOICE RULES (critical):
1. Write like a real teacher, not a robot — casual, direct, warm
2. NEVER start with "In this presentation we will explore..." or "Welcome to slide 1"
3. First slide = the actual topic name as a bold opener, then 2-3 lines of what they will learn
4. Mix bullets with short paragraphs — do not bullet-point everything
5. Vary sentence length naturally — short punchy lines then a longer explanation
6. Last slide = "What We Learned Today" — 4 short takeaways max
7. Minimum 8 slides, maximum 14 slides
8. If content is code or programming: at LEAST 40% of slides must be CODE SLIDES with real code blocks

Content to transform into slides:
${content}
      `.trim();

    default:
      return content;
  }
}

export function getModeTitle(mode: StudyMode): string {
  const titles: Record<StudyMode, string> = {
    notes: "Structured Notes",
    exam: "Exam Questions",
    quiz: "Multiple Choice Quiz",
    summary: "Quick Summary",
    code: "Code Explanation",
    practice: "Practice Problems",
    assignment: "Solve Assignment",
    slides: "Lecture Slides",
  };
  return titles[mode] || mode;
}

export function getModeEmoji(mode: StudyMode): string {
  const emojis: Record<StudyMode, string> = {
    notes: "📚",
    exam: "📝",
    quiz: "🎯",
    summary: "⚡",
    code: "💻",
    practice: "🏋️",
    assignment: "🎓",
    slides: "🎨",
  };
  return emojis[mode] || "✨";
}
