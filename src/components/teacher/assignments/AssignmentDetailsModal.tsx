import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Award,
  Users,
  Paperclip,
  Download,
  CheckCircle2,
  AlertCircle,
  Archive,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { assignmentService } from '../../../services/assignmentService';
import { IAssignment } from '../../../types/assignment';
import { useToast } from '../../../hooks/useToast';

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: IAssignment | null;
  onOpenTracker: (assignment: IAssignment) => void;
  onOpenEdit: (assignment: IAssignment) => void;
  onRefresh: () => void;
}

export const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onOpenTracker,
  onOpenEdit,
  onRefresh,
}) => {
  const toast = useToast();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  if (!assignment) return null;

  const handleDownload = async (attachmentId: string, filename: string) => {
    try {
      setDownloadingKey(attachmentId);
      await assignmentService.downloadAssignmentAttachment(assignment._id, attachmentId, filename);
    } catch (err: any) {
      toast.error(err.message || 'Failed to download attachment.');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handlePublish = async () => {
    try {
      setIsActionLoading(true);
      await assignmentService.publishAssignment(assignment._id);
      toast.success('Assignment published to students!');
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish assignment.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setIsActionLoading(true);
      await assignmentService.archiveAssignment(assignment._id);
      toast.success('Assignment archived.');
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to archive assignment.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this assignment?')) {
      return;
    }

    try {
      setIsActionLoading(true);
      await assignmentService.deleteAssignment(assignment._id);
      toast.success('Assignment deleted successfully.');
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete assignment.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const formattedDueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assignment Overview" maxWidth="3xl">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-xl ${
                assignment.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : assignment.status === 'draft'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {assignment.status}
            </span>
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-xl bg-sky-100 text-sky-800">
              {assignment.type}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Subject: <strong className="text-slate-800">{assignment.subject}</strong>
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mb-2">
            {assignment.title}
          </h3>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {assignment.description}
          </p>
        </div>

        {/* Special Instructions if any */}
        {assignment.instructions && (
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 block">
              Submission Guidelines:
            </span>
            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
              {assignment.instructions}
            </p>
          </div>
        )}

        {/* Information Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Due Date
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {formattedDueDate}
            </span>
            <span className="text-[10px] text-slate-500 block">
              by {assignment.dueTime || '23:59'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Target Audience
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {assignment.targetType === 'all'
                ? 'Entire Class'
                : `${assignment.targetStudentProfileIds?.length || 0} Students`}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Marks
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {assignment.totalMarks} pts
            </span>
            {assignment.passingMarks !== undefined && (
              <span className="text-[10px] text-slate-500 block">
                Pass: {assignment.passingMarks} pts
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Late Submissions
            </span>
            <span
              className={`text-xs font-bold block mt-0.5 ${
                assignment.allowLateSubmission ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {assignment.allowLateSubmission ? 'Allowed' : 'Disallowed'}
            </span>
          </div>
        </div>

        {/* Attachments Section */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              Reference Attachments ({assignment.attachments.length})
            </span>
            <div className="space-y-1.5">
              {assignment.attachments.map((att) => (
                <div
                  key={att._id || att.storageKey}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {att.originalName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({(att.fileSize / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(att._id || att.storageKey, att.originalName)}
                    isLoading={downloadingKey === (att._id || att.storageKey)}
                    leftIcon={<Download className="w-3.5 h-3.5 text-sky-600" />}
                    className="text-sky-700 hover:text-sky-900"
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {assignment.status !== 'archived' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenEdit(assignment);
                }}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
            )}

            {assignment.status === 'published' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchive}
                disabled={isActionLoading}
                leftIcon={<Archive className="w-3.5 h-3.5" />}
              >
                Archive
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isActionLoading}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {assignment.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublish}
                disabled={isActionLoading}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Publish Now
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenTracker(assignment);
              }}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              View Submission Tracker
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

