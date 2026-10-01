export type AcademicGroupType = 'institution' | 'tuition';

export interface ClassSection {
  _id: string;
  organizationId?: string;
  name: string;
  classLevel: string;
  section: string;
  board: string;
  academicYear: string;
  type: AcademicGroupType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherClassGroup {
  classSectionId: string;
  name: string;
  classLevel: string;
  section: string;
  subject: string;
  board: string;
  academicYear: string;
  studentCount: number;
  teachingContextId: string;
}

export interface ClassStudentItem {
  membershipId: string;
  rollNumber?: string;
  academicYear: string;
  joinedAt?: string;
  studentProfileId?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  studentType: 'institution' | 'tuition' | 'external';
  classLevel?: string;
}
