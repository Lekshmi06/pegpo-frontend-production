import { apiRequest } from './apiClient';
import { ClassSection, TeacherClassGroup, ClassStudentItem } from '../types/classSection';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || '';
  const teacherProfileId = localStorage.getItem('teacherProfileId') || '';
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }
  if (teacherProfileId) {
    headers['x-teacher-profile-id'] = teacherProfileId;
  }
  return headers;
};

export const classSectionService = {
  getTeacherClasses: async (): Promise<TeacherClassGroup[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: TeacherClassGroup[] }>(
        '/class-sections/teacher/my-classes',
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch teacher classes from server:', err);
      return [];
    }
  },

  getClassSections: async (): Promise<ClassSection[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: ClassSection[] }>(
        '/class-sections',
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to list class sections:', err);
      return [];
    }
  },

  getClassStudents: async (classSectionId: string): Promise<ClassStudentItem[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: ClassStudentItem[] }>(
        `/class-sections/${classSectionId}/students`,
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch students in class section:', err);
      return [];
    }
  },

  createClassSection: async (data: {
    classLevel: string;
    section: string;
    board?: string;
    academicYear?: string;
    type?: 'institution' | 'tuition';
    name?: string;
  }): Promise<ClassSection> => {
    const res = await apiRequest<{ success: boolean; data: ClassSection }>(
      '/class-sections',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  searchStudentByEmail: async (
    email: string
  ): Promise<{
    studentProfileId: string;
    name: string;
    email: string;
    studentType: string;
    classLevel?: string;
    board?: string;
    currentClassSectionId?: string;
  } | null> => {
    try {
      const res = await apiRequest<{
        success: boolean;
        data: {
          studentProfileId: string;
          name: string;
          email: string;
          studentType: string;
          classLevel?: string;
          board?: string;
          currentClassSectionId?: string;
        };
      }>(`/students/search?email=${encodeURIComponent(email.trim())}`, {
        headers: getAuthHeaders(),
      });
      return res.data || null;
    } catch (err: any) {
      if (err?.message?.includes('No EduPye student account') || err?.message?.includes('not found')) {
        return null;
      }
      throw err;
    }
  },

  enrollStudent: async (data: {
    studentProfileId?: string;
    email?: string;
    classSectionId: string;
    rollNumber?: string;
    academicYear?: string;
  }): Promise<any> => {
    const res = await apiRequest<{ success: boolean; data: any; message: string }>(
      '/class-sections/enroll',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  inviteStudent: async (data: {
    classSectionId: string;
    email: string;
    name?: string;
    rollNumber?: string;
  }): Promise<any> => {
    const res = await apiRequest<{ success: boolean; data: any; message: string }>(
      `/class-sections/${data.classSectionId}/invite`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  removeStudent: async (studentProfileId: string, classSectionId: string): Promise<void> => {
    await apiRequest<{ success: boolean; message: string }>(
      '/class-sections/remove-student',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ studentProfileId, classSectionId }),
      }
    );
  },
};
