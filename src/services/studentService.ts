import {
  StudentDashboardData,
  Course,
  DocumentItem,
  StudentProfile,
  UpdateStudentProfileDTO,
  CreateStudentProfileDTO,
} from '../types/student';
import { studentDashboardData, coursesData } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const studentService = {
  getDashboardData: async (): Promise<StudentDashboardData> => {
    // Simulated API call delay
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...studentDashboardData };
  },

  getCourses: async (): Promise<Course[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...coursesData];
  },

  addDocument: async (doc: Omit<DocumentItem, 'id'>): Promise<DocumentItem> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newDoc: DocumentItem = {
      id: Date.now(),
      ...doc,
    };
    studentDashboardData.recentDocuments.unshift(newDoc);
    return newDoc;
  },

  getProfile: async (id: string): Promise<StudentProfile> => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch student profile');
    }
    return json.data;
  },

  updateProfile: async (id: string, data: UpdateStudentProfileDTO): Promise<StudentProfile> => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update student profile');
    }
    return json.data;
  },

  createProfile: async (
    data: CreateStudentProfileDTO
  ): Promise<{ user: unknown; studentProfile: StudentProfile }> => {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      // If 409 conflict and backend returned studentProfile, return it
      if (res.status === 409 && json?.data?.studentProfile) {
        return json.data;
      }
      throw new Error(json.message || 'Failed to create student profile');
    }
    return json.data;
  },

  getProfileByEmail: async (email: string): Promise<StudentProfile> => {
    const res = await fetch(`${API_BASE_URL}/students/by-email/${encodeURIComponent(email)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch student profile by email');
    }
    return json.data;
  },
};
