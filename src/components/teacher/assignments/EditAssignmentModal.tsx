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
  Paperclip,
  Trash2,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { assignmentService } from '../../../services/assignmentService';
import { IAssignment, IAssignmentAttachment } from '../../../types/assignment';
import { useToast } from '../../../hooks/useToast';

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: IAssignment | null;
  onUpdated: () => void;
}

export const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onUpdated,
}) => {
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [passingMarks, setPassingMarks] = useState<number>(40);
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);
  const [lateSubmissionDeadline, setLateSubmissionDeadline] = useState('');

  // Attachments
  const [existingAttachments, setExistingAttachments] = useState<IAssignmentAttachment[]>([]);
  const [removedKeys, setRemovedKeys] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !assignment) return;

    setTitle(assignment.title || '');
    setSubject(assignment.subject || '');
    setDescription(assignment.description || '');
    setInstructions(assignment.instructions || '');

    if (assignment.dueDate) {
      const d = new Date(assignment.dueDate);
      setDueDate(d.toISOString().split('T')[0]);
    }
    setDueTime(assignment.dueTime || '23:59');
    setTotalMarks(assignment.totalMarks || 100);
    setPassingMarks(assignment.passingMarks || 40);
    setAllowLateSubmission(Boolean(assignment.allowLateSubmission));

    if (assignment.lateSubmissionDeadline) {
      const ld = new Date(assignment.lateSubmissionDeadline);
      setLateSubmissionDeadline(ld.toISOString().slice(0, 16));
    } else {
      setLateSubmissionDeadline('');
    }

    setExistingAttachments(assignment.attachments || []);
    setRemovedKeys([]);
    setNewFiles([]);
    setFormError(null);
  }, [isOpen, assignment]);

  const handleRemoveExisting = (storageKey: string) => {
    setRemovedKeys((prev) => [...prev, storageKey]);
    setExistingAttachments((prev) => prev.filter((a) => a.storageKey !== storageKey));
  };

  const handleAddNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const totalCount = existingAttachments.length + newFiles.length + files.length;
      if (totalCount > 10) {
        toast.error('Maximum of 10 attachments allowed per assignment.');
        return;
      }
      setNewFiles((prev) => [...prev, ...files]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!assignment) return;
    setFormError(null);

    if (!title.trim()) {
      setFormError('Assignment title is required.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Description is required.');
      return;
    }
    if (!dueDate) {
      setFormError('Due date is required.');
      return;
    }
    if (passingMarks > totalMarks) {
      setFormError('Passing marks cannot exceed total marks.');
      return;
    }

    setIsSubmitting(true);

    try {
      await assignmentService.updateAssignment(assignment._id, {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        instructions: instructions.trim() || undefined,
        dueDate,
        dueTime: dueTime || '23:59',
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        allowLateSubmission,
        lateSubmissionDeadline: lateSubmissionDeadline || undefined,
        removedAttachmentKeys: removedKeys,
        newAttachments: newFiles,
      });

      toast.success('Assignment updated successfully!');
      onUpdated();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update assignment.');
      toast.error(err.message || 'Failed to update assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) return null;

  const isPublished = assignment.status === 'published' || assignment.status === 'archived';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Assignment" maxWidth="3xl">
      <div className="space-y-4">
        {formError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        {isPublished && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
            This assignment is <strong>{assignment.status}</strong>. Class section and assignment type are locked to preserve student submission history.
          </div>
        )}

        {/* 1. Basic Information */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assignment Type
              </label>
              <input
                type="text"
                disabled
                value={assignment.type.toUpperCase()}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Problem Statement <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instructions
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
            />
          </div>
        </div>

        {/* 2. Deadlines & Marks */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
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
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
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
                Passing Marks
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
        </div>

        {/* 3. Attachments Management */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Attachments
          </h4>

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">Current Attachments:</span>
              {existingAttachments.map((att) => (
                <div
                  key={att.storageKey}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">{att.originalName}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(att.fileSize / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(att.storageKey)}
                    className="p-1 hover:bg-slate-200 rounded-lg text-rose-500 cursor-pointer"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Attachments */}
          <div className="border border-dashed border-slate-200 rounded-2xl p-3 text-center">
            <label className="cursor-pointer">
              <span className="text-xs font-bold text-sky-600 hover:text-sky-800">
                + Add New Files
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.zip"
                onChange={handleAddNewFiles}
                className="hidden"
              />
            </label>
          </div>

          {newFiles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">Files to Upload:</span>
              {newFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-sky-50/50 border border-sky-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="font-semibold text-sky-900 truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="p-1 hover:bg-sky-100 rounded-lg text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

