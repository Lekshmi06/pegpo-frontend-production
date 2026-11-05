import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Paperclip,
  Download,
  User,
  MessageSquare,
  History,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { assignmentService } from '../../../services/assignmentService';
import { IAssignment, StudentSubmissionItem } from '../../../types/assignment';
import { useToast } from '../../../hooks/useToast';

interface EvaluateSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: IAssignment | null;
  submissionItem: StudentSubmissionItem | null;
  onEvaluated: () => void;
}

export const EvaluateSubmissionModal: React.FC<EvaluateSubmissionModalProps> = ({
  isOpen,
  onClose,
  assignment,
  submissionItem,
  onEvaluated,
}) => {
  const toast = useToast();

  const [marksAwarded, setMarksAwarded] = useState<number | ''>('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !submissionItem) return;

    setMarksAwarded(
      submissionItem.marksAwarded !== undefined ? submissionItem.marksAwarded : ''
    );
    setGrade(submissionItem.grade || '');
    setFeedback(submissionItem.feedback || '');
    setFormError(null);
  }, [isOpen, submissionItem]);

  if (!assignment || !submissionItem) return null;

  const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
    if (!submissionItem.submissionId) return;

    try {
      setDownloadingKey(attachmentId);
      await assignmentService.downloadSubmissionAttachment(
        assignment._id,
        submissionItem.submissionId,
        attachmentId,
        filename
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to download submission attachment.');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!submissionItem.submissionId) {
      toast.error('Student has not submitted work yet.');
      return;
    }

    setFormError(null);

    if (marksAwarded === '' || isNaN(Number(marksAwarded))) {
      setFormError('Please enter valid numeric marks.');
      return;
    }

    const numericMarks = Number(marksAwarded);
    if (numericMarks < 0 || numericMarks > assignment.totalMarks) {
      setFormError(`Marks must be between 0 and total marks (${assignment.totalMarks}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      await assignmentService.evaluateSubmission(
        assignment._id,
        submissionItem.submissionId,
        {
          marksAwarded: numericMarks,
          grade: grade.trim() || undefined,
          feedback: feedback.trim() || undefined,
        }
      );

      toast.success(`Evaluation recorded for ${submissionItem.studentName}!`);
      onEvaluated();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save evaluation.');
      toast.error(err.message || 'Failed to save evaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Evaluate: ${submissionItem.studentName}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {formError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        {/* Student Metadata Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{submissionItem.studentName}</span>
              {submissionItem.rollNumber && (
                <span className="text-[11px] font-normal text-slate-500">
                  (Roll: {submissionItem.rollNumber})
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {submissionItem.studentEmail}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg ${
                submissionItem.status === 'evaluated'
                  ? 'bg-purple-100 text-purple-800'
                  : submissionItem.status === 'late'
                  ? 'bg-amber-100 text-amber-800'
                  : submissionItem.status === 'submitted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {submissionItem.status}
            </span>

            {submissionItem.isLate && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-rose-100 text-rose-800">
                LATE
              </span>
            )}
          </div>
        </div>

        {/* Submission Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold">Turned in:</span>
            <span>
              {submissionItem.submittedAt
                ? new Date(submissionItem.submittedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Pending submission'}
            </span>
          </div>

          {/* Submitted Content if returned */}
          {submissionItem.content && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Student Written Response:
              </span>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {submissionItem.content}
              </div>
            </div>
          )}

          {/* Submitted Attachments */}
          {submissionItem.attachments && submissionItem.attachments.length > 0 ? (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">
                Submitted Files ({submissionItem.attachments.length}):
              </span>
              {submissionItem.attachments.map((att) => (
                <div
                  key={att._id || att.storageKey}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">
                      {att.originalName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({(att.fileSize / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAttachment(att._id, att.originalName)}
                    isLoading={downloadingKey === att._id}
                    leftIcon={<Download className="w-3.5 h-3.5 text-sky-600" />}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            submissionItem.attachmentCount > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  Attached Files: <strong>{submissionItem.attachmentCount} file(s)</strong>
                </span>
                <span className="text-[10px] text-slate-400">
                  (Uploaded directly to private storage)
                </span>
              </div>
            )
          )}
        </div>

        {/* Grading Form */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Evaluation & Marks
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marks Awarded (out of {assignment.totalMarks}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={assignment.totalMarks}
                step="any"
                value={marksAwarded}
                onChange={(e) =>
                  setMarksAwarded(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder={`0 - ${assignment.totalMarks}`}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Letter Grade (Optional)
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. A+, A, B, Pass"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Teacher Feedback / Comments
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Constructive feedback, notes on mistakes, or encouragement..."
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitEvaluation}
            isLoading={isSubmitting}
            disabled={isSubmitting || !submissionItem.submissionId}
            leftIcon={<Award className="w-3.5 h-3.5" />}
          >
            Save Evaluation
          </Button>
        </div>
      </div>
    </Modal>
  );
};

