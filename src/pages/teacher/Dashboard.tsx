import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Plus, X, CalendarDays, Settings, Bold, Italic, Underline, AlignLeft, AlignCenter, ListChecks, ListOrdered, List, PenLine, Eraser } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import TeacherCalendar from './TeacherCalendar';
import LessonPlanner from './LessonPlanner';

const workspaceTabs = ['Calendars Planers', 'Task List', 'Kanban board', 'Lesson Planers', 'Projects'];
const subjectTabs = ['Subject', 'Classes', 'Lessons', 'Test', 'Quiz', 'Notes'];

interface TaskItem {
  id: string;
  name: string;
  status: string;
  type: string;
  dueDate: string;
  priority: string;
  assignee: string;
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('Calendars Planers');
  const [activeSubjectTab, setActiveSubjectTab] = useState('Subject');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskComposerOpen, setTaskComposerOpen] = useState(false);
  const [taskName, setTaskName] = useState('');

  const hideSubjectRail = ['Task List', 'Kanban board', 'Projects'].includes(activeTab);

  const addTask = () => {
    if (!taskName.trim()) return;
    setTasks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: taskName,
        status: 'Not started',
        type: 'General',
        dueDate: '—',
        priority: 'Normal',
        assignee: '—',
      },
    ]);
    setTaskName('');
    setTaskComposerOpen(false);
  };

  const taskList = (
    <div className="bg-white p-4">
      <div className="flex h-14 items-center justify-end border-b border-[#d5e4f2] px-3">
        <button
          onClick={() => setTaskComposerOpen(true)}
          aria-label="Add task"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#214d7d] text-white hover:bg-[#173c63] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-[1.7fr_repeat(5,1fr)] items-center border-b border-[#c8dced] px-3 py-3 text-[15px] text-[#4d596d] font-bold">
        <span className="flex items-center gap-2 font-extrabold text-[#202938]">
          <ChevronDown className="h-4 w-4 text-[#214d7d]" />
          Task.active
        </span>
        <span>Status</span>
        <span>Type</span>
        <span>Due date</span>
        <span>Priority</span>
        <span>Assignee</span>
      </div>
      {taskComposerOpen && (
        <TaskListComposer
          name={taskName}
          setName={setTaskName}
          close={() => setTaskComposerOpen(false)}
          save={addTask}
        />
      )}
      {tasks.map((task) => (
        <div key={task.id} className="grid grid-cols-[1.7fr_repeat(5,1fr)] border-b border-[#edf3f8] px-6 py-3 text-sm text-[#526076]">
          <input
            aria-label="Task title"
            value={task.name}
            onChange={(e) =>
              setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, name: e.target.value } : item)))
            }
            className="bg-transparent outline-none font-semibold"
          />
          <span>{task.status}</span>
          <span>{task.type}</span>
          <span>{task.dueDate}</span>
          <span>{task.priority}</span>
          <span>{task.assignee}</span>
        </div>
      ))}
      <button
        onClick={() => setTaskComposerOpen(true)}
        className="flex items-center gap-2 px-8 py-6 text-sm text-[#536177] hover:text-[#214d7d] font-bold cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Create task
      </button>
    </div>
  );

  const content =
    activeTab === 'Task List' ? (
      taskList
    ) : activeTab === 'Kanban board' ? (
      <KanbanBoard />
    ) : activeTab === 'Calendars Planers' ? (
      <TeacherCalendar />
    ) : activeTab === 'Lesson Planers' ? (
      <LessonPlanner />
    ) : activeTab === 'Projects' ? (
      <ProjectWorkspace />
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
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
  save: () => void;
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
      <button onClick={save} className="rounded-xl bg-[#214d7d] px-4 py-1.5 text-sm text-white font-bold cursor-pointer">
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

function ProjectWorkspace() {
  const [projects, setProjects] = useState(['Project name']);
  const [activeProject, setActiveProject] = useState('Project name');
  const addProject = () => {
    const project = `Project ${projects.length + 1}`;
    setProjects((items) => [...items, project]);
    setActiveProject(project);
  };
  const toolbarButtons = [Bold, Italic, Underline, AlignLeft, AlignCenter, ListChecks, ListOrdered, List, Plus, PenLine, Eraser];

  return (
    <div className="flex min-h-[600px] bg-[#f8fcff] p-0">
      <aside className="w-[218px] shrink-0 border-r border-[#dce9f3] bg-white">
        <div className="flex h-14 items-center justify-between bg-[#214d7d] px-4 text-[#b6c6d7] font-bold">
          <span className="flex items-center gap-1 text-sm">
            <ChevronDown className="h-4 w-4" />
            Projects
          </span>
          <button onClick={addProject} aria-label="Add project" className="cursor-pointer">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        {projects.map((project) => (
          <button
            key={project}
            onClick={() => setActiveProject(project)}
            className={`block w-full px-5 py-3 text-left text-sm font-bold ${
              activeProject === project ? 'bg-[#d6e8f6] text-[#171f2b]' : 'hover:bg-[#f1f7fc]'
            }`}
          >
            {project}
          </button>
        ))}
      </aside>
      <section className="m-0 flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex flex-wrap items-center gap-3 border border-[#dce9f3] px-5 py-2 text-[#9aa8b9]">
          <button className="flex items-center gap-1 text-sm font-bold text-[#1c3352]">
            Normal Text <ChevronDown className="h-4 w-4" />
          </button>
          <span className="h-6 w-px bg-[#dce9f3]" />
          {toolbarButtons.map((Icon, index) => (
            <button key={`btn-${index}`} className="hover:text-[#214d7d] cursor-pointer" aria-label="Editor tool">
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
        <div className="flex-1 p-6">
          <input
            defaultValue="Title"
            aria-label="Project title"
            className="block w-full bg-transparent text-[26px] font-extrabold text-[#b5b5b5] outline-none"
          />
          <div
            contentEditable
            suppressContentEditableWarning
            aria-label="Project content"
            data-placeholder="Write your text here....."
            className="project-editor mt-3 min-h-[430px] text-[15px] text-[#777] outline-none font-medium"
          />
        </div>
      </section>
    </div>
  );
}
