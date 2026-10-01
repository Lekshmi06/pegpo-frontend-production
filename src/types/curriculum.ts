export type CurriculumSourceType = 'uploaded_file' | 'manual';
export type CurriculumStatus = 'uploaded' | 'processing' | 'processed' | 'failed';

export interface CurriculumChapter {
  title: string;
  topics: string[];
}

export interface CurriculumUnit {
  unitNumber: number;
  title: string;
  chapters: CurriculumChapter[];
}

export interface Curriculum {
  _id: string;
  teacherId: string;
  contextId: string;
  title: string;
  subject: string;
  board: string;
  classLevel: string;
  academicYear: string;
  sourceType: CurriculumSourceType;
  fileUrl?: string;
  originalFileName?: string;
  extractedText?: string;
  units: CurriculumUnit[];
  status: CurriculumStatus;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeachingScheduleConstraints {
  sessionsPerWeek?: number;
  durationMinutes?: number;
  teachingDays?: string[];
  startDate?: string;
  targetCompletionDate?: string;
}
