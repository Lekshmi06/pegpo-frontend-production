import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  GraduationCap,
  Sparkles,
  Shield,
  CreditCard,
  School as SchoolIcon,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Globe,
  Search,
  Trophy,
  Edit3,
  Trash2,
  Download,
  Calendar,
  Phone,
  Mail,
  FileCheck,
  Upload,
  Check,
  Layers,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import { authService } from '../../services/authService';
import { subscriptionService } from '../../services/subscriptionService';
import { useToast } from '../../hooks/useToast';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { ErrorState, EmptyState } from '../../components/ui/StateViews';
import {
  SubscriptionPlan,
  UserSubscription,
  InvoiceItem,
  PlanPeriod,
} from '../../types/subscription';

type ProfileTab = 'personal' | 'academic' | 'subscription' | 'security';

const COMMON_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'General Science',
  'Social Studies',
  'History',
  'Geography',
  'English Literature',
  'Computer Science',
  'Economics',
  'Hindi',
  'Custom',
];

const CURRICULUM_BOARDS = [
  'CBSE',
  'ICSE',
  'State Board',
  'Cambridge (IGCSE)',
  'IB (International Baccalaureate)',
  'Other',
];

const CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    profile,
    isLoading,
    isSaving,
    error,
    refetch,
    updateProfile,
  } = useStudentProfile();

  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Personal Info Form State
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'Not specified',
    language: 'English',
    bio: '',
  });

  // Academic Info Form State
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [academicForm, setAcademicForm] = useState({
    schoolName: '',
    classLevel: 'Class 10',
    board: 'CBSE',
    studyMode: 'full_syllabus' as 'full_syllabus' | 'specific_subject',
    selectedSubject: 'Mathematics',
    customSubject: '',
  });

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Subscription State
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [planBillingPeriod, setPlanBillingPeriod] = useState<PlanPeriod>('monthly');
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [billingInvoices, setBillingInvoices] = useState<InvoiceItem[]>([]);
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState<SubscriptionPlan | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelSubModalOpen, setIsCancelSubModalOpen] = useState(false);

  // Sync profile data on load
  useEffect(() => {
    if (profile) {
      const currentUser = authService.getCurrentUser();
      const studentBoard = profile.education?.board || 'CBSE';
      const studentClass = profile.education?.classLevel || 'Class 10';
      const formattedClass = studentClass.startsWith('Class') ? studentClass : `Class ${studentClass}`;
      const studentSchool = profile.education?.institution || profile.schoolDetails?.schoolName || 'Delhi Public School';
      const studentLang =
        (profile.userId && typeof profile.userId === 'object' && profile.userId.language) ||
        currentUser?.language ||
        'English';

      setPersonalForm({
        name: profile.name || currentUser?.name || '',
        phone: profile.phone || currentUser?.phone || '',
        dob: profile.dob || currentUser?.dob || '2008-05-14',
        gender: profile.gender || currentUser?.gender || 'Not specified',
        language: studentLang === 'Select' ? 'English' : studentLang,
        bio: currentUser?.goal || 'Dedicated to syllabus mastery and exam excellence.',
      });

      setAcademicForm({
        schoolName: studentSchool,
        classLevel: formattedClass,
        board: studentBoard,
        studyMode: profile.schoolDetails?.studyMode || 'full_syllabus',
        selectedSubject: profile.schoolDetails?.selectedSubject || 'Mathematics',
        customSubject: profile.schoolDetails?.customSubject || '',
      });
    }
  }, [profile]);

  // Load subscription data when switching to subscription tab
  useEffect(() => {
    if (activeTab === 'subscription') {
      setIsSubscriptionLoading(true);
      Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getAvailablePlans(),
        subscriptionService.getBillingHistory(),
      ])
        .then(([sub, plans, invoices]) => {
          setSubscription(sub);
          setAvailablePlans(plans);
          setBillingInvoices(invoices);
        })
        .catch(() => {
          toast.error('Failed to load subscription information');
        })
        .finally(() => {
          setIsSubscriptionLoading(false);
        });
    }
  }, [activeTab]);

  const handleLogout = () => {
    toast.info('Logging out...');
    authService.logout();
    setTimeout(() => navigate('/login'), 600);
  };



  // Save Personal Details
  const handleSavePersonal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!personalForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await updateProfile({
        name: personalForm.name.trim(),
        phone: personalForm.phone.trim(),
        dob: personalForm.dob,
        gender: personalForm.gender,
        language: personalForm.language,
      });
      await authService.savePersonalDetails({
        name: personalForm.name.trim(),
        phone: personalForm.phone.trim(),
        dob: personalForm.dob,
        gender: personalForm.gender,
        language: personalForm.language,
      });
      toast.success('Personal details saved successfully!');
      setIsEditingPersonal(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update personal details';
      toast.error(msg);
    }
  };

  // Save Academic Details
  const handleSaveAcademic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!academicForm.schoolName.trim()) {
      toast.error('School name cannot be empty');
      return;
    }

    try {
      const updatedSchoolDetails = {
        schoolName: academicForm.schoolName.trim(),
        classLevel: academicForm.classLevel,
        board: academicForm.board,
        studyMode: academicForm.studyMode,
        selectedSubject:
          academicForm.studyMode === 'specific_subject'
            ? academicForm.selectedSubject
            : undefined,
        customSubject:
          academicForm.studyMode === 'specific_subject' &&
          academicForm.selectedSubject === 'Custom'
            ? academicForm.customSubject.trim()
            : undefined,
      };

      await updateProfile({
        schoolDetails: updatedSchoolDetails,
        education: {
          level: 'school',
          institution: academicForm.schoolName.trim(),
          board: academicForm.board,
          classLevel: academicForm.classLevel,
        },
      });

      await authService.saveSchoolDetails(updatedSchoolDetails);
      toast.success('Academic information updated!');
      setIsEditingAcademic(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update academic details';
      toast.error(msg);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityForm.newPassword || securityForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      toast.success('Password changed successfully!');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Plan Upgrade
  const handleExecuteUpgrade = async () => {
    if (!upgradeTargetPlan) return;
    setIsUpgrading(true);
    try {
      const updated = await subscriptionService.upgradePlan(
        upgradeTargetPlan.id,
        planBillingPeriod
      );
      setSubscription(updated);
      toast.success(`Upgraded to ${upgradeTargetPlan.name}!`);
      setUpgradeTargetPlan(null);
    } catch {
      toast.error('Failed to update subscription');
    } finally {
      setIsUpgrading(false);
    }
  };

  // Handle Cancel Subscription
  const handleExecuteCancelSub = async () => {
    try {
      const res = await subscriptionService.cancelSubscription();
      const updated = await subscriptionService.getCurrentSubscription();
      setSubscription(updated);
      toast.info(res.message);
      setIsCancelSubModalOpen(false);
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  const userEmail =
    (profile?.userId && typeof profile.userId === 'object' && profile.userId.email) ||
    authService.getCurrentUser()?.email ||
    'student@edupye.com';

  const userName = profile?.name || authService.getCurrentUser()?.name || 'Student';

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      {/* Upgrade Plan Modal */}
      <Modal
        isOpen={!!upgradeTargetPlan}
        onClose={() => setUpgradeTargetPlan(null)}
        title={`Upgrade to ${upgradeTargetPlan?.name}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 font-medium">
            You are selecting the{' '}
            <strong className="text-[#111827]">{upgradeTargetPlan?.name}</strong> plan billed{' '}
            <strong>{planBillingPeriod}</strong> at{' '}
            <span className="text-[#0091ff] font-bold">
              ${planBillingPeriod === 'monthly' ? upgradeTargetPlan?.monthlyPrice : upgradeTargetPlan?.yearlyPrice}
            </span>
            /{planBillingPeriod === 'monthly' ? 'mo' : 'yr'}.
          </p>

          <div className="p-3.5 bg-[#f0f7ff] rounded-2xl border border-[#d2e8fb] space-y-2">
            <h4 className="text-xs font-extrabold text-[#1c3352]">Included Highlights:</h4>
            <ul className="space-y-1.5">
              {upgradeTargetPlan?.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            (Development mode: instant simulator without live card charge).
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setUpgradeTargetPlan(null)}
              disabled={isUpgrading}
              className="px-5 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExecuteUpgrade}
              isLoading={isUpgrading}
              className="px-6 py-2.5"
            >
              Confirm Upgrade
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal
        isOpen={isCancelSubModalOpen}
        onClose={() => setIsCancelSubModalOpen(false)}
        title="Cancel Subscription?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Your benefits will remain active until the end of your billing cycle on{' '}
            <strong>
              {subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'the renewal date'}
            </strong>
            . After that, your account will move to the Free Starter plan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelSubModalOpen(false)}
              className="px-5 py-2.5"
            >
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              onClick={handleExecuteCancelSub}
              className="px-6 py-2.5"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-rose-950">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>This will create a permanent change</span>
            </div>
            <p className="text-xs font-medium text-rose-800 leading-relaxed">
              Your academic progress, course materials, quiz records, flashcards, uploaded textbooks, and personal study data will be permanently deleted and cannot be recovered.
            </p>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Are you sure you want to proceed with deleting your account? You will be signed out immediately.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                toast.info('Account deleted. Redirecting...');
                authService.logout();
                setTimeout(() => navigate('/signup'), 500);
              }}
              className="px-6 py-2.5"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-end px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info('Language set to English')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Select Language"
            >
              <Globe className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search account settings..."
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button
              onClick={() => toast.info('Viewing Achievements')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Achievements"
            >
              <Trophy className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs hover:ring-2 hover:ring-[#0091ff]/30 transition-all cursor-pointer block"
                title="Account Menu"
              >
                <img src={userImg} alt="Profile" className="w-full h-full object-cover" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-52 bg-[#f0f6fc] border border-[#d8eaf8] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-[#d8eaf8]/60">
                    <p className="text-xs font-extrabold text-[#111827] truncate">{userName}</p>
                    <p className="text-[10px] font-semibold text-slate-500 truncate">{userEmail}</p>
                  </div>
                  {['Help & Tools', 'Feedback', 'Quick Guide', 'Settings'].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3.5 py-1.5 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold transition-colors"
                    >
                      {pill}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Profile Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fbfe]">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Hero Profile Overview Banner */}
            <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-[#d0e3f7] shadow-sm bg-slate-100">
                    <img src={userImg} alt={userName} className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => toast.info('Avatar photo update coming in next revision!')}
                    className="absolute bottom-1 right-1 p-1.5 bg-[#1c3352] text-white rounded-xl shadow-xs hover:bg-[#0091ff] transition-colors cursor-pointer"
                    title="Change Photo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                      {userName}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#eef6fc] text-[#0091ff] text-xs font-extrabold border border-[#d2e8fb]">
                      Student
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                      School Track
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{userEmail}</span>
                  </p>
                  <p className="text-[11px] font-bold text-slate-400">
                    {academicForm.schoolName} • {academicForm.board} • {academicForm.classLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-xs font-bold"
                >
                  Log Out
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#e2ebf4]">
              {[
                { id: 'personal' as ProfileTab, label: 'Personal Information', icon: UserIcon },
                { id: 'academic' as ProfileTab, label: 'Academic & Learning', icon: GraduationCap },
                { id: 'subscription' as ProfileTab, label: 'Payments & Subscription', icon: Sparkles },
                { id: 'security' as ProfileTab, label: 'Account & Security', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#1c3352] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#1c3352] hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Loading / Error / Content */}
            {isLoading ? (
              <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 flex items-center justify-center">
                <Loader text="Loading your profile..." />
              </div>
            ) : error && !profile ? (
              <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8">
                <ErrorState title="Unable to load profile" message={error} onRetry={refetch} />
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* ============================================================ */}
                {/* TAB 1: PERSONAL INFORMATION */}
                {/* ============================================================ */}
                {activeTab === 'personal' && (
                  <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-lg font-extrabold text-[#111827]">Personal Details</h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Manage your basic identity information across all Pegpo modules.
                        </p>
                      </div>
                      {!isEditingPersonal && (
                        <Button
                          variant="secondary"
                          onClick={() => setIsEditingPersonal(true)}
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                          className="px-4 py-2"
                        >
                          Edit Details
                        </Button>
                      )}
                    </div>

                    {isEditingPersonal ? (
                      <form onSubmit={handleSavePersonal} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Full Name *"
                            required
                            value={personalForm.name}
                            onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                            placeholder="Full name"
                          />

                          <Input
                            label="Email Address (Linked to Account)"
                            value={userEmail}
                            disabled
                            className="bg-slate-50 cursor-not-allowed text-slate-500"
                          />

                          <Input
                            label="Phone Number"
                            type="tel"
                            value={personalForm.phone}
                            onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                          />

                          <Input
                            label="Date of Birth"
                            type="date"
                            value={personalForm.dob}
                            onChange={(e) => setPersonalForm({ ...personalForm, dob: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-700">Preferred Language</label>
                            <div className="relative">
                              <select
                                value={personalForm.language}
                                onChange={(e) => setPersonalForm({ ...personalForm, language: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                              >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <Input
                            label="Bio / Goal Statement"
                            value={personalForm.bio}
                            onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                            placeholder="e.g. Aiming for 95% in 10th CBSE Boards"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditingPersonal(false)}
                            disabled={isSaving}
                            className="px-6 py-2.5"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSaving}
                            className="px-6 py-2.5"
                          >
                            Save Personal Details
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Full Name</span>
                          <h3 className="text-sm font-extrabold text-[#111827]">
                            {personalForm.name || '—'}
                          </h3>
                        </div>

                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Email Address</span>
                          <h3 className="text-sm font-extrabold text-[#111827] flex items-center gap-2">
                            <span>{userEmail}</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                          </h3>
                        </div>

                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Phone Number</span>
                          <h3 className="text-sm font-extrabold text-[#111827]">
                            {personalForm.phone || 'Not provided'}
                          </h3>
                        </div>

                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Date of Birth</span>
                          <h3 className="text-sm font-extrabold text-[#111827]">
                            {personalForm.dob || 'Not provided'}
                          </h3>
                        </div>

                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Language Preference</span>
                          <h3 className="text-sm font-extrabold text-[#111827]">
                            {personalForm.language}
                          </h3>
                        </div>

                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Bio / Academic Goal</span>
                          <h3 className="text-sm font-extrabold text-[#111827]">
                            {personalForm.bio || 'Prepare for Exam'}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 2: ACADEMIC & LEARNING */}
                {/* ============================================================ */}
                {activeTab === 'academic' && (
                  <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-extrabold text-[#111827]">
                            Academic & Learning Information
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200">
                            School Track Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Configured specifically for K-12 school curriculum and syllabus alignment.
                        </p>
                      </div>

                      {!isEditingAcademic && (
                        <Button
                          variant="secondary"
                          onClick={() => setIsEditingAcademic(true)}
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                          className="px-4 py-2"
                        >
                          Edit School Details
                        </Button>
                      )}
                    </div>

                    {isEditingAcademic ? (
                      <form onSubmit={handleSaveAcademic} className="space-y-5">
                        <Input
                          label="School / Institution Name *"
                          required
                          value={academicForm.schoolName}
                          onChange={(e) => setAcademicForm({ ...academicForm, schoolName: e.target.value })}
                          placeholder="e.g. Delhi Public School"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-700">Class / Grade</label>
                            <div className="relative">
                              <select
                                value={academicForm.classLevel}
                                onChange={(e) => setAcademicForm({ ...academicForm, classLevel: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                              >
                                {CLASSES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-700">Curriculum / Board</label>
                            <div className="relative">
                              <select
                                value={academicForm.board}
                                onChange={(e) => setAcademicForm({ ...academicForm, board: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                              >
                                {CURRICULUM_BOARDS.map((b) => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {/* Study Scope Toggle */}
                        <div className="space-y-3 pt-2">
                          <label className="block text-xs font-bold text-slate-700">Study Scope</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div
                              onClick={() => setAcademicForm({ ...academicForm, studyMode: 'full_syllabus' })}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                academicForm.studyMode === 'full_syllabus'
                                  ? 'border-[#0091ff] bg-[#f0f7ff] ring-2 ring-[#0091ff]/20'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <h4 className="text-xs font-extrabold text-[#111827]">
                                Full Grade Syllabus
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Track complete grade subjects and exams.
                              </p>
                            </div>

                            <div
                              onClick={() => setAcademicForm({ ...academicForm, studyMode: 'specific_subject' })}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                academicForm.studyMode === 'specific_subject'
                                  ? 'border-[#0091ff] bg-[#f0f7ff] ring-2 ring-[#0091ff]/20'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <h4 className="text-xs font-extrabold text-[#111827]">
                                Specific Focus Subject
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Focus on an individual textbook or topic.
                              </p>
                            </div>
                          </div>

                          {academicForm.studyMode === 'specific_subject' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-bold text-slate-700">Subject</label>
                                <div className="relative">
                                  <select
                                    value={academicForm.selectedSubject}
                                    onChange={(e) => setAcademicForm({ ...academicForm, selectedSubject: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                                  >
                                    {COMMON_SUBJECTS.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>

                              {academicForm.selectedSubject === 'Custom' && (
                                <Input
                                  label="Custom Subject Name"
                                  value={academicForm.customSubject}
                                  onChange={(e) => setAcademicForm({ ...academicForm, customSubject: e.target.value })}
                                  placeholder="e.g. Advanced Robotics"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditingAcademic(false)}
                            disabled={isSaving}
                            className="px-6 py-2.5"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSaving}
                            className="px-6 py-2.5"
                          >
                            Save Academic Details
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                            <span className="text-xs font-bold text-slate-400">School Name</span>
                            <h3 className="text-sm font-extrabold text-[#111827]">
                              {academicForm.schoolName}
                            </h3>
                          </div>

                          <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                            <span className="text-xs font-bold text-slate-400">Class / Grade</span>
                            <h3 className="text-sm font-extrabold text-[#111827]">
                              {academicForm.classLevel}
                            </h3>
                          </div>

                          <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                            <span className="text-xs font-bold text-slate-400">Board / Curriculum</span>
                            <h3 className="text-sm font-extrabold text-[#111827]">
                              {academicForm.board}
                            </h3>
                          </div>
                        </div>

                        {/* Study Scope Card */}
                        <div className="p-5 bg-[#f0f7ff] rounded-2xl border border-[#d2e8fb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[11px] font-extrabold text-[#0091ff] uppercase tracking-wide">
                              Current Study Scope
                            </span>
                            <h4 className="text-sm font-extrabold text-[#1c3352]">
                              {academicForm.studyMode === 'full_syllabus'
                                ? `Full Curriculum (${academicForm.classLevel} ${academicForm.board})`
                                : `Focused Subject: ${
                                    academicForm.selectedSubject === 'Custom'
                                      ? academicForm.customSubject || 'Custom Subject'
                                      : academicForm.selectedSubject
                                  }`}
                            </h4>
                            <p className="text-xs font-medium text-slate-500">
                              {profile?.schoolDetails?.syllabusFileName
                                ? `Active resource: ${profile.schoolDetails.syllabusFileName}`
                                : 'Uploaded materials are parsed by AI for quizzes, summaries, and revision.'}
                            </p>
                          </div>

                          <Button
                            variant="secondary"
                            onClick={() => navigate('/student/upload')}
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            className="text-xs font-bold whitespace-nowrap"
                          >
                            Manage Materials
                          </Button>
                        </div>

                        {/* Future Extensible Tracks Note */}
                        <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>
                            Need to switch to Undergraduate, Postgraduate, or Competitive Exam mode?
                          </span>
                          <button
                            onClick={() => navigate('/onboarding?step=path')}
                            className="text-[#0091ff] font-bold hover:underline cursor-pointer ml-2"
                          >
                            Change Track
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 3: PAYMENTS & SUBSCRIPTION */}
                {/* ============================================================ */}
                {activeTab === 'subscription' && (
                  <div className="space-y-6">
                    {/* Active Subscription Overview Card */}
                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-extrabold text-[#111827]">
                              {subscription?.planName || 'School Scholar'}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 capitalize">
                              {subscription?.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-500">
                            Full K-12 academic and syllabus AI assistant plan.
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Button
                            variant="outline"
                            onClick={() => setIsCancelSubModalOpen(true)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-rose-600"
                          >
                            Cancel Plan
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => {
                              const nextPlan = availablePlans.find((p) => p.tier === 'ultimate');
                              if (nextPlan) setUpgradeTargetPlan(nextPlan);
                            }}
                            className="px-5 py-2 text-xs font-bold"
                          >
                            Change Plan
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Current Cost</span>
                          <h3 className="text-lg font-extrabold text-[#111827]">
                            ${subscription?.amount || 12}
                            <span className="text-xs font-semibold text-slate-400"> / month</span>
                          </h3>
                        </div>

                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Next Billing Date</span>
                          <h3 className="text-sm font-extrabold text-[#111827]">
                            {subscription?.currentPeriodEnd
                              ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'October 15, 2026'}
                          </h3>
                        </div>

                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-xs font-bold text-slate-400">Payment Method</span>
                          <h3 className="text-sm font-extrabold text-[#111827] flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-[#0091ff]" />
                            <span>Visa ending in 4242</span>
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Available Plans Grid */}
                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-extrabold text-[#111827]">Available Plans</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Choose the plan that matches your study pace and examination goals.
                          </p>
                        </div>

                        {/* Billing Period Toggle */}
                        <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => setPlanBillingPeriod('monthly')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              planBillingPeriod === 'monthly'
                                ? 'bg-white text-[#111827] shadow-2xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlanBillingPeriod('yearly')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                              planBillingPeriod === 'yearly'
                                ? 'bg-white text-[#111827] shadow-2xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            <span>Yearly</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                              Save 20%
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {availablePlans.map((plan) => {
                          const isCurrent = subscription?.tier === plan.tier;
                          const price =
                            planBillingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                          const unit = planBillingPeriod === 'monthly' ? '/mo' : '/yr';

                          return (
                            <div
                              key={plan.id}
                              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative ${
                                plan.popular
                                  ? 'border-[#0091ff] bg-[#fbfdff] shadow-xs'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              {plan.badge && (
                                <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[#0091ff]/10 text-[#0091ff] text-[10px] font-extrabold uppercase tracking-wide">
                                  {plan.badge}
                                </span>
                              )}

                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-base font-extrabold text-[#111827]">{plan.name}</h4>
                                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                    {plan.description}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-3xl font-black text-[#111827]">${price}</span>
                                  <span className="text-xs font-bold text-slate-400"> {unit}</span>
                                </div>

                                <ul className="space-y-2 pt-2 border-t border-slate-100">
                                  {plan.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-6">
                                {isCurrent ? (
                                  <Button
                                    variant="outline"
                                    disabled
                                    className="w-full py-2.5 text-xs font-extrabold bg-slate-50 border-slate-200 text-slate-500"
                                  >
                                    Current Plan
                                  </Button>
                                ) : (
                                  <Button
                                    variant={plan.popular ? 'primary' : 'secondary'}
                                    onClick={() => setUpgradeTargetPlan(plan)}
                                    className="w-full py-2.5 text-xs font-extrabold"
                                  >
                                    {plan.tier === 'starter' ? 'Downgrade' : 'Upgrade Plan'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Billing History / Invoices Table */}
                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs space-y-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-[#111827]">Billing History</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Download past receipts and invoices for your records.
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                              <th className="py-3 px-3">Invoice</th>
                              <th className="py-3 px-3">Date</th>
                              <th className="py-3 px-3">Description</th>
                              <th className="py-3 px-3">Amount</th>
                              <th className="py-3 px-3">Status</th>
                              <th className="py-3 px-3 text-right">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {billingInvoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-3 font-bold text-[#111827]">{inv.invoiceNumber}</td>
                                <td className="py-3.5 px-3 text-slate-500">{inv.date}</td>
                                <td className="py-3.5 px-3">{inv.description}</td>
                                <td className="py-3.5 px-3 font-bold text-[#111827]">${inv.amount}.00</td>
                                <td className="py-3.5 px-3">
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 uppercase">
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                  <button
                                    onClick={() => toast.success(`Receipt ${inv.invoiceNumber} downloaded!`)}
                                    className="p-1.5 rounded-xl hover:bg-slate-100 text-[#0091ff] hover:text-[#0077d6] transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                                    title="Download PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>PDF</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 4: ACCOUNT & SECURITY */}
                {/* ============================================================ */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    {/* Password Update Card */}
                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs space-y-5">
                      <div className="border-b border-slate-100 pb-4">
                        <h2 className="text-lg font-extrabold text-[#111827]">Change Password</h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Update your password regularly to keep your student records and notes secure.
                        </p>
                      </div>

                      <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                        <Input
                          label="Current Password"
                          isPassword
                          required
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                        />

                        <Input
                          label="New Password"
                          isPassword
                          required
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                          placeholder="At least 6 characters"
                        />

                        <Input
                          label="Confirm New Password"
                          isPassword
                          required
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                        />

                        <div className="pt-2">
                          <Button
                            type="submit"
                            variant="primary"
                            isLoading={isUpdatingPassword}
                            className="px-6 py-2.5"
                          >
                            Update Password
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs space-y-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-[#111827]">Active Sessions</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Devices currently logged in to your account.
                        </p>
                      </div>

                      <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#111827]">
                              Windows PC • Chrome Browser
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                              Current Device
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Last active: Just now • Active Session
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => toast.info('Other sessions revoked.')}
                          className="px-4 py-1.5 text-xs"
                        >
                          Revoke Others
                        </Button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-lg font-extrabold text-[#111827]">Delete Account</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Permanently close your student account and remove all your data.
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          onClick={() => setIsDeleteModalOpen(true)}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          className="px-5 py-2.5 text-xs font-bold shrink-0"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
