import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  Download,
  Award,
  CheckCircle2,
  Clock,
  User,
  HelpCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  TuitionProgramAssessmentItem,
  TuitionAssessmentSubmission,
  tuitionService,
} from '../../services/tuitionService';

interface AssignmentSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: TuitionProgramAssessmentItem;
}

export const AssignmentSubmissionsModal: React.FC<AssignmentSubmissionsModalProps> = ({
  isOpen,
  onClose,
  assessment,
}) => {
  const [submissions, setSubmissions] = useState<TuitionAssessmentSubmission[]>(
    assessment.submissions || []
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && assessment._id) {
      setLoading(true);
      setErrorMsg(null);
      tuitionService
        .getAssessmentSubmissions(assessment._id)
        .then((res) => {
          if (res.success && res.submissions) {
            setSubmissions(res.submissions);
          }
        })
        .catch((err) => {
          console.warn('Failed to refresh assessment submissions:', err);
          // Fall back to assessment.submissions
          if (assessment.submissions) setSubmissions(assessment.submissions);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, assessment]);

  if (!isOpen || !assessment) return null;

  const isMcq = assessment.type === 'mcq_test';

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isMcq
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                }`}
              >
                {isMcq ? 'MCQ Test Submissions' : 'Homework PDF Submissions'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total Points: {assessment.totalMarks}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {assessment.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span>Loading student submissions...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No Submissions Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isMcq
                  ? 'Students have not taken this MCQ test yet. Auto-graded scores will appear here in real time.'
                  : 'Students have not uploaded their homework PDFs for this assignment yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span>Submitted Students ({submissions.length})</span>
                <span>{isMcq ? 'Auto-Graded Score' : 'Submitted PDF'}</span>
              </div>

              {submissions.map((sub, i) => {
                const studentName =
                  sub.studentName ||
                  (typeof sub.studentId === 'object' ? sub.studentId?.name : '') ||
                  `Student #${i + 1}`;
                const studentCode =
                  sub.studentCode ||
                  (typeof sub.studentId === 'object' ? sub.studentId?.studentCode : '') ||
                  '';

                return (
                  <div
                    key={sub._id || i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs font-bold shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {studentName}
                          </span>
                          {studentCode && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {studentCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Result or PDF Link */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {isMcq ? (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-right">
                          <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                            {sub.score ?? 0} / {sub.totalMarks ?? assessment.totalMarks}
                          </div>
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {sub.percentage ?? 0}% Auto-Graded
                          </div>
                        </div>
                      ) : sub.fileUrl ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 text-xs font-bold transition-colors shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="truncate max-w-[150px]">
                              {sub.fileName || 'View Submission.pdf'}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {sub.fileSize && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {formatFileSize(sub.fileSize)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No file attached</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end shrink-0 bg-slate-50/50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmissionsModal;
