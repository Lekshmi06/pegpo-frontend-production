import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
  FolderPlus,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  StudentAssignmentItem,
  StudentAssignmentDerivedStatus,
  AssignmentType,
} from '../../../types/assignment';
import { assignmentService } from '../../../services/assignmentService';
import { StudentAssignmentDetailModal } from '../../../components/student/assignments/StudentAssignmentDetailModal';
import { Button } from '../../../components/ui/Button';

type FilterTab = 'all' | 'pending' | 'submitted' | 'late' | 'evaluated';

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active modal
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getStudentAssignments();
      setAssignments(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Aggregate stats
  const stats = useMemo(() => {
    let pending = 0;
    let submitted = 0;
    let late = 0;
    let evaluated = 0;
    let overdue = 0;

    for (const item of assignments) {
      if (item.submissionStatus === 'evaluated') evaluated++;
      else if (item.submissionStatus === 'submitted') submitted++;
      else if (item.submissionStatus === 'late') late++;
      else if (item.submissionStatus === 'overdue') overdue++;
      else pending++;
    }

    return {
      total: assignments.length,
      pending: pending + overdue, // Total actionable work
      submitted: submitted + late,
      evaluated,
      overdue,
    };
  }, [assignments]);

  // Extract distinct subjects
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    assignments.forEach((a) => {
      if (a.assignment.subject) subs.add(a.assignment.subject);
    });
    return Array.from(subs).sort();
  }, [assignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      // Tab filter
      if (activeTab === 'pending') {
        if (item.submissionStatus !== 'pending' && item.submissionStatus !== 'overdue') {
          return false;
        }
      } else if (activeTab === 'submitted') {
        if (item.submissionStatus !== 'submitted') return false;
      } else if (activeTab === 'late') {
        if (item.submissionStatus !== 'late') return false;
      } else if (activeTab === 'evaluated') {
        if (item.submissionStatus !== 'evaluated') return false;
      }

      // Type filter
      if (selectedType !== 'all' && item.assignment.type !== selectedType) {
        return false;
      }

      // Subject filter
      if (
        selectedSubject !== 'all' &&
        item.assignment.subject.toLowerCase() !== selectedSubject.toLowerCase()
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.assignment.title.toLowerCase().includes(q);
        const matchesDesc = item.assignment.description?.toLowerCase().includes(q);
        const matchesSubject = item.assignment.subject.toLowerCase().includes(q);
        const matchesTeacher = item.assignment.teacherName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSubject && !matchesTeacher) {
          return false;
        }
      }

      return true;
    });
  }, [assignments, activeTab, selectedType, selectedSubject, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase tracking-wider">
              Student Workspace
            </span>
            <span className="text-slate-400 text-xs">?</span>
            <span className="text-xs font-bold text-slate-500">Assignments & Homework</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            My Homework & Assignments
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Complete assigned homework, submit worksheets, and view teacher feedback & grades.
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              To Do / Pending
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">{stats.pending}</span>
            {stats.overdue > 0 && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                {stats.overdue} overdue
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('submitted')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'submitted'
              ? 'bg-sky-50/70 border-sky-300 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Submitted
            </span>
            <Send className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.submitted}</div>
        </div>

        <div
          onClick={() => setActiveTab('evaluated')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'evaluated'
              ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Graded & Feedback
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.evaluated}</div>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-teal-50/70 border-teal-300 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Assigned
            </span>
            <BookOpen className="w-4 h-4 text-[#0d9488]" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.total}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs space-y-4">
        {/* Top Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          {(
            [
              { key: 'all', label: 'All Assignments' },
              { key: 'pending', label: 'Pending & To Do' },
              { key: 'submitted', label: 'Submitted' },
              { key: 'late', label: 'Late' },
              { key: 'evaluated', label: 'Evaluated' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#1c3352] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Dropdowns & Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, teacher, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="homework">Homework</option>
            <option value="assignment">Assignment</option>
            <option value="project">Project</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-[#0d9488] animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Fetching assignments from your classes...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-3xl bg-white border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Failed to Load Assignments</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAssignments}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAssignments.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No Assignments Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedSubject !== 'all' || selectedType !== 'all' || activeTab !== 'all'
              ? 'No assignments match your selected filter criteria. Try clearing some filters.'
              : 'You have no homework or assignments assigned to your enrolled classes at this time.'}
          </p>
          {(searchQuery || selectedSubject !== 'all' || selectedType !== 'all' || activeTab !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('all');
                setSelectedSubject('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Assignments Card Grid */}
      {!loading && !error && filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((item) => {
            const { assignment, submissionStatus, marksAwarded, grade, feedback } = item;
            const isLateStatus = submissionStatus === 'late';
            const isOverdue = submissionStatus === 'overdue';
            const isEvaluated = submissionStatus === 'evaluated';
            const isSubmitted = submissionStatus === 'submitted';

            return (
              <div
                key={assignment._id}
                className={`bg-white border rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isOverdue
                    ? 'border-rose-200 bg-rose-50/10'
                    : isEvaluated
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Badge Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-[#d6e8f6] text-[#1c3352]">
                      {assignment.subject}
                    </span>

                    {/* Status Badge */}
                    {isEvaluated ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Graded</span>
                      </span>
                    ) : isSubmitted ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Submitted</span>
                      </span>
                    ) : isLateStatus ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Submitted Late</span>
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Overdue</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>To Do</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Teacher */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                      {assignment.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      Assigned by {assignment.teacherName || 'Teacher'}
                    </p>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {assignment.description}
                  </p>
                </div>

                {/* Middle details & Score */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Score pill if evaluated */}
                  {isEvaluated && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                          Your Score
                        </span>
                        <span className="font-black text-emerald-950 text-sm">
                          {marksAwarded} / {assignment.totalMarks} marks
                        </span>
                      </div>
                      {grade && (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-2xs">
                          {grade}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date and Marks metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Due {new Date(assignment.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at {assignment.dueTime}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700">
                      {assignment.totalMarks} pts
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant={isEvaluated ? 'outline' : isSubmitted || isLateStatus ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => setSelectedAssignmentId(assignment._id)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-2xl font-bold ${
                      !isEvaluated && !isSubmitted && !isLateStatus
                        ? 'bg-[#0d9488] hover:bg-[#0f766e] text-white'
                        : ''
                    }`}
                  >
                    <span>
                      {isEvaluated
                        ? 'View Grade & Feedback'
                        : isSubmitted || isLateStatus
                        ? 'View / Resubmit'
                        : 'View & Turn In'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Submission Modal */}
      {selectedAssignmentId && (
        <StudentAssignmentDetailModal
          assignmentId={selectedAssignmentId}
          isOpen={Boolean(selectedAssignmentId)}
          onClose={() => setSelectedAssignmentId(null)}
          onSubmissionSuccess={() => {
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
};
export default StudentAssignments;

