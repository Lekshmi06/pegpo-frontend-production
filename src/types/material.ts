export type MaterialCategory =
  | 'slides'
  | 'notes'
  | 'textbook'
  | 'worksheet'
  | 'syllabus'
  | 'other';

export type MaterialStatus = 'draft' | 'published';

export interface TeacherMaterial {
  _id: string;
  id?: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  category: MaterialCategory;
  subject: string;
  classLevel: string;
  classSectionId?:
    | string
    | {
        _id: string;
        name: string;
        classLevel?: string;
        section?: string;
        board?: string;
      };
  targetAudience: 'all' | 'class_section';

  originalName: string;
  storedName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;

  status: MaterialStatus;
  publishedAt?: string | Date | null;
  allowStudentDownload: boolean;
  allowAIChat: boolean;
  downloadsCount: number;

  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UploadMaterialPayload {
  title: string;
  description?: string;
  category: MaterialCategory;
  subject: string;
  classLevel?: string;
  classSectionId?: string;
  targetAudience?: 'all' | 'class_section';
  status?: MaterialStatus;
  allowStudentDownload?: boolean;
  allowAIChat?: boolean;
}

export interface TeacherMaterialFilters {
  status?: string;
  subject?: string;
  classLevel?: string;
  category?: string;
  search?: string;
}

export interface StudentMaterialFilters {
  subject?: string;
  category?: string;
  classLevel?: string;
  classSectionId?: string;
  search?: string;
}
