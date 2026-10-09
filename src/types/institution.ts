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

