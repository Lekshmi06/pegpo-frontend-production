import { useState, useEffect, useCallback } from 'react';
import { StudentDashboardData, StudentAnalyticsData, Course } from '../types/student';
import { studentService } from '../services/studentService';
import { authService } from '../services/authService';
import { LearningPath } from '../types/auth';
import { AsyncStatus } from '../types/common';

export { useStudentProfile } from './useStudentProfile';

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

  const fetchCourses = useCallback(async (trackOverride?: LearningPath) => {
    setStatus('loading');
    setError(null);
    try {
      const res = await studentService.getCourses(trackOverride);
      setCourses(res);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchCourses();

    // Subscribe to track changes and reload courses reactively
    const unsubscribe = authService.onTrackChange((newTrack) => {
      fetchCourses(newTrack);
    });

    return unsubscribe;
  }, [fetchCourses]);

  return { courses, status, error, refetch: fetchCourses, isLoading: status === 'loading' };
}
