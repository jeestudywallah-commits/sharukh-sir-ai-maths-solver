export type SubjectType =
  | 'Arithmetic'
  | 'Algebra'
  | 'Geometry'
  | 'Trigonometry'
  | 'Coordinate Geometry'
  | 'Calculus'
  | 'Probability'
  | 'Statistics'
  | 'Matrices'
  | 'Vectors'
  | 'Physics / Numerical'
  | 'General Mathematics';

export type MethodType = 'standard' | 'quick' | 'formula' | 'graphical' | 'alternative';

export type DifficultyLevel = 'Basic' | 'Intermediate' | 'Advanced';

export interface SolutionStep {
  stepNumber: number;
  title: string;
  calculation: string;
  explanation: string;
}

export interface GraphPoint {
  label: string;
  x: number;
  y: number;
  description?: string;
}

export interface GraphData {
  hasGraph: boolean;
  type: 'function' | 'points' | 'geometry' | 'none';
  expression: string;
  domain?: [number, number];
  keyPoints?: GraphPoint[];
}

export interface SolutionMethod {
  name: string;
  description: string;
}

export interface MathSolution {
  id: string;
  subject: SubjectType;
  topic: string;
  difficulty: DifficultyLevel;
  recognizedQuestion: string;
  givenInfo: string[];
  conceptFormula: string;
  steps: SolutionStep[];
  finalAnswer: string;
  verification: string;
  learningTip: string;
  methods: SolutionMethod[];
  graphData?: GraphData;
  isVerified?: boolean;
}

export interface HistoryItem {
  id: string;
  question: string;
  recognizedQuestion: string;
  subject: SubjectType;
  topic: string;
  finalAnswer: string;
  timestamp: string;
  isFavorite?: boolean;
  solution?: MathSolution;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

export interface PracticeQuestion {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  fullExplanation: string;
}

export interface UserProfile {
  name: string;
  grade: string;
  isGuest: boolean;
  preferredSubject: string;
  streakCount: number;
  problemsSolved: number;
}
