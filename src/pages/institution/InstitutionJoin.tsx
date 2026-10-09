import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  KeyRound,
  LogIn,
} from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import { IInvitationInfo } from '../../types/institution';

export default function InstitutionJoin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const codeFromUrl = searchParams.get('code') || '';
  const [inputCode, setInputCode] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationInfo, setInvitationInfo] = useState<IInvitationInfo | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (codeFromUrl) {
      handleLookup(codeFromUrl);
    }
  }, [codeFromUrl]);

  const handleLookup = async (codeToLookup: string) => {
    if (!codeToLookup.trim()) {
      setError('Please enter a valid invitation code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const info = await institutionService.getInvitationInfo(codeToLookup.trim());
      setInvitationInfo(info);
    } catch (err: any) {
      setInvitationInfo(null);
      setError(err.message || 'Invitation not found or code is invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    const code = invitationInfo?.code || inputCode.trim();
    if (!code) return;

    try {
      setAccepting(true);
      setError(null);
      await institutionService.acceptInvitation(code);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation. Please make sure you are logged in.');
    } finally {
      setAccepting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'subadmin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trainer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'parent':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Join Institution
          </h1>
          <p className="text-xs text-slate-500">
            Accept your invitation to collaborate in EduPye Institution Workspace
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Welcome to the Team!</h2>
              <p className="text-xs text-slate-600 mt-1">
                You have successfully joined <span className="font-bold text-slate-800">{invitationInfo?.institution.name}</span>.
              </p>
            </div>
            <button
              onClick={() => navigate('/institution/portal/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Go to Institution Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : invitationInfo ? (
          <div className="space-y-5">
            {/* Institution Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  {invitationInfo.institution.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {invitationInfo.institution.name}
                  </h2>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {invitationInfo.institution.institutionType.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {invitationInfo.institution.description && (
                <p className="text-xs text-slate-600 line-clamp-2">
                  {invitationInfo.institution.description}
                </p>
              )}

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Offered Role:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border capitalize ${getRoleBadge(
                    invitationInfo.role
                  )}`}
                >
                  {invitationInfo.role}
                </span>
              </div>

              {invitationInfo.title && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Designation:</span>
                  <span className="font-semibold text-slate-800">{invitationInfo.title}</span>
                </div>
              )}

              {invitationInfo.department && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="font-semibold text-slate-800">{invitationInfo.department}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Invited Email:</span>
                <span className="font-medium text-slate-700">{invitationInfo.invitedUser.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{accepting ? 'Joining Institution...' : 'Accept & Join Now'}</span>
              </button>

              <button
                onClick={() => {
                  setInvitationInfo(null);
                  setInputCode('');
                }}
                className="w-full text-slate-500 hover:text-slate-700 text-xs py-2 font-medium transition-colors"
              >
                Use a different invitation code
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(inputCode);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Invitation Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. INV-XXXX-YYYY"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden font-mono uppercase tracking-wider"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the invitation code provided by your institution administrator.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Code...' : 'Lookup Invitation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link
                to="/institution/portal/dashboard"
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Return to Institution Workspace
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
