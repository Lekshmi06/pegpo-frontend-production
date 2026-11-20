import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  ShieldAlert,
  User,
  Clock,
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  Send,
  Loader2,
} from 'lucide-react';
import { tuitionService, UserComplaintItem } from '../../services/tuitionService';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgramId?: string;
  initialProgramTitle?: string;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  initialProgramId,
  initialProgramTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [category, setCategory] = useState<string>('Technical / SmartBoard');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [programId, setProgramId] = useState<string>(initialProgramId || '');

  // Submitting state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ ticketCode: string; message: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Tickets history state
  const [myComplaints, setMyComplaints] = useState<UserComplaintItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      if (initialProgramId) {
        setProgramId(initialProgramId);
      }
    }
  }, [isOpen, initialProgramId]);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await tuitionService.getMyComplaints();
      if (res.success) {
        setMyComplaints(res.complaints || []);
      }
    } catch (err: any) {
      console.error('Failed to load user complaints:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setSubmitError('Please provide both a subject and a detailed description.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const res = await tuitionService.submitComplaint({
        isAnonymous,
        category,
        subject: subject.trim(),
        description: description.trim(),
        programId: programId || undefined,
      });

      setSubmitSuccess({
        ticketCode: res.ticketCode,
        message: res.message || 'Grievance ticket created successfully.',
      });
      setSubject('');
      setDescription('');
      loadHistory();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                EduPye Grievance &amp; Issue Resolution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confidential reporting with optional identity masking and live progress tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => { setActiveTab('submit'); setSubmitSuccess(null); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'submit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Submit New Grievance
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('history'); loadHistory(); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            My Tickets &amp; Progress
            {myComplaints.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 font-bold">
                {myComplaints.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'submit' ? (
            <div>
              {submitSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900 mb-1">
                    Grievance Ticket Created!
                  </h4>
                  <p className="text-xs text-emerald-700 mb-4">
                    {submitSuccess.message}
                  </p>

                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-sm mb-5">
                    <span className="text-xs text-slate-500 font-medium">Ticket Code:</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {submitSuccess.ticketCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(submitSuccess.ticketCode)}
                      className="text-slate-400 hover:text-slate-700 ml-1"
                      title="Copy ticket code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copiedCode === submitSuccess.ticketCode && (
                      <span className="text-[11px] text-emerald-600 font-bold">Copied!</span>
                    )}
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitSuccess(null);
                        setActiveTab('history');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
                    >
                      View in My Tickets
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(null)}
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                    >
                      File Another Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Privacy Mode Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Reporting Privacy Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(true)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                          isAnonymous
                            ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                          <span className="text-sm">🕵️</span>
                          <span>Submit Anonymously</span>
                        </div>
                        <p className="text-[11px] text-purple-700 leading-snug">
                          Your name, email, and permanent code are 100% masked from instructors and staff.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAnonymous(false)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                          !isAnonymous
                            ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Include My Profile</span>
                        </div>
                        <p className="text-[11px] text-indigo-700 leading-snug">
                          Includes your registered profile details for direct one-on-one administrative follow-up.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Issue Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      >
                        <option value="Technical / SmartBoard">Technical / SmartBoard / Live Class</option>
                        <option value="Academic / Class">Academic / Curriculum / Teacher Delivery</option>
                        <option value="Conduct / Behavior">Conduct / Chat Harassment / Behavior</option>
                        <option value="Schedule / Billing">Schedule Conflict / Attendance / Billing</option>
                        <option value="Other">Other Operational Grievance</option>
                      </select>
                    </div>

                    {initialProgramTitle ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Linked Program
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={initialProgramTitle}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject / Brief Summary *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Constant audio echo during evening batch, or abusive comment in study chat"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Detailed Description *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the incident, session date/time, participants involved, or steps to reproduce the issue..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans"
                    />
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Protected under EduPye Institutional Compliance &amp; Whistleblower Standards
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Grievance</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div>
              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span>Loading your grievance tickets...</span>
                </div>
              ) : myComplaints.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">No Tickets Filed</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    You have not submitted any complaints or grievance reports yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('submit')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Submit a Grievance
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myComplaints.map((ticket) => {
                    const isExpanded = expandedTicketId === ticket._id;
                    const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
                      open: { bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700', label: 'Open' },
                      in_review: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', label: 'In Review' },
                      resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', label: 'Resolved' },
                      closed: { bg: 'bg-slate-100 text-slate-600 border-slate-200', text: 'text-slate-600', label: 'Closed' },
                    };
                    const badge = statusStyles[ticket.status] || statusStyles.open;

                    return (
                      <div
                        key={ticket._id}
                        className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition bg-white"
                      >
                        <div
                          className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 transition"
                          onClick={() => setExpandedTicketId(isExpanded ? null : ticket._id)}
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                                {ticket.ticketCode}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                                {badge.label}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                              {ticket.isAnonymous && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                                  🕵️ Anonymous
                                </span>
                              )}
                            </div>

                            <h5 className="text-xs font-bold text-slate-900 mb-1">
                              {ticket.subject}
                            </h5>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {ticket.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {ticket.adminProgressNotes?.length || 0} Update{(ticket.adminProgressNotes?.length || 0) !== 1 ? 's' : ''}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details & Admin Notes */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
                            <div className="mb-3">
                              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                Full Grievance Description:
                              </div>
                              <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                                {ticket.description}
                              </p>
                            </div>

                            <div>
                              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>Investigation &amp; Resolution Timeline:</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  Updated in real-time by EduPye Compliance Team
                                </span>
                              </div>

                              {ticket.adminProgressNotes && ticket.adminProgressNotes.length > 0 ? (
                                <div className="space-y-2">
                                  {ticket.adminProgressNotes.map((note, idx) => (
                                    <div
                                      key={idx}
                                      className="p-3 bg-white rounded-lg border-l-4 border-indigo-500 shadow-xs border-slate-200"
                                    >
                                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                        <span className="font-bold text-slate-800">
                                          {note.updatedBy || 'EduPye Admin'}
                                        </span>
                                        <span>{new Date(note.updatedAt).toLocaleString()}</span>
                                      </div>
                                      <p className="text-xs text-slate-700">{note.message}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-3 bg-white rounded-lg border border-slate-200 text-center text-xs text-slate-400 italic">
                                  Ticket has been received and is queued for review by the operations team. Progress notes will appear here.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;