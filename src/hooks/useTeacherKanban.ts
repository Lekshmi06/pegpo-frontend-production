import { useState, useEffect, useCallback } from 'react';
import { KanbanTask, TaskStatus, TaskCategory } from '../types/teacher';
import { teacherService } from '../services/teacherService';
import { AsyncStatus } from '../types/common';

export function useTeacherKanban() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await teacherService.getKanbanTasks();
      setTasks(res);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch kanban tasks');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (
    name: string,
    taskStatus: TaskStatus = 'New task',
    type: TaskCategory = 'Operational',
    estimatedTime: string = '1h'
  ) => {
    try {
      const newTask = await teacherService.createTask({ name, type, estimatedTime, status: taskStatus });
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      throw err;
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await teacherService.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      throw err;
    }
  };

  return { tasks, status, error, refetch: fetchTasks, addTask, moveTask, isLoading: status === 'loading' };
}
