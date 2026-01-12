
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  /**
   * Refactored to create fresh GoogleGenAI instance right before API calls
   * to ensure latest API key and configuration usage.
   */

  async getBookRecommendation(query: string, currentCatalog: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User asks: "${query}". \n\nOur current library catalog: ${currentCatalog}. \n\nAct as a helpful librarian. Suggest 1-2 books from our catalog if relevant, or suggest a new book we should buy for our collection if nothing matches. Keep it friendly and concise.`,
      config: {
        temperature: 0.7,
      }
    });
    // The .text property is used to extract the content string.
    return response.text;
  }

  async analyzeBookDetails(description: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this book description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genre: { type: Type.STRING },
            summary: { type: Type.STRING },
            readingLevel: { type: Type.STRING },
            potentialThemes: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["genre", "summary", "readingLevel", "potentialThemes"]
        }
      }
    });
    // Extracting JSON string and parsing.
    return JSON.parse(response.text || '{}');
  }
}
