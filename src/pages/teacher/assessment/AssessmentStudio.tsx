import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  UploadCloud,
  Plus,
  Search,
  BookOpen,
  Clock,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  Trash2,
  Edit3,
  Users,
  Eye,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Check,
  X,
  Sliders,
  Filter,
  Layers,
  Send,
  EyeOff,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Loader } from '../../../components/ui/Loader';
import { useToast } from '../../../hooks/useToast';
import { assessmentService } from '../../../services/assessmentService';
import { resolveAssetUrl } from '../../../services/apiClient';
import { teachingContextService } from '../../../services/teachingContextService';
import { classSectionService } from '../../../services/classSectionService';
import { TeacherClassGroup } from '../../../types/classSection';
import { TeachingContext } from '../../../types/lessonPlan';
import {
  AssessmentItem,
  AssessmentQuestion,
  QuestionType,
  AssessmentUsages,
  AssessmentSchedule,
  OriginalDocumentReference,
  AssessmentAttemptsSummary,
} from '../../../types/assessment';

export default function AssessmentStudio() {
  const toast = useToast();

  // Primary state
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [teachingContexts, setTeachingContexts] = useState<TeachingContext[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUsageFilter, setSelectedUsageFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Modals & Active Workspaces
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [showAttemptsModal, setShowAttemptsModal] = useState<boolean>(false);
  const [showTextPreviewModal, setShowTextPreviewModal] = useState<boolean>(false);

  // Active Draft / Editing Assessment
  const [activeDraft, setActiveDraft] = useState<Partial<AssessmentItem> | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(false);

  // Action Loading states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Scheduled Attempts Data
  const [attemptsData, setAttemptsData] = useState<AssessmentAttemptsSummary | null>(null);
  const [activeAttemptsTestTitle, setActiveAttemptsTestTitle] = useState<string>('');
  const [activeAttemptsTestId, setActiveAttemptsTestId] = useState<string>('');
  const [isPublishingResults, setIsPublishingResults] = useState<boolean>(false);

  // AI Generator Form
  const [aiForm, setAiForm] = useState({
    teachingContextId: '',
    subject: 'Physics',
    board: 'CBSE',
    classLevel: 'Class 10',
    chapter: '',
    topic: '',
    questionCount: 10,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard' | 'Mixed',
    questionTypes: ['mcq'] as string[],
  });

  // Upload Form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadContextId, setUploadContextId] = useState<string>('');
  const [uploadSubject, setUploadSubject] = useState<string>('Science');
  const [uploadClass, setUploadClass] = useState<string>('Class 10');
  const [uploadBoard, setUploadBoard] = useState<string>('CBSE');

  // Usage / Schedule Modal Form
  const [targetAssessmentForUsage, setTargetAssessmentForUsage] = useState<AssessmentItem | null>(null);
  const [usageForm, setUsageForm] = useState<{
    usages: AssessmentUsages;
    schedule: AssessmentSchedule;
  }>({
    usages: { studyMaterial: false, practice: false, scheduledTest: false },
    schedule: {
      teachingContextId: '',
      scheduledDate: '',
      startTime: '09:00',
      endTime: '10:00',
      batchOrSection: '',
      instructions: 'Read all instructions carefully before starting the exam.',
    },
  });

  // Load teaching contexts, assessments & classes
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ctxs, asms, cls] = await Promise.all([
        teachingContextService.getContexts().catch(() => []),
        assessmentService.listAssessments().catch(() => []),
        classSectionService.getTeacherClasses().catch(() => []),
      ]);
      setTeachingContexts(ctxs);
      setAssessments(asms);
      setTeacherClasses(cls);
    } catch (err) {
      console.error('Failed to load assessment studio data:', err);
      toast.error('Could not load assessments from server');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle TeachingContext selection in AI Modal
  const handleAiContextChange = (ctxId: string) => {
    setAiForm((prev) => ({ ...prev, teachingContextId: ctxId }));
    const found = teachingContexts.find((c) => c._id === ctxId);
    if (found) {
      setAiForm((prev) => ({
        ...prev,
        subject: found.subject || prev.subject,
        board: found.curriculumBoard || prev.board,
        classLevel: found.classLevel || prev.classLevel,
      }));
    }
  };

  // Handle TeachingContext selection in Upload Modal
  const handleUploadContextChange = (ctxId: string) => {
    setUploadContextId(ctxId);
    const found = teachingContexts.find((c) => c._id === ctxId);
    if (found) {
      setUploadSubject(found.subject || uploadSubject);
      setUploadBoard(found.curriculumBoard || uploadBoard);
      setUploadClass(found.classLevel || uploadClass);
    }
  };

  // Trigger AI Question Generation
  const handleGenerateAiTest = async () => {
    if (!aiForm.subject.trim()) {
      toast.error('Please specify a subject');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await assessmentService.generateAiAssessment({
        subject: aiForm.subject,
        board: aiForm.board,
        classLevel: aiForm.classLevel,
        chapter: aiForm.chapter,
        topic: aiForm.topic || `${aiForm.subject} Assessment`,
        questionCount: aiForm.questionCount,
        difficulty: aiForm.difficulty,
        questionTypes: aiForm.questionTypes,
        teachingContextId: aiForm.teachingContextId || undefined,
      });

      // Prepare active draft in review workspace
      setActiveDraft({
        title: result.title,
        description: `${result.subject} assessment for ${result.classLevel} (${result.board}). Grounded in ${aiForm.chapter || aiForm.topic || 'curriculum'}.`,
        subject: result.subject,
        board: result.board,
        classLevel: result.classLevel,
        durationMinutes: result.durationMinutes || 30,
        totalMarks: result.totalMarks,
        sourceFormat: 'ai_generated',
        sourceType: 'teacher',
        teachingContextId: aiForm.teachingContextId || undefined,
        usages: { studyMaterial: false, practice: false, scheduledTest: false },
        questions: result.questions,
      });
      setIsEditingExisting(false);
      setShowAiModal(false);
      toast.success('Assessment questions generated! Review and customize them below.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger Document Upload & Extraction
  const handleUploadQuestionPaper = async () => {
    if (!uploadFile) {
      toast.error('Please choose a PDF, DOCX, DOC, or TXT question paper file');
      return;
    }

    setIsUploading(true);
    try {
      const parsed = await assessmentService.uploadAndExtract(uploadFile, {
        subject: uploadSubject,
        board: uploadBoard,
        classLevel: uploadClass,
        teachingContextId: uploadContextId || undefined,
      });

      setActiveDraft({
        title: parsed.title,
        description: `Uploaded question paper: ${parsed.originalDocument.fileName} (${parsed.subject} ${parsed.classLevel})`,
        subject: parsed.subject || uploadSubject,
        board: parsed.board || uploadBoard,
        classLevel: parsed.classLevel || uploadClass,
        durationMinutes: parsed.durationMinutes || 30,
        totalMarks: parsed.totalMarks || 25,
        sourceFormat: (uploadFile.name.split('.').pop()?.toLowerCase() as any) || 'pdf',
        sourceType: 'teacher',
        teachingContextId: uploadContextId || undefined,
        originalDocument: parsed.originalDocument,
        usages: { studyMaterial: false, practice: false, scheduledTest: false },
        questions: parsed.questions,
      });

      setIsEditingExisting(false);
      setShowUploadModal(false);
      setUploadFile(null);
      toast.success(`Extracted ${parsed.questions.length} questions from document! Review them below.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Document extraction failed');
    } finally {
      setIsUploading(false);
    }
  };

  // AI Suggest Answers for unkeyed questions in active draft
  const handleSuggestAnswers = async () => {
    if (!activeDraft?.questions || activeDraft.questions.length === 0) {
      toast.error('No questions available in the current draft');
      return;
    }

    setIsSuggesting(true);
    try {
      const suggestions = await assessmentService.suggestAnswers(activeDraft.questions, {
        subject: activeDraft.subject,
        board: activeDraft.board,
        classLevel: activeDraft.classLevel,
      });

      if (suggestions.length === 0) {
        toast.info('All questions already seem to have solutions or no suggestions were returned');
        return;
      }

      // Merge suggestions into draft questions
      const updated = [...activeDraft.questions];
      let mergedCount = 0;
      for (const item of suggestions) {
        if (updated[item.index]) {
          if (!updated[item.index].correctAnswer || updated[item.index].correctAnswer === '') {
            updated[item.index].correctAnswer = item.suggestedAnswer;
          }
          if (!updated[item.index].explanation || updated[item.index].explanation === 'Detailed solution') {
            updated[item.index].explanation = item.explanation;
          }
          mergedCount++;
        }
      }

      setActiveDraft((prev) => ({ ...prev, questions: updated }));
      toast.success(`AI suggested solutions applied to ${mergedCount} questions!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to suggest answers');
    } finally {
      setIsSuggesting(false);
    }
  };

  // Save / Publish Draft Assessment
  const handleSaveDraft = async () => {
    if (!activeDraft?.title?.trim()) {
      toast.error('Please enter a title for the assessment');
      return;
    }
    if (!activeDraft.questions || activeDraft.questions.length === 0) {
      toast.error('Assessment must contain at least one question');
      return;
    }

    if (activeDraft.usages?.scheduledTest) {
      const selectedCtxId = activeDraft.schedule?.teachingContextId || (typeof activeDraft.teachingContextId === 'object' ? (activeDraft.teachingContextId as any)?._id : activeDraft.teachingContextId);
      if (!selectedCtxId) {
        toast.error('Please select a target Class / Section for the scheduled test');
        return;
      }
    }

    setIsSaving(true);
    try {
      const hasUsages = Boolean(
        activeDraft.usages?.studyMaterial ||
        activeDraft.usages?.practice ||
        activeDraft.usages?.scheduledTest
      );

      let draftToSave = { ...activeDraft };
      if (draftToSave.usages?.scheduledTest && draftToSave.schedule?.scheduledDate) {
        const [sh, sm] = (draftToSave.schedule.startTime || '09:00').split(':');
        const [eh, em] = (draftToSave.schedule.endTime || '10:00').split(':');
        const [yr, mo, dy] = draftToSave.schedule.scheduledDate.split('-').map(Number);
        const sDate = new Date(yr, mo - 1, dy, Number(sh) || 0, Number(sm) || 0, 0, 0);
        const eDate = new Date(yr, mo - 1, dy, Number(eh) || 0, Number(em) || 0, 59, 999);
        draftToSave = {
          ...draftToSave,
          schedule: {
            ...draftToSave.schedule,
            startDate: sDate.toISOString(),
            endDate: eDate.toISOString(),
            timezoneOffset: new Date().getTimezoneOffset(),
          },
        };
      }

      await assessmentService.saveAssessment(draftToSave);
      toast.success(hasUsages ? 'Assessment saved and published!' : 'Assessment saved as draft! (You can configure usages or schedule anytime)');
      setActiveDraft(null);
      setIsEditingExisting(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setIsSaving(false);
    }
  };

  // Open existing assessment for editing
  const handleEditAssessment = async (testItem: AssessmentItem) => {
    try {
      const full = await assessmentService.getAssessmentById(testItem.id || (testItem as any)._id);
      setActiveDraft(full);
      setIsEditingExisting(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Could not load assessment details');
    }
  };

  // Open Usage / Schedule configuration modal
  const handleOpenUsageModal = (testItem: AssessmentItem) => {
    const existingTargetGroups = (
      testItem.schedule?.targetGroups ||
      testItem.targetClassSectionIds ||
      []
    ).map((g: any) => (typeof g === 'object' && g?._id ? g._id.toString() : g.toString()));

    setTargetAssessmentForUsage(testItem);
    setUsageForm({
      usages: testItem.usages || { studyMaterial: false, practice: false, scheduledTest: false },
      schedule: {
        teachingContextId: testItem.schedule?.teachingContextId || (typeof testItem.teachingContextId === 'object' ? testItem.teachingContextId?._id : testItem.teachingContextId) || '',
        scheduledDate: testItem.schedule?.scheduledDate ? testItem.schedule.scheduledDate.split('T')[0] : '',
        startTime: testItem.schedule?.startTime || '09:00',
        endTime: testItem.schedule?.endTime || '10:00',
        batchOrSection: testItem.schedule?.batchOrSection || '',
        targetGroups: existingTargetGroups,
        instructions: testItem.schedule?.instructions || 'Read all instructions carefully before starting the exam.',
      },
    });
    setShowUsageModal(true);
  };

  // Save Usages / Schedule configuration
  const handleSaveUsages = async () => {
    if (!targetAssessmentForUsage) return;

    if (usageForm.usages.scheduledTest) {
      const targetGroups = usageForm.schedule.targetGroups || [];
      const hasTarget = targetGroups.length > 0 || usageForm.schedule.teachingContextId;
      if (!hasTarget) {
        toast.error('Please select at least one target Class / Section for the scheduled test');
        return;
      }
    }

    try {
      const testId = targetAssessmentForUsage.id || (targetAssessmentForUsage as any)._id;
      let schedulePayload = usageForm.usages.scheduledTest ? { ...usageForm.schedule } : undefined;

      if (schedulePayload && schedulePayload.scheduledDate) {
        const [sh, sm] = (schedulePayload.startTime || '09:00').split(':');
        const [eh, em] = (schedulePayload.endTime || '10:00').split(':');
        const [yr, mo, dy] = schedulePayload.scheduledDate.split('-').map(Number);
        const sDate = new Date(yr, mo - 1, dy, Number(sh) || 0, Number(sm) || 0, 0, 0);
        const eDate = new Date(yr, mo - 1, dy, Number(eh) || 0, Number(em) || 0, 59, 999);
        schedulePayload = {
          ...schedulePayload,
          startDate: sDate.toISOString(),
          endDate: eDate.toISOString(),
          timezoneOffset: new Date().getTimezoneOffset(),
        };
      }

      await assessmentService.saveAssessment({
        id: testId,
        usages: usageForm.usages,
        schedule: schedulePayload,
        targetClassSectionIds: usageForm.schedule.targetGroups,
        teachingContextId: usageForm.schedule.teachingContextId || (typeof targetAssessmentForUsage.teachingContextId === 'object' ? (targetAssessmentForUsage.teachingContextId as any)?._id : targetAssessmentForUsage.teachingContextId) || undefined,
      });

      toast.success('Assessment usages and schedule updated successfully!');
      setShowUsageModal(false);
      setTargetAssessmentForUsage(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update assessment usage configuration');
    }
  };

  // View scheduled test attempts
  const handleViewAttempts = async (testItem: AssessmentItem) => {
    const testId = testItem.id || (testItem as any)._id;
    setActiveAttemptsTestId(testId);
    try {
      const res = await assessmentService.getAssessmentAttempts(testId);
      setAttemptsData(res);
      setActiveAttemptsTestTitle(testItem.title);
      setShowAttemptsModal(true);
    } catch (err) {
      toast.error('Failed to fetch test attempt records');
    }
  };

  // Publish / Unpublish results for students
  const handleTogglePublishResults = async (publish: boolean) => {
    if (!activeAttemptsTestId) return;
    setIsPublishingResults(true);
    try {
      await assessmentService.publishResults(activeAttemptsTestId, publish);
      toast.success(
        publish
          ? 'Results & answer explanations published to students!'
          : 'Results are now hidden from students.'
      );
      const res = await assessmentService.getAssessmentAttempts(activeAttemptsTestId);
      setAttemptsData(res);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update result publication status');
    } finally {
      setIsPublishingResults(false);
    }
  };

  // Delete assessment
  const handleDeleteAssessment = async (testId: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment? All associated questions will be removed.')) {
      return;
    }
    try {
      await assessmentService.deleteAssessment(testId);
      toast.success('Assessment deleted');
      await loadData();
    } catch (err) {
      toast.error('Failed to delete assessment');
    }
  };

  // Question editing helpers in Draft workspace
  const handleUpdateQuestion = (index: number, updates: Partial<AssessmentQuestion>) => {
    if (!activeDraft?.questions) return;
    const updated = [...activeDraft.questions];
    updated[index] = { ...updated[index], ...updates };
    setActiveDraft((prev) => ({ ...prev, questions: updated }));
  };

  const handleAddQuestion = () => {
    const newQ: AssessmentQuestion = {
      questionNumber: (activeDraft?.questions?.length || 0) + 1,
      question: 'New Question',
      questionType: 'mcq',
      options: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' },
        { id: 'D', text: 'Option D' },
      ],
      correctAnswer: 'A',
      marks: 1,
      negativeMarks: 0,
      explanation: 'Explanation for correct answer.',
      difficulty: 'Medium',
    };
    setActiveDraft((prev) => ({
      ...prev,
      questions: [...(prev?.questions || []), newQ],
    }));
  };

  const handleDeleteQuestion = (index: number) => {
    if (!activeDraft?.questions) return;
    const updated = activeDraft.questions.filter((_, i) => i !== index);
    setActiveDraft((prev) => ({ ...prev, questions: updated }));
  };

  // Filtered assessments list
  const filteredAssessments = assessments.filter((asm) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (asm.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asm.subject || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === 'all' ||
      (asm.subject || '').toLowerCase() === selectedSubjectFilter.toLowerCase();

    let matchesUsage = true;
    if (selectedUsageFilter === 'practice') {
      matchesUsage = Boolean(asm.usages?.practice);
    } else if (selectedUsageFilter === 'scheduled') {
      matchesUsage = Boolean(asm.usages?.scheduledTest);
    } else if (selectedUsageFilter === 'study') {
      matchesUsage = Boolean(asm.usages?.studyMaterial);
    }

    return matchesSearch && matchesSubject && matchesUsage;
  });

  const uniqueSubjects = Array.from(new Set(assessments.map((a) => a.subject))).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f6fbfe] text-slate-800 p-6 md:p-8 font-sans">
      {/* Top Banner Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#254b73]/10 text-[#254b73]">
                Assessment Studio
              </span>
              <span className="text-xs text-slate-400 font-medium">Pegpo Multi-Purpose Evaluation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#254b73] tracking-tight">
              Test & Question Paper System
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Create curriculum-aligned assessments via AI or upload existing question papers (PDF/DOCX). Publish as Study Materials, Student Practice Mocks, or formal Scheduled Tests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setActiveDraft(null);
                setShowAiModal(true);
              }}
              className="bg-[#254b73] hover:bg-[#1b3654] text-white shadow-sm flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              Generate with AI
            </Button>
            <Button
              onClick={() => {
                setActiveDraft(null);
                setShowUploadModal(true);
              }}
              variant="outline"
              className="border-[#254b73]/25 text-[#254b73] hover:bg-slate-100 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-white"
            >
              <UploadCloud className="w-4 h-4 text-[#254b73]" />
              Upload Question Paper
            </Button>
          </div>
        </div>
      </div>

      {/* ACTIVE DRAFT / REVIEW & EDIT WORKSPACE */}
      {activeDraft && (
        <div className="max-w-7xl mx-auto mb-12 bg-white rounded-2xl border-2 border-[#0091ff]/30 shadow-lg p-6 md:p-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0091ff]/10 text-[#0091ff]">
                  {isEditingExisting ? 'Editing Assessment' : 'New Assessment Draft'}
                </span>
                {activeDraft.sourceFormat && (
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-600 uppercase font-mono">
                    {activeDraft.sourceFormat}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={activeDraft.title || ''}
                onChange={(e) => setActiveDraft({ ...activeDraft, title: e.target.value })}
                placeholder="Assessment Title (e.g. Class 10 Physics Midterm)"
                className="mt-2 text-xl md:text-2xl font-bold text-slate-800 w-full border-b border-transparent hover:border-slate-200 focus:border-[#0091ff] outline-none pb-1 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSuggestAnswers}
                disabled={isSuggesting}
                className="text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg"
              >
                {isSuggesting ? (
                  <Loader size="sm" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                )}
                AI Suggest Answers
              </Button>
              <Button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className={`${
                  Boolean(activeDraft.usages?.studyMaterial || activeDraft.usages?.practice || activeDraft.usages?.scheduledTest)
                    ? 'bg-[#0091ff] hover:bg-[#007cdb]'
                    : 'bg-[#254b73] hover:bg-[#1b3654]'
                } text-white flex items-center gap-1.5 text-xs py-2 px-4 rounded-lg font-medium shadow-sm transition-colors`}
              >
                {isSaving ? <Loader size="sm" /> : <Check className="w-3.5 h-3.5" />}
                {Boolean(activeDraft.usages?.studyMaterial || activeDraft.usages?.practice || activeDraft.usages?.scheduledTest)
                  ? 'Save & Publish'
                  : 'Save Draft (Set Usages Later)'}
              </Button>
              <button
                onClick={() => {
                  if (window.confirm('Discard current changes?')) {
                    setActiveDraft(null);
                    setIsEditingExisting(false);
                  }
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close Editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Reference Document Card (If Uploaded) */}
          {activeDraft.originalDocument?.fileName && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-800">
                      Original Reference Document: {activeDraft.originalDocument.fileName}
                    </h4>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-200/60 text-blue-800 font-medium">
                      Preserved for Students & Teachers
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Storage: <span className="font-mono">{activeDraft.originalDocument.storageType}</span> &bull; File Size: {activeDraft.originalDocument.fileSize ? `${Math.round(activeDraft.originalDocument.fileSize / 1024)} KB` : 'Uploaded'} &bull; Uploaded: {new Date(activeDraft.originalDocument.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeDraft.originalDocument.extractedText && (
                  <Button
                    variant="outline"
                    onClick={() => setShowTextPreviewModal(true)}
                    className="text-xs py-1.5 px-3 bg-white text-slate-700 hover:bg-blue-50 border-blue-200"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Preview Text
                  </Button>
                )}
                <a
                  href={resolveAssetUrl(activeDraft.originalDocument.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  download={activeDraft.originalDocument.fileName}
                  className="inline-flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg bg-[#254b73] text-white hover:bg-[#1b3654] transition-colors font-medium shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View / Download File
                </a>
              </div>
            </div>
          )}

          {/* Assessment Metadata Fields */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Subject</label>
              <input
                type="text"
                value={activeDraft.subject || ''}
                onChange={(e) => setActiveDraft({ ...activeDraft, subject: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 mt-1 focus:border-[#0091ff] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Class Level</label>
              <input
                type="text"
                value={activeDraft.classLevel || ''}
                onChange={(e) => setActiveDraft({ ...activeDraft, classLevel: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 mt-1 focus:border-[#0091ff] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Board</label>
              <input
                type="text"
                value={activeDraft.board || ''}
                onChange={(e) => setActiveDraft({ ...activeDraft, board: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 mt-1 focus:border-[#0091ff] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Duration (Mins)</label>
              <input
                type="number"
                value={activeDraft.durationMinutes || 30}
                onChange={(e) => setActiveDraft({ ...activeDraft, durationMinutes: Number(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 mt-1 focus:border-[#0091ff] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Total Marks</label>
              <input
                type="number"
                value={activeDraft.totalMarks || 25}
                onChange={(e) => setActiveDraft({ ...activeDraft, totalMarks: Number(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 mt-1 focus:border-[#0091ff] outline-none"
              />
            </div>
          </div>

          {/* Assessment Usages & Scheduling Configuration */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#0091ff]" />
                  Publishing & Usages
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select student availability now, or leave unchecked to save as a private draft and set usages later.
                </p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded w-fit ${
                Boolean(activeDraft.usages?.studyMaterial || activeDraft.usages?.practice || activeDraft.usages?.scheduledTest)
                  ? 'bg-blue-100 text-[#0091ff]'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {Boolean(activeDraft.usages?.studyMaterial || activeDraft.usages?.practice || activeDraft.usages?.scheduledTest)
                  ? 'Will Publish with Usages'
                  : 'Draft (Usages Set Later)'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Study Material */}
              <div
                onClick={() =>
                  setActiveDraft({
                    ...activeDraft,
                    usages: {
                      ...(activeDraft.usages || { studyMaterial: false, practice: false, scheduledTest: false }),
                      studyMaterial: !activeDraft.usages?.studyMaterial,
                    },
                  })
                }
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  activeDraft.usages?.studyMaterial
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(activeDraft.usages?.studyMaterial)}
                  onChange={() => {}}
                  className="accent-emerald-600 mt-0.5 cursor-pointer w-4 h-4 shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    📚 Study Material
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">Library</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Publish in the Student Library as a reference question bank alongside any original uploaded document.
                  </p>
                </div>
              </div>

              {/* Practice Mock */}
              <div
                onClick={() =>
                  setActiveDraft({
                    ...activeDraft,
                    usages: {
                      ...(activeDraft.usages || { studyMaterial: false, practice: false, scheduledTest: false }),
                      practice: !activeDraft.usages?.practice,
                    },
                  })
                }
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  activeDraft.usages?.practice
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(activeDraft.usages?.practice)}
                  onChange={() => {}}
                  className="accent-amber-600 mt-0.5 cursor-pointer w-4 h-4 shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    ⚡ Practice Mock
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">Self-Paced</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Available for students to take as a self-paced practice test with instant explanations and solutions.
                  </p>
                </div>
              </div>

              {/* Scheduled Test */}
              <div
                onClick={() =>
                  setActiveDraft({
                    ...activeDraft,
                    usages: {
                      ...(activeDraft.usages || { studyMaterial: false, practice: false, scheduledTest: false }),
                      scheduledTest: !activeDraft.usages?.scheduledTest,
                    },
                  })
                }
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  activeDraft.usages?.scheduledTest
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(activeDraft.usages?.scheduledTest)}
                  onChange={() => {}}
                  className="accent-indigo-600 mt-0.5 cursor-pointer w-4 h-4 shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    📅 Scheduled Test
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-medium">Exam</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Conduct a timed formal exam for a specific class & section with submissions recorded for grading.
                  </p>
                </div>
              </div>
            </div>

            {/* Scheduled Test Detail Section (if selected in Active Draft) */}
            {activeDraft.usages?.scheduledTest && (
              <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-indigo-900 uppercase">
                    Schedule Details & Target Class
                  </h5>
                  <span className="text-[10px] text-indigo-600 font-medium">Required for Scheduled Tests</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Class & Section *
                    </label>
                    <select
                      value={
                        activeDraft.schedule?.teachingContextId ||
                        (typeof activeDraft.teachingContextId === 'object'
                          ? (activeDraft.teachingContextId as any)?._id
                          : activeDraft.teachingContextId) ||
                        ''
                      }
                      onChange={(e) => {
                        const ctxId = e.target.value;
                        setActiveDraft({
                          ...activeDraft,
                          teachingContextId: ctxId,
                          schedule: {
                            ...(activeDraft.schedule || {
                              scheduledDate: '',
                              startTime: '09:00',
                              endTime: '10:00',
                            }),
                            teachingContextId: ctxId,
                          },
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose Class & Section --</option>
                      {teachingContexts.map((ctx) => (
                        <option key={ctx._id} value={ctx._id}>
                          {ctx.classLevel} {ctx.section ? `(${ctx.section})` : ''} - {ctx.subject} ({ctx.curriculumBoard})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={
                        activeDraft.schedule?.scheduledDate
                          ? activeDraft.schedule.scheduledDate.split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setActiveDraft({
                          ...activeDraft,
                          schedule: {
                            ...(activeDraft.schedule || {
                              teachingContextId: '',
                              startTime: '09:00',
                              endTime: '10:00',
                            }),
                            scheduledDate: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={activeDraft.schedule?.startTime || '09:00'}
                      onChange={(e) =>
                        setActiveDraft({
                          ...activeDraft,
                          schedule: {
                            ...(activeDraft.schedule || {
                              teachingContextId: '',
                              scheduledDate: '',
                              endTime: '10:00',
                            }),
                            startTime: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={activeDraft.schedule?.endTime || '10:00'}
                      onChange={(e) =>
                        setActiveDraft({
                          ...activeDraft,
                          schedule: {
                            ...(activeDraft.schedule || {
                              teachingContextId: '',
                              scheduledDate: '',
                              startTime: '09:00',
                            }),
                            endTime: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Questions Header & Quick Actions */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#254b73] flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Questions & Answer Keys ({activeDraft.questions?.length || 0})
            </h3>
            <Button
              onClick={handleAddQuestion}
              variant="outline"
              className="text-xs py-1 px-3 border-dashed border-[#254b73]/40 text-[#254b73] hover:bg-slate-50 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Question
            </Button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {activeDraft.questions?.map((q, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#254b73] text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <select
                      value={q.questionType || 'mcq'}
                      onChange={(e) => handleUpdateQuestion(idx, { questionType: e.target.value as QuestionType })}
                      className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-1 font-semibold text-slate-700"
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="nat">Numerical (NAT)</option>
                      <option value="descriptive">Descriptive / Short Answer</option>
                    </select>

                    <select
                      value={q.difficulty || 'Medium'}
                      onChange={(e) => handleUpdateQuestion(idx, { difficulty: e.target.value as any })}
                      className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-600"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Marks:</span>
                      <input
                        type="number"
                        value={q.marks || 1}
                        onChange={(e) => handleUpdateQuestion(idx, { marks: Number(e.target.value) || 1 })}
                        className="w-12 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-center font-bold text-slate-800"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <textarea
                  rows={2}
                  value={q.question || ''}
                  onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                  placeholder="Enter question text here..."
                  className="w-full text-sm text-slate-800 p-2.5 rounded-lg border border-slate-200 focus:border-[#0091ff] outline-none mb-3 resize-y"
                />

                {/* MCQ Options */}
                {q.questionType === 'mcq' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {(q.options || []).map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          q.correctAnswer === opt.id
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correctAnswer === opt.id}
                          onChange={() => handleUpdateQuestion(idx, { correctAnswer: opt.id })}
                          className="accent-emerald-600 w-4 h-4 cursor-pointer"
                          title="Mark as correct answer"
                        />
                        <span className="text-xs font-bold text-slate-700 w-4">{opt.id}.</span>
                        <input
                          type="text"
                          value={opt.text || ''}
                          onChange={(e) => {
                            const newOpts = [...(q.options || [])];
                            newOpts[optIdx] = { ...opt, text: e.target.value };
                            handleUpdateQuestion(idx, { options: newOpts });
                          }}
                          placeholder={`Option ${opt.id}`}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:border-[#0091ff] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Numerical Answer */}
                {q.questionType === 'nat' && (
                  <div className="mb-3 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700">Correct Numerical Value:</label>
                    <input
                      type="number"
                      step="any"
                      value={q.numericalAnswer !== undefined ? q.numericalAnswer : q.correctAnswer || ''}
                      onChange={(e) =>
                        handleUpdateQuestion(idx, {
                          numericalAnswer: Number(e.target.value),
                          correctAnswer: e.target.value,
                        })
                      }
                      placeholder="e.g. 9.8"
                      className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold text-emerald-700 w-32 focus:border-emerald-500 outline-none"
                    />
                  </div>
                )}

                {/* Solution / Explanation */}
                <div className="text-xs text-slate-600 flex flex-col gap-1">
                  <label className="font-semibold text-slate-500">Explanation & Pedagogical Solution:</label>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                    placeholder="Provide step-by-step reasoning for student revision..."
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 focus:border-[#0091ff] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Catalog View */}
      <div className="max-w-7xl mx-auto">
        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessments by title, subject, or topic..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0091ff] outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Subject Filter */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium outline-none focus:border-[#0091ff]"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Usages Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setSelectedUsageFilter('all')}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedUsageFilter === 'all' ? 'bg-white text-[#254b73] shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedUsageFilter('practice')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  selectedUsageFilter === 'practice' ? 'bg-white text-amber-700 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                ⚡ Practice
              </button>
              <button
                onClick={() => setSelectedUsageFilter('scheduled')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  selectedUsageFilter === 'scheduled' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                📅 Scheduled
              </button>
              <button
                onClick={() => setSelectedUsageFilter('study')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  selectedUsageFilter === 'study' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                📚 Study
              </button>
            </div>

            <Button
              variant="outline"
              onClick={loadData}
              className="p-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Assessments Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader size="lg" text="Loading Assessment Studio..." />
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0091ff] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Assessments Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Create your first multi-purpose assessment by generating questions using AI or uploading an existing examination document (PDF/DOCX).
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => setShowAiModal(true)}
                className="bg-[#254b73] hover:bg-[#1b3654] text-white text-xs px-4 py-2"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-300" />
                Generate with AI
              </Button>
              <Button
                onClick={() => setShowUploadModal(true)}
                variant="outline"
                className="border-slate-300 text-slate-700 text-xs px-4 py-2 bg-white"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1" />
                Upload Paper
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((asm) => (
              <div
                key={asm.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        {asm.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-[#0091ff]">
                        {asm.classLevel}
                      </span>
                    </div>

                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                      {asm.sourceFormat || 'ai'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-[#0091ff] transition-colors">
                    {asm.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {asm.description || 'Curriculum aligned assessment paper.'}
                  </p>

                  {/* Metadata chips */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 my-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{asm.questionsCount || asm.questions?.length || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{asm.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{asm.durationMinutes}m</span>
                    </div>
                  </div>

                  {/* Usages Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {asm.usages?.studyMaterial && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        📚 Study Material
                      </span>
                    )}
                    {asm.usages?.practice && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        ⚡ Practice Mock
                      </span>
                    )}
                    {asm.usages?.scheduledTest && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        📅 Scheduled Test
                      </span>
                    )}
                    {!asm.usages?.studyMaterial && !asm.usages?.practice && !asm.usages?.scheduledTest && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        📝 Draft (Set Usages Later)
                      </span>
                    )}
                  </div>

                  {/* Scheduled info notice if active */}
                  {asm.usages?.scheduledTest && asm.schedule?.scheduledDate && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>
                          {new Date(asm.schedule.scheduledDate).toLocaleDateString()} &bull; {asm.schedule.startTime} - {asm.schedule.endTime}
                        </span>
                        {asm.resultsPublished ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Results Published
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Review Pending
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleViewAttempts(asm)}
                        className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-0.5 ml-2"
                      >
                        <Users className="w-3 h-3" />
                        Submissions & Publish
                      </button>
                    </div>
                  )}

                  {/* Original file attachment if present */}
                  {asm.originalDocument?.fileName && (
                    <div className="text-[11px] text-slate-500 mb-4 flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                      <span className="truncate max-w-[180px] font-medium text-slate-700">
                        📎 {asm.originalDocument.fileName}
                      </span>
                      <a
                        href={resolveAssetUrl(asm.originalDocument.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        download={asm.originalDocument.fileName}
                        className="text-[#0091ff] hover:underline font-semibold flex items-center gap-0.5 text-[10px]"
                      >
                        {(asm.originalDocument.fileName?.toLowerCase()?.endsWith('.pdf') ? 'PDF' : 'File')}{' '}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      onClick={() => handleEditAssessment(asm)}
                      className="text-xs py-1.5 px-2.5 border-slate-200 text-slate-700 hover:bg-slate-50"
                      title="Edit Questions & Answer Keys"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-[#254b73]" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenUsageModal(asm)}
                      className="text-xs py-1.5 px-2.5 border-slate-200 text-slate-700 hover:bg-slate-50"
                      title="Configure Usages & Scheduling"
                    >
                      <Sliders className="w-3.5 h-3.5 mr-1 text-[#0091ff]" />
                      Usages
                    </Button>
                  </div>

                  <button
                    onClick={() => handleDeleteAssessment(asm.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Assessment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI GENERATION MODAL */}
      <Modal
        isOpen={showAiModal}
        onClose={() => {
          if (!isGenerating) setShowAiModal(false);
        }}
        title="Generate Assessment with AI"
        maxWidth="lg"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-500">
            Generate high-standard, syllabus-aligned questions tailored to your teaching context, difficulty, and question format preferences.
          </p>

          {/* Teaching Context Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Teaching Context (Optional)
            </label>
            <select
              value={aiForm.teachingContextId}
              onChange={(e) => handleAiContextChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
            >
              <option value="">-- Custom Parameters / None --</option>
              {teachingContexts.map((ctx) => (
                <option key={ctx._id} value={ctx._id}>
                  {ctx.subject} &bull; {ctx.classLevel} {ctx.section ? `(${ctx.section})` : ''} &bull; {ctx.curriculumBoard}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                value={aiForm.subject}
                onChange={(e) => setAiForm({ ...aiForm, subject: e.target.value })}
                placeholder="e.g. Mathematics"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Level</label>
              <input
                type="text"
                value={aiForm.classLevel}
                onChange={(e) => setAiForm({ ...aiForm, classLevel: e.target.value })}
                placeholder="e.g. Class 10"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Curriculum Board</label>
              <input
                type="text"
                value={aiForm.board}
                onChange={(e) => setAiForm({ ...aiForm, board: e.target.value })}
                placeholder="e.g. CBSE"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter / Unit</label>
              <input
                type="text"
                value={aiForm.chapter}
                onChange={(e) => setAiForm({ ...aiForm, chapter: e.target.value })}
                placeholder="e.g. Electricity and Magnetism"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Topic</label>
              <input
                type="text"
                value={aiForm.topic}
                onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                placeholder="e.g. Ohm's Law & Resistors in Series"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Questions: <span className="font-bold text-[#0091ff]">{aiForm.questionCount}</span>
              </label>
              <input
                type="range"
                min={3}
                max={25}
                step={1}
                value={aiForm.questionCount}
                onChange={(e) => setAiForm({ ...aiForm, questionCount: Number(e.target.value) })}
                className="w-full accent-[#0091ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={aiForm.difficulty}
                onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value as any })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              >
                <option value="Easy">Easy (Foundational)</option>
                <option value="Medium">Medium (Standard Board Level)</option>
                <option value="Hard">Hard (HOTS / Advanced Application)</option>
                <option value="Mixed">Mixed (Balanced Distribution)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Question Formats</label>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiForm.questionTypes.includes('mcq')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAiForm({ ...aiForm, questionTypes: [...aiForm.questionTypes, 'mcq'] });
                    } else if (aiForm.questionTypes.length > 1) {
                      setAiForm({ ...aiForm, questionTypes: aiForm.questionTypes.filter((t) => t !== 'mcq') });
                    }
                  }}
                  className="accent-[#0091ff]"
                />
                Multiple Choice (MCQ)
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiForm.questionTypes.includes('nat')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAiForm({ ...aiForm, questionTypes: [...aiForm.questionTypes, 'nat'] });
                    } else if (aiForm.questionTypes.length > 1) {
                      setAiForm({ ...aiForm, questionTypes: aiForm.questionTypes.filter((t) => t !== 'nat') });
                    }
                  }}
                  className="accent-[#0091ff]"
                />
                Numerical / Direct Value
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiForm.questionTypes.includes('descriptive')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAiForm({ ...aiForm, questionTypes: [...aiForm.questionTypes, 'descriptive'] });
                    } else if (aiForm.questionTypes.length > 1) {
                      setAiForm({ ...aiForm, questionTypes: aiForm.questionTypes.filter((t) => t !== 'descriptive') });
                    }
                  }}
                  className="accent-[#0091ff]"
                />
                Short Answer / Descriptive
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowAiModal(false)}
              disabled={isGenerating}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAiTest}
              disabled={isGenerating}
              className="bg-[#254b73] hover:bg-[#1b3654] text-white text-xs px-5 py-2 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader size="sm" />
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* DOCUMENT UPLOAD MODAL */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          if (!isUploading) setShowUploadModal(false);
        }}
        title="Upload Existing Question Paper"
        maxWidth="lg"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-500">
            Upload a PDF, DOCX, DOC, or TXT file. The system extracts its text and parses structured questions into interactive items while preserving the original document as a reference.
          </p>

          {/* File input */}
          <div className="border-2 border-dashed border-slate-300 hover:border-[#0091ff] rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="hidden"
              id="assessment-file-upload"
            />
            <label
              htmlFor="assessment-file-upload"
              className="cursor-pointer text-xs font-semibold text-[#0091ff] hover:underline"
            >
              {uploadFile ? uploadFile.name : 'Click to select PDF or DOCX file'}
            </label>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PDF, DOCX, DOC, TXT (Maximum file size: 25 MB)
            </p>
          </div>

          {/* Teaching Context Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link to Teaching Context (Recommended)
            </label>
            <select
              value={uploadContextId}
              onChange={(e) => handleUploadContextChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
            >
              <option value="">-- General / No Context --</option>
              {teachingContexts.map((ctx) => (
                <option key={ctx._id} value={ctx._id}>
                  {ctx.subject} &bull; {ctx.classLevel} {ctx.section ? `(${ctx.section})` : ''} &bull; {ctx.curriculumBoard}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                placeholder="e.g. Science"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Level</label>
              <input
                type="text"
                value={uploadClass}
                onChange={(e) => setUploadClass(e.target.value)}
                placeholder="e.g. Class 10"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Curriculum Board</label>
              <input
                type="text"
                value={uploadBoard}
                onChange={(e) => setUploadBoard(e.target.value)}
                placeholder="e.g. CBSE"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              disabled={isUploading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadQuestionPaper}
              disabled={isUploading || !uploadFile}
              className="bg-[#254b73] hover:bg-[#1b3654] text-white text-xs px-5 py-2 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader size="sm" />
                  Extracting & Parsing Questions...
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  Extract Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* USAGES & SCHEDULING MODAL */}
      <Modal
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        title={`Configure Usages: ${targetAssessmentForUsage?.title || 'Assessment'}`}
        maxWidth="lg"
      >
        <div className="space-y-5 py-2">
          <p className="text-xs text-slate-500">
            A single assessment can be used across multiple pedagogical purposes. Select which modes apply to this test.
          </p>

          {/* Usage Checkboxes */}
          <div className="space-y-3">
            <div
              onClick={() =>
                setUsageForm((prev) => ({
                  ...prev,
                  usages: { ...prev.usages, studyMaterial: !prev.usages.studyMaterial },
                }))
              }
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                usageForm.usages.studyMaterial
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <input
                type="checkbox"
                checked={usageForm.usages.studyMaterial}
                onChange={() => {}}
                className="accent-emerald-600 mt-1 cursor-pointer w-4 h-4"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  📚 Study Material
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Student Library
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish to the Student Library as a reference question bank alongside the original reference document.
                </p>
              </div>
            </div>

            <div
              onClick={() =>
                setUsageForm((prev) => ({
                  ...prev,
                  usages: { ...prev.usages, practice: !prev.usages.practice },
                }))
              }
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                usageForm.usages.practice
                  ? 'border-amber-500 bg-amber-50/40'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <input
                type="checkbox"
                checked={usageForm.usages.practice}
                onChange={() => {}}
                className="accent-amber-600 mt-1 cursor-pointer w-4 h-4"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  ⚡ Practice Mock
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    Interactive Student Test
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Students can take this as a self-paced practice mock with immediate feedback and solutions. Attempts are tagged as practice to avoid contaminating classroom metrics.
                </p>
              </div>
            </div>

            <div
              onClick={() =>
                setUsageForm((prev) => ({
                  ...prev,
                  usages: { ...prev.usages, scheduledTest: !prev.usages.scheduledTest },
                }))
              }
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                usageForm.usages.scheduledTest
                  ? 'border-indigo-500 bg-indigo-50/40'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <input
                type="checkbox"
                checked={usageForm.usages.scheduledTest}
                onChange={() => {}}
                className="accent-indigo-600 mt-1 cursor-pointer w-4 h-4"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  📅 Scheduled Test
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
                    Formal Examination
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conduct a formal timed test targeting a specific class and section. Submissions are strictly recorded for teacher grading and evaluation.
                </p>
              </div>
            </div>
          </div>

          {/* Scheduled Test Detail Section */}
          {usageForm.usages.scheduledTest && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3">
              <h5 className="text-xs font-bold text-indigo-900 uppercase">
                Examination Schedule & Target Audience
              </h5>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Classes / Sections * (Multiple Selection Supported)
                </label>
                {teacherClasses.length === 0 && teachingContexts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No classes found. You can configure classes in My Classes.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                    {(teacherClasses.length > 0
                      ? teacherClasses
                      : teachingContexts.map((c) => ({
                          classSectionId: (c.classSectionId as any)?._id || c.classSectionId || c._id,
                          name: `${c.classLevel}${c.section ? ` - ${c.section}` : ''}`,
                          subject: c.subject,
                          board: c.curriculumBoard,
                          studentCount: 0,
                          teachingContextId: c._id,
                        }))
                    ).map((cls: any) => {
                      const idStr = cls.classSectionId ? cls.classSectionId.toString() : cls.teachingContextId?.toString();
                      const isChecked = (usageForm.schedule.targetGroups || []).includes(idStr);
                      return (
                        <label
                          key={`${idStr}-${cls.subject}`}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-indigo-50 border border-indigo-200'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const current = usageForm.schedule.targetGroups || [];
                                const updated = isChecked
                                  ? current.filter((id) => id !== idStr)
                                  : [...current, idStr];
                                setUsageForm((prev) => ({
                                  ...prev,
                                  schedule: {
                                    ...prev.schedule,
                                    targetGroups: updated,
                                    teachingContextId: cls.teachingContextId || prev.schedule.teachingContextId,
                                  },
                                }));
                              }}
                              className="accent-indigo-600 rounded w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-800">
                                {cls.name}
                              </span>
                              <span className="text-[11px] text-slate-500 ml-2">
                                {cls.subject} ({cls.board || 'CBSE'})
                              </span>
                            </div>
                          </div>
                          {cls.studentCount !== undefined && cls.studentCount > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                              {cls.studentCount} Students
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={usageForm.schedule.scheduledDate}
                    onChange={(e) =>
                      setUsageForm((prev) => ({
                        ...prev,
                        schedule: { ...prev.schedule, scheduledDate: e.target.value },
                      }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={usageForm.schedule.startTime}
                    onChange={(e) =>
                      setUsageForm((prev) => ({
                        ...prev,
                        schedule: { ...prev.schedule, startTime: e.target.value },
                      }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={usageForm.schedule.endTime}
                    onChange={(e) =>
                      setUsageForm((prev) => ({
                        ...prev,
                        schedule: { ...prev.schedule, endTime: e.target.value },
                      }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Instructions</label>
                <textarea
                  rows={2}
                  value={usageForm.schedule.instructions}
                  onChange={(e) =>
                    setUsageForm((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, instructions: e.target.value },
                    }))
                  }
                  placeholder="Instructions displayed to students before they start the test..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowUsageModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUsages}
              className="bg-[#254b73] hover:bg-[#1b3654] text-white text-xs px-5 py-2"
            >
              Save Usages & Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* SCHEDULED TEST ATTEMPTS MODAL */}
      <Modal
        isOpen={showAttemptsModal}
        onClose={() => setShowAttemptsModal(false)}
        title={`Scheduled Test Submissions: ${activeAttemptsTestTitle}`}
        maxWidth="xl"
      >
        <div className="space-y-4 py-2">
          {attemptsData ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Submissions</span>
                  <p className="text-xl font-bold text-slate-800 mt-0.5">{attemptsData.totalAttempts}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Class Average</span>
                  <p className="text-xl font-bold text-indigo-700 mt-0.5">{attemptsData.averageScore} pts</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Highest Score</span>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">{attemptsData.highestScore} pts</p>
                </div>
              </div>

              {/* Publish Results Control Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border bg-white shadow-2xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Student Results Status:</span>
                    {attemptsData.resultsPublished ? (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Published to Students
                      </span>
                    ) : (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-amber-600" />
                        Hidden (Pending Review)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {attemptsData.resultsPublished
                      ? 'Students can view their scores, detailed question analysis, and answer explanations.'
                      : 'Students cannot see scores or question explanations until you review and publish them.'}
                  </p>
                </div>

                <div>
                  {attemptsData.resultsPublished ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPublishingResults}
                      onClick={() => handleTogglePublishResults(false)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                    >
                      {isPublishingResults ? 'Updating...' : 'Unpublish Results'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isPublishingResults}
                      onClick={() => handleTogglePublishResults(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPublishingResults ? 'Publishing...' : 'Publish Results to Students'}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Submissions Table */}
              {attemptsData.attempts.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">
                  No scheduled test attempts recorded yet for this assessment.
                </p>
              ) : (
                <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2.5">Student</th>
                        <th className="p-2.5">Class / School</th>
                        <th className="p-2.5">Score</th>
                        <th className="p-2.5">Accuracy</th>
                        <th className="p-2.5">Time Spent</th>
                        <th className="p-2.5">Submitted</th>
                        <th className="p-2.5">Result Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attemptsData.attempts.map((att) => (
                        <tr key={att._id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-800">
                            {att.studentProfileId?.name || att.userId?.email || 'Student'}
                          </td>
                          <td className="p-2.5 text-slate-500">
                            {att.studentProfileId?.education?.classLevel || att.studentProfileId?.schoolDetails?.classLevel || 'Class 10'}
                          </td>
                          <td className="p-2.5 font-bold text-emerald-700">
                            {att.score || 0} / {att.maxScore || '-'}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {att.accuracy !== undefined ? `${att.accuracy}%` : '-'}
                          </td>
                          <td className="p-2.5 text-slate-500">
                            {att.timeSpentSeconds ? `${Math.round(att.timeSpentSeconds / 60)}m` : '1m'}
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">
                            {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'In Progress'}
                          </td>
                          <td className="p-2.5">
                            {att.isResultPublished || attemptsData.resultsPublished ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <EyeOff className="w-2.5 h-2.5" /> Pending Review
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 flex justify-center">
              <Loader size="md" text="Fetching test attempt records..." />
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowAttemptsModal(false)}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* EXTRACTED TEXT PREVIEW MODAL */}
      <Modal
        isOpen={showTextPreviewModal}
        onClose={() => setShowTextPreviewModal(false)}
        title="Extracted Document Text Preview"
        maxWidth="2xl"
      >
        <div className="space-y-3 py-2">
          <p className="text-xs text-slate-500">
            Below is the preview of raw text extracted by Pegpo Document Extraction Service from the original uploaded file:
          </p>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {activeDraft?.originalDocument?.extractedText || 'No text content available'}
          </pre>
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowTextPreviewModal(false)}
              className="text-xs"
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
