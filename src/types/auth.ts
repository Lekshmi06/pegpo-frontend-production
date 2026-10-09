export type UserRole =
  | 'student'
  | 'teacher'
  | 'researcher'
  | 'institution'
  | 'work'
  | 'personal'
  | 'provider'
  | 'learner';

export type LearningPath =
  | 'school'
  | 'undergraduate'
  | 'postgraduate'
  | 'competitive_exam';

export interface SchoolAcademicInfo {
  schoolName?: string;
  classLevel?: string;
  board?: string;
  studyMode?: 'full_syllabus' | 'specific_subject';
  selectedSubject?: string;
  customSubject?: string;
  syllabusFileName?: string;
  textbookFileName?: string;
}

export interface UndergraduateAcademicInfo {
  institution?: string;
  degree?: string;
  specialization?: string;
  year?: string;
  semester?: string;
  university?: string;
  syllabusFileName?: string;
}

export interface PostgraduateAcademicInfo {
  institution?: string;
  degree?: string;
  specialization?: string;
  thesisTopic?: string;
  researchArea?: string;
  year?: string;
  syllabusFileName?: string;
  proposalFileName?: string;
}

export interface CompetitiveExamAcademicInfo {
  targetExam?: string;
  targetYear?: string;
  category?: string;
  preparationMode?: string;
  syllabusFileName?: string;
}

export interface PersonalDetails {
  name: string;
  phone?: string;
  dob?: string;
  gender?: string;
  avatar?: string;
  language?: string;
  bio?: string;
}

export interface UserSession {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  avatar?: string;
  role?: UserRole;
  learningPath?: LearningPath;
  goal?: string;
  language?: string;
  schoolDetails?: SchoolAcademicInfo;
  undergraduateDetails?: UndergraduateAcademicInfo;
  postgraduateDetails?: PostgraduateAcademicInfo;
  competitiveExamDetails?: CompetitiveExamAcademicInfo;
  teacherDetails?: {
    teacherType?: 'institution' | 'tuition';
    institution?: string;
    tuitionCentre?: string;
    department?: string;
    designation?: string;
    subjects?: string[];
    classesTaught?: string[];
    boards?: string[];
    experienceYears?: number;
  };
  researcherProfileId?: string;
  researcherDetails?: any;
  token?: string;
  createdAt?: string;
}
