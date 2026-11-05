import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Calendar,
  Clock,
  Award,
  Users,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Trash2,
  Search,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { classSectionService } from '../../../services/classSectionService';
import { assignmentService } from '../../../services/assignmentService';
import { TeacherClassGroup, ClassStudentItem } from '../../../types/classSection';
import { AssignmentType, AssignmentTargetType, AssignmentStatus } from '../../../types/assignment';
import { useToast } from '../../../hooks/useToast';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialClassSectionId?: string;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  initialClassSectionId,
}) => {
  const toast = useToast();

  const [classes, setClasses] = useState<TeacherClassGroup[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [type, setType] = useState<AssignmentType>('homework');
  const [classSectionId, setClassSectionId] = useState(initialClassSectionId || '');
  const [targetType, setTargetType] = useState<AssignmentTargetType>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Class Students (for individual targeting)
  const [classStudents, setClassStudents] = useState<ClassStudentItem[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Dates & Marks
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [passingMarks, setPassingMarks] = useState<number>(40);
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);
  const [lateSubmissionDeadline, setLateSubmissionDeadline] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load teacher's assigned classes on open
  useEffect(() => {
    if (!isOpen) return;

    const loadTeacherClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const groups = await classSectionService.getTeacherClasses();
        setClasses(groups);
        if (!classSectionId && groups.length > 0) {
          setClassSectionId(groups[0].classSectionId);
          if (groups[0].subject) {
            setSubject(groups[0].subject);
          }
        }
      } catch (err: any) {
        console.error('Failed to load teacher classes:', err);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    loadTeacherClasses();
  }, [isOpen]);

  // Load students when classSectionId changes and targetType is 'selected'
  useEffect(() => {
    if (!classSectionId || targetType !== 'selected') {
      setClassStudents([]);
      return;
    }

    const loadStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const list = await classSectionService.getClassStudents(classSectionId);
        setClassStudents(list.filter((s) => Boolean(s.studentProfileId)));
      } catch (err: any) {
        console.error('Failed to load class students:', err);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [classSectionId, targetType]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setInstructions('');
      setType('homework');
      setTargetType('all');
      setSelectedStudentIds([]);
      setDueDate('');
      setDueTime('23:59');
      setTotalMarks(100);
      setPassingMarks(40);
      setAllowLateSubmission(true);
      setLateSubmissionDeadline('');
      setAttachments([]);
      setFormError(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalCount = attachments.length + newFiles.length;
      if (totalCount > 10) {
        toast.error('Maximum of 10 attachments allowed per assignment.');
        return;
      }
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(
      classStudents
        .map((s) => s.studentProfileId)
        .filter((id): id is string => Boolean(id))
    );
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = async (targetStatus: AssignmentStatus) => {
    setFormError(null);

    // Front-end Validations
    if (!title.trim()) {
      setFormError('Assignment title is required.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Description / problem statement is required.');
      return;
    }
    if (!classSectionId) {
      setFormError('Please select a class for this assignment.');
      return;
    }
    if (!dueDate) {
      setFormError('Please specify a due date.');
      return;
    }
    if (passingMarks > totalMarks) {
      setFormError('Passing marks cannot exceed total marks.');
      return;
    }
    if (targetType === 'selected' && selectedStudentIds.length === 0) {
      setFormError('Please select at least one student when targeting individual students.');
      return;
    }

    setIsSubmitting(true);

    try {
      await assignmentService.createAssignment({
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        instructions: instructions.trim() || undefined,
        type,
        classSectionId,
        targetType,
        targetStudentProfileIds: targetType === 'selected' ? selectedStudentIds : undefined,
        assignedDate: assignedDate || undefined,
        dueDate,
        dueTime: dueTime || '23:59',
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        allowLateSubmission,
        lateSubmissionDeadline: lateSubmissionDeadline || undefined,
        status: targetStatus,
        attachments,
      });

      toast.success(
        targetStatus === 'published'
          ? 'Assignment published successfully!'
          : 'Assignment saved as draft.'
      );
      onCreated();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create assignment.');
      toast.error(err.message || 'Failed to create assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = classStudents.filter((s) => {
    const q = studentSearch.toLowerCase();
    const matchName = s.name.toLowerCase().includes(q);
    const matchEmail = s.email ? s.email.toLowerCase().includes(q) : false;
    const matchRoll = s.rollNumber ? s.rollNumber.toLowerCase().includes(q) : false;
    return matchName || matchEmail || matchRoll;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Assignment" maxWidth="3xl">
      <div className="space-y-5">
        {formError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        {/* 1. Basic Information */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Basic Information
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 4: Linear Equations Practice Set"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assignment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssignmentType)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
              >
                <option value="homework">Homework</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Problem Statement / Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions or overview of problems students must solve..."
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Submission Guidelines / Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Please show all working steps. Hand-written work must be scanned clearly as PDF."
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
            />
          </div>
        </div>

        {/* 2. Target Class & Audience */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Target Audience
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={classSectionId}
                onChange={(e) => setClassSectionId(e.target.value)}
                disabled={isLoadingClasses}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
              >
                {isLoadingClasses ? (
                  <option value="">Loading your classes...</option>
                ) : classes.length === 0 ? (
                  <option value="">No classes found</option>
                ) : (
                  classes.map((cls) => (
                    <option key={cls.classSectionId} value={cls.classSectionId}>
                      {cls.classLevel} - Section {cls.section} ({cls.studentCount || 0} students)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Group
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    targetType === 'all'
                      ? 'bg-[#1c3352] text-white border-[#1c3352]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Entire Class
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('selected')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    targetType === 'selected'
                      ? 'bg-[#1c3352] text-white border-[#1c3352]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Selected Students
                </button>
              </div>
            </div>
          </div>

          {/* Individual Student Selector */}
          {targetType === 'selected' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">
                  Select Target Students ({selectedStudentIds.length} of {classStudents.length} selected)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-800"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={deselectAllStudents}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Filter students by name, email, roll number..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {isLoadingStudents ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Loading enrolled students...</p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No students found matching filter.</p>
                ) : (
                  filteredStudents.map((st) => {
                    const stId = st.studentProfileId || '';
                    const isSelected = selectedStudentIds.includes(stId);
                    return (
                      <div
                        key={stId || st.membershipId}
                        onClick={() => stId && toggleStudentSelection(stId)}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-300'
                            : 'bg-white border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-sky-600 focus:ring-0"
                          />
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-800 block truncate">
                              {st.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {st.email} {st.rollNumber ? `• Roll: ${st.rollNumber}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Deadlines & Marks */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Deadlines & Grading
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Passing Marks (Optional)
              </label>
              <input
                type="number"
                min={0}
                max={totalMarks}
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none pb-2">
                <input
                  type="checkbox"
                  checked={allowLateSubmission}
                  onChange={(e) => setAllowLateSubmission(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span className="text-xs font-bold text-slate-700">Allow Late Submissions</span>
              </label>
            </div>
          </div>

          {allowLateSubmission && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hard Late Submission Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={lateSubmissionDeadline}
                onChange={(e) => setLateSubmissionDeadline(e.target.value)}
                className="w-full sm:w-1/2 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Submissions after this hard cutoff will be automatically rejected.
              </p>
            </div>
          )}
        </div>

        {/* 4. Attachments */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reference Attachments ({attachments.length}/10)
            </h4>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-slate-300 transition-colors">
            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1.5" />
            <label className="cursor-pointer">
              <span className="text-xs font-bold text-sky-600 hover:text-sky-800">
                Click to attach worksheets or problem files
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.zip"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports PDF, DOCX, PPTX, TXT, CSV, PNG, JPG, ZIP up to 25MB each.
            </p>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="p-1 hover:bg-slate-200 rounded-lg text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSubmit('draft')}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSubmit('published')}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Publish Assignment
          </Button>
        </div>
      </div>
    </Modal>
  );
};
