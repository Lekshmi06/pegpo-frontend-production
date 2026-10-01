import {
  ResearchData,
  ResearchPaper,
  ResearchProjectSummary,
  ResearchProjectDetail,
  ResearchNoteItem,
  ResearchNoteType,
  HypothesisStatus,
  AcademicSearchResponse,
  AcademicSearchResultItem,
  ResearchAIResponse,
  PaperComparisonMatrix,
  Manuscript,
  ManuscriptSection,
  ManuscriptAiAssistRequest,
  ManuscriptAiAssistResponse,
  CollaborationRole,
  ProjectTeamMember,
  CollaborationInvite,
  ManuscriptComment,
  ResearchTask,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterOptions,
  TaskStatus,
  TaskSummaryCounts,
  ResearchCalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarQueryOptions,
  CombinedProjectCalendarResponse,
  ResearchFolder,
  CreateFolderInput,
  UpdateFolderInput,
  ResearchDocument,
  UploadDocumentInput,
  UpdateDocumentInput,
  ResearchDocType,
} from '../types/research';

import { researchData } from '../data/mockData';
import { API_BASE_URL, apiRequest } from './apiClient';
import { researcherProfileService } from './researcherProfileService';

export interface LiteratureSearchResult {
  query: string;
  papers: ResearchPaper[];
  synthesisSummary: string;
  detectedGaps: string[];
  recommendedMethodologies: string[];
}

export const researchService = {
  /**
   * Get overall overview dashboard metrics from live MongoDB
   */
  getResearchData: async (): Promise<ResearchData> => {
    try {
      const profileId = researcherProfileService.getProfileId();
      const headers: Record<string, string> = {};
      if (profileId) headers['x-researcher-id'] = profileId;

      const [papersRes, projectsRes, notesRes] = await Promise.all([
        apiRequest<{ success: boolean; data: any[] }>('/research/papers', { headers }).catch(() => null),
        apiRequest<{ success: boolean; data: any[] }>('/research/projects', { headers }).catch(() => null),
        apiRequest<{ success: boolean; data: any[] }>('/research/notes?limit=10', { headers }).catch(() => null),
      ]);

      const backendPapers: ResearchPaper[] =
        papersRes?.success && Array.isArray(papersRes.data)
          ? papersRes.data.map((p) => ({
              id: p._id || p.id,
              _id: p._id,
              title: p.title,
              authors: p.authors || [],
              year: p.year || new Date().getFullYear(),
              venue: p.venue || 'Academic Journal',
              doi: p.doi,
              abstract: p.abstract || '',
              methodology: p.methodology || '',
              dataset: p.datasets?.[0] || '',
              datasets: p.datasets || [],
              keyFindings: p.findings || '',
              limitations: p.limitations || '',
              tags: p.tags || [],
              isBookmarked: p.isStarred,
              isStarred: p.isStarred,
              pdfUrl: p.pdfUrl,
              sourceProvider: p.sourceProvider,
              savedAt: p.savedAt,
              projectIds: p.projectIds,
            }))
          : researchData.recentPapers;

      const backendProjects: ResearchProjectSummary[] =
        projectsRes?.success && Array.isArray(projectsRes.data)
          ? projectsRes.data.map((p) => ({
              id: p._id || p.id,
              _id: p._id,
              title: p.title,
              description: p.description || '',
              domain: p.domain || 'Computer Science',
              currentStage: p.currentStage || 'Literature review',
              status: p.status || 'Active',
              problemStatement: p.researchQuestion,
              researchQuestion: p.researchQuestion,
              researchQuestions: p.researchQuestion ? [p.researchQuestion] : [],
              objectives: Array.isArray(p.objectives) ? p.objectives : [],
              paperCount: Array.isArray(p.paperIds) ? p.paperIds.length : 0,
              notesCount: Array.isArray(p.noteIds) ? p.noteIds.length : 0,
              gapsCount: 0,
              lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recently',
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            }))
          : researchData.activeProjects;

      const backendNotes: ResearchNoteItem[] =
        notesRes?.success && Array.isArray(notesRes.data)
          ? notesRes.data.map((note) => ({
              id: note._id || note.id,
              _id: note._id,
              title: note.title,
              content: note.content,
              projectId: note.projectId?._id || note.projectId,
              projectTitle: note.projectId?.title || undefined,
              paperId: note.paperId?._id || note.paperId,
              paperTitle: note.paperId?.title || undefined,
              noteType: note.noteType || 'general',
              type: note.noteType || 'general',
              tags: note.tags || [],
              excerpt: note.excerpt,
              isPinned: note.isPinned,
              date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent',
              createdAt: note.createdAt,
              updatedAt: note.updatedAt,
            }))
          : researchData.recentNotes;

      return {
        ...researchData,
        recentPapers: backendPapers,
        activeProjects: backendProjects,
        recentNotes: backendNotes,
      };
    } catch {
      // Fallback
      return { ...researchData };
    }
  },


  /**
   * Search academic literature via live provider (Crossref with demo fallback)
   */
  searchAcademicLiterature: async (
    query: string,
    filters?: { year?: number; fromYear?: number; venue?: string; author?: string; limit?: number }
  ): Promise<AcademicSearchResponse> => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters?.year) params.append('year', String(filters.year));
      if (filters?.fromYear) params.append('fromYear', String(filters.fromYear));
      if (filters?.venue) params.append('venue', filters.venue);
      if (filters?.author) params.append('author', filters.author);
      if (filters?.limit) params.append('limit', String(filters.limit));

      const res = await apiRequest<{ success: boolean; data: AcademicSearchResponse }>(
        `/research/discover?${params.toString()}`
      );

      if (res?.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend academic search failed, using local academic search fallback:', err);
    }

    // Local client-side fallback
    const lower = (query || '').toLowerCase();
    const matched = researchData.recentPapers.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.abstract.toLowerCase().includes(lower) ||
        p.tags.some((t) => t.toLowerCase().includes(lower))
    );

    const papers: AcademicSearchResultItem[] = (matched.length > 0 ? matched : researchData.recentPapers).map(
      (p) => ({
        id: p.id,
        title: p.title,
        authors: p.authors,
        year: p.year,
        venue: p.venue,
        abstract: p.abstract,
        doi: p.doi,
        sourceProvider: 'demo',
        isDemo: true,
        citationCount: p.citationCount || 200,
        relevanceScore: 0.95,
        methodology: p.methodology,
        datasets: p.dataset ? [p.dataset] : [],
        tags: p.tags,
      })
    );

    return {
      query,
      total: papers.length,
      papers,
      provider: 'Demo Fallback (Offline Index)',
      isDemo: true,
    };
  },

  /**
   * Save a paper to the researcher's personal library
   */
  savePaperToLibrary: async (paper: Partial<ResearchPaper>): Promise<ResearchPaper> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    try {
      const res = await apiRequest<{ success: boolean; data: any }>('/research/papers/save', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          year: paper.year,
          venue: paper.venue,
          doi: paper.doi,
          arxivId: paper.arxivId,
          externalUrl: paper.externalUrl,
          sourceProvider: paper.sourceProvider || 'crossref',
          methodology: paper.methodology,
          datasets: paper.datasets || (paper.dataset ? [paper.dataset] : []),
          findings: paper.keyFindings || paper.findings,
          limitations: paper.limitations,
          tags: paper.tags || [],
        }),
      });

      if (res?.success && res.data) {
        const p = res.data;
        return {
          id: p._id || p.id,
          _id: p._id,
          title: p.title,
          authors: p.authors || [],
          year: p.year || new Date().getFullYear(),
          venue: p.venue || 'Academic Journal',
          doi: p.doi,
          abstract: p.abstract || '',
          methodology: p.methodology || '',
          dataset: p.datasets?.[0] || '',
          datasets: p.datasets || [],
          keyFindings: p.findings || '',
          limitations: p.limitations || '',
          tags: p.tags || [],
          isBookmarked: p.isStarred,
          isStarred: p.isStarred,
          sourceProvider: p.sourceProvider,
          savedAt: p.savedAt,
        };
      }
    } catch (err) {
      console.warn('Backend paper save failed, saving to local state:', err);
    }

    // Local fallback
    const newPaper: ResearchPaper = {
      id: `local-paper-${Date.now()}`,
      title: paper.title || 'Untitled Research Paper',
      authors: paper.authors || ['Research Author'],
      year: paper.year || new Date().getFullYear(),
      venue: paper.venue || 'Saved Literature',
      doi: paper.doi,
      abstract: paper.abstract || '',
      methodology: paper.methodology || '',
      dataset: paper.dataset || '',
      keyFindings: paper.keyFindings || '',
      limitations: paper.limitations || '',
      tags: paper.tags || ['Saved'],
      isBookmarked: true,
      isStarred: true,
      savedAt: new Date().toISOString(),
    };
    researchData.recentPapers.unshift(newPaper);
    return newPaper;
  },

  /**
   * Fetch all papers in library with optional filters
   */
  getLibraryPapers: async (filters?: {
    isStarred?: boolean;
    projectId?: string;
    search?: string;
  }): Promise<ResearchPaper[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    try {
      const params = new URLSearchParams();
      if (filters?.isStarred !== undefined) params.append('isStarred', String(filters.isStarred));
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.search) params.append('search', filters.search);

      const endpoint = `/research/papers${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await apiRequest<{ success: boolean; data: any[] }>(endpoint, { headers });

      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((p) => ({
          id: p._id || p.id,
          _id: p._id,
          title: p.title,
          authors: p.authors || [],
          year: p.year || new Date().getFullYear(),
          venue: p.venue || 'Academic Journal',
          doi: p.doi,
          abstract: p.abstract || '',
          methodology: p.methodology || '',
          dataset: p.datasets?.[0] || '',
          datasets: p.datasets || [],
          keyFindings: p.findings || '',
          limitations: p.limitations || '',
          tags: p.tags || [],
          isBookmarked: p.isStarred,
          isStarred: p.isStarred,
          pdfUrl: p.pdfUrl,
          extractedText: p.extractedText,
          sourceProvider: p.sourceProvider,
          savedAt: p.savedAt,
          projectIds: p.projectIds,
        }));
      }
    } catch (err) {
      console.warn('Backend library fetch failed, using local mock data:', err);
    }

    // Local fallback
    let list = [...researchData.recentPapers];
    if (filters?.isStarred) {
      list = list.filter((p) => p.isBookmarked || p.isStarred);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.abstract.toLowerCase().includes(s) ||
          p.venue.toLowerCase().includes(s)
      );
    }
    return list;
  },

  /**
   * Get single paper by ID
   */
  getPaperById: async (paperId: string): Promise<ResearchPaper | null> => {
    try {
      const res = await apiRequest<{ success: boolean; data: any }>(`/research/papers/${paperId}`);
      if (res?.success && res.data) {
        const p = res.data;
        return {
          id: p._id || p.id,
          _id: p._id,
          title: p.title,
          authors: p.authors || [],
          year: p.year || new Date().getFullYear(),
          venue: p.venue || 'Academic Journal',
          doi: p.doi,
          abstract: p.abstract || '',
          methodology: p.methodology || '',
          dataset: p.datasets?.[0] || '',
          datasets: p.datasets || [],
          keyFindings: p.findings || '',
          limitations: p.limitations || '',
          tags: p.tags || [],
          isBookmarked: p.isStarred,
          isStarred: p.isStarred,
          pdfUrl: p.pdfUrl,
          extractedText: p.extractedText,
          sourceProvider: p.sourceProvider,
          savedAt: p.savedAt,
          projectIds: p.projectIds,
        };
      }
    } catch {
      // Local fallback
    }

    const found = researchData.recentPapers.find((p) => p.id === paperId || p._id === paperId);
    return found || null;
  },

  /**
   * Toggle star/bookmark on a paper
   */
  toggleStarPaper: async (paperId: string): Promise<boolean> => {
    try {
      const res = await apiRequest<{ success: boolean; data: any }>(`/research/papers/${paperId}/star`, {
        method: 'PATCH',
      });
      if (res?.success && res.data) {
        return Boolean(res.data.isStarred);
      }
    } catch (err) {
      console.warn('Backend toggle star failed, toggling locally:', err);
    }

    const paper = researchData.recentPapers.find((p) => p.id === paperId || p._id === paperId);
    if (paper) {
      paper.isBookmarked = !paper.isBookmarked;
      paper.isStarred = paper.isBookmarked;
      return paper.isBookmarked;
    }
    return false;
  },

  /**
   * Upload a local PDF and extract its text
   */
  uploadPaperPdf: async (
    file: File,
    metadata?: { title?: string; venue?: string }
  ): Promise<ResearchPaper> => {
    const profileId = researcherProfileService.getProfileId();
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.venue) formData.append('venue', metadata.venue);

    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await fetch(`${API_BASE_URL}/research/papers/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to upload research paper');
    }

    const p = json.data;
    const paper: ResearchPaper = {
      id: p._id || p.id,
      _id: p._id,
      title: p.title,
      authors: p.authors || [],
      year: p.year || new Date().getFullYear(),
      venue: p.venue || 'Uploaded PDF',
      abstract: p.abstract || '',
      methodology: p.methodology || '',
      dataset: p.datasets?.[0] || '',
      datasets: p.datasets || [],
      keyFindings: p.findings || '',
      limitations: p.limitations || '',
      tags: p.tags || ['Uploaded PDF'],
      isBookmarked: false,
      isStarred: false,
      pdfUrl: p.pdfUrl,
      extractedText: p.extractedText,
      sourceProvider: 'upload',
      savedAt: p.savedAt,
    };

    researchData.recentPapers.unshift(paper);
    return paper;
  },

  /**
   * Attach paper to a research project
   */
  addPaperToProject: async (paperId: string, projectId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/papers/${paperId}/project`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectId }),
      }
    );
    if (!res.success) {
      throw new Error(res.message || 'Failed to attach paper to project');
    }
    return true;
  },

  /**
   * Remove paper from a research project
   */
  removePaperFromProject: async (projectId: string, paperId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/projects/${projectId}/papers/${paperId}`,
      {
        method: 'DELETE',
        headers,
      }
    );
    if (!res.success) {
      throw new Error(res.message || 'Failed to remove paper from project');
    }
    return true;
  },

  /**
   * List research projects from MongoDB (strictly no mock data fallback)
   */
  listProjects: async (): Promise<ResearchProjectSummary[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any[] }>('/research/projects', { headers });
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((p) => {
        const paperCount = Array.isArray(p.paperIds) ? p.paperIds.length : 0;
        let lastUpdated = 'Recently';
        if (p.updatedAt) {
          try {
            const date = new Date(p.updatedAt);
            lastUpdated = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          } catch {
            lastUpdated = 'Recently';
          }
        }
        return {
          id: p._id || p.id,
          _id: p._id,
          title: p.title,
          description: p.description || '',
          domain: p.domain || 'Computer Science',
          currentStage: p.currentStage || 'Literature review',
          status: p.status || p.currentStage || 'Active',
          problemStatement: p.researchQuestion,
          researchQuestion: p.researchQuestion,
          researchQuestions: p.researchQuestion ? [p.researchQuestion] : [],
          objectives: Array.isArray(p.objectives) ? p.objectives : [],
          ownerId: p.ownerId
            ? (typeof p.ownerId === 'object' ? String(p.ownerId._id || p.ownerId.id || p.ownerId) : String(p.ownerId))
            : undefined,
          collaborators: Array.isArray(p.collaborators) ? p.collaborators : [],
          paperCount,
          notesCount: 0,
          gapsCount: 0,
          lastUpdated,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      });
    }

    return [];
  },

  /**
   * Get single research project by ID with populated literature
   */
  getProjectById: async (projectId: string): Promise<ResearchProjectDetail> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any }>(`/research/projects/${projectId}`, {
      headers,
    });

    if (!res || !res.success || !res.data) {
      throw new Error('Project not found or unauthorized');
    }

    const p = res.data;
    const mappedPapers: ResearchPaper[] = (p.paperIds || []).map((paper: any) => ({
      id: paper._id || paper.id,
      _id: paper._id,
      title: paper.title,
      authors: paper.authors || [],
      year: paper.year || new Date().getFullYear(),
      venue: paper.venue || 'Academic Venue',
      doi: paper.doi,
      abstract: paper.abstract || '',
      methodology: paper.methodology || '',
      dataset: paper.datasets?.[0] || '',
      datasets: paper.datasets || [],
      keyFindings: paper.findings || '',
      limitations: paper.limitations || '',
      tags: paper.tags || [],
      isBookmarked: paper.isStarred,
      isStarred: paper.isStarred,
      pdfUrl: paper.pdfUrl,
      extractedText: paper.extractedText,
      sourceProvider: paper.sourceProvider,
      savedAt: paper.savedAt,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
    }));

    const mappedNotes: ResearchNoteItem[] = (p.noteIds || []).map((note: any) => ({
      id: note._id || note.id,
      _id: note._id,
      title: note.title,
      content: note.content,
      projectId: p._id || p.id,
      paperId: note.paperId?._id || note.paperId,
      paperTitle: note.paperId?.title || undefined,
      noteType: note.noteType || 'general',
      type: note.noteType || 'general',
      tags: note.tags || [],
      excerpt: note.excerpt,
      isPinned: note.isPinned,
      date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent',
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return {
      id: p._id || p.id,
      _id: p._id,
      title: p.title,
      description: p.description || '',
      domain: p.domain || 'Computer Science',
      researchQuestion: p.researchQuestion || '',
      objectives: Array.isArray(p.objectives) ? p.objectives : [],
      status: p.status || p.currentStage || 'Active',
      currentStage: p.currentStage || 'Literature review',
      paperIds: mappedPapers,
      noteIds: mappedNotes,
      tags: p.tags || [],
      ownerId: p.ownerId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  },


  /**
   * Create a new research project in MongoDB
   */
  createProject: async (projectData: {
    title: string;
    description?: string;
    domain?: string;
    researchQuestion?: string;
    objectives?: string[];
    status?: string;
  }): Promise<ResearchProjectSummary> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>('/research/projects', {
      method: 'POST',
      headers,
      body: JSON.stringify(projectData),
    });

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to create research project');
    }

    const p = res.data;
    return {
      id: p._id || p.id,
      _id: p._id,
      title: p.title,
      description: p.description || '',
      domain: p.domain || 'Computer Science',
      currentStage: p.currentStage || 'Literature review',
      status: p.status || 'Active',
      problemStatement: p.researchQuestion,
      researchQuestion: p.researchQuestion,
      researchQuestions: p.researchQuestion ? [p.researchQuestion] : [],
      objectives: Array.isArray(p.objectives) ? p.objectives : [],
      paperCount: Array.isArray(p.paperIds) ? p.paperIds.length : 0,
      notesCount: 0,
      gapsCount: 0,
      lastUpdated: 'Just now',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  },

  /**
   * Get all research notes for a project
   */
  getProjectNotes: async (projectId: string): Promise<ResearchNoteItem[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any[] }>(
      `/research/projects/${projectId}/notes`,
      { headers }
    );

    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((note) => ({
        id: note._id || note.id,
        _id: note._id,
        title: note.title,
        content: note.content,
        projectId: note.projectId,
        paperId: note.paperId?._id || note.paperId,
        paperTitle: note.paperId?.title || undefined,
        noteType: note.noteType || 'general',
        type: note.noteType || 'general',
        tags: note.tags || [],
        excerpt: note.excerpt,
        isPinned: note.isPinned,
        date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent',
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }));
    }
    return [];
  },

  /**
   * Create a new research note attached to a project
   */
  createProjectNote: async (
    projectId: string,
    noteData: {
      title?: string;
      content: string;
      noteType?: ResearchNoteType;
      hypothesisStatus?: HypothesisStatus;
      aiGenerated?: boolean;
      aiAssisted?: boolean;
      sourceText?: string;
      paperId?: string;
      paperIds?: string[];
      tags?: string[];
      excerpt?: string;
      isPinned?: boolean;
    }
  ): Promise<ResearchNoteItem> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/projects/${projectId}/notes`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(noteData),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to create research note');
    }

    const note = res.data;
    return {
      id: note._id || note.id,
      _id: note._id,
      title: note.title,
      content: note.content,
      projectId: note.projectId,
      paperId: note.paperId?._id || note.paperId,
      paperIds: note.paperIds || [],
      paperTitle: note.paperId?.title || undefined,
      noteType: note.noteType || 'general',
      type: note.noteType || 'general',
      hypothesisStatus: note.hypothesisStatus,
      aiGenerated: note.aiGenerated,
      aiAssisted: note.aiAssisted,
      sourceText: note.sourceText,
      tags: note.tags || [],
      excerpt: note.excerpt,
      isPinned: note.isPinned,
      date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Just now',
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  },

  /**
   * Update an existing research note
   */
  updateProjectNote: async (
    noteId: string,
    updates: Partial<{
      title: string;
      content: string;
      noteType: ResearchNoteType;
      hypothesisStatus: HypothesisStatus;
      aiAssisted: boolean;
      sourceText: string;
      paperId?: string;
      paperIds?: string[];
      tags: string[];
      excerpt: string;
      isPinned: boolean;
    }>
  ): Promise<ResearchNoteItem> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/notes/${noteId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to update research note');
    }

    const note = res.data;
    return {
      id: note._id || note.id,
      _id: note._id,
      title: note.title,
      content: note.content,
      projectId: note.projectId,
      paperId: note.paperId?._id || note.paperId,
      paperIds: note.paperIds || [],
      paperTitle: note.paperId?.title || undefined,
      noteType: note.noteType || 'general',
      type: note.noteType || 'general',
      hypothesisStatus: note.hypothesisStatus,
      aiGenerated: note.aiGenerated,
      aiAssisted: note.aiAssisted,
      sourceText: note.sourceText,
      tags: note.tags || [],
      excerpt: note.excerpt,
      isPinned: note.isPinned,
      date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent',
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  },

  /**
   * Get all research notes across projects for the authenticated researcher
   */
  getAllResearcherNotes: async (filters?: {
    projectId?: string;
    noteType?: string;
    search?: string;
  }): Promise<ResearchNoteItem[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const queryParams = new URLSearchParams();
    if (filters?.projectId) queryParams.set('projectId', filters.projectId);
    if (filters?.noteType && filters.noteType !== 'all') queryParams.set('noteType', filters.noteType);
    if (filters?.search) queryParams.set('search', filters.search);

    const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const res = await apiRequest<{ success: boolean; data: any[]; message?: string }>(
      `/research/notes${qs}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!res || !res.success || !Array.isArray(res.data)) {
      return [];
    }

    return res.data.map((note) => ({
      id: note._id || note.id,
      _id: note._id,
      title: note.title,
      content: note.content,
      projectId: note.projectId,
      projectTitle: note.projectId?.title || undefined,
      paperId: note.paperId?._id || note.paperId,
      paperIds: note.paperIds || [],
      paperTitle: note.paperId?.title || undefined,
      noteType: note.noteType || 'general',
      type: note.noteType || 'general',
      hypothesisStatus: note.hypothesisStatus,
      aiGenerated: note.aiGenerated,
      aiAssisted: note.aiAssisted,
      sourceText: note.sourceText,
      tags: note.tags || [],
      excerpt: note.excerpt,
      isPinned: note.isPinned,
      date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent',
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  },

  /**
   * Delete a research note
   */
  deleteProjectNote: async (noteId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/notes/${noteId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!res?.success) {
      throw new Error(res?.message || 'Failed to delete research note');
    }
    return true;
  },

  /**
   * Contextual Research AI Query
   */

  queryResearchAI: async (params: {
    query: string;
    contextType: 'researcher' | 'paper' | 'project' | 'selected_text' | 'library';
    paperIds?: string[];
    projectId?: string;
    selectedText?: string;
  }): Promise<ResearchAIResponse> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: ResearchAIResponse; message?: string }>(
      '/research/ai/query',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...params,
          researcherId: profileId || undefined,
        }),
      }
    );

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Research AI query execution failed');
  },

  /**
   * Get all research notes for the researcher across projects
   */
  getAllNotes: async (limit: number = 20): Promise<ResearchNoteItem[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    try {
      const res = await apiRequest<{ success: boolean; data: any[] }>(
        `/research/notes?limit=${limit}`,
        { headers }
      );

      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((note) => ({
          id: note._id || note.id,
          _id: note._id,
          title: note.title,
          content: note.content,
          projectId: note.projectId?._id || note.projectId,
          projectTitle: note.projectId?.title || undefined,
          paperId: note.paperId?._id || note.paperId,
          paperTitle: note.paperId?.title || undefined,
          noteType: note.noteType || 'general',
          type: note.noteType || 'general',
          tags: note.tags || [],
          excerpt: note.excerpt,
          isPinned: note.isPinned,
          date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent',
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }));
      }
    } catch (err) {
      console.warn('Backend getAllNotes failed, returning empty:', err);
    }
    return [];
  },

  /**
   * Multi-paper comparative literature analysis matrix & synthesis
   */
  comparePapers: async (paperIds?: string[], projectId?: string): Promise<PaperComparisonMatrix> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    try {
      const res = await apiRequest<{ success: boolean; data: any }>('/research/papers/compare', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paperIds: paperIds && paperIds.length > 0 ? paperIds : undefined,
          projectId: projectId || undefined,
        }),
      });

      if (res?.success && res.data) {
        const d = res.data;
        const mappedPapers: ResearchPaper[] = (d.papers || []).map((p: any) => ({
          id: p._id || p.id,
          _id: p._id,
          title: p.title,
          authors: p.authors || [],
          year: p.year || new Date().getFullYear(),
          venue: p.venue || 'Academic Venue',
          doi: p.doi,
          abstract: p.abstract || '',
          methodology: p.methodology || '',
          dataset: p.datasets?.[0] || '',
          datasets: p.datasets || [],
          keyFindings: p.findings || '',
          limitations: p.limitations || '',
          tags: p.tags || [],
          isBookmarked: p.isStarred,
          isStarred: p.isStarred,
          pdfUrl: p.pdfUrl,
          extractedText: p.extractedText,
          sourceProvider: p.sourceProvider,
          savedAt: p.savedAt,
        }));

        return {
          paperIds: mappedPapers.map((p) => p.id),
          papers: mappedPapers,
          dimensions: d.dimensions || [],
          tradeoffs: d.tradeoffs || [],
          aiTakeaway: d.aiTakeaway || '',
        };
      }
    } catch (err) {
      console.warn('Backend comparePapers failed, using local comparison fallback:', err);
    }

    const selected = researchData.recentPapers.filter(
      (p) => (paperIds || []).includes(p.id) || (paperIds || []).includes(p._id || '')
    );
    const targetPapers = selected.length > 0 ? selected : researchData.recentPapers.slice(0, 3);

    const valuesFor = (getter: (p: ResearchPaper) => string) => {
      const res: Record<string, string> = {};
      targetPapers.forEach((p) => {
        res[p.id] = getter(p);
      });
      return res;
    };

    return {
      paperIds: targetPapers.map((p) => p.id),
      papers: targetPapers,
      dimensions: [
        {
          name: 'Core Methodology & Architecture',
          description: 'Model architecture and algorithmic approach',
          values: valuesFor((p) => p.methodology || 'Deep learning neural network backbone'),
        },
        {
          name: 'Primary Benchmark Datasets',
          description: 'Evaluation cohorts, modalities, and experimental scale',
          values: valuesFor((p) => p.dataset || 'Standard evaluation benchmarks'),
        },
        {
          name: 'Key Empirical Findings',
          description: 'Headline results and quantitative improvements',
          values: valuesFor((p) => p.keyFindings || p.findings || 'Validated performance on benchmarks'),
        },
        {
          name: 'Documented Limitations',
          description: 'Identified experimental or computational bottlenecks',
          values: valuesFor((p) => p.limitations || 'Computational complexity scales with input dimensions'),
        },
      ],
      tradeoffs: [
        {
          dimension: 'Model Capacity vs Inference Latency',
          comparison: 'Dense attention mechanisms achieve superior boundary precision at the expense of high quadratic memory footprint.',
        },
      ],
      aiTakeaway: `Comparative synthesis of ${targetPapers.length} architectures indicates a clear trend toward hierarchical self-attention backbones to mitigate boundary degradation on volumetric modalities.`,
    };
  },


  addGoal: async (title: string): Promise<{ id: number; title: string; date: string }> => {
    const newGoal = {
      id: Date.now(),
      title,
      date: 'Just now',
    };
    researchData.recentGoals.unshift(newGoal);
    return newGoal;
  },

  searchLiterature: async (query: string): Promise<LiteratureSearchResult> => {
    const searchRes = await researchService.searchAcademicLiterature(query);
    const papers: ResearchPaper[] = searchRes.papers.map((p) => ({
      id: p.id || p.doi || `paper-${Date.now()}`,
      title: p.title,
      authors: p.authors,
      year: p.year || new Date().getFullYear(),
      venue: p.venue || 'Academic Literature',
      doi: p.doi,
      abstract: p.abstract,
      methodology: p.methodology || 'Deep neural network architecture',
      dataset: p.datasets?.[0] || 'Benchmark Dataset',
      datasets: p.datasets,
      keyFindings: 'Reported benchmark improvements across standard metric gates.',
      limitations: 'Computational complexity scales with input dimensions.',
      tags: p.tags || ['Literature'],
      citationCount: p.citationCount,
      externalUrl: p.externalUrl,
      sourceProvider: p.sourceProvider,
      isDemo: p.isDemo,
    }));

    return {
      query,
      papers,
      synthesisSummary: `Synthesized ${papers.length} peer-reviewed studies for "${query}". The literature indicates a strong consensus around hybrid convolutional-attention models for spatial boundary resolution.`,
      detectedGaps: [
        'Boundary preservation on lesions smaller than 15mm remains deficient across pure Swin architectures.',
        'High quadratic complexity during volumetric multi-slice processing restricts clinical real-time deployment.',
      ],
      recommendedMethodologies: [
        'Shifted Windows Hierarchical Attention (Swin-UNETR)',
        'Self-Configuring Decathlon Ensembles (nnU-Net)',
        'Hybrid Deformable Attention Tokens (TransUNet)',
      ],
    };
  },

  toggleBookmarkPaper: async (paperId: string): Promise<boolean> => {
    return researchService.toggleStarPaper(paperId);
  },

  /**
   * List manuscripts for the current researcher, optionally filtered by project
   */
  listManuscripts: async (projectId?: string): Promise<Manuscript[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const endpoint = projectId
      ? `/research/manuscripts?projectId=${encodeURIComponent(projectId)}`
      : '/research/manuscripts';

    const res = await apiRequest<{ success: boolean; data: any[] }>(endpoint, { headers });
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((m) => ({
        id: m._id || m.id,
        _id: m._id,
        ownerId: m.ownerId,
        projectId: m.projectId,
        title: m.title,
        description: m.description,
        status: m.status || 'draft',
        citationStyle: m.citationStyle || 'APA',
        sectionIds: m.sectionIds,
        sections: (m.sections || []).map((s: any) => ({
          id: s._id || s.id,
          _id: s._id,
          manuscriptId: s.manuscriptId || m._id || m.id,
          title: s.title,
          sectionType: s.sectionType || 'custom',
          order: s.order || 0,
          content: s.content || '',
          aiAssisted: Boolean(s.aiAssisted),
        })),
        totalSections: m.totalSections || (m.sections ? m.sections.length : 0),
        completedSections: m.completedSections || 0,
        progress: m.progress || 0,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }));
    }
    return [];
  },

  /**
   * Get single manuscript by ID with populated sections
   */
  getManuscriptById: async (manuscriptId: string): Promise<Manuscript> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any }>(
      `/research/manuscripts/${manuscriptId}`,
      { headers }
    );

    if (!res?.success || !res.data) {
      throw new Error('Manuscript not found or unauthorized');
    }

    const m = res.data;
    return {
      id: m._id || m.id,
      _id: m._id,
      ownerId: m.ownerId,
      projectId: m.projectId,
      title: m.title,
      description: m.description,
      status: m.status || 'draft',
      citationStyle: m.citationStyle || 'APA',
      sectionIds: m.sectionIds,
      sections: (m.sections || []).map((s: any) => ({
        id: s._id || s.id,
        _id: s._id,
        manuscriptId: s.manuscriptId || m._id || m.id,
        title: s.title,
        sectionType: s.sectionType || 'custom',
        order: s.order || 0,
        content: s.content || '',
        evidencePaperIds: (s.evidencePaperIds || []).map((p: any) =>
          typeof p === 'object' && p !== null ? { ...p, id: p._id || p.id } : p
        ),
        evidenceNoteIds: (s.evidenceNoteIds || []).map((n: any) =>
          typeof n === 'object' && n !== null ? { ...n, id: n._id || n.id } : n
        ),
        aiAssisted: Boolean(s.aiAssisted),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      totalSections: m.totalSections || (m.sections ? m.sections.length : 0),
      completedSections: m.completedSections || 0,
      progress: m.progress || 0,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  },

  /**
   * Create a new research manuscript under a project
   */
  createManuscript: async (data: {
    projectId: string;
    title: string;
    description?: string;
    citationStyle?: string;
    status?: string;
    customSections?: Array<{ title: string; sectionType?: string }>;
  }): Promise<Manuscript> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      '/research/manuscripts',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to create manuscript');
    }

    const m = res.data;
    return {
      id: m._id || m.id,
      _id: m._id,
      ownerId: m.ownerId,
      projectId: m.projectId,
      title: m.title,
      description: m.description,
      status: m.status || 'draft',
      citationStyle: m.citationStyle || 'APA',
      sectionIds: m.sectionIds,
      sections: (m.sections || []).map((s: any) => ({
        id: s._id || s.id,
        _id: s._id,
        manuscriptId: s.manuscriptId || m._id || m.id,
        title: s.title,
        sectionType: s.sectionType || 'custom',
        order: s.order || 0,
        content: s.content || '',
        evidencePaperIds: s.evidencePaperIds || [],
        evidenceNoteIds: s.evidenceNoteIds || [],
        aiAssisted: Boolean(s.aiAssisted),
      })),
      totalSections: m.sections ? m.sections.length : 9,
      completedSections: 0,
      progress: 0,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  },

  /**
   * Update manuscript metadata
   */
  updateManuscript: async (
    manuscriptId: string,
    updates: Partial<{
      title: string;
      description: string;
      status: string;
      citationStyle: string;
    }>
  ): Promise<any> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/manuscripts/${manuscriptId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      }
    );

    if (!res?.success) {
      throw new Error(res?.message || 'Failed to update manuscript');
    }
    return res.data;
  },

  /**
   * Delete manuscript and all sections
   */
  deleteManuscript: async (manuscriptId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/manuscripts/${manuscriptId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!res?.success) {
      throw new Error(res?.message || 'Failed to delete manuscript');
    }
    return true;
  },

  /**
   * Get sections for a manuscript
   */
  getManuscriptSections: async (manuscriptId: string): Promise<ManuscriptSection[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any[] }>(
      `/research/manuscripts/${manuscriptId}/sections`,
      { headers }
    );

    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((s) => ({
        id: s._id || s.id,
        _id: s._id,
        manuscriptId: s.manuscriptId,
        title: s.title,
        sectionType: s.sectionType || 'custom',
        order: s.order || 0,
        content: s.content || '',
        evidencePaperIds: (s.evidencePaperIds || []).map((p: any) =>
          typeof p === 'object' && p !== null ? { ...p, id: p._id || p.id } : p
        ),
        evidenceNoteIds: (s.evidenceNoteIds || []).map((n: any) =>
          typeof n === 'object' && n !== null ? { ...n, id: n._id || n.id } : n
        ),
        aiAssisted: Boolean(s.aiAssisted),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    }
    return [];
  },

  /**
   * Create a new manuscript section
   */
  createManuscriptSection: async (
    manuscriptId: string,
    data: {
      title: string;
      sectionType?: string;
      content?: string;
      order?: number;
      evidencePaperIds?: string[];
      evidenceNoteIds?: string[];
    }
  ): Promise<ManuscriptSection> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/manuscripts/${manuscriptId}/sections`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to add section to manuscript');
    }

    const s = res.data;
    return {
      id: s._id || s.id,
      _id: s._id,
      manuscriptId: s.manuscriptId,
      title: s.title,
      sectionType: s.sectionType || 'custom',
      order: s.order || 0,
      content: s.content || '',
      evidencePaperIds: s.evidencePaperIds || [],
      evidenceNoteIds: s.evidenceNoteIds || [],
      aiAssisted: Boolean(s.aiAssisted),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },

  /**
   * Update section content, title, evidence, or order
   */
  updateManuscriptSection: async (
    sectionId: string,
    updates: Partial<{
      title: string;
      sectionType: string;
      content: string;
      order: number;
      evidencePaperIds: string[];
      evidenceNoteIds: string[];
      aiAssisted: boolean;
    }>
  ): Promise<ManuscriptSection> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/manuscript-sections/${sectionId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to update section');
    }

    const s = res.data;
    return {
      id: s._id || s.id,
      _id: s._id,
      manuscriptId: s.manuscriptId,
      title: s.title,
      sectionType: s.sectionType || 'custom',
      order: s.order || 0,
      content: s.content || '',
      evidencePaperIds: (s.evidencePaperIds || []).map((p: any) =>
        typeof p === 'object' && p !== null ? { ...p, id: p._id || p.id } : p
      ),
      evidenceNoteIds: (s.evidenceNoteIds || []).map((n: any) =>
        typeof n === 'object' && n !== null ? { ...n, id: n._id || n.id } : n
      ),
      aiAssisted: Boolean(s.aiAssisted),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },

  /**
   * Delete a section from manuscript
   */
  deleteManuscriptSection: async (sectionId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/manuscript-sections/${sectionId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!res?.success) {
      throw new Error(res?.message || 'Failed to delete section');
    }
    return true;
  },

  /**
   * Reorder manuscript sections
   */
  reorderManuscriptSections: async (
    manuscriptId: string,
    sectionOrders: Array<{ sectionId: string; order: number }>
  ): Promise<ManuscriptSection[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any[]; message?: string }>(
      `/research/manuscripts/${manuscriptId}/sections/reorder`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ sectionOrders }),
      }
    );

    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((s) => ({
        id: s._id || s.id,
        _id: s._id,
        manuscriptId: s.manuscriptId,
        title: s.title,
        sectionType: s.sectionType || 'custom',
        order: s.order || 0,
        content: s.content || '',
        evidencePaperIds: s.evidencePaperIds || [],
        evidenceNoteIds: s.evidenceNoteIds || [],
        aiAssisted: Boolean(s.aiAssisted),
      }));
    }
    return [];
  },

  /**
   * Request AI Writing Assistance for a section
   */
  manuscriptAiAssist: async (
    manuscriptId: string,
    data: ManuscriptAiAssistRequest
  ): Promise<ManuscriptAiAssistResponse> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: ManuscriptAiAssistResponse; message?: string }>(
      `/research/manuscripts/${manuscriptId}/ai-assist`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'AI assistance query failed');
    }

    return res.data;
  },

  // -----------------------------------------------------------------
  // Peer Collaboration & Co-Authoring Methods
  // -----------------------------------------------------------------

  /**
   * Send a collaboration invite to a researcher
   */
  inviteCollaborator: async (
    projectId: string,
    email: string,
    role: CollaborationRole = 'co_author',
    message?: string
  ): Promise<CollaborationInvite> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: CollaborationInvite; message?: string }>(
      '/research/collaboration/invite',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectId, email, role, message }),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to send collaboration invitation');
    }

    return res.data;
  },

  /**
   * Get incoming collaboration invitations for current researcher
   */
  getIncomingInvitations: async (): Promise<CollaborationInvite[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: CollaborationInvite[] }>(
      '/research/collaboration/invitations/incoming',
      { headers }
    );

    return res?.success && Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Get outgoing (sent) collaboration invitations
   */
  getOutgoingInvitations: async (projectId?: string): Promise<CollaborationInvite[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    const res = await apiRequest<{ success: boolean; data: CollaborationInvite[] }>(
      `/research/collaboration/invitations/outgoing${query}`,
      { headers }
    );

    return res?.success && Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Respond to an invitation (accept or decline)
   */
  respondToInvitation: async (
    invitationId: string,
    action: 'accept' | 'decline'
  ): Promise<CollaborationInvite> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: CollaborationInvite; message?: string }>(
      `/research/collaboration/invitations/${invitationId}/respond`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ action }),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || `Failed to ${action} invitation`);
    }

    return res.data;
  },

  /**
   * Revoke a pending invitation
   */
  revokeInvitation: async (invitationId: string): Promise<CollaborationInvite> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: CollaborationInvite; message?: string }>(
      `/research/collaboration/invitations/${invitationId}/revoke`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to revoke invitation');
    }

    return res.data;
  },

  /**
   * Get all team members of a project
   */
  getProjectCollaborators: async (
    projectId: string
  ): Promise<{ projectId: string; currentUserRole?: 'owner' | CollaborationRole; owner: any; collaborators: ProjectTeamMember[] }> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: { projectId: string; currentUserRole?: 'owner' | CollaborationRole; owner: any; collaborators: ProjectTeamMember[] };
      message?: string;
    }>(`/research/collaboration/projects/${projectId}/collaborators`, { headers });

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to load project collaborators');
    }

    return res.data;
  },

  /**
   * Get the requester's role on a project from the server
   */
  getProjectRole: async (
    projectId: string
  ): Promise<{ projectId: string; hasAccess: boolean; role: 'owner' | CollaborationRole | null }> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: { projectId: string; hasAccess: boolean; role: 'owner' | CollaborationRole | null };
      message?: string;
    }>(`/research/collaboration/projects/${projectId}/role`, { headers });

    if (!res || !res.success || !res.data) {
      return { projectId, hasAccess: false, role: null };
    }

    return res.data;
  },

  /**
   * Remove a collaborator from a project or leave a project
   */
  removeCollaborator: async (projectId: string, researcherId: string): Promise<void> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/collaboration/projects/${projectId}/collaborators/${researcherId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to remove collaborator');
    }
  },

  /**
   * Update a collaborator's role
   */
  updateCollaboratorRole: async (
    projectId: string,
    researcherId: string,
    role: CollaborationRole
  ): Promise<void> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/collaboration/projects/${projectId}/collaborators/${researcherId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role }),
      }
    );

    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to update collaborator role');
    }
  },

  /**
   * Get projects where the researcher is an active collaborator
   */
  getCollaborativeProjects: async (): Promise<any[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any[] }>(
      '/research/collaboration/projects',
      { headers }
    );

    return res?.success && Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Add a manuscript comment / peer review annotation
   */
  addManuscriptComment: async (
    manuscriptId: string,
    content: string,
    sectionId?: string,
    highlightedText?: string
  ): Promise<ManuscriptComment> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: ManuscriptComment; message?: string }>(
      '/research/collaboration/comments',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ manuscriptId, content, sectionId, highlightedText }),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to post manuscript comment');
    }

    return res.data;
  },

  /**
   * Get manuscript review comments
   */
  getManuscriptComments: async (
    manuscriptId: string,
    status?: 'open' | 'resolved'
  ): Promise<ManuscriptComment[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const query = status ? `?manuscriptId=${manuscriptId}&status=${status}` : `?manuscriptId=${manuscriptId}`;
    const res = await apiRequest<{ success: boolean; data: ManuscriptComment[] }>(
      `/research/collaboration/comments${query}`,
      { headers }
    );

    return res?.success && Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Mark a manuscript comment as resolved
   */
  resolveComment: async (commentId: string): Promise<ManuscriptComment> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: ManuscriptComment; message?: string }>(
      `/research/collaboration/comments/${commentId}/resolve`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to resolve comment');
    }

    return res.data;
  },

  /**
   * Reply to a peer review comment thread
   */
  replyToComment: async (commentId: string, content: string): Promise<any> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/collaboration/comments/${commentId}/reply`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to post reply');
    }

    return res.data;
  },

  // -----------------------------------------------------------------
  // Project-Scoped Academic Research Kanban & Tasks
  // -----------------------------------------------------------------

  /**
   * List all research tasks for an active project with optional filtering
   */
  listProjectTasks: async (
    projectId: string,
    filters?: TaskFilterOptions
  ): Promise<ResearchTask[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.researchStage) params.set('researchStage', filters.researchStage);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
    if (filters?.dueFilter && filters.dueFilter !== 'all') params.set('dueFilter', filters.dueFilter);
    if (filters?.overdue) params.set('overdue', String(filters.overdue));
    if (filters?.dueDate) params.set('dueDate', filters.dueDate);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: any[]; message?: string }>(
      `/research/projects/${projectId}/tasks${queryStr}`,
      { headers }
    );

    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((t) => ({
        id: t._id || t.id,
        _id: t._id,
        projectId: typeof t.projectId === 'object' ? t.projectId._id : t.projectId,
        ownerId: typeof t.ownerId === 'object' ? t.ownerId._id : t.ownerId,
        createdBy: t.createdBy,
        title: t.title,
        description: t.description || '',
        status: t.status || 'backlog',
        researchStage: t.researchStage || 'literature_review',
        priority: t.priority || 'medium',
        assigneeId: t.assigneeId,
        dueDate: t.dueDate,
        paperIds: t.paperIds || [],
        noteIds: t.noteIds || [],
        manuscriptId: t.manuscriptId,
        manuscriptSectionId: t.manuscriptSectionId,
        isOverdue: Boolean(t.isOverdue),
        completedAt: t.completedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));
    }
    return [];
  },

  /**
   * Create a new research task within a project
   */
  createTask: async (
    projectId: string,
    taskData: CreateTaskInput
  ): Promise<ResearchTask> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/projects/${projectId}/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(taskData),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to create research task');
    }

    const t = res.data;
    return {
      id: t._id || t.id,
      _id: t._id,
      projectId: typeof t.projectId === 'object' ? t.projectId._id : t.projectId,
      ownerId: typeof t.ownerId === 'object' ? t.ownerId._id : t.ownerId,
      createdBy: t.createdBy,
      title: t.title,
      description: t.description || '',
      status: t.status || 'backlog',
      researchStage: t.researchStage || 'literature_review',
      priority: t.priority || 'medium',
      assigneeId: t.assigneeId,
      dueDate: t.dueDate,
      paperIds: t.paperIds || [],
      noteIds: t.noteIds || [],
      manuscriptId: t.manuscriptId,
      manuscriptSectionId: t.manuscriptSectionId,
      isOverdue: Boolean(t.isOverdue),
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  },

  /**
   * Get single research task by ID
   */
  getTaskById: async (taskId: string): Promise<ResearchTask> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/tasks/${taskId}`,
      { headers }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to retrieve research task');
    }

    const t = res.data;
    return {
      id: t._id || t.id,
      _id: t._id,
      projectId: typeof t.projectId === 'object' ? t.projectId._id : t.projectId,
      ownerId: typeof t.ownerId === 'object' ? t.ownerId._id : t.ownerId,
      createdBy: t.createdBy,
      title: t.title,
      description: t.description || '',
      status: t.status || 'backlog',
      researchStage: t.researchStage || 'literature_review',
      priority: t.priority || 'medium',
      assigneeId: t.assigneeId,
      dueDate: t.dueDate,
      paperIds: t.paperIds || [],
      noteIds: t.noteIds || [],
      manuscriptId: t.manuscriptId,
      manuscriptSectionId: t.manuscriptSectionId,
      isOverdue: Boolean(t.isOverdue),
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  },

  /**
   * Update fields on a task
   */
  updateTask: async (
    taskId: string,
    updates: UpdateTaskInput
  ): Promise<ResearchTask> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/tasks/${taskId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to update research task');
    }

    const t = res.data;
    return {
      id: t._id || t.id,
      _id: t._id,
      projectId: typeof t.projectId === 'object' ? t.projectId._id : t.projectId,
      ownerId: typeof t.ownerId === 'object' ? t.ownerId._id : t.ownerId,
      createdBy: t.createdBy,
      title: t.title,
      description: t.description || '',
      status: t.status || 'backlog',
      researchStage: t.researchStage || 'literature_review',
      priority: t.priority || 'medium',
      assigneeId: t.assigneeId,
      dueDate: t.dueDate,
      paperIds: t.paperIds || [],
      noteIds: t.noteIds || [],
      manuscriptId: t.manuscriptId,
      manuscriptSectionId: t.manuscriptSectionId,
      isOverdue: Boolean(t.isOverdue),
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  },

  /**
   * Update task status (drag-and-drop between columns)
   */
  updateTaskStatus: async (
    taskId: string,
    status: TaskStatus
  ): Promise<ResearchTask> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/tasks/${taskId}/status`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to update task status');
    }

    const t = res.data;
    return {
      id: t._id || t.id,
      _id: t._id,
      projectId: typeof t.projectId === 'object' ? t.projectId._id : t.projectId,
      ownerId: typeof t.ownerId === 'object' ? t.ownerId._id : t.ownerId,
      createdBy: t.createdBy,
      title: t.title,
      description: t.description || '',
      status: t.status || 'backlog',
      researchStage: t.researchStage || 'literature_review',
      priority: t.priority || 'medium',
      assigneeId: t.assigneeId,
      dueDate: t.dueDate,
      paperIds: t.paperIds || [],
      noteIds: t.noteIds || [],
      manuscriptId: t.manuscriptId,
      manuscriptSectionId: t.manuscriptSectionId,
      isOverdue: Boolean(t.isOverdue),
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  },

  /**
   * Update task assignee
   */
  updateTaskAssignee: async (
    taskId: string,
    assigneeId: string | null
  ): Promise<ResearchTask> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
      `/research/tasks/${taskId}/assignee`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ assigneeId }),
      }
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'Failed to update task assignee');
    }

    const t = res.data;
    return {
      id: t._id || t.id,
      _id: t._id,
      projectId: typeof t.projectId === 'object' ? t.projectId._id : t.projectId,
      ownerId: typeof t.ownerId === 'object' ? t.ownerId._id : t.ownerId,
      createdBy: t.createdBy,
      title: t.title,
      description: t.description || '',
      status: t.status || 'backlog',
      researchStage: t.researchStage || 'literature_review',
      priority: t.priority || 'medium',
      assigneeId: t.assigneeId,
      dueDate: t.dueDate,
      paperIds: t.paperIds || [],
      noteIds: t.noteIds || [],
      manuscriptId: t.manuscriptId,
      manuscriptSectionId: t.manuscriptSectionId,
      isOverdue: Boolean(t.isOverdue),
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  },

  /**
   * Delete a task
   */
  deleteTask: async (taskId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to delete research task');
    }

    return true;
  },

  /**
   * Get task summary counts for a project
   */
  getProjectTaskSummary: async (
    projectId: string
  ): Promise<TaskSummaryCounts> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; data: TaskSummaryCounts; message?: string }>(
      `/research/projects/${projectId}/tasks/summary`,
      { headers }
    );

    if (res?.success && res.data) {
      return res.data;
    }

    return { total: 0, active: 0, dueSoon: 0, overdue: 0, completed: 0 };
  },

  /**
   * Get combined project calendar data (tasks with due dates + standalone events)
   */
  getProjectCalendar: async (
    projectId: string,
    options: CalendarQueryOptions = {}
  ): Promise<CombinedProjectCalendarResponse> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const params = new URLSearchParams();
    if (options.startDate) params.set('startDate', options.startDate);
    if (options.endDate) params.set('endDate', options.endDate);
    if (options.type) params.set('type', options.type);
    if (options.assigneeId) params.set('assigneeId', options.assigneeId);
    if (options.search) params.set('search', options.search);
    if (options.includeTasks !== undefined) params.set('includeTasks', String(options.includeTasks));
    if (options.includeEvents !== undefined) params.set('includeEvents', String(options.includeEvents));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: CombinedProjectCalendarResponse;
      message?: string;
    }>(`/research/projects/${projectId}/calendar${queryString}`, { headers });

    if (res?.success && res.data) {
      return {
        tasks: Array.isArray(res.data.tasks) ? res.data.tasks : [],
        events: Array.isArray(res.data.events) ? res.data.events : [],
      };
    }

    return { tasks: [], events: [] };
  },

  /**
   * Get combined calendar data across all projects the researcher belongs to
   */
  getAllProjectsCalendar: async (
    options: CalendarQueryOptions = {}
  ): Promise<CombinedProjectCalendarResponse> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const params = new URLSearchParams();
    if (options.startDate) params.set('startDate', options.startDate);
    if (options.endDate) params.set('endDate', options.endDate);
    if (options.type) params.set('type', options.type);
    if (options.assigneeId) params.set('assigneeId', options.assigneeId);
    if (options.search) params.set('search', options.search);
    if (options.includeTasks !== undefined) params.set('includeTasks', String(options.includeTasks));
    if (options.includeEvents !== undefined) params.set('includeEvents', String(options.includeEvents));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: CombinedProjectCalendarResponse;
      message?: string;
    }>(`/research/calendar/all${queryString}`, { headers });

    if (res?.success && res.data) {
      return {
        tasks: Array.isArray(res.data.tasks) ? res.data.tasks : [],
        events: Array.isArray(res.data.events) ? res.data.events : [],
      };
    }

    return { tasks: [], events: [] };
  },

  /**
   * Get standalone calendar events for a project
   */
  getCalendarEvents: async (
    projectId: string,
    options: CalendarQueryOptions = {}
  ): Promise<ResearchCalendarEvent[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const params = new URLSearchParams();
    if (options.startDate) params.set('startDate', options.startDate);
    if (options.endDate) params.set('endDate', options.endDate);
    if (options.type) params.set('type', options.type);
    if (options.assigneeId) params.set('assigneeId', options.assigneeId);
    if (options.search) params.set('search', options.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: ResearchCalendarEvent[];
      message?: string;
    }>(`/research/projects/${projectId}/calendar/events${queryString}`, { headers });

    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }

    return [];
  },

  /**
   * Create a standalone research calendar event
   */
  createCalendarEvent: async (
    projectId: string,
    input: CreateCalendarEventInput
  ): Promise<ResearchCalendarEvent> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: ResearchCalendarEvent;
      message?: string;
    }>(`/research/projects/${projectId}/calendar/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Failed to create calendar event');
  },

  /**
   * Get a single calendar event by ID
   */
  getCalendarEventById: async (eventId: string): Promise<ResearchCalendarEvent> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: ResearchCalendarEvent;
      message?: string;
    }>(`/research/calendar/events/${eventId}`, { headers });

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Failed to fetch calendar event');
  },

  /**
   * Update a research calendar event
   */
  updateCalendarEvent: async (
    eventId: string,
    input: UpdateCalendarEventInput
  ): Promise<ResearchCalendarEvent> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: ResearchCalendarEvent;
      message?: string;
    }>(`/research/calendar/events/${eventId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(input),
    });

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Failed to update calendar event');
  },

  /**
   * Delete a research calendar event
   */
  deleteCalendarEvent: async (eventId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/calendar/events/${eventId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to delete calendar event');
    }

    return true;
  },

  // ==========================================
  // User-Specific Research Folders
  // ==========================================

  /**
   * List folders for the authenticated researcher
   */
  listFolders: async (query?: {
    projectId?: string;
    search?: string;
  }): Promise<ResearchFolder[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const params = new URLSearchParams();
    if (query?.projectId) params.append('projectId', query.projectId);
    if (query?.search) params.append('search', query.search);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await apiRequest<{
      success: boolean;
      data: ResearchFolder[];
      message?: string;
    }>(`/research/folders${qs}`, { headers });

    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }

    return [];
  },

  /**
   * Get single folder by ID
   */
  getFolderById: async (folderId: string): Promise<ResearchFolder> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: ResearchFolder;
      message?: string;
    }>(`/research/folders/${folderId}`, { headers });

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Failed to fetch folder');
  },

  /**
   * Create a new user-specific research folder
   */
  createFolder: async (input: CreateFolderInput): Promise<ResearchFolder> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: ResearchFolder;
      message?: string;
    }>('/research/folders', {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Failed to create folder');
  },

  /**
   * Update folder details
   */
  updateFolder: async (
    folderId: string,
    input: UpdateFolderInput
  ): Promise<ResearchFolder> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: ResearchFolder;
      message?: string;
    }>(`/research/folders/${folderId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(input),
    });

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Failed to update folder');
  },

  /**
   * Delete a research folder
   */
  deleteFolder: async (folderId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/folders/${folderId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to delete folder');
    }

    return true;
  },

  // ==========================================
  // User-Specific Research Documents & Uploads
  // ==========================================

  /**
   * List uploaded documents for the authenticated researcher
   */
  listDocuments: async (query?: {
    folderId?: string;
    projectId?: string;
    docType?: string;
    search?: string;
    isStarred?: boolean;
  }): Promise<ResearchDocument[]> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const params = new URLSearchParams();
    if (query?.folderId) params.append('folderId', query.folderId);
    if (query?.projectId) params.append('projectId', query.projectId);
    if (query?.docType && query.docType !== 'all') params.append('docType', query.docType);
    if (query?.search) params.append('search', query.search);
    if (query?.isStarred !== undefined) params.append('isStarred', String(query.isStarred));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await apiRequest<{
      success: boolean;
      data: ResearchDocument[];
      message?: string;
    }>(`/research/documents${qs}`, { headers });

    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }

    return [];
  },

  /**
   * Get single document metadata
   */
  getDocumentById: async (docId: string): Promise<ResearchDocument> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: ResearchDocument;
      message?: string;
    }>(`/research/documents/${docId}`, { headers });

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Failed to fetch document');
  },

  /**
   * Upload research document/file
   */
  uploadDocument: async (
    file: File,
    input?: UploadDocumentInput
  ): Promise<ResearchDocument> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('file', file);
    if (input?.title) formData.append('title', input.title);
    if (input?.docType) formData.append('docType', input.docType);
    if (input?.folderId) formData.append('folderId', input.folderId);
    if (input?.projectId) formData.append('projectId', input.projectId);
    if (input?.description) formData.append('description', input.description);
    if (input?.tags) {
      if (Array.isArray(input.tags)) {
        formData.append('tags', input.tags.join(','));
      } else {
        formData.append('tags', input.tags);
      }
    }

    const res = await fetch(`${API_BASE_URL}/research/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (data?.success && data?.data) {
      return data.data;
    }

    throw new Error(data?.message || 'Failed to upload document');
  },

  /**
   * Update document metadata
   */
  updateDocument: async (
    docId: string,
    input: UpdateDocumentInput
  ): Promise<ResearchDocument> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{
      success: boolean;
      data: ResearchDocument;
      message?: string;
    }>(`/research/documents/${docId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(input),
    });

    if (res?.success && res.data) {
      return res.data;
    }

    throw new Error(res?.message || 'Failed to update document');
  },

  /**
   * Delete a research document
   */
  deleteDocument: async (docId: string): Promise<boolean> => {
    const profileId = researcherProfileService.getProfileId();
    const headers: Record<string, string> = {};
    if (profileId) headers['x-researcher-id'] = profileId;

    const res = await apiRequest<{ success: boolean; message?: string }>(
      `/research/documents/${docId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to delete document');
    }

    return true;
  },
};

