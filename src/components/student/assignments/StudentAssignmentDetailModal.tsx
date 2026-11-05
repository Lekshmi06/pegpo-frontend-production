import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Calendar,
  Clock,
  Award,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Paperclip,
  Trash2,
  History,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  Save,
  Info,
} from 'lucide-react';
import {
  IAssignment,
  IAssignmentSubmission,
  StudentAssignmentDerivedStatus,
  SubmitAssignmentPayload,
} from '../../../types/assignment';
import { assignmentService } from '../../../services/assignmentService';
import { useToast } from '../../../hooks/useToast';
import { Button } from '../../ui/Button';

interface StudentAssignmentDetailModalProps {
  assignmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmissionSuccess?: () => void;
}

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
  '.zip',
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_FILE_COUNT = 10;

export const StudentAssignmentDetailModal: React.FC<
  StudentAssignmentDetailModalProps
> = ({ assignmentId, isOpen, onClose, onSubmissionSuccess }) => {
  const toast = useToast();

  const [assignment, setAssignment] = useState<IAssignment | null>(null);
  const [submission, setSubmission] = useState<IAssignmentSubmission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [textResponse, setTextResponse] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [resubmitComment, setResubmitComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !assignmentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setValidationError(null);

    assignmentService
      .getStudentAssignmentDetails(assignmentId)
      .then((res) => {
        if (!isMounted) return;
        setAssignment(res.assignment);
        setSubmission(res.submission);
        if (res.submission?.content) {
          setTextResponse(res.submission.content);
        } else {
          setTextResponse('');
        }
        setSelectedFiles([]);
        setResubmitComment('');
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load assignment details.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, assignmentId]);

  if (!isOpen) return null;

  // Deadline calculation
  const isOverdue = (): boolean => {
    if (!assignment) return false;
    const dueTime = assignment.dueTime || '23:59';
    const [hh, mm] = dueTime.split(':').map((s) => parseInt(s, 10));
    const deadline = new Date(assignment.dueDate);
    deadline.setHours(hh || 23, mm || 59, 59, 999);
    return new Date() > deadline;
  };

  const isHardDeadlinePassed = (): boolean => {
    if (!assignment || !assignment.lateSubmissionDeadline) return false;
    const hard = new Date(assignment.lateSubmissionDeadline);
    if (hard.getHours() === 0 && hard.getMinutes() === 0) {
      hard.setHours(23, 59, 59, 999);
    }
    return new Date() > hard;
  };

  const canSubmit = (): boolean => {
    if (!assignment) return false;
    if (submission?.status === 'evaluated') return false; // Evaluation locks submissions
    if (isHardDeadlinePassed()) return false;
    if (isOverdue() && !assignment.allowLateSubmission) return false;
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);

    if (selectedFiles.length + incoming.length > MAX_FILE_COUNT) {
      setValidationError(`Maximum ${MAX_FILE_COUNT} files allowed.`);
      return;
    }

    for (const f of incoming) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setValidationError(
          `File format "${ext}" is not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
        );
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setValidationError(
          `File "${f.name}" exceeds the 25 MB size limit.`
        );
        return;
      }
    }

    setValidationError(null);
    setSelectedFiles((prev) => [...prev, ...incoming]);
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDownloadTeacherAttachment = async (
    attachmentId: string,
    filename: string
  ) => {
    if (!assignment) return;
    try {
      setDownloadingKey(attachmentId);
      await assignmentService.downloadAssignmentAttachment(
        assignment._id,
        attachmentId,
        filename
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download attachment.');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadSubmissionAttachment = async (
    subId: string,
    attachmentId: string,
    filename: string
  ) => {
    if (!assignment) return;
    try {
      setDownloadingKey(attachmentId);
      await assignmentService.downloadSubmissionAttachment(
        assignment._id,
        subId,
        attachmentId,
        filename
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download attachment.');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!assignment) return;
    if (!canSubmit() && !isDraft) {
      setValidationError('Submission is no longer accepted for this assignment.');
      return;
    }

    // Require either text or file for final submission
    if (!isDraft && !textResponse.trim() && selectedFiles.length === 0 && (!submission || submission.attachments.length === 0)) {
      setValidationError('Please provide a written response or upload at least one file before submitting.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const payload: SubmitAssignmentPayload = {
      content: textResponse.trim(),
      isDraft,
      comment: resubmitComment.trim() || undefined,
      files: selectedFiles.length > 0 ? selectedFiles : undefined,
    };

    try {
      const updatedSub = await assignmentService.submitAssignment(
        assignment._id,
        payload
      );
      setSubmission(updatedSub);
      setSelectedFiles([]);
      setResubmitComment('');

      if (isDraft) {
        toast.success('Your response has been saved as draft.');
      } else {
        toast.success(
          updatedSub.isLate
            ? 'Assignment submitted (Late).'
            : 'Assignment submitted successfully!'
        );
      }

      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to submit assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0d9488] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-[#d6e8f6] text-[#1c3352]">
                  {assignment?.subject || 'Assignment'}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {assignment?.type || 'Homework'}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 truncate max-w-md sm:max-w-lg mt-0.5">
                {assignment?.title || 'Loading assignment...'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0d9488] animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Loading assignment details...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && assignment && (
            <>
              {/* Meta information bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Teacher
                  </span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {assignment.teacherName || 'Assigned Teacher'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Due Date
                  </span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {new Date(assignment.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at {assignment.dueTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Total Marks
                  </span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {assignment.totalMarks} pts
                    {assignment.passingMarks ? ` (Pass: ${assignment.passingMarks})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Late Policy
                  </span>
                  <span
                    className={`font-bold block mt-0.5 ${
                      assignment.allowLateSubmission ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {assignment.allowLateSubmission ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
              </div>

              {/* Late / Overdue Warning Banners */}
              {isOverdue() && !submission && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                    assignment.allowLateSubmission && !isHardDeadlinePassed()
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-bold">
                      {isHardDeadlinePassed() || !assignment.allowLateSubmission
                        ? 'Past Due — Submissions Closed:'
                        : 'Past Due — Late Submission Active:'}
                    </span>{' '}
                    {isHardDeadlinePassed()
                      ? 'The final late submission deadline has passed. Work can no longer be submitted.'
                      : !assignment.allowLateSubmission
                      ? 'This assignment does not accept late submissions.'
                      : `You may still turn in your work, but it will be flagged as late${
                          assignment.lateSubmissionDeadline
                            ? ` until ${new Date(assignment.lateSubmissionDeadline).toLocaleDateString()}`
                            : ''
                        }.`}
                  </div>
                </div>
              )}

              {/* Description & Problem Statement */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Description / Problem Statement
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {assignment.description}
                </div>
              </div>

              {/* Instructions if present */}
              {assignment.instructions && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Instructions & Guidelines
                  </h3>
                  <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 text-xs text-sky-950 leading-relaxed whitespace-pre-wrap">
                    {assignment.instructions}
                  </div>
                </div>
              )}

              {/* Teacher Reference Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                    <span>Teacher Reference Materials ({assignment.attachments.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {assignment.attachments.map((att) => (
                      <div
                        key={att._id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-slate-800 block truncate">
                              {att.originalName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {(att.fileSize / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleDownloadTeacherAttachment(att._id, att.originalName)
                          }
                          disabled={downloadingKey === att._id}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          <Download className="w-3 h-3" />
                          <span>
                            {downloadingKey === att._id ? 'Downloading...' : 'Download'}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <hr className="border-slate-200" />

              {/* SECTION: TEACHER EVALUATION (If Evaluated) */}
              {submission?.status === 'evaluated' && submission.evaluation && (
                <div className="bg-[#f0fdf4] border-2 border-emerald-300 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-emerald-950">
                          Teacher Evaluation & Grade
                        </h3>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Evaluated by {submission.evaluation.evaluatedBy || 'Instructor'} on{' '}
                          {new Date(submission.evaluation.evaluatedAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {submission.evaluation.grade && (
                        <div className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black tracking-wider shadow-2xs">
                          Grade {submission.evaluation.grade}
                        </div>
                      )}
                      <div className="px-3.5 py-1 rounded-xl bg-white border border-emerald-200 text-emerald-950 font-black text-sm">
                        {submission.evaluation.marksAwarded} / {assignment.totalMarks}{' '}
                        <span className="text-[10px] font-bold text-emerald-700">marks</span>
                      </div>
                    </div>
                  </div>

                  {submission.evaluation.feedback && (
                    <div className="bg-white/80 border border-emerald-200 rounded-2xl p-3.5 text-xs space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                        Teacher Feedback:
                      </span>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
                        {submission.evaluation.feedback}
                      </p>
                    </div>
                  )}

                  <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600" />
                    <span>This submission has been graded. Further edits or resubmissions are closed.</span>
                  </div>
                </div>
              )}

              {/* SECTION: SUBMISSION / WORK AREA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Your Submission
                    </h3>
                    {submission && (
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                          submission.status === 'evaluated'
                            ? 'bg-emerald-100 text-emerald-800'
                            : submission.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : submission.status === 'submitted'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {submission.status === 'late' ? 'Submitted Late' : submission.status}
                      </span>
                    )}
                  </div>
                  {submission?.submittedAt && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Turned in: {new Date(submission.submittedAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Previously Uploaded Attachments by the Student */}
                {submission && submission.attachments && submission.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Turned In Files ({submission.attachments.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {submission.attachments.map((att) => (
                        <div
                          key={att._id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">
                              {att.originalName}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleDownloadSubmissionAttachment(
                                submission._id,
                                att._id,
                                att.originalName
                              )
                            }
                            disabled={downloadingKey === att._id}
                            className="text-xs text-[#0091ff] hover:underline font-bold shrink-0 ml-2 cursor-pointer disabled:opacity-50"
                          >
                            {downloadingKey === att._id ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Written Response Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Written Response / Solution Text</span>
                    {canSubmit() && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        Type or paste your answers here
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={5}
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    disabled={!canSubmit()}
                    placeholder={
                      canSubmit()
                        ? 'Type your answers, explanation, or notes for the teacher...'
                        : 'No written response submitted.'
                    }
                    className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent disabled:bg-slate-100 disabled:text-slate-600 leading-relaxed"
                  />
                </div>

                {/* File Upload Dropzone (Enabled only if submission is allowed) */}
                {canSubmit() && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Attach Files (Homework Scans, Documents, Worksheets)
                    </label>

                    <div className="border-2 border-dashed border-slate-200 hover:border-[#0d9488] transition-all rounded-2xl p-5 text-center bg-slate-50/50">
                      <input
                        type="file"
                        id="student-file-input"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="student-file-input"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                      >
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-xs font-bold text-[#0d9488]">
                          Click to browse or drop files here
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PDF, DOCX, PPTX, XLSX, Images, ZIP up to 25 MB each (Max 10 files)
                        </span>
                      </label>
                    </div>

                    {/* Staged New Files List */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Files to attach ({selectedFiles.length}):
                        </span>
                        <div className="space-y-1">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={`${file.name}-${idx}`}
                              className="flex items-center justify-between p-2 rounded-xl bg-teal-50/60 border border-teal-200 text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                                <span className="font-semibold text-slate-800 truncate">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Resubmission Comment (If Resubmitting) */}
                {canSubmit() && submission && (submission.status === 'submitted' || submission.status === 'late') && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Resubmission Note / Revision Comment (Optional)
                    </label>
                    <input
                      type="text"
                      value={resubmitComment}
                      onChange={(e) => setResubmitComment(e.target.value)}
                      placeholder="e.g. Corrected question 4; attached higher resolution scan"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    />
                  </div>
                )}

                {/* Validation Error Message */}
                {validationError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Submission History Section */}
                {submission?.submissionHistory && submission.submissionHistory.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>
                        Previous Versions ({submission.submissionHistory.length})
                      </span>
                      {showHistory ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {showHistory && (
                      <div className="mt-2 space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                        {submission.submissionHistory.map((hist) => (
                          <div
                            key={hist.version}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <span>Version {hist.version}</span>
                              <span className="text-slate-400">
                                {new Date(hist.submittedAt).toLocaleString()}
                              </span>
                            </div>
                            {hist.comment && (
                              <p className="text-[11px] text-slate-600 italic">
                                &ldquo;{hist.comment}&rdquo;
                              </p>
                            )}
                            {hist.content && (
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {hist.content}
                              </p>
                            )}
                            {hist.attachments && hist.attachments.length > 0 && (
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                <Paperclip className="w-3 h-3 text-slate-400" />
                                <span>{hist.attachments.length} attachment(s) recorded</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-[#f8fafc] flex items-center justify-between flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </Button>

          {canSubmit() && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {submission && (submission.status === 'submitted' || submission.status === 'late')
                        ? 'Resubmit Work'
                        : isOverdue()
                        ? 'Turn In (Late)'
                        : 'Turn In Assignment'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default StudentAssignmentDetailModal;

