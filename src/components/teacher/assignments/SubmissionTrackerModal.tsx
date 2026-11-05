import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  Award,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Loader } from '../../ui/Loader';
import { EmptyState, ErrorState } from '../../ui/StateViews';
import { assignmentService } from '../../../services/assignmentService';
import {
  IAssignment,
  AssignmentSubmissionsResult,
  StudentSubmissionItem,
  SubmissionStatus,
} from '../../../types/assignment';
import { EvaluateSubmissionModal } from './EvaluateSubmissionModal';
import { useToast } from '../../../hooks/useToast';

interface SubmissionTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: IAssignment | null;
  onRefreshParent?: () => void;
}

type FilterTab = 'all' | 'pending' | 'submitted' | 'late' | 'evaluated';

export const SubmissionTrackerModal: React.FC<SubmissionTrackerModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onRefreshParent,
}) => {
  const toast = useToast();

  const [data, setData] = useState<AssignmentSubmissionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  // Selected submission for evaluation modal
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmissionItem | null>(null);
  const [showEvalModal, setShowEvalModal] = useState(false);

  const loadSubmissions = useCallback(async () => {
    if (!assignment) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await assignmentService.getAssignmentSubmissions(assignment._id);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment submissions.');
    } finally {
      setIsLoading(false);
    }
  }, [assignment]);

  useEffect(() => {
    if (isOpen && assignment) {
      loadSubmissions();
    } else {
      setData(null);
      setActiveTab('all');
      setSearch('');
    }
  }, [isOpen, assignment, loadSubmissions]);

  if (!assignment) return null;

  const summary = data?.summary || {
    totalStudents: 0,
    submittedCount: 0,
    evaluatedCount: 0,
    lateCount: 0,
    pendingCount: 0,
  };

  const submissions = data?.submissions || [];

  const filteredSubmissions = submissions.filter((sub) => {
    // Filter by tab
    if (activeTab === 'pending' && sub.status !== 'pending') return false;
    if (activeTab === 'submitted' && sub.status !== 'submitted' && sub.status !== 'late') return false;
    if (activeTab === 'late' && !sub.isLate) return false;
    if (activeTab === 'evaluated' && sub.status !== 'evaluated') return false;

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = sub.studentName.toLowerCase().includes(q);
      const matchEmail = sub.studentEmail.toLowerCase().includes(q);
      const matchRoll = sub.rollNumber && sub.rollNumber.toLowerCase().includes(q);
      return matchName || matchEmail || matchRoll;
    }

    return true;
  });

  const handleOpenEvaluation = (sub: StudentSubmissionItem) => {
    setSelectedSubmission(sub);
    setShowEvalModal(true);
  };

  const handleEvaluationComplete = () => {
    loadSubmissions();
    if (onRefreshParent) onRefreshParent();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Submission Tracker: ${assignment.title}`}
        maxWidth="5xl"
      >
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Targeted
              </span>
              <span className="text-lg font-black text-slate-800 block mt-0.5">
                {summary.totalStudents}
              </span>
              <span className="text-[10px] text-slate-500">Students</span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-center">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                Submitted
              </span>
              <span className="text-lg font-black text-sky-900 block mt-0.5">
                {summary.submittedCount}
              </span>
              <span className="text-[10px] text-sky-600">Total turned in</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Pending
              </span>
              <span className="text-lg font-black text-amber-900 block mt-0.5">
                {summary.pendingCount}
              </span>
              <span className="text-[10px] text-amber-600">Not yet turned in</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Late
              </span>
              <span className="text-lg font-black text-rose-900 block mt-0.5">
                {summary.lateCount}
              </span>
              <span className="text-[10px] text-rose-600">Past deadline</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Evaluated
              </span>
              <span className="text-lg font-black text-purple-900 block mt-0.5">
                {summary.evaluatedCount}
              </span>
              <span className="text-[10px] text-purple-600">Graded</span>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { id: 'all', label: `All (${summary.totalStudents})` },
                  { id: 'submitted', label: `Submitted (${summary.submittedCount})` },
                  { id: 'pending', label: `Pending (${summary.pendingCount})` },
                  { id: 'late', label: `Late (${summary.lateCount})` },
                  { id: 'evaluated', label: `Evaluated (${summary.evaluatedCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#1c3352] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={loadSubmissions}
                isLoading={isLoading}
                title="Refresh list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Students Roster Content */}
          <div className="min-h-[280px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader size="md" text="Loading submissions tracker..." />
              </div>
            ) : error ? (
              <ErrorState title="Failed to load tracker" message={error} onRetry={loadSubmissions} />
            ) : filteredSubmissions.length === 0 ? (
              <EmptyState
                title="No students found"
                message={
                  activeTab === 'all'
                    ? 'No students are targeted for this assignment.'
                    : `No students found under the '${activeTab}' filter.`
                }
              />
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {filteredSubmissions.map((sub) => {
                  const hasSubmitted = sub.status !== 'pending' && sub.status !== 'draft';
                  const isEvaluated = sub.status === 'evaluated';

                  return (
                    <div
                      key={sub.studentProfileId}
                      className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Student Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {sub.studentName}
                          </span>
                          {sub.rollNumber && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {sub.rollNumber}
                            </span>
                          )}

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg ${
                              sub.status === 'evaluated'
                                ? 'bg-purple-100 text-purple-800'
                                : sub.status === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : sub.status === 'submitted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {sub.status}
                          </span>

                          {sub.isLate && (
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-100 text-rose-800">
                              LATE
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{sub.studentEmail}</span>
                          <span>•</span>
                          <span>
                            {sub.submittedAt
                              ? `Turned in ${new Date(sub.submittedAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}`
                              : 'Pending work submission'}
                          </span>
                          {sub.attachmentCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-sky-700">
                                {sub.attachmentCount} file(s) attached
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Marks & Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isEvaluated ? (
                          <div className="text-right">
                            <span className="text-xs font-black text-purple-900 block">
                              {sub.marksAwarded} / {assignment.totalMarks} pts
                            </span>
                            {sub.grade && (
                              <span className="text-[10px] font-bold text-purple-600 block">
                                Grade: {sub.grade}
                              </span>
                            )}
                          </div>
                        ) : hasSubmitted ? (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                            Awaiting Evaluation
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Not submitted
                          </span>
                        )}

                        {hasSubmitted && (
                          <Button
                            variant={isEvaluated ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleOpenEvaluation(sub)}
                            leftIcon={<Award className="w-3.5 h-3.5" />}
                          >
                            {isEvaluated ? 'Review / Edit' : 'Evaluate Work'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Nested Evaluation Modal */}
      {selectedSubmission && (
        <EvaluateSubmissionModal
          isOpen={showEvalModal}
          onClose={() => setShowEvalModal(false)}
          assignment={assignment}
          submissionItem={selectedSubmission}
          onEvaluated={handleEvaluationComplete}
        />
      )}
    </>
  );
};

