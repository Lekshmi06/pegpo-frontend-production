import { ComponentType } from 'react';

export type SourceProvider =
  | 'crossref'
  | 'arxiv'
  | 'semanticscholar'
  | 'upload'
  | 'manual'
  | 'demo';

export interface ResearchPaper {
  id: string;
  _id?: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  doi?: string;
  arxivId?: string;
  abstract: string;
  methodology?: string;
  dataset?: string;
  datasets?: string[];
  keyFindings?: string;
  findings?: string;
  limitations?: string;
  tags: string[];
  relevanceScore?: number;
  isBookmarked?: boolean;
  isStarred?: boolean;
  citationCount?: number;
  externalUrl?: string;
  pdfUrl?: string;
  localDocumentPath?: string;
  extractedText?: string;
  sourceProvider?: SourceProvider | string;
  isDemo?: boolean;
  savedAt?: string;
  projectIds?: Array<string | { _id: string; title: string; domain?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicSearchResultItem {
  id?: string;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  abstract: string;
  doi?: string;
  arxivId?: string;
  externalUrl?: string;
  pdfUrl?: string;
  sourceProvider: 'crossref' | 'arxiv' | 'semanticscholar' | 'demo';
  isDemo: boolean;
  citationCount?: number;
  relevanceScore?: number;
  tags?: string[];
  methodology?: string;
  datasets?: string[];
}

export interface AcademicSearchResponse {
  query: string;
  total: number;
  papers: AcademicSearchResultItem[];
  provider: string;
  isDemo: boolean;
}

export interface GroundedEvidenceItem {
  paperTitle: string;
  section?: string;
  excerpt: string;
}

export interface ResearchAIResponse {
  reply: string;
  groundedEvidence: GroundedEvidenceItem[];
  sourceSupported: boolean;
  contextScope: string;
  suggestedActions?: string[];
}

export interface ComparisonDimension {
  name: string;
  description: string;
  values: Record<string, string>;
}

export interface ComparisonTradeoff {
  dimension: string;
  comparison: string;
}

export interface PaperComparisonMatrix {
  paperIds: string[];
  papers?: ResearchPaper[];
  dimensions: ComparisonDimension[];
  tradeoffs?: ComparisonTradeoff[];
  aiTakeaway: string;
}

export interface ResearchProjectSummary {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  domain: string;
  currentStage: string;
  status?: string;
  problemStatement?: string;
  researchQuestion?: string;
  researchQuestions: string[];
  objectives?: string[];
  ownerId?: string | { _id: string; fullName?: string; contact?: { email?: string } };
  collaborators?: any[];
  paperCount: number;
  notesCount: number;
  gapsCount: number;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResearchProjectDetail {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  domain: string;
  researchQuestion?: string;
  objectives: string[];
  status: string;
  currentStage: string;
  paperIds: ResearchPaper[];
  noteIds?: ResearchNoteItem[];
  tags: string[];
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ResearchNoteType =
  | 'hypothesis'
  | 'methodology'
  | 'critique'
  | 'finding'
  | 'observation'
  | 'idea'
  | 'limitation'
  | 'quote'
  | 'general';

export type HypothesisStatus = 'idea' | 'testing' | 'supported' | 'rejected';

export interface ResearchNoteItem {
  id: string;
  _id?: string;
  title: string;
  content: string;
  projectId?: any;
  projectTitle?: string;
  paperId?: any;
  paperIds?: any[];
  paperTitle?: string;
  tags: string[];
  date?: string;
  type?: ResearchNoteType;
  noteType?: ResearchNoteType;
  hypothesisStatus?: HypothesisStatus;
  aiGenerated?: boolean;
  aiAssisted?: boolean;
  sourceText?: string;
  excerpt?: string;
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export interface ResearchActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  iconType: 'paper' | 'project' | 'note' | 'ai' | 'synthesis';
}

export interface ResearchInsightItem {
  id: string;
  category: 'Potential Gap' | 'Methodological Trend' | 'Emerging Direction' | 'Dataset Limitation';
  title: string;
  description: string;
  supportingPapers: string[];
  confidence: 'High' | 'Moderate' | 'Exploratory';
}

export interface ResearchQuickAction {
  id: string;
  title: string;
  description: string;
  iconName: string;
  route: string;
  actionType: string;
}

export interface ResearchNavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

export interface ResearchTopic {
  id: number | string;
  title: string;
  count: number;
}

export interface ResearchGoal {
  id: number | string;
  title: string;
  date: string;
}

export interface ResearchMenuGroup {
  id: string;
  bgClass?: string;
  title?: string;
  items: ResearchNavItem[];
}

export interface ResearchData {
  topics: ResearchTopic[];
  recentGoals: ResearchGoal[];
  recentPapers: ResearchPaper[];
  activeProjects: ResearchProjectSummary[];
  recentNotes: ResearchNoteItem[];
  recentActivity?: ResearchActivityItem[];
  activityStream?: ResearchActivityItem[];
  researchInsights?: ResearchInsightItem[];
  aiInsights?: ResearchInsightItem[];
}

export type ManuscriptStatus = 'draft' | 'in_progress' | 'completed';

export type ManuscriptSectionType =
  | 'abstract'
  | 'introduction'
  | 'literature_review'
  | 'research_gap'
  | 'methodology'
  | 'results'
  | 'discussion'
  | 'conclusion'
  | 'references'
  | 'custom';

export interface ManuscriptSection {
  id: string;
  _id?: string;
  manuscriptId: string;
  title: string;
  sectionType: ManuscriptSectionType | string;
  order: number;
  content: string;
  evidencePaperIds?: Array<string | ResearchPaper>;
  evidenceNoteIds?: Array<string | ResearchNoteItem>;
  aiAssisted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Manuscript {
  id: string;
  _id?: string;
  ownerId?: string;
  projectId: string | { _id: string; title: string; domain?: string; researchQuestion?: string; objectives?: string[]; status?: string; currentStage?: string };
  title: string;
  description?: string;
  status: ManuscriptStatus;
  citationStyle: string;
  sectionIds?: string[];
  sections?: ManuscriptSection[];
  totalSections?: number;
  completedSections?: number;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ManuscriptAiAction =
  | 'draft'
  | 'improve'
  | 'rewrite'
  | 'expand'
  | 'condense'
  | 'summarize_evidence'
  | 'organize_arguments'
  | 'suggest_missing_evidence'
  | 'check_flow'
  | 'unsupported_claims';

export interface ManuscriptAiAssistRequest {
  manuscriptId: string;
  sectionId: string;
  action: ManuscriptAiAction;
  instruction?: string;
  sectionTitle?: string;
  sectionContent?: string;
  paperIds?: string[];
  noteIds?: string[];
}

export interface ManuscriptAiAssistResponse {
  generatedText: string;
  groundedEvidence: GroundedEvidenceItem[];
  sourceSupported: boolean;
  action: ManuscriptAiAction;
  suggestedAdditions?: string[];
}

// -----------------------------------------------------------------
// Peer Collaboration & Co-Authoring
// -----------------------------------------------------------------

export type CollaborationRole = 'co_author' | 'reviewer' | 'contributor' | 'viewer';

export interface ProjectTeamMember {
  researcherId: string;
  fullName: string;
  email: string;
  domain?: string;
  role: 'owner' | CollaborationRole;
  joinedAt?: string;
  invitedBy?: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export interface CollaborationInvite {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    domain?: string;
    currentStage?: string;
    description?: string;
  } | string;
  inviterId: {
    _id: string;
    fullName: string;
    contact?: { email?: string };
    researchDomains?: string[];
    avatarUrl?: string;
  } | string;
  inviteeEmail: string;
  inviteeId?: {
    _id: string;
    fullName: string;
    contact?: { email?: string };
    avatarUrl?: string;
  } | string;
  role: CollaborationRole;
  status: InvitationStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManuscriptReply {
  _id?: string;
  authorId: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    contact?: { email?: string };
  } | string;
  content: string;
  createdAt: string;
}

export interface ManuscriptComment {
  _id: string;
  manuscriptId: string;
  sectionId?: string;
  authorId: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    contact?: { email?: string };
  } | string;
  content: string;
  highlightedText?: string;
  status: 'open' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: string;
  replies: ManuscriptReply[];
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------
// Academic Research Task & Kanban Types
// -----------------------------------------------------------------

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export type ResearchStage =
  | 'literature_review'
  | 'methodology'
  | 'data_collection'
  | 'experiment'
  | 'analysis'
  | 'writing'
  | 'review'
  | 'submission'
  | 'other';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ResearchTaskAssignee {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  contact?: { email?: string };
}

export interface ResearchTaskLinkedPaper {
  _id: string;
  title: string;
  authors?: string[];
  year?: number;
  venue?: string;
}

export interface ResearchTaskLinkedNote {
  _id: string;
  title: string;
  noteType?: string;
}

export interface ResearchTaskLinkedManuscript {
  _id: string;
  title: string;
  citationStyle?: string;
}

export interface ResearchTaskLinkedSection {
  _id: string;
  title: string;
  sectionType?: string;
  order?: number;
}

export interface ResearchTask {
  id: string;
  _id?: string;
  projectId: string;
  ownerId: string;
  createdBy: ResearchTaskAssignee | string;
  title: string;
  description?: string;
  status: TaskStatus;
  researchStage: ResearchStage;
  priority: TaskPriority;
  assigneeId?: ResearchTaskAssignee | string;
  dueDate?: string;
  paperIds: Array<ResearchTaskLinkedPaper | string>;
  noteIds: Array<ResearchTaskLinkedNote | string>;
  manuscriptId?: ResearchTaskLinkedManuscript | string;
  manuscriptSectionId?: ResearchTaskLinkedSection | string;
  completedAt?: string | null;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  researchStage?: ResearchStage;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  paperIds?: string[];
  noteIds?: string[];
  manuscriptId?: string;
  manuscriptSectionId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  researchStage?: ResearchStage;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  paperIds?: string[];
  noteIds?: string[];
  manuscriptId?: string | null;
  manuscriptSectionId?: string | null;
}

export interface TaskFilterOptions {
  status?: TaskStatus;
  researchStage?: ResearchStage;
  priority?: TaskPriority;
  assigneeId?: string;
  overdue?: boolean | string;
  dueFilter?: 'all' | 'overdue' | 'today' | 'this_week';
  dueDate?: string;
}

export interface TaskSummaryCounts {
  total: number;
  active: number;
  dueSoon: number;
  overdue: number;
  completed: number;
}

// ----------------------------------------------------
// Research Calendar & Timeline Types
// ----------------------------------------------------

export type ResearchCalendarEventType = 'milestone' | 'meeting' | 'deadline' | 'other';

export interface ResearchCalendarEvent {
  id: string;
  _id?: string;
  projectId: string | { _id: string; title: string; domain?: string };
  ownerId: string;
  createdBy: ResearchTaskAssignee | string;
  title: string;
  description?: string;
  type: ResearchCalendarEventType;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
  assigneeId?: ResearchTaskAssignee | string;
  relatedTaskId?: ResearchTask | string;
  relatedPaperIds?: Array<ResearchTaskLinkedPaper | string>;
  relatedNoteIds?: Array<ResearchTaskLinkedNote | string>;
  relatedManuscriptId?: ResearchTaskLinkedManuscript | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  type?: ResearchCalendarEventType;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  location?: string;
  assigneeId?: string;
  relatedTaskId?: string;
  relatedPaperIds?: string[];
  relatedNoteIds?: string[];
  relatedManuscriptId?: string;
}

export interface UpdateCalendarEventInput {
  title?: string;
  description?: string;
  type?: ResearchCalendarEventType;
  startDate?: string;
  endDate?: string | null;
  allDay?: boolean;
  location?: string | null;
  assigneeId?: string | null;
  relatedTaskId?: string | null;
  relatedPaperIds?: string[];
  relatedNoteIds?: string[];
  relatedManuscriptId?: string | null;
}

export interface CalendarQueryOptions {
  startDate?: string;
  endDate?: string;
  type?: string;
  assigneeId?: string;
  search?: string;
  includeTasks?: boolean;
  includeEvents?: boolean;
}

export interface CombinedProjectCalendarResponse {
  tasks: ResearchTask[];
  events: ResearchCalendarEvent[];
}

export type CalendarItemSourceType = 'task' | 'event';

export interface ResearchCalendarItem {
  id: string;
  sourceType: CalendarItemSourceType;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  projectId: string;
  projectTitle?: string;
  eventType: 'task_deadline' | ResearchCalendarEventType;
  location?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  researchStage?: ResearchStage;
  completedAt?: string | null;
  isOverdue?: boolean;
  assignee?: ResearchTaskAssignee;
  assigneeId?: string;
  relatedTaskId?: string;
  paperIds?: Array<ResearchTaskLinkedPaper | string>;
  noteIds?: Array<ResearchTaskLinkedNote | string>;
  manuscriptId?: ResearchTaskLinkedManuscript | string;
  manuscriptSectionId?: ResearchTaskLinkedSection | string;
  rawTask?: ResearchTask;
  rawEvent?: ResearchCalendarEvent;
}

export type ResearchDocType =
  | 'paper'
  | 'dataset'
  | 'manuscript'
  | 'proposal'
  | 'slides'
  | 'notes'
  | 'other';

export interface ResearchFolder {
  id: string;
  _id?: string;
  ownerId: string;
  name: string;
  description?: string;
  color?: string;
  category: 'literature' | 'datasets' | 'manuscripts' | 'notes' | 'general';
  isFavorite?: boolean;
  projectId?: string | { _id: string; title: string; domain?: string; currentStage?: string };
  documentCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFolderInput {
  name: string;
  description?: string;
  color?: string;
  category?: 'literature' | 'datasets' | 'manuscripts' | 'notes' | 'general';
  projectId?: string;
  isFavorite?: boolean;
}

export interface UpdateFolderInput {
  name?: string;
  description?: string;
  color?: string;
  category?: 'literature' | 'datasets' | 'manuscripts' | 'notes' | 'general';
  projectId?: string;
  isFavorite?: boolean;
}

export interface ResearchDocument {
  id: string;
  _id?: string;
  ownerId: string;
  title: string;
  originalFileName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  fileUrl: string;
  storagePath?: string;
  docType: ResearchDocType;
  description?: string;
  tags: string[];
  isStarred?: boolean;
  folderId?: string | { _id: string; name: string; color?: string; category?: string };
  projectId?: string | { _id: string; title: string; domain?: string; currentStage?: string };
  paperId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadDocumentInput {
  title?: string;
  docType?: ResearchDocType;
  folderId?: string;
  projectId?: string;
  description?: string;
  tags?: string[] | string;
}

export interface UpdateDocumentInput {
  title?: string;
  docType?: ResearchDocType;
  folderId?: string | null;
  projectId?: string | null;
  description?: string;
  tags?: string[];
  isStarred?: boolean;
}



