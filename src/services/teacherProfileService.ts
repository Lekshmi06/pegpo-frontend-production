import { TeacherProfile } from '../types/teacher';
import { API_BASE_URL } from './apiClient';

const TEACHER_PROFILE_ID_KEY = 'teacherProfileId';
const TEACHER_PROFILE_CACHE_KEY = 'teacherProfileData';

export const teacherProfileService = {
  getProfileId: (): string | null => {
    return localStorage.getItem(TEACHER_PROFILE_ID_KEY);
  },

  setProfileId: (id: string): void => {
    localStorage.setItem(TEACHER_PROFILE_ID_KEY, id);
  },

  getCachedProfile: (): TeacherProfile | null => {
    const raw = localStorage.getItem(TEACHER_PROFILE_CACHE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  },

  getProfile: async (): Promise<TeacherProfile> => {
    let profileId = localStorage.getItem(TEACHER_PROFILE_ID_KEY);
    const cached = teacherProfileService.getCachedProfile();

    if (profileId) {
      try {
        const res = await fetch(`${API_BASE_URL}/teachers/${profileId}`);
        const json = await res.json();
        if (res.ok && json.data) {
          localStorage.setItem(TEACHER_PROFILE_CACHE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      } catch (err) {
        console.warn('Failed to fetch teacher profile from API, fallback to cache:', err);
      }
    }

    // If profileId is absent or fetch failed, attempt resolving via email or token
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');

    if (userEmail) {
      try {
        const res = await fetch(`${API_BASE_URL}/teachers/by-email/${encodeURIComponent(userEmail)}`);
        const json = await res.json();
        if (res.ok && json.data) {
          if (json.data._id) {
            localStorage.setItem(TEACHER_PROFILE_ID_KEY, json.data._id);
          }
          localStorage.setItem(TEACHER_PROFILE_CACHE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      } catch (err) {
        console.warn('Failed to fetch teacher profile by email:', err);
      }
    }

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/teachers/me?userId=${encodeURIComponent(token)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok && json.data) {
          if (json.data._id) {
            localStorage.setItem(TEACHER_PROFILE_ID_KEY, json.data._id);
          }
          localStorage.setItem(TEACHER_PROFILE_CACHE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      } catch (err) {
        console.warn('Failed to fetch teacher profile by token:', err);
      }
    }

    if (cached) return cached;

    // Default fallback profile if offline
    const fallbackEmail = userEmail || 'teacher@edupye.com';
    const fallback: TeacherProfile = {
      name: fallbackEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      teacherType: 'institution',
      institution: 'St. Xavier High School',
      department: 'Science',
      designation: 'Senior Faculty',
      subjects: ['Physics', 'Science'],
      classesTaught: ['Class 10', 'Class 11', 'Class 12'],
      boards: ['CBSE'],
      experienceYears: 5,
      goal: localStorage.getItem('userGoal') || 'Lesson Planning',
      preferences: {
        activeDepartment: 'Science',
        activeSubject: 'Physics',
      },
    };
    return fallback;
  },

  saveTeacherDetails: async (
    details: Partial<TeacherProfile>
  ): Promise<TeacherProfile> => {
    let profileId = localStorage.getItem(TEACHER_PROFILE_ID_KEY);
    const cached: Partial<TeacherProfile> = teacherProfileService.getCachedProfile() || {};
    const merged: TeacherProfile = {
      ...cached,
      ...details,
      name: details.name || cached.name || 'Teacher',
      teacherType: details.teacherType || cached.teacherType || 'institution',
      subjects: details.subjects || cached.subjects || [],
      classesTaught: details.classesTaught || cached.classesTaught || [],
      boards: details.boards || cached.boards || [],
    };

    localStorage.setItem(TEACHER_PROFILE_CACHE_KEY, JSON.stringify(merged));

    let savedData: TeacherProfile = merged;

    if (profileId) {
      try {
        const res = await fetch(`${API_BASE_URL}/teachers/${profileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(details),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          savedData = json.data;
          localStorage.setItem(TEACHER_PROFILE_CACHE_KEY, JSON.stringify(json.data));
        }
      } catch (err) {
        console.warn('Failed to update teacher profile on backend:', err);
      }
    } else {
      // If no profileId yet, create one
      try {
        const userEmail = localStorage.getItem('userEmail');
        const res = await fetch(`${API_BASE_URL}/teachers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...details,
            email: userEmail,
            name: merged.name,
          }),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          if (json.data._id) {
            profileId = json.data._id;
            localStorage.setItem(TEACHER_PROFILE_ID_KEY, json.data._id);
          }
          savedData = json.data;
          localStorage.setItem(TEACHER_PROFILE_CACHE_KEY, JSON.stringify(json.data));
        }
      } catch (err) {
        console.warn('Failed to create teacher profile on backend:', err);
      }
    }

    // Keep authService session synchronized
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        parsed.name = savedData.name || parsed.name;
        parsed.teacherDetails = {
          ...parsed.teacherDetails,
          ...savedData,
        };
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }

    // Broadcast reactive update event for layouts and components
    window.dispatchEvent(
      new CustomEvent('teacher-profile-updated', { detail: savedData })
    );

    return savedData;
  },

  updateProfile: async (updates: Partial<TeacherProfile>): Promise<TeacherProfile> => {
    return teacherProfileService.saveTeacherDetails(updates);
  },

  updatePassword: async (password: string): Promise<void> => {
    let profileId = localStorage.getItem(TEACHER_PROFILE_ID_KEY);
    if (!profileId) {
      // Attempt to resolve profile first
      const profile = await teacherProfileService.getProfile();
      profileId = profile._id || localStorage.getItem(TEACHER_PROFILE_ID_KEY);
    }
    if (!profileId) {
      throw new Error('Teacher profile ID not found');
    }

    const res = await fetch(`${API_BASE_URL}/teachers/${profileId}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.message || 'Failed to update password');
    }
  },
};
