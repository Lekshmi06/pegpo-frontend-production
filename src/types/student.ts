export interface DocumentItem {
  id: number | string;
  title: string;
  type: string;
  date: string;
}

export interface UploadCard {
  id: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  textColor: string;
}

export interface Chapter {
  id: number | string;
  title: string;
  duration: string;
}

export interface Course {
  id: number | string;
  title: string;
  subject: string;
  progress: number;
  instructor: string;
  image: string;
  chapters: Chapter[];
}

export interface StudentDashboardData {
  recentDocuments: DocumentItem[];
  uploadCards: UploadCard[];
}

export type EducationLevel =
  | 'school'
  | 'undergraduate'
  | 'postgraduate'
  | 'professional'
  | 'other';

export interface StudentEducation {
  level?: EducationLevel;
  board?: string;
  classLevel?: string;
  degree?: string;
  specialization?: string;
  institution?: string;
}

export interface StudentUserRef {
  _id: string;
  email: string;
  userType: 'student';
  language?: string;
}

export interface StudentProfile {
  _id: string;
  userId: StudentUserRef;
  name: string;
  phone?: string;
  goal?: string;
  education?: StudentEducation;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateStudentProfileDTO {
  name?: string;
  phone?: string;
  goal?: string;
  language?: string;
  education?: StudentEducation;
}

export interface CreateStudentProfileDTO {
  email: string;
  name: string;
  phone?: string;
  goal?: string;
  language?: string;
  education?: StudentEducation;
}
