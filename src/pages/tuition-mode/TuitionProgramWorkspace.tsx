import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { tuitionService } from '../../services/tuitionService';
import { authService } from '../../services/authService';
import { TuitionProgram, CombinedStudyMessage } from '../../types/tuition';

export const TuitionProgramWorkspace: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { programContext } = tuitionService.getTuitionModeSession();

  const [program, setProgram] = useState<TuitionProgram | null>(null);
  const [roster, setRoster] = useState<{ teachers: any[]; students: any[]; userRole: string } | null>(null);
  const [messages, setMessages] = useState<CombinedStudyMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'study' | 'live' | 'roster'>('study');
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setLoading(false);
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
              onClick={() => navigate('/student/live-classes')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span>Launch Live SmartBoard</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('study')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
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
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'live'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Schedule &amp; Auto-Logout Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'roster'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Program Roster</span>
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
      </div>
    </div>
  );
};
export default TuitionProgramWorkspace;

