import { GoogleGenAI, Type } from "@google/genai";
import { GrinchQuote } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FALLBACK_QUOTES: GrinchQuote[] = [
  { text: "Hate, hate, hate. Double hate. Loathe entirely!", mood: "angry" },
  { text: "I must find some way to stop Christmas from coming!", mood: "scheming" },
  { text: "Maybe Christmas doesn't come from a store.", mood: "slightly-touched" },
  { text: "Am I just eating because I'm bored?", mood: "annoyed" },
  { text: "Help me... I'm feeling.", mood: "slightly-touched" },
  { text: "Blast this Christmas music! It's joyful and triumphant.", mood: "angry" },
  { text: "One man's toxic sludge is another man's potpourri.", mood: "scheming" },
  { text: "6:30, dinner with me. I can't cancel that again.", mood: "annoyed" },
  { text: "The nerve of those Whos. Inviting me down there.", mood: "angry" },
  { text: "I'm all toasty inside. And I'm leaking.", mood: "slightly-touched" },
  { text: "It's because I'm green, isn't it?", mood: "annoyed" },
  { text: "MAX! Fetch me my sedative.", mood: "annoyed" }
];

export const generateGrinchQuote = async (context: string = "general"): Promise<GrinchQuote> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are The Grinch. Generate a short, cynical, witty, or grumpy quote about Christmas, winter, or the current situation (${context}). 
      Keep it under 20 words. 
      The mood should vary between annoyed, angry, scheming, or rarely, slightly touched (if the heart is growing).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The Grinch's quote",
            },
            mood: {
              type: Type.STRING,
              enum: ['annoyed', 'angry', 'scheming', 'slightly-touched'],
              description: "The mood of the quote",
            },
          },
          required: ["text", "mood"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }
    return JSON.parse(text) as GrinchQuote;
  } catch (error: any) {
    // Check if it's a rate limit error to avoid spamming the console
    const isRateLimit = error?.status === 429 || 
                        error?.message?.includes('429') || 
                        error?.status === 'RESOURCE_EXHAUSTED';

    if (isRateLimit) {
      console.warn("Grinch quota exceeded (429). Switching to cached grumpiness.");
    } else {
      console.error("Failed to generate Grinch quote:", error);
    }
    
    // Return a random fallback quote so the UI never breaks
    const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
    return FALLBACK_QUOTES[randomIndex];
  }
};