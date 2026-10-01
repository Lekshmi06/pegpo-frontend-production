import { apiRequest } from './apiClient';
import { TeacherTask, CreateTeacherTaskInput, UpdateTeacherTaskInput } from '../types/teacherTask';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || '';
  const teacherProfileId = localStorage.getItem('teacherProfileId') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }
  if (teacherProfileId) {
    headers['x-teacher-profile-id'] = teacherProfileId;
  }
  return headers;
};

const notifyTasksUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('teacher-tasks-updated'));
  }
};

export const teacherTaskService = {
  getTasks: async (filters?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    taskType?: string;
  }): Promise<TeacherTask[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.date) params.append('date', filters.date);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.taskType) params.append('taskType', filters.taskType);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest<{ success: boolean; data: TeacherTask[] }>(
        `/teacher-tasks${qs}`,
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch teacher tasks:', err);
      return [];
    }
  },

  getUpcomingTasks: async (limit: number = 4): Promise<TeacherTask[]> => {
    try {
      const res = await apiRequest<{ success: boolean; data: TeacherTask[] }>(
        `/teacher-tasks/upcoming?limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch upcoming tasks:', err);
      return [];
    }
  },

  getTaskById: async (id: string): Promise<TeacherTask | null> => {
    try {
      const res = await apiRequest<{ success: boolean; data: TeacherTask }>(
        `/teacher-tasks/${id}`,
        { headers: getAuthHeaders() }
      );
      return res.data || null;
    } catch (err) {
      console.warn('Failed to fetch task by id:', err);
      return null;
    }
  },

  createTask: async (input: CreateTeacherTaskInput): Promise<TeacherTask> => {
    const res = await apiRequest<{ success: boolean; data: TeacherTask; message: string }>(
      '/teacher-tasks',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      }
    );
    notifyTasksUpdated();
    return res.data;
  },

  updateTask: async (id: string, input: UpdateTeacherTaskInput): Promise<TeacherTask> => {
    const res = await apiRequest<{ success: boolean; data: TeacherTask; message: string }>(
      `/teacher-tasks/${id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      }
    );
    notifyTasksUpdated();
    return res.data;
  },

  deleteTask: async (id: string): Promise<boolean> => {
    await apiRequest<{ success: boolean; message: string }>(
      `/teacher-tasks/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    notifyTasksUpdated();
    return true;
  },
};
