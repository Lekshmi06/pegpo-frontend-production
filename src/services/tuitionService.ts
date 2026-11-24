import { apiRequest } from "./apiClient";
import {
  TuitionProviderProfile,
  TuitionOffering,
  TuitionBatch,
  TuitionRequest,
  TuitionEnrollment,
  TuitionSession,
  TuitionMaterial,
  TuitionAssessment,
  TuitionReview,
  TuitionTransaction,
  TuitionVerificationStatus,
  TuitionPlatformTier,
  SearchOfferingsQuery,
  SearchOfferingsResponse,
  TuitionProgram,
  GetTuitionProgramsResponse,
  TuitionProgramContext,
  TuitionCodeLoginPayload,
  TuitionCodeLoginResponse,
  CombinedStudyMessage,
  TuitionCalendarSession,
  GetTuitionScheduleResponse,
} from "../types/tuition";

export const TUITION_MODE_TOKEN_KEY = "tuition_mode_token";
export const TUITION_MODE_SESSION_KEY = "tuition_mode_session";
export const TUITION_PROGRAM_CONTEXT_KEY = "tuition_program_context";
export const TUITION_VERIFIED_PREFIX = "tuition_verified_program_";
export const TUITION_CODE_ONLY_KEY = "tuition_code_only_session";

export interface SearchProvidersQuery {
  search?: string;
  subject?: string;
  classLevel?: string;
  teachingMode?: string;
  classFormat?: string;
  tier?: string;
  minRating?: number;
  maxFee?: number;
  minExperience?: number;
  qualification?: string;
  page?: number;
  limit?: number;
}

export interface SearchProvidersResponse {
  success: boolean;
  providers: TuitionProviderProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProviderPublicDetailsResponse {
  success: boolean;
  profile: TuitionProviderProfile;
  offerings: TuitionOffering[];
  batches: TuitionBatch[];
  reviews: TuitionReview[];
}

export interface OfferingPublicDetailsResponse {
  success: boolean;
  offering: TuitionOffering;
  provider: TuitionProviderProfile;
  batches: TuitionBatch[];
  reviews: TuitionReview[];
}

export interface TuitionComplaintPayload {
  isAnonymous?: boolean;
  category: "Academic / Class" | "Conduct / Behavior" | "Technical / SmartBoard" | "Schedule / Billing" | "Other" | string;
  subject: string;
  description: string;
  programId?: string;
}

export interface UserComplaintItem {
  _id: string;
  ticketCode: string;
  isAnonymous: boolean;
  reporterRole: "student" | "teacher";
  category: string;
  subject: string;
  description: string;
  programId?: {
    _id: string;
    title: string;
    code: string;
    subject?: string;
  } | null;
  status: "open" | "in_review" | "resolved" | "closed";
  adminProgressNotes: Array<{
    message: string;
    updatedBy?: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TuitionHomeworkItem {
  _id: string;
  programId: string;
  assignedBy?: {
    _id: string;
    name?: string;
    displayName?: string;
    email?: string;
    teacherCode?: string;
  };
  teacherName?: string;
  title: string;
  description: string;
  subject?: string;
  dueDate: string;
  totalPoints: number;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  submissionsCount?: number;
  mySubmission?: {
    _id: string;
    studentId: string;
    studentName?: string;
    studentCode?: string;
    submittedAt: string;
    content?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    status: "submitted" | "graded" | "returned";
    grade?: number;
    feedback?: string;
    gradedAt?: string;
  } | null;
  submissions?: Array<{
    _id: string;
    studentId: string;
    studentName?: string;
    studentCode?: string;
    submittedAt: string;
    content?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    status: "submitted" | "graded" | "returned";
    grade?: number;
    feedback?: string;
    gradedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomeworkPayload {
  title: string;
  description: string;
  subject?: string;
  dueDate: string;
  totalPoints?: number;
  attachments?: Array<{ name: string; url: string; size?: number; type?: string }>;
}

export interface SubmitHomeworkPayload {
  content?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface TuitionMCQQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
  marks?: number;
  explanation?: string;
}

export interface TuitionMCQStudentAnswer {
  questionIndex: number;
  questionText?: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface TuitionAssessmentSubmission {
  _id?: string;
  studentId: string | { _id: string; name?: string; studentCode?: string; email?: string; avatarUrl?: string };
  studentName?: string;
  studentCode?: string;
  studentEmail?: string;
  submittedAt: string;
  // MCQ fields
  answers?: TuitionMCQStudentAnswer[];
  score?: number;
  totalMarks?: number;
  percentage?: number;
  // Assignment fields
  fileUrl?: string;
  submissionPdfUrl?: string;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface TuitionProgramAssessmentItem {
  _id: string;
  programId: string;
  assignedBy?: {
    _id: string;
    name?: string;
    email?: string;
    teacherCode?: string;
    avatarUrl?: string;
  };
  assignedByName?: string;
  createdBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  type: "mcq_test" | "assignment";
  title: string;
  subject?: string;
  topic?: string;
  instructions?: string;
  durationMinutes?: number;
  dueDate?: string;
  referenceFileUrl?: string;
  referenceFileName?: string;
  totalMarks: number;
  questions?: TuitionMCQQuestion[];
  submissionsCount?: number;
  hasSubmitted?: boolean;
  mySubmission?: TuitionAssessmentSubmission | null;
  submissions?: TuitionAssessmentSubmission[];
  status?: "active" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentPayload {
  type: "mcq_test" | "assignment";
  title: string;
  subject?: string;
  topic?: string;
  instructions?: string;
  durationMinutes?: number;
  dueDate?: string;
  referenceFileUrl?: string;
  referenceFileName?: string;
  totalMarks?: number;
  questions?: TuitionMCQQuestion[];
}

export const tuitionService = {
  // ================= MARKETPLACE (PUBLIC / LEARNER) =================
  searchProviders: async (query: SearchProvidersQuery = {}): Promise<SearchProvidersResponse> => {
    const params = new URLSearchParams();
    if (query.search) params.append("search", query.search);
    if (query.subject && query.subject !== "All") params.append("subject", query.subject);
    if (query.classLevel && query.classLevel !== "All") params.append("classLevel", query.classLevel);
    if (query.teachingMode && query.teachingMode !== "All") params.append("teachingMode", query.teachingMode);
    if (query.classFormat && query.classFormat !== "All") params.append("classFormat", query.classFormat);
    if (query.tier && query.tier !== "All") params.append("tier", query.tier);
    if (query.minRating) params.append("minRating", String(query.minRating));
    if (query.maxFee) params.append("maxFee", String(query.maxFee));
    if (query.minExperience) params.append("minExperience", String(query.minExperience));
    if (query.qualification) params.append("qualification", query.qualification);
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));

    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiRequest<SearchProvidersResponse>(`/tuition/marketplace${qs}`);
  },

  searchOfferings: async (query: SearchOfferingsQuery = {}): Promise<SearchOfferingsResponse> => {
    const params = new URLSearchParams();
    if (query.search) params.append("search", query.search);
    if (query.subject && query.subject !== "All") params.append("subject", query.subject);
    if (query.classLevel && query.classLevel !== "All") params.append("classLevel", query.classLevel);
    if (query.teachingMode && query.teachingMode !== "All") params.append("teachingMode", query.teachingMode);
    if (query.classFormat && query.classFormat !== "All") params.append("classFormat", query.classFormat);
    if (query.minFee !== undefined) params.append("minFee", String(query.minFee));
    if (query.maxFee !== undefined) params.append("maxFee", String(query.maxFee));
    if (query.day && query.day !== "All") params.append("day", query.day);
    if (query.tier && query.tier !== "All") params.append("tier", query.tier);
    if (query.minRating) params.append("minRating", String(query.minRating));
    if (query.minExperience) params.append("minExperience", String(query.minExperience));
    if (query.qualification) params.append("qualification", query.qualification);
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));

    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiRequest<SearchOfferingsResponse>(`/tuition/marketplace/offerings${qs}`);
  },

  getOfferingPublicDetails: async (id: string): Promise<OfferingPublicDetailsResponse> => {
    return await apiRequest<OfferingPublicDetailsResponse>(`/tuition/marketplace/offerings/${id}`);
  },

  getProviderPublicProfile: async (id: string): Promise<ProviderPublicDetailsResponse> => {
    return await apiRequest<ProviderPublicDetailsResponse>(`/tuition/marketplace/providers/${id}`);
  },

  getProviderReviews: async (providerId: string): Promise<{ success: boolean; reviews: TuitionReview[] }> => {
    return await apiRequest<{ success: boolean; reviews: TuitionReview[] }>(`/tuition/reviews/provider/${providerId}`);
  },

  // ================= STUDENT WORKFLOW & PORTAL =================
  createRequest: async (data: {
    offeringId: string;
    batchId?: string;
    classFormat: string;
    teachingMode: string;
    requestedSlot?: any;
    studentNotes?: string;
  }): Promise<{ success: boolean; message: string; request: TuitionRequest }> => {
    return await apiRequest(`/tuition/requests`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyAndSettlePayment: async (data: {
    requestId: string;
    gatewayTransactionId: string;
    signature: string;
  }): Promise<{ success: boolean; message: string; enrollment: TuitionEnrollment; request: TuitionRequest }> => {
    return await apiRequest(`/tuition/payments/verify`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getStudentOverview: async (): Promise<{
    success: boolean;
    overview: {
      activeEnrollmentsCount: number;
      attendanceRate: number;
      activeEnrollments: TuitionEnrollment[];
      upcomingSessions: TuitionSession[];
      recentRequests: TuitionRequest[];
    };
  }> => {
    return await apiRequest(`/tuition/student/overview`);
  },

  getStudentEnrollments: async (): Promise<{ success: boolean; enrollments: TuitionEnrollment[] }> => {
    return await apiRequest(`/tuition/student/enrollments`);
  },

  getStudentRequests: async (): Promise<{ success: boolean; requests: TuitionRequest[] }> => {
    return await apiRequest(`/tuition/student/requests`);
  },

  getStudentSchedule: async (start?: string, end?: string): Promise<{ success: boolean; sessions: TuitionSession[] }> => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiRequest(`/tuition/student/schedule${qs}`);
  },

  getStudentMaterials: async (offeringId?: string): Promise<{ success: boolean; materials: TuitionMaterial[] }> => {
    const qs = offeringId ? `?offeringId=${offeringId}` : "";
    return await apiRequest(`/tuition/student/materials${qs}`);
  },

  getStudentAssessments: async (offeringId?: string): Promise<{ success: boolean; assessments: TuitionAssessment[] }> => {
    const qs = offeringId ? `?offeringId=${offeringId}` : "";
    return await apiRequest(`/tuition/student/assessments${qs}`);
  },

  submitStudentAssessment: async (
    assessmentId: string,
    data: { fileUrl?: string; notes?: string }
  ): Promise<{ success: boolean; message: string; assessment: TuitionAssessment }> => {
    return await apiRequest(`/tuition/student/assessments/${assessmentId}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getStudentPayments: async (): Promise<{ success: boolean; transactions: TuitionTransaction[] }> => {
    return await apiRequest(`/tuition/student/payments`);
  },

  cancelRequest: async (
    requestId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; request: TuitionRequest }> => {
    return await apiRequest(`/tuition/requests/${requestId}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  cancelEnrollment: async (
    enrollmentId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; enrollment: TuitionEnrollment }> => {
    return await apiRequest(`/tuition/enrollments/${enrollmentId}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  submitReview: async (data: {
    providerId: string;
    enrollmentId: string;
    rating: number;
    reviewText: string;
  }): Promise<{ success: boolean; message: string; review: TuitionReview }> => {
    return await apiRequest(`/tuition/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ================= PROVIDER ONBOARDING & STUDIO =================
  getMyProviderProfile: async (): Promise<{ success: boolean; profile: TuitionProviderProfile | null }> => {
    return await apiRequest(`/tuition/provider/me`);
  },

  submitOnboarding: async (data: any): Promise<{ success: boolean; message: string; profile: TuitionProviderProfile }> => {
    return await apiRequest(`/tuition/provider/onboarding`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProviderOverview: async (): Promise<{
    success: boolean;
    overview: {
      profile: TuitionProviderProfile | null;
      activeOfferingsCount: number;
      activeBatchesCount: number;
      activeEnrolledCount: number;
      pendingRequestsCount: number;
      upcomingSessions: TuitionSession[];
      financialSummary: {
        totalGrossEarnings: number;
        transactionsCount: number;
        currency: string;
      };
    };
  }> => {
    return await apiRequest(`/tuition/provider/overview`);
  },

  getProviderFinancials: async (): Promise<{
    success: boolean;
    financials: {
      summary: {
        totalGrossEarnings: number;
        totalRefunded: number;
        netEarnings: number;
        currency: string;
        transactionCount: number;
      };
      transactions: TuitionTransaction[];
      studentBreakdown: Array<{
        studentName: string;
        studentEmail: string;
        totalPaid: number;
        count: number;
      }>;
    };
  }> => {
    return await apiRequest(`/tuition/provider/financials`);
  },

  getMyOfferings: async (): Promise<{ success: boolean; offerings: TuitionOffering[] }> => {
    return await apiRequest(`/tuition/provider/offerings`);
  },

  getOfferingDetails: async (id: string): Promise<{ success: boolean; offering: TuitionOffering; batches: TuitionBatch[] }> => {
    return await apiRequest(`/tuition/provider/offerings/${id}`);
  },

  createOffering: async (data: any): Promise<{ success: boolean; offering: TuitionOffering }> => {
    return await apiRequest(`/tuition/provider/offerings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateOffering: async (id: string, data: any): Promise<{ success: boolean; message: string; offering: TuitionOffering }> => {
    return await apiRequest(`/tuition/provider/offerings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteOffering: async (id: string): Promise<{ success: boolean; message: string }> => {
    return await apiRequest(`/tuition/provider/offerings/${id}`, {
      method: "DELETE",
    });
  },

  getMyBatches: async (): Promise<{ success: boolean; batches: TuitionBatch[] }> => {
    return await apiRequest(`/tuition/provider/batches`);
  },

  getBatchDetails: async (id: string): Promise<{ success: boolean; batch: TuitionBatch }> => {
    return await apiRequest(`/tuition/provider/batches/${id}`);
  },

  createBatch: async (data: any): Promise<{ success: boolean; batch: TuitionBatch }> => {
    return await apiRequest(`/tuition/provider/batches`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateBatch: async (id: string, data: any): Promise<{ success: boolean; message: string; batch: TuitionBatch }> => {
    return await apiRequest(`/tuition/provider/batches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteBatch: async (id: string): Promise<{ success: boolean; message: string }> => {
    return await apiRequest(`/tuition/provider/batches/${id}`, {
      method: "DELETE",
    });
  },

  getProviderRequests: async (status?: string): Promise<{ success: boolean; requests: TuitionRequest[] }> => {
    const qs = status ? `?status=${status}` : "";
    return await apiRequest(`/tuition/provider/requests${qs}`);
  },

  respondToRequest: async (
    requestId: string,
    action: "accept" | "reject",
    notes?: string
  ): Promise<{ success: boolean; request: TuitionRequest }> => {
    return await apiRequest(`/tuition/provider/requests/${requestId}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ action, notes }),
    });
  },

  getProviderSchedule: async (start?: string, end?: string): Promise<{
    success: boolean;
    schedule: { sessions: TuitionSession[]; batches: TuitionBatch[] };
  }> => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiRequest(`/tuition/provider/schedule${qs}`);
  },

  updateSessionStatus: async (
    sessionId: string,
    status: string,
    meetingLink?: string
  ): Promise<{ success: boolean; session: TuitionSession }> => {
    return await apiRequest(`/tuition/provider/sessions/${sessionId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, meetingLink }),
    });
  },

  markAttendance: async (
    sessionId: string,
    records: Array<{ studentId: string; status: string; remarks?: string }>
  ): Promise<{ success: boolean; attendance: any }> => {
    return await apiRequest(`/tuition/provider/sessions/${sessionId}/attendance`, {
      method: "POST",
      body: JSON.stringify({ records }),
    });
  },

  createSession: async (data: any): Promise<{ success: boolean; session: TuitionSession }> => {
    return await apiRequest(`/tuition/provider/sessions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  rescheduleSession: async (
    sessionId: string,
    data: { newDate: string; newStartTime: string; newEndTime: string; reason?: string }
  ): Promise<{ success: boolean; session: TuitionSession }> => {
    return await apiRequest(`/tuition/provider/sessions/${sessionId}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  cancelSession: async (
    sessionId: string,
    reason?: string
  ): Promise<{ success: boolean; session: TuitionSession }> => {
    return await apiRequest(`/tuition/provider/sessions/${sessionId}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  getSessionAttendance: async (sessionId: string): Promise<{ success: boolean; attendance: any }> => {
    return await apiRequest(`/tuition/provider/sessions/${sessionId}/attendance`);
  },

  createMaterial: async (data: any): Promise<{ success: boolean; material: TuitionMaterial }> => {
    return await apiRequest(`/tuition/provider/materials`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createAssessment: async (data: any): Promise<{ success: boolean; assessment: TuitionAssessment }> => {
    return await apiRequest(`/tuition/provider/assessments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ================= ADMIN VERIFICATION =================
  getAdminVerifications: async (status?: string): Promise<{ success: boolean; verifications: TuitionProviderProfile[] }> => {
    const qs = status ? `?status=${status}` : "";
    return await apiRequest(`/tuition/admin/verifications${qs}`);
  },

  adminVerifyProvider: async (
    profileId: string,
    data: { status: string; notes?: string; tier?: string }
  ): Promise<{ success: boolean; message: string; profile: TuitionProviderProfile }> => {
    return await apiRequest(`/tuition/admin/providers/${profileId}/verification`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  adminAssignTier: async (
    profileId: string,
    tier: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; profile: TuitionProviderProfile }> => {
    return await apiRequest(`/tuition/admin/providers/${profileId}/tier`, {
      method: "PATCH",
      body: JSON.stringify({ tier, reason }),
    });
  },

  adminRecalculateTier: async (
    profileId: string
  ): Promise<{ success: boolean; message: string; profile: TuitionProviderProfile }> => {
    return await apiRequest(`/tuition/admin/providers/${profileId}/recalculate-tier`, {
      method: "POST",
    });
  },

  // ================= PHASE B: TUITION PROGRAMS & CODE GATEWAY =================
  getTuitionPrograms: async (): Promise<GetTuitionProgramsResponse> => {
    return await apiRequest(`/tuition/programs`);
  },

  getProgramRoster: async (programId: string): Promise<any> => {
    return await apiRequest(`/tuition/programs/${programId}/roster`);
  },

  updateProgramOverview: async (
    programId: string,
    data: { syllabusTopics?: string[]; requiredMaterials?: string[]; nextSessionTopic?: string }
  ): Promise<{ success: boolean; message: string; program: TuitionProgram }> => {
    return await apiRequest(`/tuition/programs/${programId}/overview`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getTeacherEnrolledStudents: async (): Promise<{
    success: boolean;
    totalPrograms: number;
    programRosters: Array<{
      programId: string;
      title: string;
      code: string;
      subject: string;
      grade?: string;
      schedule: any[];
      status: string;
      totalEnrolled: number;
      students: Array<{
        _id: string;
        name: string;
        email: string;
        studentCode?: string;
        userType?: string;
        status?: string;
      }>;
    }>;
  }> => {
    return await apiRequest(`/tuition/teacher/enrolled-students`);
  },

  codeLogin: async (payload: TuitionCodeLoginPayload): Promise<TuitionCodeLoginResponse> => {
    try {
      return await apiRequest(`/tuition/programs/code-login`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err?.message?.includes("404")) {
        return await apiRequest(`/tuition/auth/code-login`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      throw err;
    }
  },

  getCombinedStudyMessages: async (
    programId: string,
    before?: string
  ): Promise<{ success: boolean; messages: CombinedStudyMessage[] }> => {
    const qs = before ? `?before=${encodeURIComponent(before)}` : "";
    return await apiRequest(`/tuition/programs/${programId}/combined-study${qs}`);
  },

  postCombinedStudyMessage: async (
    programId: string,
    data: FormData | { messageType: string; content?: string }
  ): Promise<{ success: boolean; message: CombinedStudyMessage }> => {
    if (data instanceof FormData) {
      return await apiRequest(`/tuition/programs/${programId}/combined-study`, {
        method: "POST",
        body: data,
      });
    }
    return await apiRequest(`/tuition/programs/${programId}/combined-study`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  requestProgramAccess: async (data: { programId?: string; notes?: string } = {}): Promise<{
    success: boolean;
    message: string;
    tuitionApprovalStatus: string;
    code?: string;
    user?: any;
  }> => {
    return await apiRequest("/tuition/requests/program-access", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  requestProgramEnrollment: async (
    programId: string
  ): Promise<{
    success: boolean;
    message: string;
    alreadyRequested?: boolean;
    request?: any;
    programId?: string;
  }> => {
    return await apiRequest(`/tuition/programs/${programId}/request-enrollment`, {
      method: "POST",
    });
  },

  getMyTuitionSchedule: async (): Promise<GetTuitionScheduleResponse> => {
    return await apiRequest("/tuition/my-schedule", {
      method: "GET",
    });
  },

  getProgramRecordings: async (
    programId: string
  ): Promise<{
    success: boolean;
    programId: string;
    programCode: string;
    programTitle: string;
    recordings: Array<{
      sessionId: string;
      recordingId: string;
      title: string;
      subject: string;
      sessionDate: string;
      durationMinutes: number;
      recordingUrl: string;
      status: string;
      retentionDays: number;
      daysRemaining: number;
      retentionBadge: string;
      expiresAt: string;
      totalAttendees: number;
      attendanceLogs: Array<{
        userId?: string;
        name: string;
        role: string;
        durationMinutes?: number;
      }>;
      teacher?: { name: string; email?: string; teacherCode?: string };
    }>;
    totalRecordings: number;
    retentionPolicyDays: number;
  }> => {
    return await apiRequest(`/tuition/programs/${programId}/recordings`);
  },

  getTeacherPayouts: async (): Promise<{
    success: boolean;
    totalEarned: number;
    pendingAmount: number;
    payouts: Array<{
      _id: string;
      subject: string;
      durationHours: number;
      payoutRate: number;
      totalAmount: number;
      currency: string;
      attendanceVerified: boolean;
      status: "pending_review" | "approved" | "disbursed" | "rejected" | "withheld";
      createdAt: string;
      sessionId?: any;
      adminNotes?: string;
    }>;
  }> => {
    return await apiRequest("/tuition/teacher/payouts");
  },

  // Complaints & Grievance Ticketing
  submitComplaint: async (payload: TuitionComplaintPayload): Promise<{ success: boolean; message: string; ticketCode: string; complaint: UserComplaintItem }> => {
    return await apiRequest("/tuition/complaints", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyComplaints: async (): Promise<{ success: boolean; count: number; complaints: UserComplaintItem[] }> => {
    return await apiRequest("/tuition/complaints/mine");
  },

  // Batch Homework & Tasks
  getProgramHomework: async (programId: string): Promise<{ success: boolean; count: number; homework: TuitionHomeworkItem[] }> => {
    return await apiRequest(`/tuition/programs/${programId}/homework`);
  },

  createProgramHomework: async (programId: string, payload: CreateHomeworkPayload): Promise<{ success: boolean; message: string; homework: TuitionHomeworkItem }> => {
    return await apiRequest(`/tuition/programs/${programId}/homework`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  submitHomework: async (homeworkId: string, payload: SubmitHomeworkPayload): Promise<{ success: boolean; message: string; submission: any }> => {
    return await apiRequest(`/tuition/homework/${homeworkId}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  gradeHomework: async (homeworkId: string, studentId: string, payload: { grade?: number; feedback?: string; status?: string }): Promise<{ success: boolean; message: string; submission: any }> => {
    return await apiRequest(`/tuition/homework/${homeworkId}/submissions/${studentId}/grade`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Program Assessments (MCQ Tests & Homework/Assignments)
  getProgramAssessments: async (
    programId: string
  ): Promise<{ success: boolean; count: number; assessments: TuitionProgramAssessmentItem[] }> => {
    return await apiRequest(`/tuition/programs/${programId}/assessments`);
  },

  createProgramAssessment: async (
    programId: string,
    payload: CreateAssessmentPayload
  ): Promise<{ success: boolean; message: string; assessment: TuitionProgramAssessmentItem }> => {
    return await apiRequest(`/tuition/programs/${programId}/assessments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  submitMcqTest: async (
    assessmentId: string,
    answers: Array<{ questionIndex: number; selectedOptionIndex: number }>
  ): Promise<{
    success: boolean;
    message: string;
    score: number;
    totalMarks: number;
    percentage: number;
    answers: TuitionMCQStudentAnswer[];
    submission: TuitionAssessmentSubmission;
  }> => {
    return await apiRequest(`/tuition/assessments/${assessmentId}/submit-mcq`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  submitAssignmentPdf: async (
    assessmentId: string,
    file: File | Blob,
    notes?: string
  ): Promise<{
    success: boolean;
    message: string;
    submission: TuitionAssessmentSubmission;
    fileUrl: string;
    fileName: string;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    if (notes) formData.append("notes", notes);
    return await apiRequest(`/tuition/assessments/${assessmentId}/submit-pdf`, {
      method: "POST",
      body: formData,
    });
  },

  getAssessmentSubmissions: async (
    assessmentId: string
  ): Promise<{
    success: boolean;
    assessmentTitle: string;
    type: string;
    totalMarks: number;
    submissionsCount: number;
    submissions: TuitionAssessmentSubmission[];
  }> => {
    return await apiRequest(`/tuition/assessments/${assessmentId}/submissions`);
  },

  uploadTuitionMedia: async (
    file: File | Blob,
    filename?: string
  ): Promise<{
    success: boolean;
    url: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    size: number;
  }> => {
    const formData = new FormData();
    if (filename && file instanceof Blob && !(file instanceof File)) {
      formData.append("file", file, filename);
    } else {
      formData.append("file", file);
    }
    return await apiRequest("/tuition/upload-media", {
      method: "POST",
      body: formData,
    });
  },

  // Session & Storage Management
  setTuitionModeSession: (token: string, programContext?: TuitionProgramContext, user?: any) => {
    localStorage.setItem(TUITION_MODE_TOKEN_KEY, token);
    localStorage.setItem(TUITION_MODE_SESSION_KEY, JSON.stringify({ token, programContext, user }));

    const existingMainToken = localStorage.getItem('token');
    const existingUserEmail = localStorage.getItem('userEmail');

    // If there was no verified primary LMS session prior to entering Tuition Mode, mark as guest/code-only
    if (!existingMainToken || !existingUserEmail) {
      localStorage.setItem('token', token);
      localStorage.setItem('tuition_guest_session', 'true');
      sessionStorage.setItem(TUITION_CODE_ONLY_KEY, 'true');
    }

    // If user has synthetic or tuition code email, strictly flag as tuition guest
    const userEmailRaw = (user?.email || '').toLowerCase().trim();
    if (
      userEmailRaw.includes('@tuition.edupye.com') ||
      userEmailRaw.includes('tuition.edupye') ||
      userEmailRaw.includes('@tuition') ||
      userEmailRaw.startsWith('stu-') ||
      userEmailRaw.startsWith('tch-') ||
      user?.isTuitionGuest === true ||
      user?.isGuest === true
    ) {
      localStorage.setItem('tuition_guest_session', 'true');
      sessionStorage.setItem(TUITION_CODE_ONLY_KEY, 'true');
    }

    if (programContext) {
      localStorage.setItem(TUITION_PROGRAM_CONTEXT_KEY, JSON.stringify(programContext));
      const progContextId = programContext._id || programContext.programId;
      if (progContextId) {
        tuitionService.setProgramVerified(progContextId, programContext.code);
      }
    }
    if (user) {
      const existing = localStorage.getItem("user");
      let session: any = {};
      if (existing) {
        try {
          session = JSON.parse(existing);
        } catch (e) {}
      }
      session = {
        ...session,
        id: user._id || session.id,
        email: user.email || session.email,
        name: user.name || session.name,
        role: user.activeRole || user.userType || session.role || "student",
        studentCode: user.studentCode || session.studentCode,
        teacherCode: user.teacherCode || session.teacherCode,
      };
      localStorage.setItem("user", JSON.stringify(session));
    }
  },

  hasPrimaryLmsSession: (): boolean => {
    try {
      // 1. If flagged as guest / code-only session, strictly return false
      if (
        sessionStorage.getItem(TUITION_CODE_ONLY_KEY) === "true" ||
        localStorage.getItem("tuition_guest_session") === "true" ||
        localStorage.getItem("is_tuition_code_session") === "true"
      ) {
        return false;
      }

      const mainToken = localStorage.getItem("token");
      const tuitionToken = localStorage.getItem(TUITION_MODE_TOKEN_KEY);
      const userEmail = localStorage.getItem("userEmail");
      const userStr = localStorage.getItem("user");

      // Must have a real token
      if (!mainToken || !mainToken.trim()) return false;
      if (!userStr) return false;

      const user = JSON.parse(userStr);
      if (!user || typeof user !== "object") return false;

      // 2. Strict synthetic / guest email checks
      const email = (user.email || userEmail || "").toLowerCase().trim();
      if (
        !email ||
        email.includes("temporary") ||
        email.includes("@tuition.edupye.com") ||
        email.includes("tuition.edupye") ||
        email.includes("@tuition") ||
        email.startsWith("stu-") ||
        email.startsWith("tch-") ||
        user.isTuitionGuest === true ||
        user.isGuest === true
      ) {
        return false;
      }

      // 3. User must have userEmail key in localStorage (set exclusively by real LMS authService login/register)
      if (!userEmail || userEmail.toLowerCase().trim() !== email) {
        return false;
      }

      // 4. If user is in a student role, they MUST possess studentProfileId in localStorage
      const role = (user.role || user.activeRole || "student").toLowerCase();
      if (role === "student" || role === "learner" || role === "personal") {
        const studentProfileId = localStorage.getItem("studentProfileId");
        if (!studentProfileId || !studentProfileId.trim()) {
          return false;
        }
      } else if (role === "teacher") {
        const teacherProfileId = localStorage.getItem("teacherProfileId");
        if (!teacherProfileId || !teacherProfileId.trim()) {
          return false;
        }
      }

      // 5. If main token is identical to tuition token without LMS profile IDs, return false
      if (
        mainToken === tuitionToken &&
        !localStorage.getItem("studentProfileId") &&
        !localStorage.getItem("teacherProfileId")
      ) {
        return false;
      }

      return !!(user && (user.id || user._id));
    } catch {
      return false;
    }
  },

  getTuitionModeSession: (): { token: string | null; programContext: TuitionProgramContext | null } => {
    const token = localStorage.getItem(TUITION_MODE_TOKEN_KEY);
    const rawContext = localStorage.getItem(TUITION_PROGRAM_CONTEXT_KEY);
    let programContext: TuitionProgramContext | null = null;
    if (rawContext) {
      try {
        programContext = JSON.parse(rawContext);
      } catch (e) {
        programContext = null;
      }
    }
    return { token, programContext };
  },

  hasAnyVerifiedProgram: (): boolean => {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(TUITION_VERIFIED_PREFIX) && sessionStorage.getItem(key) === "true") {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  isProgramVerified: (programId?: string, programCode?: string): boolean => {
    try {
      // 1. Direct programId match in sessionStorage
      if (programId && sessionStorage.getItem(`${TUITION_VERIFIED_PREFIX}${programId}`) === "true") {
        return true;
      }
      // 2. Direct programCode match in sessionStorage
      if (programCode && sessionStorage.getItem(`${TUITION_VERIFIED_PREFIX}${programCode}`) === "true") {
        return true;
      }

      // 3. Active Tuition Mode session recognition
      const { token, programContext } = tuitionService.getTuitionModeSession();
      if (token) {
        // If programId or code matches active program context
        if (programContext) {
          const progCtxId = programContext._id || programContext.programId;
          if (programId && (progCtxId === programId || programContext.code === programId)) {
            return true;
          }
          if (programCode && (programContext.code === programCode || progCtxId === programCode)) {
            return true;
          }
        }

        // If user is already authenticated in Tuition Mode with a studentCode or teacherCode
        const userJson = localStorage.getItem("user");
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            if (user?.studentCode || user?.teacherCode || user?.code) {
              return true;
            }
          } catch {}
        }

        // If user has any verified program flag in sessionStorage
        if (tuitionService.hasAnyVerifiedProgram()) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  },

  setProgramVerified: (programId: string, programCode?: string): void => {
    try {
      if (programId) {
        sessionStorage.setItem(`${TUITION_VERIFIED_PREFIX}${programId}`, "true");
      }
      if (programCode) {
        sessionStorage.setItem(`${TUITION_VERIFIED_PREFIX}${programCode}`, "true");
      }
    } catch {}
  },

  clearProgramVerified: (programId?: string): void => {
    try {
      if (programId) {
        sessionStorage.removeItem(`${TUITION_VERIFIED_PREFIX}${programId}`);
      } else {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(TUITION_VERIFIED_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      }
    } catch {}
  },

  clearTuitionModeSession: () => {
    // Strictly clear all Tuition Mode storage keys
    localStorage.removeItem(TUITION_MODE_TOKEN_KEY);
    localStorage.removeItem(TUITION_MODE_SESSION_KEY);
    localStorage.removeItem(TUITION_PROGRAM_CONTEXT_KEY);
    localStorage.removeItem("tuition_guest_session");
    localStorage.removeItem("is_tuition_code_session");
    sessionStorage.removeItem("tuition_redirect_after_login");
    sessionStorage.removeItem(TUITION_CODE_ONLY_KEY);
    tuitionService.clearProgramVerified();
  },

  exitTuitionMode: (): void => {
    const isPrimary = tuitionService.hasPrimaryLmsSession();
    let currentUser: any = null;
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) currentUser = JSON.parse(rawUser);
    } catch {}

    // 1. Clear all Tuition Mode storage keys cleanly
    tuitionService.clearTuitionModeSession();

    // 2. If the user does NOT have a verified primary LMS session, remove temp token/user & hard redirect to '/'
    if (!isPrimary) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");

      if (typeof window !== "undefined") {
        window.location.replace("/");
      }
      return;
    }

    // 3. If the user DOES have a verified primary LMS session, hard redirect to their dashboard
    const role = (currentUser?.role || currentUser?.activeRole || "").toLowerCase();
    const targetPath = role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
    if (typeof window !== "undefined") {
      window.location.replace(targetPath);
    }
  },

  applyForTutor: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    qualification?: string;
    subjects?: string[];
    grades?: string[];
    experienceYears?: number;
    bio?: string;
    demoLink?: string;
  }): Promise<{ success: boolean; message: string; user: any; profile: any }> => {
    return apiRequest<{ success: boolean; message: string; user: any; profile: any }>(
      "/tuition/tutor-apply",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};

