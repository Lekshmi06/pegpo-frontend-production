import { apiRequest, API_BASE_URL } from './apiClient';
import {
  ICourse,
  IEnrollment,
  ProviderDashboardStats,
  CourseFilterQuery,
  ILesson,
} from '../types/course';

export const courseService = {
  // ================= MARKETPLACE =================
  getMarketplaceCourses: async (
    query: CourseFilterQuery = {}
  ): Promise<{ courses: ICourse[]; total: number; categories: string[] }> => {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.category && query.category !== 'All') params.append('category', query.category);
    if (query.level && query.level !== 'All') params.append('level', query.level);
    if (query.minPrice !== undefined) params.append('minPrice', String(query.minPrice));
    if (query.maxPrice !== undefined) params.append('maxPrice', String(query.maxPrice));
    if (query.sort) params.append('sort', query.sort);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: { courses: ICourse[]; total: number; categories: string[] } }>(
      `/courses${queryString}`
    );
    return res.data;
  },

  getCourseById: async (
    courseId: string
  ): Promise<{ course: ICourse; isOwner: boolean }> => {
    const res = await apiRequest<{ success: boolean; data: ICourse; isOwner: boolean }>(
      `/courses/${courseId}`
    );
    return { course: res.data, isOwner: res.isOwner };
  },

  // ================= PROVIDER DASHBOARD & BUILDER =================
  getProviderCourses: async (): Promise<{
    courses: ICourse[];
    stats: ProviderDashboardStats;
  }> => {
    const res = await apiRequest<{
      success: boolean;
      data: { courses: ICourse[]; stats: ProviderDashboardStats };
    }>('/courses/provider/my-courses');
    return res.data;
  },

  createCourse: async (data: {
    title: string;
    description: string;
    shortDescription?: string;
    thumbnail?: string;
    category: string;
    level: string;
    language?: string;
    price?: number;
    currency?: string;
  }): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  updateCourse: async (
    courseId: string,
    data: Partial<ICourse>
  ): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>(
      `/courses/${courseId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },

  togglePublishCourse: async (
    courseId: string,
    status?: 'draft' | 'published'
  ): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>(
      `/courses/${courseId}/publish`,
      {
        method: 'POST',
        body: JSON.stringify({ status }),
      }
    );
    return res.data;
  },

  // Section Management
  addSection: async (
    courseId: string,
    title: string,
    description?: string
  ): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>(
      `/courses/${courseId}/sections`,
      {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      }
    );
    return res.data;
  },

  updateSection: async (
    courseId: string,
    sectionId: string,
    title?: string,
    description?: string
  ): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>(
      `/courses/${courseId}/sections/${sectionId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ title, description }),
      }
    );
    return res.data;
  },

  deleteSection: async (
    courseId: string,
    sectionId: string
  ): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>(
      `/courses/${courseId}/sections/${sectionId}`,
      {
        method: 'DELETE',
      }
    );
    return res.data;
  },

  // Lesson Management
  addLesson: async (
    courseId: string,
    sectionId: string,
    lessonData: Partial<ILesson>
  ): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>(
      `/courses/${courseId}/sections/${sectionId}/lessons`,
      {
        method: 'POST',
        body: JSON.stringify(lessonData),
      }
    );
    return res.data;
  },

  updateLesson: async (
    courseId: string,
    sectionId: string,
    lessonId: string,
    lessonData: Partial<ILesson>
  ): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      {
        method: 'PUT',
        body: JSON.stringify(lessonData),
      }
    );
    return res.data;
  },

  deleteLesson: async (
    courseId: string,
    sectionId: string,
    lessonId: string
  ): Promise<ICourse> => {
    const res = await apiRequest<{ success: boolean; data: ICourse }>(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      {
        method: 'DELETE',
      }
    );
    return res.data;
  },

  uploadAsset: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/courses/upload-asset`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.message || 'File upload failed');
    }

    return json.data.fileUrl;
  },

  // ================= ENROLLMENT & LEARNING =================
  enrollInCourse: async (
    courseId: string
  ): Promise<{ enrollment: IEnrollment; alreadyEnrolled: boolean }> => {
    const res = await apiRequest<{
      success: boolean;
      data: IEnrollment;
      alreadyEnrolled: boolean;
      message: string;
    }>(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
    return {
      enrollment: res.data,
      alreadyEnrolled: res.alreadyEnrolled,
    };
  },

  getLearnerEnrolledCourses: async (): Promise<IEnrollment[]> => {
    const res = await apiRequest<{ success: boolean; data: IEnrollment[] }>(
      '/learner/courses'
    );
    return res.data;
  },

  getLearnerCourseLearningState: async (
    courseId: string
  ): Promise<{
    course: ICourse;
    enrollment: IEnrollment;
    isOwner: boolean;
  }> => {
    const res = await apiRequest<{
      success: boolean;
      data: { course: ICourse; enrollment: IEnrollment; isOwner: boolean };
    }>(`/learner/courses/${courseId}`);
    return res.data;
  },

  updateLessonProgress: async (
    courseId: string,
    lessonId: string,
    completed: boolean
  ): Promise<IEnrollment> => {
    const res = await apiRequest<{ success: boolean; data: IEnrollment }>(
      `/learner/courses/${courseId}/progress`,
      {
        method: 'PUT',
        body: JSON.stringify({ lessonId, completed }),
      }
    );
    return res.data;
  },
};
