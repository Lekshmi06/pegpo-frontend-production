import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Plus, X, CalendarDays, Settings, Bold, Italic, Underline, AlignLeft, AlignCenter, ListChecks, ListOrdered, List, PenLine, Eraser, Trash2, Edit3, CheckCircle2, Circle } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import TeacherCalendar from './TeacherCalendar';
import LessonPlanner from './LessonPlanner';
import TeacherClasses from './classes/TeacherClasses';
import TeacherUpload from './Upload';
import AssessmentStudio from './assessment/AssessmentStudio';
import { TeacherTask } from '../../types/teacherTask';
import { teacherTaskService } from '../../services/teacherTaskService';
import TeacherTaskModal from '../../components/teacher/TeacherTaskModal';

const workspaceTabs = ['Calendars Planers', 'Task List', 'Kanban board', 'Lesson Planers', 'Projects', 'Uploads'];
const subjectTabs = ['Subject', 'Classes', 'Lessons', 'Test', 'Quiz', 'Notes'];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('Calendars Planers');
  const [activeSubjectTab, setActiveSubjectTab] = useState('Subject');
  const [tasks, setTasks] = useState<TeacherTask[]>([]);
  const [taskComposerOpen, setTaskComposerOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TeacherTask | null>(null);
  const [taskName, setTaskName] = useState('');

  const hideSubjectRail = ['Task List', 'Kanban board', 'Projects', 'Uploads'].includes(activeTab);

  const loadTasks = useCallback(async () => {
    try {
      const fetched = await teacherTaskService.getTasks();
      setTasks(fetched);
    } catch (err) {
      console.warn('Failed to load tasks in dashboard:', err);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const handleUpdated = () => {
      loadTasks();
    };
    window.addEventListener('teacher-tasks-updated', handleUpdated);
    return () => {
      window.removeEventListener('teacher-tasks-updated', handleUpdated);
    };
  }, [loadTasks]);

  const addQuickTask = async (name: string, dueDate?: Date | null, taskType?: string) => {
    if (!name.trim()) return;
    try {
      const dateStr = dueDate ? dueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      await teacherTaskService.createTask({
        title: name.trim(),
        date: dateStr,
        taskType: (taskType as any) || 'General',
        priority: 'Normal',
        status: 'pending',
      });
      setTaskName('');
      setTaskComposerOpen(false);
    } catch (err) {
      console.error('Failed to create quick task:', err);
    }
  };

  const handleToggleStatus = async (task: TeacherTask) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await teacherTaskService.updateTask(task._id, { status: newStatus });
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await teacherTaskService.deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleSaveModal = async (data: any) => {
    if (editingTask?._id) {
      await teacherTaskService.updateTask(editingTask._id, data);
    } else {
      await teacherTaskService.createTask(data);
    }
  };

  const taskList = (
    <div className="bg-white p-4">
      <div className="flex h-14 items-center justify-between border-b border-[#d5e4f2] px-3">
        <span className="text-xs font-bold text-slate-500">
          Showing {tasks.length} task{tasks.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#214d7d] text-white hover:bg-[#173c63] rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => setTaskComposerOpen((v) => !v)}
            aria-label="Add task"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[#214d7d] hover:bg-slate-200 cursor-pointer"
            title="Toggle inline quick composer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[1.7fr_repeat(5,1fr)_48px] items-center border-b border-[#c8dced] px-3 py-3 text-[14px] text-[#4d596d] font-bold">
        <span className="flex items-center gap-2 font-extrabold text-[#202938]">
          <ChevronDown className="h-4 w-4 text-[#214d7d]" />
          Task.active
        </span>
        <span>Status</span>
        <span>Type</span>
        <span>Due date</span>
        <span>Priority</span>
        <span>Assignee</span>
        <span></span>
      </div>
      {taskComposerOpen && (
        <TaskListComposer
          name={taskName}
          setName={setTaskName}
          close={() => setTaskComposerOpen(false)}
          save={addQuickTask}
        />
      )}
      {tasks.length === 0 && !taskComposerOpen && (
        <div className="p-8 text-center text-slate-400 text-xs font-medium">
          No tasks found. Click &ldquo;Add Task&rdquo; to create your first task.
        </div>
      )}
      {tasks.map((task) => {
        const classSectionName = typeof task.classSectionId === 'object' && task.classSectionId?.name
          ? task.classSectionId.name
          : '—';

        return (
          <div
            key={task._id}
            className="grid grid-cols-[1.7fr_repeat(5,1fr)_48px] items-center border-b border-[#edf3f8] px-3 py-3 text-xs text-[#526076] hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-2 pr-2">
              <button
                onClick={() => handleToggleStatus(task)}
                className="text-slate-400 hover:text-[#214d7d] transition-colors cursor-pointer shrink-0"
                title={task.status === 'completed' ? 'Mark pending' : 'Mark completed'}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" />
                )}
              </button>
              <span
                onClick={() => {
                  setEditingTask(task);
                  setTaskModalOpen(true);
                }}
                className={`font-semibold cursor-pointer truncate hover:text-[#214d7d] ${
                  task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
                title={task.title}
              >
                {task.title}
              </span>
            </div>
            <div>
              <span
                onClick={() => handleToggleStatus(task)}
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  task.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : task.status === 'in_progress'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
            <span>{task.taskType || 'General'}</span>
            <span>{task.date || '—'}</span>
            <div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                task.priority === 'Urgent'
                  ? 'bg-rose-100 text-rose-700 font-bold'
                  : task.priority === 'High'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-slate-600'
              }`}>
                {task.priority || 'Normal'}
              </span>
            </div>
            <span className="truncate" title={classSectionName}>{classSectionName}</span>
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => {
                  setEditingTask(task);
                  setTaskModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-[#214d7d] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="Edit task"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
      <button
        onClick={() => {
          setEditingTask(null);
          setTaskModalOpen(true);
        }}
        className="flex items-center gap-2 px-6 py-5 text-sm text-[#536177] hover:text-[#214d7d] font-bold cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Create task
      </button>

      {/* Task Creation & Edit Modal */}
      <TeacherTaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={handleDeleteTask}
        task={editingTask}
      />
    </div>
  );

  const content =
    activeSubjectTab === 'Classes' ? (
      <TeacherClasses />
    ) : activeSubjectTab === 'Lessons' ? (
      <LessonPlanner />
    ) : activeSubjectTab === 'Test' || activeSubjectTab === 'Quiz' ? (
      <AssessmentStudio />
    ) : activeSubjectTab === 'Notes' ? (
      <ProjectWorkspace />
    ) : activeTab === 'Task List' ? (
      taskList
    ) : activeTab === 'Kanban board' ? (
      <KanbanBoard />
    ) : activeTab === 'Calendars Planers' ? (
      <TeacherCalendar />
    ) : activeTab === 'Lesson Planers' ? (
      <LessonPlanner />
    ) : activeTab === 'Projects' ? (
      <ProjectWorkspace />
    ) : activeTab === 'Uploads' ? (
      <TeacherUpload />
    ) : null;

  return (
    <div className="flex h-full min-h-[600px] bg-[#f8fcff]">
      {!hideSubjectRail && (
        <nav className="w-36 shrink-0 bg-[#d6e8f6] p-3 space-y-2 select-none border-r border-[#cbe2fc] hidden sm:block">
          {subjectTabs.map((tab) => {
            const isSelected = activeSubjectTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubjectTab(tab)}
                className={`w-full rounded-xl p-2.5 text-left text-xs transition-all cursor-pointer ${
                  isSelected ? 'bg-white font-extrabold text-[#1c3352] shadow-2xs' : 'text-slate-700 font-semibold hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#d6e8f6] px-4 py-3 border-b border-[#cbe2fc]">
          {workspaceTabs.map((tab) => {
            const isSelected = activeTab === tab && activeSubjectTab === 'Subject';
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveSubjectTab('Subject');
                }}
                className={`flex-1 min-h-[44px] rounded-2xl px-3 py-2 text-xs text-center font-extrabold transition-all cursor-pointer shadow-2xs ${
                  isSelected ? 'bg-white text-[#1c3352] ring-2 ring-[#0091ff]/30' : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#f8fcff]">{content}</div>
      </div>
    </div>
  );
}

interface TaskListComposerProps {
  name: string;
  setName: (v: string) => void;
  close: () => void;
  save: (name: string, dueDate?: Date | null, taskType?: string) => void;
}

function TaskListComposer({ name, setName, close, save }: TaskListComposerProps) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [type, setType] = useState('Operational');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const taskTypes = [
    ['Operational', '#d9eaf7'],
    ['Technical', '#f2d36b'],
    ['Strategic', '#d8facd'],
    ['Hiring', '#ffb9b5'],
    ['Financial', '#d9d9d9'],
  ] as const;

  return (
    <div className="relative mx-3 mt-7 flex flex-wrap items-center gap-3 rounded-md bg-[#d6e8f6] px-4 py-4 text-[#536177]">
      <button
        onClick={close}
        aria-label="Close task composer"
        className="absolute -right-2 -top-2 rounded-full bg-[#aabfd0] p-1 text-[#214d7d]"
      >
        <X className="h-4 w-4" />
      </button>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Task name"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#536177]"
      />
      <button
        onClick={() => {
          setTypeMenuOpen((v) => !v);
          setCalendarOpen(false);
        }}
        aria-label="Task type"
        className="rounded-full border border-[#214d7d] p-1 cursor-pointer"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          setCalendarOpen((v) => !v);
          setTypeMenuOpen(false);
        }}
        aria-label="Due date"
        className={`rounded-full border p-1 cursor-pointer ${dueDate ? 'border-[#4383d5] bg-[#4383d5] text-white' : 'border-[#214d7d]'}`}
      >
        <CalendarDays className="h-4 w-4" />
      </button>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4383d5] text-sm text-white">K</span>
      <button onClick={() => save(name, dueDate, type)} className="rounded-xl bg-[#214d7d] px-4 py-1.5 text-sm text-white font-bold cursor-pointer">
        Save
      </button>
      {typeMenuOpen && (
        <div className="absolute right-24 top-[calc(100%+8px)] z-30 w-44 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          {taskTypes.map(([label, color]) => (
            <button
              key={label}
              onClick={() => {
                setType(label);
                setTypeMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded px-1 py-2 text-left text-sm text-[#536177] ${
                type === label ? 'bg-slate-50' : 'hover:bg-slate-50'
              }`}
            >
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
              {label}
            </button>
          ))}
          <button className="mt-5 flex items-center gap-2 text-sm text-[#536177]">
            <Settings className="h-4 w-4 text-[#214d7d]" />
            Edit Type
          </button>
        </div>
      )}
      {calendarOpen && (
        <TaskCalendar
          onSelect={(date) => {
            setDueDate(date);
            setCalendarOpen(false);
          }}
        />
      )}
    </div>
  );
}

function TaskCalendar({ onSelect }: { onSelect: (d: Date | null) => void }) {
  const [month, setMonth] = useState(() => new Date());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) => (index < firstDay ? null : index - firstDay + 1));
  const shiftMonth = (offset: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  return (
    <div className="absolute right-12 top-[calc(100%+8px)] z-30 w-64 rounded-2xl bg-[#d6e8f6] p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="rounded bg-[#214d7d] px-3 py-1 text-sm text-white font-bold">
          {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => shiftMonth(1)} aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#536177]">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <span key={day} className="py-1 font-bold">
            {day}
          </span>
        ))}
        {cells.map((day, index) =>
          day ? (
            <button
              key={`day-${index}`}
              onClick={() => onSelect(new Date(year, monthIndex, day))}
              className="rounded py-1.5 hover:bg-[#4383d5] hover:text-white font-semibold cursor-pointer"
            >
              {day}
            </button>
          ) : (
            <span key={`empty-${index}`} />
          )
        )}
      </div>
      <button onClick={() => onSelect(null)} className="mt-3 rounded bg-white px-2.5 py-1 text-xs font-bold text-[#1c3352] cursor-pointer">
        No Due Date
      </button>
    </div>
  );
}

interface ProjectDoc {
  id: string;
  name: string;
  title: string;
  content: string;
}

const DEFAULT_PROJECT_DOCS: ProjectDoc[] = [
  { id: 'proj-1', name: 'Science Fair Plan', title: 'Science Fair 2026 Guidelines', content: '<p>Outline classroom requirements and milestone submission dates for students.</p>' },
  { id: 'proj-2', name: 'Unit 1 Assignment', title: 'Unit 1 Research Presentation', content: '<p>Student group project objectives and evaluation rubrics.</p>' },
];

function ProjectWorkspace() {
  const [projects, setProjects] = useState<ProjectDoc[]>(() => {
    try {
      const saved = localStorage.getItem('edupye_teacher_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROJECT_DOCS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => projects[0]?.id || 'proj-1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || {
    id: 'proj-1',
    name: 'Default Project',
    title: 'Project Title',
    content: '',
  };

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('edupye_teacher_projects', JSON.stringify(projects));
    } catch {
      // Ignored
    }
  }, [projects]);

  // Sync content into DOM editor when active project changes
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== (activeProject.content || '')) {
        editorRef.current.innerHTML = activeProject.content || '';
      }
    }
  }, [activeProject.id]);

  const addProject = () => {
    const newId = `proj-${Date.now()}`;
    const newProj: ProjectDoc = {
      id: newId,
      name: `Project ${projects.length + 1}`,
      title: `Project ${projects.length + 1} Title`,
      content: '<p>Start drafting project guidelines...</p>',
    };
    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newId);
  };

  const updateTitle = (newTitle: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? { ...p, title: newTitle } : p))
    );
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setProjects((prev) =>
        prev.map((p) => (p.id === activeProject.id ? { ...p, content: html } : p))
      );
    }
  };

  const startRename = (p: ProjectDoc) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const commitRename = (id: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p))
      );
    }
    setEditingId(null);
  };

  const executeCommand = (cmd: string, val: string | undefined = undefined) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleEditorInput();
  };

  const toolbarActions = [
    { icon: Bold, label: 'Bold', action: () => executeCommand('bold') },
    { icon: Italic, label: 'Italic', action: () => executeCommand('italic') },
    { icon: Underline, label: 'Underline', action: () => executeCommand('underline') },
    { icon: AlignLeft, label: 'Align Left', action: () => executeCommand('justifyLeft') },
    { icon: AlignCenter, label: 'Align Center', action: () => executeCommand('justifyCenter') },
    { icon: List, label: 'Bullet List', action: () => executeCommand('insertUnorderedList') },
    { icon: ListOrdered, label: 'Numbered List', action: () => executeCommand('insertOrderedList') },
    { icon: PenLine, label: 'Highlight', action: () => executeCommand('hiliteColor', '#fef08a') },
    { icon: Eraser, label: 'Clear Formatting', action: () => executeCommand('removeFormat') },
  ];

  return (
    <div className="flex min-h-[600px] bg-[#f8fcff] p-0">
      {/* Projects Sidebar */}
      <aside className="w-[220px] shrink-0 border-r border-[#dce9f3] bg-white flex flex-col">
        <div className="flex h-14 items-center justify-between bg-[#214d7d] px-4 text-[#b6c6d7] font-bold">
          <span className="flex items-center gap-1 text-sm text-white">
            <ChevronDown className="h-4 w-4" />
            Projects
          </span>
          <button
            onClick={addProject}
            aria-label="Add project"
            className="p-1 hover:bg-[#2d629c] rounded-md transition-colors cursor-pointer text-white"
            title="Create new project"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {projects.map((project) => {
            const isSelected = activeProject.id === project.id;
            const isEditingThis = editingId === project.id;

            return (
              <div
                key={project.id}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold border-b border-slate-100 transition-colors ${
                  isSelected ? 'bg-[#d6e8f6] text-[#171f2b]' : 'hover:bg-[#f1f7fc] text-slate-700'
                }`}
              >
                {isEditingThis ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => commitRename(project.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(project.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="w-full bg-white border border-[#214d7d] rounded px-1.5 py-0.5 text-xs text-slate-800 outline-none"
                  />
                ) : (
                  <button
                    onClick={() => setActiveProjectId(project.id)}
                    className="flex-1 text-left truncate cursor-pointer py-1"
                    title={project.name}
                  >
                    {project.name}
                  </button>
                )}

                {!isEditingThis && (
                  <button
                    onClick={() => startRename(project)}
                    className="p-1 text-slate-400 hover:text-[#214d7d] rounded cursor-pointer shrink-0 ml-1"
                    title="Rename project"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Editor Section */}
      <section className="m-0 flex min-w-0 flex-1 flex-col bg-white">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 border-b border-[#dce9f3] px-4 py-2 bg-slate-50/70">
          <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">
            Format:
          </span>
          {toolbarActions.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent losing text selection
                  tool.action();
                }}
                className="p-1.5 rounded-lg text-slate-600 hover:text-[#214d7d] hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
                title={tool.label}
                aria-label={tool.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Title and Content Inputs */}
        <div className="flex-1 p-6 flex flex-col">
          <input
            type="text"
            value={activeProject.title}
            onChange={(e) => updateTitle(e.target.value)}
            aria-label="Project title"
            placeholder="Project Title..."
            className="block w-full bg-transparent text-2xl font-black text-slate-800 placeholder-slate-300 outline-none pb-2 border-b border-slate-100"
          />
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            aria-label="Project content"
            data-placeholder="Write your project details and assignment instructions here..."
            className="project-editor mt-4 flex-1 min-h-[400px] text-sm text-slate-700 outline-none leading-relaxed"
          />
        </div>
      </section>
    </div>
  );
}
