import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  Trash2,
  Edit,
  UserCheck,
} from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import { courseService } from '../../services/courseService';
import {
  IInstitution,
  IInstitutionMembership,
  ITrainingProgram,
  IDepartment,
} from '../../types/institution';
import { ICourse } from '../../types/course';

interface OutletContextType {
  currentInst: IInstitution | null;
  currentMembership: IInstitutionMembership | null;
  reloadInstitutions: () => Promise<void>;
}

export default function CorporatePrograms() {
  const { currentInst, currentMembership } = useOutletContext<OutletContextType>();

  const [programs, setPrograms] = useState<ITrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableCourses, setAvailableCourses] = useState<ICourse[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [employees, setEmployees] = useState<IInstitutionMembership[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProgramForAssign, setSelectedProgramForAssign] = useState<ITrainingProgram | null>(null);
  const [viewingProgram, setViewingProgram] = useState<ITrainingProgram | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Onboarding');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedDeptNames, setSelectedDeptNames] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canManagePrograms =
    currentMembership?.role === 'admin' ||
    (currentMembership?.role === 'subadmin' &&
      Array.isArray(currentMembership?.permissions) &&
      (currentMembership.permissions.includes('create_programs') ||
        currentMembership.permissions.includes('manage_programs')));

  useEffect(() => {
    if (currentInst) {
      loadData();
    }
  }, [currentInst, selectedCategory, search]);

  const loadData = async () => {
    if (!currentInst) return;
    try {
      setLoading(true);
      const [progList, courseRes, deptList, memberRes] = await Promise.all([
        institutionService.getTrainingPrograms(currentInst._id, {
          category: selectedCategory,
          search: search || undefined,
        }),
        courseService.getMarketplaceCourses(),
        institutionService.getDepartments(currentInst._id),
        institutionService.getMembers(currentInst._id, { role: 'trainee', status: 'active' }),
      ]);
      setPrograms(progList || []);
      setAvailableCourses(courseRes.courses || []);
      setDepartments(deptList || []);
      setEmployees(memberRes.members || []);
    } catch (err) {
      console.error('Failed to load corporate programs data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInst) return;
    if (!title.trim()) {
      setFormError('Program title is required.');
      return;
    }
    if (selectedCourseIds.length === 0) {
      setFormError('Please select at least one course for this training program.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);

      await institutionService.createTrainingProgram(currentInst._id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        courses: selectedCourseIds.map((cId, idx) => ({
          courseId: cId,
          isRequired: true,
          order: idx,
        })),
        assignedEmployees: selectedEmployeeIds,
        assignedDepartments: selectedDeptNames,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimatedDurationHours: Number(durationHours) || 0,
        status: 'active',
      });

      // Reset
      setTitle('');
      setDescription('');
      setSelectedCourseIds([]);
      setSelectedEmployeeIds([]);
      setSelectedDeptNames([]);
      setDueDate('');
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create training program.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAssignProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInst || !selectedProgramForAssign) return;

    try {
      setFormSubmitting(true);
      setFormError(null);

      await institutionService.assignProgram(
        currentInst._id,
        selectedProgramForAssign._id,
        {
          employeeIds: selectedEmployeeIds,
          departments: selectedDeptNames,
        }
      );

      setSelectedEmployeeIds([]);
      setSelectedDeptNames([]);
      setIsAssignModalOpen(false);
      setSelectedProgramForAssign(null);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to assign program.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProgram = async (programId: string, programTitle: string) => {
    if (!currentInst) return;
    if (!confirm(`Are you sure you want to delete the program "${programTitle}"?`)) return;

    try {
      await institutionService.deleteTrainingProgram(currentInst._id, programId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete program.');
    }
  };

  const categories = ['all', 'Onboarding', 'Compliance', 'Security', 'Engineering', 'Leadership', 'Sales'];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Corporate Curriculum & Tracks
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Workforce Training Programs
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Design structured onboarding tracks, compliance journeys, and skill upskilling pathways. Assign existing LMS courses with automatic enrollment.
          </p>
        </div>

        {canManagePrograms && (
          <button
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Training Program</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors shrink-0 capitalize ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400">
          Loading corporate training tracks...
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No Training Programs Found</h3>
            <p className="text-xs text-slate-500">
              Create your company’s first training program to bundle courses, configure deadlines, and assign them to employees or departments.
            </p>
          </div>
          {canManagePrograms && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Program</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div
              key={prog._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {prog.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                    {prog.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight line-clamp-1">
                    {prog.title}
                  </h3>
                  {prog.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {prog.description}
                    </p>
                  )}
                </div>

                {/* Courses included in program */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Curriculum Courses ({prog.courses?.length || 0})</span>
                    {prog.estimatedDurationHours ? (
                      <span className="flex items-center gap-1 font-semibold text-slate-500">
                        <Clock className="w-3 h-3" />
                        {prog.estimatedDurationHours} hrs
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {prog.courses?.map((cItem, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate flex-1">
                          {cItem.courseId?.title || 'Course Module'}
                        </span>
                        {cItem.isRequired && (
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignment statistics */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700">
                      {prog.assignedEmployees?.length || 0}
                    </span>{' '}
                    employees
                  </div>
                  {prog.dueDate && (
                    <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
                      <Calendar className="w-3 h-3" />
                      Due {new Date(prog.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingProgram(prog)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {canManagePrograms && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProgramForAssign(prog);
                        setSelectedEmployeeIds([]);
                        setSelectedDeptNames([]);
                        setIsAssignModalOpen(true);
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition-colors cursor-pointer"
                    >
                      Assign
                    </button>
                    {currentMembership?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteProgram(prog._id, prog.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PROGRAM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Create Training Program
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bundle existing courses into a workforce learning track.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Enablement Onboarding 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Track Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Onboarding">New Hire Onboarding</option>
                    <option value="Compliance">Compliance & Legal</option>
                    <option value="Security">InfoSec & IT Best Practices</option>
                    <option value="Engineering">Engineering Standards</option>
                    <option value="Leadership">Leadership & Management</option>
                    <option value="Sales">Sales & Customer Success</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Est. Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Objectives and syllabus summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Select LMS Courses */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Assign Existing LMS Courses *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Selected: {selectedCourseIds.length} course(s)
                  </span>
                </div>
                <div className="border border-slate-200 rounded-2xl p-3 max-h-44 overflow-y-auto space-y-2 bg-slate-50/50">
                  {availableCourses.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No published courses found. Build courses in Course Studio first.
                    </div>
                  ) : (
                    availableCourses.map((c) => {
                      const isChecked = selectedCourseIds.includes(c._id);
                      return (
                        <label
                          key={c._id}
                          className={`flex items-center gap-3 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCourseIds([...selectedCourseIds, c._id]);
                              } else {
                                setSelectedCourseIds(selectedCourseIds.filter((id) => id !== c._id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold truncate">{c.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>{c.category}</span>
                              <span>•</span>
                              <span>{c.totalLessons} lessons</span>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Initial Department Assignments */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  Assign to Entire Departments (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {departments.length === 0 ? (
                    <span className="text-xs text-slate-400">No departments configured yet.</span>
                  ) : (
                    departments.map((d) => {
                      const isSelected = selectedDeptNames.includes(d.name);
                      return (
                        <button
                          type="button"
                          key={d._id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedDeptNames(selectedDeptNames.filter((name) => name !== d.name));
                            } else {
                              setSelectedDeptNames([...selectedDeptNames, d.name]);
                            }
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {d.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {formSubmitting ? 'Creating...' : 'Create & Provision Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN PROGRAM MODAL */}
      {isAssignModalOpen && selectedProgramForAssign && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Assign Program: {selectedProgramForAssign.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select staff members or departments to enroll into this track.
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignProgram} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assign by Department
                </label>
                <div className="flex flex-wrap gap-2">
                  {departments.map((d) => {
                    const isSelected = selectedDeptNames.includes(d.name);
                    return (
                      <button
                        type="button"
                        key={d._id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDeptNames(selectedDeptNames.filter((n) => n !== d.name));
                          } else {
                            setSelectedDeptNames([...selectedDeptNames, d.name]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-semibold cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assign Individual Employees ({employees.length} available)
                </label>
                <div className="border border-slate-200 rounded-2xl p-2.5 max-h-48 overflow-y-auto space-y-1.5 bg-slate-50">
                  {employees.map((emp) => {
                    const empUserId = emp.userId?._id;
                    const isChecked = selectedEmployeeIds.includes(empUserId);
                    return (
                      <label
                        key={emp._id}
                        className={`flex items-center gap-3 p-2 rounded-xl border text-xs cursor-pointer ${
                          isChecked
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployeeIds([...selectedEmployeeIds, empUserId]);
                            } else {
                              setSelectedEmployeeIds(
                                selectedEmployeeIds.filter((id) => id !== empUserId)
                              );
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800">
                            {emp.userId?.name || emp.userId?.email}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {emp.title || 'Employee'} • {emp.department || 'No dept'}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {formSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROGRAM DETAILS DRAWER / MODAL */}
      {viewingProgram && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {viewingProgram.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {viewingProgram.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingProgram(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewingProgram.description && (
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {viewingProgram.description}
              </p>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Included Course Curriculum
              </h4>
              <div className="space-y-2">
                {viewingProgram.courses?.map((cItem, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {cItem.courseId?.title}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {cItem.courseId?.totalLessons || 0} lessons • {cItem.courseId?.category || 'General'}
                        </div>
                      </div>
                    </div>
                    {cItem.courseId?._id && (
                      <Link
                        to={`/courses/${cItem.courseId._id}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 shrink-0"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingProgram(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
