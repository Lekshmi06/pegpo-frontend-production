import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Flag, GraduationCap, Trash2 } from 'lucide-react';
import { TeacherTask, TeacherTaskType, TeacherTaskPriority, TeacherTaskStatus } from '../../types/teacherTask';
import { TeacherClassGroup } from '../../types/classSection';
import { classSectionService } from '../../services/classSectionService';

interface TeacherTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    taskType?: TeacherTaskType;
    priority?: TeacherTaskPriority;
    status?: TeacherTaskStatus;
    classSectionId?: string;
    teachingContextId?: string;
  }) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  task?: TeacherTask | null;
  initialDate?: string;
}

const TASK_TYPES: TeacherTaskType[] = [
  'General',
  'Operational',
  'Technical',
  'Strategic',
  'Hiring',
  'Financial',
  'Lecture',
  'Deadline',
  'Meeting',
];

const PRIORITIES: TeacherTaskPriority[] = ['Low', 'Normal', 'High', 'Urgent'];
const STATUSES: TeacherTaskStatus[] = ['pending', 'in_progress', 'completed'];

export default function TeacherTaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  initialDate,
}: TeacherTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskType, setTaskType] = useState<TeacherTaskType>('General');
  const [priority, setPriority] = useState<TeacherTaskPriority>('Normal');
  const [status, setStatus] = useState<TeacherTaskStatus>('pending');
  const [classSectionId, setClassSectionId] = useState<string>('');
  const [classes, setClasses] = useState<TeacherClassGroup[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setDate(task.date || new Date().toISOString().split('T')[0]);
        setStartTime(task.startTime || '');
        setEndTime(task.endTime || '');
        setTaskType(task.taskType || 'General');
        setPriority(task.priority || 'Normal');
        setStatus(task.status || 'pending');
        const cId = typeof task.classSectionId === 'object' && task.classSectionId?._id
          ? task.classSectionId._id
          : (task.classSectionId as string) || '';
        setClassSectionId(cId);
      } else {
        setTitle('');
        setDescription('');
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setStartTime('');
        setEndTime('');
        setTaskType('General');
        setPriority('Normal');
        setStatus('pending');
        setClassSectionId('');
      }
      setError(null);

      // Load teacher classes
      classSectionService.getTeacherClasses().then((cls) => {
        setClasses(cls || []);
      });
    }
  }, [isOpen, task, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    if (!date) {
      setError('Please select a date');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        date,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        taskType,
        priority,
        status,
        classSectionId: classSectionId || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?._id || !onDelete) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setDeleting(true);
      await onDelete(task._id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#e2ebf4] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2ebf4] bg-[#f8fbfe]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#214d7d]/10 flex items-center justify-center text-[#214d7d]">
              <Calendar className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0b2d5a]">
                {task ? 'Edit Task' : 'Create Task'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {task ? 'Update task details and schedule' : 'Add a new task to your planner & calendar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#0b2d5a] mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Chapter 3 Lesson Plan"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#214d7d]/20 focus:border-[#214d7d] text-slate-800 font-medium"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#0b2d5a] mb-1">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context or instructions..."
              rows={2}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#214d7d]/20 focus:border-[#214d7d] text-slate-800 font-medium resize-none"
            />
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#214d7d] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#214d7d] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#214d7d] text-slate-800"
              />
            </div>
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Tag className="h-3 w-3 text-slate-400" />
                Category / Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TeacherTaskType)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#214d7d] text-slate-800"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Flag className="h-3 w-3 text-slate-400" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TeacherTaskPriority)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#214d7d] text-slate-800"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class / Section Context & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-slate-400" />
                Target Class (Optional)
              </label>
              <select
                value={classSectionId}
                onChange={(e) => setClassSectionId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#214d7d] text-slate-800"
              >
                <option value="">General (No class)</option>
                {classes.map((cls) => (
                  <option key={cls.classSectionId} value={cls.classSectionId}>
                    {cls.name} ({cls.subject})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TeacherTaskStatus)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#214d7d] text-slate-800 font-semibold"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'pending' ? 'Pending' : s === 'in_progress' ? 'In Progress' : 'Completed'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e2ebf4] mt-5">
            {task && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-bold text-white bg-[#214d7d] hover:bg-[#1a3c61] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
