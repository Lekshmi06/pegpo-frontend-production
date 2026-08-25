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
