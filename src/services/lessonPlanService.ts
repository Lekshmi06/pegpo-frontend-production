import { LessonPlan, LessonSessionStatus, LessonResource, FlashcardDeckResource } from '../types/lessonPlan';
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

export const lessonPlanService = {
  getPlansByContext: async (contextId: string): Promise<LessonPlan[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: LessonPlan[] }>(
        `/lesson-plans?contextId=${contextId}`,
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch lesson plans from API:', err);
      return [];
    }
  },

  createPlan: async (planData: Partial<LessonPlan> & { contextId: string; chapterTitle: string }): Promise<LessonPlan> => {
    const res = await apiRequest<{ success: boolean; data: LessonPlan }>(
      '/lesson-plans',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(planData),
      }
    );
    return res.data;
  },

  updatePlan: async (id: string, planData: Partial<LessonPlan>): Promise<LessonPlan> => {
    const res = await apiRequest<{ success: boolean; data: LessonPlan }>(
      `/lesson-plans/${id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(planData),
      }
    );
    return res.data;
  },

  updateSessionStatus: async (
    planId: string,
    sessionNum: number,
    status: LessonSessionStatus,
    notes?: string
  ): Promise<LessonPlan> => {
    const res = await apiRequest<{ success: boolean; data: LessonPlan }>(
      `/lesson-plans/${planId}/sessions/${sessionNum}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      }
    );
    return res.data;
  },

  generateAIPlan: async (params: {
    contextId: string;
    chapterTitle?: string;
    curriculumId?: string;
    templateId?: string;
    templateSchema?: any;
    availableSessions?: number;
    durationMinutes?: number;
    additionalGuidelines?: string;
    teachingSchedule?: {
      sessionsPerWeek?: number;
      durationMinutes?: number;
      teachingDays?: string[];
      startDate?: string;
      targetCompletionDate?: string;
    };
  }): Promise<{
    chapterTitle: string;
    unitNumber?: number;
    totalEstimatedHours: number;
    templateId?: string;
    templateName?: string;
    templateSchema?: any;
    templateSections?: any[];
    sessions: any[];
  }> => {
    const res = await apiRequest<{
      success: boolean;
      data: {
        chapterTitle: string;
        unitNumber?: number;
        totalEstimatedHours: number;
        templateId?: string;
        templateName?: string;
        templateSchema?: any;
        templateSections?: any[];
        sessions: any[];
      };
      curriculumId?: string;
      templateId?: string;
      templateName?: string;
      templateSchema?: any;
    }>('/lesson-plans/ai-generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return res.data;
  },

  getPlanById: async (id: string): Promise<LessonPlan | null> => {
    try {
      const res = await apiRequest<{ success: boolean; data: LessonPlan }>(
        `/lesson-plans/${id}`,
        { headers: getAuthHeaders() }
      );
      return res.data;
    } catch (err) {
      console.warn('Failed to fetch lesson plan by ID:', err);
      return null;
    }
  },

  addSessionResource: async (
    planId: string,
    sessionNum: number,
    resource: Partial<LessonResource>
  ): Promise<{ plan: LessonPlan; resource: LessonResource }> => {
    const res = await apiRequest<{ success: boolean; data: { plan: LessonPlan; resource: LessonResource } }>(
      `/lesson-plans/${planId}/sessions/${sessionNum}/resources`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(resource),
      }
    );
    return res.data;
  },

  updateSessionResource: async (
    planId: string,
    sessionNum: number,
    resourceId: string,
    resourceData: Partial<LessonResource>
  ): Promise<{ plan: LessonPlan; resource: LessonResource }> => {
    const res = await apiRequest<{ success: boolean; data: { plan: LessonPlan; resource: LessonResource } }>(
      `/lesson-plans/${planId}/sessions/${sessionNum}/resources/${resourceId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(resourceData),
      }
    );
    return res.data;
  },

  deleteSessionResource: async (
    planId: string,
    sessionNum: number,
    resourceId: string
  ): Promise<LessonPlan> => {
    const res = await apiRequest<{ success: boolean; data: LessonPlan }>(
      `/lesson-plans/${planId}/sessions/${sessionNum}/resources/${resourceId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  toggleSessionResourceApproval: async (
    planId: string,
    sessionNum: number,
    resourceId: string,
    isApproved?: boolean
  ): Promise<{ plan: LessonPlan; resource: LessonResource }> => {
    const res = await apiRequest<{ success: boolean; data: { plan: LessonPlan; resource: LessonResource } }>(
      `/lesson-plans/${planId}/sessions/${sessionNum}/resources/${resourceId}/approve`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isApproved }),
      }
    );
    return res.data;
  },

  generateSessionFlashcards: async (
    planId: string,
    sessionNum: number,
    count = 5
  ): Promise<{ plan: LessonPlan; resource: FlashcardDeckResource }> => {
    const res = await apiRequest<{ success: boolean; data: { plan: LessonPlan; resource: FlashcardDeckResource } }>(
      `/lesson-plans/${planId}/sessions/${sessionNum}/generate-flashcards`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ count }),
      }
    );
    return res.data;
  },
};
