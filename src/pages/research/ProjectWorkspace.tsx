import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FolderKanban,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Target,
  FileText,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle2,
  X,
  Send,
  Search,
  Bookmark,
  Check,
  BarChart3,
  HelpCircle,
  Database,
  Compass,
  Pin,
  Edit3,
  Quote,
  Tag,
  Filter,
  CheckSquare,
  Calendar,
  Square,
  GitCompare,
  Table,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import {
  ResearchProjectDetail,
  ResearchPaper,
  ResearchAIResponse,
  ResearchNoteItem,
  ResearchNoteType,
  PaperComparisonMatrix,
} from '../../types/research';
import { PaperReaderModal } from '../../components/research/PaperReaderModal';
import CitePaperModal from '../../components/research/CitePaperModal';


type WorkspaceTab = 'overview' | 'literature' | 'notes' | 'analysis';

const NOTE_TYPE_OPTIONS: Array<{ value: ResearchNoteType; label: string; color: string }> = [
  { value: 'hypothesis', label: 'Hypothesis', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { value: 'methodology', label: 'Methodology', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'critique', label: 'Critique', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { value: 'finding', label: 'Finding', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'general', label: 'General Note', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
];

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [project, setProject] = useState<ResearchProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as WorkspaceTab;
  const validTabs: WorkspaceTab[] = ['overview', 'literature', 'notes', 'analysis'];
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    validTabs.includes(tabParam) ? tabParam : 'overview'
  );

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  const handleTabChange = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // Reader Modal State
  const [selectedReaderPaper, setSelectedReaderPaper] = useState<ResearchPaper | null>(null);
  const [selectedCitePaper, setSelectedCitePaper] = useState<ResearchPaper | null>(null);

  // Add Paper From Library Modal
  const [isAddPaperModalOpen, setIsAddPaperModalOpen] = useState(false);
  const [libraryPapers, setLibraryPapers] = useState<ResearchPaper[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [addingPaperId, setAddingPaperId] = useState<string | null>(null);
  const [addPaperError, setAddPaperError] = useState<string | null>(null);

  // Remove Paper Action State
  const [removingPaperId, setRemovingPaperId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Project Research Notes State
  const [notes, setNotes] = useState<ResearchNoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesFilter, setNotesFilter] = useState<string>('all');
  const [notesSearch, setNotesSearch] = useState<string>('');

  // Note Modal (Create / Edit)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState<{
    title: string;
    noteType: ResearchNoteType;
    content: string;
    paperId: string;
    excerpt: string;
    tagsText: string;
    isPinned: boolean;
  }>({
    title: '',
    noteType: 'hypothesis',
    content: '',
    paperId: '',
    excerpt: '',
    tagsText: '',
    isPinned: false,
  });
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Project AI Copilot Drawer State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{
      sender: 'user' | 'ai';
      text: string;
      groundedEvidence?: Array<{ paperTitle: string; section?: string; excerpt: string }>;
      sourceSupported?: boolean;
    }>
  >([]);

  // Comparative Literature Analysis State
  const [comparisonMatrix, setComparisonMatrix] = useState<PaperComparisonMatrix | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [selectedPaperIdsForComparison, setSelectedPaperIdsForComparison] = useState<string[]>([]);
  const [savingTakeawayAsNote, setSavingTakeawayAsNote] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  // Fetch Project from MongoDB
  const loadProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await researchService.getProjectById(id);
      setProject(data);
      if (Array.isArray(data.noteIds)) {
        setNotes(data.noteIds);
      }
    } catch (err: any) {
      console.error('Failed to load project workspace:', err);
      setError(err?.message || 'Failed to load project workspace. Verify project permissions.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch Project Notes from MongoDB
  const loadNotes = useCallback(async () => {
    if (!id) return;
    setNotesLoading(true);
    try {
      const fetched = await researchService.getProjectNotes(id);
      setNotes(fetched);
    } catch (err) {
      console.warn('Could not load project notes:', err);
    } finally {
      setNotesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
    loadNotes();
  }, [loadProject, loadNotes]);

  // Open "Add Paper" modal and load library
  const handleOpenAddPapers = async () => {
    setIsAddPaperModalOpen(true);
    setLibraryLoading(true);
    setAddPaperError(null);
    try {
      const papers = await researchService.getLibraryPapers();
      setLibraryPapers(papers);
    } catch (err: any) {
      setAddPaperError('Could not load library papers. Please try again.');
    } finally {
      setLibraryLoading(false);
    }
  };

  // Attach a paper from library to this project
  const handleAttachPaper = async (paperId: string) => {
    if (!project) return;
    setAddingPaperId(paperId);
    setAddPaperError(null);
    try {
      await researchService.addPaperToProject(paperId, project.id);
      await loadProject();
    } catch (err: any) {
      setAddPaperError(err?.message || 'Failed to attach paper to project');
    } finally {
      setAddingPaperId(null);
    }
  };

  // Remove paper from project
  const handleRemovePaper = async (paperId: string) => {
    if (!project) return;
    if (!window.confirm('Remove this paper from the project? The paper remains in your library.')) {
      return;
    }

    setRemovingPaperId(paperId);
    setRemoveError(null);
    try {
      await researchService.removePaperFromProject(project.id, paperId);
      await loadProject();
    } catch (err: any) {
      setRemoveError(err?.message || 'Failed to remove paper from project');
    } finally {
      setRemovingPaperId(null);
    }
  };

  // Open Note Modal for Create
  const handleOpenCreateNote = (prefill?: {
    title?: string;
    content?: string;
    noteType?: ResearchNoteType;
    paperId?: string;
    excerpt?: string;
  }) => {
    setEditingNoteId(null);
    setNoteError(null);
    setNoteForm({
      title: prefill?.title || '',
      noteType: prefill?.noteType || 'hypothesis',
      content: prefill?.content || '',
      paperId: prefill?.paperId || '',
      excerpt: prefill?.excerpt || '',
      tagsText: '',
      isPinned: false,
    });
    setIsNoteModalOpen(true);
  };

  // Open Note Modal for Edit
  const handleOpenEditNote = (note: ResearchNoteItem) => {
    setEditingNoteId(note.id || (note as any)._id);
    setNoteError(null);

    let paperIdVal = '';
    if (typeof note.paperId === 'string') {
      paperIdVal = note.paperId;
    } else if (note.paperId && typeof note.paperId === 'object') {
      paperIdVal = (note.paperId as any)._id || '';
    }

    setNoteForm({
      title: note.title,
      noteType: (note.noteType || note.type || 'general') as ResearchNoteType,
      content: note.content,
      paperId: paperIdVal,
      excerpt: note.excerpt || '',
      tagsText: note.tags?.join(', ') || '',
      isPinned: Boolean(note.isPinned),
    });
    setIsNoteModalOpen(true);
  };

  // Save Note (Create or Update)
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    if (!noteForm.content.trim()) {
      setNoteError('Note content cannot be empty.');
      return;
    }

    setNoteSubmitting(true);
    setNoteError(null);

    const tags = noteForm.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingNoteId) {
        await researchService.updateProjectNote(editingNoteId, {
          title: noteForm.title.trim() || 'Untitled Research Note',
          noteType: noteForm.noteType,
          content: noteForm.content.trim(),
          paperId: noteForm.paperId || undefined,
          excerpt: noteForm.excerpt.trim() || undefined,
          tags,
          isPinned: noteForm.isPinned,
        });
      } else {
        await researchService.createProjectNote(project.id, {
          title: noteForm.title.trim() || 'Untitled Research Note',
          noteType: noteForm.noteType,
          content: noteForm.content.trim(),
          paperId: noteForm.paperId || undefined,
          excerpt: noteForm.excerpt.trim() || undefined,
          tags,
          isPinned: noteForm.isPinned,
        });
      }

      setIsNoteModalOpen(false);
      await loadNotes();
      await loadProject();
    } catch (err: any) {
      console.error('Save note error:', err);
      setNoteError(err?.message || 'Failed to save note');
    } finally {
      setNoteSubmitting(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this research note?')) {
      return;
    }

    try {
      await researchService.deleteProjectNote(noteId);
      await loadNotes();
      await loadProject();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete research note');
    }
  };

  // Save AI response directly as a Research Note
  const handleSaveAiMessageToNote = (
    msgText: string,
    noteType: ResearchNoteType = 'finding'
  ) => {
    const titlePrefix =
      noteType === 'hypothesis'
        ? 'Hypothesis'
        : noteType === 'finding'
        ? 'AI Finding'
        : noteType === 'critique'
        ? 'Critique'
        : noteType === 'methodology'
        ? 'Methodology'
        : 'Project Note';

    handleOpenCreateNote({
      title: `${titlePrefix}: ${project?.title ? project.title.slice(0, 30) + '...' : 'Evidence'}`,
      content: msgText,
      noteType,
    });
  };

  // Send Project-Scoped AI query
  const handleAskProjectAI = async (queryText?: string) => {
    const text = (queryText || aiQuery).trim();
    if (!text || !project) return;

    const userMessage = { sender: 'user' as const, text };
    setAiMessages((prev) => [...prev, userMessage]);
    if (!queryText) setAiQuery('');
    setAiLoading(true);
    setIsAiDrawerOpen(true);

    try {
      const response: ResearchAIResponse = await researchService.queryResearchAI({
        query: text,
        contextType: 'project',
        projectId: project.id,
      });

      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.reply,
          groundedEvidence: response.groundedEvidence,
          sourceSupported: response.sourceSupported,
        },
      ]);
    } catch (err: any) {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ Query execution failed: ${err?.message || 'Check network connection'}.`,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Initialize paper selection for comparison when project loads
  useEffect(() => {
    if (project?.paperIds && project.paperIds.length > 0 && selectedPaperIdsForComparison.length === 0) {
      setSelectedPaperIdsForComparison(project.paperIds.map((p) => p.id || (p as any)._id));
    }
  }, [project]);

  // Run comparative synthesis
  const handleRunComparison = useCallback(async (customIds?: string[]) => {
    if (!id) return;
    const targetIds = customIds || selectedPaperIdsForComparison;
    if (targetIds.length === 0 && (!project?.paperIds || project.paperIds.length === 0)) {
      return;
    }

    setComparisonLoading(true);
    setComparisonError(null);
    try {
      const res = await researchService.comparePapers(targetIds, id);
      setComparisonMatrix(res);
    } catch (err: any) {
      console.error('Failed to run comparative analysis:', err);
      setComparisonError(err?.message || 'Failed to generate comparative literature matrix');
    } finally {
      setComparisonLoading(false);
    }
  }, [id, selectedPaperIdsForComparison, project]);

  // Auto-run comparison when user switches to 'analysis' tab if not already run
  useEffect(() => {
    if (activeTab === 'analysis' && !comparisonMatrix && !comparisonLoading && project?.paperIds && project.paperIds.length > 0) {
      handleRunComparison();
    }
  }, [activeTab, comparisonMatrix, comparisonLoading, project, handleRunComparison]);

  const togglePaperSelection = (paperId: string) => {
    setSelectedPaperIdsForComparison((prev) =>
      prev.includes(paperId) ? prev.filter((pid) => pid !== paperId) : [...prev, paperId]
    );
  };

  const handleSelectAllPapers = () => {
    if (project?.paperIds) {
      setSelectedPaperIdsForComparison(project.paperIds.map((p) => p.id || (p as any)._id));
    }
  };

  const handleClearPaperSelection = () => {
    setSelectedPaperIdsForComparison([]);
  };

  const handleSaveTakeawayAsNote = async () => {
    if (!id || !comparisonMatrix?.aiTakeaway) return;
    setSavingTakeawayAsNote(true);
    try {
      const createdNote = await researchService.createProjectNote(id, {
        title: `Comparative Matrix Takeaway (${comparisonMatrix.paperIds.length} Studies)`,
        content: comparisonMatrix.aiTakeaway,
        noteType: 'finding',
        tags: ['comparative-analysis', 'literature-matrix', 'synthesis'],
      });
      setNotes((prev) => [createdNote, ...prev]);
      alert('Comparative takeaway successfully saved as a project note!');
    } catch (err: any) {
      console.error('Failed to save takeaway as note:', err);
      alert(err?.message || 'Failed to save takeaway as project note');
    } finally {
      setSavingTakeawayAsNote(false);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Exploring':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Literature review':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Proposal':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Completed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getNoteTypeBadge = (type?: string) => {
    const opt = NOTE_TYPE_OPTIONS.find((o) => o.value === type) || NOTE_TYPE_OPTIONS[4];
    return (
      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${opt.color}`}>
        {opt.label}
      </span>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Loading research project workspace...
          </p>
        </div>
      </div>
    );
  }

  // Error State / Not Found
  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Project Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'This research project could not be found or you do not have permission to view it.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/research/projects')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Back to Projects
            </button>
            <button
              onClick={loadProject}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const papers = project.paperIds || [];
  const quickAiActions = [
    'Analyze this literature',
    'Compare methodologies',
    'Compare datasets',
    'Summarize the literature',
    'Find common limitations',
    'Identify themes',
  ];

  const filteredNotes = notes.filter((n) => {
    const nType = (n.noteType || n.type || 'general').toLowerCase();
    const matchesType = notesFilter === 'all' || nType === notesFilter.toLowerCase();
    const s = notesSearch.toLowerCase();
    const matchesSearch =
      !s ||
      n.title.toLowerCase().includes(s) ||
      n.content.toLowerCase().includes(s) ||
      n.tags?.some((t) => t.toLowerCase().includes(s));
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col relative overflow-x-hidden">
      {/* Workspace Header */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Back & Title */}
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => navigate('/research/projects')}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Projects</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 truncate max-w-[200px]">{project.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {project.title}
              </h1>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                  project.status
                )}`}
              >
                {project.status || 'Active'}
              </span>
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                {project.domain}
              </span>
            </div>
          </div>

          {/* Right: Primary Workspace Actions */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => navigate(`/research/kanban?projectId=${project.id || (project as any)._id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200/80 transition-colors"
              title="View project research Kanban board"
            >
              <CheckSquare className="w-4 h-4 text-slate-600" />
              <span>Kanban Tasks</span>
            </button>

            <button
              onClick={() => navigate(`/research/calendar?projectId=${project.id || (project as any)._id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200/80 transition-colors"
              title="View project research timeline and calendar"
            >
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>Timeline</span>
            </button>

            <button
              onClick={() => handleOpenCreateNote()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200/80 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>New Note</span>
            </button>

            <button
              onClick={handleOpenAddPapers}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Add Papers</span>
            </button>

            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Ask Project AI</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-6 mt-4 border-t border-slate-200 pt-2">
          <button
            onClick={() => handleTabChange('overview')}
            className={`pb-2 text-xs font-medium transition-colors relative ${
              activeTab === 'overview'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('literature')}
            className={`pb-2 text-xs font-medium transition-colors flex items-center gap-1.5 relative ${
              activeTab === 'literature'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Literature</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {papers.length}
            </span>
            {activeTab === 'literature' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('notes')}
            className={`pb-2 text-xs font-medium transition-colors flex items-center gap-1.5 relative ${
              activeTab === 'notes'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Research Notes & Hypotheses</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {notes.length}
            </span>
            {activeTab === 'notes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('analysis')}
            className={`pb-2 text-xs font-medium transition-colors relative ${
              activeTab === 'analysis'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Analysis & Synthesis
            {activeTab === 'analysis' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
        {removeError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{removeError}</span>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Question, Objectives, Description, Notes Preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Primary Research Question */}
              <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-black/20">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2">
                  <Target className="w-4 h-4" />
                  <span>Central Research Question</span>
                </div>
                <p className="text-base md:text-lg font-medium text-slate-100 leading-relaxed italic">
                  {project.researchQuestion ||
                    'No formal research question formulated yet. You can update this project to define a focal research problem.'}
                </p>
              </div>

              {/* Research Objectives */}
              <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg shadow-black/20">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Research Objectives</span>
                </div>

                {project.objectives && project.objectives.length > 0 ? (
                  <ul className="space-y-2.5 pt-1">
                    {project.objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No specific research objectives recorded yet.
                  </p>
                )}
              </div>

              {/* Working Hypotheses & Recent Notes Card */}
              <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    <FileText className="w-4 h-4" />
                    <span>Working Hypotheses & Study Notes ({notes.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCreateNote()}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      + Add Note
                    </button>
                    {notes.length > 0 && (
                      <button
                        onClick={() => setActiveTab('notes')}
                        className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                      >
                        View all →
                      </button>
                    )}
                  </div>
                </div>

                {notes.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40">
                    <FileText className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">No notes or hypotheses drafted yet.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                      Capture working hypotheses, methodology critiques, or literature observations.
                    </p>
                    <button
                      onClick={() => handleOpenCreateNote()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors"
                    >
                      + Draft Hypothesis / Note
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {notes.slice(0, 3).map((note) => (
                      <div
                        key={note.id || (note as any)._id}
                        onClick={() => handleOpenEditNote(note)}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {note.title}
                          </span>
                          {getNoteTypeBadge(note.noteType || note.type)}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {project.description && (
                <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 space-y-2 shadow-lg shadow-black/20">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Project Scope & Description
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Recent Papers Preview */}
              <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Project Literature ({papers.length})</span>
                  </div>
                  {papers.length > 0 && (
                    <button
                      onClick={() => setActiveTab('literature')}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                    >
                      View all in Literature tab →
                    </button>
                  )}
                </div>

                {papers.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">No literature attached yet.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 mb-4">
                      Add relevant papers from your library to ground AI analysis and comparison.
                    </p>
                    <button
                      onClick={handleOpenAddPapers}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                    >
                      + Add Papers from Library
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {papers.slice(0, 3).map((paper) => (
                      <div
                        key={paper.id || (paper as any)._id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">
                            {paper.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {paper.authors?.slice(0, 2).join(', ') || 'Academic Authors'} • {paper.year} • {paper.venue || 'Journal'}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedReaderPaper(paper)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 text-xs font-medium transition-colors shrink-0"
                        >
                          Read
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Statistics & Project AI Scoped Panel */}
            <div className="space-y-6">
              {/* Basic Project Statistics Card */}
              <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Project Intelligence Stats</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Attached Papers</span>
                    <span className="text-2xl font-bold text-sky-400 mt-1 block">
                      {papers.length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Research Notes</span>
                    <span className="text-2xl font-bold text-amber-400 mt-1 block">
                      {notes.length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Objectives</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                      {project.objectives?.length || 0}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Stage</span>
                    <span className="text-xs font-semibold text-slate-200 mt-1.5 block truncate">
                      {project.currentStage || 'Literature review'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Domain:</span>
                    <span className="text-slate-200 font-medium">{project.domain}</span>
                  </div>
                  {project.createdAt && (
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="text-slate-200 font-medium">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {project.updatedAt && (
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="text-slate-200 font-medium">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Research Tasks Entry Point Card */}
              <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                    <CheckSquare className="w-4 h-4" />
                    <span>Research Tasks</span>
                  </div>
                  <button
                    onClick={() => navigate(`/research/kanban?projectId=${project.id || (project as any)._id}`)}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View Kanban →</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Plan literature reviews, data collection, experiments, and writing milestones on the project Kanban board.
                </p>
                <button
                  onClick={() => navigate(`/research/kanban?projectId=${project.id || (project as any)._id}`)}
                  className="w-full py-2.5 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Open Research Kanban</span>
                </button>
              </div>

              {/* Research Timeline / Calendar Entry Point Card */}
              <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    <Calendar className="w-4 h-4" />
                    <span>Research Timeline / Calendar</span>
                  </div>
                  <button
                    onClick={() => navigate(`/research/calendar?projectId=${project.id || (project as any)._id}`)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View Calendar →</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Chronological schedule of study milestones, experiment dates, supervisor meetings, and task deadlines.
                </p>
                <button
                  onClick={() => navigate(`/research/calendar?projectId=${project.id || (project as any)._id}`)}
                  className="w-full py-2.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Open Research Calendar</span>
                </button>
              </div>

              {/* Quick AI Prompts Card */}
              <div className="bg-[#0e172a] border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg shadow-black/20">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Scoped Literature AI</span>
                </div>
                <p className="text-xs text-slate-400">
                  Cross-paper analysis grounded in your {papers.length} attached papers and {notes.length} research notes.
                </p>

                <div className="space-y-1.5 pt-1">
                  {quickAiActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleAskProjectAI(action)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between group"
                    >
                      <span>{action}</span>
                      <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LITERATURE TAB */}
        {activeTab === 'literature' && (
          <div className="space-y-5">
            {/* Literature Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Project Literature Matrix</h3>
                <p className="text-xs text-slate-400">
                  {papers.length} research {papers.length === 1 ? 'paper' : 'papers'} attached to this project.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddPapers}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Papers from Library</span>
                </button>
                <Link
                  to="/research/discover"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>Discover Literature</span>
                </Link>
              </div>
            </div>

            {/* Papers List */}
            {papers.length === 0 ? (
              <div className="py-20 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto mb-4">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-200">No literature attached yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
                  Add papers from your Research Library or search Crossref to attach literature to this project.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleOpenAddPapers}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Papers from Library</span>
                  </button>
                  <Link
                    to="/research/discover"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    <Compass className="w-4 h-4 text-sky-400" />
                    <span>Search Academic Literature</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {papers.map((paper) => {
                  const paperId = paper.id || (paper as any)._id;
                  const isRemoving = removingPaperId === paperId;

                  return (
                    <div
                      key={paperId}
                      className="bg-[#0e172a] hover:bg-[#111c34] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {paper.sourceProvider || 'Academic Literature'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {paper.year}
                          </span>
                          {paper.venue && (
                            <span className="text-xs text-slate-400 truncate max-w-[280px]">
                              • {paper.venue}
                            </span>
                          )}
                        </div>

                        <h4
                          onClick={() => setSelectedReaderPaper(paper)}
                          className="text-base font-bold text-slate-100 hover:text-sky-300 transition-colors cursor-pointer"
                        >
                          {paper.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-1">
                          {paper.authors?.join(', ') || 'Academic Authors'}
                        </p>

                        {paper.abstract && (
                          <p className="text-xs text-slate-300 line-clamp-2 italic pt-1 leading-relaxed">
                            {paper.abstract}
                          </p>
                        )}

                        {/* Methodology / Dataset tags if present */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {paper.methodology && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              Method: {paper.methodology.slice(0, 35)}...
                            </span>
                          )}
                          {paper.datasets && paper.datasets.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              Data: {paper.datasets[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Paper Actions */}
                      <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                        <button
                          onClick={() => setSelectedReaderPaper(paper)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Paper</span>
                        </button>

                        <button
                          onClick={() =>
                            handleOpenCreateNote({
                              paperId,
                              title: `Observation on "${paper.title.slice(0, 30)}..."`,
                              noteType: 'critique',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                          title="Add note about this paper"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Note</span>
                        </button>

                        <button
                          onClick={() => setSelectedCitePaper(paper)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                          title="Cite this paper (APA, IEEE, MLA, BibTeX, RIS)"
                        >
                          <Quote className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Cite</span>
                        </button>

                        <button
                          onClick={() => {
                            setAiQuery(`Analyze the contribution and methodology of "${paper.title}" in relation to this project.`);
                            setIsAiDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                          title="Ask AI about this paper"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                          <span>Ask AI</span>
                        </button>

                        <button
                          disabled={isRemoving}
                          onClick={() => handleRemovePaper(paperId)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors disabled:opacity-50"
                          title="Remove paper from this project"
                        >
                          {isRemoving ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. RESEARCH NOTES & HYPOTHESES TAB (PHASE 2 - REAL IMPLEMENTATION) */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search notes, hypotheses, or tags..."
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50 transition-colors"
                />
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <Filter className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5 shrink-0" />
                <button
                  onClick={() => setNotesFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    notesFilter === 'all'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({notes.length})
                </button>
                {NOTE_TYPE_OPTIONS.map((opt) => {
                  const count = notes.filter(
                    (n) => (n.noteType || n.type || 'general') === opt.value
                  ).length;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setNotesFilter(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        notesFilter === opt.value
                          ? `${opt.color} font-bold`
                          : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenCreateNote()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-98 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Research Note</span>
              </button>
            </div>

            {/* Notes List / Grid */}
            {notesLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading project research notes...</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="py-20 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0e172a]/40 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-200">
                  {notesSearch || notesFilter !== 'all'
                    ? 'No matching notes found'
                    : 'No research notes created yet'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
                  {notesSearch || notesFilter !== 'all'
                    ? 'Try adjusting your search terms or type filter.'
                    : 'Document working hypotheses, empirical critiques, and literature observations to guide your study and ground AI synthesis.'}
                </p>
                {notesSearch || notesFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setNotesSearch('');
                      setNotesFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCreateNote()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Note</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredNotes.map((note) => {
                  const noteId = note.id || (note as any)._id;
                  const currentNoteType = note.noteType || note.type || 'general';

                  // Resolve linked paper title if available
                  let linkedPaperTitle = note.paperTitle;
                  if (!linkedPaperTitle && note.paperId && typeof note.paperId === 'object') {
                    linkedPaperTitle = (note.paperId as any).title;
                  }

                  return (
                    <div
                      key={noteId}
                      className={`bg-[#0e172a] hover:bg-[#121c33] border ${
                        note.isPinned ? 'border-amber-500/40 shadow-amber-500/5' : 'border-slate-800'
                      } rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between space-y-4`}
                    >
                      <div className="space-y-3">
                        {/* Note Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getNoteTypeBadge(currentNoteType)}
                            {note.isPinned && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                                <Pin className="w-3 h-3 fill-current" />
                                <span>Pinned</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditNote(note)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                              title="Edit Note"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(noteId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => handleOpenEditNote(note)}
                          className="text-base font-bold text-slate-100 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          {note.title}
                        </h4>

                        {/* Linked Paper Reference */}
                        {linkedPaperTitle && (
                          <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Ref: {linkedPaperTitle}</span>
                          </div>
                        )}

                        {/* Quoted Excerpt if present */}
                        {note.excerpt && (
                          <div className="p-2.5 rounded-xl bg-slate-950/80 border-l-2 border-amber-400 text-[11px] text-slate-400 italic">
                            <Quote className="w-3 h-3 inline text-amber-400 mr-1" />
                            <span>"{note.excerpt}"</span>
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>

                        {/* Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {note.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{note.date || 'Recent'}</span>
                        <button
                          onClick={() => {
                            setAiQuery(`How does the literature in this project support or challenge my note: "${note.title} - ${note.content.slice(0, 100)}"?`);
                            setIsAiDrawerOpen(true);
                          }}
                          className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Evaluate with AI</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. ANALYSIS TAB (PHASE 3 - REAL LITERATURE COMPARATIVE ANALYSIS ENGINE) */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Analysis Engine Header & Paper Selection Bar */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                      <Layers className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      Literature Comparative Analysis Engine
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Side-by-side multidimensional evaluation of model architectures, benchmark datasets, findings, and trade-offs.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRunComparison()}
                    disabled={comparisonLoading || selectedPaperIdsForComparison.length === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-purple-500/20 disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${comparisonLoading ? 'animate-spin' : ''}`} />
                    <span>{comparisonLoading ? 'Synthesizing...' : 'Run Comparative Matrix'}</span>
                  </button>
                </div>
              </div>

              {/* Multi-Paper Selection Strip */}
              {papers.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-semibold">No literature attached to this project yet.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                    Add at least 2 papers from your library to construct a comparative literature matrix.
                  </p>
                  <button
                    onClick={handleOpenAddPapers}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                  >
                    + Add Papers from Library
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      Select papers to compare ({selectedPaperIdsForComparison.length}/{papers.length} selected):
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        onClick={handleSelectAllPapers}
                        className="text-sky-400 hover:text-sky-300 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        onClick={handleClearPaperSelection}
                        className="text-slate-400 hover:text-slate-300 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {papers.map((p) => {
                      const pId = p.id || (p as any)._id;
                      const isSelected = selectedPaperIdsForComparison.includes(pId);

                      return (
                        <button
                          key={pId}
                          type="button"
                          onClick={() => togglePaperSelection(pId)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left max-w-sm truncate ${
                            isSelected
                              ? 'bg-purple-500/15 border-purple-500/40 text-purple-200 shadow-xs'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate">{p.title}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">({p.year})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {comparisonError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{comparisonError}</span>
              </div>
            )}

            {/* Loading State */}
            {comparisonLoading && (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-slate-300">
                  Synthesizing comparative literature matrix across selected studies...
                </span>
                <span className="text-[11px] text-slate-500">
                  Analyzing architecture tradeoffs, benchmark dataset cohorts, and empirical findings.
                </span>
              </div>
            )}

            {/* Results Display */}
            {!comparisonLoading && comparisonMatrix && (
              <div className="space-y-6">
                {/* AI Cross-Literature Takeaway Banner */}
                {comparisonMatrix.aiTakeaway && (
                  <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-lg shadow-purple-950/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>AI Cross-Literature Takeaway</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveTakeawayAsNote}
                          disabled={savingTakeawayAsNote}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>{savingTakeawayAsNote ? 'Saving...' : 'Save as Project Note'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setAiQuery(`Based on the comparative matrix of our ${comparisonMatrix.paperIds.length} studies, what are the primary unanswered research questions?`);
                            setIsAiDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                          <span>Explore Gaps in AI</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {comparisonMatrix.aiTakeaway}
                    </p>
                  </div>
                )}

                {/* Methodological Trade-Offs Section */}
                {comparisonMatrix.tradeoffs && comparisonMatrix.tradeoffs.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <GitCompare className="w-4 h-4 text-purple-400" />
                      <span>Methodological Trade-Off Synthesis</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {comparisonMatrix.tradeoffs.map((tradeoff, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0e172a] border border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400" />
                            <h4 className="text-xs font-bold text-purple-300">
                              {tradeoff.dimension}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {tradeoff.comparison}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comparative Matrix Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <Table className="w-4 h-4 text-sky-400" />
                      <span>Multidimensional Comparison Grid</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {comparisonMatrix.paperIds.length} studies evaluated
                    </span>
                  </div>

                  <div className="bg-[#0e172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-950/70">
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-64 min-w-[220px] sticky left-0 bg-slate-950/90 backdrop-blur-xs z-10 border-r border-slate-800/80">
                              Evaluation Dimension
                            </th>
                            {(comparisonMatrix.papers || []).map((paper) => (
                              <th
                                key={paper.id || (paper as any)._id}
                                className="p-4 text-xs min-w-[280px] max-w-[320px] align-top border-r border-slate-800/50 last:border-r-0"
                              >
                                <div className="space-y-1.5">
                                  <h4
                                    onClick={() => setSelectedReaderPaper(paper)}
                                    className="font-bold text-slate-100 hover:text-sky-300 cursor-pointer transition-colors line-clamp-2 leading-snug"
                                    title={paper.title}
                                  >
                                    {paper.title}
                                  </h4>
                                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span>{paper.year} • {paper.venue || 'Academic Venue'}</span>
                                    <button
                                      onClick={() => setSelectedReaderPaper(paper)}
                                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 text-[10px] font-medium transition-colors"
                                    >
                                      Read
                                    </button>
                                  </div>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {comparisonMatrix.dimensions.map((dim, dIdx) => (
                            <tr key={dIdx} className="hover:bg-slate-900/30 transition-colors">
                              {/* Dimension Header Cell */}
                              <td className="p-4 text-xs sticky left-0 bg-[#0e172a] backdrop-blur-xs z-10 border-r border-slate-800/80 align-top">
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-200 block">
                                    {dim.name}
                                  </span>
                                  {dim.description && (
                                    <span className="text-[11px] text-slate-400 block leading-tight">
                                      {dim.description}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Paper Values Cells */}
                              {(comparisonMatrix.papers || []).map((paper) => {
                                const paperId = paper.id || (paper as any)._id;
                                const val = dim.values?.[paperId] || dim.values?.[(paper as any)._id] || dim.values?.[paper.id];

                                return (
                                  <td
                                    key={paperId}
                                    className="p-4 text-xs text-slate-300 align-top leading-relaxed border-r border-slate-800/50 last:border-r-0"
                                  >
                                    <div className="whitespace-pre-wrap text-xs">
                                      {val || 'Not documented in extracted paper metadata'}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Slide-out / Floating Project-Scoped AI Copilot Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0c1424] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Research AI Copilot
                </h3>
                <p className="text-[11px] text-sky-400 truncate max-w-[280px]">
                  Scoped to: {project.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAiDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Scope Indicator */}
          <div className="px-4 py-2 bg-sky-500/10 border-b border-sky-500/20 text-[11px] text-sky-300 flex items-center justify-between">
            <span>Grounding: {papers.length} papers & {notes.length} notes attached</span>
            <span className="font-semibold text-sky-400 text-[10px]">Active</span>
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickAiActions.map((action) => (
              <button
                key={action}
                onClick={() => handleAskProjectAI(action)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-700/60"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {aiMessages.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-sky-400/50" />
                <p className="text-xs font-medium text-slate-300">
                  Ask AI anything regarding this project's literature & hypotheses.
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Queries are grounded in your project's research question, objectives, actual papers, and study notes.
                </p>
              </div>
            ) : (
              aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-sky-600 text-white rounded-br-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Grounded Evidence Citations */}
                    {msg.groundedEvidence && msg.groundedEvidence.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                          Grounded Literature Evidence
                        </span>
                        {msg.groundedEvidence.map((ev, eIdx) => (
                          <div
                            key={eIdx}
                            className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-0.5"
                          >
                            <span className="font-semibold text-slate-300 block truncate">
                              • {ev.paperTitle}
                            </span>
                            <p className="text-slate-400 italic line-clamp-2">
                              "{ev.excerpt}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Crystallization Quick Actions for AI replies */}
                    {msg.sender === 'ai' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveAiMessageToNote(msg.text, 'hypothesis')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 border border-amber-500/30 transition-colors"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Create Hypothesis</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveAiMessageToNote(msg.text, 'finding')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-500/30 transition-colors"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Save Finding</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveAiMessageToNote(msg.text, 'critique')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 border border-rose-500/30 transition-colors"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span>Save Critique</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveAiMessageToNote(msg.text, 'methodology')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/60 text-sky-300 hover:bg-sky-900/80 border border-sky-500/30 transition-colors"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span>Save Methodology</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {aiLoading && (
              <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-sky-400">
                <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing project literature & hypotheses...</span>
              </div>
            )}
          </div>

          {/* Drawer Chat Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskProjectAI();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about project literature, methodology..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                disabled={aiLoading}
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-sky-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!aiQuery.trim() || aiLoading}
                className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Paper From Library Modal */}
      {isAddPaperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e172a] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Add Papers to Project</h3>
                  <p className="text-xs text-slate-400">
                    Select literature from your saved Research Library to attach to this workspace.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPaperModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search papers in library by title or author..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {addPaperError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addPaperError}</span>
                </div>
              )}

              {libraryLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <span>Loading library papers...</span>
                </div>
              ) : libraryPapers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-300">
                    No papers found in your Research Library.
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    You can search academic literature via Discovery or upload research PDFs to add papers to your library.
                  </p>
                  <Link
                    to="/research/discover"
                    onClick={() => setIsAddPaperModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Go to Literature Discovery
                  </Link>
                </div>
              ) : (
                libraryPapers
                  .filter((p) =>
                    librarySearch
                      ? p.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
                        p.authors?.some((a) => a.toLowerCase().includes(librarySearch.toLowerCase()))
                      : true
                  )
                  .map((p) => {
                    const pId = p.id || (p as any)._id;
                    const alreadyInProject = papers.some(
                      (attached) => (attached.id || (attached as any)._id) === pId
                    );
                    const isAttaching = addingPaperId === pId;

                    return (
                      <div
                        key={pId}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                            {p.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {p.authors?.slice(0, 2).join(', ') || 'Authors'} • {p.year} • {p.venue || 'Journal'}
                          </p>
                        </div>

                        {alreadyInProject ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            <span>Attached</span>
                          </span>
                        ) : (
                          <button
                            disabled={isAttaching}
                            onClick={() => handleAttachPaper(pId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50 shrink-0"
                          >
                            {isAttaching ? (
                              <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            <span>Attach</span>
                          </button>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Need more papers?
              </span>
              <Link
                to="/research/discover"
                onClick={() => setIsAddPaperModalOpen(false)}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300"
              >
                Search Crossref Academic Discovery →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Research Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e172a] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">
                    {editingNoteId ? 'Edit Research Note' : 'New Research Note & Hypothesis'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Document study hypotheses, methodological observations, or paper critiques.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNote} className="p-6 space-y-4 overflow-y-auto">
              {noteError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{noteError}</span>
                </div>
              )}

              {/* Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Note Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Boundary Loss Hypothesis for Swin-UNETR"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Note Type
                  </label>
                  <select
                    value={noteForm.noteType}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, noteType: e.target.value as ResearchNoteType })
                    }
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-hidden focus:border-amber-500/50 transition-colors"
                  >
                    {NOTE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Link to Project Literature */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Link to Project Literature (Optional)
                </label>
                <select
                  value={noteForm.paperId}
                  onChange={(e) => setNoteForm({ ...noteForm, paperId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-hidden focus:border-amber-500/50 transition-colors"
                >
                  <option value="">General Project Note (Not paper-specific)</option>
                  {papers.map((p) => (
                    <option key={p.id || (p as any)._id} value={p.id || (p as any)._id}>
                      {p.title.slice(0, 75)}... ({p.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quoted Excerpt / Highlight */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cited Excerpt / Highlight (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Paste direct text, quotation, or figure caption from the paper..."
                  value={noteForm.excerpt}
                  onChange={(e) => setNoteForm({ ...noteForm, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50 transition-colors resize-none"
                />
              </div>

              {/* Note Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Note Content & Analysis <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record your thoughts, testable hypotheses, trade-offs, or questions for further investigation..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50 transition-colors resize-none"
                />
              </div>

              {/* Tags & Pin to top */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., attention, loss-functions, validation"
                    value={noteForm.tagsText}
                    onChange={(e) => setNoteForm({ ...noteForm, tagsText: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={noteForm.isPinned}
                      onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                      className="rounded-sm border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                    />
                    <span>Pin to top of workspace notes</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-60"
                >
                  {noteSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingNoteId ? 'Update Note' : 'Save Note'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paper Reader Modal */}
      {selectedReaderPaper && (
        <PaperReaderModal
          paper={selectedReaderPaper}
          isOpen={Boolean(selectedReaderPaper)}
          onClose={() => setSelectedReaderPaper(null)}
          onAddToProject={() => {}}
          onCreateNote={(paper) =>
            handleOpenCreateNote({
              paperId: paper.id || (paper as any)._id,
              title: `Notes on "${paper.title.slice(0, 35)}..."`,
              noteType: 'critique',
            })
          }
        />
      )}

      {/* Cite Paper Modal */}
      <CitePaperModal
        isOpen={Boolean(selectedCitePaper)}
        onClose={() => setSelectedCitePaper(null)}
        paper={selectedCitePaper}
      />

    </div>
  );
}
