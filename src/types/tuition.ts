export type TuitionVerificationStatus = "pending" | "verified" | "rejected" | "needs_info";
export type TuitionPlatformTier = "standard" | "gold" | "platinum" | "diamond";
export type TuitionTeachingMode = "online" | "offline" | "hybrid";
export type TuitionClassFormat = "1:1" | "1:2" | "group" | "1:N";
export type TuitionOfferingStatus = "published" | "draft" | "archived";
export type TuitionBatchStatus = "upcoming" | "active" | "completed" | "cancelled";
export type TuitionScheduleModel = "fixed_batch" | "flexible_slot";
export type TuitionRequestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "paid";
export type TuitionEnrollmentStatus = "active" | "completed" | "cancelled";
export type TuitionSessionStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface ITuitionEducation {
  degree: string;
  institution: string;
  yearOfPassing?: number;
  isVerified?: boolean;
}

export interface ITuitionDocument {
  title: string;
  documentUrl: string;
  uploadedAt?: string;
}

export interface ITierScoreBreakdown {
  educationLevelMatched?: string;
  educationPoints: number;
  verifiedExperienceYears?: number;
  experiencePoints: number;
  verifiedRatingAverage?: number;
  verifiedRatingCount?: number;
  ratingPoints: number;
  verifiedReviewCount?: number;
  reviewPoints: number;
  totalPoints: number;
  isProvisional: boolean;
  lastCalculatedAt?: string;
}

export interface ITierOverrideDetails {
  isOverridden: boolean;
  previousTier?: TuitionPlatformTier;
  overriddenTier?: TuitionPlatformTier;
  adminUserId?: string;
  adminName?: string;
  reason?: string;
  overriddenAt?: string;
}

export interface ITierAuditEntry {
  tier: TuitionPlatformTier;
  previousTier?: TuitionPlatformTier;
  totalPoints: number;
  isProvisional: boolean;
  assignedBy: string;
  reason?: string;
  isOverride?: boolean;
  assignedAt: string;
}

export interface ITuitionProviderBadge {
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  awardedAt: string;
  criteria: string;
}

export interface TuitionProviderProfile {
  _id: string;
  userId: string;
  fullName: string;
  headline?: string;
  bio?: string;
  photoUrl?: string;
  education: ITuitionEducation[];
  qualifications: string[];
  experienceYears: number;
  isQualificationsVerified?: boolean;
  isExperienceVerified?: boolean;
  subjects: string[];
  classesTaught: string[];
  teachingMode: TuitionTeachingMode[];
  teachingMethodology?: string;
  availableHours?: string;
  preferredSchedule?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  supportingDocuments?: ITuitionDocument[];
  verificationStatus: TuitionVerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  platformTier: TuitionPlatformTier;
  calculatedTier?: TuitionPlatformTier;
  isOverridden?: boolean;
  overrideDetails?: ITierOverrideDetails;
  isProvisionalTier?: boolean;
  provisionalReason?: string;
  tierScore?: ITierScoreBreakdown;
  tierAssignedBy?: string;
  tierAssignedAt?: string;
  tierAuditTrail?: ITierAuditEntry[];
  verificationAuditTrail?: any[];
  badges?: ITuitionProviderBadge[];
  rating: {
    average: number;
    count: number;
  };
  pricing: {
    minHourlyRate?: number;
    maxHourlyRate?: number;
    currency: string;
  };
  isActive: boolean;
  offerings?: TuitionOffering[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IOfferingTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface TuitionOffering {
  _id: string;
  providerId: string | { _id: string; name?: string; email?: string };
  providerProfileId?: string | TuitionProviderProfile;
  title: string;
  subject: string;
  classLevel: string;
  description: string;
  teachingMode: TuitionTeachingMode;
  classFormat: TuitionClassFormat;
  scheduleModel: TuitionScheduleModel;
  maxCapacity: number;
  feeAmount: number;
  billingUnit: "per_session" | "monthly" | "batch" | "hourly";
  currency: string;
  availableDays: string[];
  timeSlots?: IOfferingTimeSlot[];
  startDate?: string;
  durationWeeks?: number;
  duration?: string;
  totalSessionsPlanned?: number;
  status?: TuitionOfferingStatus;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  provider?: TuitionProviderProfile;
  batches?: TuitionBatch[];
}

export interface TuitionBatch {
  _id: string;
  offeringId: string | TuitionOffering;
  providerId: string;
  title: string;
  subject?: string;
  classLevel?: string;
  teachingMode?: TuitionTeachingMode;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  maxCapacity: number;
  enrolledCount: number;
  timezone?: string;
  startDate: string;
  endDate?: string;
  status: TuitionBatchStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchOfferingsQuery {
  search?: string;
  subject?: string;
  classLevel?: string;
  teachingMode?: string;
  classFormat?: string;
  minFee?: number;
  maxFee?: number;
  day?: string;
  tier?: string;
  minRating?: number;
  minExperience?: number;
  qualification?: string;
  page?: number;
  limit?: number;
}

export interface SearchOfferingsResponse {
  success: boolean;
  offerings: TuitionOffering[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IRequestedSlot {
  day: string;
  startTime: string;
  endTime: string;
  specificDate?: string;
}

export interface TuitionRequest {
  _id: string;
  studentId: string | { _id: string; name?: string; email?: string; phone?: string };
  providerId: string | { _id: string; name?: string; email?: string };
  offeringId: string | TuitionOffering;
  batchId?: string | TuitionBatch;
  scheduleModel: TuitionScheduleModel;
  classFormat: TuitionClassFormat;
  teachingMode: TuitionTeachingMode;
  subject: string;
  requestedSlot?: IRequestedSlot;
  studentNotes?: string;
  providerResponseNotes?: string;
  feeAmount: number;
  currency: string;
  status: TuitionRequestStatus;
  statusHistory?: Array<{ status: string; changedAt: string; note?: string }>;
  simulationPaymentToken?: string;
  simulationTransactionId?: string;
  enrollmentId?: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface TuitionEnrollment {
  _id: string;
  studentId: string | { _id: string; name?: string; email?: string };
  providerId: string | { _id: string; name?: string; email?: string };
  offeringId: string | TuitionOffering;
  batchId?: string | TuitionBatch;
  requestId: string;
  subject: string;
  classLevel: string;
  classFormat: TuitionClassFormat;
  teachingMode: TuitionTeachingMode;
  scheduleModel: TuitionScheduleModel;
  scheduleDetails: {
    daysOfWeek?: string[];
    startTime?: string;
    endTime?: string;
    slotDay?: string;
  };
  status: TuitionEnrollmentStatus;
  feePaid: number;
  currency: string;
  paymentTransactionId: string;
  enrolledAt: string;
  sessionsAttended: number;
  totalSessionsConducted: number;
}

export interface TuitionSession {
  _id: string;
  offeringId: string | TuitionOffering;
  batchId?: string | TuitionBatch;
  enrollmentId?: string;
  providerId: string | { _id: string; name?: string; email?: string };
  studentIds: Array<string | { _id: string; name?: string; email?: string }>;
  title: string;
  topic?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: TuitionSessionStatus;
  meetingProvider: string;
  meetingLink?: string;
  notes?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface TuitionMaterial {
  _id: string;
  providerId: string | { _id: string; name?: string };
  offeringId: string | { _id: string; title?: string; subject?: string };
  batchId?: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string;
  createdAt?: string;
}

export interface TuitionAssessment {
  _id: string;
  providerId: string | { _id: string; name?: string };
  offeringId: string | { _id: string; title?: string; subject?: string };
  batchId?: string;
  title: string;
  description?: string;
  totalMarks: number;
  dueDate: string;
  submissions?: Array<{
    studentId: string;
    fileUrl?: string;
    notes?: string;
    submittedAt?: string;
    marksAwarded?: number;
    feedback?: string;
  }>;
  mySubmission?: {
    fileUrl?: string;
    notes?: string;
    submittedAt?: string;
    marksAwarded?: number;
    feedback?: string;
  };
  createdAt?: string;
}

export interface TuitionReview {
  _id: string;
  studentId: string | { _id: string; name?: string };
  providerId: string;
  enrollmentId: string;
  subject: string;
  rating: number;
  reviewText: string;
  status: "published" | "flagged" | "hidden";
  createdAt?: string;
}

export interface TuitionTransaction {
  _id: string;
  studentId: string | { _id: string; name?: string; email?: string };
  providerId: string | { _id: string; name?: string };
  offeringId: string | { _id: string; title?: string; subject?: string };
  requestId: string;
  enrollmentId?: string;
  grossAmount: number;
  currency: string;
  status: "paid" | "refunded" | "pending";
  gatewayTransactionId: string;
  paymentMethod: string;
  createdAt: string;
}

