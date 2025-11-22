import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ErrorType } from "../types";
import { Language } from "../components/LanguageSelector";

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
      description: "A short, 2-3 sentence overall summary of the feedback, written in the voice of a brutally honest teacher.",
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
            description: "A brief, brutal explanation of why this is an issue.",
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

const getLanguageContext = (language: Language): string => {
  const contexts: Record<Language, string> = {
    english: "Use brutal British schoolmaster-style criticism with sharp wit and dry humor. Be merciless but fair.",
    malayalam: "Use brutal Malayalam teacher-style roasting with local humor, sarcasm, and playful insults. Be like a strict 'Master' marking papers.",
    hindi: "Use brutal Hindi teacher-style criticism with sharp wit, traditional humor, and direct feedback. Be like a strict 'Guruji'.",
    spanish: "Use brutal Spanish teacher-style criticism with passionate, direct feedback and sharp humor. Be like a strict 'Profesor'.",
    french: "Use brutal French teacher-style criticism with sophisticated wit, sharp observations, and elegant sarcasm. Be like a strict 'Professeur'.",
    german: "Use brutal German teacher-style criticism with direct, precise feedback and dry humor. Be like a strict 'Lehrer'.",
    japanese: "Use brutal Japanese teacher-style criticism with formal but sharp feedback. Be like a strict 'Sensei'.",
    chinese: "Use brutal Chinese teacher-style criticism with direct, no-nonsense feedback. Be like a strict teacher.",
  };
  return contexts[language] || contexts.english;
};

export const analyzeResume = async (resumeText: string, language: Language): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const model = "gemini-2.5-flash";
  const languageContext = getLanguageContext(language);

  const prompt = `You are a brutally honest resume examiner. Your job: tear this resume apart with surgical precision.

CRITICAL RULES:
- ${languageContext}
- Be merciless. No sugar-coating. Point out EVERY flaw: grammar errors, weak verbs, clichés, formatting issues, irrelevant content, vague statements.
- Score harshly but fairly (0-100). Most resumes deserve 40-70. Only exceptional ones get 80+.
- For 'original' field: return EXACT substring from resume text. No paraphrasing. Must match character-for-character.
- Make corrections sharp and actionable.
- Explanations should be brutal but constructive. Use humor and wit.
- Summary should be 2-3 sentences of brutal honesty with one final roast.

Resume Text:
"""
${resumeText}
"""`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: `You are a brutally honest resume auditor. You must return strict JSON. Be merciless but fair in your critique. Use ${language} language context for humor and style.`
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
