import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  BookOpen,
  Edit3,
  Trash2,
  ChevronDown,
  X,
  Compass,
  BarChart2,
  Database,
  FlaskConical,
  Send,
  Eye,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Layers,
  Check,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';
import { researchService } from '../../services/researchService';
import { researcherProfileService } from '../../services/researcherProfileService';
import {
  ResearchTask,
  TaskStatus,
  ResearchStage,
  TaskPriority,
  CreateTaskInput,
  TaskFilterOptions,
  TaskSummaryCounts,
  ResearchNoteItem,
  Manuscript,
} from '../../types/research';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

// Kanban Columns Configuration
const COLUMNS: Array<{
  id: TaskStatus;
  title: string;
  badgeClass: string;
  dotColor: string;
  dropBorder: string;
}> = [
  {
    id: 'backlog',
    title: 'Backlog',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    dropBorder: 'border-slate-400',
  },
  {
    id: 'todo',
    title: 'To Do',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    dotColor: 'bg-sky-500',
    dropBorder: 'border-sky-400',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dotColor: 'bg-indigo-500',
    dropBorder: 'border-indigo-400',
  },
  {
    id: 'review',
    title: 'Review',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dotColor: 'bg-amber-500',
    dropBorder: 'border-amber-400',
  },
  {
    id: 'done',
    title: 'Done',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
    dropBorder: 'border-emerald-400',
  },
];

// Academic Research Stages Dictionary
export const STAGE_CONFIG: Record<
  ResearchStage,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  literature_review: { label: 'Literature Review', icon: BookOpen, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' },
  methodology: { label: 'Methodology', icon: Compass, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' },
  data_collection: { label: 'Data Collection', icon: Database, color: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800' },
  experiment: { label: 'Experiment', icon: FlaskConical, color: 'text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800' },
  analysis: { label: 'Analysis', icon: BarChart2, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' },
  writing: { label: 'Writing', icon: Edit3, color: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800' },
  review: { label: 'Review', icon: Eye, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' },
  submission: { label: 'Submission', icon: Send, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' },
  other: { label: 'Other', icon: Sparkles, color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
};

// Priority Badges Dictionary
export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; badgeClass: string }
> = {
  urgent: { label: 'Urgent', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200' },
  high: { label: 'High', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200' },
  medium: { label: 'Medium', badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200' },
  low: { label: 'Low', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200' },
};

export default function Kanban() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    activeProject,
    activeProjectId,
    allProjects,
    setActiveProjectId,
    projectDetail,
    refreshProjectDetail,
  } = useResearchActiveProject();

  // Synchronize project from query param if supplied (?projectId=...)
  useEffect(() => {
    const queryProjId = searchParams.get('projectId');
    if (queryProjId && queryProjId !== activeProjectId) {
      setActiveProjectId(queryProjId);
    }
  }, [searchParams, activeProjectId, setActiveProjectId]);

  // Tasks State
  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [taskSummary, setTaskSummary] = useState<TaskSummaryCounts>({
    total: 0,
    active: 0,
    dueSoon: 0,
    overdue: 0,
    completed: 0,
  });

  // Project Team Members (for task assignment)
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email?: string; role: string }>>([]);

  // Project Research Artifacts (for context linking in modal)
  const [projectNotes, setProjectNotes] = useState<ResearchNoteItem[]>([]);
  const [projectManuscripts, setProjectManuscripts] = useState<Manuscript[]>([]);

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [dueFilter, setDueFilter] = useState<'all' | 'overdue' | 'today' | 'this_week'>('all');

  // Drag-and-Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ResearchTask | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<TaskStatus>('backlog');
  const [formStage, setFormStage] = useState<ResearchStage>('literature_review');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formAssigneeId, setFormAssigneeId] = useState<string>('');
  const [formDueDate, setFormDueDate] = useState<string>('');
  const [formPaperIds, setFormPaperIds] = useState<string[]>([]);
  const [formNoteIds, setFormNoteIds] = useState<string[]>([]);
  const [formManuscriptId, setFormManuscriptId] = useState<string>('');
  const [formSectionId, setFormSectionId] = useState<string>('');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Tasks for current active project
  const loadTasks = useCallback(async () => {
    if (!activeProjectId) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    try {
      setLoadingTasks(true);
      const [fetchedTasks, summary] = await Promise.all([
        researchService.listProjectTasks(activeProjectId, {
          researchStage: selectedStage !== 'all' ? (selectedStage as ResearchStage) : undefined,
          priority: selectedPriority !== 'all' ? (selectedPriority as TaskPriority) : undefined,
          assigneeId: selectedAssignee !== 'all' ? selectedAssignee : undefined,
          dueFilter: dueFilter !== 'all' ? dueFilter : undefined,
        }),
        researchService.getProjectTaskSummary(activeProjectId).catch(() => ({
          total: 0,
          active: 0,
          dueSoon: 0,
          overdue: 0,
          completed: 0,
        })),
      ]);

      setTasks(fetchedTasks);
      setTaskSummary(summary);
    } catch (err: any) {
      console.error('Failed to load project tasks:', err);
      showToast(err?.message || 'Failed to load tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, [activeProjectId, selectedStage, selectedPriority, selectedAssignee, dueFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Load Project Context & Artifacts (Collaborators, Notes, Manuscripts)
  useEffect(() => {
    if (!activeProjectId) return;

    // Load collaborators for task assignment
    researchService
      .getProjectCollaborators(activeProjectId)
      .then((collabData) => {
        const members: Array<{ id: string; name: string; email?: string; role: string }> = [];
        if (collabData?.owner) {
          const oId = collabData.owner._id || collabData.owner.id || collabData.owner;
          members.push({
            id: String(oId),
            name: collabData.owner.fullName || 'Lead Principal Investigator (Owner)',
            email: collabData.owner.contact?.email,
            role: 'Owner',
          });
        }
        if (Array.isArray(collabData?.collaborators)) {
          collabData.collaborators.forEach((c: any) => {
            const resObj = typeof c.researcherId === 'object' && c.researcherId !== null ? (c.researcherId as any) : null;
            const rId = resObj ? (resObj._id || resObj.id) : c.researcherId;
            const name = resObj?.fullName || `Collaborator (${c.role})`;
            const email = resObj?.contact?.email;
            if (rId && !members.some((m) => m.id === String(rId))) {
              members.push({
                id: String(rId),
                name,
                email,
                role: c.role,
              });
            }
          });
        }
        setTeamMembers(members);
      })
      .catch(() => {});

    // Load project notes for context linking
    researchService
      .getProjectNotes(activeProjectId)
      .then(setProjectNotes)
      .catch(() => setProjectNotes([]));

    // Load project manuscripts for section linking
    researchService
      .listManuscripts(activeProjectId)
      .then(setProjectManuscripts)
      .catch(() => setProjectManuscripts([]));
  }, [activeProjectId]);

  // Filter tasks locally by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase().trim();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  // Group tasks into columns
  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, ResearchTask[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    filteredTasks.forEach((task) => {
      const col = task.status || 'backlog';
      if (map[col]) {
        map[col].push(task);
      } else {
        map.backlog.push(task);
      }
    });
    return map;
  }, [filteredTasks]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, colId: TaskStatus) => {
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;

    const currentTask = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (!currentTask || currentTask.status === targetStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId || t._id === taskId) {
          return {
            ...t,
            status: targetStatus,
            completedAt: targetStatus === 'done' ? new Date().toISOString() : null,
            isOverdue: targetStatus === 'done' ? false : t.isOverdue,
          };
        }
        return t;
      })
    );

    try {
      await researchService.updateTaskStatus(taskId, targetStatus);
      showToast(`Task moved to ${COLUMNS.find((c) => c.id === targetStatus)?.title}`);
      // Refresh summary counts
      if (activeProjectId) {
        researchService.getProjectTaskSummary(activeProjectId).then(setTaskSummary).catch(() => {});
      }
    } catch (err: any) {
      // Revert on error
      showToast(err?.message || 'Failed to move task. Reverting change.', 'error');
      loadTasks();
    }
  };

  // Open Create Modal
  const openCreateModal = (defaultStatus: TaskStatus = 'todo') => {
    setModalMode('create');
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormStatus(defaultStatus);
    setFormStage('literature_review');
    setFormPriority('medium');
    setFormAssigneeId('');
    setFormDueDate('');
    setFormPaperIds([]);
    setFormNoteIds([]);
    setFormManuscriptId('');
    setFormSectionId('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (task: ResearchTask) => {
    setModalMode('edit');
    setEditingTask(task);
    setFormTitle(task.title || '');
    setFormDescription(task.description || '');
    setFormStatus(task.status || 'todo');
    setFormStage(task.researchStage || 'literature_review');
    setFormPriority(task.priority || 'medium');
    
    // Assignee ID resolution
    const assigneeVal = typeof task.assigneeId === 'object' && task.assigneeId !== null
      ? task.assigneeId._id
      : (task.assigneeId || '');
    setFormAssigneeId(assigneeVal);

    // Due date formatting YYYY-MM-DD
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (!isNaN(d.getTime())) {
        setFormDueDate(d.toISOString().split('T')[0]);
      } else {
        setFormDueDate('');
      }
    } else {
      setFormDueDate('');
    }

    // Linked Papers
    const paperIds = (task.paperIds || []).map((p) =>
      typeof p === 'object' && p !== null ? p._id : p
    );
    setFormPaperIds(paperIds);

    // Linked Notes
    const noteIds = (task.noteIds || []).map((n) =>
      typeof n === 'object' && n !== null ? n._id : n
    );
    setFormNoteIds(noteIds);

    // Linked Manuscript & Section
    const msId = typeof task.manuscriptId === 'object' && task.manuscriptId !== null
      ? task.manuscriptId._id
      : (task.manuscriptId || '');
    setFormManuscriptId(msId);

    const secId = typeof task.manuscriptSectionId === 'object' && task.manuscriptSectionId !== null
      ? task.manuscriptSectionId._id
      : (task.manuscriptSectionId || '');
    setFormSectionId(secId);

    setModalError(null);
    setIsModalOpen(true);
  };

  // Submit Modal (Create or Update)
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) {
      setModalError('No active project selected.');
      return;
    }

    if (!formTitle.trim()) {
      setModalError('Task title is required.');
      return;
    }

    try {
      setModalSaving(true);
      setModalError(null);

      const payload: CreateTaskInput = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        status: formStatus,
        researchStage: formStage,
        priority: formPriority,
        assigneeId: formAssigneeId ? formAssigneeId : undefined,
        dueDate: formDueDate ? formDueDate : undefined,
        paperIds: formPaperIds,
        noteIds: formNoteIds,
        manuscriptId: formManuscriptId ? formManuscriptId : undefined,
        manuscriptSectionId: formSectionId ? formSectionId : undefined,
      };

      if (modalMode === 'create') {
        await researchService.createTask(activeProjectId, payload);
        showToast('Research task successfully created!');
      } else if (editingTask) {
        await researchService.updateTask(editingTask.id || editingTask._id!, payload);
        showToast('Research task updated!');
      }

      setIsModalOpen(false);
      loadTasks();
    } catch (err: any) {
      setModalError(err?.message || 'Failed to save task.');
    } finally {
      setModalSaving(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!editingTask) return;
    if (!window.confirm(`Are you sure you want to delete task: "${editingTask.title}"?`)) return;

    try {
      setModalSaving(true);
      await researchService.deleteTask(editingTask.id || editingTask._id!);
      showToast('Task deleted successfully.');
      setIsModalOpen(false);
      loadTasks();
    } catch (err: any) {
      setModalError(err?.message || 'Failed to delete task.');
    } finally {
      setModalSaving(false);
    }
  };

  // Selected manuscript sections for linking in modal
  const availableManuscriptSections = useMemo(() => {
    if (!formManuscriptId) return [];
    const ms = projectManuscripts.find((m) => m._id === formManuscriptId);
    return Array.isArray(ms?.sectionIds) ? ms.sectionIds : [];
  }, [formManuscriptId, projectManuscripts]);

  // Current researcher ID for "Assigned to me" shortcut
  const currentProfileId = researcherProfileService.getProfileId();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {/* Action Toast */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/80 backdrop-blur-md'
              : 'bg-rose-900/90 text-rose-100 border-rose-700/80 backdrop-blur-md'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Research Kanban
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Tasks
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Academic workflow planning and task management linked to literature, notes, and manuscript sections.
              </p>
            </div>
          </div>

          {/* Active Project Research Question Display */}
          {activeProject && (
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 py-1.5 px-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {activeProject.title}
              </span>
              {activeProject.problemStatement && (
                <span className="text-slate-500 dark:text-slate-400 truncate max-w-md hidden sm:inline">
                  — {activeProject.problemStatement}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls: Project Selector & New Task Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active Project Dropdown */}
          <div className="relative">
            <select
              aria-label="Active Project"
              value={activeProjectId || ''}
              onChange={(e) => {
                const newId = e.target.value;
                setActiveProjectId(newId || null);
                if (newId) setSearchParams({ projectId: newId });
              }}
              className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-2xl py-2.5 pl-3.5 pr-8 focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer shadow-2xs transition-all hover:bg-slate-200/70"
            >
              {allProjects.length === 0 ? (
                <option value="">No projects found</option>
              ) : (
                allProjects.map((proj) => (
                  <option key={proj.id || proj._id} value={proj.id || proj._id}>
                    📁 {proj.title}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* New Task Button */}
          <Button
            onClick={() => openCreateModal('todo')}
            disabled={!activeProjectId}
            className="flex items-center gap-2 text-xs py-2.5 px-4 shadow-md shadow-sky-600/20 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* NO ACTIVE PROJECT NOTICE */}
      {!activeProjectId && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Select a research project to view its research tasks.
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tasks in the Researcher module are project-scoped so your methodology, experiments, and writing stay strictly organized.
          </p>
        </div>
      )}

      {/* MAIN KANBAN BOARD CONTAINER */}
      {activeProjectId && (
        <>
          {/* SUMMARY METRICS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{taskSummary.total}</p>
              </div>
              <Layers className="w-7 h-7 text-slate-300 dark:text-slate-600 stroke-1" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Active Work</p>
                <p className="text-xl font-black text-sky-700 dark:text-sky-300">{taskSummary.active}</p>
              </div>
              <Clock className="w-7 h-7 text-sky-400/50 stroke-1" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Due Soon</p>
                <p className="text-xl font-black text-amber-700 dark:text-amber-300">{taskSummary.dueSoon}</p>
              </div>
              <Calendar className="w-7 h-7 text-amber-400/50 stroke-1" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Overdue</p>
                <p className="text-xl font-black text-rose-700 dark:text-rose-300">{taskSummary.overdue}</p>
              </div>
              <AlertTriangle className="w-7 h-7 text-rose-400/50 stroke-1" />
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{taskSummary.completed}</p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-emerald-400/50 stroke-1" />
            </div>
          </div>

          {/* FILTERING & SEARCH CONTROLS */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks by title or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-2xl pl-9 pr-8 py-2.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Research Stage Filter */}
              <div className="relative">
                <select
                  aria-label="Filter by Research Stage"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 pr-7 cursor-pointer appearance-none"
                >
                  <option value="all">All Stages</option>
                  {Object.entries(STAGE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Priority Filter */}
              <div className="relative">
                <select
                  aria-label="Filter by Priority"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 pr-7 cursor-pointer appearance-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Assignee Filter */}
              <div className="relative">
                <select
                  aria-label="Filter by Assignee"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 pr-7 cursor-pointer appearance-none max-w-[150px] truncate"
                >
                  <option value="all">All Assignees</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Due Date Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDueFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    dueFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setDueFilter('overdue')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    dueFilter === 'overdue'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 shadow-2xs font-extrabold'
                      : 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
                  }`}
                >
                  <span>Overdue</span>
                  {taskSummary.overdue > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-black">
                      {taskSummary.overdue}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDueFilter('today')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    dueFilter === 'today'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Due Today
                </button>
                <button
                  type="button"
                  onClick={() => setDueFilter('this_week')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    dueFilter === 'this_week'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  This Week
                </button>
              </div>

              {/* Reset Filters Shortcut */}
              {(selectedStage !== 'all' ||
                selectedPriority !== 'all' ||
                selectedAssignee !== 'all' ||
                dueFilter !== 'all' ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedStage('all');
                    setSelectedPriority('all');
                    setSelectedAssignee('all');
                    setDueFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer px-2"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ZERO TASKS EMPTY STATE */}
          {tasks.length === 0 && !loadingTasks && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
                <FolderKanban className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  No research tasks yet.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Break your research project into actionable tasks and track them from planning to completion.
                </p>
              </div>
              <Button
                onClick={() => openCreateModal('todo')}
                className="text-xs font-bold py-2.5 px-5 shadow-md shadow-sky-600/20"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Create First Task</span>
              </Button>
            </div>
          )}

          {/* FIVE KANBAN COLUMNS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {COLUMNS.map((col) => {
              const colTasks = tasksByColumn[col.id] || [];
              const isOver = dragOverColumn === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={(e) => handleDragLeave(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-3 border transition-all flex flex-col min-h-[500px] ${
                    isOver
                      ? `border-dashed ${col.dropBorder} bg-sky-50/50 dark:bg-sky-950/20 shadow-md`
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {col.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${col.badgeClass}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Column Quick Add Button */}
                    <button
                      type="button"
                      aria-label={`Add task to ${col.title}`}
                      onClick={() => openCreateModal(col.id)}
                      className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-600 hover:border-sky-300 dark:hover:text-sky-400 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Cards Container */}
                  <div className="flex-1 flex flex-col gap-3 py-1">
                    {colTasks.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-center">
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          No tasks
                        </p>
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const stageInfo = STAGE_CONFIG[task.researchStage] || STAGE_CONFIG.other;
                        const StageIcon = stageInfo.icon;
                        const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                        const isDone = task.status === 'done';

                        // Assignee display name
                        const assigneeName =
                          typeof task.assigneeId === 'object' && task.assigneeId !== null
                            ? task.assigneeId.fullName
                            : undefined;

                        return (
                          <div
                            key={task.id || task._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id || task._id!)}
                            onClick={() => openEditModal(task)}
                            className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group hover:border-sky-300 dark:hover:border-sky-700 relative flex flex-col gap-2.5 ${
                              task.isOverdue
                                ? 'border-rose-300/80 dark:border-rose-800/80 bg-rose-50/20'
                                : 'border-slate-200/90 dark:border-slate-800'
                            }`}
                          >
                            {/* Card Top: Stage & Priority */}
                            <div className="flex items-center justify-between gap-1.5 text-[10px]">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold border ${stageInfo.color}`}
                              >
                                <StageIcon className="w-3 h-3 shrink-0" />
                                <span>{stageInfo.label}</span>
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-md font-extrabold border ${priorityInfo.badgeClass}`}
                              >
                                {priorityInfo.label}
                              </span>
                            </div>

                            {/* Card Title */}
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {task.title}
                            </h5>

                            {/* Card Description snippet */}
                            {task.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-normal leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            {/* Linked Research Context Badges */}
                            {(task.paperIds?.length > 0 ||
                              task.noteIds?.length > 0 ||
                              task.manuscriptSectionId ||
                              task.manuscriptId) && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold">
                                {task.paperIds?.length > 0 && (
                                  <Link
                                    to="/research/library"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 transition-colors"
                                    title="Open Research Library to view linked papers"
                                  >
                                    <BookOpen className="w-2.5 h-2.5" />
                                    <span>{task.paperIds.length} {task.paperIds.length === 1 ? 'paper' : 'papers'}</span>
                                  </Link>
                                )}

                                {task.noteIds?.length > 0 && (
                                  <Link
                                    to="/research/notebook"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 transition-colors"
                                    title="Open Research Notebook to view linked notes"
                                  >
                                    <FileText className="w-2.5 h-2.5" />
                                    <span>{task.noteIds.length} {task.noteIds.length === 1 ? 'note' : 'notes'}</span>
                                  </Link>
                                )}

                                {task.manuscriptSectionId && (
                                  <Link
                                    to="/research/write"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:underline"
                                    title="Navigate to Writing Workspace for this section"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                    <span>
                                      {typeof task.manuscriptSectionId === 'object'
                                        ? task.manuscriptSectionId.title
                                        : 'Section draft'}
                                    </span>
                                  </Link>
                                )}
                              </div>
                            )}

                            {/* Card Footer: Due Date & Assignee */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold">
                              {/* Due Date Indicator */}
                              {task.dueDate ? (
                                <div
                                  className={`inline-flex items-center gap-1 ${
                                    task.isOverdue
                                      ? 'text-rose-600 font-extrabold'
                                      : isDone
                                      ? 'text-emerald-600 font-medium'
                                      : 'text-slate-500 font-medium'
                                  }`}
                                >
                                  {task.isOverdue ? (
                                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                                  ) : isDone ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-slate-400" />
                                  )}
                                  <span>
                                    {task.isOverdue
                                      ? 'Overdue'
                                      : `Due ${new Date(task.dueDate).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                        })}`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px]">No due date</span>
                              )}

                              {/* Assignee Avatar / Name */}
                              {assigneeName ? (
                                <div
                                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-bold"
                                  title={`Assigned to ${assigneeName}`}
                                >
                                  <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white text-[9px] flex items-center justify-center uppercase font-black shrink-0">
                                    {assigneeName.charAt(0)}
                                  </span>
                                  <span className="truncate max-w-[85px]">{assigneeName}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px] italic">Unassigned</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CREATE & EDIT TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Research Task' : 'Edit Research Task'}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Project Reference (Read-only active project) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Research Project
            </label>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700">
              <FolderKanban className="w-4 h-4 text-sky-500" />
              <span>{activeProject?.title || 'No project selected'}</span>
            </div>
          </div>

          {/* Task Title (Required) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Task Title <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Compare iris segmentation methodologies"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Two-Column: Status & Research Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status (Required) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Kanban Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Research Stage (Required) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Research Stage <span className="text-rose-500">*</span>
              </label>
              <select
                value={formStage}
                onChange={(e) => setFormStage(e.target.value as ResearchStage)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                {Object.entries(STAGE_CONFIG).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Two-Column: Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          </div>

          {/* Assignee Selection (Strictly project collaborators) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Collaborator</span>
              </span>
              {currentProfileId && (
                <button
                  type="button"
                  onClick={() => setFormAssigneeId(currentProfileId)}
                  className="text-[10px] text-sky-600 dark:text-sky-400 font-extrabold hover:underline cursor-pointer"
                >
                  Assign to me
                </button>
              )}
            </label>
            <select
              value={formAssigneeId}
              onChange={(e) => setFormAssigneeId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">
              Only verified members and collaborators on this project can be assigned.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Description & Notes
            </label>
            <textarea
              rows={3}
              placeholder="Outline steps, benchmarks, or specific criteria..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* RESEARCH EVIDENCE & WRITING LINKAGES */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Link Research Context
            </p>

            {/* Related Literature Papers */}
            {projectDetail?.paperIds && projectDetail.paperIds.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Related Papers ({formPaperIds.length} selected)
                </label>
                <div className="max-h-24 overflow-y-auto space-y-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  {projectDetail.paperIds.map((paper: any) => {
                    const pId = paper.id || paper._id;
                    const selected = formPaperIds.includes(pId);
                    return (
                      <label
                        key={pId}
                        className="flex items-center gap-2 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormPaperIds([...formPaperIds, pId]);
                            } else {
                              setFormPaperIds(formPaperIds.filter((id) => id !== pId));
                            }
                          }}
                          className="rounded text-sky-600"
                        />
                        <span className="truncate">{paper.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Research Notes */}
            {projectNotes.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Related Notes ({formNoteIds.length} selected)
                </label>
                <div className="max-h-24 overflow-y-auto space-y-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  {projectNotes.map((note) => {
                    const nId = note.id || note._id!;
                    const selected = formNoteIds.includes(nId);
                    return (
                      <label
                        key={nId}
                        className="flex items-center gap-2 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormNoteIds([...formNoteIds, nId]);
                            } else {
                              setFormNoteIds(formNoteIds.filter((id) => id !== nId));
                            }
                          }}
                          className="rounded text-sky-600"
                        />
                        <span className="truncate">
                          [{note.noteType || 'Note'}] {note.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Manuscript & Section */}
            {projectManuscripts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Target Manuscript
                  </label>
                  <select
                    value={formManuscriptId}
                    onChange={(e) => {
                      setFormManuscriptId(e.target.value);
                      setFormSectionId('');
                    }}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                  >
                    <option value="">None</option>
                    {projectManuscripts.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Target Section
                  </label>
                  <select
                    value={formSectionId}
                    disabled={!formManuscriptId}
                    onChange={(e) => setFormSectionId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] disabled:opacity-50"
                  >
                    <option value="">None</option>
                    {availableManuscriptSections.map((sec: any) => (
                      <option key={sec._id || sec.id} value={sec._id || sec.id}>
                        {sec.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {modalMode === 'edit' ? (
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={modalSaving}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={modalSaving}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={modalSaving}>
                {modalMode === 'create' ? 'Create Task' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
