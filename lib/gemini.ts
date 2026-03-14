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

/**
 * Executes a prompt but forces the Gemini API to respond exclusively
 * with a valid JSON string (responseMimeType: "application/json").
 */
export async function generateJsonResponse(prompt: string): Promise<string> {
  const jsonModel = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });
  const result = await jsonModel.generateContent(prompt);
  return result.response.text();
}
