import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentAssignmentItem } from '../../../types/assignment';
import { assignmentService } from '../../../services/assignmentService';
import { StudentAssignmentDetailModal } from '../assignments/StudentAssignmentDetailModal';
import { Button } from '../../ui/Button';

interface HomeworkViewProps {
  tasks?: any[]; // Keep prop signature compatible with Practice.tsx
  selectedSubject?: string;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  selectedSubject = 'All',
}) => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getStudentAssignments({
        subject: selectedSubject !== 'All' ? selectedSubject : undefined,
      });
      setAssignments(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filtered = assignments.filter((item) => {
    if (
      selectedSubject !== 'All' &&
      item.assignment.subject.toLowerCase() !== selectedSubject.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Real workspace prompt banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-transparent border border-teal-200/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0d9488] text-white text-[10px] font-extrabold uppercase">
              Official Classwork
            </span>
            <span className="text-xs font-bold text-slate-700">Live Assignments System</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Turn in coursework, attach answer sheets, and review evaluated marks and feedback from your instructors.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate('/student/homework')}
          className="bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <span>Open Full Workspace</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>

      {loading && (
        <div className="py-16 flex flex-col items-center justify-center space-y-2 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-6 h-6 text-[#0d9488] animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your assignments...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchAssignments}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No Pending Homework</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no assignments assigned for{' '}
            {selectedSubject !== 'All' ? selectedSubject : 'your enrolled classes'}.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((item) => {
            const { assignment, submissionStatus, marksAwarded, grade } = item;
            const isEvaluated = submissionStatus === 'evaluated';
            const isSubmitted = submissionStatus === 'submitted';
            const isLate = submissionStatus === 'late';
            const isOverdue = submissionStatus === 'overdue';

            return (
              <div
                key={assignment._id}
                onClick={() => setSelectedAssignmentId(assignment._id)}
                className="bg-white rounded-3xl border border-[#e2ebf4] p-5 shadow-2xs hover:shadow-md hover:border-[#0d9488]/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase">
                      {assignment.subject}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        isEvaluated
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSubmitted
                          ? 'bg-sky-100 text-sky-800'
                          : isLate
                          ? 'bg-amber-100 text-amber-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isEvaluated
                        ? 'Graded'
                        : isSubmitted
                        ? 'Submitted'
                        : isLate
                        ? 'Submitted Late'
                        : isOverdue
                        ? 'Overdue'
                        : 'To Do'}
                    </span>
                    {isEvaluated && grade && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Grade {grade}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-[#111827] group-hover:text-[#0d9488] transition-colors">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Assigned by {assignment.teacherName || 'Teacher'} • Due:{' '}
                    {new Date(assignment.dueDate).toLocaleDateString()} at {assignment.dueTime}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isEvaluated && (
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      {marksAwarded} / {assignment.totalMarks} pts
                    </span>
                  )}
                  <span className="text-xs font-bold text-[#0d9488] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>
                      {isEvaluated
                        ? 'View Feedback'
                        : isSubmitted || isLate
                        ? 'View Submission'
                        : 'Turn In'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedAssignmentId && (
        <StudentAssignmentDetailModal
          assignmentId={selectedAssignmentId}
          isOpen={Boolean(selectedAssignmentId)}
          onClose={() => setSelectedAssignmentId(null)}
          onSubmissionSuccess={fetchAssignments}
        />
      )}
    </div>
  );
};
export default HomeworkView;
