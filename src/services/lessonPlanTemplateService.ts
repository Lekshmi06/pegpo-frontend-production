import {
  LessonPlanTemplate,
  LessonPlanTemplateSchema,
  AnalyzeTemplateResponse,
} from '../types/lessonPlanTemplate';
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

export const lessonPlanTemplateService = {
  getTemplates: async (): Promise<LessonPlanTemplate[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: LessonPlanTemplate[] }>(
        '/lesson-plan-templates',
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch lesson plan templates:', err);
      return [];
    }
  },

  analyzeTemplateImage: async (file: File): Promise<LessonPlanTemplateSchema> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiRequest<AnalyzeTemplateResponse>(
      '/lesson-plan-templates/analyze',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      }
    );

    return res.data;
  },

  createCustomTemplate: async (data: {
    name: string;
    description?: string;
    schema: LessonPlanTemplateSchema;
  }): Promise<LessonPlanTemplate> => {
    const res = await apiRequest<{ success: boolean; data: LessonPlanTemplate }>(
      '/lesson-plan-templates/custom',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  getTemplateById: async (id: string): Promise<LessonPlanTemplate> => {
    const res = await apiRequest<{ success: boolean; data: LessonPlanTemplate }>(
      `/lesson-plan-templates/${id}`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  },
};
