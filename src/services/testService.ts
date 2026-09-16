import { TestItem, TestResult, QuestionStatus } from '../types/test';
import { API_BASE_URL } from './apiClient';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const profileId = localStorage.getItem('studentProfileId');
  const userJson = localStorage.getItem('user');
  let userIdFromSession = '';
  if (userJson) {
    try {
      const u = JSON.parse(userJson);
      userIdFromSession = u.id || u.token || '';
    } catch {
      // ignore
    }
  }

  const effectiveToken = token || userIdFromSession;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
    headers['x-user-id'] = effectiveToken;
  }

  if (profileId) {
    headers['x-student-profile-id'] = profileId;
  }

  return headers;
}

export interface TestFilters {
  board?: string;
  classLevel?: string;
  subject?: string;
  isLocked?: boolean;
  search?: string;
}

export interface SubmitTestPayload {
  attemptId?: string;
  answers: Record<number | string, string>;
  statusByQuestion?: Record<number | string, QuestionStatus>;
  timeSpentSeconds: number;
}

export interface StartTestSessionResponse {
  attemptId: string;
  testId: string;
  status: string;
  startedAt: string;
  durationMinutes: number;
  timeSpentSeconds?: number;
  savedAnswers?: Record<string, string>;
  savedStatus?: Record<string, QuestionStatus>;
}

export const testService = {
  /**
   * Fetch all tests from the backend catalog.
   */
  fetchTests: async (filters: TestFilters = {}): Promise<TestItem[]> => {
    const params = new URLSearchParams();
    if (filters.board) params.set('board', filters.board);
    if (filters.classLevel) params.set('classLevel', filters.classLevel);
    if (filters.subject) params.set('subject', filters.subject);
    if (typeof filters.isLocked === 'boolean') params.set('isLocked', String(filters.isLocked));
    if (filters.search) params.set('search', filters.search);

    const qs = params.toString();
    const url = `${API_BASE_URL}/tests${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch tests (status ${res.status})`);
    }

    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch a specific test and its questions.
   * mode: 'take' masks correct answers and explanations.
   */
  fetchTestById: async (testId: string, mode: 'take' | 'preview' = 'take'): Promise<TestItem> => {
    const res = await fetch(`${API_BASE_URL}/tests/${testId}?mode=${mode}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to load test (status ${res.status})`);
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Start or resume a test attempt session in the backend.
   */
  startTest: async (testId: string): Promise<StartTestSessionResponse> => {
    const res = await fetch(`${API_BASE_URL}/tests/${testId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to start test (status ${res.status})`);
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Submit student answers, evaluate against answer keys, and receive analysis.
   */
  submitTest: async (testId: string, payload: SubmitTestPayload): Promise<TestResult> => {
    const res = await fetch(`${API_BASE_URL}/tests/${testId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to submit test (status ${res.status})`);
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch detailed attempt analysis by attemptId.
   */
  fetchAttemptAnalysis: async (attemptId: string): Promise<TestResult> => {
    const res = await fetch(`${API_BASE_URL}/tests/attempts/${attemptId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch test analysis (status ${res.status})`);
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch a student's past attempt history.
   */
  fetchStudentHistory: async (testId?: string): Promise<any[]> => {
    const url = testId
      ? `${API_BASE_URL}/tests/attempts/my-history?testId=${testId}`
      : `${API_BASE_URL}/tests/attempts/my-history`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch attempt history (status ${res.status})`);
    }

    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch curriculum-grounded practice questions for the student.
   */
  fetchPracticeQuestions: async (params: { subject?: string; topic?: string; count?: number } = {}): Promise<any[]> => {
    const query = new URLSearchParams();
    if (params.subject) query.set('subject', params.subject);
    if (params.topic) query.set('topic', params.topic);
    if (params.count) query.set('count', String(params.count));
    const qs = query.toString();

    const res = await fetch(`${API_BASE_URL}/tests/practice${qs ? `?${qs}` : ''}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch practice questions (status ${res.status})`);
    }

    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch curriculum-grounded quizzes for the student.
   */
  fetchQuizzes: async (params: { subject?: string; topic?: string } = {}): Promise<any[]> => {
    const query = new URLSearchParams();
    if (params.subject) query.set('subject', params.subject);
    if (params.topic) query.set('topic', params.topic);
    const qs = query.toString();

    const res = await fetch(`${API_BASE_URL}/tests/quizzes${qs ? `?${qs}` : ''}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch quizzes (status ${res.status})`);
    }

    const json = await res.json();
    return json.data || [];
  },

  /**
   * Generate an on-demand quick quiz on a topic.
   */
  generateQuiz: async (payload: { subject?: string; topic?: string; questionCount?: number }): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/tests/quiz/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to generate quiz (status ${res.status})`);
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Generate a curriculum-grounded Test and persist it in MongoDB.
   */
  generateTest: async (payload: { subject?: string; topic?: string; questionCount?: number; difficulty?: string }): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/tests/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to generate test (status ${res.status})`);
    }

    const json = await res.json();
    return json.data;
  },
};
