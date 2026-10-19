import { useState, useEffect, useCallback } from 'react';
import { StudentDashboardData, StudentAnalyticsData, Course } from '../types/student';
import { studentService } from '../services/studentService';
import { AsyncStatus } from '../types/common';

export function useStudentAnalytics() {
  const [analytics, setAnalytics] = useState<StudentAnalyticsData | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await studentService.getStudentAnalytics();
      setAnalytics(res);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student analytics');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    status,
    error,
    refetch: fetchAnalytics,
    isLoading: status === 'loading',
  };
}

export function useStudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await studentService.getDashboardData();
      setData(res);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, status, error, refetch: fetchDashboard, isLoading: status === 'loading' };
}

export function useStudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await studentService.getCourses();
      setCourses(res);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, status, error, refetch: fetchCourses, isLoading: status === 'loading' };
}
