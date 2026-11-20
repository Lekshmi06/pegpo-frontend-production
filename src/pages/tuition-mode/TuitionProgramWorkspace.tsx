import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Video,
  Clock,
  Users,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Send,
  Upload,
  Paperclip,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  Info,
  Tv,
  Play,
  Film,
  ChevronDown,
  ChevronUp,
  X,
  Receipt,
  Plus,
  Award,
  CheckCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { tuitionService, TuitionHomeworkItem } from '../../services/tuitionService';
import { authService } from '../../services/authService';
import { TuitionProgram, CombinedStudyMessage, IProgramScheduleSlot } from '../../types/tuition';
import { ComplaintModal } from '../../components/tuition/ComplaintModal';

export const TuitionProgramWorkspace: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { programContext } = tuitionService.getTuitionModeSession();

  const [program, setProgram] = useState<TuitionProgram | null>(null);
  const [roster, setRoster] = useState<{ teachers: any[]; students: any[]; userRole: string } | null>(null);
  const [messages, setMessages] = useState<CombinedStudyMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'study' | 'live' | 'recordings' | 'roster' | 'homework'>('study');
  const [loading, setLoading] = useState(true);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Past Classes & 1-Year Recordings state
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Batch Homework & Tasks state
  const [homeworkList, setHomeworkList] = useState<TuitionHomeworkItem[]>([]);
  const [loadingHomework, setLoadingHomework] = useState(false);
  const [isCreateHomeworkModalOpen, setIsCreateHomeworkModalOpen] = useState(false);
  const [creatingHomework, setCreatingHomework] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100,
    attachmentName: '',
    attachmentUrl: '',
  });

  // Student submission state
  const [submittingHomeworkItem, setSubmittingHomeworkItem] = useState<TuitionHomeworkItem | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionAttachmentUrl, setSubmissionAttachmentUrl] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  // Teacher review & grading state
  const [reviewingHomework, setReviewingHomework] = useState<TuitionHomeworkItem | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradingScore, setGradingScore] = useState<number | ''>('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // User role check
  const userRole = (currentUser?.role || currentUser?.activeRole || (currentUser as any)?.userType || '').toLowerCase();
  const isTeacher = Boolean(
    userRole === 'teacher' ||
    userRole === 'tuition_provider' ||
    userRole === 'institution' ||
    userRole === 'admin' ||
    Boolean(currentUser?.teacherCode) ||
    roster?.userRole === 'teacher'
  );

  // Combined Study input state
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (programId) {
      loadWorkspaceData();
    }
  }, [programId]);

  useEffect(() => {
    if (activeTab === 'study') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const upcomingSessions = useMemo(() => {
    if (!program?.schedule || !Array.isArray(program.schedule) || program.schedule.length === 0) return [];
    const DAY_MAP: Record<string, number> = {
      sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2,
      wednesday: 3, wed: 3, thursday: 4, thu: 4, friday: 5, fri: 5,
      saturday: 6, sat: 6,
    };
    const list: Array<{
      dateStr: string;
      dayLabel: string;
      startTime: string;
      endTime: string;
      canJoinNow: boolean;
    }> = [];
    const now = new Date();

    for (let offset = 0; offset <= 30 && list.length < 5; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const dayOfWeek = d.getDay();
      for (let sIdx = 0; sIdx < program.schedule.length; sIdx++) {
        const slot: IProgramScheduleSlot = program.schedule[sIdx];
        const slotDay = (slot.day || '').toLowerCase().trim();
        if (DAY_MAP[slotDay] === dayOfWeek) {
          const partsStart = slot.startTime.replace(/[^0-9:]/g, '').split(':');
          const partsEnd = slot.endTime.replace(/[^0-9:]/g, '').split(':');
          const sh = parseInt(partsStart[0], 10) || 0;
          const sm = parseInt(partsStart[1], 10) || 0;
          const eh = parseInt(partsEnd[0], 10) || 0;
          const em = parseInt(partsEnd[1], 10) || 0;
          const startDt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), sh, sm);
          const endDt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), eh, em);

          const canJoinNow = now >= new Date(startDt.getTime() - 15 * 60 * 1000) && now <= new Date(endDt.getTime() + 15 * 60 * 1000);
          const isPast = now > new Date(endDt.getTime() + 15 * 60 * 1000);

          if (!isPast || canJoinNow) {
            list.push({
              dateStr: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
              dayLabel: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              canJoinNow,
            });
            if (list.length >= 5) break;
          }
        }
      }
    }
    return list;
  }, [program?.schedule]);

  const loadWorkspaceData = async () => {
    if (!programId) return;
    try {
      setLoading(true);
      // Fetch roster & program info
      const rosterRes = await tuitionService.getProgramRoster(programId);
      if (rosterRes.success) {
        setRoster({
          teachers: rosterRes.teachers || rosterRes.assignedTeachers || [],
          students: rosterRes.students || rosterRes.enrolledStudents || rosterRes.coStudents || [],
          userRole: rosterRes.role || rosterRes.userRole || 'student',
        });
        if (rosterRes.program) {
          setProgram(rosterRes.program);
        }
      }

      // Fetch study stream messages
      const msgRes = await tuitionService.getCombinedStudyMessages(programId);
      if (msgRes.success) {
        setMessages(msgRes.messages || []);
      }

      // Fetch past recordings & 365-day archives
      tuitionService.getProgramRecordings(programId).then((recRes) => {
        if (recRes.success) {
          setRecordings(recRes.recordings || []);
        }
      }).catch((e) => console.warn('Could not load program recordings:', e));

      // Fetch batch homework & tasks
      setLoadingHomework(true);
      tuitionService.getProgramHomework(programId).then((hwRes) => {
        if (hwRes.success) {
          setHomeworkList(hwRes.homework || []);
        }
      }).catch((e) => console.warn('Could not load program homework:', e))
        .finally(() => setLoadingHomework(false));
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !homeworkForm.title.trim() || !homeworkForm.dueDate) return;
    try {
      setCreatingHomework(true);
      const attachments = homeworkForm.attachmentUrl.trim()
        ? [{ name: homeworkForm.attachmentName.trim() || 'Assignment Resource', url: homeworkForm.attachmentUrl.trim() }]
        : [];
      const res = await tuitionService.createProgramHomework(programId, {
        title: homeworkForm.title.trim(),
        description: homeworkForm.description.trim(),
        dueDate: new Date(homeworkForm.dueDate).toISOString(),
        totalPoints: Number(homeworkForm.totalPoints) || 100,
        attachments,
      });
      if (res.success && res.homework) {
        setHomeworkList((prev) => [res.homework, ...prev]);
        setIsCreateHomeworkModalOpen(false);
        setHomeworkForm({
          title: '',
          description: '',
          dueDate: '',
          totalPoints: 100,
          attachmentName: '',
          attachmentUrl: '',
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create homework assignment');
    } finally {
      setCreatingHomework(false);
    }
  };

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHomeworkItem) return;
    try {
      setSubmittingWork(true);
      const res = await tuitionService.submitHomework(submittingHomeworkItem._id, {
        content: submissionContent.trim(),
        attachmentUrl: submissionAttachmentUrl.trim() || undefined,
        attachmentName: submissionAttachmentUrl.trim() ? 'Student Submission File' : undefined,
      });
      if (res.success && res.submission) {
        setHomeworkList((prev) =>
          prev.map((hw) =>
            hw._id === submittingHomeworkItem._id
              ? { ...hw, mySubmission: res.submission, submissionsCount: (hw.submissionsCount || 0) + 1 }
              : hw
          )
        );
        setSubmittingHomeworkItem(null);
        setSubmissionContent('');
        setSubmissionAttachmentUrl('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit homework');
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingHomework || !gradingSubmission) return;
    try {
      setSubmittingGrade(true);
      const res = await tuitionService.gradeHomework(reviewingHomework._id, gradingSubmission.studentId, {
        grade: Number(gradingScore),
        feedback: gradingFeedback.trim(),
        status: 'graded',
      });
      if (res.success && res.submission) {
        const updatedSubs = (reviewingHomework.submissions || []).map((s: any) =>
          s.studentId === gradingSubmission.studentId ? res.submission : s
        );
        const updatedHw = { ...reviewingHomework, submissions: updatedSubs };
        setReviewingHomework(updatedHw);
        setHomeworkList((prev) => prev.map((hw) => (hw._id === reviewingHomework._id ? updatedHw : hw)));
        setGradingSubmission(null);
        setGradingScore('');
        setGradingFeedback('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save grade');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || (!messageText.trim() && !selectedFile)) return;

    try {
      setSending(true);
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (messageText.trim()) {
          formData.append('content', messageText.trim());
        }
        res = await tuitionService.postCombinedStudyMessage(programId, formData);
      } else {
        res = await tuitionService.postCombinedStudyMessage(programId, {
          messageType: 'text',
          content: messageText.trim(),
        });
      }

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setMessageText('');
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Failed to send study message:', err);
    } finally {
      setSending(false);
    }
  };

  const isRevoked = currentUser?.tuitionApprovalStatus === 'revoked' || (currentUser as any)?.tuitionApprovalStatus === 'suspended';
  if (isRevoked) {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 min-h-[70vh]">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Tuition Access Revoked</h2>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            Your tuition workspace access has been suspended or revoked by an administrator. Active program rosters, study streams, and live smartboard rooms are restricted.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Report Issue / Submit Grievance</span>
            </button>
            <button
              onClick={() => navigate('/tuition-mode')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              Back to Tuition Directory
            </button>
          </div>
          <ComplaintModal
            isOpen={isComplaintModalOpen}
            onClose={() => setIsComplaintModalOpen(false)}
            initialProgramId={programId}
            initialProgramTitle={program?.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 flex flex-col min-h-0">
      {/* Workspace Sub-Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tuition-mode')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Back to Programs Directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {program?.title || programContext?.title || 'Tuition Program'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {program?.code || programContext?.code || 'PRG'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Subject: <span className="text-slate-200">{program?.subject || programContext?.subject}</span>
                {program?.grade && <span> &bull; Grade: {program.grade}</span>}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium text-xs transition cursor-pointer"
              title="Report classroom, technical, conduct or attendance issue"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Issue</span>
            </button>

            {isTeacher && (
              <button
                onClick={() => navigate('/teacher/tuition-earnings')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="View your teaching sessions, attendance logs & earnings"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                <span>Tuition Earnings</span>
              </button>
            )}

            <button
              onClick={() => {
                const liveRoomId = program?.code || program?._id || programId || 'tuition-live';
                navigate(`/live/${encodeURIComponent(liveRoomId)}`);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span>Launch Live SmartBoard</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('study')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'study'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Combined Study Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'live'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Schedule &amp; Auto-Logout Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('recordings')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'recordings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Past Classes &amp; 1-Year Recordings</span>
            {recordings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {recordings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'roster'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Program Roster</span>
          </button>

          <button
            onClick={() => setActiveTab('homework')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'homework'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Homework &amp; Tasks</span>
            {homeworkList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {homeworkList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col min-h-0">
        {/* Tab 1: Combined Study Stream */}
        {activeTab === 'study' && (
          <div className="flex-1 flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Stream Header Notification */}
            <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Combined Study Stream &bull; Chat, PDF, image, and video exchange enabled
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                1-Year Retained Archive
              </span>
            </div>

            {/* Stream Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12">
                  <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                  <p>No messages yet in this Combined Study stream.</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Start collaborating with your teacher or fellow students below.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderName =
                    typeof msg.senderId === 'object' && msg.senderId?.name
                      ? msg.senderId.name
                      : 'User';
                  const isTeacher = msg.senderRole === 'teacher';

                  return (
                    <div key={msg._id} className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{senderName}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isTeacher
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 max-w-2xl">
                        {msg.content && <p className="whitespace-pre-wrap mb-1">{msg.content}</p>}

                        {msg.fileUrl && (
                          <div className="mt-2 pt-2 border-t border-slate-800">
                            {msg.messageType === 'image' ? (
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName || 'Shared Image'}
                                className="max-h-60 rounded-lg object-contain border border-slate-700"
                              />
                            ) : msg.messageType === 'video' ? (
                              <video
                                src={msg.fileUrl}
                                controls
                                className="max-h-60 rounded-lg w-full border border-slate-700"
                              />
                            ) : (
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold"
                              >
                                <FileText className="w-4 h-4" />
                                <span>{msg.fileName || 'View Shared Document (PDF)'}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800">
              {selectedFile && (
                <div className="mb-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                  <span className="truncate">Attached: {selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-400 hover:text-red-300 text-xs ml-2 cursor-pointer font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  accept=".pdf,image/*,video/*"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Share PDF, image, or video (1-year retained)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type a message or share notes with your program group..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />

                <button
                  type="submit"
                  disabled={sending || (!messageText.trim() && !selectedFile)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Schedule & Security Policy */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Next 5 Upcoming Scheduled Live Sessions */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-red-500" />
                  Upcoming Live SmartBoard Sessions
                </h2>
                <span className="text-xs font-bold text-amber-400">Next 5 Scheduled Dates</span>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{item.dateStr}</span>
                            {item.canJoinNow && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-amber-400 font-mono mt-0.5">
                            {item.dayLabel} &bull; {item.startTime} &ndash; {item.endTime}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const liveRoomId = program?.code || program?._id || programId || 'tuition-live';
                          navigate(`/live/${encodeURIComponent(liveRoomId)}`);
                        }}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer ${
                          item.canJoinNow
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 hover:scale-105 animate-pulse'
                            : 'bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600'
                        }`}
                      >
                        <Tv className="w-4 h-4 text-white" />
                        <span>Join Live SmartBoard</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No upcoming dates scheduled for this program.</p>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Weekly Class Schedule
              </h2>

              {program?.schedule && program.schedule.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {program.schedule.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      <div className="font-bold text-white text-sm">{slot.day}</div>
                      <div className="text-xs text-amber-400 font-mono mt-1">
                        {slot.startTime} &ndash; {slot.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No scheduled slots configured for this program.</p>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    Mandatory 15-Minute Post-Session Idle Auto-Logout Rule
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Under EduPye Centralized Tuition compliance policies, all participants (students and teachers) are granted a 15-minute grace period following class conclusion. After 15 minutes of inactivity or session completion, live classroom WebSockets automatically close and the user session is gracefully logged out to safeguard student privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Program Roster */}
        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Program Teachers */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Program Teachers</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  {roster?.teachers?.length || 0}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Assigned instructors coordinating curriculum and leading live SmartBoard sessions for this batch.
              </p>

              {roster?.teachers && roster.teachers.length > 0 ? (
                <div className="space-y-3">
                  {roster.teachers.map((tch: any) => (
                    <div
                      key={tch._id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{tch.name || tch.email}</div>
                        <div className="text-[11px] text-slate-400">{tch.email}</div>
                      </div>
                      {tch.teacherCode ? (
                        <span className="font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {tch.teacherCode}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Assigned</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-slate-500">
                  No teachers assigned to this program yet.
                </div>
              )}
            </div>

            {/* Co-Students Enrolled */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Co-Students Enrolled</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {roster?.students?.length || 0}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Fellow classmates actively enrolled in this program's batch and participating in Combined Study.
              </p>

              {roster?.students && roster.students.length > 0 ? (
                <div className="space-y-3">
                  {roster.students.map((stu: any) => (
                    <div
                      key={stu._id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{stu.name || stu.email || 'Student'}</div>
                        {stu.email && <div className="text-[11px] text-slate-400">{stu.email}</div>}
                      </div>
                      {stu.studentCode && (
                        <span className="font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {stu.studentCode}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-slate-500">
                  No co-students enrolled in this program yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Past Classes & 1-Year Recordings */}
        {activeTab === 'recordings' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1-Year Compliance Vault Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                  <Film className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">365-Day Recording &amp; Attendance Vault</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Compliance Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    All completed lectures and verified student attendance records are securely archived for 1 year with instant video replay.
                  </p>
                </div>
              </div>

              {isTeacher && (
                <button
                  onClick={() => navigate('/teacher/tuition-earnings')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View Tuition Earnings</span>
                </button>
              )}
            </div>

            {/* Recordings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recordings.map((rec) => {
                const recId = rec.recordingId || rec.sessionId;
                const isExpanded = expandedLogId === recId;

                return (
                  <div
                    key={recId}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          {rec.subject || program?.subject || 'Tuition Lecture'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{rec.durationMinutes} mins</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {rec.title}
                      </h4>

                      <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>
                            {new Date(rec.sessionDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{rec.totalAttendees} Attendees Logged</span>
                        </div>
                      </div>

                      {/* Retention Countdown Pill */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{rec.retentionBadge}</span>
                      </div>
                    </div>

                    {/* Attendance Log Drawer / Accordion */}
                    {isExpanded && rec.attendanceLogs && rec.attendanceLogs.length > 0 && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                          Session Attendance Log
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {rec.attendanceLogs.map((log: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between py-0.5 text-[11px] border-b border-slate-900 last:border-0">
                              <span className="text-slate-300">{log.name}</span>
                              <div className="flex items-center gap-2">
                                {log.durationMinutes && (
                                  <span className="text-slate-500 font-mono">{log.durationMinutes}m</span>
                                )}
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  log.role === 'host' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {log.role === 'host' ? 'Host' : 'Student'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setSelectedRecording(rec)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Recording</span>
                      </button>

                      {rec.attendanceLogs && rec.attendanceLogs.length > 0 && (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : recId)}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Inspect attendance roster"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Roster</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {recordings.length === 0 && (
                <div className="col-span-full p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                  <Film className="w-10 h-10 mx-auto text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-300">No Past Recordings Archived Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When live SmartBoard classes for this program conclude, they will automatically appear here with attendance logs and a 365-day replay countdown.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Per-Batch Homework & Tasks */}
        {activeTab === 'homework' && (
          <div className="flex-1 flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Cohort Homework &amp; Assignments</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Assignments, task deadlines, and graded submissions tied specifically to this tuition cohort.
                </p>
              </div>

              {isTeacher && (
                <button
                  onClick={() => setIsCreateHomeworkModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign New Homework</span>
                </button>
              )}
            </div>

            {loadingHomework ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Loading cohort homework assignments...
              </div>
            ) : homeworkList.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
                <h4 className="text-sm font-bold text-slate-300">No Homework Assigned Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isTeacher
                    ? 'Use the button above to assign practice tasks, homework problems, or assignments for students in this cohort.'
                    : 'Your instructor has not posted any assignments for this cohort yet. Check back soon!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {homeworkList.map((hw) => {
                  const dueDateObj = new Date(hw.dueDate);
                  const isPastDue = !isNaN(dueDateObj.getTime()) && dueDateObj.getTime() < Date.now();
                  const teacherLabel = hw.teacherName || hw.assignedBy?.displayName || hw.assignedBy?.name || 'Instructor';

                  return (
                    <div
                      key={hw._id}
                      className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-lg transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-base font-bold text-white leading-snug">{hw.title}</h4>
                          <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                            {hw.totalPoints} pts
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Due: {dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                          {isPastDue && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Past Due
                            </span>
                          )}
                          <span className="text-slate-500">&bull;</span>
                          <span>Assigned by {teacherLabel}</span>
                        </div>

                        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                          {hw.description}
                        </p>

                        {/* Attachments */}
                        {hw.attachments && hw.attachments.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Resources:</span>
                            <div className="flex flex-wrap gap-2">
                              {hw.attachments.map((att, idx) => (
                                <a
                                  key={idx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs border border-slate-700/60 transition-colors"
                                >
                                  <Paperclip className="w-3 h-3 text-amber-400" />
                                  <span className="truncate max-w-[180px]">{att.name || 'Attachment'}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        {isTeacher ? (
                          <>
                            <span className="text-xs text-slate-400">
                              Submissions: <strong className="text-white">{hw.submissionsCount ?? (hw.submissions?.length || 0)}</strong>
                            </span>
                            <button
                              onClick={() => {
                                setReviewingHomework(hw);
                                setGradingSubmission(null);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                              <span>Review &amp; Grade</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-xs">
                              {hw.mySubmission ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>
                                        {hw.mySubmission.status === 'graded'
                                          ? `Score: ${hw.mySubmission.grade}/${hw.totalPoints}`
                                          : 'Submitted'}
                                      </span>
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-mono">
                                      {new Date(hw.mySubmission.submittedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {hw.mySubmission.feedback && (
                                    <p className="text-[11px] text-amber-200/90 italic bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                                      Feedback: {hw.mySubmission.feedback}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  Pending Submission
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setSubmittingHomeworkItem(hw);
                                setSubmissionContent(hw.mySubmission?.content || '');
                                setSubmissionAttachmentUrl(hw.mySubmission?.attachmentUrl || '');
                              }}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{hw.mySubmission ? 'Update Submission' : 'Submit Homework'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Replay Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-3xl w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedRecording.title}</h3>
                  <p className="text-xs text-slate-400">
                    Recorded {new Date(selectedRecording.sessionDate).toLocaleDateString()} &bull; {selectedRecording.retentionBadge}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecording(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
              <video
                src={selectedRecording.recordingUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1-Year Compliance Archive &bull; Retained until {new Date(selectedRecording.expiresAt).toLocaleDateString()}</span>
              </span>
              <button
                onClick={() => setSelectedRecording(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Homework Modal (Teacher) */}
      {isCreateHomeworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Assign New Cohort Homework</h3>
              </div>
              <button
                onClick={() => setIsCreateHomeworkModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Homework Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Practice Problems & Wave Mechanics"
                  value={homeworkForm.title}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description &amp; Problem Sets *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the questions, instructions, or specific textbook pages to complete..."
                  value={homeworkForm.description}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={homeworkForm.dueDate}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Points</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={homeworkForm.totalPoints}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, totalPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-semibold">Optional Resource Link / Worksheet URL</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Resource Label (e.g. Worksheet PDF)"
                    value={homeworkForm.attachmentName}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, attachmentName: e.target.value })}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={homeworkForm.attachmentUrl}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, attachmentUrl: e.target.value })}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateHomeworkModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingHomework}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {creatingHomework ? 'Publishing...' : 'Publish Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Homework Modal (Student) */}
      {submittingHomeworkItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Submit Homework</h3>
                <p className="text-xs text-amber-400/90 font-mono mt-0.5">{submittingHomeworkItem.title}</p>
              </div>
              <button
                onClick={() => setSubmittingHomeworkItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHomework} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Solution / Written Answers</label>
                <textarea
                  rows={4}
                  placeholder="Paste your answers, explanations, or notes for the instructor here..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Solution Document / Drive Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or OneDrive / Dropbox link"
                  value={submissionAttachmentUrl}
                  onChange={(e) => setSubmissionAttachmentUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ensure link permissions are set so your instructor can review your solution.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmittingHomeworkItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWork || (!submissionContent.trim() && !submissionAttachmentUrl.trim())}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submittingWork ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Grade Submissions Modal (Teacher) */}
      {reviewingHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Review Submissions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {reviewingHomework.title} &bull; Max: <span className="text-amber-400 font-mono">{reviewingHomework.totalPoints} pts</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setReviewingHomework(null);
                  setGradingSubmission(null);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {(!reviewingHomework.submissions || reviewingHomework.submissions.length === 0) ? (
                <div className="p-8 text-center text-slate-500">
                  No students have submitted solutions for this assignment yet.
                </div>
              ) : (
                reviewingHomework.submissions.map((sub: any) => {
                  const isBeingGraded = gradingSubmission?.studentId === sub.studentId;
                  return (
                    <div
                      key={sub.studentId}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-sm">
                            {sub.studentName || sub.studentId}
                          </span>
                          {sub.studentCode && (
                            <span className="ml-2 font-mono text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {sub.studentCode}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {sub.content && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 whitespace-pre-line text-xs">
                          {sub.content}
                        </div>
                      )}

                      {sub.attachmentUrl && (
                        <div>
                          <a
                            href={sub.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{sub.attachmentName || 'View Student Attachment'}</span>
                          </a>
                        </div>
                      )}

                      {isBeingGraded ? (
                        <form onSubmit={handleGradeSubmission} className="pt-2 border-t border-slate-700/60 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-slate-300 font-semibold mb-1">
                                Score (out of {reviewingHomework.totalPoints}) *
                              </label>
                              <input
                                type="number"
                                required
                                min="0"
                                max={reviewingHomework.totalPoints}
                                value={gradingScore}
                                onChange={(e) => setGradingScore(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-slate-300 font-semibold mb-1">Instructor Feedback</label>
                              <input
                                type="text"
                                placeholder="e.g. Great reasoning on question 3. Watch your signs on 4b."
                                value={gradingFeedback}
                                onChange={(e) => setGradingFeedback(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setGradingSubmission(null)}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submittingGrade}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold disabled:opacity-50"
                            >
                              {submittingGrade ? 'Saving...' : 'Save Grade'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {sub.status === 'graded' ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Graded: {sub.grade}/{reviewingHomework.totalPoints} pts
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Pending Review
                              </span>
                            )}
                            {sub.feedback && (
                              <span className="text-[11px] text-slate-400 italic">
                                &ldquo;{sub.feedback}&rdquo;
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setGradingSubmission(sub);
                              setGradingScore(sub.grade !== undefined ? sub.grade : '');
                              setGradingFeedback(sub.feedback || '');
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
                          >
                            {sub.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setReviewingHomework(null);
                  setGradingSubmission(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grievance & Issue Reporting Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        initialProgramId={programId}
        initialProgramTitle={program?.title}
      />
    </div>
  );
};
export default TuitionProgramWorkspace;

