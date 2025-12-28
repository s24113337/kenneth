
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameCommentary = async (score: number, difficulty: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player just scored ${score} points on ${difficulty} difficulty in the Neon Night Market. 
      Act as a street food vendor from the night market. Give them a cool nickname and a short, 
      funny arcade-style shoutout (max 20 words). Examples: "Neon Ninja", "Dumpling Defender".`,
    });
    // Correctly accessing the text property from the response.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The market is safe... for now! Great job!";
  }
};
