export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type LessonContentType = 'video' | 'article' | 'document' | 'quiz';

export interface ILesson {
  _id?: string;
  title: string;
  contentType: LessonContentType;
  durationMinutes?: number;
  videoUrl?: string;
  articleContent?: string;
  resourceFileUrl?: string;
  resourceFileName?: string;
  isPreviewFree?: boolean;
  order: number;
}

export interface ICourseSection {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  lessons: ILesson[];
}

export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  thumbnail?: string;
  provider: string;
  providerName?: string;
  category: string;
  level: CourseLevel;
  language: string;
  price: number;
  currency: string;
  status: CourseStatus;
  sections: ICourseSection[];
  totalLessons: number;
  totalDurationMinutes: number;
  enrollmentCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEnrollment {
  _id: string;
  learner: string;
  course: ICourse;
  status: 'active' | 'completed';
  paymentStatus: 'free' | 'paid' | 'waived' | 'pending';
  enrolledAt: string;
  completedLessons: string[];
  lastAccessedLesson?: string;
  progressPercentage: number;
  completedAt?: string;
}

export interface ProviderDashboardStats {
  totalCourses: number;
  draftCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
}

export interface CourseFilterQuery {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
}
