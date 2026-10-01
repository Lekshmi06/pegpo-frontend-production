import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Bookmark,
  ExternalLink,
  Save,
  RotateCcw,
  Copy,
  Layers,
  Search,
  Filter,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  Tag,
  Quote,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import { useToast } from '../../hooks/useToast';
import {
  ResearchProjectSummary,
  ResearchProjectDetail,
  ResearchPaper,
  ResearchNoteItem,
  Manuscript,
  ManuscriptSection,
  ManuscriptAiAction,
  ManuscriptAiAssistResponse,
} from '../../types/research';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

const AI_ACTION_CONFIGS: Array<{
  action: ManuscriptAiAction;
  label: string;
  desc: string;
  icon: string;
  color: string;
}> = [
  { action: 'draft', label: 'Draft from Evidence', desc: 'Synthesize selected papers & notes into a full section draft', icon: '📝', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { action: 'improve', label: 'Improve Academic Clarity', desc: 'Refine syntax, transitions, and peer-review tone', icon: '✨', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { action: 'rewrite', label: 'Rewrite Section', desc: 'Reframe current content with fresh academic structure', icon: '🔄', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { action: 'expand', label: 'Expand Discussion', desc: 'Deepen theoretical mechanisms using selected evidence', icon: '📈', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { action: 'condense', label: 'Condense & Tighten', desc: 'Eliminate rhetorical fluff while keeping empirical claims', icon: '📉', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { action: 'summarize_evidence', label: 'Summarize Evidence', desc: 'Concise summary of only what the selected sources establish', icon: '📋', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { action: 'organize_arguments', label: 'Organize Arguments', desc: 'Sequence claims logically from literature to hypothesis', icon: '🗂', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { action: 'suggest_missing_evidence', label: 'Suggest Missing Evidence', desc: 'Identify where benchmarks, baselines, or citations are needed', icon: '🔍', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { action: 'check_flow', label: 'Check Logical Flow', desc: 'Audit transitions and argumentation coherence', icon: '⚖️', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { action: 'unsupported_claims', label: 'Detect Unsupported Claims', desc: 'Flag assertions not backed by attached project evidence', icon: '⚠️', color: 'bg-orange-50 text-orange-700 border-orange-200' },
];

export default function WritePaper() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Project state
  const [projects, setProjects] = useState<ResearchProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [currentProjectDetail, setCurrentProjectDetail] = useState<ResearchProjectDetail | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Manuscript state
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('');
  const [currentManuscript, setCurrentManuscript] = useState<Manuscript | null>(null);
  const [loadingManuscripts, setLoadingManuscripts] = useState(false);

  // Sections state
  const [sections, setSections] = useState<ManuscriptSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<ManuscriptSection | null>(null);

  // Editor content & autosave
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorTitle, setEditorTitle] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContentRef = useRef<string>('');

  // Right Panel: Evidence & AI Assistant state
  const [rightPanelTab, setRightPanelTab] = useState<'evidence' | 'ai'>('ai');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // AI Assistant state
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<ManuscriptAiAssistResponse | null>(null);

  // Modals state
  const [isCreateManuscriptOpen, setIsCreateManuscriptOpen] = useState<boolean>(false);
  const [newManuscriptTitle, setNewManuscriptTitle] = useState<string>('');
  const [newManuscriptDesc, setNewManuscriptDesc] = useState<string>('');
  const [newCitationStyle, setNewCitationStyle] = useState<string>('APA');
  const [creatingManuscript, setCreatingManuscript] = useState<boolean>(false);

  const [isAddSectionOpen, setIsAddSectionOpen] = useState<boolean>(false);
  const [newSectionTitle, setNewSectionTitle] = useState<string>('');
  const [newSectionType, setNewSectionType] = useState<string>('custom');

  const [editingSectionTitleId, setEditingSectionTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState<string>('');

  // 1. Initial Load: Load all projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const list = await researchService.listProjects();
        setProjects(list);

        const projectParam = searchParams.get('project');
        if (projectParam && list.some((p) => p.id === projectParam || (p as any)._id === projectParam)) {
          setSelectedProjectId(projectParam);
        } else if (list.length > 0) {
          const firstId = list[0].id || (list[0] as any)._id;
          setSelectedProjectId(firstId);
        }
      } catch (err) {
        console.error('Failed to load research projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, [searchParams]);

  // 2. When selectedProjectId changes, load project details & manuscripts
  useEffect(() => {
    if (!selectedProjectId) {
      setCurrentProjectDetail(null);
      setManuscripts([]);
      setSelectedManuscriptId('');
      setCurrentManuscript(null);
      setSections([]);
      setActiveSectionId('');
      return;
    }

    const loadProjectAndManuscripts = async () => {
      setLoadingManuscripts(true);
      try {
        // Load project detail to get attached papers & notes
        const detail = await researchService.getProjectById(selectedProjectId).catch(() => null);
        setCurrentProjectDetail(detail);

        // Load project's manuscripts
        const msList = await researchService.listManuscripts(selectedProjectId);
        setManuscripts(msList);

        const manuscriptParam = searchParams.get('manuscript');
        if (manuscriptParam && msList.some((m) => m.id === manuscriptParam || m._id === manuscriptParam)) {
          setSelectedManuscriptId(manuscriptParam);
        } else if (msList.length > 0) {
          const firstMsId = msList[0].id || msList[0]._id || '';
          setSelectedManuscriptId(firstMsId);
        } else {
          setSelectedManuscriptId('');
          setCurrentManuscript(null);
          setSections([]);
          setActiveSectionId('');
        }
      } catch (err) {
        console.error('Failed loading manuscripts:', err);
      } finally {
        setLoadingManuscripts(false);
      }
    };

    loadProjectAndManuscripts();
  }, [selectedProjectId, searchParams]);

  // 3. When selectedManuscriptId changes, load manuscript details with sections
  useEffect(() => {
    if (!selectedManuscriptId) {
      setCurrentManuscript(null);
      setSections([]);
      setActiveSectionId('');
      return;
    }

    const loadManuscript = async () => {
      try {
        const ms = await researchService.getManuscriptById(selectedManuscriptId);
        setCurrentManuscript(ms);
        const sortedSections = (ms.sections || []).sort((a, b) => a.order - b.order);
        setSections(sortedSections);

        const sectionParam = searchParams.get('section');
        if (sectionParam && sortedSections.some((s) => s.id === sectionParam || s._id === sectionParam)) {
          setActiveSectionId(sectionParam);
        } else if (sortedSections.length > 0) {
          const firstSecId = sortedSections[0].id || sortedSections[0]._id || '';
          setActiveSectionId(firstSecId);
        } else {
          setActiveSectionId('');
        }
      } catch (err) {
        console.error('Failed loading manuscript details:', err);
      }
    };

    loadManuscript();
  }, [selectedManuscriptId, searchParams]);

  // 4. When activeSectionId changes, update editor state and evidence selection
  useEffect(() => {
    if (!activeSectionId || sections.length === 0) {
      setActiveSection(null);
      setEditorContent('');
      setEditorTitle('');
      lastSavedContentRef.current = '';
      setSaveStatus('saved');
      return;
    }

    const sec = sections.find((s) => s.id === activeSectionId || s._id === activeSectionId);
    if (sec) {
      setActiveSection(sec);
      setEditorContent(sec.content || '');
      setEditorTitle(sec.title || '');
      lastSavedContentRef.current = sec.content || '';
      setSaveStatus('saved');

      // Hydrate selected evidence IDs from section's saved state
      const paperIds = (sec.evidencePaperIds || []).map((p: any) =>
        typeof p === 'object' && p !== null ? (p.id || p._id) : p
      ).filter(Boolean);

      const noteIds = (sec.evidenceNoteIds || []).map((n: any) =>
        typeof n === 'object' && n !== null ? (n.id || n._id) : n
      ).filter(Boolean);

      setSelectedPaperIds(paperIds);
      setSelectedNoteIds(noteIds);
    }
  }, [activeSectionId, sections]);

  // 5. Safe Debounced Autosave for Editor Content
  const performSave = useCallback(
    async (contentToSave: string, titleToSave?: string, paperIds?: string[], noteIds?: string[]) => {
      if (!activeSectionId) return;

      setSaveStatus('saving');
      try {
        const updated = await researchService.updateManuscriptSection(activeSectionId, {
          content: contentToSave,
          ...(titleToSave ? { title: titleToSave } : {}),
          evidencePaperIds: paperIds !== undefined ? paperIds : selectedPaperIds,
          evidenceNoteIds: noteIds !== undefined ? noteIds : selectedNoteIds,
        });

        lastSavedContentRef.current = contentToSave;
        setSaveStatus('saved');

        // Update local sections state
        setSections((prev) =>
          prev.map((s) => (s.id === activeSectionId || s._id === activeSectionId ? updated : s))
        );
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('error');
      }
    },
    [activeSectionId, selectedPaperIds, selectedNoteIds]
  );

  const handleEditorChange = (newVal: string) => {
    setEditorContent(newVal);
    setSaveStatus('unsaved');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      performSave(newVal, editorTitle);
    }, 1200);
  };

  const handleManualSave = () => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    performSave(editorContent, editorTitle);
    toast.success('Section saved to cloud');
  };

  // 6. Section Navigation & Switching
  const handleSelectSection = (secId: string) => {
    if (secId === activeSectionId) return;

    // If currently unsaved, flush immediately before switching
    if (saveStatus === 'unsaved' && activeSectionId) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      performSave(editorContent, editorTitle);
    }

    setActiveSectionId(secId);
    setAiResponse(null);
  };

  // 7. Evidence Selection Toggle & Auto-sync with Section
  const handleTogglePaperEvidence = (paperId: string) => {
    const updated = selectedPaperIds.includes(paperId)
      ? selectedPaperIds.filter((id) => id !== paperId)
      : [...selectedPaperIds, paperId];
    setSelectedPaperIds(updated);
    performSave(editorContent, editorTitle, updated, selectedNoteIds);
  };

  const handleToggleNoteEvidence = (noteId: string) => {
    const updated = selectedNoteIds.includes(noteId)
      ? selectedNoteIds.filter((id) => id !== noteId)
      : [...selectedNoteIds, noteId];
    setSelectedNoteIds(updated);
    performSave(editorContent, editorTitle, selectedPaperIds, updated);
  };

  const handleSelectAllEvidence = () => {
    const allPaperIds = (currentProjectDetail?.paperIds || []).map((p) => p.id || (p as any)._id).filter(Boolean);
    const allNoteIds = (currentProjectDetail?.noteIds || []).map((n) => n.id || (n as any)._id).filter(Boolean);
    setSelectedPaperIds(allPaperIds);
    setSelectedNoteIds(allNoteIds);
    performSave(editorContent, editorTitle, allPaperIds, allNoteIds);
    toast.info(`Selected all ${allPaperIds.length} papers and ${allNoteIds.length} notes`);
  };

  const handleClearEvidence = () => {
    setSelectedPaperIds([]);
    setSelectedNoteIds([]);
    performSave(editorContent, editorTitle, [], []);
  };

  // 8. Section CRUD & Reordering
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim() || !selectedManuscriptId) return;

    try {
      const created = await researchService.createManuscriptSection(selectedManuscriptId, {
        title: newSectionTitle.trim(),
        sectionType: newSectionType,
        content: '',
      });

      setSections((prev) => [...prev, created]);
      setActiveSectionId(created.id || created._id || '');
      setIsAddSectionOpen(false);
      setNewSectionTitle('');
      toast.success(`Section "${created.title}" added to manuscript`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add section');
    }
  };

  const handleDeleteSection = async (secId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete section "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await researchService.deleteManuscriptSection(secId);
      const remaining = sections.filter((s) => s.id !== secId && s._id !== secId);
      setSections(remaining);

      if (activeSectionId === secId) {
        setActiveSectionId(remaining.length > 0 ? (remaining[0].id || remaining[0]._id || '') : '');
      }
      toast.success(`Section "${title}" deleted`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete section');
    }
  };

  const handleSaveRenamedTitle = async (secId: string) => {
    if (!editingTitleText.trim()) {
      setEditingSectionTitleId(null);
      return;
    }

    try {
      const updated = await researchService.updateManuscriptSection(secId, {
        title: editingTitleText.trim(),
      });
      setSections((prev) => prev.map((s) => (s.id === secId || s._id === secId ? updated : s)));
      if (activeSectionId === secId) {
        setEditorTitle(updated.title);
      }
      setEditingSectionTitleId(null);
      toast.success('Section renamed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to rename section');
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const sectionOrders = reordered.map((sec, idx) => ({
      sectionId: sec.id || sec._id || '',
      order: idx,
    }));

    // Optimistically update UI
    setSections(reordered.map((sec, idx) => ({ ...sec, order: idx })));

    try {
      await researchService.reorderManuscriptSections(selectedManuscriptId, sectionOrders);
    } catch (err: any) {
      toast.error('Failed to save reordered sections');
      // Revert if error
      const ms = await researchService.getManuscriptById(selectedManuscriptId);
      setSections(ms.sections || []);
    }
  };

  // 9. Manuscript Creation
  const handleCreateManuscript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManuscriptTitle.trim() || !selectedProjectId) {
      toast.error('Manuscript title is required');
      return;
    }

    setCreatingManuscript(true);
    try {
      const created = await researchService.createManuscript({
        projectId: selectedProjectId,
        title: newManuscriptTitle.trim(),
        description: newManuscriptDesc.trim(),
        citationStyle: newCitationStyle,
      });

      setManuscripts((prev) => [created, ...prev]);
      const createdId = created.id || created._id || '';
      setSelectedManuscriptId(createdId);
      setIsCreateManuscriptOpen(false);
      setNewManuscriptTitle('');
      setNewManuscriptDesc('');
      toast.success(`Manuscript "${created.title}" created with 9 standard research sections!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create manuscript');
    } finally {
      setCreatingManuscript(false);
    }
  };

  // 10. AI Writing Assistant Execution
  const handleRunAiAction = async (action: ManuscriptAiAction) => {
    if (!selectedManuscriptId || !activeSectionId) {
      toast.error('Please select an active section to run AI writing assistance');
      return;
    }

    setIsAiGenerating(true);
    setRightPanelTab('ai');

    try {
      const response = await researchService.manuscriptAiAssist(selectedManuscriptId, {
        manuscriptId: selectedManuscriptId,
        sectionId: activeSectionId,
        action,
        instruction: customAiPrompt.trim() || undefined,
        sectionTitle: editorTitle,
        sectionContent: editorContent,
        paperIds: selectedPaperIds,
        noteIds: selectedNoteIds,
      });

      setAiResponse(response);
      toast.success(`AI completed action: ${action}`);
    } catch (err: any) {
      toast.error(err?.message || 'AI writing assistance failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI Output Application Handlers
  const handleInsertAiTextAtEnd = () => {
    if (!aiResponse) return;
    const combined = editorContent.trim()
      ? `${editorContent.trim()}\n\n${aiResponse.generatedText.trim()}`
      : aiResponse.generatedText.trim();

    handleEditorChange(combined);
    researchService.updateManuscriptSection(activeSectionId, { aiAssisted: true });
    toast.success('Inserted AI content at end of section');
    setAiResponse(null);
  };

  const handleReplaceSectionWithAiText = () => {
    if (!aiResponse) return;
    if (editorContent.trim() && !window.confirm('Replace existing text in this section with the AI draft?')) {
      return;
    }

    handleEditorChange(aiResponse.generatedText.trim());
    researchService.updateManuscriptSection(activeSectionId, { aiAssisted: true });
    toast.success('Section replaced with AI draft');
    setAiResponse(null);
  };

  const handleCopyAiText = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse.generatedText);
    toast.info('Copied AI draft to clipboard');
  };

  // Text formatting tools
  const handleApplyFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('manuscript-editor-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newContent = editorContent.substring(0, start) + replacement + editorContent.substring(end);
    handleEditorChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : 4));
    }, 50);
  };

  // Word count & progress calculation
  const wordCount = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;
  const completedSectionsCount = sections.filter((s) => s.content && s.content.trim().length > 30).length;
  const completionPercentage = sections.length > 0 ? Math.round((completedSectionsCount / sections.length) * 100) : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8fafc] text-slate-800 font-sans select-none">
      {/* 1. Header Toolbar */}
      <header className="h-14 bg-white border-b border-[#e2ebf4] px-4 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">Project:</span>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSearchParams({ project: e.target.value });
                }}
                disabled={loadingProjects || projects.length === 0}
                className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs font-bold text-[#006bbd] focus:outline-none focus:ring-2 focus:ring-blue-400/20 cursor-pointer max-w-[180px] sm:max-w-xs truncate"
              >
                {projects.map((p) => {
                  const pId = p.id || (p as any)._id;
                  return (
                    <option key={pId} value={pId}>
                      {p.title}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <span className="text-slate-300">/</span>

          {/* Manuscript Selector */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">Manuscript:</span>
            {manuscripts.length > 0 ? (
              <select
                value={selectedManuscriptId}
                onChange={(e) => {
                  setSelectedManuscriptId(e.target.value);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('manuscript', e.target.value);
                    return next;
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/20 cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
              >
                {manuscripts.map((m) => {
                  const mId = m.id || m._id || '';
                  return (
                    <option key={mId} value={mId}>
                      {m.title} ({m.citationStyle})
                    </option>
                  );
                })}
              </select>
            ) : (
              <span className="text-xs font-medium text-slate-400 italic">No manuscript</span>
            )}

            <button
              onClick={() => setIsCreateManuscriptOpen(true)}
              className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#006bbd] text-xs font-bold transition-colors cursor-pointer border border-blue-200/60"
              title="Create new manuscript"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Header Right Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Progress pill */}
          {sections.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{completedSectionsCount}/{sections.length} sections ({completionPercentage}%)</span>
            </div>
          )}

          {/* Autosave status indicator */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-blue-600 animate-pulse">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline text-[11px]">Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-600" title="All changes saved to cloud">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Saved</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1 text-amber-600" title="Unsaved changes pending autosave">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="hidden sm:inline text-[11px]">Unsaved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-rose-600" title="Save failed. Click Save Now to retry">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Save failed</span>
              </span>
            )}
          </div>

          <button
            onClick={handleManualSave}
            disabled={saveStatus === 'saving' || !activeSectionId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0091ff] hover:bg-[#007cdb] text-white text-xs font-bold shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Body (3-Pane Grid) */}
      {!selectedProjectId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0091ff] flex items-center justify-center shadow-xs">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h2 className="text-lg font-bold text-slate-900">Select or Create a Research Project</h2>
            <p className="text-xs text-slate-500 font-medium">
              Research Writing works directly from your research project's literature, hypotheses, and study objectives.
            </p>
          </div>
          <button
            onClick={() => navigate('/research/projects')}
            className="px-4 py-2 rounded-xl bg-[#0091ff] hover:bg-[#007cdb] text-white text-xs font-bold transition-all shadow-xs"
          >
            Go to Research Projects
          </button>
        </div>
      ) : manuscripts.length === 0 && !loadingManuscripts ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 text-[#006bbd] flex items-center justify-center shadow-xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h2 className="text-lg font-bold text-slate-900">Create a Research Manuscript</h2>
            <p className="text-xs text-slate-500 font-medium">
              Start writing your study for project <strong className="text-slate-800">"{currentProjectDetail?.title || 'Selected Project'}"</strong>. EduPye generates 9 standard publication sections automatically.
            </p>
          </div>
          <button
            onClick={() => setIsCreateManuscriptOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0091ff] hover:bg-[#007cdb] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Research Manuscript</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-row overflow-hidden relative">
          {/* PANE 1: LEFT - MANUSCRIPT STRUCTURE (SECTIONS) */}
          <aside className="w-64 md:w-72 border-r border-[#e2ebf4] bg-white flex flex-col shrink-0 select-none overflow-hidden">
            {/* Structure Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0091ff]" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Sections
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-50 text-[#006bbd]">
                  {sections.length}
                </span>
              </div>
              <button
                onClick={() => setIsAddSectionOpen(true)}
                className="p-1 rounded-lg text-[#0091ff] hover:bg-blue-50 transition-colors"
                title="Add Section"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sections.map((sec, idx) => {
                const secId = sec.id || sec._id || '';
                const isActive = secId === activeSectionId;
                const hasContent = sec.content && sec.content.trim().length > 30;

                return (
                  <div
                    key={secId}
                    onClick={() => handleSelectSection(secId)}
                    className={`group rounded-xl p-2.5 transition-all cursor-pointer flex items-center justify-between gap-2 border text-xs ${
                      isActive
                        ? 'bg-blue-50/80 border-blue-300/80 text-[#006bbd] font-bold shadow-2xs'
                        : 'border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Completion checkmark */}
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          hasContent
                            ? 'bg-emerald-500 text-white'
                            : 'border border-slate-300 text-slate-300'
                        }`}
                        title={hasContent ? 'Content written' : 'Empty draft'}
                      >
                        {hasContent ? '✓' : ''}
                      </span>

                      {/* Title or inline edit */}
                      {editingSectionTitleId === secId ? (
                        <input
                          type="text"
                          value={editingTitleText}
                          onChange={(e) => setEditingTitleText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRenamedTitle(secId);
                            if (e.key === 'Escape') setEditingSectionTitleId(null);
                          }}
                          onBlur={() => handleSaveRenamedTitle(secId)}
                          autoFocus
                          className="px-1 py-0.5 text-xs font-bold border border-blue-400 rounded bg-white w-32 focus:outline-none"
                        />
                      ) : (
                        <div className="min-w-0">
                          <span className="truncate block font-semibold">
                            {idx + 1}. {sec.title}
                          </span>
                          {sec.aiAssisted && (
                            <span className="text-[9px] font-bold text-sky-600 block flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> AI Assisted
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Section Actions (Move, Rename, Delete) */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(idx, 'down');
                        }}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSectionTitleId(secId);
                          setEditingTitleText(sec.title);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600"
                        title="Rename Section"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(secId, sec.title);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Section Button */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setIsAddSectionOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 text-xs font-bold text-slate-600 hover:text-[#0091ff] hover:bg-blue-50/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>
          </aside>

          {/* PANE 2: CENTER - SCHOLARLY MANUSCRIPT EDITOR */}
          <main className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Editor Header Bar */}
            <div className="px-6 py-3.5 border-b border-[#e2ebf4] flex flex-wrap items-center justify-between gap-3 bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {editorTitle || 'Untitled Section'}
                </h1>
                {activeSection?.sectionType && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    {activeSection.sectionType.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => handleApplyFormatting('**', '**')}
                  className="px-2 py-1 rounded hover:bg-white font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting('*', '*')}
                  className="px-2 py-1 rounded hover:bg-white italic text-slate-700 transition-colors cursor-pointer"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting('## ')}
                  className="px-2 py-1 rounded hover:bg-white font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting('### ')}
                  className="px-2 py-1 rounded hover:bg-white font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting('- ')}
                  className="px-2 py-1 rounded hover:bg-white text-slate-700 transition-colors cursor-pointer"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting('1. ')}
                  className="px-2 py-1 rounded hover:bg-white text-slate-700 transition-colors cursor-pointer"
                  title="Numbered List"
                >
                  1. List
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting('> ')}
                  className="px-2 py-1 rounded hover:bg-white text-slate-700 transition-colors cursor-pointer"
                  title="Quote Block"
                >
                  ” Quote
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting('[', ' et al., Year]')}
                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[#006bbd] font-bold transition-colors cursor-pointer"
                  title="Insert Citation Tag"
                >
                  + Citation
                </button>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{editorContent.length} chars</span>
              </div>
            </div>

            {/* AI Generated Text Banner if Available */}
            {aiResponse && (
              <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-200 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0091ff]" />
                    <span className="text-xs font-extrabold text-[#006bbd] uppercase tracking-wider">
                      AI Generated Content Ready ({aiResponse.action})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Source Grounded
                    </span>
                  </div>
                  <button
                    onClick={() => setAiResponse(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
                  {aiResponse.generatedText}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Review generated draft before inserting into your manuscript.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyAiText}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-2xs"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleInsertAiTextAtEnd}
                      className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-[#006bbd] text-xs font-bold transition-colors shadow-2xs"
                    >
                      Insert at End
                    </button>
                    <button
                      onClick={handleReplaceSectionWithAiText}
                      className="px-3 py-1.5 rounded-xl bg-[#0091ff] hover:bg-[#007cdb] text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      Replace Section
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Editor Canvas */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeSectionId ? (
                <textarea
                  id="manuscript-editor-textarea"
                  value={editorContent}
                  onChange={(e) => handleEditorChange(e.target.value)}
                  placeholder={`Write your ${editorTitle || 'section'} here... You can write directly in Markdown, or use the Evidence & AI Panel on the right to draft from your project's literature.`}
                  className="w-full h-full min-h-[400px] resize-none border-none outline-none font-sans text-sm text-slate-800 leading-relaxed placeholder:text-slate-400 placeholder:italic bg-transparent focus:ring-0"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">No Section Selected</p>
                  <p className="text-xs text-slate-400">Choose a section from the left panel to begin writing.</p>
                </div>
              )}
            </div>
          </main>

          {/* PANE 3: RIGHT - EVIDENCE + AI ASSISTANT PANEL */}
          <aside className="w-80 md:w-96 border-l border-[#e2ebf4] bg-white flex flex-col shrink-0 overflow-hidden select-none">
            {/* Right Pane Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 p-1 shrink-0">
              <button
                onClick={() => setRightPanelTab('ai')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'ai'
                    ? 'bg-white text-[#006bbd] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0091ff]" />
                <span>AI Assistant</span>
              </button>
              <button
                onClick={() => setRightPanelTab('evidence')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'evidence'
                    ? 'bg-white text-[#006bbd] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Evidence ({selectedPaperIds.length + selectedNoteIds.length})</span>
              </button>
            </div>

            {/* TAB 1: EVIDENCE SELECTION */}
            {rightPanelTab === 'evidence' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white text-xs">
                  <span className="font-extrabold text-slate-800">Project Evidence</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      onClick={handleSelectAllEvidence}
                      className="text-[#0091ff] hover:underline font-bold"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      onClick={handleClearEvidence}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {/* Papers Checklist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <span>Attached Papers ({currentProjectDetail?.paperIds?.length || 0})</span>
                      <span className="text-blue-600">{selectedPaperIds.length} selected</span>
                    </div>

                    {(currentProjectDetail?.paperIds || []).length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                        No papers attached to this project yet. Add literature in the Project Workspace.
                      </div>
                    ) : (
                      (currentProjectDetail?.paperIds || []).map((paper) => {
                        const pId = paper.id || (paper as any)._id;
                        const isChecked = selectedPaperIds.includes(pId);

                        return (
                          <div
                            key={pId}
                            onClick={() => handleTogglePaperEvidence(pId)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1 text-xs ${
                              isChecked
                                ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-2xs'
                                : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 rounded text-[#0091ff] focus:ring-blue-400 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold leading-tight line-clamp-2">{paper.title}</p>
                                <p className="text-[10px] text-slate-400 pt-0.5">
                                  {paper.authors?.slice(0, 2).join(', ')} ({paper.year || 'n.d.'}) • {paper.venue || 'Academic Venue'}
                                </p>
                              </div>
                            </div>
                            {paper.methodology && (
                              <p className="text-[10px] text-blue-700 bg-blue-100/50 p-1.5 rounded-lg line-clamp-1">
                                Method: {paper.methodology}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Notes & Hypotheses Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <span>Study Notes & Hypotheses ({currentProjectDetail?.noteIds?.length || 0})</span>
                      <span className="text-amber-600">{selectedNoteIds.length} selected</span>
                    </div>

                    {(currentProjectDetail?.noteIds || []).length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                        No notes created yet. Add hypotheses and critiques in your Project Workspace.
                      </div>
                    ) : (
                      (currentProjectDetail?.noteIds || []).map((note) => {
                        const nId = note.id || (note as any)._id;
                        const isChecked = selectedNoteIds.includes(nId);

                        return (
                          <div
                            key={nId}
                            onClick={() => handleToggleNoteEvidence(nId)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1 text-xs ${
                              isChecked
                                ? 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-2xs'
                                : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 rounded text-amber-600 focus:ring-amber-400 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                    {note.noteType || 'NOTE'}
                                  </span>
                                  <span className="font-bold truncate">{note.title}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 line-clamp-2 pt-0.5">{note.content}</p>
                              </div>
                            </div>
                            {note.excerpt && (
                              <p className="text-[10px] italic text-slate-500 bg-slate-100/70 p-1 rounded">
                                "{note.excerpt.slice(0, 80)}..."
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => setRightPanelTab('ai')}
                    className="w-full py-2 bg-[#0091ff] hover:bg-[#007cdb] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
                  >
                    Draft with Selected Evidence ({selectedPaperIds.length + selectedNoteIds.length}) &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: AI ASSISTANT ACTIONS */}
            {rightPanelTab === 'ai' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Active Evidence Summary Pill */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Evidence Grounding:</span>
                    <span className="font-bold text-[#006bbd]">
                      {selectedPaperIds.length} Papers, {selectedNoteIds.length} Notes
                    </span>
                  </div>
                  <button
                    onClick={() => setRightPanelTab('evidence')}
                    className="text-[11px] font-bold text-[#0091ff] hover:underline"
                  >
                    Change &rarr;
                  </button>
                </div>

                {/* AI Actions Scroll Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {/* Custom Directive Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-slate-500">
                      Custom Directive / Instruction
                    </label>
                    <textarea
                      rows={2}
                      value={customAiPrompt}
                      onChange={(e) => setCustomAiPrompt(e.target.value)}
                      placeholder='e.g., "Emphasize multi-scale skip attention and contrast with standard UNet decoders..."'
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-blue-200 shadow-2xs leading-relaxed"
                    />
                  </div>

                  {/* Actions Grid */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">
                      Evidence-Grounded AI Actions
                    </span>

                    <div className="space-y-2">
                      {AI_ACTION_CONFIGS.map((cfg) => (
                        <button
                          key={cfg.action}
                          disabled={isAiGenerating}
                          onClick={() => handleRunAiAction(cfg.action)}
                          className={`w-full p-3 rounded-2xl border text-left transition-all hover:shadow-xs group cursor-pointer flex flex-col space-y-1 ${cfg.color} hover:brightness-95 disabled:opacity-50`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cfg.icon}</span>
                            <span className="text-xs font-extrabold leading-tight">{cfg.label}</span>
                          </div>
                          <p className="text-[10px] opacity-80 pl-6 leading-normal font-medium">{cfg.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generation Loading State */}
                {isAiGenerating && (
                  <div className="p-4 bg-blue-50 border-t border-blue-100 flex items-center gap-3 text-xs text-[#006bbd] animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin text-[#0091ff]" />
                    <span>Grounding against selected literature & synthesizing section...</span>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* CREATE MANUSCRIPT MODAL */}
      {isCreateManuscriptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0091ff] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Create Research Manuscript</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Project: {currentProjectDetail?.title || 'Selected Project'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateManuscriptOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManuscript} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="block text-slate-700">Manuscript Title *</label>
                <input
                  type="text"
                  required
                  value={newManuscriptTitle}
                  onChange={(e) => setNewManuscriptTitle(e.target.value)}
                  placeholder='e.g. "Hybrid Transformer Architectures for Volumetric CT Segmentation"'
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0091ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-700">Description / Focus</label>
                <textarea
                  rows={2}
                  value={newManuscriptDesc}
                  onChange={(e) => setNewManuscriptDesc(e.target.value)}
                  placeholder="Primary study thesis, methodology approach, and publication target..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0091ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-700">Citation Style</label>
                <select
                  value={newCitationStyle}
                  onChange={(e) => setNewCitationStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0091ff] cursor-pointer"
                >
                  <option value="APA">APA 7th Edition (Author, Year)</option>
                  <option value="IEEE">IEEE Numeric Reference [1]</option>
                  <option value="MLA">MLA 9th Edition</option>
                  <option value="Chicago">Chicago Author-Date</option>
                  <option value="Harvard">Harvard Reference Style</option>
                  <option value="Vancouver">Vancouver Biomedical Format</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-[#006bbd] space-y-1">
                <span className="font-extrabold uppercase block tracking-wider">Default Manuscript Structure</span>
                <p>
                  Automatically initializes 9 publication-grade sections: Abstract, Introduction, Literature Review, Research Gap, Methodology, Results, Discussion, Conclusion, References.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateManuscriptOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingManuscript || !newManuscriptTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-[#0091ff] hover:bg-[#007cdb] text-white font-bold transition-all shadow-xs disabled:opacity-40"
                >
                  {creatingManuscript ? 'Creating...' : 'Create Manuscript'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SECTION MODAL */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add Manuscript Section</h3>
              <button onClick={() => setIsAddSectionOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="block text-slate-700">Section Title *</label>
                <input
                  type="text"
                  required
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder='e.g. "Ablation Studies" or "Clinical Dataset Cohorts"'
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0091ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-700">Section Type</label>
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0091ff]"
                >
                  <option value="custom">Custom / General Section</option>
                  <option value="methodology">Methodology</option>
                  <option value="results">Results & Benchmarks</option>
                  <option value="discussion">Discussion</option>
                  <option value="literature_review">Literature Review</option>
                  <option value="research_gap">Research Gap</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSectionTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0091ff] text-white font-bold disabled:opacity-40"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
