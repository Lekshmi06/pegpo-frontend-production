import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Pin,
  Trash2,
  ExternalLink,
  Edit3,
  FileEdit,
  FolderGit2,
  ArrowRight,
} from 'lucide-react';
import {
  ResearchNoteItem,
  ResearchNoteType,
  HypothesisStatus,
} from '../../types/research';
import { researchService } from '../../services/researchService';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';
import { SaveResearchNoteModal } from '../../components/research/SaveResearchNoteModal';

export default function Notebook() {
  const navigate = useNavigate();
  const {
    activeProject,
    allProjects,
    setActiveProjectId,
  } = useResearchActiveProject();

  const [notes, setNotes] = useState<ResearchNoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Modal State for Note Creation / Editing
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalInitialValues, setModalInitialValues] = useState<any>(undefined);

  // Synchronize selectedProjectId with activeProject when page loads
  useEffect(() => {
    if (activeProject?.id && selectedProjectId === 'all') {
      setSelectedProjectId(activeProject.id);
    }
  }, [activeProject, selectedProjectId]);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedProjectId !== 'all') {
        filters.projectId = selectedProjectId;
      }
      if (activeFilter !== 'all' && activeFilter !== 'ai') {
        filters.noteType = activeFilter;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const fetched = await researchService.getAllResearcherNotes(filters);
      setNotes(fetched);
    } catch (err) {
      console.warn('Could not load notes for research notebook:', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, activeFilter, searchQuery]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this research note?')) {
      return;
    }
    try {
      await researchService.deleteProjectNote(noteId);
      loadNotes();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete note');
    }
  };

  const handleTogglePin = async (note: ResearchNoteItem) => {
    try {
      await researchService.updateProjectNote(note.id, {
        isPinned: !note.isPinned,
      });
      loadNotes();
    } catch (err: any) {
      console.warn('Failed to toggle pin:', err);
    }
  };

  const handleOpenCreateModal = (type: ResearchNoteType = 'general') => {
    setModalInitialValues({
      noteType: type,
      title: '',
      content: '',
      hypothesisStatus: type === 'hypothesis' ? 'idea' : undefined,
    });
    setIsModalOpen(true);
  };

  // Filter notes in memory for extra frontend filters (e.g. AI-assisted)
  const filteredNotes = notes.filter((n) => {
    if (activeFilter === 'ai') {
      return n.aiGenerated || n.aiAssisted;
    }
    return true;
  });

  const getNoteTypeBadge = (type?: ResearchNoteType) => {
    switch (type) {
      case 'hypothesis':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30">
            <Lightbulb className="w-3 h-3" />
            Hypothesis
          </span>
        );
      case 'finding':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Finding
          </span>
        );
      case 'critique':
      case 'limitation':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            {type === 'limitation' ? 'Limitation' : 'Critique'}
          </span>
        );
      case 'methodology':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/30">
            <Layers className="w-3 h-3" />
            Methodology
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {type || 'General'}
          </span>
        );
    }
  };

  const getHypothesisBadge = (status?: HypothesisStatus) => {
    if (!status) return null;
    const colors: Record<HypothesisStatus, string> = {
      idea: 'bg-amber-100 text-amber-800 border-amber-300',
      testing: 'bg-sky-100 text-sky-800 border-sky-300',
      supported: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      rejected: 'bg-slate-100 text-slate-600 border-slate-300',
    };
    return (
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${colors[status]}`}>
        Status: {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Notebook Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#264973] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Research Notebook
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Your centralized scientific knowledge base — crystallized hypotheses, findings, critiques, and methodology notes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenCreateModal('hypothesis')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>+ Hypothesis</span>
          </button>
          <button
            onClick={() => handleOpenCreateModal('general')}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Project Switcher Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                if (e.target.value !== 'all') {
                  setActiveProjectId(e.target.value);
                }
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Research Projects</option>
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, hypotheses, methods, tags..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Note Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
          {[
            { id: 'all', label: 'All Knowledge' },
            { id: 'hypothesis', label: 'Hypotheses' },
            { id: 'finding', label: 'Findings' },
            { id: 'critique', label: 'Critiques & Limitations' },
            { id: 'methodology', label: 'Methodology' },
            { id: 'ai', label: '✨ AI Assisted' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Loading research knowledge base...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200/80 rounded-2xl p-8 space-y-4 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">No Research Notes Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || activeFilter !== 'all'
                ? 'Try adjusting your search criteria or filter tags.'
                : 'Start capturing your research thinking. Turn AI copilot inquiries, reading reflections, and hypotheses into persistent notes.'}
            </p>
          </div>
          <button
            onClick={() => handleOpenCreateModal('hypothesis')}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Create Your First Hypothesis</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-white border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group ${
                note.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/80'
              }`}
            >
              {/* Note Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getNoteTypeBadge(note.noteType || note.type)}
                    {getHypothesisBadge(note.hypothesisStatus)}
                    {(note.aiGenerated || note.aiAssisted) && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </span>
                    )}
                  </div>

                  {/* Pin and Delete Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note)}
                      className={`p-1 rounded-lg transition-colors ${
                        note.isPinned
                          ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {note.title}
                </h3>

                {/* Content */}
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-4 font-sans whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              {/* Note Metadata & Action Footers */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {/* Project & Paper identity */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span className="truncate max-w-[140px]" title={note.projectTitle}>
                    📁 {note.projectTitle || (note.projectId?.title) || 'Research Project'}
                  </span>
                  <span>{note.date || 'Saved'}</span>
                </div>

                {note.paperTitle && (
                  <p className="text-[10px] text-sky-600 font-semibold truncate" title={note.paperTitle}>
                    📄 {note.paperTitle}
                  </p>
                )}

                {/* Workflow Navigation Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (note.projectId?.id || note.projectId?._id || note.projectId) {
                        const pid = note.projectId?.id || note.projectId?._id || note.projectId;
                        setActiveProjectId(pid);
                      }
                      navigate('/research/write');
                    }}
                    className="text-[10px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
                  >
                    <span>Use as Evidence in Writing</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      if (note.projectId?.id || note.projectId?._id || note.projectId) {
                        const pid = note.projectId?.id || note.projectId?._id || note.projectId;
                        navigate(`/research/projects/${pid}?tab=notes`);
                      }
                    }}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                  >
                    <FolderGit2 className="w-3 h-3" />
                    <span>Project</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save / Create Note Modal */}
      {activeProject && (
        <SaveResearchNoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            loadNotes();
          }}
          projectId={activeProject.id}
          projectTitle={activeProject.title}
          initialValues={modalInitialValues}
        />
      )}
    </div>
  );
}
