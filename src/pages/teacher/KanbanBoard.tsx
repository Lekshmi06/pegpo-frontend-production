import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Plus,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { useTeacherKanban } from '../../hooks/useTeacherKanban';
import { TaskStatus, TaskCategory } from '../../types/teacher';
import { teacherProfileService } from '../../services/teacherProfileService';

const columns: TaskStatus[] = ['New task', 'Scheduled', 'In Progress', 'Completed'];

const typeConfig: Record<TaskCategory, { bg: string; text: string; dot: string }> = {
  Operational: { bg: '#d9eaf7', text: '#1e40af', dot: '#3b82f6' },
  Technical: { bg: '#fef08a', text: '#854d0e', dot: '#eab308' },
  Strategic: { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  Hiring: { bg: '#ffe4e6', text: '#9f1239', dot: '#f43f5e' },
  Financial: { bg: '#e2e8f0', text: '#334155', dot: '#64748b' },
};

const categoryList: TaskCategory[] = [
  'Operational',
  'Technical',
  'Strategic',
  'Hiring',
  'Financial',
];

export default function KanbanBoard() {
  const { tasks, isLoading, error, refetch, addTask, moveTask, deleteTask } =
    useTeacherKanban();

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerColumn, setComposerColumn] = useState<TaskStatus>('New task');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [taskType, setTaskType] = useState<TaskCategory>('Operational');
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState<string>('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const teacher = teacherProfileService.getCachedProfile();
  const teacherInitial = teacher?.name ? teacher.name.charAt(0).toUpperCase() : 'T';

  const openComposerForColumn = (column: TaskStatus) => {
    setComposerColumn(column);
    setComposerOpen(true);
    setCalendarOpen(false);
    setTypePickerOpen(false);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setTaskName('');
    setTaskDate('');
    setCalendarOpen(false);
    setTypePickerOpen(false);
  };

  const handleSaveTask = async () => {
    if (!taskName.trim()) return;
    try {
      await addTask(
        taskName.trim(),
        composerColumn,
        taskType,
        taskDate || undefined
      );
      closeComposer();
    } catch (err) {
      console.error('Failed to create task from kanban:', err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, column: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== column) {
      setDragOverColumn(column);
    }
  };

  const handleDragLeave = (e: React.DragEvent, column: TaskStatus) => {
    // Only clear if leaving the section itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === column) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (targetColumn: TaskStatus) => {
    setDragOverColumn(null);
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.status === targetColumn) {
      setDraggedTaskId(null);
      return;
    }

    try {
      await moveTask(draggedTaskId, targetColumn);
    } catch (err) {
      console.error('Failed to move task:', err);
    } finally {
      setDraggedTaskId(null);
    }
  };

  const handleQuickMove = async (taskId: string, direction: 'prev' | 'next') => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentIndex = columns.indexOf(task.status);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= columns.length) return;

    const targetColumn = columns[nextIndex];
    try {
      await moveTask(taskId, targetColumn);
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="min-h-full bg-[#f8fcff]">
      {/* Top action bar */}
      <div className="flex h-14 items-center justify-between border-b border-[#d5e4f2] px-4 bg-white/70 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#1c3352]">Kanban Board</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#d6e8f6] text-[#214d7d]">
            {tasks.length} total task{tasks.length === 1 ? '' : 's'}
          </span>
          {teacher?.name && (
            <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
              &bull; {teacher.name}&apos;s workspace
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            title="Refresh tasks"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c8dced] bg-white text-slate-600 hover:bg-slate-50 hover:text-[#214d7d] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#214d7d]' : ''}`} />
          </button>
          <button
            onClick={() => openComposerForColumn('New task')}
            aria-label="Add task"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#214d7d] text-white hover:bg-[#173c63] cursor-pointer text-xs font-bold transition-colors shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="m-3 flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="font-bold underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Column Headers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-[#c8dced] bg-white text-center text-[15px] font-bold text-[#161b23]">
        {columns.map((column, idx) => {
          const colTasks = tasks.filter((t) => t.status === column);
          return (
            <div
              key={column}
              className={`flex items-center justify-between py-3.5 px-4 ${
                idx ? 'sm:border-l border-[#d7e5f1]' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[#1c3352]">{column}</span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-extrabold text-slate-600">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => openComposerForColumn(column)}
                title={`Add task to ${column}`}
                className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#214d7d] transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid min-h-[540px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#f8fcff]">
        {columns.map((column, index) => {
          const columnTasks = tasks.filter((task) => task.status === column);
          const isDragTarget = dragOverColumn === column;

          return (
            <section
              key={column}
              onDragOver={(e) => handleDragOver(e, column)}
              onDragLeave={(e) => handleDragLeave(e, column)}
              onDrop={() => handleDrop(column)}
              className={`flex flex-col min-h-full p-2.5 transition-colors ${
                index ? 'sm:border-l border-[#d7e5f1]' : ''
              } ${isDragTarget ? 'bg-[#eaf3fa] ring-2 ring-inset ring-[#214d7d]/30' : ''}`}
            >
              {/* Inline Composer if open for this column */}
              {composerOpen && composerColumn === column && (
                <div className="relative mb-3 rounded-xl bg-[#d6e8f6] p-3 text-[#536177] shadow-sm border border-[#bdd7ee] animate-in fade-in duration-150">
                  <button
                    onClick={closeComposer}
                    aria-label="Close task editor"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#9eb9ce] text-[#234d7d] hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  <textarea
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveTask();
                      }
                    }}
                    className="h-14 w-full resize-none bg-transparent text-xs font-medium leading-4 outline-none placeholder:text-[#536177]/80 text-[#162942]"
                  />

                  {taskDate && (
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#214d7d] bg-white/70 rounded-md px-2 py-1 w-fit">
                      <CalendarDays className="h-3 w-3" />
                      <span>Due: {taskDate}</span>
                      <button
                        onClick={() => setTaskDate('')}
                        className="text-slate-400 hover:text-slate-600 ml-1"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-[#c2d9ec]">
                    <div className="flex items-center gap-1.5 relative">
                      <button
                        onClick={() => {
                          setTypePickerOpen((v) => !v);
                          setCalendarOpen(false);
                        }}
                        className="flex items-center gap-1 rounded-full border border-[#234d7d] px-2 py-0.5 text-[11px] font-medium text-[#234d7d] bg-white/60 hover:bg-white cursor-pointer transition-colors"
                        aria-label="Choose task type"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: typeConfig[taskType]?.dot || '#3b82f6' }}
                        />
                        <span>{taskType}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => {
                          setCalendarOpen((v) => !v);
                          setTypePickerOpen(false);
                        }}
                        className={`rounded-full border border-[#234d7d] p-1.5 cursor-pointer transition-colors ${
                          taskDate ? 'bg-[#214d7d] text-white' : 'bg-white/60 text-[#234d7d] hover:bg-white'
                        }`}
                        title="Set due date"
                      >
                        <CalendarDays className="h-3 w-3" />
                      </button>

                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#214d7d] text-[10px] font-bold text-white shadow-2xs select-none"
                        title={teacher?.name || 'Logged in Teacher'}
                      >
                        {teacherInitial}
                      </span>

                      {/* Type Picker dropdown */}
                      {typePickerOpen && (
                        <TypePicker
                          selected={taskType}
                          onSelect={(type) => {
                            setTaskType(type);
                            setTypePickerOpen(false);
                          }}
                          onClose={() => setTypePickerOpen(false)}
                        />
                      )}

                      {/* Calendar Popup */}
                      {calendarOpen && (
                        <CalendarPopup
                          selectedDate={taskDate}
                          onSelectDate={(date) => {
                            setTaskDate(date);
                            setCalendarOpen(false);
                          }}
                          close={() => setCalendarOpen(false)}
                        />
                      )}
                    </div>

                    <button
                      onClick={handleSaveTask}
                      disabled={!taskName.trim()}
                      className="rounded-lg bg-[#214d7d] px-3.5 py-1 text-[11px] text-white font-bold hover:bg-[#173c63] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Task Cards list */}
              <div className="flex-1 space-y-2.5">
                {columnTasks.map((task) => {
                  const isBeingDragged = draggedTaskId === task.id;
                  const typeInfo = typeConfig[task.type] || typeConfig.Operational;
                  const colIdx = columns.indexOf(column);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`group relative rounded-xl border border-[#d5e4f2] bg-white p-3 shadow-2xs hover:shadow-sm hover:border-[#b4d1ea] transition-all cursor-grab active:cursor-grabbing select-none ${
                        isBeingDragged ? 'opacity-40 scale-[0.98] ring-2 ring-[#214d7d]' : ''
                      }`}
                    >
                      {/* Top row: Type badge & drag icon */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: typeInfo.bg, color: typeInfo.text }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: typeInfo.dot }}
                          />
                          {task.type}
                        </span>

                        <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                      </div>

                      {/* Task title */}
                      <p className="text-xs font-semibold text-[#1c2c40] leading-snug line-clamp-3">
                        {task.name}
                      </p>

                      {/* Bottom row: Date & quick actions */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          {task.date ? (
                            <span className="flex items-center gap-1 text-[#214d7d] font-semibold text-[10px] bg-slate-50 px-1.5 py-0.5 rounded">
                              <CalendarDays className="h-3 w-3" />
                              {task.date}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">{task.estimatedTime || 'No date'}</span>
                          )}
                        </div>

                        {/* Card controls: move left, move right, delete */}
                        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {colIdx > 0 && (
                            <button
                              onClick={() => handleQuickMove(task.id, 'prev')}
                              title={`Move to ${columns[colIdx - 1]}`}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-[#214d7d] transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {colIdx < columns.length - 1 && (
                            <button
                              onClick={() => handleQuickMove(task.id, 'next')}
                              title={`Move to ${columns[colIdx + 1]}`}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-[#214d7d] transition-colors cursor-pointer"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete task"
                            className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty column placeholder */}
                {columnTasks.length === 0 && !(composerOpen && composerColumn === column) && (
                  <div
                    onClick={() => openComposerForColumn(column)}
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#cbe1f3] p-6 text-center text-slate-400 hover:border-[#214d7d]/50 hover:bg-white/40 hover:text-[#214d7d] transition-all cursor-pointer min-h-[120px]"
                  >
                    <Plus className="h-4 w-4 mb-1 opacity-60" />
                    <span className="text-[11px] font-semibold">No tasks</span>
                    <span className="text-[10px] opacity-75 mt-0.5">Click to add task</span>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TypePicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: TaskCategory;
  onSelect: (type: TaskCategory) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in duration-100">
      <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Type</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-0.5">
        {categoryList.map((cat) => {
          const isSelected = selected === cat;
          const conf = typeConfig[cat];
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                isSelected ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: conf.dot }} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarPopup({
  selectedDate,
  onSelectDate,
  close,
}: {
  selectedDate?: string;
  onSelectDate: (dateStr: string) => void;
  close: () => void;
}) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const [y, m] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const formatYMD = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleQuickToday = () => {
    onSelectDate(todayStr);
  };

  const handleQuickTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="absolute left-0 sm:left-[calc(100%+8px)] top-8 z-40 w-64 rounded-2xl bg-white p-3.5 shadow-2xl border border-slate-200 animate-in fade-in duration-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-800">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
        {daysOfWeek.map((day) => (
          <span key={day} className={day === 'Sa' || day === 'Su' ? 'text-sky-500' : ''}>
            {day}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = formatYMD(day);
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          return (
            <button
              key={`day-${day}`}
              onClick={() => onSelectDate(dateStr)}
              className={`h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#214d7d] text-white font-bold'
                  : isToday
                  ? 'bg-sky-100 text-[#214d7d] font-bold hover:bg-sky-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Quick buttons */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleQuickToday}
            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={handleQuickTomorrow}
            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
          >
            Tmrw
          </button>
        </div>
        <button
          onClick={() => {
            onSelectDate('');
            close();
          }}
          className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
