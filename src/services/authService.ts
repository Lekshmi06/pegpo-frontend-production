import {
  UserSession,
  UserRole,
  LearningPath,
  PersonalDetails,
  SchoolAcademicInfo,
} from '../types/auth';
import { API_BASE_URL } from './apiClient';

const STORAGE_KEY = 'user';
const EMAIL_KEY = 'userEmail';
const ROLE_KEY = 'userRole';
const GOAL_KEY = 'userGoal';
const LANG_KEY = 'userLanguage';
const PROFILE_ID_KEY = 'studentProfileId';
const TOKEN_KEY = 'token';

export const authService = {
  signUp: async (email: string, password?: string, name?: string): Promise<UserSession> => {
    const cleanEmail = (email || '').trim().toLowerCase() || 'student@edupye.com';
    let profileId: string | undefined;
    let registeredName = name;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, name }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.data) {
        if (json.data.token) localStorage.setItem(TOKEN_KEY, json.data.token);
        if (json.data.studentProfile?._id) {
          profileId = json.data.studentProfile._id;
          localStorage.setItem(PROFILE_ID_KEY, json.data.studentProfile._id);
        }
        if (json.data.user?.name) registeredName = json.data.user.name;
      }
    } catch (err) {
      console.warn('Backend register failed/offline, continuing with local session:', err);
    }

    const session: UserSession = {
      email: cleanEmail,
      name:
        registeredName ||
        cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: 'student',
      learningPath: 'school',
      language: 'English',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(EMAIL_KEY, session.email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  login: async (email: string, password?: string): Promise<UserSession> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter a valid email');
    }

    let session: UserSession | null = null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || 'Invalid email or password');
      }

      if (json?.data) {
        const { user, studentProfile, token } = json.data;
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (studentProfile?._id) localStorage.setItem(PROFILE_ID_KEY, studentProfile._id);

        session = {
          email: user.email,
          name: studentProfile?.name || user.name || cleanEmail.split('@')[0],
          role: 'student',
          learningPath: studentProfile?.learningPath || 'school',
          language: user.language || 'English',
          phone: studentProfile?.phone,
          dob: studentProfile?.dob,
          gender: studentProfile?.gender,
          avatar: studentProfile?.avatar,
          goal: studentProfile?.goal || 'School Curriculum Mastery',
          schoolDetails: studentProfile?.schoolDetails,
          createdAt: studentProfile?.createdAt || new Date().toISOString(),
        };
      }
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Invalid') || err.message.includes('required') || err.message.includes('password'))) {
        throw err;
      }
      console.warn('Backend login unreachable, falling back to cached local session:', err);
    }

    if (!session) {
      const existing = authService.getCurrentUser();
      if (existing && existing.email.toLowerCase() === cleanEmail) {
        session = existing;
      } else {
        session = {
          email: cleanEmail,
          name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          role: (localStorage.getItem(ROLE_KEY) as UserRole) || 'student',
          learningPath: 'school',
          language: localStorage.getItem(LANG_KEY) || 'English',
          goal: localStorage.getItem(GOAL_KEY) || 'Prepare for Exam',
          createdAt: new Date().toISOString(),
        };
      }
    }

    localStorage.setItem(EMAIL_KEY, session.email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  savePersonalDetails: async (details: PersonalDetails): Promise<UserSession> => {
    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const updated: UserSession = {
      ...current,
      name: details.name.trim() || current.name || 'Student',
      phone: details.phone?.trim() || current.phone,
      dob: details.dob || current.dob,
      gender: details.gender || current.gender,
      avatar: details.avatar || current.avatar,
      language: details.language || current.language || 'English',
    };
    if (updated.language) localStorage.setItem(LANG_KEY, updated.language);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Sync to backend MongoDB if profile ID is available
    const profileId = localStorage.getItem(PROFILE_ID_KEY);
    if (profileId) {
      try {
        await fetch(`${API_BASE_URL}/students/${profileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updated.name,
            phone: updated.phone,
            dob: updated.dob,
            gender: updated.gender,
            avatar: updated.avatar,
            language: updated.language,
          }),
        });
      } catch (err) {
        console.warn('Could not sync personal details to backend:', err);
      }
    }

    return updated;
  },

  selectRole: async (role: UserRole): Promise<UserSession> => {
    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const updated: UserSession = {
      ...current,
      role,
    };
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  setLearningPath: async (learningPath: LearningPath): Promise<UserSession> => {
    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const updated: UserSession = {
      ...current,
      learningPath,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  saveSchoolDetails: async (details: SchoolAcademicInfo): Promise<UserSession> => {
    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const updated: UserSession = {
      ...current,
      learningPath: 'school',
      schoolDetails: {
        ...current.schoolDetails,
        ...details,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Sync to backend MongoDB
    const profileId = localStorage.getItem(PROFILE_ID_KEY);
    if (profileId) {
      try {
        await fetch(`${API_BASE_URL}/students/${profileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            learningPath: 'school',
            schoolDetails: details,
            education: {
              level: 'school',
              institution: details.schoolName,
              board: details.board,
              classLevel: details.classLevel,
            },
          }),
        });
      } catch (err) {
        console.warn('Could not sync school details to backend:', err);
      }
    }

    return updated;
  },

  setOnboardingGoal: async (goal: string): Promise<void> => {
    localStorage.setItem(GOAL_KEY, goal);
    const current = authService.getCurrentUser();
    if (current) {
      current.goal = goal;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  },

  logout: (): void => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(GOAL_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(LANG_KEY);
    localStorage.removeItem(PROFILE_ID_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser: (): UserSession | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Continue to fallback
      }
    }
    const email = localStorage.getItem(EMAIL_KEY);
    if (email) {
      return {
        email,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role: (localStorage.getItem(ROLE_KEY) as UserRole) || 'student',
        learningPath: 'school',
        language: localStorage.getItem(LANG_KEY) || 'English',
        goal: localStorage.getItem(GOAL_KEY) || 'Prepare for Exam',
      };
    }
    return null;
  },

  updateCurrentUser: (updates: Partial<UserSession>): UserSession => {
    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const updated: UserSession = {
      ...current,
      ...updates,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (updated.email) localStorage.setItem(EMAIL_KEY, updated.email);
    if (updated.role) localStorage.setItem(ROLE_KEY, updated.role);
    if (updated.language) localStorage.setItem(LANG_KEY, updated.language);
    if (updated.goal) localStorage.setItem(GOAL_KEY, updated.goal);
    return updated;
  },
};
