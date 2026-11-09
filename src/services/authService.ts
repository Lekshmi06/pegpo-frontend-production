import {
  UserSession,
  UserRole,
  LearningPath,
  PersonalDetails,
  SchoolAcademicInfo,
  UndergraduateAcademicInfo,
  PostgraduateAcademicInfo,
  CompetitiveExamAcademicInfo,
} from '../types/auth';
import { API_BASE_URL } from './apiClient';

const STORAGE_KEY = 'user';
const EMAIL_KEY = 'userEmail';
const ROLE_KEY = 'userRole';
const GOAL_KEY = 'userGoal';
const LANG_KEY = 'userLanguage';
const PROFILE_ID_KEY = 'studentProfileId';
const TOKEN_KEY = 'token';

export const EDUPYE_TRACK_CHANGE_EVENT = 'edupye:learning-track-changed';

export interface TrackChangeEventDetail {
  learningPath: LearningPath;
}

export const authService = {
  signUp: async (email: string, password?: string, name?: string, userType?: UserRole): Promise<UserSession> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter a valid email address');
    }

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password, name, userType: userType || 'student' }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg =
        json?.message ||
        'This email ID already has an account or is already in use. Please log in instead.';
      throw new Error(errorMsg);
    }

    let profileId: string | undefined;
    let registeredName = name;

    if (json?.data) {
      if (json.data.token) localStorage.setItem(TOKEN_KEY, json.data.token);
      if (json.data.studentProfile?._id) {
        profileId = json.data.studentProfile._id;
        localStorage.setItem(PROFILE_ID_KEY, json.data.studentProfile._id);
      }
      if (json.data.user?.name) registeredName = json.data.user.name;
    }

    const resolvedRole: UserRole = (userType || (json?.data?.user?.userType as UserRole) || 'student');
    const session: UserSession = {
      email: cleanEmail,
      name:
        registeredName ||
        cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: resolvedRole,
      learningPath: 'school',
      language: 'English',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(EMAIL_KEY, session.email);
    localStorage.setItem(ROLE_KEY, session.role || 'student');
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
        const { user, studentProfile, teacherProfile, researcherProfile, token } = json.data;
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (studentProfile?._id) localStorage.setItem(PROFILE_ID_KEY, studentProfile._id);
        if (teacherProfile?._id) localStorage.setItem('teacherProfileId', teacherProfile._id);
        if (researcherProfile?._id) localStorage.setItem('researcherProfileId', researcherProfile._id);

        if (user.userType === 'provider') {
          localStorage.setItem(ROLE_KEY, 'provider');
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: 'provider',
            language: user.language || 'English',
            goal: 'Course Creation',
            createdAt: new Date().toISOString(),
          };
        } else if (user.userType === 'learner') {
          localStorage.setItem(ROLE_KEY, 'learner');
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: 'learner',
            language: user.language || 'English',
            goal: 'Browse Courses',
            createdAt: new Date().toISOString(),
          };
        } else if (user.userType === 'company' || user.userType === 'institution') {
          localStorage.setItem(ROLE_KEY, user.userType);
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: user.userType,
            language: user.language || 'English',
            goal: 'Corporate & Institutional Learning',
            createdAt: new Date().toISOString(),
          };
        } else if (user.userType === 'teacher' || (!user.userType && teacherProfile)) {
          localStorage.setItem(ROLE_KEY, 'teacher');
          session = {
            email: user.email,
            name: teacherProfile?.name || user.name || cleanEmail.split('@')[0],
            role: 'teacher',
            language: user.language || 'English',
            phone: teacherProfile?.phone,
            dob: teacherProfile?.dob,
            gender: teacherProfile?.gender,
            avatar: teacherProfile?.avatar,
            goal: teacherProfile?.goal || 'Lesson Planning',
            teacherDetails: {
              teacherType: teacherProfile?.teacherType || 'institution',
              institution: teacherProfile?.institution,
              tuitionCentre: teacherProfile?.tuitionCentre,
              department: teacherProfile?.department,
              designation: teacherProfile?.designation,
              subjects: teacherProfile?.subjects || [],
              classesTaught: teacherProfile?.classesTaught || [],
              boards: teacherProfile?.boards || [],
              experienceYears: teacherProfile?.experienceYears || 0,
            },
            createdAt: teacherProfile?.createdAt || new Date().toISOString(),
          };
        } else if (user.userType === 'researcher' || (!user.userType && researcherProfile)) {
          localStorage.setItem(ROLE_KEY, 'researcher');
          session = {
            email: user.email,
            name: researcherProfile?.fullName || user.name || cleanEmail.split('@')[0],
            role: 'researcher',
            language: user.language || 'English',
            phone: researcherProfile?.contact?.phone,
            researcherProfileId: researcherProfile?._id,
            researcherDetails: researcherProfile,
            goal: researcherProfile?.researchGoals?.primaryGoals?.[0] || 'Literature review',
            createdAt: researcherProfile?.createdAt || new Date().toISOString(),
          };
        } else {
          localStorage.setItem(ROLE_KEY, 'student');
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
      }
    } catch (err: any) {
      throw err instanceof Error ? err : new Error('Unable to connect to the authentication service.');
    }

    if (!session) {
      throw new Error('Authentication failed: no session was returned by the server.');
    }

    localStorage.setItem(EMAIL_KEY, session.email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  googleAuth: async (credential: string, userType?: UserRole): Promise<UserSession & { isNewUser?: boolean }> => {
    if (!credential || !credential.trim()) {
      throw new Error('Google credential is required');
    }

    let session: UserSession | null = null;
    let isNewUser = false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, userType }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || 'Google authentication failed. Please try again.');
      }

      if (json?.data) {
        const { user, studentProfile, teacherProfile, researcherProfile, token } = json.data;
        isNewUser = Boolean(json.data.isNewUser);

        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (studentProfile?._id) localStorage.setItem(PROFILE_ID_KEY, studentProfile._id);
        if (teacherProfile?._id) localStorage.setItem('teacherProfileId', teacherProfile._id);
        if (researcherProfile?._id) localStorage.setItem('researcherProfileId', researcherProfile._id);

        const cleanEmail = (user.email || '').trim().toLowerCase();

        if (user.userType === 'provider') {
          localStorage.setItem(ROLE_KEY, 'provider');
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: 'provider',
            language: user.language || 'English',
            goal: 'Course Creation',
            createdAt: new Date().toISOString(),
          };
        } else if (user.userType === 'learner') {
          localStorage.setItem(ROLE_KEY, 'learner');
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: 'learner',
            language: user.language || 'English',
            goal: 'Browse Courses',
            createdAt: new Date().toISOString(),
          };
        } else if (user.userType === 'company' || user.userType === 'institution') {
          localStorage.setItem(ROLE_KEY, user.userType);
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: user.userType,
            language: user.language || 'English',
            goal: 'Corporate & Institutional Learning',
            createdAt: new Date().toISOString(),
          };
        } else if (user.userType === 'teacher' || (!user.userType && teacherProfile)) {
          localStorage.setItem(ROLE_KEY, 'teacher');
          session = {
            email: user.email,
            name: teacherProfile?.name || user.name || cleanEmail.split('@')[0],
            role: 'teacher',
            language: user.language || 'English',
            phone: teacherProfile?.phone,
            dob: teacherProfile?.dob,
            gender: teacherProfile?.gender,
            avatar: teacherProfile?.avatar,
            goal: teacherProfile?.goal || 'Lesson Planning',
            teacherDetails: {
              teacherType: teacherProfile?.teacherType || 'institution',
              institution: teacherProfile?.institution,
              tuitionCentre: teacherProfile?.tuitionCentre,
              department: teacherProfile?.department,
              designation: teacherProfile?.designation,
              subjects: teacherProfile?.subjects || [],
              classesTaught: teacherProfile?.classesTaught || [],
              boards: teacherProfile?.boards || [],
              experienceYears: teacherProfile?.experienceYears || 0,
            },
            createdAt: teacherProfile?.createdAt || new Date().toISOString(),
          };
        } else if (user.userType === 'researcher' || (!user.userType && researcherProfile)) {
          localStorage.setItem(ROLE_KEY, 'researcher');
          session = {
            email: user.email,
            name: researcherProfile?.fullName || user.name || cleanEmail.split('@')[0],
            role: 'researcher',
            language: user.language || 'English',
            phone: researcherProfile?.contact?.phone,
            researcherProfileId: researcherProfile?._id,
            researcherDetails: researcherProfile,
            goal: researcherProfile?.researchGoals?.primaryGoals?.[0] || 'Literature review',
            createdAt: researcherProfile?.createdAt || new Date().toISOString(),
          };
        } else {
          localStorage.setItem(ROLE_KEY, 'student');
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
      }
    } catch (err: any) {
      throw err instanceof Error ? err : new Error('Unable to connect to the authentication service.');
    }

    if (!session) {
      throw new Error('Authentication failed: no session was returned by the server.');
    }

    localStorage.setItem(EMAIL_KEY, session.email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { ...session, isNewUser };
  },

  mockGoogleAuth: async (params: {
    accountId?: string;
    email?: string;
    name?: string;
    userType?: UserRole;
    isNewUserTest?: boolean;
  }): Promise<UserSession & { isNewUser?: boolean }> => {
    let session: UserSession | null = null;
    let isNewUser = false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/mock-google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || 'Mock Google authentication failed. Please try again.');
      }

      if (json?.data) {
        const { user, studentProfile, teacherProfile, researcherProfile, token } = json.data;
        isNewUser = Boolean(json.data.isNewUser);

        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (studentProfile?._id) localStorage.setItem(PROFILE_ID_KEY, studentProfile._id);
        if (teacherProfile?._id) localStorage.setItem('teacherProfileId', teacherProfile._id);
        if (researcherProfile?._id) localStorage.setItem('researcherProfileId', researcherProfile._id);

        const cleanEmail = (user.email || '').trim().toLowerCase();
        const resolvedRole: UserRole = (user.userType as UserRole) || params.userType || 'student';

        if (resolvedRole === 'provider') {
          localStorage.setItem(ROLE_KEY, 'provider');
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: 'provider',
            language: user.language || 'English',
            goal: 'Course Creation',
            createdAt: new Date().toISOString(),
          };
        } else if (resolvedRole === 'learner') {
          localStorage.setItem(ROLE_KEY, 'learner');
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: 'learner',
            language: user.language || 'English',
            goal: 'Browse Courses',
            createdAt: new Date().toISOString(),
          };
        } else if (resolvedRole === 'company' || resolvedRole === 'institution') {
          localStorage.setItem(ROLE_KEY, resolvedRole);
          session = {
            email: user.email,
            name: user.name || cleanEmail.split('@')[0],
            role: resolvedRole,
            language: user.language || 'English',
            goal: 'Corporate & Institutional Learning',
            createdAt: new Date().toISOString(),
          };
        } else if (resolvedRole === 'teacher' || (!user.userType && teacherProfile)) {
          localStorage.setItem(ROLE_KEY, 'teacher');
          session = {
            email: user.email,
            name: teacherProfile?.name || user.name || cleanEmail.split('@')[0],
            role: 'teacher',
            language: user.language || 'English',
            phone: teacherProfile?.phone,
            dob: teacherProfile?.dob,
            gender: teacherProfile?.gender,
            avatar: teacherProfile?.avatar,
            goal: teacherProfile?.goal || 'Lesson Planning',
            teacherDetails: {
              teacherType: teacherProfile?.teacherType || 'institution',
              institution: teacherProfile?.institution,
              tuitionCentre: teacherProfile?.tuitionCentre,
              department: teacherProfile?.department,
              designation: teacherProfile?.designation,
              subjects: teacherProfile?.subjects || [],
              classesTaught: teacherProfile?.classesTaught || [],
              boards: teacherProfile?.boards || [],
              experienceYears: teacherProfile?.experienceYears || 0,
            },
            createdAt: teacherProfile?.createdAt || new Date().toISOString(),
          };
        } else if (resolvedRole === 'researcher' || (!user.userType && researcherProfile)) {
          localStorage.setItem(ROLE_KEY, 'researcher');
          session = {
            email: user.email,
            name: researcherProfile?.fullName || user.name || cleanEmail.split('@')[0],
            role: 'researcher',
            language: user.language || 'English',
            phone: researcherProfile?.contact?.phone,
            researcherProfileId: researcherProfile?._id,
            researcherDetails: researcherProfile,
            goal: researcherProfile?.researchGoals?.primaryGoals?.[0] || 'Literature review',
            createdAt: researcherProfile?.createdAt || new Date().toISOString(),
          };
        } else {
          localStorage.setItem(ROLE_KEY, 'student');
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
      }
    } catch (err: any) {
      throw err instanceof Error ? err : new Error('Unable to connect to the authentication service.');
    }

    if (!session) {
      throw new Error('Authentication failed: no session was returned by the server.');
    }

    localStorage.setItem(EMAIL_KEY, session.email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { ...session, isNewUser };
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
    const cleanRole = (role || 'student').toLowerCase() as UserRole;
    const token = localStorage.getItem(TOKEN_KEY);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/select-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: token,
          email: current.email,
          role: cleanRole,
        }),
      });

      const json = await res.json().catch(() => null);
      if (json?.data) {
        if (json.data.token) localStorage.setItem(TOKEN_KEY, json.data.token);
        if (json.data.studentProfile?._id) {
          localStorage.setItem(PROFILE_ID_KEY, json.data.studentProfile._id);
        }
        if (json.data.teacherProfile?._id) {
          localStorage.setItem('teacherProfileId', json.data.teacherProfile._id);
        }
        if (json.data.researcherProfile?._id) {
          localStorage.setItem('researcherProfileId', json.data.researcherProfile._id);
        }
      }
    } catch (err) {
      console.warn('Could not sync role to backend, using local state:', err);
    }

    const updated: UserSession = {
      ...current,
      role: cleanRole,
    };
    localStorage.setItem(ROLE_KEY, cleanRole);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  setLearningPath: async (learningPath: LearningPath): Promise<UserSession> => {
    const cleanTrack: LearningPath =
      learningPath === 'undergraduate'
        ? 'undergraduate'
        : learningPath === 'postgraduate'
        ? 'postgraduate'
        : learningPath === 'competitive_exam' || (learningPath as string) === 'competitive'
        ? 'competitive_exam'
        : 'school';

    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const profileId = localStorage.getItem(PROFILE_ID_KEY);

    // If student has a persisted profile ID on the backend, update backend first
    if (profileId && profileId !== 'local_profile_id') {
      const authHeaders = authService.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/students/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          learningPath: cleanTrack,
          education: {
            level: cleanTrack,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.message || `Failed to update learning track on server (${res.status})`;
        throw new Error(errMsg);
      }

      const json = await res.json().catch(() => null);
      if (!json?.success) {
        throw new Error(json?.message || 'Server rejected learning track update');
      }
    }

    // Only update local session after backend confirms success
    const updated: UserSession = {
      ...current,
      learningPath: cleanTrack,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch reactive track change event to all active UI subscribers
    authService.dispatchTrackChange(cleanTrack);

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

    // Sync to backend MongoDB
    const profileId = localStorage.getItem(PROFILE_ID_KEY);
    if (profileId && profileId !== 'local_profile_id') {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${profileId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders(),
          },
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
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          console.warn('Backend rejected school details update:', errJson?.message || res.status);
        }
      } catch (err) {
        console.warn('Could not sync school details to backend:', err);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    authService.dispatchTrackChange('school');
    return updated;
  },

  saveUndergraduateDetails: async (details: UndergraduateAcademicInfo): Promise<UserSession> => {
    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const updated: UserSession = {
      ...current,
      learningPath: 'undergraduate',
      undergraduateDetails: {
        ...current.undergraduateDetails,
        ...details,
      },
    };

    const profileId = localStorage.getItem(PROFILE_ID_KEY);
    if (profileId && profileId !== 'local_profile_id') {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${profileId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders(),
          },
          body: JSON.stringify({
            learningPath: 'undergraduate',
            undergraduateDetails: details,
            education: {
              level: 'undergraduate',
              institution: details.institution,
              degree: details.degree,
              specialization: details.specialization,
            },
          }),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          console.warn('Backend rejected UG details update:', errJson?.message || res.status);
        }
      } catch (err) {
        console.warn('Could not sync UG details to backend:', err);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    authService.dispatchTrackChange('undergraduate');
    return updated;
  },

  savePostgraduateDetails: async (details: PostgraduateAcademicInfo): Promise<UserSession> => {
    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const updated: UserSession = {
      ...current,
      learningPath: 'postgraduate',
      postgraduateDetails: {
        ...current.postgraduateDetails,
        ...details,
      },
    };

    const profileId = localStorage.getItem(PROFILE_ID_KEY);
    if (profileId && profileId !== 'local_profile_id') {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${profileId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders(),
          },
          body: JSON.stringify({
            learningPath: 'postgraduate',
            postgraduateDetails: details,
            education: {
              level: 'postgraduate',
              institution: details.institution,
              degree: details.degree,
              specialization: details.specialization,
            },
          }),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          console.warn('Backend rejected PG details update:', errJson?.message || res.status);
        }
      } catch (err) {
        console.warn('Could not sync PG details to backend:', err);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    authService.dispatchTrackChange('postgraduate');
    return updated;
  },

  saveCompetitiveExamDetails: async (details: CompetitiveExamAcademicInfo): Promise<UserSession> => {
    const current = authService.getCurrentUser() || { email: 'student@edupye.com' };
    const updated: UserSession = {
      ...current,
      learningPath: 'competitive_exam',
      competitiveExamDetails: {
        ...current.competitiveExamDetails,
        ...details,
      },
    };

    const profileId = localStorage.getItem(PROFILE_ID_KEY);
    if (profileId && profileId !== 'local_profile_id') {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${profileId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders(),
          },
          body: JSON.stringify({
            learningPath: 'competitive_exam',
            competitiveExamDetails: details,
            education: {
              level: 'competitive_exam',
              institution: details.targetExam,
              specialization: details.category || details.targetExam,
            },
          }),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          console.warn('Backend rejected competitive exam details update:', errJson?.message || res.status);
        }
      } catch (err) {
        console.warn('Could not sync competitive exam details to backend:', err);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    authService.dispatchTrackChange('competitive_exam');
    return updated;
  },

  saveTeacherDetails: async (details: {
    teacherType?: 'institution' | 'tuition';
    institution?: string;
    tuitionCentre?: string;
    department?: string;
    designation?: string;
    subjects?: string[];
    classesTaught?: string[];
    boards?: string[];
    experienceYears?: number;
  }): Promise<UserSession> => {
    const current = authService.getCurrentUser() || { email: 'teacher@edupye.com' };
    const updated: UserSession = {
      ...current,
      role: 'teacher',
      teacherDetails: {
        ...current.teacherDetails,
        ...details,
      },
    };
    localStorage.setItem(ROLE_KEY, 'teacher');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const profileId = localStorage.getItem('teacherProfileId');
    try {
      if (profileId) {
        await fetch(`${API_BASE_URL}/teachers/${profileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(details),
        });
      } else {
        const res = await fetch(`${API_BASE_URL}/teachers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...details,
            email: current.email,
            name: current.name || 'Teacher',
          }),
        });
        const json = await res.json().catch(() => null);
        if (json?.data?._id) {
          localStorage.setItem('teacherProfileId', json.data._id);
        }
      }
    } catch (err) {
      console.warn('Could not sync teacher details to backend:', err);
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
    localStorage.removeItem('teacherProfileId');
    localStorage.removeItem('teacherProfileData');
    localStorage.removeItem('researcherProfileId');
    localStorage.removeItem('researcherProfileData');
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getAuthHeaders: (): Record<string, string> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const profileId = localStorage.getItem(PROFILE_ID_KEY);
    const userJson = localStorage.getItem(STORAGE_KEY);
    let userId = '';
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        userId = u.id || u._id || '';
      } catch {
        // Continue
      }
    }
    const effectiveToken = token || userId;
    const headers: Record<string, string> = {};
    if (effectiveToken) {
      headers['Authorization'] = `Bearer ${effectiveToken}`;
      headers['x-user-id'] = effectiveToken;
    }
    if (profileId) {
      headers['x-student-profile-id'] = profileId;
    }
    return headers;
  },

  dispatchTrackChange: (learningPath: LearningPath) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<TrackChangeEventDetail>(EDUPYE_TRACK_CHANGE_EVENT, {
          detail: { learningPath },
        })
      );
    }
  },

  onTrackChange: (callback: (track: LearningPath) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<TrackChangeEventDetail>;
      if (customEvent.detail?.learningPath) {
        callback(customEvent.detail.learningPath);
      }
    };
    window.addEventListener(EDUPYE_TRACK_CHANGE_EVENT, handler);
    return () => {
      window.removeEventListener(EDUPYE_TRACK_CHANGE_EVENT, handler);
    };
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
