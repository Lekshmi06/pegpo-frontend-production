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

    const handleTasksUpdated = () => {
      fetchTasks();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('teacher-tasks-updated', handleTasksUpdated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('teacher-tasks-updated', handleTasksUpdated);
      }
    };
  }, [fetchTasks]);

  const addTask = async (
    name: string,
    taskStatus: TaskStatus = 'New task',
    type: TaskCategory = 'Operational',
    date?: string,
    priority?: string,
    description?: string,
    estimatedTime: string = '1h'
  ) => {
    try {
      const newTask = await teacherService.createTask({
        name,
        type,
        estimatedTime,
        status: taskStatus,
        date,
        priority,
        description,
      });
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      throw err;
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await teacherService.updateTaskStatus(taskId, newStatus);
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await teacherService.deleteTask(taskId);
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  };

  return {
    tasks,
    status,
    error,
    refetch: fetchTasks,
    addTask,
    moveTask,
    deleteTask,
    isLoading: status === 'loading',
  };
}
