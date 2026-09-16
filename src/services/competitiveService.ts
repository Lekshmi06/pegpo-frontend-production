import { API_BASE_URL } from './apiClient';

export interface ExamSectionSummary {
  id: string;
  name: string;
  subject: string;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarks: number;
  durationMinutes?: number;
  questionTypes: string[];
  instructions?: string;
}

export interface ExamMarkingScheme {
  correctMarks: number;
  negativeMarks: number;
  numericalTolerance?: number;
  maxScore: number;
  cutOffScore?: number;
  sectionalCutOff?: boolean;
}

export interface CompetitiveExamItem {
  _id: string;
  id: string;
  name: string;
  code: string;
  category: string;
  conductingBody?: string;
  description: string;
  supportedSubjects: string[];
  tier?: string;
  durationMinutes: number;
  totalQuestions: number;
  maxScore: number;
  sections: ExamSectionSummary[];
  markingScheme: ExamMarkingScheme;
  questionTypes: string[];
  isActive: boolean;
  totalCandidatesEstimate?: number;
  syllabusOverview?: string;
  eligibility?: string;
}

export interface PYQQuestion {
  _id: string;
  id: number;
  questionId: string;
  question: string;
  sidebarTitle?: string;
  questionType: 'mcq' | 'nat' | 'descriptive';
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  numericalAnswer?: number;
  numericalTolerance?: number;
  explanation: string;
  marks: number;
  negativeMarks: number;
  subject: string;
  topic?: string;
  chapter?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  sourceType: 'previous_year';
  sourceYear: number;
  sourceExam: string;
  sourceShift?: string;
  sourceReference?: string;
  isVerifiedSource: boolean;
}

export interface PYQListResponse {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  questions: PYQQuestion[];
  facets: {
    years: number[];
    subjects: string[];
  };
}

export interface GeneratedMockTestResponse {
  testId: string;
  title: string;
  examCode: string;
  examName: string;
  category: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  sections: Array<{
    id: string;
    name: string;
    subject: string;
    totalQuestions: number;
    marksPerQuestion: number;
    negativeMarks: number;
  }>;
  isPYQ?: boolean;
  pyqYear?: number;
}

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

export const competitiveService = {
  /**
   * Fetch available competitive exams from catalog.
   */
  fetchExams: async (category?: string): Promise<CompetitiveExamItem[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'All' && category !== 'Choose your goal') {
      params.set('category', category);
    }
    const qs = params.toString();
    const url = `${API_BASE_URL}/competitive/exams${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Failed to fetch exams (status ${res.status})`);
    }

    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch details, full pattern, and marking scheme for an exam.
   */
  fetchExamDetails: async (examCode: string): Promise<CompetitiveExamItem> => {
    const res = await fetch(`${API_BASE_URL}/competitive/exams/${encodeURIComponent(examCode)}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Failed to load exam details (status ${res.status})`);
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch authentic Previous-Year Questions (PYQs).
   */
  fetchPYQs: async (params: {
    examCode?: string;
    year?: number;
    subject?: string;
    topic?: string;
    questionType?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PYQListResponse> => {
    const query = new URLSearchParams();
    if (params.examCode) query.set('examCode', params.examCode);
    if (params.year) query.set('year', String(params.year));
    if (params.subject) query.set('subject', params.subject);
    if (params.topic) query.set('topic', params.topic);
    if (params.questionType) query.set('questionType', params.questionType);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const url = `${API_BASE_URL}/competitive/pyqs${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Failed to fetch PYQs (status ${res.status})`);
    }

    const json = await res.json();
    return json.data || { totalCount: 0, page: 1, limit: 15, totalPages: 1, questions: [], facets: { years: [], subjects: [] } };
  },

  /**
   * Generate a persistent mock test matching an official exam pattern.
   */
  generateMockExam: async (payload: {
    examCode: string;
    year?: number;
    title?: string;
  }): Promise<GeneratedMockTestResponse> => {
    const res = await fetch(`${API_BASE_URL}/competitive/mocks/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Failed to generate mock exam (status ${res.status})`);
    }

    const json = await res.json();
    return json.data;
  },
};
