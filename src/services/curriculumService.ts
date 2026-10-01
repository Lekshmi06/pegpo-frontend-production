import { Curriculum } from '../types/curriculum';
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

export const curriculumService = {
  getCurriculums: async (contextId: string): Promise<Curriculum[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: Curriculum[] }>(
        `/curriculums?contextId=${contextId}`,
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch curriculums from API:', err);
      return [];
    }
  },

  getCurriculumById: async (id: string): Promise<Curriculum> => {
    const res = await apiRequest<{ success: boolean; data: Curriculum }>(
      `/curriculums/${id}`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  },

  createCurriculumWithFile: async (formData: FormData): Promise<Curriculum> => {
    const headers = getAuthHeaders();
    // Do NOT set Content-Type header when sending FormData; browser sets multipart/form-data with boundary
    const token = localStorage.getItem('token') || '';
    const teacherProfileId = localStorage.getItem('teacherProfileId') || '';
    const rawHeaders: Record<string, string> = {};
    if (token) {
      rawHeaders['Authorization'] = `Bearer ${token}`;
      rawHeaders['x-user-id'] = token;
    }
    if (teacherProfileId) {
      rawHeaders['x-teacher-profile-id'] = teacherProfileId;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${baseUrl}/curriculums`, {
      method: 'POST',
      headers: rawHeaders,
      body: formData,
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Failed to upload curriculum');
    }
    return json.data;
  },

  createCurriculumManual: async (data: {
    contextId: string;
    title?: string;
    manualText: string;
  }): Promise<Curriculum> => {
    const res = await apiRequest<{ success: boolean; data: Curriculum }>(
      '/curriculums',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  processCurriculum: async (id: string): Promise<Curriculum> => {
    const res = await apiRequest<{ success: boolean; data: Curriculum; message?: string }>(
      `/curriculums/${id}/process`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  updateCurriculum: async (id: string, data: Partial<Curriculum>): Promise<Curriculum> => {
    const res = await apiRequest<{ success: boolean; data: Curriculum }>(
      `/curriculums/${id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },
};
