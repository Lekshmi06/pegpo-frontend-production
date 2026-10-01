import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  RefreshCw,
  BookOpen,
  Calendar,
  ChevronRight,
  UserCheck,
  Award,
  AlertCircle,
  X,
  Mail,
  Hash,
  CheckCircle2,
  Loader2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { classSectionService } from '../../../services/classSectionService';
import { recognitionService } from '../../../services/recognitionService';
import { TeacherClassGroup, ClassStudentItem } from '../../../types/classSection';
import { StudentRecognition, RECOGNITION_STICKERS } from '../../../types/recognition';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Loader } from '../../../components/ui/Loader';
import { useToast } from '../../../hooks/useToast';
import defaultAvatar from '../../../assets/user.png';

export default function TeacherClasses() {
  const toast = useToast();
  const [classes, setClasses] = useState<TeacherClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected class for viewing students
  const [selectedGroup, setSelectedGroup] = useState<TeacherClassGroup | null>(null);
  const [students, setStudents] = useState<ClassStudentItem[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Recognition state
  const [classRecognitions, setClassRecognitions] = useState<StudentRecognition[]>([]);
  const [showAwardModal, setShowAwardModal] = useState<boolean>(false);
  const [awardStudent, setAwardStudent] = useState<ClassStudentItem | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string>('hard-working');
  const [stickerNote, setStickerNote] = useState<string>('');
  const [isSubmittingSticker, setIsSubmittingSticker] = useState<boolean>(false);

  // Student Detail / Recognition Modal
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailStudent, setDetailStudent] = useState<ClassStudentItem | null>(null);
  const [isRevokingStickerId, setIsRevokingStickerId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    classLevel: 'Class 10',
    section: 'A',
    board: 'CBSE',
    academicYear: '2026-2027',
    type: 'institution' as 'institution' | 'tuition',
  });

  // Enrollment states
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollRollNumber, setEnrollRollNumber] = useState('');
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    student?: {
      studentProfileId: string;
      name: string;
      email: string;
      studentType: string;
      classLevel?: string;
      board?: string;
    };
    alreadyEnrolled?: boolean;
    errorMessage?: string;
  } | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [inviteMode, setInviteMode] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const resetEnrollState = () => {
    setEnrollEmail('');
    setEnrollRollNumber('');
    setIsSearchingStudent(false);
    setLookupResult(null);
    setIsEnrolling(false);
    setInviteMode(false);
    setInviteName('');
    setIsInviting(false);
  };

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await classSectionService.getTeacherClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load teacher classes:', err);
      setError('Unable to load classes. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSelectGroup = async (group: TeacherClassGroup) => {
    setSelectedGroup(group);
    setIsLoadingStudents(true);
    try {
      const [data, recs] = await Promise.all([
        classSectionService.getClassStudents(group.classSectionId),
        recognitionService.getClassRecognitions(group.classSectionId),
      ]);
      setStudents(data);
      setClassRecognitions(recs);
    } catch (err) {
      console.error('Failed to load students and recognitions:', err);
      toast.error('Could not load student roster for this class');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleOpenAwardModal = (student: ClassStudentItem) => {
    setAwardStudent(student);
    setSelectedStickerId('hard-working');
    setStickerNote('');
    setShowAwardModal(true);
  };

  const handleOpenDetailModal = (student: ClassStudentItem) => {
    setDetailStudent(student);
    setShowDetailModal(true);
  };

  const handleAwardSticker = async () => {
    if (!selectedGroup || !awardStudent || !awardStudent.studentProfileId) {
      toast.error('Student profile ID is missing');
      return;
    }
    try {
      setIsSubmittingSticker(true);
      const newRec = await recognitionService.awardSticker({
        studentId: awardStudent.studentProfileId,
        classSectionId: selectedGroup.classSectionId,
        stickerId: selectedStickerId,
        description: stickerNote.trim() || undefined,
      });

      toast.success(`Awarded "${newRec.title}" sticker to ${awardStudent.name}!`);
      setClassRecognitions((prev) => [newRec, ...prev]);
      setShowAwardModal(false);
      setStickerNote('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to award sticker');
    } finally {
      setIsSubmittingSticker(false);
    }
  };

  const handleRevokeSticker = async (recognitionId: string) => {
    if (!confirm('Are you sure you want to remove this recognition sticker?')) return;
    try {
      setIsRevokingStickerId(recognitionId);
      await recognitionService.deleteRecognition(recognitionId);
      toast.success('Recognition sticker removed.');
      setClassRecognitions((prev) => prev.filter((r) => r._id !== recognitionId));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke sticker');
    } finally {
      setIsRevokingStickerId(null);
    }
  };

  const handleCreateClass = async () => {
    if (!createForm.classLevel || !createForm.section) {
      toast.error('Please specify class level and section');
      return;
    }

    try {
      await classSectionService.createClassSection(createForm);
      toast.success(`Created ${createForm.classLevel} - ${createForm.section} successfully!`);
      setShowCreateModal(false);
      loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create class section');
    }
  };

  const handleSearchStudent = async () => {
    const email = enrollEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid student email address');
      return;
    }

    try {
      setIsSearchingStudent(true);
      setLookupResult(null);
      setInviteMode(false);

      const student = await classSectionService.searchStudentByEmail(email);
      if (student) {
        // Check if student is already in the currently loaded roster
        const isAlreadyInRoster = students.some(
          (s) =>
            s.studentProfileId === student.studentProfileId ||
            (s.email && s.email.toLowerCase() === email)
        );

        setLookupResult({
          found: true,
          student,
          alreadyEnrolled: isAlreadyInRoster,
        });
      } else {
        setLookupResult({
          found: false,
          errorMessage: 'No EduPye student account found for this email.',
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error looking up student');
    } finally {
      setIsSearchingStudent(false);
    }
  };

  const handleConfirmEnroll = async () => {
    if (!selectedGroup || !lookupResult?.student) return;

    try {
      setIsEnrolling(true);
      await classSectionService.enrollStudent({
        studentProfileId: lookupResult.student.studentProfileId,
        email: lookupResult.student.email,
        classSectionId: selectedGroup.classSectionId,
        rollNumber: enrollRollNumber.trim() || undefined,
        academicYear: selectedGroup.academicYear,
      });

      toast.success(`${lookupResult.student.name} enrolled in ${selectedGroup.name} successfully!`);
      setShowEnrollModal(false);
      resetEnrollState();

      // Reload students and class counts immediately
      await handleSelectGroup(selectedGroup);
      await loadClasses();
    } catch (err: any) {
      const msg = err?.message || 'Failed to enroll student';
      if (msg.includes('already enrolled')) {
        setLookupResult((prev) => (prev ? { ...prev, alreadyEnrolled: true } : prev));
      }
      toast.error(msg);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedGroup || !enrollEmail.trim()) return;

    try {
      setIsInviting(true);
      await classSectionService.inviteStudent({
        classSectionId: selectedGroup.classSectionId,
        email: enrollEmail.trim().toLowerCase(),
        name: inviteName.trim() || undefined,
        rollNumber: enrollRollNumber.trim() || undefined,
      });

      toast.success(
        `Invitation registered for ${enrollEmail.trim()}! The student will be linked once they create their EduPye account.`
      );
      setShowEnrollModal(false);
      resetEnrollState();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fcff] overflow-y-auto p-4 sm:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#e2ebf4] shadow-2xs">
          <div>
            <h1 className="text-2xl font-black text-[#1c3352] tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#254b73]" />
              My Classes
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Academic groups, sections, and enrolled student rosters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadClasses}
              className="p-2 text-slate-500 hover:text-[#254b73] hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title="Refresh classes"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#254b73]' : ''}`} />
            </button>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#254b73] hover:bg-[#1a3857] text-white text-xs px-4 py-2 font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Class
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader label="Loading your classes..." />
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3 bg-rose-50 border border-rose-200 rounded-3xl p-6">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs font-semibold text-rose-700">{error}</p>
            <Button size="sm" onClick={loadClasses}>
              Retry
            </Button>
          </div>
        ) : classes.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No classes assigned yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first class/section or link your Teaching Contexts to begin scheduling tests and managing student rosters.
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-[#254b73] text-white text-xs">
              Create Class / Section
            </Button>
          </div>
        ) : (
          /* Class Cards Grid matching prompt requirements */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const isSelected = selectedGroup?.classSectionId === cls.classSectionId;
              return (
                <div
                  key={`${cls.classSectionId}-${cls.subject}`}
                  onClick={() => handleSelectGroup(cls)}
                  className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between h-48 cursor-pointer relative group ${
                    isSelected
                      ? 'border-[#254b73] ring-2 ring-[#254b73]/20 shadow-md'
                      : 'border-[#e2ebf4] hover:border-[#254b73]/50 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#e3edf7] text-[#1c3352]">
                        {cls.board || 'CBSE'} • {cls.academicYear}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#254b73] group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <h3 className="text-lg font-black text-[#1c3352] tracking-tight mt-1">
                      {cls.name || `${cls.classLevel} - ${cls.section}`}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <BookOpen className="w-3.5 h-3.5 text-[#254b73]" />
                      <span>{cls.subject}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Users className="w-4 h-4 text-[#254b73]" />
                      <span>{cls.studentCount} Students</span>
                    </div>

                    <span className="text-[11px] font-bold text-[#254b73] group-hover:underline">
                      View Roster &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Class Student Roster Section */}
        {selectedGroup && (
          <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#1c3352]">
                  {selectedGroup.name} &bull; Student Roster
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedGroup.subject} &bull; {selectedGroup.board} &bull; {selectedGroup.academicYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#f8fcff] border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-[#254b73]"
                  />
                </div>

                <Button
                  size="sm"
                  onClick={() => setShowEnrollModal(true)}
                  className="bg-[#254b73] text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Enroll
                </Button>
              </div>
            </div>

            {isLoadingStudents ? (
              <div className="py-12 text-center">
                <Loader label="Loading students roster..." />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-xs text-slate-400 font-medium">
                  {studentSearch ? 'No students match your search filter.' : 'No students enrolled in this group yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0f6fc] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Recognition</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((stu) => {
                      const stuRecs = classRecognitions.filter(
                        (r) =>
                          (typeof r.studentId === 'object' && r.studentId?._id === stu.studentProfileId) ||
                          r.studentId === stu.studentProfileId
                      );

                      const counts = stuRecs.reduce((acc, r) => {
                        acc[r.stickerId] = acc[r.stickerId] || { title: r.title, icon: r.icon, count: 0 };
                        acc[r.stickerId].count += 1;
                        return acc;
                      }, {} as Record<string, { title: string; icon: string; count: number }>);

                      const badges = Object.values(counts);

                      return (
                        <tr key={stu.membershipId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-700">
                            {stu.rollNumber || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <div
                              onClick={() => handleOpenDetailModal(stu)}
                              className="flex items-center gap-2.5 cursor-pointer group"
                              title="Click to view student details & recognitions"
                            >
                              <img
                                src={stu.avatar || defaultAvatar}
                                alt={stu.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                              <span className="font-bold text-slate-800 group-hover:text-[#254b73] group-hover:underline">
                                {stu.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {stu.email || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                stu.studentType === 'tuition'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {stu.studentType === 'tuition' ? 'Tuition' : 'Institution'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {badges.length === 0 ? (
                              <span className="text-[11px] text-slate-400 font-medium italic">No stickers yet</span>
                            ) : (
                              <div
                                onClick={() => handleOpenDetailModal(stu)}
                                className="flex flex-wrap items-center gap-1.5 cursor-pointer"
                                title="Click to view all recognition history"
                              >
                                {badges.slice(0, 3).map((b, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#f0f6fc] border border-[#254b73]/20 text-[#1c3352]"
                                  >
                                    <span>{b.icon}</span>
                                    <span>{b.title}</span>
                                    {b.count > 1 && (
                                      <span className="bg-[#254b73] text-white text-[9px] px-1 rounded-full font-black">
                                        &times;{b.count}
                                      </span>
                                    )}
                                  </span>
                                ))}
                                {badges.length > 3 && (
                                  <span className="text-[10px] font-bold text-slate-500">
                                    +{badges.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenAwardModal(stu)}
                                className="bg-[#254b73] hover:bg-[#1a3857] text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                title="Give Sticker"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Give Sticker</span>
                              </button>
                              <button
                                onClick={() => handleOpenDetailModal(stu)}
                                className="text-slate-400 hover:text-[#254b73] hover:bg-slate-100 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                                title="View Recognition & Details"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE CLASS MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Class / Section"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Class Level *</label>
            <input
              type="text"
              value={createForm.classLevel}
              onChange={(e) => setCreateForm({ ...createForm, classLevel: e.target.value })}
              placeholder="e.g. Class 10"
              className="w-full bg-[#f8fcff] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-[#254b73]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Section / Batch *</label>
            <input
              type="text"
              value={createForm.section}
              onChange={(e) => setCreateForm({ ...createForm, section: e.target.value })}
              placeholder="e.g. A, B, or Batch 1"
              className="w-full bg-[#f8fcff] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-[#254b73]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum Board</label>
              <select
                value={createForm.board}
                onChange={(e) => setCreateForm({ ...createForm, board: e.target.value })}
                className="w-full bg-[#f8fcff] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-[#254b73]"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State">State Board</option>
                <option value="IB">IB</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={createForm.academicYear}
                onChange={(e) => setCreateForm({ ...createForm, academicYear: e.target.value })}
                placeholder="2026-2027"
                className="w-full bg-[#f8fcff] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-[#254b73]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Group Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCreateForm({ ...createForm, type: 'institution' })}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  createForm.type === 'institution'
                    ? 'border-[#254b73] bg-[#e3edf7] text-[#1c3352]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Institution Class
              </button>
              <button
                type="button"
                onClick={() => setCreateForm({ ...createForm, type: 'tuition' })}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  createForm.type === 'tuition'
                    ? 'border-[#254b73] bg-[#e3edf7] text-[#1c3352]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Tuition Batch
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleCreateClass} className="bg-[#254b73] text-white text-xs px-5">
              Create Group
            </Button>
          </div>
        </div>
      </Modal>

      {/* ENROLL STUDENT MODAL */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          resetEnrollState();
        }}
        title={`Enroll Student in ${selectedGroup?.name || 'Class'}`}
      >
        <div className="space-y-4 py-2">
          {/* Email Search Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Email <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={enrollEmail}
                  onChange={(e) => {
                    setEnrollEmail(e.target.value);
                    if (lookupResult) setLookupResult(null);
                    if (inviteMode) setInviteMode(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchStudent();
                    }
                  }}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#f8fcff] border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#254b73]"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchStudent}
                disabled={isSearchingStudent || !enrollEmail.trim()}
                className="bg-[#254b73] hover:bg-[#1a3857] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isSearchingStudent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Search</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Search by the student&apos;s registered EduPye email address.
            </span>
          </div>

          {/* Roll Number (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Roll Number (Optional)
            </label>
            <input
              type="text"
              value={enrollRollNumber}
              onChange={(e) => setEnrollRollNumber(e.target.value)}
              placeholder="e.g. 101"
              className="w-full bg-[#f8fcff] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-[#254b73]"
            />
          </div>

          {/* Search Result: Found Student Preview */}
          {lookupResult?.found && lookupResult.student && (
            <div className="p-4 bg-[#f0f6fc] border border-[#254b73]/20 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-black text-[#1c3352] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Student Found
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    lookupResult.student.studentType === 'tuition'
                      ? 'bg-amber-100 text-amber-800'
                      : lookupResult.student.studentType === 'institution'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {lookupResult.student.studentType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Name</span>
                  <span className="font-bold text-slate-800">{lookupResult.student.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Email</span>
                  <span className="font-medium text-slate-600 truncate block">{lookupResult.student.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Class</span>
                  <span className="font-bold text-[#254b73]">{selectedGroup?.name}</span>
                </div>
                {enrollRollNumber && (
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Roll Number</span>
                    <span className="font-bold text-slate-700">{enrollRollNumber}</span>
                  </div>
                )}
              </div>

              {lookupResult.alreadyEnrolled ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Student is already enrolled in {selectedGroup?.name}.</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Search Result: Not Found */}
          {lookupResult && !lookupResult.found && !inviteMode && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>No EduPye student account found for this email.</span>
              </div>
              <p className="text-[11px] text-slate-500">
                You can invite this student to join your class. Once they register their EduPye account using this email, they will be connected automatically.
              </p>
              <button
                type="button"
                onClick={() => setInviteMode(true)}
                className="px-3.5 py-1.5 bg-[#254b73] text-white text-xs font-bold rounded-xl hover:bg-[#1a3857] transition-colors cursor-pointer"
              >
                Invite Student
              </button>
            </div>
          )}

          {/* Invite Mode Form */}
          {inviteMode && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-[#1c3352]">Invite New Student</h4>
              <p className="text-[11px] text-slate-600">
                Send an invitation to <span className="font-bold text-slate-800">{enrollEmail}</span> for <span className="font-bold text-[#254b73]">{selectedGroup?.name}</span>.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Name (Optional)</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-[#254b73]"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => {
                setShowEnrollModal(false);
                resetEnrollState();
              }}
              className="text-xs"
            >
              Cancel
            </Button>

            {inviteMode ? (
              <Button
                onClick={handleSendInvite}
                disabled={isInviting}
                className="bg-[#254b73] text-white text-xs px-5 font-bold"
              >
                {isInviting ? 'Sending Invite...' : 'Send Invitation'}
              </Button>
            ) : (
              <Button
                onClick={handleConfirmEnroll}
                disabled={!lookupResult?.found || lookupResult?.alreadyEnrolled || isEnrolling}
                className="bg-[#254b73] text-white text-xs px-5 font-bold disabled:opacity-50"
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* AWARD STICKER MODAL */}
      <Modal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        title="Recognize Student"
      >
        <div className="space-y-4 py-2">
          {awardStudent && (
            <div className="flex items-center gap-3 p-3 bg-[#f0f6fc] border border-[#254b73]/15 rounded-2xl">
              <img
                src={awardStudent.avatar || defaultAvatar}
                alt={awardStudent.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Student
                </span>
                <h4 className="text-sm font-black text-[#1c3352] truncate">
                  {awardStudent.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedGroup?.name} &bull; Roll: {awardStudent.rollNumber || 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Choose a Recognition:
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {RECOGNITION_STICKERS.map((stk) => {
                const isSelected = selectedStickerId === stk.id;
                return (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => setSelectedStickerId(stk.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#254b73] bg-[#e3edf7] ring-1 ring-[#254b73]'
                        : 'border-slate-200 bg-white hover:border-[#254b73]/40 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl leading-none shrink-0">{stk.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {stk.title}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {stk.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note (Optional)
            </label>
            <textarea
              value={stickerNote}
              onChange={(e) => setStickerNote(e.target.value)}
              placeholder="e.g. Consistently completes assignments on time."
              rows={2}
              className="w-full bg-[#f8fcff] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-[#254b73]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowAwardModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAwardSticker}
              disabled={isSubmittingSticker}
              className="bg-[#254b73] hover:bg-[#1a3857] text-white text-xs px-5 font-bold flex items-center gap-1.5"
            >
              {isSubmittingSticker ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Awarding...</span>
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  <span>Award Sticker</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* STUDENT DETAIL & RECOGNITION MODAL */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Student Details & Recognition"
      >
        {detailStudent && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3.5 bg-[#f0f6fc] border border-[#254b73]/15 rounded-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={detailStudent.avatar || defaultAvatar}
                  alt={detailStudent.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-black text-[#1c3352]">{detailStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{detailStudent.email || 'No email'}</p>
                  <p className="text-[11px] text-slate-500">
                    Roll No: <span className="font-bold text-slate-700">{detailStudent.rollNumber || 'N/A'}</span> &bull;{' '}
                    Class: <span className="font-bold text-[#254b73]">{selectedGroup?.name}</span>
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenAwardModal(detailStudent);
                }}
                className="bg-[#254b73] hover:bg-[#1a3857] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Give Sticker</span>
              </Button>
            </div>

            {/* Recognition Summary Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Recognition
              </h4>
              {(() => {
                const stuRecs = classRecognitions.filter(
                  (r) =>
                    (typeof r.studentId === 'object' && r.studentId?._id === detailStudent.studentProfileId) ||
                    r.studentId === detailStudent.studentProfileId
                );

                const counts = stuRecs.reduce((acc, r) => {
                  acc[r.stickerId] = acc[r.stickerId] || { title: r.title, icon: r.icon, count: 0 };
                  acc[r.stickerId].count += 1;
                  return acc;
                }, {} as Record<string, { title: string; icon: string; count: number }>);

                const badges = Object.values(counts);

                if (badges.length === 0) {
                  return (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                      No stickers awarded yet. Click &quot;Give Sticker&quot; to recognize this student&apos;s effort!
                    </div>
                  );
                }

                return (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f0f6fc] border border-[#254b73]/25 text-[#1c3352]"
                      >
                        <span className="text-sm">{b.icon}</span>
                        <span>{b.title}</span>
                        {b.count > 1 && (
                          <span className="bg-[#254b73] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                            &times;{b.count}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Recent Recognition List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Recent Recognition
              </h4>
              {(() => {
                const stuRecs = classRecognitions.filter(
                  (r) =>
                    (typeof r.studentId === 'object' && r.studentId?._id === detailStudent.studentProfileId) ||
                    r.studentId === detailStudent.studentProfileId
                );

                if (stuRecs.length === 0) {
                  return (
                    <p className="text-xs text-slate-400 italic">No award history found.</p>
                  );
                }

                return (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {stuRecs.map((rec) => {
                      const dateStr = new Date(rec.awardedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      const teacherName =
                        typeof rec.teacherId === 'object' && rec.teacherId?.name
                          ? rec.teacherId.name
                          : 'You';

                      return (
                        <div
                          key={rec._id}
                          className="flex items-start justify-between p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="text-lg leading-none mt-0.5">{rec.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">{rec.title}</span>
                                <span className="text-[11px] text-slate-400 font-medium">&bull; {dateStr}</span>
                              </div>
                              {rec.description && (
                                <p className="text-[11px] text-slate-600 mt-0.5 italic">
                                  &quot;{rec.description}&quot;
                                </p>
                              )}
                              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                Awarded by {teacherName}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRevokeSticker(rec._id)}
                            disabled={isRevokingStickerId === rec._id}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer shrink-0 ml-2"
                            title="Revoke sticker"
                          >
                            {isRevokingStickerId === rec._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
