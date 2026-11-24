import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Users,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Copy,
  Check,
  Lock,
  X,
  AlertCircle,
  Video,
  MessageSquare,
  QrCode,
} from 'lucide-react';
import { tuitionService } from '../../services/tuitionService';
import { authService } from '../../services/authService';
import { TuitionProgram } from '../../types/tuition';
import { ComplaintModal } from '../../components/tuition/ComplaintModal';
import { TuitionIdCardModal } from '../../components/tuition/TuitionIdCardModal';

export const TuitionProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const [myPrograms, setMyPrograms] = useState<TuitionProgram[]>([]);
  const [catalogPrograms, setCatalogPrograms] = useState<TuitionProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState<string>(
    currentUser?.tuitionApprovalStatus || (currentUser?.studentCode || currentUser?.teacherCode ? 'approved' : 'none')
  );
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  const [requestedProgramIds, setRequestedProgramIds] = useState<Set<string>>(new Set());
  const [requestingBatchId, setRequestingBatchId] = useState<string | null>(null);

  // Modal State
  const [selectedProgram, setSelectedProgram] = useState<TuitionProgram | null>(null);
  const [codeGateOpen, setCodeGateOpen] = useState(false);
  const [gateRoleTab, setGateRoleTab] = useState<'student' | 'teacher'>('student');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [inputCode, setInputCode] = useState(
    currentUser?.studentCode || currentUser?.teacherCode || ''
  );
  const [inputName, setInputName] = useState(currentUser?.name || '');
  const [submittingCode, setSubmittingCode] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const userCode = currentUser?.studentCode || currentUser?.teacherCode;

  useEffect(() => {
    fetchPrograms();
    let isMounted = true;
    authService.fetchCurrentUser().then((user) => {
      if (isMounted && user) {
        setCurrentUser(user);
        if (user.tuitionApprovalStatus === 'revoked' || (user as any).tuitionApprovalStatus === 'suspended') {
          setApprovalStatus('revoked');
        } else if (user.studentCode || user.teacherCode) {
          setApprovalStatus('approved');
          setInputCode(user.studentCode || user.teacherCode || '');
        } else {
          setApprovalStatus(user.tuitionApprovalStatus || 'none');
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for redirected messages or promptProgramId
  useEffect(() => {
    const stateMsg = (location.state as any)?.message;
    if (stateMsg) {
      setBannerAlert(stateMsg);
    }
    const promptId = (location.state as any)?.promptProgramId;
    if (promptId && (myPrograms.length > 0 || catalogPrograms.length > 0)) {
      const match = [...myPrograms, ...catalogPrograms].find((p) => p._id === promptId);
      if (match) {
        openCodeGate(match);
      }
    }
  }, [location.state, myPrograms, catalogPrograms]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await tuitionService.getTuitionPrograms();
      if (res.success) {
        setMyPrograms(res.myPrograms || res.programs || []);
        setCatalogPrograms(res.catalogPrograms || []);
      }
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (userCode) {
      navigator.clipboard.writeText(userCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRequestAccess = async () => {
    try {
      setRequestingAccess(true);
      setRequestSuccessMsg(null);
      const res = await tuitionService.requestProgramAccess();
      if (res.success) {
        setApprovalStatus(res.tuitionApprovalStatus || 'approved');
        if (res.code) {
          setInputCode(res.code);
          setRequestSuccessMsg(`Tuition code issued: ${res.code}`);
        } else {
          setRequestSuccessMsg('Tuition access request submitted! An administrator will review and issue your permanent code.');
        }
        const updated = await authService.fetchCurrentUser();
        if (updated) {
          setCurrentUser(updated);
        }
      }
    } catch (err: any) {
      console.error('Failed to request access:', err);
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleRequestBatchEnroll = async (programId: string) => {
    try {
      setRequestingBatchId(programId);
      setRequestSuccessMsg(null);
      const res = await tuitionService.requestProgramEnrollment(programId);
      if (res.success || res.alreadyRequested) {
        setRequestedProgramIds((prev) => new Set(prev).add(programId));
        setRequestSuccessMsg(res.message || 'Batch enrollment request submitted to administrator.');
      } else {
        setRequestSuccessMsg(res.message || 'Unable to submit enrollment request.');
      }
    } catch (err: any) {
      console.error('Failed to request batch enrollment:', err);
      setRequestSuccessMsg(err.message || 'Failed to submit enrollment request.');
    } finally {
      setRequestingBatchId(null);
    }
  };

  const openCodeGate = (program: TuitionProgram) => {
    setSelectedProgram(program);
    setGateError(null);
    const isTeacher = Boolean(
      currentUser?.teacherCode ||
      currentUser?.role === 'teacher' ||
      currentUser?.activeRole === 'teacher' ||
      (currentUser as any)?.userType === 'teacher'
    );
    const defaultTab = isTeacher ? 'teacher' : 'student';
    setGateRoleTab(defaultTab);
    setInputCode(defaultTab === 'teacher' ? (currentUser?.teacherCode || '') : (currentUser?.studentCode || ''));
    setInputName(currentUser?.name || '');
    setCodeGateOpen(true);
  };

  const handleRoleTabChange = (role: 'student' | 'teacher') => {
    setGateRoleTab(role);
    setGateError(null);
    if (role === 'teacher') {
      setInputCode(currentUser?.teacherCode || '');
    } else {
      setInputCode(currentUser?.studentCode || '');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      setGateError('Full Name is required for verification.');
      return;
    }
    if (!inputCode.trim()) {
      setGateError(`Alphanumeric ${gateRoleTab === 'teacher' ? 'Teacher' : 'Student'} Code is required.`);
      return;
    }

    const cleanCode = inputCode.trim().toUpperCase();
    const isAdminCode = cleanCode.startsWith('ADM-') || cleanCode.startsWith('SA-') || cleanCode.startsWith('TAD-');
    if (gateRoleTab === 'teacher' && !cleanCode.startsWith('TCH-') && !isAdminCode) {
      setGateError('Teacher codes must begin with TCH- (e.g. TCH-XXXXXX).');
      return;
    }
    if (gateRoleTab === 'student' && !cleanCode.startsWith('STU-') && !isAdminCode) {
      setGateError('Student codes must begin with STU- (e.g. STU-XXXXXX).');
      return;
    }

    try {
      setSubmittingCode(true);
      setGateError(null);

      const targetProgId = selectedProgram?._id || (selectedProgram as any)?.id;

      const res = await tuitionService.codeLogin({
        code: cleanCode,
        name: inputName.trim(),
        programId: targetProgId,
      });

      if (res.success && res.token) {
        tuitionService.setTuitionModeSession(res.token, res.programContext, res.user);
        if (targetProgId) {
          tuitionService.setProgramVerified(targetProgId, selectedProgram?.code);
        }
        setCodeGateOpen(false);

        const redirectUrl = sessionStorage.getItem('tuition_redirect_after_login');
        if (redirectUrl) {
          sessionStorage.removeItem('tuition_redirect_after_login');
          navigate(redirectUrl);
          return;
        }

        if (targetProgId) {
          navigate(`/tuition-mode/program/${targetProgId}`);
        }
      } else {
        setGateError(res.message || 'Verification failed. Please check your credentials.');
      }
    } catch (err: any) {
      setGateError(err.message || 'Invalid code or enrollment mismatch.');
    } finally {
      setSubmittingCode(false);
    }
  };

  const filteredMy = myPrograms.filter((p) =>
    (p.title + ' ' + p.subject + ' ' + (p.code || '')).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCatalog = catalogPrograms.filter((p) =>
    (p.title + ' ' + p.subject + ' ' + (p.code || '')).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Redirect / Compliance Alert Banner */}
        {bannerAlert && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="font-medium">{bannerAlert}</span>
            </div>
            <button
              onClick={() => setBannerAlert(null)}
              className="text-amber-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-amber-500/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header & Identity Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Centralized Programs Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              EduPye Tuition Programs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Access your dedicated curriculum batches, join live WebRTC SmartBoard classes, and participate in combined study streams using your permanent code.
            </p>
          </div>

          {/* User Code Identity Box */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/30 rounded-2xl p-5 shadow-xs dark:shadow-xl dark:shadow-amber-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Your Tuition Code
                </span>
              </div>
              {approvalStatus === 'revoked' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  Access Revoked
                </span>
              ) : approvalStatus === 'approved' && userCode ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Permanent
                </span>
              ) : approvalStatus === 'pending' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Pending Review
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20">
                  Access Needed
                </span>
              )}
            </div>

            {approvalStatus === 'revoked' ? (
              <div className="space-y-2 bg-red-50 dark:bg-red-950/40 px-4 py-3.5 rounded-xl border border-red-200 dark:border-red-500/40">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Tuition Access Revoked</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  Your Tuition Mode access has been revoked or suspended by an administrator. Active program rosters and live rooms are restricted.
                </p>
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Submit Grievance / Appeal</span>
                </button>
              </div>
            ) : approvalStatus === 'approved' && userCode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-amber-700 dark:text-amber-300">
                    {userCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Copy permanent code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIdCardModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View &amp; Download Tuition ID Card</span>
                </button>
              </div>
            ) : approvalStatus === 'pending' ? (
              <div className="space-y-2 bg-blue-50/70 dark:bg-slate-950 px-4 py-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Pending Admin Approval</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Your Tuition Mode access is currently under review by an EduPye Tuition Admin. Your permanent ID will be issued upon approval.
                </p>
              </div>
            ) : currentUser ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Request access to unlock your permanent tuition code and join enrolled programs.
                </p>
                <button
                  onClick={handleRequestAccess}
                  disabled={requestingAccess}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {requestingAccess ? 'Submitting Request...' : 'Request Tuition Access'}
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
                Log in with your EduPye Student or Teacher account to view your permanent code.
              </div>
            )}

            {requestSuccessMsg && (
              <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {requestSuccessMsg}
              </p>
            )}

            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Use this permanent alphanumeric code to securely unlock your assigned tuition batches.
            </p>
          </div>
        </div>

        {/* Search Bar & Issue Reporting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search programs by subject, title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {userCode && (
              <button
                type="button"
                onClick={() => setIsIdCardModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 border border-slate-200 dark:border-amber-500/30 text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <QrCode className="w-4 h-4" />
                <span>My Tuition ID Card</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsComplaintModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Report Grievance / Issue</span>
            </button>
          </div>
        </div>

        {/* Section 1: My Enrolled / Assigned Programs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Active Programs</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {filteredMy.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">Loading programs...</div>
          ) : filteredMy.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 text-center shadow-xs">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                No active program enrollments found matching your profile.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Explore available tuition catalog programs below or contact administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMy.map((program) => (
                <ProgramCard
                  key={program._id}
                  program={program}
                  isEnrolled={true}
                  onAccess={() => openCodeGate(program)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Catalog Programs */}
        {filteredCatalog.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Available Tuition Catalog</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  {filteredCatalog.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map((program) => (
                <ProgramCard
                  key={program._id}
                  program={program}
                  isEnrolled={false}
                  isRequested={requestedProgramIds.has(program._id)}
                  requesting={requestingBatchId === program._id}
                  onAccess={() => openCodeGate(program)}
                  onRequestEnroll={() => handleRequestBatchEnroll(program._id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Code Gate Modal - Tuition Session Login */}
      {codeGateOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-white">
            <button
              onClick={() => setCodeGateOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 border border-amber-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tuition Session Login</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Unlock: {selectedProgram.title}</p>
              </div>
            </div>

            {/* Role Tabs: Student vs Teacher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => handleRoleTabChange('student')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gateRoleTab === 'student'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student (STU)</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange('teacher')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gateRoleTab === 'teacher'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Teacher (TCH)</span>
              </button>
            </div>

            {gateError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gateError}</span>
              </div>
            )}

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              {/* Full Name Field (Required) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-amber-500 dark:text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={gateRoleTab === 'teacher' ? 'Instructor Full Name' : 'Student Full Name'}
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Permanent Alphanumeric Code Field (Required) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Alphanumeric Code <span className="text-amber-500 dark:text-amber-400">*</span>
                  </label>
                  {userCode && (
                    <button
                      type="button"
                      onClick={() => setInputCode(userCode)}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Fill My Code ({userCode})</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder={gateRoleTab === 'teacher' ? 'TCH-XXXXXX' : 'STU-XXXXXX'}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-amber-400"
                />
                {userCode && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Registered: <strong className="text-amber-600 dark:text-amber-300 font-mono">{userCode}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(userCode);
                        handleCopyCode();
                      }}
                      className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingCode}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {submittingCode ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Verify &amp; Unlock Program</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grievance & Issue Reporting Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
      />

      {/* Tuition ID Card Modal */}
      <TuitionIdCardModal
        isOpen={isIdCardModalOpen}
        onClose={() => setIsIdCardModalOpen(false)}
        user={currentUser}
      />
    </div>
  );
};

// Reusable Program Card Component
interface ProgramCardProps {
  program: TuitionProgram;
  isEnrolled: boolean;
  isRequested?: boolean;
  requesting?: boolean;
  onAccess: () => void;
  onRequestEnroll?: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  isEnrolled,
  isRequested,
  requesting,
  onAccess,
  onRequestEnroll,
}) => {
  const teachersList: any[] =
    program.teachers && program.teachers.length > 0
      ? program.teachers
      : Array.isArray(program.teacherIds) && typeof program.teacherIds[0] === 'object'
      ? (program.teacherIds as any[])
      : [];

  const instructor = teachersList[0] || null;
  const isMultiTeacher = teachersList.length > 1;

  const studentCount = program.enrolledStudentIds?.length || 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all p-5 flex flex-col justify-between shadow-md hover:shadow-lg group">
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {program.subject}
          </span>
          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
            {program.code}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors mb-2">
          {program.title}
        </h3>

        {program.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {program.description}
          </p>
        )}

        {/* Instructor / Faculty Spotlight Card */}
        {teachersList.length > 0 && (
          <div className="mb-3 space-y-2">
            {isMultiTeacher ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Users className="w-3.5 h-3.5" />
                    Program Faculty ({teachersList.length})
                  </span>
                </div>
                {teachersList.slice(0, 3).map((tch: any, idx: number) => {
                  const tchSubject = tch.assignedSubject || tch.programSubject || (tch.subjects && tch.subjects[0]) || program.subject;
                  return (
                    <div
                      key={tch._id || idx}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      {tch.avatar || tch.profilePicture ? (
                        <img
                          src={tch.avatar || tch.profilePicture}
                          alt={tch.name || 'Instructor'}
                          className="w-8 h-8 rounded-full object-cover border border-amber-500/40 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-600 dark:text-amber-300 font-extrabold text-[10px] flex items-center justify-center border border-amber-500/40 shrink-0">
                          {(tch.name || 'IN')
                            .split(' ')
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{tch.name || 'Instructor'}</span>
                          {tch.teacherCode && (
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                              {tch.teacherCode}
                            </span>
                          )}
                          {tchSubject && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 font-bold ml-auto">
                              {tchSubject}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          <span className="text-amber-600 dark:text-amber-300/90 font-medium">
                            {tch.qualifications?.[0] || 'Subject Specialist'}
                          </span>
                          {tch.experienceYears ? <span>• {tch.experienceYears}+ yrs exp</span> : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {teachersList.length > 3 && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
                    +{teachersList.length - 3} more instructors
                  </div>
                )}
              </div>
            ) : (
              instructor && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  {instructor.avatar || instructor.profilePicture ? (
                    <img
                      src={instructor.avatar || instructor.profilePicture}
                      alt={instructor.name || 'Instructor'}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-600 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-500/40 shrink-0 shadow-inner">
                      {(instructor.name || 'IN')
                        .split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{instructor.name || 'Assigned Instructor'}</span>
                      {instructor.teacherCode && (
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                          {instructor.teacherCode}
                        </span>
                      )}
                      {(instructor.assignedSubject || instructor.programSubject) && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 font-bold ml-auto">
                          {instructor.assignedSubject || instructor.programSubject}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      <span className="text-amber-600 dark:text-amber-300/90 font-medium">
                        {instructor.qualifications?.[0] || instructor.subjects?.[0] || program.subject}
                      </span>
                      {instructor.experienceYears ? <span>• {instructor.experienceYears}+ yrs exp</span> : null}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Program Details */}
        <div className="space-y-2 py-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            {program.grade && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>Grade: <strong className="text-slate-800 dark:text-slate-200">{program.grade}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 ml-auto">
              <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span><strong className="text-slate-900 dark:text-white">{studentCount}</strong> enrolled</span>
            </div>
          </div>

          {program.schedule && program.schedule.length > 0 && (
            <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 pt-1">
              <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                {program.schedule.map((slot, idx) => (
                  <div key={idx} className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {slot.day}: {slot.startTime} - {slot.endTime}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          {isEnrolled ? 'Enrolled Batch' : isRequested ? 'Request Pending' : 'Open Registration'}
        </span>

        {isEnrolled ? (
          <button
            onClick={onAccess}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
          >
            <span>Enter Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : isRequested ? (
          <button
            disabled
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400/80 border border-amber-500/20 text-xs font-semibold cursor-not-allowed opacity-80"
          >
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Request Sent (Pending Admin)</span>
          </button>
        ) : (
          <button
            onClick={onRequestEnroll}
            disabled={requesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02] disabled:opacity-50"
          >
            <span>{requesting ? 'Submitting...' : 'Request to Join Batch'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
export default TuitionProgramsPage;
