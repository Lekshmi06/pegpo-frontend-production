import { apiRequest, API_BASE_URL } from './apiClient';
import {
  AssignmentSummary,
  IAssignment,
  AssignmentSubmissionsResult,
  TeacherAssignmentFilter,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  EvaluateSubmissionPayload,
  StudentAssignmentFilter,
  StudentAssignmentItem,
  StudentAssignmentDetailsResponse,
  IAssignmentSubmission,
  SubmitAssignmentPayload,
} from '../types/assignment';

export const assignmentService = {
  /**
   * Retrieves all assignments created by the teacher with aggregate submission statistics.
   */
  getTeacherAssignments: async (
    filters?: TeacherAssignmentFilter
  ): Promise<AssignmentSummary[]> => {
    const params = new URLSearchParams();
    if (filters?.classSectionId) params.append('classSectionId', filters.classSectionId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: AssignmentSummary[] }>(
      `/assignments${queryString}`
    );
    return res.data || [];
  },

  /**
   * Retrieves details of a specific assignment for the owning teacher.
   */
  getAssignmentById: async (id: string): Promise<IAssignment> => {
    const res = await apiRequest<{ success: boolean; data: IAssignment }>(
      `/assignments/${id}`
    );
    return res.data;
  },

  /**
   * Creates a draft or published assignment with optional file attachments.
   */
  createAssignment: async (
    payload: CreateAssignmentPayload
  ): Promise<IAssignment> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('subject', payload.subject);
    formData.append('description', payload.description);
    if (payload.instructions) formData.append('instructions', payload.instructions);
    if (payload.type) formData.append('type', payload.type);
    formData.append('classSectionId', payload.classSectionId);
    if (payload.teachingContextId) formData.append('teachingContextId', payload.teachingContextId);
    formData.append('targetType', payload.targetType || 'all');

    if (payload.targetType === 'selected' && payload.targetStudentProfileIds?.length) {
      formData.append(
        'targetStudentProfileIds',
        JSON.stringify(payload.targetStudentProfileIds)
      );
    }

    if (payload.assignedDate) formData.append('assignedDate', payload.assignedDate);
    formData.append('dueDate', payload.dueDate);
    if (payload.dueTime) formData.append('dueTime', payload.dueTime);
    if (payload.totalMarks !== undefined) formData.append('totalMarks', String(payload.totalMarks));
    if (payload.passingMarks !== undefined) formData.append('passingMarks', String(payload.passingMarks));
    formData.append(
      'allowLateSubmission',
      payload.allowLateSubmission !== undefined ? String(payload.allowLateSubmission) : 'true'
    );
    if (payload.lateSubmissionDeadline) {
      formData.append('lateSubmissionDeadline', payload.lateSubmissionDeadline);
    }
    formData.append('status', payload.status || 'draft');

    if (payload.attachments && payload.attachments.length > 0) {
      for (const file of payload.attachments) {
        formData.append('attachments', file);
      }
    }

    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: IAssignment;
    }>('/assignments', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  /**
   * Updates an existing assignment document and manages attachments.
   */
  updateAssignment: async (
    id: string,
    payload: UpdateAssignmentPayload
  ): Promise<IAssignment> => {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.subject !== undefined) formData.append('subject', payload.subject);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.instructions !== undefined) formData.append('instructions', payload.instructions);
    if (payload.type !== undefined) formData.append('type', payload.type);
    if (payload.classSectionId !== undefined) formData.append('classSectionId', payload.classSectionId);
    if (payload.targetType !== undefined) formData.append('targetType', payload.targetType);

    if (payload.targetStudentProfileIds) {
      formData.append(
        'targetStudentProfileIds',
        JSON.stringify(payload.targetStudentProfileIds)
      );
    }

    if (payload.dueDate !== undefined) formData.append('dueDate', payload.dueDate);
    if (payload.dueTime !== undefined) formData.append('dueTime', payload.dueTime);
    if (payload.totalMarks !== undefined) formData.append('totalMarks', String(payload.totalMarks));
    if (payload.passingMarks !== undefined) formData.append('passingMarks', String(payload.passingMarks));
    if (payload.allowLateSubmission !== undefined) {
      formData.append('allowLateSubmission', String(payload.allowLateSubmission));
    }
    if (payload.lateSubmissionDeadline !== undefined) {
      formData.append('lateSubmissionDeadline', payload.lateSubmissionDeadline);
    }

    if (payload.removedAttachmentKeys && payload.removedAttachmentKeys.length > 0) {
      formData.append(
        'removedAttachmentKeys',
        JSON.stringify(payload.removedAttachmentKeys)
      );
    }

    if (payload.newAttachments && payload.newAttachments.length > 0) {
      for (const file of payload.newAttachments) {
        formData.append('attachments', file);
      }
    }

    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: IAssignment;
    }>(`/assignments/${id}`, {
      method: 'PUT',
      body: formData,
    });
    return res.data;
  },

  /**
   * Publishes a draft assignment to students.
   */
  publishAssignment: async (id: string): Promise<IAssignment> => {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: IAssignment;
    }>(`/assignments/${id}/publish`, {
      method: 'PATCH',
    });
    return res.data;
  },

  /**
   * Archives an assignment.
   */
  archiveAssignment: async (id: string): Promise<IAssignment> => {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: IAssignment;
    }>(`/assignments/${id}/archive`, {
      method: 'PATCH',
    });
    return res.data;
  },

  /**
   * Deletes an assignment if no submissions have been received.
   */
  deleteAssignment: async (id: string): Promise<void> => {
    await apiRequest<{ success: boolean; message: string }>(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Retrieves submissions and pending student tracking for an assignment.
   */
  getAssignmentSubmissions: async (
    id: string
  ): Promise<AssignmentSubmissionsResult> => {
    const res = await apiRequest<{
      success: boolean;
      data: AssignmentSubmissionsResult;
    }>(`/assignments/${id}/submissions`);
    return res.data;
  },

  /**
   * Evaluates student work with marks, grade, and feedback.
   */
  evaluateSubmission: async (
    assignmentId: string,
    submissionId: string,
    payload: EvaluateSubmissionPayload
  ): Promise<any> => {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: any;
    }>(`/assignments/${assignmentId}/submissions/${submissionId}/evaluate`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Retrieves all assignments accessible to the authenticated student across enrolled classes.
   */
  getStudentAssignments: async (
    filters?: StudentAssignmentFilter
  ): Promise<StudentAssignmentItem[]> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.type) params.append('type', filters.type);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: StudentAssignmentItem[] }>(
      `/assignments/student${queryString}`
    );
    return res.data || [];
  },

  /**
   * Retrieves assignment details and the student's submission status.
   */
  getStudentAssignmentDetails: async (
    id: string
  ): Promise<StudentAssignmentDetailsResponse> => {
    const res = await apiRequest<{
      success: boolean;
      data: StudentAssignmentDetailsResponse;
    }>(`/assignments/student/${id}`);
    return res.data;
  },

  /**
   * Retrieves the student's existing submission for an assignment.
   */
  getMySubmission: async (id: string): Promise<IAssignmentSubmission | null> => {
    const res = await apiRequest<{
      success: boolean;
      data: IAssignmentSubmission | null;
    }>(`/assignments/student/${id}/my-submission`);
    return res.data || null;
  },

  /**
   * Submits or drafts homework/assignment response with text and file attachments.
   */
  submitAssignment: async (
    id: string,
    payload: SubmitAssignmentPayload
  ): Promise<IAssignmentSubmission> => {
    const formData = new FormData();
    if (payload.content !== undefined) {
      formData.append('content', payload.content);
    }
    if (payload.isDraft !== undefined) {
      formData.append('isDraft', payload.isDraft ? 'true' : 'false');
    }
    if (payload.comment) {
      formData.append('comment', payload.comment);
    }

    if (payload.files && payload.files.length > 0) {
      for (const file of payload.files) {
        formData.append('attachments', file);
      }
    }

    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: IAssignmentSubmission;
    }>(`/assignments/student/${id}/submit`, {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  /**
   * Authenticated download of an assignment attachment.
   */
  downloadAssignmentAttachment: async (
    assignmentId: string,
    attachmentId: string,
    filename: string
  ): Promise<void> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_BASE_URL}/assignments/${assignmentId}/attachments/${attachmentId}/download`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Download failed with status ${res.status}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Authenticated download of a student submission attachment.
   */
  downloadSubmissionAttachment: async (
    assignmentId: string,
    submissionId: string,
    attachmentId: string,
    filename: string
  ): Promise<void> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_BASE_URL}/assignments/${assignmentId}/submissions/${submissionId}/attachments/${attachmentId}/download`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Download failed with status ${res.status}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'submission-attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default assignmentService;

