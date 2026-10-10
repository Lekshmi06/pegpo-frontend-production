export type InstitutionType =
  | 'school'
  | 'college'
  | 'training_institute'
  | 'coaching_centre'
  | 'company'
  | 'corporate_training'
  | 'other';

export type InstitutionRole = 'admin' | 'subadmin' | 'trainer' | 'trainee' | 'parent';

export type MembershipStatus = 'active' | 'invited' | 'suspended';

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';

export interface IInstitutionAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface IInstitutionSettings {
  allowMemberInvites?: boolean;
  defaultBatchNaming?: string;
  industryOrField?: string;
  companySize?: string;
}

export interface IInstitution {
  _id: string;
  name: string;
  slug: string;
  institutionType: InstitutionType;
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: IInstitutionAddress;
  owner: {
    _id: string;
    name?: string;
    email: string;
    userType: string;
  } | string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  settings?: IInstitutionSettings;
  createdAt: string;
  updatedAt: string;
}

export interface IInstitutionMembership {
  _id: string;
  institutionId: string | IInstitution;
  userId: {
    _id: string;
    name?: string;
    email: string;
    userType: string;
  };
  role: InstitutionRole;
  status: MembershipStatus;
  title?: string;
  department?: string;
  team?: string;
  managerId?: {
    _id: string;
    name?: string;
    email: string;
  };
  onboardingStatus?: OnboardingStatus;
  permissions?: string[];
  linkedLearners?: Array<{
    _id: string;
    name?: string;
    email: string;
    userType: string;
  }>;
  invitationCode?: string;
  notes?: string;
  invitedBy?: {
    _id: string;
    name?: string;
    email: string;
  };
  joinedAt?: string;
  createdAt: string;
}

export interface IInvitationInfo {
  code: string;
  role: InstitutionRole;
  title?: string;
  department?: string;
  status: MembershipStatus;
  institution: {
    _id: string;
    name: string;
    slug: string;
    institutionType: InstitutionType;
    description?: string;
    logo?: string;
  };
  invitedUser: {
    _id: string;
    name?: string;
    email: string;
  };
  invitedBy?: {
    _id: string;
    name?: string;
    email: string;
  };
}

export interface IInstitutionDashboardMetrics {
  institution: {
    _id: string;
    name: string;
    slug: string;
    institutionType: InstitutionType;
    logo?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    status: string;
    createdAt: string;
  };
  metrics: {
    totalMembers: number;
    totalTrainees: number;
    totalTrainers: number;
    totalAdmins: number;
  };
  recentMembers: IInstitutionMembership[];
}

// ==========================================
// Corporate Learning & Onboarding Types
// ==========================================

export interface IDepartment {
  _id: string;
  institutionId: string;
  name: string;
  description?: string;
  headId?: {
    _id: string;
    name: string;
    email: string;
  };
  teams: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IProgramCourseItem {
  courseId: {
    _id: string;
    title: string;
    slug: string;
    category?: string;
    level?: string;
    price?: number;
    thumbnail?: string;
    totalLessons?: number;
    totalDurationMinutes?: number;
  };
  isRequired: boolean;
  order: number;
}

export interface ITrainingProgram {
  _id: string;
  institutionId: string;
  title: string;
  description?: string;
  category: string;
  courses: IProgramCourseItem[];
  assignedEmployees: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  assignedDepartments: string[];
  dueDate?: string;
  estimatedDurationHours?: number;
  status: 'draft' | 'active' | 'archived';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ICorporateDashboardMetrics {
  company: {
    _id: string;
    name: string;
    slug: string;
    institutionType: InstitutionType;
    logo?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    settings?: IInstitutionSettings;
  };
  workforce: {
    totalStaff: number;
    totalEmployees: number;
    totalManagers: number;
    totalTrainers: number;
    totalAdmins: number;
    totalDepartments: number;
  };
  onboarding: {
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
  };
  training: {
    totalPrograms: number;
    totalEnrollments: number;
  };
  recentEmployees: IInstitutionMembership[];
  recentPrograms: ITrainingProgram[];
}

export interface IEmployeeTrainingProgress {
  employee: IInstitutionMembership;
  overallCompletionRate: number;
  programs: Array<{
    _id: string;
    title: string;
    description?: string;
    category: string;
    dueDate?: string;
    estimatedDurationHours?: number;
    averageProgress: number;
    isProgramCompleted: boolean;
    courses: Array<{
      course: {
        _id: string;
        title: string;
        slug: string;
        totalLessons?: number;
      };
      isRequired: boolean;
      order: number;
      progressPercentage: number;
      status: 'completed' | 'in_progress';
      enrollmentId?: string;
    }>;
  }>;
  totalAssignedPrograms: number;
}
