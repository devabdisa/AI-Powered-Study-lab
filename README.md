# 🎓 Study Buddy: AI-Powered Study Lab for University Students

> A futuristic, full-stack AI platform designed to transform how university students study. From converting heavy PDF lecture slides into interactive exams to generating flashcards and conceptual maps instantly.

<div align="center">
  <img src="/public/readmescreenshot/generate note page.png" alt="Study Buddy Dashboard Summary" width="800" />
</div>

## ✨ Core Functionality & Features

Study Buddy is built to be the ultimate universally flexible study companion. Rather than just offering a chat interface ("like ChatGPT"), it serves as a strict document and study-material generator specifically engineered to output high-quality, formatted educational content.

### 🧠 10 Specialized Study Modes

The application features a heavily engineered prompt architecture ensuring distinct, structured outputs for every study need:

1. **📚 Structured Notes:** Transforms raw text/PDFs into beginner-friendly, beautifully formatted Markdown notes with complete _Learning Objectives_, _Real-Life Examples_, and _Quick Tests_.
2. **📝 Exam Questions:** Acts as a university professor to generate full exams containing True/False, Multiple Choice, Fill in the Blanks, and Short Essay questions (with answer keys hidden in collapsible HTML details tags).
3. **🎯 Multiple Choice Quiz:** Generates highly interactive 10-question quizzes specifically checking for deep conceptual understanding rather than simple memorization.
4. **⚡ Quick Summary:** A "last-minute revision" engine generating punchy bullet points, key terms, quick facts, and exam traps.
5. **💻 Code Explanation:** Breaks down complex code blocks line-by-line, providing real-world analogies, internal workflow logic, and common rookie mistakes.
6. **🏋️ Practice Problems:** Creates 5 progressive difficulty coding/math problems with comprehensive hidden solutions.
7. **🎓 Solve Assignment:** An academic assistant mode designed to rigorously answer specific assignment questions comprehensively based on attached rubrics.
8. **🎨 Lecture Slides:** Generates a strict 8-14 slide presentation format complete with a dedicated human-lecturer voice and at least 40% code-blocks (if analyzing technical topics).
9. **🗂️ Flashcards:** Automatically generates 20 high-yield front/back flashcards for rapid spaced-repetition studying.
10. **🗺️ Concept Map:** Processes complex texts and returns a visual, hierarchical ASCII tree mapped to core and sub-concepts.

### 📄 Universal File & Input Parsing

- **PDF Parsing Engine:** Users can upload lengthy university PDF slides or lecture notes. The app extracts the text entirely client-side using `pdf-parse` before passing it securely to the AI.
- **Raw Text Input:** Dedicated expandable text areas for quick copy-pasting of website text or loose notes.

### ⬇️ Seamless Universal Exporting

Students don't just read in the app—they can take their study materials anywhere. The custom output UI natively supports exporting generated content into:

- **Markdown (`.md`)**
- **Microsoft Word (`.docx`)**
- **PDF (`.pdf` via jsPDF and html2canvas)**
- **Direct Clipboard Copying**

### 🎨 Dark "Ethio Panda" Cyber Aesthetic

- The UI features a masterclass modern dark mode (Slate-950) relying on **Tailwind CSS v4**.
- Components utilize "glassmorphism" (`backdrop-blur`, subtle borders) and dynamic gradients (Cyan & Blue).
- Interactive **Framer Motion** bento-grid layouts for landing pages and dashboard rendering.

---

## 🛠 Tech Stack

**Study Buddy** is built using the bleeding-edge React and Next.js ecosystem to ensure lightning-fast serverless execution and beautiful client experiences.

### Frontend

- **Framework:** Next.js 16.1.6 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Components:** Radix UI primitives & custom Shadcn-inspired architecture
- **Animations:** Framer Motion (`framer-motion`) & Tailwind-Animate
- **Icons:** Lucide React

### Backend & Database

- **Database:** PostgreSQL (Hosted on **Neon DB**)
- **ORM:** Prisma Client (`@prisma/client`, `@prisma/adapter-pg`)
- **Authentication & Forms:** React Hook Form + Zod validation
- **AI Engine:** Google Gemini AI API (`@google/generative-ai`) utilizing `gemini-2.5-flash` for complex reasoning.

---

## 🏗 System Architecture & The "Prompt Engine"

At the core of Study Buddy is its highly engineered **Typescript Prompt Builder Architecture**.

Instead of relying on random AI generations, the system relies on immutable Base Rules, Topic Generators, and strict Length Controllers.

```typescript
// Example: The engine forces every generation to follow these non-negotiable rules
export const BASE_RULES = \`
Core Rules:
1. Do NOT invent information. Only use concepts present in the provided content.
2. Cover ALL major topics from the provided content.
3. Never mention that you are an AI.
4. Write like a human instructor.
\`;
```

Every generation passes through an `as const` mapped object of Prompt Builders `promptBuilders: Record<StudyMode, function>`, injecting difficulty modifiers dynamically before successfully hitting the Gemini 1.5 Pro inference endpoints.

---

## 🏃 How to Run Locally (Source Code)

Want to run your own Study Buddy? It's completely open source and ready to fork!

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/your-username/study-buddy.git
cd study-buddy
\`\`\`

### 2. Install dependencies

Ensure you are using Node.js v22+ and `pnpm`/`npm`.
\`\`\`bash
pnpm install
\`\`\`

### 3. Set up your Environment Variables

Create a \`.env\` file in the root directory and add the following keys:
\`\`\`env

# You can get a free API key from Google AI Studio

NEXT_PUBLIC_GEMINI_API_KEY="your_google_gemini_api_key"

# You can spin up a free PostgreSQL database on Neon.tech

DATABASE_URL="postgresql://username:password@ep-cool-cloud.us-east-2.aws.neon.tech/neondb?sslmode=require"
\`\`\`

### 4. Initialize the Database

Push the Prisma schema to your newly created Neon Database.
\`\`\`bash
npx prisma db push
\`\`\`

### 5. Start the Development Server

\`\`\`bash
pnpm run dev
\`\`\`
Visit \`http://localhost:3000\` to see the highly animated landing page, or go straight to \`/dashboard\` to start uploading PDFs!

---

<div align="center">
  <i>Developed to revolutionize studying. Happy hacking!</i>
</div>
