export enum ErrorType {
  SPELLING = 'Spelling',
  GRAMMAR = 'Grammar',
  CLICHE = 'Cliché',
  FORMATTING = 'Formatting',
  CONTENT = 'Content',
  WEAK_VERB = 'Weak Verb'
}

export interface Mistake {
  original: string;
  correction: string;
  explanation: string;
  type: ErrorType;
}

export interface AnalysisResult {
  score: number;
  grade: string;
  summary: string;
  mistakes: Mistake[];
  strengths: string[];
}

export interface ResumeData {
  text: string;
  analysis: AnalysisResult | null;
}