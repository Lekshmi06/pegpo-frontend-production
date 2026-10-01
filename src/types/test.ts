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
  numericalAnswer?: number;
  numericalTolerance?: number;
  negativeMarks?: number;
  questionType?: 'mcq' | 'nat' | 'descriptive';
  sectionId?: string;
  sectionName?: string;
  sourceType?: string;
  sourceYear?: number;
  sourceExam?: string;
  sourceShift?: string;
  sourceReference?: string;
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
  totalMarks?: number;
  durationMinutes: number;
  isLocked?: boolean;
  category: string;
  board?: string;
  classLevel?: string;
  subject?: string;
  questions?: TestQuestion[];
  isUntimed?: boolean;
  isCompetitiveExam?: boolean;
  examCategory?: string;
  examCode?: string;
  examTier?: string;
  sections?: any[];
  negativeMarkingRate?: number;
  cutOffScore?: number;
  totalCandidatesEstimate?: number;
  usages?: {
    studyMaterial: boolean;
    practice: boolean;
    scheduledTest: boolean;
  };
  schedule?: {
    teachingContextId?: string;
    scheduledDate?: string;
    startTime?: string;
    endTime?: string;
    startDate?: string;
    endDate?: string;
    timezoneOffset?: number;
    batchOrSection?: string;
    targetGroups?: string[];
    instructions?: string;
  };
  windowStatus?: 'upcoming' | 'active' | 'closed' | 'open';
  scheduledStartTime?: string | Date;
  scheduledEndTime?: string | Date;
  targetClassSectionIds?: any[];
  originalDocument?: {
    storageType: 'local' | 's3' | 'gcs' | 'azure';
    fileName: string;
    fileKey: string;
    fileUrl: string;
    mimeType?: string;
    fileSize?: number;
    uploadedAt: string | Date;
    extractedText?: string;
  };
  sourceFormat?: 'ai_generated' | 'pdf' | 'docx' | 'doc' | 'txt' | 'manual';
  teachingContextId?: any;
  teacherProfileId?: string;
  resultsPublished?: boolean;
  hasAttempted?: boolean;
  attemptStatus?: 'in_progress' | 'completed' | 'abandoned';
  studentAttemptId?: string;
  isResultPublished?: boolean;
  userScore?: number;
}

export type QuestionStatus = 'attempted' | 'revise' | 'skipped';

export interface TestSectionScore {
  sectionId: string;
  sectionName: string;
  subject?: string;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount?: number;
  score: number;
  maxScore: number;
  accuracy: number;
}

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
  sectionScores?: TestSectionScore[];
  percentile?: number;
  allIndiaRank?: number;
  totalCandidates?: number;
  isCompetitiveExam?: boolean;
  examCategory?: string;
  cutOffScore?: number;
  isResultPublished?: boolean;
  message?: string;
}
