import { apiRequest } from './apiClient';
import {
  StudentRecognition,
  AwardStickerDTO,
  StickerDefinition,
  RECOGNITION_STICKERS,
} from '../types/recognition';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || '';
  const teacherProfileId = localStorage.getItem('teacherProfileId') || '';
  const studentProfileId = localStorage.getItem('studentProfileId') || '';
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }
  if (teacherProfileId) {
    headers['x-teacher-profile-id'] = teacherProfileId;
  }
  if (studentProfileId) {
    headers['x-student-profile-id'] = studentProfileId;
  }
  return headers;
};

export const recognitionService = {
  /**
   * Retrieves the centralized list of available stickers
   */
  getStickers: async (): Promise<StickerDefinition[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: StickerDefinition[] }>(
        '/student-recognition/stickers',
        { headers: getAuthHeaders() }
      );
      return res.data && res.data.length > 0 ? res.data : RECOGNITION_STICKERS;
    } catch {
      return RECOGNITION_STICKERS;
    }
  },

  /**
   * Teacher awards a recognition sticker to an enrolled student
   */
  awardSticker: async (data: AwardStickerDTO): Promise<StudentRecognition> => {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: StudentRecognition;
    }>('/student-recognition', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Retrieves all recognitions awarded to a student
   */
  getStudentRecognitions: async (studentId: string): Promise<StudentRecognition[]> => {
    try {
      const res = await apiRequest<{
        success: boolean;
        count: number;
        data: StudentRecognition[];
      }>(`/student-recognition/student/${studentId}`, {
        headers: getAuthHeaders(),
      });
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch student recognitions:', err);
      return [];
    }
  },

  /**
   * Retrieves all recognitions in a class section (for teachers)
   */
  getClassRecognitions: async (classSectionId: string): Promise<StudentRecognition[]> => {
    try {
      const res = await apiRequest<{
        success: boolean;
        count: number;
        data: StudentRecognition[];
      }>(`/student-recognition/class/${classSectionId}`, {
        headers: getAuthHeaders(),
      });
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch class recognitions:', err);
      return [];
    }
  },

  /**
   * Teacher deletes an incorrectly awarded sticker
   */
  deleteRecognition: async (recognitionId: string): Promise<boolean> => {
    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/student-recognition/${recognitionId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      return res.success;
    } catch (err) {
      console.error('Failed to delete recognition:', err);
      throw err;
    }
  },
};
