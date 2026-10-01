import { ResearcherProfileData } from '../types/researcher';
import { API_BASE_URL } from './apiClient';

const RESEARCHER_PROFILE_ID_KEY = 'researcherProfileId';
const RESEARCHER_PROFILE_CACHE_KEY = 'researcherProfileData';

const getStoredUserEmail = (): string => {
  const direct = localStorage.getItem('userEmail');
  if (direct) return direct.trim().toLowerCase();
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed.email) return parsed.email.trim().toLowerCase();
    }
  } catch {}
  return '';
};

const getStoredToken = (): string => {
  const direct = localStorage.getItem('token');
  if (direct) return direct;
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed.token) return parsed.token;
      if (parsed.id) return parsed.id;
      if (parsed._id) return parsed._id;
    }
  } catch {}
  return '';
};

export const researcherProfileService = {
  getProfileId: (): string | null => {
    const direct = localStorage.getItem(RESEARCHER_PROFILE_ID_KEY);
    if (direct && direct.trim()) return direct.trim();

    const cached = researcherProfileService.getCachedProfile();
    if (cached?._id) {
      localStorage.setItem(RESEARCHER_PROFILE_ID_KEY, cached._id);
      return cached._id;
    }

    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        const resolved = parsed.researcherProfileId || parsed._id || parsed.id;
        if (resolved) return String(resolved);
      }
    } catch {}

    const directUser = localStorage.getItem('userId') || localStorage.getItem('user_id');
    if (directUser && directUser.trim()) return directUser.trim();

    const token = localStorage.getItem('token');
    if (token && token.trim()) return token.trim();

    const directEmail = localStorage.getItem('userEmail');
    if (directEmail && directEmail.trim()) return directEmail.trim();

    return null;
  },

  setProfileId: (id: string): void => {
    localStorage.setItem(RESEARCHER_PROFILE_ID_KEY, id);
  },

  getCachedProfile: (): ResearcherProfileData | null => {
    const raw = localStorage.getItem(RESEARCHER_PROFILE_CACHE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  },

  setCachedProfile: (profile: ResearcherProfileData): void => {
    try {
      localStorage.setItem(RESEARCHER_PROFILE_CACHE_KEY, JSON.stringify(profile));
      if (profile._id) {
        localStorage.setItem(RESEARCHER_PROFILE_ID_KEY, profile._id);
      }
    } catch (err) {
      console.warn('Failed to cache researcher profile:', err);
    }
  },

  getProfile: async (): Promise<ResearcherProfileData> => {
    const profileId = localStorage.getItem(RESEARCHER_PROFILE_ID_KEY);
    const cached = researcherProfileService.getCachedProfile();
    const userEmail = getStoredUserEmail();
    const token = getStoredToken();

    if (profileId) {
      try {
        const res = await fetch(`${API_BASE_URL}/researchers/${profileId}`);
        const json = await res.json();
        if (res.ok && json.data) {
          researcherProfileService.setCachedProfile(json.data);
          return json.data;
        }
      } catch (err) {
        console.warn('Failed to fetch researcher profile by ID, trying email/token fallback:', err);
      }
    }

    if (userEmail) {
      try {
        const res = await fetch(`${API_BASE_URL}/researchers/by-email/${encodeURIComponent(userEmail)}`);
        const json = await res.json();
        if (res.ok && json.data) {
          researcherProfileService.setCachedProfile(json.data);
          return json.data;
        }
      } catch (err) {
        console.warn('Failed to fetch researcher profile by email:', err);
      }
    }

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/researchers/me?userId=${encodeURIComponent(token)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(userEmail ? { 'X-User-Email': userEmail } : {}),
          },
        });
        const json = await res.json();
        if (res.ok && json.data) {
          researcherProfileService.setCachedProfile(json.data);
          return json.data;
        }
      } catch (err) {
        console.warn('Failed to fetch researcher profile by token:', err);
      }
    }

    if (cached) return cached;

    // Default fallback initial profile
    const fallbackEmail = userEmail || 'researcher@edupye.com';
    const fallbackName = fallbackEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const fallbackProfile: ResearcherProfileData = {
      fullName: fallbackName,
      contact: { email: fallbackEmail },
      location: { country: 'India', state: '' },
      academicInfo: {
        currentStatus: 'Postgraduate Student',
        highestQualification: "Bachelor's Degree",
        institution: '',
        department: '',
      },
      researchDomains: ['Computer Science'],
      researchSpecializations: ['Artificial Intelligence'],
      researchInterests: ['Machine Learning', 'Computer Vision'],
      researchExperience: {
        level: 'Beginner',
        hasWorkedOnProject: false,
        hasPublishedPaper: false,
        hasParticipatedConference: false,
        hasWorkedWithDatasets: false,
        hasWorkedWithDataAnalysisTools: false,
        previousProjects: [],
        publications: [],
        conferences: [],
        researchLabs: [],
      },
      researchGoals: {
        primaryGoals: ['Literature review', 'Finding research gaps'],
        customGoal: '',
      },
      currentResearchProject: {
        hasProject: 'exploring',
      },
      researchTools: ['Google Scholar', 'arXiv'],
      technicalSkills: ['Python'],
      preferences: {
        citationStyle: 'APA',
        outputFormat: 'PDF',
        language: 'English',
        notificationPreferences: {
          emailAlerts: true,
          paperRecommendations: true,
          collaborationInvites: true,
        },
      },
      onboardingCompleted: false,
      onboardingStep: 1,
    };

    researcherProfileService.setCachedProfile(fallbackProfile);
    return fallbackProfile;
  },

  saveStep: async (step: number, data: any): Promise<ResearcherProfileData> => {
    const profileId = localStorage.getItem(RESEARCHER_PROFILE_ID_KEY);
    const token = getStoredToken();
    const userEmail = getStoredUserEmail() || data?.email || data?.contact?.email || '';

    // Update local cache optimistically
    const cached = researcherProfileService.getCachedProfile() || ({} as ResearcherProfileData);
    const merged: ResearcherProfileData = {
      ...cached,
      ...data,
      onboardingStep: Math.max(cached.onboardingStep || 1, step),
    };
    researcherProfileService.setCachedProfile(merged);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (profileId) headers['X-Researcher-Profile-Id'] = profileId;
      if (userEmail) headers['X-User-Email'] = userEmail;

      const res = await fetch(`${API_BASE_URL}/researchers/step`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          profileId: profileId || undefined,
          userId: token || undefined,
          email: userEmail || undefined,
          step,
          data,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || `Failed to save step ${step} (Status ${res.status})`);
      }

      if (json?.data) {
        researcherProfileService.setCachedProfile(json.data);
        if (json.data._id) {
          localStorage.setItem(RESEARCHER_PROFILE_ID_KEY, json.data._id);
        }
        if (json.data.userId && !localStorage.getItem('token')) {
          const uid = typeof json.data.userId === 'string' ? json.data.userId : json.data.userId?._id;
          if (uid) localStorage.setItem('token', uid);
        }
        return json.data;
      }
    } catch (err) {
      console.error('API saveStep failed:', err);
      throw err;
    }

    return merged;
  },

  updateProfile: async (id: string, updateData: Partial<ResearcherProfileData>): Promise<ResearcherProfileData> => {
    try {
      const res = await fetch(`${API_BASE_URL}/researchers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        researcherProfileService.setCachedProfile(json.data);
        return json.data;
      }
    } catch (err) {
      console.warn('API updateProfile failed, updating local cache:', err);
    }

    const cached = researcherProfileService.getCachedProfile() || ({} as ResearcherProfileData);
    const updated = { ...cached, ...updateData };
    researcherProfileService.setCachedProfile(updated);
    return updated;
  },

  completeOnboarding: async (): Promise<ResearcherProfileData> => {
    const profileId = localStorage.getItem(RESEARCHER_PROFILE_ID_KEY);
    const token = getStoredToken();
    const userEmail = getStoredUserEmail();

    // Optimistically mark completed in local storage
    const cached = researcherProfileService.getCachedProfile() || ({} as ResearcherProfileData);
    const completed: ResearcherProfileData = {
      ...cached,
      onboardingCompleted: true,
      onboardingStep: 9,
    };
    researcherProfileService.setCachedProfile(completed);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (profileId) headers['X-Researcher-Profile-Id'] = profileId;
      if (userEmail) headers['X-User-Email'] = userEmail;

      const res = await fetch(`${API_BASE_URL}/researchers/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          profileId: profileId || undefined,
          userId: token || undefined,
          email: userEmail || undefined,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || `Failed to complete onboarding (Status ${res.status})`);
      }

      if (json?.data) {
        researcherProfileService.setCachedProfile(json.data);
        if (json.data._id) {
          localStorage.setItem(RESEARCHER_PROFILE_ID_KEY, json.data._id);
        }
        return json.data;
      }
    } catch (err) {
      console.error('API completeOnboarding failed:', err);
      throw err;
    }

    return completed;
  },
};
