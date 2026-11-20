import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { tuitionService } from '../../services/tuitionService';
import { authService } from '../../services/authService';
import { TuitionProgram } from '../../types/tuition';
import { ComplaintModal } from '../../components/tuition/ComplaintModal';

export const TuitionProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const [myPrograms, setMyPrograms] = useState<TuitionProgram[]>([]);
  const [catalogPrograms, setCatalogPrograms] = useState<TuitionProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState<string>(
    currentUser?.tuitionApprovalStatus || (currentUser?.studentCode || currentUser?.teacherCode ? 'approved' : 'none')
  );
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);

  const [requestedProgramIds, setRequestedProgramIds] = useState<Set<string>>(new Set());
  const [requestingBatchId, setRequestingBatchId] = useState<string | null>(null);

  // Modal State
  const [selectedProgram, setSelectedProgram] = useState<TuitionProgram | null>(null);
  const [codeGateOpen, setCodeGateOpen] = useState(false);
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
    const activeCode = currentUser?.studentCode || currentUser?.teacherCode || '';
    setInputCode(activeCode);
    setInputName(currentUser?.name || '');
    setCodeGateOpen(true);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setGateError('Please enter your Student or Teacher Code.');
      return;
    }

    try {
      setSubmittingCode(true);
      setGateError(null);

      const res = await tuitionService.codeLogin({
        code: inputCode.trim().toUpperCase(),
        name: inputName.trim() || undefined,
        programId: selectedProgram?._id,
      });

      if (res.success && res.token) {
        tuitionService.setTuitionModeSession(res.token, res.programContext, res.user);
        setCodeGateOpen(false);
        if (selectedProgram) {
          navigate(`/tuition-mode/program/${selectedProgram._id}`);
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
    <div className="flex-1 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header & Identity Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Centralized Programs Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              EduPye Tuition Programs
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Access your dedicated curriculum batches, join live WebRTC SmartBoard classes, and participate in combined study streams using your permanent code.
            </p>
          </div>

          {/* User Code Identity Box */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-xl shadow-amber-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Your Tuition Code
                </span>
              </div>
              {approvalStatus === 'revoked' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Access Revoked
                </span>
              ) : approvalStatus === 'approved' && userCode ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Permanent
                </span>
              ) : approvalStatus === 'pending' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pending Review
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                  Access Needed
                </span>
              )}
            </div>

            {approvalStatus === 'revoked' ? (
              <div className="space-y-2 bg-red-950/40 px-4 py-3.5 rounded-xl border border-red-500/40">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Tuition Access Revoked</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
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
              <div className="flex items-center justify-between bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">
                <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-amber-300">
                  {userCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy permanent code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : approvalStatus === 'pending' ? (
              <div className="space-y-2 bg-slate-950 px-4 py-3.5 rounded-xl border border-blue-900/40">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Pending Admin Approval</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Your Tuition Mode access is currently under review by an EduPye Tuition Admin. Your permanent ID will be issued upon approval.
                </p>
              </div>
            ) : currentUser ? (
              <div className="space-y-3 bg-slate-950 px-4 py-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">
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
              <div className="text-xs text-slate-400 py-2">
                Log in with your EduPye Student or Teacher account to view your permanent code.
              </div>
            )}

            {requestSuccessMsg && (
              <p className="mt-2 text-[11px] text-emerald-400 font-medium">
                {requestSuccessMsg}
              </p>
            )}

            <p className="mt-2 text-[11px] text-slate-400">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsComplaintModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Report Grievance / Issue</span>
          </button>
        </div>

        {/* Section 1: My Enrolled / Assigned Programs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">My Active Programs</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                {filteredMy.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading programs...</div>
          ) : filteredMy.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
              <p className="text-slate-400 text-sm">
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
                  onAccess={() => navigate(`/tuition-mode/program/${program._id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Catalog Programs */}
        {filteredCatalog.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Available Tuition Catalog</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300">
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

      {/* Code Gate Modal */}
      {codeGateOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setCodeGateOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Program Access Verification</h3>
                <p className="text-xs text-slate-400">Unlock: {selectedProgram.title}</p>
              </div>
            </div>

            {gateError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gateError}</span>
              </div>
            )}

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Permanent Code <span className="text-amber-400">*</span>
                  </label>
                  {userCode && (
                    <button
                      type="button"
                      onClick={() => setInputCode(userCode)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Fill My Code ({userCode})</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="STU-XXXXXX or TCH-XXXXXX"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-amber-400"
                />
                {userCode && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Your registered code: <strong className="text-amber-300 font-mono">{userCode}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(userCode);
                        handleCopyCode();
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Name <span className="text-slate-500">(Optional identity check)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student / Teacher Name"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingCode}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {submittingCode ? (
                    <span>Verifying with EduPye Hub...</span>
                  ) : (
                    <>
                      <span>Unlock Program Workspace</span>
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
  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-all p-5 flex flex-col justify-between shadow-lg shadow-black/20 group">
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {program.subject}
          </span>
          <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {program.code}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
          {program.title}
        </h3>

        {program.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {program.description}
          </p>
        )}

        {/* Program Details */}
        <div className="space-y-2 py-3 border-t border-slate-800/80 text-xs text-slate-300">
          {program.grade && (
            <div className="flex items-center gap-2 text-slate-400">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Grade / Level: <strong className="text-slate-200">{program.grade}</strong></span>
            </div>
          )}

          {program.schedule && program.schedule.length > 0 && (
            <div className="flex items-start gap-2 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                {program.schedule.map((slot, idx) => (
                  <div key={idx} className="text-slate-300 text-[11px]">
                    {slot.day}: {slot.startTime} - {slot.endTime}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
