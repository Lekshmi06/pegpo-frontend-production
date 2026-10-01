import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { TeacherTask } from '../../types/teacherTask';
import { teacherTaskService } from '../../services/teacherTaskService';
import TeacherTaskModal from '../../components/teacher/TeacherTaskModal';

export default function TeacherCalendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [allTasks, setAllTasks] = useState<TeacherTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TeacherTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TeacherTask | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch tasks for the current view and upcoming
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch upcoming tasks (limit 4)
      const upcoming = await teacherTaskService.getUpcomingTasks(4);
      setUpcomingTasks(upcoming);

      // Fetch all tasks for current month view (with buffer)
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 2, 0).toISOString().split('T')[0];
      const tasks = await teacherTaskService.getTasks({ startDate, endDate });
      setAllTasks(tasks);
    } catch (err) {
      console.warn('Failed to load teacher tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadTasks();

    const handleTasksUpdated = () => {
      loadTasks();
    };

    window.addEventListener('teacher-tasks-updated', handleTasksUpdated);
    return () => {
      window.removeEventListener('teacher-tasks-updated', handleTasksUpdated);
    };
  }, [loadTasks]);

  // Group tasks by YYYY-MM-DD
  const tasksByDate = useMemo(() => {
    const map: Record<string, TeacherTask[]> = {};
    for (const t of allTasks) {
      if (!t.date) continue;
      const key = t.date.split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [allTasks]);

  // Calendar matrix calculations
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();
  const leadingDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const day = prevMonthDays - firstDayOfWeek + i + 1;
    const prevDate = new Date(year, month - 1, day);
    const dateStr = prevDate.toISOString().split('T')[0];
    return { day, dateStr, isCurrentMonth: false };
  });

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const d = new Date(year, month, day);
    // Local date string YYYY-MM-DD
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;
    return { day, dateStr, isCurrentMonth: true };
  });

  const totalCells = leadingDays.length + currentMonthDays.length;
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingDays = Array.from({ length: trailingCount }, (_, i) => {
    const day = i + 1;
    const nextDate = new Date(year, month + 1, day);
    const dateStr = nextDate.toISOString().split('T')[0];
    return { day, dateStr, isCurrentMonth: false };
  });

  const calendarCells = [...leadingDays, ...currentMonthDays, ...trailingDays];

  const handlePrevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleOpenCreateModal = (dateStr?: string) => {
    setEditingTask(null);
    if (dateStr) setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TeacherTask, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingTask(task);
    if (task.date) setSelectedDate(task.date.split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    if (editingTask?._id) {
      await teacherTaskService.updateTask(editingTask._id, taskData);
    } else {
      await teacherTaskService.createTask(taskData);
    }
    if (taskData.date) {
      setSelectedDate(taskData.date);
      // Auto navigate calendar to the task's month if different
      const [tYear, tMonth] = taskData.date.split('-').map(Number);
      if (tYear && tMonth && (tYear !== year || tMonth - 1 !== month)) {
        setCurrentDate(new Date(tYear, tMonth - 1, 1));
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await teacherTaskService.deleteTask(taskId);
  };

  const handleSelectUpcomingTask = (task: TeacherTask) => {
    if (!task.date) return;
    const dateKey = task.date.split('T')[0];
    setSelectedDate(dateKey);
    const [tYear, tMonth] = dateKey.split('-').map(Number);
    if (tYear && tMonth) {
      setCurrentDate(new Date(tYear, tMonth - 1, 1));
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0b2d5a]">Calendars & Planners</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your class schedules, deadlines, and department meetings.</p>
        </div>
        <button
          onClick={() => handleOpenCreateModal(selectedDate)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#214d7d] hover:bg-[#1a3c61] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Main Grid: Left = Upcoming Tasks, Right = Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Upcoming Tasks (1 col) */}
        <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0b2d5a]">Upcoming Events & Tasks</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {upcomingTasks.length} upcoming
            </span>
          </div>

          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                <CalendarIcon className="h-7 w-7 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No upcoming tasks</p>
                <p className="text-[11px] text-slate-400">Click &ldquo;Add Task&rdquo; to plan your schedule.</p>
              </div>
            ) : (
              upcomingTasks.map((task) => {
                const isSelected = task.date?.split('T')[0] === selectedDate;
                return (
                  <div
                    key={task._id}
                    onClick={() => handleSelectUpcomingTask(task)}
                    className={`p-3 border rounded-xl space-y-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#e2ebf4]/60 border-[#1c3d73] ring-1 ring-[#1c3d73]/20 shadow-xs'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                        {task.taskType || 'Task'}
                      </span>
                      {task.status === 'completed' ? (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </span>
                      ) : (
                        <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'High'
                            ? 'bg-amber-100 text-amber-700'
                            : 'text-slate-400'
                        }`}>
                          {task.priority || 'Normal'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                      <span>{formatDisplayDate(task.date)}</span>
                      {task.startTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <Clock className="h-2.5 w-2.5" />
                            {task.startTime}
                            {task.endTime ? ` - ${task.endTime}` : ''}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm">
          {/* Calendar Header Controls */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#0b2d5a]">{monthLabel}</h3>
            <div className="flex gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs cursor-pointer text-slate-700 font-semibold transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-3.5 w-3.5 inline mr-0.5" />
                Prev
              </button>
              <button
                onClick={handleNextMonth}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs cursor-pointer text-slate-700 font-semibold transition-colors"
                aria-label="Next month"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 inline ml-0.5" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {calendarCells.map((cell, idx) => {
              const { day, dateStr, isCurrentMonth } = cell;
              const dayTasks = tasksByDate[dateStr] || [];
              const hasTasks = dayTasks.length > 0;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={`day-cell-${idx}-${dateStr}`}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    if (dayTasks.length === 0) {
                      handleOpenCreateModal(dateStr);
                    }
                  }}
                  className={`min-h-[82px] p-1.5 flex flex-col justify-between items-stretch border rounded-xl text-xs cursor-pointer transition-all ${
                    !isCurrentMonth
                      ? 'border-slate-100 text-slate-300 bg-slate-50/40 hover:bg-slate-50'
                      : hasTasks
                      ? 'bg-[#e2ebf4]/60 border-[#1c3d73] text-[#0b2d5a] ring-1 ring-[#1c3d73]/30 shadow-2xs hover:bg-[#d6e5f3]'
                      : isSelected
                      ? 'border-[#214d7d] bg-[#f0f6fc] text-[#0b2d5a] font-bold'
                      : 'border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  {/* Top Bar inside cell: Day Number & Today indicator */}
                  <div className="flex items-center justify-between w-full px-0.5">
                    <span
                      className={`text-xs font-bold leading-none ${
                        isToday
                          ? 'h-5 w-5 rounded-full bg-[#214d7d] text-white flex items-center justify-center'
                          : hasTasks
                          ? 'text-[#0b2d5a] font-extrabold'
                          : isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {hasTasks && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1c3d73]" />
                    )}
                  </div>

                  {/* Bottom: Task Titles / Count inside cell */}
                  <div className="w-full space-y-1 mt-1">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t._id}
                        onClick={(e) => handleOpenEditModal(t, e)}
                        title={`${t.title}${t.startTime ? ` (${t.startTime})` : ''}`}
                        className="w-full text-left truncate text-[10px] leading-tight px-1.5 py-0.5 rounded bg-white/90 border border-[#1c3d73]/20 text-[#0b2d5a] font-semibold hover:bg-[#1c3d73] hover:text-white transition-colors cursor-pointer shadow-2xs"
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(dateStr);
                        }}
                        className="text-[9px] text-[#1c3d73] font-bold text-left px-1 hover:underline cursor-pointer"
                      >
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Creation / Edit Modal */}
      <TeacherTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        initialDate={selectedDate}
      />
    </div>
  );
}
