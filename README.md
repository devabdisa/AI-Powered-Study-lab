<div align="center">
  <img src="public/placeholder-logo.png" alt="Logo" width="100" />

# 🎓 AI Powered Study Lab for University Students

**A futuristic, highly interactive, and intelligent study platform designed exclusively for university students.**
Powered by **Next.js 16**, **Tailwind CSS**, **Prisma**, **Neon DB**, and **Google Gemini AI**.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4.1-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Neon DB](https://img.shields.io/badge/Neon_DB-Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-API-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## 🌟 About The Project

The **AI Powered Study Lab** is an open-source, brilliant solution intended to revolutionize how university students prepare for their courses. Forget the old ways of static notes and predictable past papers. With the power of **Google's Gemini AI**, this application enables active generation of complex study material perfectly suited to your syllabus.

Whether you need to generate deeply insightful reading notes, simulate a rigorous exam environment, or fully immerse yourself in a distraction-free study session, this is your ultimate hub.

> **Note:** This project does not currently have a live deployment link. It is proudly open-sourced for the community! I will be sharing the source code on LinkedIn so anyone can fork it, configure their own API keys, and run it independently.

---

## 🚀 Key Features

🧠 **Smart Note Generation**
Instantly generate beautifully formatted, comprehensive study notes on any university topic utilizing the Gemini AI. Save time and study smarter.

📝 **Dynamic AI Exam Generator**
Prepare for finals securely. Create fully-tailored mock exams to test your knowledge level. From multiple-choice to intensive written tasks, the AI curates the perfect challenge.

✅ **Interactive Exam Taking & Review**
Take exams directly within the platform. Check your answers instantly to track your learning progression.

📖 **Full-Screen Reading Mode**
Immersive, distraction-free reading environments that let you engage cleanly with your study material. Focus mode: ON.

🎨 **Stunning Modern UI/UX**
A breathtaking, sleek user interface forged with Radix UI, Shadcn, and Tailwind CSS. Responsive, fast, and gorgeous on every device.

---

## 📸 Screenshots

Here is a glimpse into the AI Study Lab's capabilities!

### Smart Note Generation

![Generate Note Page](public/readmescreenshot/generate%20note%20page.png)

### AI Exam Generation

![Exam Generation](public/readmescreenshot/exam%20generation%20page.png)

### Taking an Exam

![Exam Answer](public/readmescreenshot/exam%20answer.png)

### Immersive Full-Screen Reading

![Full Screen Reading](public/readmescreenshot/full%20screen%20reading.png)

---

## 🛠️ Tech Stack

- **Frontend Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Radix UI / Shadcn UI components
- **Database ORM:** [Prisma ORM](https://www.prisma.io/)
- **Database Host:** Serverless PostgreSQL via [Neon DB](https://neon.tech/)
- **AI Engine:** [Google Generative AI (Gemini API)](https://ai.google.dev/)
- **State & Form Management:** React Hook Form & Zod for schema validation
- **Animations:** Embla Carousel, Radix primitives

---

## ⚙️ Getting Started (Local Setup)

To get a local copy up and running, follow these simple steps!

### 1. Prerequisites

Make sure you have Node.js installed on your machine.

- npm
  ```sh
  npm install npm@latest -g
  ```

### 2. Clone the Repository

```sh
git clone <your-github-repo-url>
cd ai-study-lab
```

### 3. Install Dependencies

```sh
npm install
```

### 4. Setup Environment Variables

Create a `.env` file in the root directory and configure it with your credentials:

```ini
# PostgreSQL Connection String from Neon DB
DATABASE_URL="postgres://user:password@endpoint.neon.tech/dbname"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"
```

_(Grab your free Gemini API key from [Google AI Studio](https://aistudio.google.com/) and create a free serverless Postgres DB at [Neon](https://neon.tech/))_

### 5. Setup the Database

Push the Prisma schema to your connected Neon DB to spin up your tables:

```sh
npx prisma db push
npx prisma generate
```

### 6. Run the Development Server

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the Study Lab!

---

## 🤝 Fork it, Use it, Share it!

This project was built to help the student developer community.

If you found it useful from LinkedIn:

1. **Fork the Project**
2. Setup your own `GEMINI_API_KEY` and `DATABASE_URL`
3. Hit the **Star** ⭐ button if you like the app!

Happy studying and happy coding! 🚀
