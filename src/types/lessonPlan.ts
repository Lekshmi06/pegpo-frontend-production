export type ContextType = 'institution' | 'tuition';
export type LessonSessionStatus = 'planned' | 'in_progress' | 'completed';
export type LessonPlanStatus = 'draft' | 'active' | 'completed';

export interface TeachingContext {
  _id: string;
  teacherId: string;
  contextType: ContextType;
  classSectionId?: string | any;
  organizationId?: string;
  institution?: string;
  tuitionCentre?: string;
  classLevel: string;
  section?: string;
  subject: string;
  curriculumBoard: string;
  academicYear: string;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentRecommendation {
  type?: 'quiz' | 'test' | 'assignment' | 'oral' | string;
  recommended: boolean;
  topic?: string;
  suggestedQuestionsCount?: number;
}

export interface BaseLessonResource {
  id: string;
  title: string;
  description?: string;
  source: 'ai_recommended' | 'teacher_added';
  isApproved?: boolean;
}

export interface VideoResource extends BaseLessonResource {
  type: 'video';
  searchQuery: string;
  recommendationReason: string;
  verifiedUrl?: string;
}

export interface VisualResource extends BaseLessonResource {
  type: 'visual/animation';
  visualType: 'diagram' | 'simulation' | 'infographic';
  promptOrConcept: string;
  referenceUrl?: string;
}

export interface FlashcardDeckResource extends BaseLessonResource {
  type: 'flashcard_deck';
  cards: Array<{
    front: string;
    back: string;
    hint?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }>;
}

export interface WorksheetResource extends BaseLessonResource {
  type: 'worksheet';
  instructions: string;
  exercises: string[];
}

export interface QuizResource extends BaseLessonResource {
  type: 'quiz';
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}

export interface ActivityResource extends BaseLessonResource {
  type: 'activity';
  activityType: 'individual' | 'pair' | 'group' | 'discussion';
  instructions: string;
  durationMinutes?: number;
}

export interface ReferenceResource extends BaseLessonResource {
  type: 'reference';
  referenceText: string;
  url?: string;
}

export type LessonResource =
  | VideoResource
  | VisualResource
  | FlashcardDeckResource
  | WorksheetResource
  | QuizResource
  | ActivityResource
  | ReferenceResource;

export interface LessonSession {
  _id?: string;
  sessionNumber: number;
  title: string;
  durationMinutes: number;
  learningObjectives: string[];
  teachingMethod?: string;
  activities?: string[];
  keyConcepts: string[];
  resources?: Array<string | LessonResource>;
  assignment?: string;
  assessmentRecommendation?: AssessmentRecommendation;
  status: LessonSessionStatus;
  completedAt?: string;
  notes?: string;
  templateSections?: Array<{
    sectionKey: string;
    label: string;
    content: any;
  }>;
}

export interface LessonPlan {
  _id: string;
  teacherId: string;
  contextId: string;
  curriculumId?: string;
  templateId?: string;
  templateName?: string;
  templateSchema?: any;
  templateSections?: Array<{
    sectionKey: string;
    label: string;
    content: any;
  }>;
  classLevel: string;
  subject: string;
  chapterTitle: string;
  unitNumber?: number;
  totalEstimatedHours?: number;
  status: LessonPlanStatus;
  sessions: LessonSession[];
  createdAt?: string;
  updatedAt?: string;
}
