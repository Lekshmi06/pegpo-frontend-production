import { useState, useEffect, useCallback } from 'react';
import {
  StudentProfile,
  UpdateStudentProfileDTO,
  CreateStudentProfileDTO,
} from '../types/student';
import { studentService } from '../services/studentService';
import { authService } from '../services/authService';
import { AsyncStatus } from '../types/common';

const STORAGE_KEY = 'studentProfileId';

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchOrCreateProfile = useCallback(async () => {
    setStatus('loading');
    setError(null);

    const storedId = localStorage.getItem(STORAGE_KEY);

    if (storedId) {
      try {
        const data = await studentService.getProfile(storedId);
        setProfile(data);
        setStatus('success');
        return;
      } catch (err) {
        console.warn('Could not load profile with stored ID, attempting fallback initialization:', err);
        // If stored ID is invalid or deleted, clear it and fall through to bootstrap
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Bootstrap initial student profile using current session or sensible defaults
    try {
      const currentUser = authService.getCurrentUser();
      const email =
        currentUser?.email ||
        localStorage.getItem('userEmail') ||
        'student@edupye.com';
      const goal = localStorage.getItem('userGoal') || 'Prepare for Exam';
      const language = localStorage.getItem('userLanguage') || 'English';

      const initialPayload: CreateStudentProfileDTO = {
        email,
        name: 'Karthika',
        phone: '+99 85 75 92 78',
        goal,
        language: language === 'Select' ? 'English' : language,
        education: {
          level: 'school',
          board: 'CBSE',
          classLevel: '10',
        },
      };

      try {
        const result = await studentService.createProfile(initialPayload);
        if (result?.studentProfile?._id) {
          localStorage.setItem(STORAGE_KEY, result.studentProfile._id);
          setProfile(result.studentProfile);
          setStatus('success');
          return;
        }
      } catch (createErr) {
        const createMsg = createErr instanceof Error ? createErr.message : '';
        if (createMsg.includes('already exists')) {
          const existingProfile = await studentService.getProfileByEmail(email);
          if (existingProfile?._id) {
            localStorage.setItem(STORAGE_KEY, existingProfile._id);
            setProfile(existingProfile);
            setStatus('success');
            return;
          }
        }
        throw createErr;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load student profile';
      setError(msg);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchOrCreateProfile();
  }, [fetchOrCreateProfile]);

  const updateProfile = useCallback(
    async (data: UpdateStudentProfileDTO): Promise<StudentProfile> => {
      if (!profile?._id) {
        throw new Error('No active student profile to update');
      }

      setIsSaving(true);
      try {
        const updated = await studentService.updateProfile(profile._id, data);
        setProfile(updated);
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [profile?._id]
  );

  const createProfile = useCallback(
    async (data: CreateStudentProfileDTO) => {
      setIsSaving(true);
      try {
        const res = await studentService.createProfile(data);
        if (res?.studentProfile?._id) {
          localStorage.setItem(STORAGE_KEY, res.studentProfile._id);
          setProfile(res.studentProfile);
          setStatus('success');
          setError(null);
        }
        return res;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    profile,
    status,
    error,
    isLoading: status === 'loading',
    isSaving,
    refetch: fetchOrCreateProfile,
    updateProfile,
    createProfile,
  };
}
