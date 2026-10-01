import { apiRequest } from './apiClient';
import {
  AssessmentItem,
  AssessmentQuestion,
  ParsedDocumentResponse,
  GenerateAiAssessmentParams,
  SuggestAnswersResponseItem,
  AssessmentAttemptsSummary,
} from '../types/assessment';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || '';
  const teacherProfileId = localStorage.getItem('teacherProfileId') || '';
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }
  if (teacherProfileId) {
    headers['x-teacher-profile-id'] = teacherProfileId;
  }
  return headers;
};

export const assessmentService = {
  /**
   * Upload a document (PDF, DOCX, DOC, TXT) and extract structured questions with Gemini
   */
  uploadAndExtract: async (
    file: File,
    metadata: {
      subject?: string;
      board?: string;
      classLevel?: string;
      teachingContextId?: string;
    }
  ): Promise<ParsedDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.subject) formData.append('subject', metadata.subject);
    if (metadata.board) formData.append('board', metadata.board);
    if (metadata.classLevel) formData.append('classLevel', metadata.classLevel);
    if (metadata.teachingContextId) formData.append('teachingContextId', metadata.teachingContextId);

    const res = await apiRequest<{ success: boolean; data: ParsedDocumentResponse }>(
      '/assessments/upload',
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      }
    );
    return res.data;
  },

  /**
   * Generate an assessment using AI grounded in subject, chapter, and question types
   */
  generateAiAssessment: async (
    params: GenerateAiAssessmentParams
  ): Promise<{
    title: string;
    subject: string;
    board: string;
    classLevel: string;
    durationMinutes: number;
    totalMarks: number;
    questions: AssessmentQuestion[];
  }> => {
    const res = await apiRequest<{
      success: boolean;
      data: {
        title: string;
        subject: string;
        board: string;
        classLevel: string;
        durationMinutes: number;
        totalMarks: number;
        questions: AssessmentQuestion[];
      };
    }>('/assessments/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return res.data;
  },

  /**
   * Suggest answers for questions that don't have answer keys yet
   */
  suggestAnswers: async (
    questions: AssessmentQuestion[],
    context?: { subject?: string; board?: string; classLevel?: string }
  ): Promise<SuggestAnswersResponseItem[]> => {
    const res = await apiRequest<{
      success: boolean;
      data: SuggestAnswersResponseItem[];
    }>('/assessments/suggest-answers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        questions,
        subject: context?.subject,
        board: context?.board,
        classLevel: context?.classLevel,
      }),
    });
    return res.data;
  },

  /**
   * Save / publish an assessment with multi-purpose usages and question records
   */
  saveAssessment: async (assessmentPayload: Partial<AssessmentItem>): Promise<AssessmentItem> => {
    const res = await apiRequest<{ success: boolean; data: AssessmentItem }>('/assessments/save', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assessmentPayload),
    });
    return res.data;
  },

  /**
   * List assessments created by teacher
   */
  listAssessments: async (filters: {
    teachingContextId?: string;
    subject?: string;
    classLevel?: string;
    sourceFormat?: string;
    usage?: 'studyMaterial' | 'practice' | 'scheduledTest';
    search?: string;
  } = {}): Promise<AssessmentItem[]> => {
    const query = new URLSearchParams();
    if (filters.teachingContextId) query.set('teachingContextId', filters.teachingContextId);
    if (filters.subject) query.set('subject', filters.subject);
    if (filters.classLevel) query.set('classLevel', filters.classLevel);
    if (filters.sourceFormat) query.set('sourceFormat', filters.sourceFormat);
    if (filters.usage) query.set('usage', filters.usage);
    if (filters.search) query.set('search', filters.search);

    const qs = query.toString();
    const res = await apiRequest<{ success: boolean; data: AssessmentItem[] }>(
      `/assessments${qs ? `?${qs}` : ''}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data || [];
  },

  /**
   * Get single assessment with populated questions
   */
  getAssessmentById: async (id: string): Promise<AssessmentItem> => {
    const res = await apiRequest<{ success: boolean; data: AssessmentItem }>(
      `/assessments/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  /**
   * Delete an assessment
   */
  deleteAssessment: async (id: string): Promise<void> => {
    await apiRequest(`/assessments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Get formal scheduled test attempts for this assessment
   */
  getAssessmentAttempts: async (id: string): Promise<AssessmentAttemptsSummary> => {
    const res = await apiRequest<{ success: boolean; data: AssessmentAttemptsSummary }>(
      `/assessments/${id}/attempts`,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  /**
   * Publish or unpublish assessment results for enrolled students
   */
  publishResults: async (
    id: string,
    publish: boolean = true
  ): Promise<{ testId: string; resultsPublished: boolean }> => {
    const res = await apiRequest<{
      success: boolean;
      data: { testId: string; resultsPublished: boolean };
    }>(`/assessments/${id}/publish-results`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ publish }),
    });
    return res.data;
  },
};
