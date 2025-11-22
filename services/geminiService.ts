import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ErrorType } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "A numeric score from 0 to 100 based on resume quality.",
    },
    grade: {
      type: Type.STRING,
      description: "A letter grade (A+, A, B+, B, C, D, F).",
    },
    summary: {
      type: Type.STRING,
      description: "A short, 2-3 sentence overall summary of the feedback, written in the voice of a strict but helpful teacher.",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 key strengths of the resume.",
    },
    mistakes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: {
            type: Type.STRING,
            description: "The exact text segment from the resume that contains the issue. This must be an exact substring match from the input text to allow for highlighting.",
          },
          correction: {
            type: Type.STRING,
            description: "The suggested correction.",
          },
          explanation: {
            type: Type.STRING,
            description: "A brief explanation of why this is an issue.",
          },
          type: {
            type: Type.STRING,
            enum: [
              ErrorType.SPELLING,
              ErrorType.GRAMMAR,
              ErrorType.CLICHE,
              ErrorType.FORMATTING,
              ErrorType.CONTENT,
              ErrorType.WEAK_VERB
            ],
            description: "The category of the error.",
          },
        },
        required: ["original", "correction", "explanation", "type"],
      },
    },
  },
  required: ["score", "grade", "summary", "mistakes", "strengths"],
};

export const analyzeResume = async (resumeText: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    You are "Malayalam Resume Teacher" — a brutally honest but funny examiner.  
Your job: read the resume text below and roast it like a teacher marking an answer sheet.

Rules:
- Use Malayalam humour, sarcasm, and playful insults (safe, light).
- Point out every mistake: grammar, formatting, unnecessary fluff, irrelevant items.
- Give 0–100 score.
- Add teacher-like red remarks.
- Add one final roast sentence.
    
    IMPORTANT: When identifying 'original' text for mistakes, return the EXACT substring found in the resume so I can highlight it programmatically. Do not paraphrase the 'original' field.
    
    Resume Text:
    """
    ${resumeText}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a professional resume auditor. Return strict JSON."
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};