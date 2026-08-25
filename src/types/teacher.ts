import { ComponentType } from 'react';

export type TaskStatus = 'New task' | 'Scheduled' | 'In Progress' | 'Completed';
export type TaskCategory = 'Operational' | 'Technical' | 'Strategic' | 'Hiring' | 'Financial';

export interface KanbanTask {
  id: string;
  name: string;
  estimatedTime: string;
  type: TaskCategory;
  status: TaskStatus;
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
