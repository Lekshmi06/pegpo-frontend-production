export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type LessonContentType = 'video' | 'article' | 'document' | 'quiz';

export interface ILesson {
  _id?: string;
  title: string;
  contentType: LessonContentType;
  durationMinutes?: number;
  videoUrl?: string;
  articleContent?: string;
  resourceFileUrl?: string;
  resourceFileName?: string;
  isPreviewFree?: boolean;
  order: number;
  isLocked?: boolean;
}

export interface ICourseSection {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  requiredInstalmentNumber?: number; // Progressive milestone requirement
  isLocked?: boolean;
  lessons: ILesson[];
}

export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  thumbnail?: string;
  provider: string;
  providerName?: string;
  category: string;
  level: CourseLevel;
  language: string;
  price: number;
  currency: string;
  allowInstalments?: boolean;
  maxInstalments?: number;
  instalmentFrequencyDays?: number;
  averageRating?: number;
  reviewCount?: number;
  status: CourseStatus;
  sections: ICourseSection[];
  totalLessons: number;
  totalDurationMinutes: number;
  enrollmentCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEnrollment {
  _id: string;
  learner: string;
  course: ICourse;
  status: 'active' | 'completed';
  paymentStatus: 'free' | 'paid' | 'waived' | 'pending';
  enrolledAt: string;
  completedLessons: string[];
  lastAccessedLesson?: string;
  progressPercentage: number;
  completedAt?: string;
}

export type PaymentPlanType = 'full' | 'instalment';
export type PaymentPlanStatus = 'pending' | 'active' | 'completed' | 'defaulted' | 'cancelled';
export type InstalmentStatus = 'pending' | 'paid' | 'overdue' | 'failed';

export interface IInstalmentItem {
  instalmentNumber: number;
  amount: number;
  dueDate: string;
  status: InstalmentStatus;
  paidAt?: string;
  transactionId?: string;
  gatewayPaymentId?: string;
}

export interface ICoursePaymentPlan {
  _id: string;
  learner: string;
  course: string | ICourse;
  planType: PaymentPlanType;
  totalAmount: number;
  currency: string;
  totalInstalments: number;
  paidInstalmentsCount: number;
  status: PaymentPlanStatus;
  schedule: IInstalmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IFinancialTransaction {
  _id: string;
  transactionId: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    price?: number;
  };
  learner: {
    _id: string;
    name: string;
    email: string;
  };
  instalmentNumber: number;
  grossAmount: number;
  currency: string;
  providerShare: number;
  platformShare: number;
  providerSharePercentage: number;
  platformSharePercentage: number;
  settlementStatus: 'pending' | 'settled' | 'held' | 'refunded';
  paymentStatus: 'success' | 'failed' | 'refunded';
  gatewayProvider: string;
  gatewayTransactionId: string;
  createdAt: string;
}

export interface ProviderFinancialSummary {
  summary: {
    totalGrossRevenue: number;
    totalProviderEarnings: number;
    totalPlatformCommission: number;
    pendingSettlements: number;
    settledEarnings: number;
    totalTransactions: number;
    fullPaymentsCount: number;
    totalInstalmentPaymentsCount: number;
    activeInstalmentPlansCount: number;
    revenueShareRule: string;
  };
  transactions: IFinancialTransaction[];
}

export interface ICourseReview {
  _id: string;
  course: string;
  learner: string;
  learnerName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export interface ICertificate {
  _id: string;
  certificateNumber: string;
  course: string | ICourse;
  learner: string;
  recipientName: string;
  courseTitle: string;
  providerName?: string;
  issueDate: string;
}

export interface ReviewEligibilityResult {
  eligible: boolean;
  reason?: string;
  certificateNumber?: string;
  completedAt?: string;
}

export interface ProviderDashboardStats {
  totalCourses: number;
  draftCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
}

export interface CourseFilterQuery {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
}
