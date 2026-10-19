import {
  SchoolAcademicInfo,
  UndergraduateAcademicInfo,
  PostgraduateAcademicInfo,
  CompetitiveExamAcademicInfo,
  LearningPath,
} from './auth';

export interface DocumentItem {
  id: number | string;
  title: string;
  type: string;
  date: string;
}

export interface UploadCard {
  id: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  textColor: string;
}

export interface Chapter {
  id: number | string;
  title: string;
  duration: string;
}

export interface Course {
  id: number | string;
  title: string;
  subject: string;
  progress: number;
  instructor: string;
  image: string;
  chapters: Chapter[];
}

export interface StudentDashboardData {
  recentDocuments: DocumentItem[];
  uploadCards: UploadCard[];
}

export type EducationLevel =
  | 'school'
  | 'undergraduate'
  | 'postgraduate'
  | 'competitive_exam'
  | 'professional'
  | 'other';

export interface StudentEducation {
  level?: EducationLevel;
  board?: string;
  classLevel?: string;
  degree?: string;
  specialization?: string;
  institution?: string;
}

export interface StudentUserRef {
  _id: string;
  email: string;
  userType: 'student';
  language?: string;
}

export interface StudentProfile {
  _id: string;
  userId: StudentUserRef;
  name: string;
  phone?: string;
  dob?: string;
  gender?: string;
  avatar?: string;
  goal?: string;
  education?: StudentEducation;
  learningPath?: LearningPath;
  schoolDetails?: SchoolAcademicInfo;
  undergraduateDetails?: UndergraduateAcademicInfo;
  postgraduateDetails?: PostgraduateAcademicInfo;
  competitiveExamDetails?: CompetitiveExamAcademicInfo;
  studyPreferences?: StudyPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudyPreferences {
  category?: 'school' | 'college' | 'competitive_exam' | 'other' | string;
  goal?: string;
  currentScore?: string;
  hasTakenExam?: boolean;
  targetScore?: string;
  preferredTools?: string[];
  uploadedMaterialFileName?: string;
}

export interface UpdateStudentProfileDTO {
  name?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  avatar?: string;
  goal?: string;
  learningPath?: LearningPath;
  language?: string;
  education?: StudentEducation;
  schoolDetails?: SchoolAcademicInfo;
  undergraduateDetails?: UndergraduateAcademicInfo;
  postgraduateDetails?: PostgraduateAcademicInfo;
  competitiveExamDetails?: CompetitiveExamAcademicInfo;
  studyPreferences?: StudyPreferences;
}

export interface CreateStudentProfileDTO {
  email: string;
  name: string;
  phone?: string;
  dob?: string;
  gender?: string;
  avatar?: string;
  goal?: string;
  language?: string;
  learningPath?: LearningPath;
  education?: StudentEducation;
  schoolDetails?: SchoolAcademicInfo;
  undergraduateDetails?: UndergraduateAcademicInfo;
  postgraduateDetails?: PostgraduateAcademicInfo;
  competitiveExamDetails?: CompetitiveExamAcademicInfo;
}

export interface StudentSummaryCards {
  studyTimeThisWeek: {
    totalMinutes: number;
    formatted: string;
    previousWeekMinutes: number;
    percentageChange: number | null;
    hasActivity: boolean;
    measurementNotice?: string;
  };
  learningMaterialsCompleted: {
    total: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
    hasActivity: boolean;
  };
  quizAverage: {
    averagePercentage: number | null;
    formatted: string;
    totalQuizzesTaken: number;
    hasActivity: boolean;
  };
  currentStudyStreak: {
    days: number;
    bestStreakDays: number;
    hasActivity: boolean;
    lastActiveDate: string | null;
  };
}

export interface WeeklyStudyActivityItem {
  dayLabel: string;
  date: string;
  studyMinutes: number;
  quizMinutes: number;
  totalMinutes: number;
}

export interface SubjectProgressItem {
  subject: string;
  masteryPercentage: number;
  completedItems: number;
  totalItems: number;
  color: string;
}

export interface RecentAssessmentItem {
  id: string;
  title: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  completedAt: string;
}

export interface RecentActivityFeedItem {
  id: string;
  title: string;
  type: 'note' | 'quiz' | 'course' | 'session';
  timestamp: string;
  destinationPath: string;
}

export interface UpcomingTaskItem {
  id: string;
  title: string;
  dueDate: string;
  time?: string;
  eventType: string;
  isOverdue: boolean;
}

export interface ContinueLearningItem {
  courseId: string;
  title: string;
  thumbnail?: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedLessonTitle?: string;
  destinationPath: string;
}

export interface AIStudyRecommendationItem {
  id: string;
  type: 'review' | 'streak' | 'continue_course' | 'practice';
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StudentAnalyticsData {
  student: {
    name: string;
    email: string;
    avatar?: string;
    learningPath: string;
    gradeOrLevel: string;
    institution: string;
  };
  summaryCards: StudentSummaryCards;
  weeklyStudyActivity: WeeklyStudyActivityItem[];
  subjectProgress: SubjectProgressItem[];
  recentAssessments: RecentAssessmentItem[];
  recentActivity: RecentActivityFeedItem[];
  upcomingTasks: UpcomingTaskItem[];
  continueLearning: ContinueLearningItem[];
  aiStudyRecommendations: AIStudyRecommendationItem[];
}
