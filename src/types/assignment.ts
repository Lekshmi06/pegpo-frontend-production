export type AssignmentType = 'homework' | 'assignment' | 'project';
export type AssignmentStatus = 'draft' | 'published' | 'archived';
export type AssignmentTargetType = 'all' | 'selected';
export type SubmissionStatus = 'draft' | 'submitted' | 'late' | 'evaluated' | 'pending';

export interface IAssignmentAttachment {
  _id: string;
  originalName: string;
  storedName: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface IAssignment {
  _id: string;
  teacherId: string;
  teacherName: string;
  classSectionId: string;
  teachingContextId?: string;
  title: string;
  subject: string;
  description: string;
  instructions?: string;
  type: AssignmentType;
  targetType: AssignmentTargetType;
  targetStudentProfileIds: string[];
  assignedDate: string;
  dueDate: string;
  dueTime: string;
  totalMarks: number;
  passingMarks?: number;
  attachments: IAssignmentAttachment[];
  allowLateSubmission: boolean;
  lateSubmissionDeadline?: string;
  status: AssignmentStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentStats {
  totalTargeted: number;
  submittedCount: number;
  evaluatedCount: number;
  lateCount: number;
  pendingCount: number;
}

export interface AssignmentSummary {
  assignment: IAssignment;
  stats: AssignmentStats;
}

export interface StudentSubmissionItem {
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  rollNumber?: string;
  status: SubmissionStatus;
  submissionId?: string;
  submittedAt?: string | null;
  isLate?: boolean;
  marksAwarded?: number;
  grade?: string;
  feedback?: string;
  attachmentCount: number;
  content?: string;
  attachments?: IAssignmentAttachment[];
}

export interface AssignmentSubmissionsResult {
  assignment: IAssignment;
  summary: {
    totalStudents: number;
    submittedCount: number;
    evaluatedCount: number;
    lateCount: number;
    pendingCount: number;
  };
  submissions: StudentSubmissionItem[];
}

export interface TeacherAssignmentFilter {
  classSectionId?: string;
  status?: AssignmentStatus;
  type?: AssignmentType;
  subject?: string;
  search?: string;
}

export interface CreateAssignmentPayload {
  title: string;
  subject: string;
  description: string;
  instructions?: string;
  type?: AssignmentType;
  classSectionId: string;
  teachingContextId?: string;
  targetType?: AssignmentTargetType;
  targetStudentProfileIds?: string[];
  assignedDate?: string;
  dueDate: string;
  dueTime?: string;
  totalMarks?: number;
  passingMarks?: number;
  allowLateSubmission?: boolean;
  lateSubmissionDeadline?: string;
  status?: AssignmentStatus;
  attachments?: File[];
}

export interface UpdateAssignmentPayload {
  title?: string;
  subject?: string;
  description?: string;
  instructions?: string;
  type?: AssignmentType;
  classSectionId?: string;
  targetType?: AssignmentTargetType;
  targetStudentProfileIds?: string[];
  dueDate?: string;
  dueTime?: string;
  totalMarks?: number;
  passingMarks?: number;
  allowLateSubmission?: boolean;
  lateSubmissionDeadline?: string;
  removedAttachmentKeys?: string[];
  newAttachments?: File[];
}

export interface EvaluateSubmissionPayload {
  marksAwarded: number;
  grade?: string;
  feedback?: string;
}

// ============================================================================
// Student Assignment Interfaces
// ============================================================================

export type StudentAssignmentDerivedStatus =
  | 'pending'
  | 'submitted'
  | 'late'
  | 'evaluated'
  | 'overdue';

export interface StudentAssignmentItem {
  assignment: IAssignment;
  submissionStatus: StudentAssignmentDerivedStatus;
  submissionId?: string;
  submittedAt?: string | null;
  marksAwarded?: number;
  grade?: string;
  feedback?: string;
}

export interface ISubmissionAttachment {
  _id: string;
  originalName: string;
  storedName: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ISubmissionHistoryItem {
  version: number;
  submittedAt: string;
  content?: string;
  attachments: ISubmissionAttachment[];
  comment?: string;
}

export interface IEvaluation {
  marksAwarded: number;
  grade?: string;
  feedback?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
}

export interface IAssignmentSubmission {
  _id: string;
  assignmentId: string | IAssignment;
  studentProfileId: string;
  studentName: string;
  studentEmail?: string;
  status: 'draft' | 'submitted' | 'late' | 'evaluated';
  content?: string;
  attachments: ISubmissionAttachment[];
  submissionHistory: ISubmissionHistoryItem[];
  evaluation?: IEvaluation;
  submittedAt?: string | null;
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAssignmentDetailsResponse {
  assignment: IAssignment;
  submission: IAssignmentSubmission | null;
}

export interface StudentAssignmentFilter {
  status?: 'all' | StudentAssignmentDerivedStatus;
  type?: AssignmentType;
  subject?: string;
  search?: string;
}

export interface SubmitAssignmentPayload {
  content?: string;
  isDraft?: boolean;
  comment?: string;
  files?: File[];
}

