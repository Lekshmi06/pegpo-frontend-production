import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  Users,
  Target,
  FileText,
  BookOpen,
  Edit3,
  ExternalLink,
  Filter,
  Search,
  Layers,
  MapPin,
  Trash2,
  X,
  CheckSquare,
  List,
  Grid,
  Sparkles,
} from 'lucide-react';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';
import { researchService } from '../../services/researchService';
import {
  ResearchCalendarEvent,
  ResearchCalendarEventType,
  ResearchCalendarItem,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  ResearchTask,
  TaskStatus,
  ResearchStage,
  TaskPriority,
  ResearchPaper,
} from '../../types/research';
import { PaperReaderModal } from '../../components/research/PaperReaderModal';
import { useToast } from '../../hooks/useToast';

// Event Type Metadata & Badge Config
const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; icon: any; bg: string; text: string; border: string; dot: string }
> = {
  task_deadline: {
    label: 'Task Deadline',
    icon: CheckSquare,
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-500',
  },
  milestone: {
    label: 'Research Milestone',
    icon: Target,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  meeting: {
    label: 'Research Meeting',
    icon: Users,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  deadline: {
    label: 'Submission Deadline',
    icon: AlertCircle,
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  other: {
    label: 'Project Event',
    icon: CalendarIcon,
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-500',
  },
};

const STAGE_LABELS: Record<string, string> = {
  literature_review: 'Literature Review',
  methodology: 'Methodology',
  data_collection: 'Data Collection',
  experiment: 'Experiment',
  analysis: 'Analysis',
  writing: 'Writing',
  review: 'Review',
  submission: 'Submission',
  other: 'Other',
};

const PRIORITY_BADGES: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300' },
  high: { label: 'High', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' },
  medium: { label: 'Medium', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300' },
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' },
};

type ViewMode = 'month' | 'agenda';
type QuickFilter =
  | 'all'
  | 'tasks'
  | 'milestones'
  | 'meetings'
  | 'deadlines'
  | 'overdue'
  | 'completed'
  | 'upcoming';

export default function ResearchCalendar() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    activeProject,
    activeProjectId,
    setActiveProjectId,
    allProjects,
  } = useResearchActiveProject();

  // Mode: single project vs all projects
  const [projectScope, setProjectScope] = useState<'active' | 'all'>('active');

  // Calendar Date Navigation
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Filters
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Raw data from backend
  const [calendarTasks, setCalendarTasks] = useState<ResearchTask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<ResearchCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Collaborators for assignee filtering & event modal
  const [teamMembers, setTeamMembers] = useState<
    Array<{ id: string; name: string; email?: string; role: string }>
  >([]);

  // Project tasks for linking in event modal
  const [availableTasks, setAvailableTasks] = useState<ResearchTask[]>([]);

  // Modals
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<ResearchCalendarItem | null>(null);
  const [selectedReaderPaper, setSelectedReaderPaper] = useState<ResearchPaper | null>(null);

  // Quick Due Date edit for tasks
  const [isEditingTaskDate, setIsEditingTaskDate] = useState(false);
  const [taskDateInput, setTaskDateInput] = useState('');

  // Event Form State
  const [eventForm, setEventForm] = useState<{
    title: string;
    type: ResearchCalendarEventType;
    startDate: string;
    endDate: string;
    allDay: boolean;
    description: string;
    location: string;
    assigneeId: string;
    relatedTaskId: string;
    projectId: string;
  }>({
    title: '',
    type: 'milestone',
    startDate: '',
    endDate: '',
    allDay: false,
    description: '',
    location: '',
    assigneeId: '',
    relatedTaskId: '',
    projectId: activeProjectId || '',
  });

  // Query parameter handling
  useEffect(() => {
    const pId = searchParams.get('projectId');
    if (pId && pId !== activeProjectId) {
      setActiveProjectId(pId);
      setProjectScope('active');
    }
  }, [searchParams, activeProjectId, setActiveProjectId]);

  // Load team collaborators & project tasks
  useEffect(() => {
    if (!activeProjectId) return;

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
            const resObj =
              typeof c.researcherId === 'object' && c.researcherId !== null
                ? (c.researcherId as any)
                : null;
            const rId = resObj ? resObj._id || resObj.id : c.researcherId;
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

    // Load available tasks for dropdown linking
    researchService
      .listProjectTasks(activeProjectId)
      .then((tasks: ResearchTask[]) => setAvailableTasks(tasks))
      .catch(() => {});
  }, [activeProjectId]);

  // Fetch combined calendar data (tasks with due dates + events)
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      if (projectScope === 'all') {
        const data = await researchService.getAllProjectsCalendar();
        setCalendarTasks(data.tasks || []);
        setCalendarEvents(data.events || []);
      } else if (activeProjectId) {
        const data = await researchService.getProjectCalendar(activeProjectId);
        setCalendarTasks(data.tasks || []);
        setCalendarEvents(data.events || []);
      } else {
        setCalendarTasks([]);
        setCalendarEvents([]);
      }
    } catch (err: any) {
      console.warn('Failed to load calendar data:', err);
      toast.error('Could not load research calendar items.');
    } finally {
      setLoading(false);
    }
  }, [activeProjectId, projectScope, toast]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Normalize Tasks & Events into a unified ResearchCalendarItem collection
  const allCalendarItems: ResearchCalendarItem[] = useMemo(() => {
    const items: ResearchCalendarItem[] = [];

    // 1. Convert Tasks with due dates
    calendarTasks.forEach((task) => {
      if (!task.dueDate) return;
      const dueDateObj = new Date(task.dueDate);
      if (isNaN(dueDateObj.getTime())) return;

      const isOverdue =
        dueDateObj.getTime() < Date.now() && task.status !== 'done';

      const pTitle =
        typeof (task as any).projectId === 'object'
          ? (task as any).projectId?.title
          : activeProject?.title || 'Active Project';

      items.push({
        id: `task_${task.id || task._id}`,
        sourceType: 'task',
        title: task.title,
        description: task.description,
        start: dueDateObj,
        allDay: true,
        projectId:
          typeof (task as any).projectId === 'object'
            ? (task as any).projectId?._id
            : String(task.projectId),
        projectTitle: pTitle,
        eventType: 'task_deadline',
        status: task.status,
        priority: task.priority,
        researchStage: task.researchStage,
        completedAt: task.completedAt,
        isOverdue,
        assignee:
          typeof task.assigneeId === 'object' && task.assigneeId !== null
            ? (task.assigneeId as any)
            : undefined,
        assigneeId:
          typeof task.assigneeId === 'object' && task.assigneeId !== null
            ? (task.assigneeId as any)._id
            : typeof task.assigneeId === 'string'
            ? task.assigneeId
            : undefined,
        paperIds: task.paperIds,
        noteIds: task.noteIds,
        manuscriptId: task.manuscriptId,
        manuscriptSectionId: task.manuscriptSectionId,
        rawTask: task,
      });
    });

    // 2. Convert Standalone Events
    calendarEvents.forEach((event) => {
      const startObj = new Date(event.startDate);
      if (isNaN(startObj.getTime())) return;
      const endObj = event.endDate ? new Date(event.endDate) : undefined;

      const pTitle =
        typeof event.projectId === 'object' && event.projectId !== null
          ? (event.projectId as any).title
          : activeProject?.title || 'Active Project';

      const pId =
        typeof event.projectId === 'object' && event.projectId !== null
          ? (event.projectId as any)._id
          : String(event.projectId);

      items.push({
        id: `event_${event.id || event._id}`,
        sourceType: 'event',
        title: event.title,
        description: event.description,
        start: startObj,
        end: endObj,
        allDay: Boolean(event.allDay),
        projectId: pId,
        projectTitle: pTitle,
        eventType: event.type,
        location: event.location,
        assignee:
          typeof event.assigneeId === 'object' && event.assigneeId !== null
            ? (event.assigneeId as any)
            : undefined,
        assigneeId:
          typeof event.assigneeId === 'object' && event.assigneeId !== null
            ? (event.assigneeId as any)._id
            : typeof event.assigneeId === 'string'
            ? event.assigneeId
            : undefined,
        relatedTaskId:
          typeof event.relatedTaskId === 'object' && event.relatedTaskId !== null
            ? (event.relatedTaskId as any)._id
            : typeof event.relatedTaskId === 'string'
            ? event.relatedTaskId
            : undefined,
        paperIds: event.relatedPaperIds as any,
        noteIds: event.relatedNoteIds as any,
        manuscriptId: event.relatedManuscriptId as any,
        rawEvent: event,
      });
    });

    return items;
  }, [calendarTasks, calendarEvents, activeProject]);

  // Apply User Filters
  const filteredItems = useMemo(() => {
    return allCalendarItems.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }

      // 2. Assignee Filter
      if (selectedAssignee !== 'all') {
        if (item.assigneeId !== selectedAssignee) return false;
      }

      // 3. Stage Filter
      if (selectedStage !== 'all') {
        if (item.researchStage !== selectedStage) return false;
      }

      // 4. Quick Filters
      const now = new Date();
      if (quickFilter === 'tasks') {
        if (item.sourceType !== 'task') return false;
      } else if (quickFilter === 'milestones') {
        if (item.eventType !== 'milestone') return false;
      } else if (quickFilter === 'meetings') {
        if (item.eventType !== 'meeting') return false;
      } else if (quickFilter === 'deadlines') {
        if (item.eventType !== 'deadline' && item.eventType !== 'task_deadline')
          return false;
      } else if (quickFilter === 'overdue') {
        if (!item.isOverdue) return false;
      } else if (quickFilter === 'completed') {
        if (item.status !== 'done' && !item.completedAt) return false;
      } else if (quickFilter === 'upcoming') {
        if (item.start.getTime() < now.getTime() && !item.isOverdue) return false;
      }

      return true;
    });
  }, [allCalendarItems, searchQuery, selectedAssignee, selectedStage, quickFilter]);

  // Month Grid Calculations
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      items: ResearchCalendarItem[];
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        items: [],
      });
    }

    const todayStr = new Date().toDateString();

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.toDateString() === todayStr,
        items: [],
      });
    }

    // Next month padding to fill a 35 or 42 grid
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        items: [],
      });
    }

    // Attach items to days
    days.forEach((cell) => {
      const cellDateStr = cell.date.toDateString();
      cell.items = filteredItems.filter((item) => {
        return item.start.toDateString() === cellDateStr;
      });
    });

    return days;
  }, [currentDate, filteredItems]);

  // Navigate Calendar Months
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open Create Event Modal
  const handleOpenCreateEvent = (presetDate?: Date) => {
    const defaultDateStr = presetDate
      ? presetDate.toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    setEditingEventId(null);
    setEventForm({
      title: '',
      type: 'milestone',
      startDate: defaultDateStr,
      endDate: '',
      allDay: false,
      description: '',
      location: '',
      assigneeId: '',
      relatedTaskId: '',
      projectId: activeProjectId || '',
    });
    setIsAddEventModalOpen(true);
  };

  // Open Edit Event Modal
  const handleOpenEditEvent = (item: ResearchCalendarItem) => {
    if (item.sourceType !== 'event' || !item.rawEvent) return;
    const ev = item.rawEvent;
    setEditingEventId(ev._id || ev.id);
    setEventForm({
      title: ev.title,
      type: ev.type,
      startDate: new Date(ev.startDate).toISOString().slice(0, 16),
      endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
      allDay: Boolean(ev.allDay),
      description: ev.description || '',
      location: ev.location || '',
      assigneeId:
        typeof ev.assigneeId === 'object' && ev.assigneeId !== null
          ? (ev.assigneeId as any)._id
          : typeof ev.assigneeId === 'string'
          ? ev.assigneeId
          : '',
      relatedTaskId:
        typeof ev.relatedTaskId === 'object' && ev.relatedTaskId !== null
          ? (ev.relatedTaskId as any)._id
          : typeof ev.relatedTaskId === 'string'
          ? ev.relatedTaskId
          : '',
      projectId:
        typeof ev.projectId === 'object' && ev.projectId !== null
          ? (ev.projectId as any)._id
          : String(ev.projectId),
    });
    setSelectedItemDetail(null);
    setIsAddEventModalOpen(true);
  };

  // Submit Create or Edit Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (!eventForm.startDate) {
      toast.error('Event start date is required');
      return;
    }

    const targetProjectId = eventForm.projectId || activeProjectId;
    if (!targetProjectId) {
      toast.error('Please select a research project for this event.');
      return;
    }

    try {
      if (editingEventId) {
        const updatePayload: UpdateCalendarEventInput = {
          title: eventForm.title.trim(),
          type: eventForm.type,
          startDate: eventForm.startDate,
          endDate: eventForm.endDate || null,
          allDay: eventForm.allDay,
          description: eventForm.description.trim(),
          location: eventForm.location.trim() || null,
          assigneeId: eventForm.assigneeId || null,
          relatedTaskId: eventForm.relatedTaskId || null,
        };
        await researchService.updateCalendarEvent(editingEventId, updatePayload);
        toast.success('Calendar event updated successfully.');
      } else {
        const createPayload: CreateCalendarEventInput = {
          title: eventForm.title.trim(),
          type: eventForm.type,
          startDate: eventForm.startDate,
          endDate: eventForm.endDate || undefined,
          allDay: eventForm.allDay,
          description: eventForm.description.trim(),
          location: eventForm.location.trim() || undefined,
          assigneeId: eventForm.assigneeId || undefined,
          relatedTaskId: eventForm.relatedTaskId || undefined,
        };
        await researchService.createCalendarEvent(targetProjectId, createPayload);
        toast.success('New research event added to calendar.');
      }

      setIsAddEventModalOpen(false);
      fetchCalendarData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save event');
    }
  };

  // Delete Standalone Event
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to remove this calendar event?')) return;
    try {
      await researchService.deleteCalendarEvent(eventId);
      toast.success('Calendar event removed.');
      setSelectedItemDetail(null);
      fetchCalendarData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete event');
    }
  };

  // Quick Task Due Date Edit from Calendar
  const handleUpdateTaskDueDate = async () => {
    if (!selectedItemDetail || selectedItemDetail.sourceType !== 'task' || !selectedItemDetail.rawTask)
      return;
    if (!taskDateInput) {
      toast.error('Please pick a valid due date.');
      return;
    }

    const taskId = selectedItemDetail.rawTask._id || selectedItemDetail.rawTask.id;
    try {
      await researchService.updateTask(taskId, {
        dueDate: new Date(taskDateInput).toISOString(),
      });
      toast.success('Task due date updated on Kanban and Calendar.');
      setIsEditingTaskDate(false);
      setSelectedItemDetail(null);
      fetchCalendarData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task deadline');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7fb] text-slate-800 flex flex-col">
      {/* 1. Header Bar */}
      <div className="bg-white border-b border-[#d6e4f0] px-6 py-5 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eaf3fb] border border-[#d6e4f0] text-[#1c75bc] flex items-center justify-center shadow-xs">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Research Calendar & Timeline</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#eaf3fb] text-[#1c75bc] border border-[#d6e4f0]">
                    Chronological View
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {projectScope === 'all'
                    ? 'Displaying tasks, milestones, and meetings across all accessible projects'
                    : activeProject
                    ? `Execution timeline for ${activeProject.title}`
                    : 'Select a research project to inspect its scheduled timeline'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Actions: Project Scope + Add Event + Kanban link */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Project Selector / Scope Switcher */}
            <div className="flex items-center rounded-2xl bg-[#f0f5fa] border border-[#d6e4f0] p-1">
              <button
                onClick={() => setProjectScope('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  projectScope === 'active'
                    ? 'bg-[#1c75bc] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Project
              </button>
              <button
                onClick={() => setProjectScope('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  projectScope === 'all'
                    ? 'bg-[#1c75bc] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Projects
              </button>
            </div>

            {/* Active Project Dropdown if in active mode */}
            {projectScope === 'active' && allProjects && allProjects.length > 0 && (
              <select
                value={activeProjectId || ''}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-white border border-[#d6e4f0] text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 outline-none focus:border-[#1c75bc] transition-colors max-w-[200px] truncate shadow-xs"
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.title}
                  </option>
                ))}
              </select>
            )}

            {/* Add Event Button */}
            <button
              onClick={() => handleOpenCreateEvent()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1c75bc] hover:bg-[#1664a3] text-white font-bold text-xs transition-all shadow-md shadow-[#1c75bc]/20 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>

            {/* Kanban Execution Board Link */}
            <button
              onClick={() =>
                navigate(
                  activeProjectId
                    ? `/research/kanban?projectId=${activeProjectId}`
                    : '/research/kanban'
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-[#d6e4f0] text-xs font-semibold transition-colors shadow-xs"
              title="Switch to Kanban board view"
            >
              <CheckSquare className="w-4 h-4 text-[#1c75bc]" />
              <span>Open Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Calendar Controls & Navigation Bar */}
      <div className="bg-white border-b border-[#e2edf6] px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#f0f5fa] border border-[#d6e4f0] rounded-xl p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>

            {/* Overdue Badge in Header if any */}
            {allCalendarItems.some((i) => i.isOverdue) && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                <AlertCircle className="w-3 h-3" />
                <span>
                  {allCalendarItems.filter((i) => i.isOverdue).length} Overdue
                </span>
              </span>
            )}
          </div>

          {/* Right Toolbar: View Switcher (Month vs Agenda) + Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks, meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#f0f5fa] border border-[#d6e4f0] text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-full w-48 focus:w-60 focus:border-[#1c75bc] outline-none transition-all"
              />
            </div>

            <div className="flex items-center rounded-xl bg-[#f0f5fa] border border-[#d6e4f0] p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'month'
                    ? 'bg-white text-[#1c75bc] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-white text-[#1c75bc] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Chips & Stage / Assignee Filters */}
      <div className="bg-[#eaf3fb] border-b border-[#d6e4f0] px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'tasks', label: 'Task Deadlines' },
              { id: 'milestones', label: 'Milestones' },
              { id: 'meetings', label: 'Meetings' },
              { id: 'deadlines', label: 'Deadlines' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setQuickFilter(f.id as QuickFilter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  quickFilter === f.id
                    ? 'bg-[#1c75bc] text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-[#d6e4f0]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex items-center gap-2 text-xs">
            {/* Assignee Filter */}
            {teamMembers.length > 0 && (
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="bg-white border border-[#d6e4f0] text-xs text-slate-700 rounded-lg px-2.5 py-1 outline-none focus:border-[#1c75bc]"
              >
                <option value="all">All Collaborators</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            {/* Research Stage Filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-white border border-[#d6e4f0] text-xs text-slate-700 rounded-lg px-2.5 py-1 outline-none focus:border-[#1c75bc]"
            >
              <option value="all">All Research Stages</option>
              {Object.entries(STAGE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Calendar Content Area */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#1c75bc] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Synchronizing research tasks, deadlines, and project milestones...
            </p>
          </div>
        ) : viewMode === 'month' ? (
          /* MONTH VIEW MATRIX */
          <div className="bg-white border border-[#d6e4f0] rounded-2xl overflow-hidden shadow-xs">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-[#d6e4f0] bg-[#eaf3fb] text-center text-xs font-bold text-slate-600 py-2.5 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#e2edf6]">
              {calendarDays.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenCreateEvent(cell.date)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    cell.isCurrentMonth
                      ? 'bg-white hover:bg-[#f0f7fd]'
                      : 'bg-[#f8fafd] text-slate-400'
                  } ${cell.isToday ? 'ring-2 ring-[#1c75bc] ring-inset' : ''}`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-[#1c75bc] text-white font-black shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-700 group-hover:text-[#1c75bc]'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {cell.items.length > 0 && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {cell.items.length} {cell.items.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>

                  {/* Day Events Container */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-none">
                    {cell.items.slice(0, 3).map((item) => {
                      const cfg =
                        EVENT_TYPE_CONFIG[item.eventType] || EVENT_TYPE_CONFIG.other;
                      const Icon = cfg.icon;
                      const isDone = item.status === 'done' || Boolean(item.completedAt);

                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemDetail(item);
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all truncate hover:brightness-125 ${
                            cfg.bg
                          } ${cfg.text} ${
                            item.isOverdue
                              ? 'border-rose-500/60 shadow-xs shadow-rose-500/20'
                              : cfg.border
                          } ${isDone ? 'opacity-60 line-through' : ''}`}
                          title={`${cfg.label}: ${item.title}`}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <span className="truncate flex-1">{item.title}</span>
                          {item.priority && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                item.priority === 'urgent'
                                  ? 'bg-rose-400'
                                  : item.priority === 'high'
                                  ? 'bg-amber-400'
                                  : 'bg-sky-400'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}

                    {cell.items.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewMode('agenda');
                          setCurrentDate(cell.date);
                        }}
                        className="text-[10px] text-purple-400 hover:underline block font-bold pt-0.5 text-left"
                      >
                        +{cell.items.length - 3} more items
                      </button>
                    )}
                  </div>

                  <div className="h-0.5" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* AGENDA / LIST VIEW */
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="bg-white border border-[#d6e4f0] rounded-2xl p-12 text-center space-y-3 shadow-xs">
                <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No research activities scheduled
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {quickFilter !== 'all'
                    ? `No calendar items match the '${quickFilter}' filter.`
                    : 'Schedule your research milestones, experiments, and supervisor meetings or assign due dates to Kanban tasks.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handleOpenCreateEvent()}
                    className="px-4 py-2 rounded-xl bg-[#1c75bc] hover:bg-[#1664a3] text-white font-bold text-xs transition-colors"
                  >
                    + Add Research Event
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        activeProjectId
                          ? `/research/kanban?projectId=${activeProjectId}`
                          : '/research/kanban'
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#d6e4f0] text-xs font-semibold"
                  >
                    Open Kanban Tasks
                  </button>
                </div>
              </div>
            ) : (
              filteredItems
                .sort((a, b) => a.start.getTime() - b.start.getTime())
                .map((item) => {
                  const cfg =
                    EVENT_TYPE_CONFIG[item.eventType] || EVENT_TYPE_CONFIG.other;
                  const Icon = cfg.icon;
                  const isDone = item.status === 'done' || Boolean(item.completedAt);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemDetail(item)}
                      className="bg-white border border-[#d6e4f0] hover:border-[#1c75bc] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl ${cfg.bg} border ${cfg.border} ${cfg.text} flex items-center justify-center shrink-0 mt-0.5`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                            >
                              {cfg.label}
                            </span>

                            {item.researchStage && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f0f5fa] text-slate-600 border border-[#d6e4f0]">
                                {STAGE_LABELS[item.researchStage] || item.researchStage}
                              </span>
                            )}

                            {item.priority && PRIORITY_BADGES[item.priority] && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  PRIORITY_BADGES[item.priority].color
                                }`}
                              >
                                {PRIORITY_BADGES[item.priority].label}
                              </span>
                            )}

                            {item.isOverdue && (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                                Overdue
                              </span>
                            )}

                            {isDone && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Done</span>
                              </span>
                            )}
                          </div>

                          <h3
                            className={`text-sm md:text-base font-bold text-slate-900 group-hover:text-[#1c75bc] transition-colors ${
                              isDone ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {/* Artifacts badges */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-medium">
                            {item.paperIds && item.paperIds.length > 0 && (
                              <span className="flex items-center gap-1 text-sky-400">
                                <BookOpen className="w-3 h-3" />
                                <span>{item.paperIds.length} Papers</span>
                              </span>
                            )}
                            {item.noteIds && item.noteIds.length > 0 && (
                              <span className="flex items-center gap-1 text-amber-400">
                                <FileText className="w-3 h-3" />
                                <span>{item.noteIds.length} Notes</span>
                              </span>
                            )}
                            {item.manuscriptId && (
                              <span className="flex items-center gap-1 text-purple-400">
                                <Edit3 className="w-3 h-3" />
                                <span>Manuscript Section</span>
                              </span>
                            )}
                            {item.location && (
                              <span className="flex items-center gap-1 text-slate-300">
                                <MapPin className="w-3 h-3 text-rose-400" />
                                <span>{item.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Details: Date, Time & Project */}
                      <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 shrink-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                          <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span>{item.start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {!item.allDay && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{item.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[160px]">
                          {item.projectTitle}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>

      {/* 5. Add / Edit Standalone Event Modal */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#d6e4f0] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#d6e4f0] flex items-center justify-between bg-[#f8fafd]">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#1c75bc]" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingEventId ? 'Edit Research Event' : 'Add Research Event'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Methodology Defense, Weekly Lab Sync, Paper Submission"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-[#1c75bc] outline-none"
                />
              </div>

              {/* Event Type & Project Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Event Type *
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        type: e.target.value as ResearchCalendarEventType,
                      })
                    }
                    className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#1c75bc]"
                  >
                    <option value="milestone">📍 Research Milestone</option>
                    <option value="meeting">👥 Research Meeting</option>
                    <option value="deadline">📝 Submission Deadline</option>
                    <option value="other">📌 Other Project Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Research Project *
                  </label>
                  <select
                    value={eventForm.projectId}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, projectId: e.target.value })
                    }
                    className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#1c75bc] truncate"
                  >
                    {allProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates & All Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.startDate}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, startDate: e.target.value })
                    }
                    className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1c75bc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.endDate}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, endDate: e.target.value })
                    }
                    className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1c75bc]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDayCheckbox"
                  checked={eventForm.allDay}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, allDay: e.target.checked })
                  }
                  className="rounded border-[#d6e4f0] text-[#1c75bc] focus:ring-[#1c75bc] h-4 w-4 bg-white"
                />
                <label
                  htmlFor="allDayCheckbox"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  All-day event / Full day milestone
                </label>
              </div>

              {/* Location or Meeting link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lab Room 302 or https://meet.google.com/..."
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, location: e.target.value })
                  }
                  className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-[#1c75bc]"
                />
              </div>

              {/* Assignee / Lead */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Assignee / Session Lead
                </label>
                <select
                  value={eventForm.assigneeId}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, assigneeId: e.target.value })
                  }
                  className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#1c75bc]"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Link to existing Research Task if relevant */}
              {availableTasks.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Related Kanban Task
                  </label>
                  <select
                    value={eventForm.relatedTaskId}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, relatedTaskId: e.target.value })
                    }
                    className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#1c75bc] truncate"
                  >
                    <option value="">None (Independent Event)</option>
                    {availableTasks.map((t) => (
                      <option key={t.id || (t as any)._id} value={t.id || (t as any)._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description / Agenda Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key discussion items, objectives, or instructions..."
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  className="w-full bg-[#f8fafd] border border-[#d6e4f0] rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-[#1c75bc]"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-[#d6e4f0] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#d6e4f0] hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1c75bc] hover:bg-[#1664a3] text-white text-xs font-bold transition-all shadow-md shadow-[#1c75bc]/20"
                >
                  {editingEventId ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Item Details Modal (For Tasks & Standalone Events) */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#d6e4f0] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#d6e4f0] flex items-center justify-between bg-[#f8fafd]">
              <div className="flex items-center gap-2">
                {(() => {
                  const cfg =
                    EVENT_TYPE_CONFIG[selectedItemDetail.eventType] ||
                    EVENT_TYPE_CONFIG.other;
                  const Icon = cfg.icon;
                  return (
                    <div
                      className={`w-7 h-7 rounded-lg ${cfg.bg} border ${cfg.border} ${cfg.text} flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  );
                })()}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1c75bc] block">
                    {EVENT_TYPE_CONFIG[selectedItemDetail.eventType]?.label || 'Research Item'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedItemDetail.projectTitle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedItemDetail(null);
                  setIsEditingTaskDate(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedItemDetail.title}
              </h2>

              {/* Status / Priority Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedItemDetail.status && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f0f5fa] text-slate-700 border border-[#d6e4f0] capitalize">
                    Status: {selectedItemDetail.status.replace('_', ' ')}
                  </span>
                )}
                {selectedItemDetail.priority && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      PRIORITY_BADGES[selectedItemDetail.priority]?.color
                    }`}
                  >
                    Priority: {selectedItemDetail.priority}
                  </span>
                )}
                {selectedItemDetail.researchStage && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eaf3fb] text-[#1c75bc] border border-[#d6e4f0]">
                    Stage: {STAGE_LABELS[selectedItemDetail.researchStage]}
                  </span>
                )}
                {selectedItemDetail.isOverdue && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    Overdue
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedItemDetail.description && (
                <div className="p-3.5 rounded-xl bg-[#f8fafd] border border-[#d6e4f0] text-xs text-slate-700 leading-relaxed">
                  {selectedItemDetail.description}
                </div>
              )}

              {/* Date & Time info */}
              <div className="p-3.5 rounded-xl bg-[#f8fafd] border border-[#d6e4f0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Scheduled Date:</span>
                  <span className="text-slate-900 font-bold">
                    {selectedItemDetail.start.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {!selectedItemDetail.allDay && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Time:</span>
                    <span className="text-slate-900 font-bold">
                      {selectedItemDetail.start.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {selectedItemDetail.location && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Location:</span>
                    <span className="text-slate-900 font-medium">
                      {selectedItemDetail.location}
                    </span>
                  </div>
                )}
                {selectedItemDetail.assignee && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Assignee / Lead:</span>
                    <span className="text-slate-900 font-medium">
                      {selectedItemDetail.assignee.fullName || 'Project Researcher'}
                    </span>
                  </div>
                )}
              </div>

              {/* If Task: Quick Due Date Editor */}
              {selectedItemDetail.sourceType === 'task' && (
                <div className="p-3.5 rounded-xl bg-[#f0f5fa] border border-[#d6e4f0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Task Deadline Adjustment
                    </span>
                    {!isEditingTaskDate && (
                      <button
                        onClick={() => {
                          setIsEditingTaskDate(true);
                          setTaskDateInput(
                            selectedItemDetail.start.toISOString().slice(0, 10)
                          );
                        }}
                        className="text-xs font-bold text-[#1c75bc] hover:underline"
                      >
                        Change Due Date
                      </button>
                    )}
                  </div>

                  {isEditingTaskDate && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="date"
                        value={taskDateInput}
                        onChange={(e) => setTaskDateInput(e.target.value)}
                        className="bg-white border border-[#d6e4f0] text-xs text-slate-900 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1c75bc] flex-1"
                      />
                      <button
                        onClick={handleUpdateTaskDueDate}
                        className="px-3 py-1.5 rounded-lg bg-[#1c75bc] hover:bg-[#1664a3] text-white font-bold text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingTaskDate(false)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-[#d6e4f0] text-slate-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Research Linkages */}
              {selectedItemDetail.paperIds && selectedItemDetail.paperIds.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Linked Research Papers
                  </span>
                  <div className="space-y-1.5">
                    {selectedItemDetail.paperIds.map((p: any, idx) => {
                      const title = typeof p === 'object' ? p.title : `Paper Reference #${idx + 1}`;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafd] border border-[#d6e4f0] text-xs text-slate-800"
                        >
                          <span className="truncate pr-2">{title}</span>
                          {typeof p === 'object' && p._id && (
                            <button
                              onClick={() => setSelectedReaderPaper(p)}
                              className="text-[11px] font-bold text-[#1c75bc] hover:underline shrink-0 flex items-center gap-1"
                            >
                              <span>Read</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Linked Notes */}
              {selectedItemDetail.noteIds && selectedItemDetail.noteIds.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Linked Study Notes
                  </span>
                  <div className="space-y-1.5">
                    {selectedItemDetail.noteIds.map((n: any, idx) => {
                      const title = typeof n === 'object' ? n.title : `Research Note #${idx + 1}`;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafd] border border-[#d6e4f0] text-xs text-slate-800"
                        >
                          <span className="truncate pr-2">{title}</span>
                          <button
                            onClick={() => navigate('/research/notebook')}
                            className="text-[11px] font-bold text-amber-600 hover:underline shrink-0 flex items-center gap-1"
                          >
                            <span>Open Notebook</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Linked Manuscript */}
              {selectedItemDetail.manuscriptId && (
                <div className="p-2.5 rounded-lg bg-[#f8fafd] border border-[#d6e4f0] flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">
                    Linked Manuscript Section
                  </span>
                  <button
                    onClick={() => navigate('/research/write')}
                    className="text-xs font-bold text-[#1c75bc] hover:underline flex items-center gap-1"
                  >
                    <span>Open in Writing Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-[#d6e4f0] bg-[#f8fafd] flex items-center justify-between">
              {selectedItemDetail.sourceType === 'task' ? (
                <button
                  onClick={() =>
                    navigate(
                      selectedItemDetail.projectId
                        ? `/research/kanban?projectId=${selectedItemDetail.projectId}`
                        : '/research/kanban'
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#1c75bc] hover:bg-[#1664a3] text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Open in Kanban Board</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditEvent(selectedItemDetail)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#d6e4f0] text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#1c75bc]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedItemDetail.rawEvent) {
                        handleDeleteEvent(
                          selectedItemDetail.rawEvent._id ||
                            selectedItemDetail.rawEvent.id
                        );
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedItemDetail(null);
                  setIsEditingTaskDate(false);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#d6e4f0] hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Paper Reader Modal */}
      {selectedReaderPaper && (
        <PaperReaderModal
          isOpen={Boolean(selectedReaderPaper)}
          onClose={() => setSelectedReaderPaper(null)}
          paper={selectedReaderPaper}
        />
      )}
    </div>
  );
}
