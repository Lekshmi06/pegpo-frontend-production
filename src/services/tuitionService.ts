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
} from "../types/tuition";

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
};

