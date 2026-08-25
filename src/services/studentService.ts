import { StudentDashboardData, Course, DocumentItem } from '../types/student';
import { studentDashboardData, coursesData } from '../data/mockData';

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
};
