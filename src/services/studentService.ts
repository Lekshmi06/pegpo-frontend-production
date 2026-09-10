import {
  StudentDashboardData,
  Course,
  DocumentItem,
  StudentProfile,
  UpdateStudentProfileDTO,
  CreateStudentProfileDTO,
} from '../types/student';
import { SchoolAcademicInfo } from '../types/auth';
import { studentDashboardData, coursesData } from '../data/mockData';
import { authService } from './authService';
import { API_BASE_URL } from './apiClient';

const LOCAL_EXTENDED_PROFILE_KEY = 'pegpo_student_extended_profile';

function getLocalExtended(): Partial<StudentProfile> {
  try {
    const raw = localStorage.getItem(LOCAL_EXTENDED_PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalExtended(data: Partial<StudentProfile>) {
  try {
    const existing = getLocalExtended();
    localStorage.setItem(LOCAL_EXTENDED_PROFILE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {
    // Ignore quota issues
  }
}

function buildFallbackProfile(id = 'local_profile_id'): StudentProfile {
  const currentUser = authService.getCurrentUser();
  const extended = getLocalExtended();

  const email = currentUser?.email || localStorage.getItem('userEmail') || 'student@edupye.com';
  const name =
    currentUser?.name ||
    extended?.name ||
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const phone = currentUser?.phone || extended?.phone || '';
  const dob = currentUser?.dob || extended?.dob || '';
  const gender = currentUser?.gender || extended?.gender || 'Not specified';
  const avatar = currentUser?.avatar || extended?.avatar;
  const goal = currentUser?.goal || extended?.goal || 'School Curriculum Mastery';
  const language = currentUser?.language || 'English';

  const school = currentUser?.schoolDetails || extended?.schoolDetails || {};
  const schoolName = school.schoolName || 'Delhi Public School';
  const board = school.board || 'CBSE';
  const classLevel = school.classLevel || 'Class 10';

  return {
    _id: id,
    userId: {
      _id: 'user_local_id',
      email,
      userType: 'student',
      language,
    },
    name,
    phone,
    dob,
    gender,
    avatar,
    goal,
    education: {
      level: 'school',
      institution: schoolName,
      board,
      classLevel,
    },
    schoolDetails: {
      schoolName,
      board,
      classLevel,
      studyMode: school.studyMode || 'full_syllabus',
      selectedSubject: school.selectedSubject || 'Mathematics',
      customSubject: school.customSubject,
      syllabusFileName: school.syllabusFileName,
      textbookFileName: school.textbookFileName,
    },
    learningPath: currentUser?.learningPath || extended?.learningPath || 'school',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mergeProfileWithExtended(profile: StudentProfile): StudentProfile {
  const extended = getLocalExtended();
  const currentUser = authService.getCurrentUser();

  return {
    ...profile,
    name: profile.name || currentUser?.name || extended.name || 'Student',
    phone: profile.phone || currentUser?.phone || extended.phone,
    dob: extended.dob || currentUser?.dob || profile.dob,
    gender: extended.gender || currentUser?.gender || profile.gender,
    avatar: extended.avatar || currentUser?.avatar || profile.avatar,
    learningPath: extended.learningPath || currentUser?.learningPath || profile.learningPath || 'school',
    schoolDetails: {
      schoolName:
        profile.education?.institution ||
        currentUser?.schoolDetails?.schoolName ||
        extended.schoolDetails?.schoolName ||
        'Delhi Public School',
      board:
        profile.education?.board ||
        currentUser?.schoolDetails?.board ||
        extended.schoolDetails?.board ||
        'CBSE',
      classLevel:
        profile.education?.classLevel ||
        currentUser?.schoolDetails?.classLevel ||
        extended.schoolDetails?.classLevel ||
        'Class 10',
      studyMode:
        currentUser?.schoolDetails?.studyMode ||
        extended.schoolDetails?.studyMode ||
        'full_syllabus',
      selectedSubject:
        currentUser?.schoolDetails?.selectedSubject ||
        extended.schoolDetails?.selectedSubject ||
        'Mathematics',
      customSubject:
        currentUser?.schoolDetails?.customSubject ||
        extended.schoolDetails?.customSubject,
      syllabusFileName:
        currentUser?.schoolDetails?.syllabusFileName ||
        extended.schoolDetails?.syllabusFileName,
      textbookFileName:
        currentUser?.schoolDetails?.textbookFileName ||
        extended.schoolDetails?.textbookFileName,
    },
  };
}

async function safeParseResponse(res: Response): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return { success: false, message: `Server returned empty response (${res.status})` };
    }
    const json = JSON.parse(text);
    return json;
  } catch {
    return { success: false, message: `Invalid response format from server (${res.status})` };
  }
}

export const studentService = {
  getDashboardData: async (): Promise<StudentDashboardData> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...studentDashboardData };
  },

  getCourses: async (): Promise<Course[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...coursesData];
  },

  addDocument: async (doc: Omit<DocumentItem, 'id'>): Promise<DocumentItem> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newDoc: DocumentItem = {
      id: Date.now(),
      ...doc,
    };
    studentDashboardData.recentDocuments.unshift(newDoc);
    return newDoc;
  },

  getLocalFallbackProfile: (id?: string): StudentProfile => {
    return buildFallbackProfile(id);
  },

  getProfile: async (id: string): Promise<StudentProfile> => {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await safeParseResponse(res);
      if (res.ok && json.success && json.data) {
        return mergeProfileWithExtended(json.data);
      }
    } catch (err) {
      console.warn('Backend getProfile unreachable, using local session profile:', err);
    }

    // Graceful fallback to local session profile
    return buildFallbackProfile(id);
  },

  updateProfile: async (id: string, data: UpdateStudentProfileDTO): Promise<StudentProfile> => {
    saveLocalExtended({
      name: data.name,
      phone: data.phone,
      dob: data.dob,
      gender: data.gender,
      avatar: data.avatar,
      schoolDetails: data.schoolDetails,
    });

    const educationPayload = data.education || (data.schoolDetails ? {
      level: 'school' as const,
      institution: data.schoolDetails.schoolName,
      board: data.schoolDetails.board,
      classLevel: data.schoolDetails.classLevel,
    } : undefined);

    const backendPayload: Record<string, unknown> = {};
    if (data.name !== undefined) backendPayload.name = data.name;
    if (data.phone !== undefined) backendPayload.phone = data.phone;
    if (data.dob !== undefined) backendPayload.dob = data.dob;
    if (data.gender !== undefined) backendPayload.gender = data.gender;
    if (data.avatar !== undefined) backendPayload.avatar = data.avatar;
    if (data.goal !== undefined) backendPayload.goal = data.goal;
    if (data.learningPath !== undefined) backendPayload.learningPath = data.learningPath;
    if (data.language !== undefined) backendPayload.language = data.language;
    if (data.schoolDetails !== undefined) backendPayload.schoolDetails = data.schoolDetails;
    if (educationPayload) backendPayload.education = educationPayload;

    try {
      const res = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });

      const json = await safeParseResponse(res);
      if (res.ok && json.success && json.data) {
        return mergeProfileWithExtended(json.data);
      }
    } catch (err) {
      console.warn('Backend updateProfile unreachable, saved locally:', err);
    }

    return buildFallbackProfile(id);
  },

  updateSchoolProfile: async (id: string, schoolData: SchoolAcademicInfo): Promise<StudentProfile> => {
    return studentService.updateProfile(id, {
      schoolDetails: schoolData,
      education: {
        level: 'school',
        institution: schoolData.schoolName,
        board: schoolData.board,
        classLevel: schoolData.classLevel,
      },
    });
  },

  createProfile: async (
    data: CreateStudentProfileDTO
  ): Promise<{ user: unknown; studentProfile: StudentProfile }> => {
    saveLocalExtended({
      name: data.name,
      phone: data.phone,
      dob: data.dob,
      gender: data.gender,
      avatar: data.avatar,
      schoolDetails: data.schoolDetails,
    });

    const educationPayload = data.education || (data.schoolDetails ? {
      level: 'school' as const,
      institution: data.schoolDetails.schoolName,
      board: data.schoolDetails.board,
      classLevel: data.schoolDetails.classLevel,
    } : undefined);

    const backendPayload = {
      email: data.email,
      name: data.name,
      phone: data.phone,
      goal: data.goal,
      language: data.language,
      education: educationPayload,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });

      const json = await safeParseResponse(res);
      if (res.ok && json.data) {
        return {
          user: json.data.user || { email: data.email },
          studentProfile: mergeProfileWithExtended(json.data.studentProfile || json.data),
        };
      }

      if (res.status === 409 && json.data?.studentProfile) {
        return {
          user: json.data.user,
          studentProfile: mergeProfileWithExtended(json.data.studentProfile),
        };
      }
    } catch (err) {
      console.warn('Backend createProfile unreachable, using local session profile:', err);
    }

    const fallback = buildFallbackProfile();
    return {
      user: { email: data.email },
      studentProfile: fallback,
    };
  },

  getProfileByEmail: async (email: string): Promise<StudentProfile> => {
    try {
      const res = await fetch(`${API_BASE_URL}/students/by-email/${encodeURIComponent(email)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await safeParseResponse(res);
      if (res.ok && json.success && json.data) {
        return mergeProfileWithExtended(json.data);
      }
    } catch (err) {
      console.warn('Backend getProfileByEmail unreachable, using local session profile:', err);
    }

    return buildFallbackProfile();
  },
};
