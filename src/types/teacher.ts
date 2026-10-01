import { ComponentType } from 'react';

export type TaskStatus = 'New task' | 'Scheduled' | 'In Progress' | 'Completed';
export type TaskCategory = 'Operational' | 'Technical' | 'Strategic' | 'Hiring' | 'Financial';

export interface KanbanTask {
  id: string;
  name: string;
  estimatedTime?: string;
  type: TaskCategory;
  status: TaskStatus;
  date?: string;
  priority?: string;
  description?: string;
}

export interface TeacherMenuGroupItem {
  label: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
}

export interface TeacherMenuGroup {
  color: string;
  items: TeacherMenuGroupItem[];
}

export type TeacherType = 'institution' | 'tuition';

export const TEACHER_GOALS = [
  'Lesson Planning',
  'Improve Profession',
  'Update Knowledge',
  'Higher Study',
  'Engage Students',
  'Conduct a Class',
  'Tuition',
  'Other',
] as const;

export type TeacherGoal = (typeof TEACHER_GOALS)[number];

export interface TeachingDetails {
  teacherType: TeacherType;
  institution?: string;
  tuitionCentre?: string;
  department?: string;
  designation?: string;
  subjects: string[];
  classesTaught: string[];
  boards: string[];
  experienceYears?: number;
}

export interface TeacherProfile {
  _id?: string;
  userId?: string | { _id: string; email: string; userType: string; language?: string };
  name: string;
  phone?: string;
  dob?: string;
  gender?: string;
  avatar?: string;
  bio?: string;
  teacherType: TeacherType;
  institution?: string;
  tuitionCentre?: string;
  department?: string;
  designation?: string;
  subjects: string[];
  classesTaught: string[];
  boards: string[];
  experienceYears?: number;
  goal?: string;
  preferences?: {
    activeDepartment?: string;
    activeSubject?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
