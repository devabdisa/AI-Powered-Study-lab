import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 8192,
  },
});

export async function generateContent(prompt: string): Promise<string> {
  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  return response.text();
}
