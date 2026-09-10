export type TestCategory =
  | 'BOARD_TEST'
  | 'PRACTICE'
  | 'MOCK_EXAM'
  | 'QUIZ';

export type PracticeMode = 'revision' | 'exercise' | 'workbook' | 'homework';

export type MockExamGoal =
  | 'All'
  | 'SSC & Bank Exam'
  | 'Railway Exam'
  | 'JEE & NEET'
  | 'CBSE Board Mocks'
  | 'Defence Exams';

export type CbtQuestionStatus =
  | 'not_visited'
  | 'not_answered'
  | 'answered'
  | 'marked_for_review'
  | 'answered_and_marked';

export interface OptionItem {
  id: 'A' | 'B' | 'C' | 'D' | string;
  text: string;
}

export interface BaseQuestion {
  id: number | string;
  text: string;
  options: OptionItem[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  marks?: number;
  negativeMarks?: number;
}

// -----------------------------
// Mock Exam Types
// -----------------------------
export interface MockExamQuestion extends BaseQuestion {
  sectionId: string;
  sectionName: string;
}

export interface MockExamSection {
  id: string;
  name: string;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarks: number;
  questions: MockExamQuestion[];
}

export interface MockExamItem {
  id: string;
  title: string;
  category: MockExamGoal;
  subtitle: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  negativeMarking: boolean;
  isLocked?: boolean;
  passPercentage?: number;
  sections: MockExamSection[];
}

export interface MockExamSessionResult {
  examId: string;
  examTitle: string;
  category: MockExamGoal;
  totalMarks: number;
  score: number;
  percentage: number;
  percentile: number;
  rankEstimate: number;
  totalCandidatesEstimate: number;
  accuracy: number;
  timeSpentSeconds: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  markedReviewCount: number;
  answers: Record<string | number, string>;
  statusByQuestion: Record<string | number, CbtQuestionStatus>;
  timePerQuestion?: Record<string | number, number>;
  sectionBreakdown: {
    sectionId: string;
    sectionName: string;
    score: number;
    maxScore: number;
    attempted: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    timeSpentSeconds: number;
  }[];
  questions: MockExamQuestion[];
}

// -----------------------------
// Practice Types
// -----------------------------
export interface FlashcardItem {
  id: string;
  subject: string;
  chapter: string;
  frontTitle: string;
  frontSubtitle?: string;
  backConcept: string;
  formulaOrRule?: string;
  exampleOrNote?: string;
  isMastered?: boolean;
}

export interface ExerciseProblem extends BaseQuestion {
  subject: string;
  chapter: string;
  topic: string;
  stepByStepSolution: string[];
}

export interface WorkbookChapter {
  id: string;
  subject: string;
  chapterName: string;
  problemsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completionRate: number;
  formulaCheats: { title: string; formula: string }[];
  problems: ExerciseProblem[];
}

export interface HomeworkTask {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Reviewed';
  assignedBy: string;
  grade?: string;
  feedback?: string;
  questions: ExerciseProblem[];
}

// -----------------------------
// Quick Quiz Types
// -----------------------------
export interface QuickQuizItem {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  durationMinutes: number;
  isLocked?: boolean;
  questions: BaseQuestion[];
}
