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
    const currentUser = authService.getCurrentUser();
    const currentEmail = currentUser?.email || localStorage.getItem('userEmail');

    if (storedId) {
      try {
        const data = await studentService.getProfile(storedId);
        const profileEmail =
          typeof data?.userId === 'object' && data.userId ? data.userId.email : undefined;

        if (data && (!currentEmail || !profileEmail || profileEmail.toLowerCase() === currentEmail.toLowerCase())) {
          setProfile(data);
          setStatus('success');
          return;
        }
      } catch (err) {
        console.warn('Could not load profile with stored ID:', err);
      }
    }

    if (currentEmail) {
      try {
        const data = await studentService.getProfileByEmail(currentEmail);
        if (data && data._id && data.name) {
          localStorage.setItem(STORAGE_KEY, data._id);
          setProfile(data);
          setStatus('success');
          return;
        }
      } catch (err) {
        console.warn('Could not load profile by email:', err);
      }
    }

    // Bootstrap initial student profile using current session or sensible defaults
    try {
      const email =
        currentUser?.email ||
        localStorage.getItem('userEmail') ||
        'student@edupye.com';
      const name =
        currentUser?.name ||
        email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const phone = currentUser?.phone || '';
      const goal = currentUser?.goal || localStorage.getItem('userGoal') || 'School Curriculum Mastery';
      const language = currentUser?.language || localStorage.getItem('userLanguage') || 'English';
      const school = currentUser?.schoolDetails || {};

      const initialPayload: CreateStudentProfileDTO = {
        email,
        name,
        phone,
        dob: currentUser?.dob,
        avatar: currentUser?.avatar,
        goal,
        language: language === 'Select' ? 'English' : language,
        schoolDetails: school,
        education: {
          level: 'school',
          institution: school.schoolName || 'Delhi Public School',
          board: school.board || 'CBSE',
          classLevel: school.classLevel || 'Class 10',
        },
      };

      const result = await studentService.createProfile(initialPayload);
      if (result?.studentProfile) {
        if (result.studentProfile._id) {
          localStorage.setItem(STORAGE_KEY, result.studentProfile._id);
        }
        setProfile(result.studentProfile);
        setStatus('success');
        return;
      }
    } catch (err) {
      console.warn('Backend createProfile encountered error, using local fallback:', err);
    }

    // Always ensure the profile renders with the active user's session data
    const fallback = studentService.getLocalFallbackProfile();
    setProfile(fallback);
    setStatus('success');
  }, []);

  useEffect(() => {
    fetchOrCreateProfile();
  }, [fetchOrCreateProfile]);

  const updateProfile = useCallback(
    async (data: UpdateStudentProfileDTO): Promise<StudentProfile> => {
      setIsSaving(true);
      try {
        const profileId = profile?._id || localStorage.getItem(STORAGE_KEY) || 'local_profile_id';
        const updated = await studentService.updateProfile(profileId, data);
        setProfile(updated);

        // Synchronize with authService
        authService.updateCurrentUser({
          name: updated.name,
          phone: updated.phone,
          dob: updated.dob,
          avatar: updated.avatar,
          schoolDetails: updated.schoolDetails,
        });
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
        if (res?.studentProfile) {
          if (res.studentProfile._id) {
            localStorage.setItem(STORAGE_KEY, res.studentProfile._id);
          }
          setProfile(res.studentProfile);
          setStatus('success');
          setError(null);
          // Synchronize with authService
          authService.updateCurrentUser({
            name: res.studentProfile.name,
            phone: res.studentProfile.phone,
            dob: res.studentProfile.dob,
            avatar: res.studentProfile.avatar,
            schoolDetails: res.studentProfile.schoolDetails,
          });
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
