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
  Edit3,
  Bell,
  VideoOff,
  UserCheck,
  Check,
  CheckCircle2,
  XCircle,
  Mic,
  Square,
  Volume2,
  Loader2,
  QrCode,
} from 'lucide-react';
import {
  tuitionService,
  TuitionHomeworkItem,
  TuitionProgramAssessmentItem,
  TuitionMCQQuestion,
} from '../../services/tuitionService';
import { authService } from '../../services/authService';
import { TuitionProgram, CombinedStudyMessage, IProgramScheduleSlot } from '../../types/tuition';
import { ComplaintModal } from '../../components/tuition/ComplaintModal';
import { MCQTestBuilderModal } from '../../components/tuition/MCQTestBuilderModal';
import { MCQTestRunnerModal } from '../../components/tuition/MCQTestRunnerModal';
import { PostAssignmentModal } from '../../components/tuition/PostAssignmentModal';
import { AssignmentSubmissionsModal } from '../../components/tuition/AssignmentSubmissionsModal';
import { TuitionIdCardModal } from '../../components/tuition/TuitionIdCardModal';

export type WorkspaceTab = 'overview' | 'students' | 'teachers' | 'study' | 'live' | 'recordings' | 'homework' | 'roster';

const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || '';
  const cleanBase = apiBase.replace(/\/api\/?$/, '');
  return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const TuitionProgramWorkspace: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { programContext } = tuitionService.getTuitionModeSession();

  const [program, setProgram] = useState<TuitionProgram | null>(null);
  const [roster, setRoster] = useState<{ teachers: any[]; students: any[]; userRole: string } | null>(null);
  const [messages, setMessages] = useState<CombinedStudyMessage[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [loading, setLoading] = useState(true);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Teacher multi-program switcher & student announcements state
  const [teacherPrograms, setTeacherPrograms] = useState<TuitionProgram[]>([]);
  const [announcementModalUser, setAnnouncementModalUser] = useState<any | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // User Profile modal state
  const [profileModalUser, setProfileModalUser] = useState<any | null>(null);
  const [idCardModalUser, setIdCardModalUser] = useState<any | null>(null);

  // Edit Program Overview state (Teachers/Admins)
  const [isEditOverviewModalOpen, setIsEditOverviewModalOpen] = useState(false);
  const [overviewForm, setOverviewForm] = useState({
    nextSessionTopic: '',
    requiredMaterials: '',
    syllabusTopics: '',
  });
  const [savingOverview, setSavingOverview] = useState(false);

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

  // Centralized Program Assessments (MCQ Tests & Homework/Assignments)
  const [programAssessments, setProgramAssessments] = useState<TuitionProgramAssessmentItem[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [assessmentFilter, setAssessmentFilter] = useState<'all' | 'mcq' | 'assignments'>('all');

  // Assessment Modals state
  const [isMCQBuilderOpen, setIsMCQBuilderOpen] = useState(false);
  const [isPostAssignmentOpen, setIsPostAssignmentOpen] = useState(false);
  const [activeRunningMCQ, setActiveRunningMCQ] = useState<TuitionProgramAssessmentItem | null>(null);
  const [viewingSubmissionsAssessment, setViewingSubmissionsAssessment] = useState<TuitionProgramAssessmentItem | null>(null);

  // Student PDF Upload state
  const [uploadingPdfId, setUploadingPdfId] = useState<string | null>(null);
  const pdfInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Audio recording state for Combined Study Chat
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecordingSeconds, setAudioRecordingSeconds] = useState(0);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioTimerRef = useRef<any>(null);

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

  const allTeachers =
    roster?.teachers && roster.teachers.length > 0
      ? roster.teachers
      : program?.teachers && program.teachers.length > 0
      ? program.teachers
      : [];

  const leadTeacher = allTeachers[0] || null;

  // Combined Study input state
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Program Verification Gate: Enforce active per-program verified session
  useEffect(() => {
    if (programId && !tuitionService.isProgramVerified(programId)) {
      navigate('/tuition-mode', {
        replace: true,
        state: {
          promptProgramId: programId,
          message: 'Please enter your Full Name and Alphanumeric Code to access this tuition program.',
        },
      });
    }
  }, [programId, navigate]);

  // Keep activeTab aligned with role permissions
  useEffect(() => {
    if (isTeacher) {
      if (activeTab === 'study' || activeTab === 'teachers') {
        setActiveTab('students');
      }
    } else {
      if (activeTab === 'students') {
        setActiveTab('study');
      }
    }
  }, [isTeacher, activeTab]);

  const getStudentAttendanceCount = (studentId: string, studentName?: string) => {
    let count = 0;
    recordings.forEach((rec) => {
      if (Array.isArray(rec.attendanceLogs)) {
        const found = rec.attendanceLogs.some(
          (log: any) =>
            (log.userId && String(log.userId) === String(studentId)) ||
            (log.name && studentName && log.name.toLowerCase().includes(studentName.toLowerCase()))
        );
        if (found) count++;
      }
    });
    return count;
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !announcementText.trim() || !announcementModalUser) return;
    try {
      setSendingAnnouncement(true);
      const content = `[Teacher Notice to ${announcementModalUser.name} (${announcementModalUser.studentCode || 'Student'})]: ${announcementText.trim()}`;
      const res = await tuitionService.postCombinedStudyMessage(programId, {
        messageType: 'text',
        content,
      });
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setAnnouncementSuccess(true);
        setTimeout(() => {
          setAnnouncementSuccess(false);
          setAnnouncementModalUser(null);
          setAnnouncementText('');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to send announcement:', err);
    } finally {
      setSendingAnnouncement(false);
    }
  };

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
          setOverviewForm({
            nextSessionTopic: rosterRes.program.nextSessionTopic || '',
            requiredMaterials: (rosterRes.program.requiredMaterials || []).join('\n'),
            syllabusTopics: (rosterRes.program.syllabusTopics || []).join('\n'),
          });
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

      // Fetch centralized MCQ tests & PDF assignments
      setLoadingAssessments(true);
      tuitionService.getProgramAssessments(programId).then((assRes) => {
        if (assRes.success) {
          setProgramAssessments(assRes.assessments || []);
        }
      }).catch((e) => console.warn('Could not load program assessments:', e))
        .finally(() => setLoadingAssessments(false));
      // Fetch teacher's assigned programs for quick batch switching
      tuitionService.getTuitionPrograms().then((res) => {
        if (res.success) {
          setTeacherPrograms(res.myPrograms || res.programs || []);
        }
      }).catch((e) => console.warn('Could not load teacher programs list:', e));
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId) return;
    try {
      setSavingOverview(true);
      const res = await tuitionService.updateProgramOverview(programId, {
        nextSessionTopic: overviewForm.nextSessionTopic.trim(),
        requiredMaterials: overviewForm.requiredMaterials
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        syllabusTopics: overviewForm.syllabusTopics
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      if (res.success && res.program) {
        setProgram((prev) => (prev ? { ...prev, ...res.program } : res.program));
        setIsEditOverviewModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update overview:', err);
    } finally {
      setSavingOverview(false);
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

  const reloadAssessments = async () => {
    if (!programId) return;
    try {
      const assRes = await tuitionService.getProgramAssessments(programId);
      if (assRes.success) {
        setProgramAssessments(assRes.assessments || []);
      }
    } catch (e) {
      console.warn('Failed to reload assessments:', e);
    }
  };

  const handleCreateMCQTest = async (testData: {
    title: string;
    subject?: string;
    durationMinutes: number;
    questions: TuitionMCQQuestion[];
  }) => {
    if (!programId) return;
    const res = await tuitionService.createProgramAssessment(programId, {
      type: 'mcq_test',
      title: testData.title,
      subject: testData.subject,
      durationMinutes: testData.durationMinutes,
      questions: testData.questions,
    });
    if (res.success) {
      await reloadAssessments();
    }
  };

  const handlePostAssignmentTopic = async (data: any) => {
    if (!programId) return;
    const res = await tuitionService.createProgramAssessment(programId, data);
    if (res.success) {
      await reloadAssessments();
    }
  };

  const handleStudentUploadPdf = async (assessmentId: string, file: File) => {
    try {
      setUploadingPdfId(assessmentId);
      const res = await tuitionService.submitAssignmentPdf(assessmentId, file);
      if (res.success) {
        alert('PDF submission uploaded successfully!');
        await reloadAssessments();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to upload assignment PDF.');
    } finally {
      setUploadingPdfId(null);
    }
  };

  const handleStartAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        setSending(true);
        try {
          const uploadRes = await tuitionService.uploadTuitionMedia(audioBlob, `voice-${Date.now()}.webm`);
          if (uploadRes.success && uploadRes.url && programId) {
            const res = await tuitionService.postCombinedStudyMessage(programId, {
              messageType: 'video',
              content: '🎙️ Voice Note',
              fileUrl: uploadRes.url,
              fileName: `voice-${Date.now()}.webm`,
            } as any);
            if (res.success && res.message) {
              setMessages((prev) => [...prev, res.message]);
            }
          }
        } catch (err) {
          console.error('Failed to upload voice note:', err);
          alert('Failed to send audio message.');
        } finally {
          setSending(false);
          setIsRecordingAudio(false);
          setAudioRecordingSeconds(0);
          if (audioTimerRef.current) clearInterval(audioTimerRef.current);
        }
      };

      recorder.start();
      setIsRecordingAudio(true);
      setAudioRecordingSeconds(0);
      audioTimerRef.current = setInterval(() => {
        setAudioRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to record voice notes.');
    }
  };

  const handleStopAudioRecording = () => {
    if (audioRecorderRef.current && isRecordingAudio) {
      audioRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
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
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 min-h-[70vh]">
        <div className="max-w-md w-full bg-white dark:bg-[#0d1424] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tuition Access Revoked</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs mb-6 leading-relaxed">
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
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
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
    <div className="flex-1 bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex flex-col min-h-0 transition-colors">
      {/* Workspace Sub-Header */}
      <div className="bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 shrink-0 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tuition-mode')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Back to Programs Directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-950 dark:text-white">
                  {program?.title || programContext?.title || 'Tuition Program'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20">
                  {program?.code || programContext?.code || 'PRG'}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap mt-0.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Subject: <span className="text-slate-800 dark:text-slate-200 font-medium">{program?.subject || programContext?.subject}</span>
                  {program?.grade && <span> &bull; Grade: {program.grade}</span>}
                </p>
                {teacherPrograms.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Switch Program:</span>
                    <select
                      value={programId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        tuitionService.setProgramVerified(nextId);
                        navigate(`/tuition-mode/program/${nextId}`);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-amber-600 dark:text-amber-400 focus:outline-none cursor-pointer"
                    >
                      {teacherPrograms.map((tp) => (
                        <option key={tp._id} value={tp._id}>
                          {tp.title} ({tp.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {Boolean(currentUser?.teacherCode || currentUser?.studentCode) && (
              <button
                type="button"
                onClick={() => setIdCardModalUser(currentUser)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 border border-amber-500/30 font-bold text-xs transition cursor-pointer shadow-xs"
                title="View & Download Tuition ID Card"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>My ID Card</span>
              </button>
            )}

            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 font-medium text-xs transition cursor-pointer"
              title="Report classroom, technical, conduct or attendance issue"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Report Issue</span>
            </button>

            {isTeacher && (
              <button
                onClick={() => navigate('/teacher/tuition-earnings')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="View your teaching sessions, attendance logs & earnings"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Tuition Earnings</span>
              </button>
            )}

            <button
              onClick={() => {
                const liveRoomId = program?.code || program?._id || programId || 'tuition-live';
                const targetId = program?._id || programId;
                if (targetId) {
                  tuitionService.setProgramVerified(targetId, program?.code);
                }
                navigate(`/live/${encodeURIComponent(liveRoomId)}`, {
                  state: { programId: targetId, programCode: program?.code },
                });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span>Launch Live SmartBoard</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto">
          {/* Tab: Overview & Bio (Both) */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Overview &amp; Bio</span>
          </button>

          {/* TEACHER ONLY: Dedicated Students Enrolled Tab */}
          {isTeacher && (
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === 'students'
                  ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students Enrolled</span>
              {roster?.students && roster.students.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono">
                  {roster.students.length}
                </span>
              )}
            </button>
          )}

          {/* Program Teachers & Faculty Tab (Both Teachers & Students) */}
          <button
            onClick={() => setActiveTab('teachers')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'teachers'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isTeacher ? 'Program Faculty' : 'My Program Teachers'}</span>
            {roster?.teachers && roster.teachers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-300 font-mono">
                {roster.teachers.length}
              </span>
            )}
          </button>

          {/* STUDENT ONLY: Co-Students & Combined Study Tab */}
          {!isTeacher && (
            <button
              onClick={() => setActiveTab('study')}
              className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === 'study'
                  ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Co-Students &amp; Combined Study</span>
            </button>
          )}

          {/* Homework & Tasks (Both) */}
          <button
            onClick={() => setActiveTab('homework')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'homework'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Homework &amp; Tasks</span>
            {homeworkList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono">
                {homeworkList.length}
              </span>
            )}
          </button>

          {/* Past Classes & 1-Year Recordings (Both) */}
          <button
            onClick={() => setActiveTab('recordings')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'recordings'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Past Classes &amp; 1-Year Recordings</span>
            {recordings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono">
                {recordings.length}
              </span>
            )}
          </button>

          {/* Schedule & Auto-Logout Policy (Both) */}
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'live'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Schedule &amp; Auto-Logout Policy</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col min-h-0">
        {/* Tab 0: Program Overview & Instructor Bio */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Grid: Instructor Spotlight + Next Live Class Brief */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Instructor Spotlight Card (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      {allTeachers.length > 1 ? `Program Faculty (${allTeachers.length})` : 'Lead Instructor'}
                    </span>
                    {leadTeacher?.platformTier && (
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        Tier: {leadTeacher.platformTier}
                      </span>
                    )}
                  </div>

                  {allTeachers.length > 1 ? (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {allTeachers.map((tch: any, idx: number) => {
                        const tchSubject = tch.assignedSubject || tch.programSubject || (tch.subjects && tch.subjects[0]) || program?.subject;
                        return (
                          <div
                            key={tch._id || idx}
                            onClick={() => setProfileModalUser(tch)}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 hover:border-amber-500/40 transition-all cursor-pointer group/tch"
                          >
                            {tch.avatar || tch.profilePicture ? (
                              <img
                                src={tch.avatar || tch.profilePicture}
                                alt={tch.name || 'Instructor'}
                                className="w-12 h-12 rounded-xl object-cover border border-amber-500/40 shrink-0 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-600 dark:text-amber-300 font-extrabold text-sm flex items-center justify-center border border-amber-500/40 shrink-0">
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
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover/tch:text-amber-600 dark:group-hover/tch:text-amber-300 transition-colors truncate">
                                  {tch.name || 'Assigned Instructor'}
                                </h4>
                                {tch.teacherCode && (
                                  <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                                    {tch.teacherCode}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {tchSubject && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                                    {tchSubject}
                                  </span>
                                )}
                                {tch.experienceYears ? (
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    • {tch.experienceYears}+ yrs exp
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover/tch:text-amber-500 shrink-0 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        {leadTeacher?.avatar || leadTeacher?.profilePicture ? (
                          <img
                            src={leadTeacher.avatar || leadTeacher.profilePicture}
                            alt={leadTeacher.name || 'Instructor'}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shrink-0 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => leadTeacher && setProfileModalUser(leadTeacher)}
                          />
                        ) : (
                          <div
                            onClick={() => leadTeacher && setProfileModalUser(leadTeacher)}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-600 dark:text-amber-300 font-extrabold text-xl flex items-center justify-center border-2 border-amber-500/40 shrink-0 shadow-inner cursor-pointer hover:border-amber-400 transition-colors"
                          >
                            {(leadTeacher?.name || 'IN')
                              .split(' ')
                              .map((n: string) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                              {leadTeacher?.name || 'Assigned Instructor'}
                            </h3>
                            {leadTeacher?.teacherCode && (
                              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                                {leadTeacher.teacherCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amber-600 dark:text-amber-400/90 font-medium truncate mt-0.5">
                            {leadTeacher?.assignedSubject || leadTeacher?.qualifications?.[0] || program?.subject || 'Subject Specialist'}
                            {leadTeacher?.experienceYears ? ` • ${leadTeacher.experienceYears}+ years exp` : ''}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {leadTeacher?.email}
                          </p>
                        </div>
                      </div>

                      {/* Bio snippet */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                        {leadTeacher?.bio || 'Dedicated educator focused on conceptual clarity, active student engagement, and structured problem solving.'}
                      </p>

                      {/* Specializations & Subjects */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Credentials &amp; Subjects
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(leadTeacher?.qualifications && leadTeacher.qualifications.length > 0
                            ? leadTeacher.qualifications
                            : [program?.subject || 'General Studies']
                          ).map((q: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-300 dark:border-slate-700"
                            >
                              {q}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Verified Teaching Faculty</span>
                  <button
                    onClick={() => {
                      if (allTeachers.length > 1) {
                        setActiveTab('teachers');
                      } else if (leadTeacher) {
                        setProfileModalUser(leadTeacher);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>{allTeachers.length > 1 ? 'View All Faculty' : 'Full Instructor Profile'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Next Live Class & Required Materials Card (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Next Live Classroom Session
                      </span>
                    </div>

                    {isTeacher && (
                      <button
                        onClick={() => setIsEditOverviewModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 text-xs font-semibold transition cursor-pointer"
                        title="Edit session topic and student checklist"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Edit Class Brief &amp; Materials</span>
                      </button>
                    )}
                  </div>

                  {/* Upcoming Schedule Info Banner */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {upcomingSessions[0]?.dateStr || 'Regular Weekly Slot'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {upcomingSessions[0]?.dayLabel || program?.schedule?.[0]?.day || 'Scheduled'}:{' '}
                          <span className="text-amber-600 dark:text-amber-300 font-mono">
                            {upcomingSessions[0]?.startTime || program?.schedule?.[0]?.startTime || 'TBD'} -{' '}
                            {upcomingSessions[0]?.endTime || program?.schedule?.[0]?.endTime || 'TBD'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                      SmartBoard Session
                    </span>
                  </div>

                  {/* Today's Topic Card */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Today's Topic &amp; Class Focus
                    </span>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {program?.nextSessionTopic || 'Fundamental Principles, Concept Derivations & Live Exercises'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Live collaborative derivations, problem walkthroughs on SmartBoard, and interactive checks.
                      </p>
                    </div>
                  </div>

                  {/* Required Materials Checklist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Student Readiness &amp; Required Materials
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Bring to Live Class
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(program?.requiredMaterials && program.requiredMaterials.length > 0
                        ? program.requiredMaterials
                        : [
                            'Class Notebook & Ballpoint Pen',
                            'Standard Grade Textbook',
                            'Scientific Calculator / Formula Sheet',
                            'Questions & Doubt Notes from Chapter',
                          ]
                      ).map((item: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1-Click Launch Button */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Split SmartBoard canvas with real-time synchronized strokes</span>
                  </div>

                  <button
                    onClick={() => {
                      const liveRoomId = program?.code || program?._id || programId || 'tuition-live';
                      navigate(`/live/${encodeURIComponent(liveRoomId)}`);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Tv className="w-4 h-4" />
                    <span>Enter Live Classroom</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Syllabus Topics & Enrolled Cohort Roster */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Syllabus Progress Card (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Curriculum &amp; Syllabus Coverage</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    {(program?.syllabusTopics?.length || 4)} Core Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(program?.syllabusTopics && program.syllabusTopics.length > 0
                    ? program.syllabusTopics
                    : [
                        'Foundations & Core Axioms',
                        'Equations of Motion & Force Vectors',
                        'Rotational Dynamics & Angular Momentum',
                        'Thermodynamics & Heat Cycles',
                        'Wave Mechanics & Harmonic Oscillations',
                        'Model Exams & Problem Solving Workshops',
                      ]
                  ).map((topic: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cohort Peers Preview Card (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cohort Classmates</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300">
                      {roster?.students?.length || 0} enrolled
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    Active learners in this batch. Click any student profile to inspect their code and academic level.
                  </p>

                  {/* Student Avatars Grid */}
                  {roster?.students && roster.students.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {roster.students.map((stu: any) => (
                        <div
                          key={stu._id}
                          onClick={() => setProfileModalUser(stu)}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {stu.avatar || stu.profilePicture ? (
                              <img
                                src={stu.avatar || stu.profilePicture}
                                alt={stu.name || 'Student'}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
                                {(stu.name || 'ST')
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors truncate block">
                                {stu.name || stu.email || 'Student'}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                                {stu.grade || 'Standard'}
                              </span>
                            </div>
                          </div>

                          {stu.studentCode && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {stu.studentCode}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-500">
                      No other students enrolled yet.
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-right">
                  <button
                    onClick={() => setActiveTab(isTeacher ? 'students' : 'teachers')}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Complete Batch Roster</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Dedicated Students Enrolled (Teacher Only) */}
        {activeTab === 'students' && isTeacher && (
          <div className="space-y-6 animate-fadeIn">
            {/* Cohort Selector Header & Overview */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span>Students Enrolled in Batch</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono">
                    {roster?.students?.length || 0} Enrolled
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track enrolled students, review verified attendance logs across archived classes, and dispatch direct announcements.
                </p>
              </div>

              {/* Program Selector Dropdown across all teacher's assigned programs */}
              {teacherPrograms.length > 1 && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Switch Batch:</span>
                  <select
                    value={programId}
                    onChange={(e) => {
                      const nextProgId = e.target.value;
                      tuitionService.setProgramVerified(nextProgId);
                      navigate(`/tuition-mode/program/${nextProgId}`);
                    }}
                    className="w-full md:w-auto px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-bold text-amber-600 dark:text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {teacherPrograms.map((tp) => (
                      <option key={tp._id} value={tp._id}>
                        {tp.title} ({tp.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Students Enrolled Grid */}
            {roster?.students && roster.students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roster.students.map((stu: any) => {
                  const attendanceCount = getStudentAttendanceCount(stu._id, stu.name);
                  return (
                    <div
                      key={stu._id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-md"
                    >
                      <div className="flex items-start gap-3.5">
                        {stu.avatar || stu.profilePicture ? (
                          <img
                            src={stu.avatar || stu.profilePicture}
                            alt={stu.name || 'Student'}
                            onClick={() => setProfileModalUser(stu)}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <div
                            onClick={() => setProfileModalUser(stu)}
                            className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-amber-500/30 cursor-pointer hover:border-amber-400 transition-colors"
                          >
                            {(stu.name || 'ST')
                              .split(' ')
                              .map((n: string) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              onClick={() => setProfileModalUser(stu)}
                              className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors truncate cursor-pointer"
                            >
                              {stu.name || stu.email || 'Student'}
                            </h4>
                            {stu.studentCode && (
                              <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
                                {stu.studentCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {stu.grade || program?.grade || 'Cohort Member'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {stu.email}
                          </p>
                        </div>
                      </div>

                      {/* Attendance count badge + Action button */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" title="Classroom attendance logs verified across 365-day archives">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span className="text-[11px]">
                            <strong className="text-slate-900 dark:text-white font-mono">{attendanceCount}</strong> classes attended
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setAnnouncementModalUser(stu);
                            setAnnouncementSuccess(false);
                            setAnnouncementText('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Bell className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          <span>Message</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Students Enrolled Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Students will appear here once registered or assigned to this program batch.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Program Teachers & Faculty (Both Students & Teachers) */}
        {activeTab === 'teachers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xl">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span>{isTeacher ? 'Program Teaching Faculty' : 'My Program Teachers'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Instructors assigned to lead live SmartBoard sessions and supervise assignments for this program.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-mono">
                {roster?.teachers?.length || 0} Assigned
              </span>
            </div>

            {roster?.teachers && roster.teachers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roster.teachers.map((tch: any) => (
                  <div
                    key={tch._id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      {tch.avatar || tch.profilePicture ? (
                        <img
                          src={tch.avatar || tch.profilePicture}
                          alt={tch.name || 'Teacher'}
                          onClick={() => setProfileModalUser(tch)}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div
                          onClick={() => setProfileModalUser(tch)}
                          className="w-16 h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-extrabold text-lg flex items-center justify-center shrink-0 border-2 border-blue-500/40 cursor-pointer hover:border-amber-400 transition-colors"
                        >
                          {(tch.name || 'TC')
                            .split(' ')
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => setProfileModalUser(tch)}
                            className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors truncate cursor-pointer"
                          >
                            {tch.name || tch.email}
                          </h3>
                          {tch.teacherCode && (
                            <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                              {tch.teacherCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {(tch.assignedSubject || tch.programSubject) && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                              Subject: {tch.assignedSubject || tch.programSubject}
                            </span>
                          )}
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium truncate">
                            {tch.qualifications?.[0] || program?.subject || 'Lead Instructor'}
                            {tch.experienceYears ? ` • ${tch.experienceYears}+ yrs exp` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {tch.email}
                        </p>
                      </div>
                    </div>

                    {tch.bio && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed line-clamp-3">
                        {tch.bio}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified EduPye Instructor
                      </span>
                      <button
                        type="button"
                        onClick={() => setProfileModalUser(tch)}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold text-xs cursor-pointer"
                      >
                        View Full Bio &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No teachers assigned to this program yet.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Co-Students & Combined Study (Student Only) */}
        {activeTab === 'study' && !isTeacher && (
          <div className="space-y-4 animate-fadeIn">
            {/* Top: Co-Students Enrolled Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Enrolled Classmates</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300">
                    {roster?.students?.length || 0}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Collaborating in this batch</span>
              </div>

              {roster?.students && roster.students.length > 0 ? (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {roster.students.map((stu: any) => (
                    <div
                      key={stu._id}
                      onClick={() => setProfileModalUser(stu)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition-colors cursor-pointer shrink-0"
                    >
                      {stu.avatar || stu.profilePicture ? (
                        <img
                          src={stu.avatar || stu.profilePicture}
                          alt={stu.name || 'Student'}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-amber-500/30">
                          {(stu.name || 'ST').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                          {stu.name || 'Student'}
                        </div>
                        {stu.studentCode && (
                          <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                            {stu.studentCode}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No other co-students enrolled in this cohort yet.</p>
              )}
            </div>

            {/* Prominent Peer-Chat Callout Notice (Video Call Disabled) */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 shadow-sm">
              <div className="flex items-center gap-2">
                <VideoOff className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="font-semibold">
                  Peer chat &amp; document sharing only; supervised live video coming in a future update
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 hidden sm:inline">
                Live Video Restricted
              </span>
            </div>

            {/* Combined Study Stream Chat & Document Sharing */}
            <div className="flex flex-col h-[520px] bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
              {/* Stream Header Notification */}
              <div className="bg-slate-100 dark:bg-slate-950/80 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  Combined Study Stream &bull; Chat, PDF, image, and video exchange enabled
                </span>
                <span className="flex items-center gap-1 text-slate-400">
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
                      Start collaborating with fellow students and sharing documents below.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderName =
                      typeof msg.senderId === 'object' && msg.senderId?.name
                        ? msg.senderId.name
                        : 'User';
                    const isMsgTeacher = msg.senderRole === 'teacher';

                    return (
                      <div key={msg._id} className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{senderName}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isMsgTeacher
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
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 max-w-2xl">
                          {msg.content && <p className="whitespace-pre-wrap mb-1">{msg.content}</p>}

                              {msg.fileUrl && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                  {msg.content === '🎙️ Voice Note' || msg.fileUrl.endsWith('.webm') || msg.fileUrl.endsWith('.mp3') || msg.fileUrl.endsWith('.wav') ? (
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80">
                                      <Volume2 className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                                      <audio src={resolveMediaUrl(msg.fileUrl)} controls className="w-full max-w-sm rounded" />
                                    </div>
                                  ) : msg.messageType === 'image' ? (
                                    <img
                                      src={resolveMediaUrl(msg.fileUrl)}
                                      alt={msg.fileName || 'Shared Image'}
                                      className="max-h-60 rounded-lg object-contain border border-slate-200 dark:border-slate-700"
                                    />
                                  ) : msg.messageType === 'video' ? (
                                    <video
                                      src={resolveMediaUrl(msg.fileUrl)}
                                      controls
                                      className="max-h-60 rounded-lg w-full border border-slate-200 dark:border-slate-700"
                                    />
                                  ) : (
                                    <a
                                      href={resolveMediaUrl(msg.fileUrl)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:underline font-semibold"
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
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                {selectedFile && (
                  <div className="mb-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="truncate">Attached: {selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-600 text-xs ml-2 cursor-pointer font-bold"
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
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Share PDF, image, or video (1-year retained)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {isRecordingAudio ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{audioRecordingSeconds}s</span>
                      <button
                        type="button"
                        onClick={handleStopAudioRecording}
                        className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Send</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartAudioRecording}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      title="Record and send voice note"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}

                  <input
                    type="text"
                    placeholder="Type a message or share notes with your cohort..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
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
          </div>
        )}

        {/* Tab 2: Schedule & Security Policy */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Next 5 Upcoming Scheduled Live Sessions */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-red-500" />
                  Upcoming Live SmartBoard Sessions
                </h2>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Next 5 Scheduled Dates</span>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <span>{item.dateStr}</span>
                            {item.canJoinNow && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 text-[10px] font-black animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-0.5">
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
                <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming dates scheduled for this program.</p>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                Weekly Class Schedule
              </h2>

              {program?.schedule && program.schedule.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {program.schedule.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{slot.day}</div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-1">
                        {slot.startTime} &ndash; {slot.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No scheduled slots configured for this program.</p>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    Mandatory 15-Minute Post-Session Idle Auto-Logout Rule
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    Under EduPye Centralized Tuition compliance policies, all participants (students and teachers) are granted a 15-minute grace period following class conclusion. After 15 minutes of inactivity or session completion, live classroom WebSockets automatically close and the user session is gracefully logged out to safeguard student privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Past Classes & 1-Year Recordings */}
        {activeTab === 'recordings' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1-Year Compliance Vault Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-amber-300 dark:border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
                  <Film className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">365-Day Recording &amp; Attendance Vault</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      Compliance Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    All completed lectures and verified student attendance records are securely archived for 1 year with instant video replay.
                  </p>
                </div>
              </div>

              {isTeacher && (
                <button
                  onClick={() => navigate('/teacher/tuition-earnings')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
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
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                          {rec.subject || program?.subject || 'Tuition Lecture'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          <span>{rec.durationMinutes} mins</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                        {rec.title}
                      </h4>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
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
                          <Users className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          <span>{rec.totalAttendees} Attendees Logged</span>
                        </div>
                      </div>

                      {/* Retention Countdown Pill */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-amber-700 dark:text-amber-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                        <span>{rec.retentionBadge}</span>
                      </div>
                    </div>

                    {/* Attendance Log Drawer / Accordion */}
                    {isExpanded && rec.attendanceLogs && rec.attendanceLogs.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 animate-fadeIn">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Session Attendance Log
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {rec.attendanceLogs.map((log: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between py-0.5 text-[11px] border-b border-slate-200 dark:border-slate-900 last:border-0">
                              <span className="text-slate-700 dark:text-slate-300">{log.name}</span>
                              <div className="flex items-center gap-2">
                                {log.durationMinutes && (
                                  <span className="text-slate-500 font-mono">{log.durationMinutes}m</span>
                                )}
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  log.role === 'host' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
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
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
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
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
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
                <div className="col-span-full p-12 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <Film className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Past Recordings Archived Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When live SmartBoard classes for this program conclude, they will automatically appear here with attendance logs and a 365-day replay countdown.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Per-Batch Homework, Tasks & Centralized Assessments */}
        {activeTab === 'homework' && (
          <div className="flex-1 flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <span>Cohort Assessments, Tasks &amp; Homework</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Interactive MCQ tests with auto-grading, topic assignment submissions (PDF), and cohort homework.
                </p>
              </div>

              {isTeacher && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsMCQBuilderOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create MCQ Test</span>
                  </button>
                  <button
                    onClick={() => setIsPostAssignmentOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Assignment Topic</span>
                  </button>
                  <button
                    onClick={() => setIsCreateHomeworkModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    title="Assign Standard Practice Homework"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Quick Homework</span>
                  </button>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <button
                onClick={() => setAssessmentFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  assessmentFilter === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                All Tasks &amp; Tests ({programAssessments.length + homeworkList.length})
              </button>
              <button
                onClick={() => setAssessmentFilter('mcq')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  assessmentFilter === 'mcq'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                MCQ Tests ({programAssessments.filter((a) => a.type === 'mcq_test').length})
              </button>
              <button
                onClick={() => setAssessmentFilter('assignments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  assessmentFilter === 'assignments'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                Assignments &amp; PDF Submissions ({programAssessments.filter((a) => a.type === 'assignment').length + homeworkList.length})
              </button>
            </div>

            {loadingAssessments && loadingHomework ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                <span>Loading cohort assessments &amp; assignments...</span>
              </div>
            ) : programAssessments.length === 0 && homeworkList.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Assessments or Homework Assigned Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isTeacher
                    ? 'Create an interactive MCQ test, post an assignment topic with PDF submission, or assign practice tasks for this cohort.'
                    : 'Your instructor has not posted any tests or assignments for this cohort yet. Check back soon!'}
                </p>
                {isTeacher && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsMCQBuilderOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                    >
                      Create First MCQ Test
                    </button>
                    <button
                      onClick={() => setIsPostAssignmentOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold text-xs cursor-pointer"
                    >
                      Post Assignment Topic
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Centralized Assessments Grid (MCQs & PDF Assignments) */}
                {programAssessments.filter((a) => {
                  if (assessmentFilter === 'mcq') return a.type === 'mcq_test';
                  if (assessmentFilter === 'assignments') return a.type === 'assignment';
                  return true;
                }).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {programAssessments
                      .filter((a) => {
                        if (assessmentFilter === 'mcq') return a.type === 'mcq_test';
                        if (assessmentFilter === 'assignments') return a.type === 'assignment';
                        return true;
                      })
                      .map((item) => {
                        const isMCQ = item.type === 'mcq_test';
                        const dueDateObj = item.dueDate ? new Date(item.dueDate) : null;
                        const isPastDue = dueDateObj && !isNaN(dueDateObj.getTime()) && dueDateObj.getTime() < Date.now();
                        const isUploadingThis = uploadingPdfId === item._id;

                        return (
                          <div
                            key={item._id}
                            className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm transition-all"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                        isMCQ
                                          ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                      }`}
                                    >
                                      {isMCQ ? 'Interactive MCQ Test' : 'PDF Assignment'}
                                    </span>
                                    {item.subject && (
                                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        {item.subject}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{item.title}</h4>
                                  {item.topic && (
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300/90">Topic: {item.topic}</p>
                                  )}
                                </div>
                                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                                  {item.totalMarks} pts
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                {isMCQ && item.durationMinutes && (
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{item.durationMinutes} Mins Duration</span>
                                  </span>
                                )}
                                {isMCQ && (
                                  <span className="text-slate-400">
                                    {item.questions?.length ?? 0} Questions
                                  </span>
                                )}
                                {dueDateObj && (
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Due: {dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                  </span>
                                )}
                                {isPastDue && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                    Past Due
                                  </span>
                                )}
                                {item.createdBy?.name && (
                                  <>
                                    <span className="text-slate-500">&bull;</span>
                                    <span>By {item.createdBy.name}</span>
                                  </>
                                )}
                              </div>

                              {item.instructions && (
                                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                                  {item.instructions}
                                </p>
                              )}

                              {/* Reference File / Study PDF link */}
                              {item.referenceFileUrl && (
                                <div className="pt-1">
                                  <a
                                    href={resolveMediaUrl(item.referenceFileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 text-xs border border-amber-300 dark:border-amber-500/30 transition-colors"
                                  >
                                    <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="truncate max-w-[240px]">
                                      {item.referenceFileName || 'Study Sheet / Question PDF'}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              {isTeacher ? (
                                <>
                                  <div className="text-xs text-slate-400">
                                    Submissions:{' '}
                                    <strong className="text-white font-mono">
                                      {item.submissionsCount ?? item.submissions?.length ?? 0}
                                    </strong>
                                  </div>
                                  <button
                                    onClick={() => setViewingSubmissionsAssessment(item)}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Award className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Review Submissions &amp; Scores</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  {isMCQ ? (
                                    <>
                                      <div className="text-xs">
                                        {item.mySubmission ? (
                                          <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              <span>
                                                Score: {item.mySubmission.score ?? 0} / {item.totalMarks} ({Math.round(((item.mySubmission.score || 0) / (item.totalMarks || 1)) * 100)}%)
                                              </span>
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                            Pending Test
                                          </span>
                                        )}
                                      </div>

                                      <button
                                        onClick={() => setActiveRunningMCQ(item)}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>{item.mySubmission ? 'Review Answers' : 'Take MCQ Test'}</span>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-xs flex flex-col gap-1">
                                        {item.mySubmission?.submissionPdfUrl ? (
                                          <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                              <CheckCircle className="w-3 h-3" />
                                              <span>Submitted PDF</span>
                                            </span>
                                            <a
                                              href={resolveMediaUrl(item.mySubmission.submissionPdfUrl)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                                            >
                                              <span>View File</span>
                                              <ExternalLink className="w-3 h-3" />
                                            </a>
                                          </div>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                            Pending Submission
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          ref={(el) => {
                                            pdfInputRefs.current[item._id] = el;
                                          }}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              handleStudentUploadPdf(item._id, file);
                                            }
                                          }}
                                          className="hidden"
                                        />
                                        <button
                                          onClick={() => pdfInputRefs.current[item._id]?.click()}
                                          disabled={isUploadingThis}
                                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                          {isUploadingThis ? (
                                            <>
                                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              <span>Uploading PDF...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Upload className="w-3.5 h-3.5" />
                                              <span>{item.mySubmission?.submissionPdfUrl ? 'Update PDF' : 'Upload PDF'}</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Legacy Homework Items (if any exist) */}
                {(assessmentFilter === 'all' || assessmentFilter === 'assignments') && homeworkList.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>General Homework &amp; Practice Tasks</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {homeworkList.map((hw) => {
                        const dueDateObj = new Date(hw.dueDate);
                        const isPastDue = !isNaN(dueDateObj.getTime()) && dueDateObj.getTime() < Date.now();
                        const teacherLabel = hw.teacherName || hw.assignedBy?.displayName || hw.assignedBy?.name || 'Instructor';

                        return (
                          <div
                            key={hw._id}
                            className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm transition-all"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{hw.title}</h4>
                                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                                  {hw.totalPoints} pts
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
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

                              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
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
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Replay Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-3xl w-full shadow-2xl space-y-4 relative">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 relative max-h-[90vh] flex flex-col">
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
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 whitespace-pre-line text-xs">
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
                                className="w-full px-3 py-1.5 bg-white dark:bg-[#0a0f1d] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-slate-300 font-semibold mb-1">Instructor Feedback</label>
                              <input
                                type="text"
                                placeholder="e.g. Great reasoning on question 3. Watch your signs on 4b."
                                value={gradingFeedback}
                                onChange={(e) => setGradingFeedback(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-[#0a0f1d] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400"
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

      {/* Reusable User Profile Modal */}
      {profileModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <button
              onClick={() => setProfileModalUser(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              {profileModalUser.avatar || profileModalUser.profilePicture ? (
                <img
                  src={profileModalUser.avatar || profileModalUser.profilePicture}
                  alt={profileModalUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shrink-0 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-300 font-extrabold text-xl flex items-center justify-center border-2 border-amber-500/40 shrink-0">
                  {(profileModalUser.name || 'US')
                    .split(' ')
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white truncate">
                    {profileModalUser.name || 'EduPye Member'}
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      profileModalUser.userType === 'teacher' || profileModalUser.teacherCode
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {profileModalUser.userType === 'teacher' || profileModalUser.teacherCode ? 'Instructor' : 'Student'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{profileModalUser.email}</p>
                {(profileModalUser.teacherCode || profileModalUser.studentCode) && (
                  <div className="mt-2 space-y-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-[#060913] text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 inline-block">
                      ID: {profileModalUser.teacherCode || profileModalUser.studentCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIdCardModalUser(profileModalUser)}
                      className="w-full py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View &amp; Download ID Card</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              {profileModalUser.bio && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">About &amp; Bio</span>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#060913] p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                    {profileModalUser.bio}
                  </p>
                </div>
              )}

              {profileModalUser.qualifications && profileModalUser.qualifications.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Qualifications</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {profileModalUser.qualifications.map((q: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-medium">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profileModalUser.experienceYears ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>Teaching Experience</span>
                  <strong className="text-white">{profileModalUser.experienceYears}+ Years</strong>
                </div>
              ) : null}

              {profileModalUser.grade && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>Academic Grade / Level</span>
                  <strong className="text-white">{profileModalUser.grade}</strong>
                </div>
              )}
            </div>

            <button
              onClick={() => setProfileModalUser(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Edit Program Overview Modal (Teachers/Admins) */}
      {isEditOverviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsEditOverviewModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Edit Program Class Brief &amp; Materials</h3>
                <p className="text-xs text-slate-400">{program?.title || 'Tuition Program'}</p>
              </div>
            </div>

            <form onSubmit={handleSaveOverview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Today's Session Topic / Focus
                </label>
                <input
                  type="text"
                  value={overviewForm.nextSessionTopic}
                  onChange={(e) => setOverviewForm({ ...overviewForm, nextSessionTopic: e.target.value })}
                  placeholder="e.g. Rotational Dynamics & Moment of Inertia"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#060913] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Materials Checklist (one per line)
                </label>
                <textarea
                  rows={3}
                  value={overviewForm.requiredMaterials}
                  onChange={(e) => setOverviewForm({ ...overviewForm, requiredMaterials: e.target.value })}
                  placeholder="Class Notebook & Pen&#10;Physics Part 1 Textbook&#10;Scientific Calculator"
                  className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#060913] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Curriculum Syllabus Topics (one per line)
                </label>
                <textarea
                  rows={4}
                  value={overviewForm.syllabusTopics}
                  onChange={(e) => setOverviewForm({ ...overviewForm, syllabusTopics: e.target.value })}
                  placeholder="Module 1: Mechanics & Newton's Laws&#10;Module 2: Work, Energy & Power&#10;Module 3: Gravitation"
                  className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#060913] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOverviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOverview}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingOverview ? 'Saving Changes...' : 'Save Program Brief'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Direct Announcement Modal */}
      {announcementModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setAnnouncementModalUser(null);
                setAnnouncementSuccess(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Direct Notice &amp; Announcement</h3>
                <p className="text-xs text-slate-400">
                  Recipient: <strong className="text-amber-300">{announcementModalUser.name}</strong> ({announcementModalUser.studentCode || 'STU'})
                </p>
              </div>
            </div>

            {announcementSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Announcement dispatched to student stream successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter instructions, homework feedback, or preparation notes for this student..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#060913] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-400 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAnnouncementModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingAnnouncement || !announcementText.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {sendingAnnouncement ? 'Dispatching...' : 'Send Notice'}
                  </button>
                </div>
              </form>
            )}
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

      {/* Centralized MCQ Test Builder Modal */}
      {isMCQBuilderOpen && (
        <MCQTestBuilderModal
          isOpen={isMCQBuilderOpen}
          onClose={() => setIsMCQBuilderOpen(false)}
          onSave={handleCreateMCQTest}
        />
      )}

      {/* Centralized MCQ Test Runner Modal */}
      {activeRunningMCQ && (
        <MCQTestRunnerModal
          isOpen={Boolean(activeRunningMCQ)}
          onClose={() => setActiveRunningMCQ(null)}
          assessment={activeRunningMCQ}
          onSubmitted={reloadAssessments}
        />
      )}

      {/* Centralized Post Assignment Topic Modal */}
      {isPostAssignmentOpen && (
        <PostAssignmentModal
          isOpen={isPostAssignmentOpen}
          onClose={() => setIsPostAssignmentOpen(false)}
          onSave={handlePostAssignmentTopic}
        />
      )}

      {/* Centralized Assignment Submissions Modal */}
      {viewingSubmissionsAssessment && (
        <AssignmentSubmissionsModal
          isOpen={Boolean(viewingSubmissionsAssessment)}
          onClose={() => setViewingSubmissionsAssessment(null)}
          assessment={viewingSubmissionsAssessment}
        />
      )}

      {/* Tuition ID Card Modal */}
      {idCardModalUser && (
        <TuitionIdCardModal
          isOpen={Boolean(idCardModalUser)}
          onClose={() => setIdCardModalUser(null)}
          user={idCardModalUser}
        />
      )}
    </div>
  );
};
export default TuitionProgramWorkspace;

