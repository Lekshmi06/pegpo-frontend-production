import { apiRequest } from './apiClient';

export interface TeacherPageContextInfo {
  pageTitle?: string;
  pathname?: string;
  subject?: string;
  classLevel?: string;
  board?: string;
  topic?: string;
}

export interface TeacherChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  isQuotaExhausted?: boolean;
}

export interface TeacherAIChatResponseData {
  reply: string;
  suggestions: string[];
  isQuotaExhausted?: boolean;
}

export interface TeacherAIChatRequestPayload {
  message: string;
  pageContext?: TeacherPageContextInfo;
  history?: Array<{ sender: 'user' | 'assistant'; text: string }>;
}

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

export const teacherAiService = {
  /**
   * Send a query or doubt to the Teacher AI Copilot
   */
  sendMessage: async (payload: TeacherAIChatRequestPayload): Promise<TeacherAIChatResponseData> => {
    const res = await apiRequest<{ success: boolean; data: TeacherAIChatResponseData }>(
      '/api/teacher/ai-assistant/chat',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },
};
