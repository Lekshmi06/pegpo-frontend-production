import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Clock,
  Award,
  Users,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Archive,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import { EmptyState, ErrorState } from '../../../components/ui/StateViews';
import { assignmentService } from '../../../services/assignmentService';
import { classSectionService } from '../../../services/classSectionService';
import {
  AssignmentSummary,
  IAssignment,
  AssignmentStatus,
  AssignmentType,
} from '../../../types/assignment';
import { TeacherClassGroup } from '../../../types/classSection';
import { CreateAssignmentModal } from '../../../components/teacher/assignments/CreateAssignmentModal';
import { EditAssignmentModal } from '../../../components/teacher/assignments/EditAssignmentModal';
import { AssignmentDetailsModal } from '../../../components/teacher/assignments/AssignmentDetailsModal';
import { SubmissionTrackerModal } from '../../../components/teacher/assignments/SubmissionTrackerModal';
import { useToast } from '../../../hooks/useToast';

export default function TeacherAssignments() {
  const toast = useToast();

  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [classes, setClasses] = useState<TeacherClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<IAssignment | null>(null);
  const [detailsAssignment, setDetailsAssignment] = useState<IAssignment | null>(null);
  const [trackingAssignment, setTrackingAssignment] = useState<IAssignment | null>(null);

  // Fetch classes and assignments
  const loadClasses = useCallback(async () => {
    try {
      const groups = await classSectionService.getTeacherClasses();
      setClasses(groups);
    } catch (err) {
      console.warn('Failed to load teacher classes:', err);
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const summaries = await assignmentService.getTeacherAssignments({
        classSectionId: selectedClassId || undefined,
        status: (selectedStatus as AssignmentStatus) || undefined,
        type: (selectedType as AssignmentType) || undefined,
        search: searchQuery.trim() || undefined,
      });
      setAssignments(summaries);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedStatus, selectedType, searchQuery]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Overall metric counts
  const totalCount = assignments.length;
  const publishedCount = assignments.filter((a) => a.assignment.status === 'published').length;
  const draftCount = assignments.filter((a) => a.assignment.status === 'draft').length;
  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.stats.submittedCount || 0), 0);
  const totalNeedsGrading = assignments.reduce(
    (acc, a) => acc + Math.max(0, (a.stats.submittedCount || 0) - (a.stats.evaluatedCount || 0)),
    0
  );

  const handlePublishQuick = async (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await assignmentService.publishAssignment(assignmentId);
      toast.success('Assignment published to students!');
      loadAssignments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish assignment.');
    }
  };

  const handleArchiveQuick = async (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await assignmentService.archiveAssignment(assignmentId);
      toast.success('Assignment archived.');
      loadAssignments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to archive assignment.');
    }
  };

  const handleDeleteQuick = async (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await assignmentService.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully.');
      loadAssignments();
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete assignment.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f6fbfe] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#1c3352]" />
            Homework & Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create homework tasks, track student submissions in real-time, and record graded evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAssignments}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Assignment
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Created
          </span>
          <span className="text-xl font-black text-slate-900 block mt-1">{totalCount}</span>
          <span className="text-[11px] text-slate-500">Across all classes</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Published
          </span>
          <span className="text-xl font-black text-emerald-800 block mt-1">{publishedCount}</span>
          <span className="text-[11px] text-slate-500">Active assignments</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Drafts
          </span>
          <span className="text-xl font-black text-amber-800 block mt-1">{draftCount}</span>
          <span className="text-[11px] text-slate-500">Unpublished work</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
            Needs Grading
          </span>
          <span className="text-xl font-black text-purple-900 block mt-1">
            {totalNeedsGrading}
          </span>
          <span className="text-[11px] text-slate-500">Awaiting evaluation</span>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Class Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Class Section
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
            >
              <option value="">All Assigned Classes</option>
              {classes.map((c) => (
                <option key={c.classSectionId} value={c.classSectionId}>
                  {c.classLevel} - Sec {c.section}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assignment Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#1c3352]"
            >
              <option value="">All Types</option>
              <option value="homework">Homework</option>
              <option value="assignment">Assignment</option>
              <option value="project">Project</option>
            </select>
          </div>

          {/* Search by Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, subject..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1c3352]"
              />
            </div>
          </div>
        </div>

        {(selectedClassId || selectedStatus || selectedType || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 text-[11px]">Active filters applied</span>
            <button
              type="button"
              onClick={() => {
                setSelectedClassId('');
                setSelectedStatus('');
                setSelectedType('');
                setSearchQuery('');
              }}
              className="font-bold text-sky-600 hover:text-sky-800 text-[11px] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Assignment Cards Grid */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader size="lg" text="Loading assignments..." />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load assignments" message={error} onRetry={loadAssignments} />
        ) : assignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            message={
              selectedClassId || selectedStatus || selectedType || searchQuery
                ? 'No assignments match the selected filters.'
                : 'You have not created any assignments yet. Click below to create your first homework or project.'
            }
            onRetry={
              selectedClassId || selectedStatus || selectedType || searchQuery
                ? () => {
                    setSelectedClassId('');
                    setSelectedStatus('');
                    setSelectedType('');
                    setSearchQuery('');
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignments.map(({ assignment, stats }) => {
              const formattedDate = assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'No date';

              const completionPct =
                stats.totalTargeted > 0
                  ? Math.round((stats.submittedCount / stats.totalTargeted) * 100)
                  : 0;

              const isOverdue =
                new Date() > new Date(assignment.dueDate) && assignment.status === 'published';

              return (
                <div
                  key={assignment._id}
                  onClick={() => setDetailsAssignment(assignment)}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 select-none"
                >
                  {/* Top Badges & Subject */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg ${
                            assignment.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : assignment.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {assignment.status}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-sky-100 text-sky-800">
                          {assignment.type}
                        </span>
                      </div>

                      <span className="text-[11px] font-extrabold text-slate-500 truncate max-w-[130px]">
                        {assignment.subject}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 tracking-tight line-clamp-2 mb-1">
                      {assignment.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {assignment.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{formattedDate}</span>
                        <span className="text-[10px] text-slate-400">
                          ({assignment.dueTime || '23:59'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-bold text-slate-700">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{assignment.totalMarks} pts</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600">
                          {stats.submittedCount} of {stats.totalTargeted} Submitted
                        </span>
                        <span className="font-black text-slate-800">{completionPct}%</span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#1c3352] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, completionPct)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Graded: {stats.evaluatedCount}</span>
                        <span>Pending: {stats.pendingCount}</span>
                        {stats.lateCount > 0 && (
                          <span className="text-rose-600 font-bold">Late: {stats.lateCount}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrackingAssignment(assignment);
                      }}
                      className="text-xs flex-1"
                    >
                      Submissions ({stats.submittedCount})
                    </Button>

                    <div className="flex items-center gap-1">
                      {assignment.status === 'draft' && (
                        <button
                          type="button"
                          onClick={(e) => handlePublishQuick(assignment._id, e)}
                          title="Publish to students"
                          className="p-2 hover:bg-emerald-50 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {assignment.status === 'published' && (
                        <button
                          type="button"
                          onClick={(e) => handleArchiveQuick(assignment._id, e)}
                          title="Archive assignment"
                          className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAssignment(assignment);
                        }}
                        title="Edit assignment"
                        className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteQuick(assignment._id, e)}
                        title="Delete assignment"
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadAssignments}
        initialClassSectionId={selectedClassId}
      />

      <EditAssignmentModal
        isOpen={Boolean(editingAssignment)}
        onClose={() => setEditingAssignment(null)}
        assignment={editingAssignment}
        onUpdated={loadAssignments}
      />

      <AssignmentDetailsModal
        isOpen={Boolean(detailsAssignment)}
        onClose={() => setDetailsAssignment(null)}
        assignment={detailsAssignment}
        onOpenTracker={(a) => setTrackingAssignment(a)}
        onOpenEdit={(a) => setEditingAssignment(a)}
        onRefresh={loadAssignments}
      />

      <SubmissionTrackerModal
        isOpen={Boolean(trackingAssignment)}
        onClose={() => setTrackingAssignment(null)}
        assignment={trackingAssignment}
        onRefreshParent={loadAssignments}
      />
    </div>
  );
}
