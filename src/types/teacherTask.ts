export type TeacherTaskType =
  | 'Operational'
  | 'Technical'
  | 'Strategic'
  | 'Hiring'
  | 'Financial'
  | 'Lecture'
  | 'Deadline'
  | 'Meeting'
  | 'General';

export type TeacherTaskPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type TeacherTaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'New task'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed';

export interface TeacherTask {
  _id: string;
  id?: string;
  teacherId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  taskType: TeacherTaskType;
  priority: TeacherTaskPriority;
  status: TeacherTaskStatus;
  teachingContextId?: string | { _id: string; subject?: string; classLevel?: string; section?: string };
  classSectionId?: string | { _id: string; name?: string; classLevel?: string; section?: string; board?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherTaskInput {
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  taskType?: TeacherTaskType;
  priority?: TeacherTaskPriority;
  status?: TeacherTaskStatus;
  teachingContextId?: string;
  classSectionId?: string;
}

export interface UpdateTeacherTaskInput extends Partial<CreateTeacherTaskInput> {}
