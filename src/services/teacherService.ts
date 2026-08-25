import { KanbanTask } from '../types/teacher';
import { teacherKanbanData } from '../data/mockData';

export const teacherService = {
  getKanbanTasks: async (): Promise<KanbanTask[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...teacherKanbanData];
  },

  createTask: async (task: Omit<KanbanTask, 'id'>): Promise<KanbanTask> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      ...task,
    };
    teacherKanbanData.push(newTask);
    return newTask;
  },

  updateTaskStatus: async (taskId: string, status: KanbanTask['status']): Promise<KanbanTask> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const task = teacherKanbanData.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    task.status = status;
    return { ...task };
  },
};
