import {
  TeacherMaterial,
  UploadMaterialPayload,
  TeacherMaterialFilters,
  StudentMaterialFilters,
  MaterialStatus,
} from '../types/material';
import { apiRequest } from './apiClient';

const getTeacherAuthHeaders = (): Record<string, string> => {
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

const getStudentAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || '';
  const studentProfileId = localStorage.getItem('studentProfileId') || '';
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }
  if (studentProfileId) {
    headers['x-student-profile-id'] = studentProfileId;
  }
  return headers;
};

export const materialService = {
  /**
   * Get materials uploaded by the logged-in teacher
   */
  getTeacherMaterials: async (
    filters: TeacherMaterialFilters = {}
  ): Promise<TeacherMaterial[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.subject && filters.subject !== 'all') params.append('subject', filters.subject);
      if (filters.classLevel && filters.classLevel !== 'all') params.append('classLevel', filters.classLevel);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest<{ success: boolean; data: TeacherMaterial[] }>(
        `/teacher/materials${queryStr}`,
        {
          headers: getTeacherAuthHeaders(),
        }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch teacher materials:', err);
      return [];
    }
  },

  /**
   * Upload a new material (slides, textbook, notes, worksheet) with file attachment
   */
  uploadMaterial: async (
    file: File,
    payload: UploadMaterialPayload
  ): Promise<TeacherMaterial> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    if (payload.category) formData.append('category', payload.category);
    if (payload.subject) formData.append('subject', payload.subject);
    if (payload.classLevel) formData.append('classLevel', payload.classLevel);
    if (payload.classSectionId) formData.append('classSectionId', payload.classSectionId);
    if (payload.targetAudience) formData.append('targetAudience', payload.targetAudience);
    if (payload.status) formData.append('status', payload.status);
    formData.append('allowStudentDownload', String(payload.allowStudentDownload ?? true));
    formData.append('allowAIChat', String(payload.allowAIChat ?? true));

    const res = await apiRequest<{ success: boolean; data: TeacherMaterial }>(
      '/teacher/materials',
      {
        method: 'POST',
        headers: getTeacherAuthHeaders(),
        body: formData,
      }
    );
    return res.data;
  },

  /**
   * Update material details
   */
  updateMaterial: async (
    id: string,
    updates: Partial<UploadMaterialPayload>
  ): Promise<TeacherMaterial> => {
    const res = await apiRequest<{ success: boolean; data: TeacherMaterial }>(
      `/teacher/materials/${id}`,
      {
        method: 'PUT',
        headers: getTeacherAuthHeaders(),
        body: JSON.stringify(updates),
      }
    );
    return res.data;
  },

  /**
   * Publish or Unpublish material to students
   */
  setPublishStatus: async (
    id: string,
    status: MaterialStatus,
    targetAudience?: 'all' | 'class_section',
    classSectionId?: string
  ): Promise<TeacherMaterial> => {
    const res = await apiRequest<{ success: boolean; data: TeacherMaterial }>(
      `/teacher/materials/${id}/publish`,
      {
        method: 'PATCH',
        headers: getTeacherAuthHeaders(),
        body: JSON.stringify({
          status,
          targetAudience,
          classSectionId,
        }),
      }
    );
    return res.data;
  },

  /**
   * Delete uploaded material
   */
  deleteMaterial: async (id: string): Promise<void> => {
    await apiRequest<{ success: boolean }>(`/teacher/materials/${id}`, {
      method: 'DELETE',
      headers: getTeacherAuthHeaders(),
    });
  },

  /**
   * Get all published materials for students
   */
  getPublishedMaterialsForStudents: async (
    filters: StudentMaterialFilters = {}
  ): Promise<TeacherMaterial[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.subject && filters.subject !== 'all') params.append('subject', filters.subject);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.classLevel && filters.classLevel !== 'all') params.append('classLevel', filters.classLevel);
      if (filters.classSectionId && filters.classSectionId !== 'all') params.append('classSectionId', filters.classSectionId);
      if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest<{ success: boolean; data: TeacherMaterial[] }>(
        `/materials/published${queryStr}`,
        {
          headers: getStudentAuthHeaders(),
        }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch student published materials:', err);
      return [];
    }
  },

  /**
   * Record download hit
   */
  recordDownload: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/materials/${id}/download`, {
        method: 'POST',
      });
    } catch {
      // Non-blocking
    }
  },

  /**
   * Import teacher published material into student's AI studio
   */
  importToStudentSource: async (id: string): Promise<any> => {
    const res = await apiRequest<{ success: boolean; data: any }>(
      `/materials/${id}/import-to-sources`,
      {
        method: 'POST',
        headers: getStudentAuthHeaders(),
      }
    );
    return res.data;
  },
};
