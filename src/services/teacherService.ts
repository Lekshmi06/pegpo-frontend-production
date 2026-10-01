import { KanbanTask, TaskCategory, TaskStatus } from '../types/teacher';
import { TeacherTask } from '../types/teacherTask';
import { teacherTaskService } from './teacherTaskService';

const normalizeTaskCategory = (category?: string): TaskCategory => {
  switch (category) {
    case 'Technical':
      return 'Technical';
    case 'Strategic':
      return 'Strategic';
    case 'Hiring':
      return 'Hiring';
    case 'Financial':
      return 'Financial';
    case 'Operational':
    default:
      return 'Operational';
  }
};

const normalizeTaskStatus = (status?: string): TaskStatus => {
  if (status === 'Completed' || status === 'completed') return 'Completed';
  if (status === 'In Progress' || status === 'in_progress') return 'In Progress';
  if (status === 'Scheduled' || status === 'scheduled') return 'Scheduled';
  return 'New task';
};

const mapTeacherTaskToKanban = (task: TeacherTask): KanbanTask => {
  const estimatedTime = task.startTime && task.endTime
    ? `${task.startTime} - ${task.endTime}`
    : (task.startTime || '1h');

  return {
    id: task._id || (task as any).id,
    name: task.title,
    estimatedTime,
    type: normalizeTaskCategory(task.taskType),
    status: normalizeTaskStatus(task.status),
    date: task.date,
    priority: task.priority,
    description: task.description,
  };
};

export const teacherService = {
  getKanbanTasks: async (): Promise<KanbanTask[]> => {
    const tasks = await teacherTaskService.getTasks();
    return tasks.map(mapTeacherTaskToKanban);
  },

  createTask: async (task: Omit<KanbanTask, 'id'> & { date?: string; priority?: string; description?: string }): Promise<KanbanTask> => {
    const created = await teacherTaskService.createTask({
      title: task.name,
      description: task.description || '',
      date: task.date || new Date().toISOString().split('T')[0],
      taskType: task.type,
      status: task.status,
      priority: (task.priority as any) || 'Normal',
    });
    return mapTeacherTaskToKanban(created);
  },

  updateTaskStatus: async (taskId: string, status: TaskStatus): Promise<KanbanTask> => {
    const updated = await teacherTaskService.updateTask(taskId, {
      status,
    });
    return mapTeacherTaskToKanban(updated);
  },

  deleteTask: async (taskId: string): Promise<boolean> => {
    return await teacherTaskService.deleteTask(taskId);
  },
};
