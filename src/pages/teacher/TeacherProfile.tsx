import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Building2,
  GraduationCap,
  BookOpen,
  Target,
  Settings as SettingsIcon,
  Check,
  Plus,
  Save,
  Clock,
  Shield,
  Briefcase,
  Layers,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import teacherAvatar from '../../assets/user.png';
import { useTeacherProfile } from '../../hooks/useTeacherProfile';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import { teacherProfileService } from '../../services/teacherProfileService';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { TEACHER_GOALS, TeacherType } from '../../types/teacher';

type ProfileTab = 'personal' | 'teaching' | 'subjects' | 'goals' | 'settings';

const COMMON_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Computer Science',
  'English',
  'Social Science',
  'History',
  'Economics',
  'Commerce',
  'Accountancy',
];

const COMMON_CLASSES = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Undergraduate',
  'Postgraduate',
];

const COMMON_BOARDS = [
  'CBSE',
  'ICSE',
  'State Board',
  'Cambridge (IGCSE)',
  'IB',
  'University',
];

const DEPARTMENTS = [
  'Science',
  'Mathematics',
  'Humanities & Social Sciences',
  'Computer Science & IT',
  'Commerce & Management',
  'Languages & Literature',
];

export default function TeacherProfile() {
  const toast = useToast();
  const { profile, isLoading, isSaving, updateProfile } = useTeacherProfile();

  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Not specified');
  const [bio, setBio] = useState('');

  const [teacherType, setTeacherType] = useState<TeacherType>('institution');
  const [institution, setInstitution] = useState('');
  const [tuitionCentre, setTuitionCentre] = useState('');
  const [department, setDepartment] = useState('Science');
  const [designation, setDesignation] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [classesTaught, setClassesTaught] = useState<string[]>([]);
  const [boards, setBoards] = useState<string[]>([]);

  const [goal, setGoal] = useState('Lesson Planning');
  const [language, setLanguage] = useState('English');

  // Workspace active preferences
  const [activeDepartment, setActiveDepartment] = useState('Science');
  const [activeSubject, setActiveSubject] = useState('Physics');

  // Password update states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      const currentUser = authService.getCurrentUser();
      setName(profile.name || currentUser?.name || 'Teacher');
      setPhone(profile.phone || currentUser?.phone || '');
      setDob(profile.dob || currentUser?.dob || '');
      setGender(profile.gender || currentUser?.gender || 'Not specified');
      setBio(profile.bio || 'Dedicated educator focused on interactive pedagogy and student excellence.');

      setTeacherType(profile.teacherType || 'institution');
      setInstitution(profile.institution || currentUser?.teacherDetails?.institution || 'St. Xavier High School');
      setTuitionCentre(profile.tuitionCentre || currentUser?.teacherDetails?.tuitionCentre || '');
      setDepartment(profile.department || currentUser?.teacherDetails?.department || 'Science');
      setDesignation(profile.designation || currentUser?.teacherDetails?.designation || 'Senior Faculty');
      setExperienceYears(profile.experienceYears ?? currentUser?.teacherDetails?.experienceYears ?? 5);

      setSubjects(profile.subjects?.length ? profile.subjects : currentUser?.teacherDetails?.subjects || ['Physics']);
      setClassesTaught(profile.classesTaught?.length ? profile.classesTaught : currentUser?.teacherDetails?.classesTaught || ['Class 10', 'Class 11']);
      setBoards(profile.boards?.length ? profile.boards : currentUser?.teacherDetails?.boards || ['CBSE']);

      setGoal(profile.goal || currentUser?.goal || 'Lesson Planning');
      setLanguage(currentUser?.language || 'English');

      setActiveDepartment(
        profile.preferences?.activeDepartment ||
        profile.department ||
        currentUser?.teacherDetails?.department ||
        'Science'
      );
      setActiveSubject(
        profile.preferences?.activeSubject ||
        profile.subjects?.[0] ||
        currentUser?.teacherDetails?.subjects?.[0] ||
        'Physics'
      );
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        dob,
        gender,
        bio: bio.trim(),
        teacherType,
        institution: teacherType === 'institution' ? institution.trim() : undefined,
        tuitionCentre: teacherType === 'tuition' ? tuitionCentre.trim() : undefined,
        department: teacherType === 'institution' ? department : undefined,
        designation: designation.trim(),
        experienceYears: Number(experienceYears) || 0,
        subjects,
        classesTaught,
        boards,
        goal,
        preferences: {
          activeDepartment: activeDepartment || department,
          activeSubject: activeSubject || subjects[0] || 'General',
        },
      });

      authService.saveTeacherDetails({
        teacherType,
        institution: teacherType === 'institution' ? institution.trim() : undefined,
        tuitionCentre: teacherType === 'tuition' ? tuitionCentre.trim() : undefined,
        department: teacherType === 'institution' ? department : undefined,
        designation: designation.trim(),
        experienceYears: Number(experienceYears) || 0,
        subjects,
        classesTaught,
        boards,
      });

      toast.success('Teacher profile updated successfully!');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword.length < 3) {
      toast.error('Password must be at least 3 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await teacherProfileService.updatePassword(newPassword.trim());
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const toggleSubject = (sub: string) => {
    setSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const addSubject = () => {
    const trimmed = newSubject.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed]);
      setNewSubject('');
    }
  };

  const toggleClass = (cls: string) => {
    setClassesTaught((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const toggleBoard = (b: string) => {
    setBoards((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader size="lg" text="Loading teacher profile..." />
      </div>
    );
  }

  const userEmail =
    (profile?.userId && typeof profile.userId === 'object' && profile.userId.email) ||
    authService.getCurrentUser()?.email ||
    'teacher@edupye.com';

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={teacherAvatar}
            alt="Teacher"
            className="w-20 h-20 rounded-2xl border-2 border-[#254b73] object-cover shadow-xs"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-[#111827] tracking-tight">{name}</h1>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                teacherType === 'institution'
                  ? 'bg-blue-50 text-[#006bbd] border border-blue-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}>
                {teacherType === 'institution' ? 'Institution Faculty' : 'Tuition Educator'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-2">
              <span>{designation || 'Teacher'}</span>
              <span>•</span>
              <span>{teacherType === 'institution' ? institution : tuitionCentre || 'Private Tutor'}</span>
            </p>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{userEmail}</span>
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
          className="px-6 py-2.5 text-xs font-bold shrink-0 self-end md:self-center"
        >
          Save Changes
        </Button>
      </div>

      {/* Activity Overview Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-[#e2ebf4] rounded-2xl shadow-2xs">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subjects Handled</span>
          <span className="block text-xl font-black text-[#254b73] mt-0.5">{subjects.length}</span>
        </div>
        <div className="p-4 bg-white border border-[#e2ebf4] rounded-2xl shadow-2xs">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Classes Taught</span>
          <span className="block text-xl font-black text-[#254b73] mt-0.5">{classesTaught.length}</span>
        </div>
        <div className="p-4 bg-white border border-[#e2ebf4] rounded-2xl shadow-2xs">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Experience</span>
          <span className="block text-xl font-black text-[#254b73] mt-0.5">{experienceYears} Years</span>
        </div>
        <div className="p-4 bg-white border border-[#e2ebf4] rounded-2xl shadow-2xs">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Primary Goal</span>
          <span className="block text-xs font-black text-[#254b73] mt-1.5 truncate" title={goal}>{goal}</span>
        </div>
      </div>

      {/* 2. Horizontal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2ebf4] overflow-x-auto pb-px">
        {[
          { id: 'personal', label: 'Personal Details', icon: UserIcon },
          { id: 'teaching', label: 'Teaching Details', icon: Briefcase },
          { id: 'subjects', label: 'Subjects & Classes', icon: BookOpen },
          { id: 'goals', label: 'Teaching Goals', icon: Target },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#254b73] text-[#254b73] bg-white rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <div className="bg-white border border-[#e2ebf4] rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Tab 1: Personal Details */}
        {activeTab === 'personal' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">Personal Information</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage your contact and identity details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Display / Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                >
                  <option value="Not specified">Not specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-400 bg-slate-50 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Bio / Teaching Statement</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                  placeholder="Share a short bio about your pedagogical approach..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Teaching Details */}
        {activeTab === 'teaching' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">Teaching Credentials</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Institution, department, and teaching type configuration.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Teacher Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTeacherType('institution')}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      teacherType === 'institution'
                        ? 'border-[#0091ff] bg-[#f0f7ff] shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-extrabold text-[#111827]">Institution Teacher</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">School, College, or University</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeacherType('tuition')}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      teacherType === 'tuition'
                        ? 'border-[#0091ff] bg-[#f0f7ff] shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-extrabold text-[#111827]">Tuition Teacher</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Coaching Centre or Private Tutor</span>
                  </button>
                </div>
              </div>

              {teacherType === 'institution' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Institution / School / University</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Designation / Role</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Senior Faculty, PGT"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Tuition Centre Name (Optional)</label>
                  <input
                    type="text"
                    value={tuitionCentre}
                    onChange={(e) => setTuitionCentre(e.target.value)}
                    placeholder="e.g. Apex Learning Academy"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Years of Experience</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#0091ff]"
                  />
                  <span className="text-xs font-semibold text-slate-500">years in active teaching</span>
                </div>
              </div>

              {/* Active Workspace Preferences */}
              <div className="p-4 bg-[#f0f7ff] border border-blue-200 rounded-2xl space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">Active Workspace Preferences</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Choose your default active department and primary subject displayed in SmartBoard and Lesson Planner.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Active Department</label>
                    <select
                      value={activeDepartment}
                      onChange={(e) => setActiveDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Primary Active Subject</label>
                    <select
                      value={activeSubject}
                      onChange={(e) => setActiveSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                    >
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Subjects & Classes */}
        {activeTab === 'subjects' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">Subjects & Classes Taught</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Configure the subjects, grade levels, and curricula you handle.</p>
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Subjects</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SUBJECTS.map((sub) => {
                  const isSelected = subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0091ff] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {sub}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Custom subject..."
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff] w-48"
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Classes / Grades */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Classes / Grade Levels</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CLASSES.map((cls) => {
                  const isSelected = classesTaught.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#254b73] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Curricula & Boards</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_BOARDS.map((b) => {
                  const isSelected = boards.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBoard(b)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Goals */}
        {activeTab === 'goals' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">Teacher Primary Goal</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Select your primary objective on Edupye to personalize recommendations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEACHER_GOALS.map((g) => {
                const isSelected = goal === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0091ff] bg-[#f0f7ff] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#111827]">{g}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#0091ff] stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">Workspace Preferences</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Customize language and default workspace controls.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Platform Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#254b73]" />
                  Security & Role Details
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Your account is registered as a <strong>Verified Teacher</strong>. Institutional records and student relationships are mapped directly to your authenticated session.
                </p>
              </div>

              {/* Password Management */}
              <form onSubmit={handleUpdatePassword} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">Update Login Password</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Update your account password for sign in.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    isLoading={isUpdatingPassword}
                    className="px-4 py-2 text-xs font-bold"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
