import { TeachingContext } from '../types/lessonPlan';
import { apiRequest } from './apiClient';

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

export const teachingContextService = {
  getContexts: async (): Promise<TeachingContext[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: TeachingContext[] }>(
        '/teaching-contexts',
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch teaching contexts, returning cached or mock:', err);
      const raw = localStorage.getItem('cachedTeachingContexts');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // continue
        }
      }
      return [];
    }
  },

  createContext: async (
    data: Omit<TeachingContext, '_id' | 'teacherId' | 'isArchived'>
  ): Promise<TeachingContext> => {
    const res = await apiRequest<{ success: boolean; data: TeachingContext }>(
      '/teaching-contexts',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  updateContext: async (
    id: string,
    data: Partial<TeachingContext>
  ): Promise<TeachingContext> => {
    const res = await apiRequest<{ success: boolean; data: TeachingContext }>(
      `/teaching-contexts/${id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },
};
