export type QuestionType = 'mcq' | 'nat' | 'descriptive';

export interface AssessmentOption {
  id: 'A' | 'B' | 'C' | 'D' | string;
  text: string;
}

export interface AssessmentQuestion {
  id?: string;
  questionNumber?: number;
  question: string;
  sidebarTitle?: string;
  questionType: QuestionType;
  options: AssessmentOption[];
  correctAnswer?: string;
  numericalAnswer?: number;
  marks: number;
  negativeMarks?: number;
  explanation?: string;
  section?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface AssessmentUsages {
  studyMaterial: boolean;
  practice: boolean;
  scheduledTest: boolean;
}

export interface AssessmentSchedule {
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
}

export interface OriginalDocumentReference {
  storageType: 'local' | 's3' | 'gcs' | 'azure';
  fileName: string;
  fileKey: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt: string | Date;
  extractedText?: string;
}

export interface AssessmentItem {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  subject: string;
  board: string;
  classLevel: string;
  chapter?: string;
  topic?: string;
  durationMinutes: number;
  isUntimed?: boolean;
  totalMarks: number;
  passingMarks?: number;
  status: 'draft' | 'published' | 'archived';
  sourceType?: 'system' | 'curriculum' | 'custom' | 'pyq' | 'teacher';
  sourceFormat?: 'ai_generated' | 'pdf' | 'docx' | 'doc' | 'txt' | 'manual';
  teacherProfileId?: string;
  teachingContextId?: string | any;
  targetClassSectionIds?: string[];
  usages: AssessmentUsages;
  schedule?: AssessmentSchedule;
  resultsPublished?: boolean;
  originalDocument?: OriginalDocumentReference;
  questions?: AssessmentQuestion[];
  questionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParsedDocumentResponse {
  title: string;
  subject?: string;
  board?: string;
  classLevel?: string;
  totalMarks?: number;
  durationMinutes?: number;
  questions: AssessmentQuestion[];
  originalDocument: OriginalDocumentReference;
}

export interface GenerateAiAssessmentParams {
  subject: string;
  board?: string;
  classLevel?: string;
  chapter?: string;
  topic?: string;
  questionCount?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  questionTypes?: string[];
  teachingContextId?: string;
}

export interface SuggestAnswersResponseItem {
  index: number;
  suggestedAnswer: string;
  explanation: string;
}

export interface AssessmentAttemptRecord {
  _id: string;
  testId: string;
  studentProfileId?: {
    _id: string;
    name?: string;
    education?: { classLevel?: string; board?: string };
    schoolDetails?: { classLevel?: string; board?: string; schoolName?: string };
    avatar?: string;
  };
  userId?: {
    email?: string;
  };
  attemptMode: 'practice' | 'scheduled_test';
  status: 'in_progress' | 'completed' | 'abandoned';
  isResultPublished?: boolean;
  score?: number;
  maxScore?: number;
  percentage?: number;
  accuracy?: number;
  timeSpentSeconds?: number;
  startedAt: string;
  completedAt?: string;
}

export interface AssessmentAttemptsSummary {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  resultsPublished?: boolean;
  attempts: AssessmentAttemptRecord[];
}
