export interface TestOption {
  id: 'A' | 'B' | 'C' | 'D' | string;
  text: string;
}

export interface TestQuestion {
  id: number;
  questionId?: string;
  question: string;
  sidebarTitle: string;
  options: TestOption[];
  correctAnswer?: string;
  explanation?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  marksAwarded?: number;
  marks?: number;
  order?: number;
  status?: QuestionStatus;
}

export interface TestItem {
  id: string;
  _id?: string;
  title: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  isLocked?: boolean;
  category: string;
  board?: string;
  classLevel?: string;
  subject?: string;
  questions?: TestQuestion[];
  isUntimed?: boolean;
}

export type QuestionStatus = 'attempted' | 'revise' | 'skipped';

export interface TestResult {
  attemptId?: string;
  testId: string;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  accuracy?: number;
  attempted: number;
  correct: number;
  incorrect: number;
  reviseLater: number;
  skipped: number;
  timeSpentSeconds: number;
  completedAt?: string | Date;
  answers: Record<number | string, string>;
  statusByQuestion: Record<number | string, QuestionStatus>;
  questions: TestQuestion[];
}
