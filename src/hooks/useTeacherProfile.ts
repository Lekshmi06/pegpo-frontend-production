import { useState, useEffect, useCallback } from 'react';
import { TeacherProfile } from '../types/teacher';
import { teacherProfileService } from '../services/teacherProfileService';

export function useTeacherProfile() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teacherProfileService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teacher profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<TeacherProfile>): Promise<TeacherProfile> => {
    setIsSaving(true);
    try {
      const updated = await teacherProfileService.updateProfile(updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile';
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
