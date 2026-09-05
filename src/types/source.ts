export type SourceStatus = 'uploaded' | 'processing' | 'ready' | 'failed';
export type AIStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface SourceOverview {
  summary: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readingTimeMinutes: number;
  wordCount: number;
  keyConcepts: string[];
  suggestedQuestions: string[];
}

export interface SourceItem {
  _id: string;
  studentId: string;
  originalName: string;
  storedName: string;
  type: 'file';
  mimeType: string;
  size: number;
  storagePath: string;
  status: SourceStatus;
  aiReady?: boolean;
  aiStatus?: AIStatus;
  aiOverview?: SourceOverview;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
  hint?: string;
}

export interface ChapterItem {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface TimelineEvent {
  title: string;
  description: string;
  tag?: string;
}

export interface AudioScriptTurn {
  speaker: string;
  text: string;
}

export interface VideoSlide {
  slideNumber: number;
  title: string;
  bullets: string[];
  notes: string;
}

export interface DocumentAnalysisData {
  academicLevel?: string;
  bloomLevel?: string;
  estimatedStudyHours?: number;
  prerequisites?: string[];
  learningOutcomes?: string[];
  vocabularyTerms?: Array<{ term: string; definition: string }>;
  contentDensityScore?: number;
}

export interface SourceContent {
  _id: string;
  sourceId: string;
  text: string;
  aiSummary?: string;
  aiChapters?: ChapterItem[];
  aiMindMap?: MindMapNode;
  aiQuiz?: QuizQuestion[];
  aiFlashcards?: Flashcard[];
  aiNotes?: string;
  aiAnalysis?: DocumentAnalysisData;
  aiTimeline?: TimelineEvent[];
  aiAudioScript?: AudioScriptTurn[];
  aiVideoOutline?: VideoSlide[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  citations?: string[];
}
