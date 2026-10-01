import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Plus,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Building2,
  HelpCircle,
  FileCheck,
  Upload,
  FileText,
  AlertCircle,
  Check,
  ArrowRight,
  Send,
  Sliders,
  LayoutTemplate,
  Image as ImageIcon,
  FileImage,
  Trash2,
  Printer,
  Eye,
  MonitorUp,
  Video,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import { useLessonPlanner } from '../../hooks/useLessonPlanner';
import { useToast } from '../../hooks/useToast';
import { LessonPlan, LessonSessionStatus, LessonSession } from '../../types/lessonPlan';
import { TeachingScheduleConstraints } from '../../types/curriculum';
import { LessonPlanTemplate, LessonPlanTemplateSchema } from '../../types/lessonPlanTemplate';
import { SessionResourceManagerModal } from './components/SessionResourceManagerModal';

const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
];

export default function LessonPlanner() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateFileInputRef = useRef<HTMLInputElement>(null);

  const {
    contexts,
    selectedContext,
    plans,
    curriculums,
    selectedCurriculum,
    templates,
    selectedTemplate,
    isLoadingContexts,
    isLoadingPlans,
    isLoadingCurriculums,
    isLoadingTemplates,
    isActionLoading,
    selectContext,
    selectCurriculum,
    selectTemplate,
    fetchTemplates,
    analyzeCustomTemplate,
    saveCustomTemplate,
    createContext,
    createPlan,
    updatePlan,
    publishPlan,
    updateSessionStatus,
    uploadCurriculumFile,
    createManualCurriculum,
    processCurriculum,
    generateAIPlan,
    addSessionResource,
    updateSessionResource,
    deleteSessionResource,
    toggleSessionResourceApproval,
    generateSessionFlashcards,
  } = useLessonPlanner();

  // Modals
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [managingSession, setManagingSession] = useState<{ plan: LessonPlan; session: LessonSession } | null>(null);

  const countResourcesByType = (resources?: any[]) => {
    const counts: Record<string, number> = {};
    if (!Array.isArray(resources)) return counts;
    resources.forEach((r) => {
      const t = typeof r === 'string' ? 'reference' : r.type || 'reference';
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  };

  // New Context Form
  const [newContextClass, setNewContextClass] = useState('Class 10');
  const [newContextSection, setNewContextSection] = useState('A');
  const [newContextSubject, setNewContextSubject] = useState('Physics');
  const [newContextBoard, setNewContextBoard] = useState('CBSE');

  // New Plan Form
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newUnitNumber, setNewUnitNumber] = useState(1);
  const [newTotalHours, setNewTotalHours] = useState(4);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionObjectives, setNewSessionObjectives] = useState('');

  // Curriculum Ingestion Form
  const [curriculumTab, setCurriculumTab] = useState<'upload' | 'manual'>('upload');
  const [manualCurriculumTitle, setManualCurriculumTitle] = useState('');
  const [manualCurriculumText, setManualCurriculumText] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  // AI Plan Generator Form & Constraints
  const [aiSourceMode, setAiSourceMode] = useState<'curriculum' | 'custom'>('curriculum');
  const [aiSelectedCurriculumId, setAiSelectedCurriculumId] = useState<string>('');
  const [aiSelectedChapter, setAiSelectedChapter] = useState('');
  const [aiChapterTitle, setAiChapterTitle] = useState('');
  const [aiSessionsPerWeek, setAiSessionsPerWeek] = useState(4);
  const [aiDuration, setAiDuration] = useState(45);
  const [aiTeachingDays, setAiTeachingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Fri']);
  const [aiStartDate, setAiStartDate] = useState('');
  const [aiTargetDate, setAiTargetDate] = useState('');
  const [aiGuidelines, setAiGuidelines] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Template Selection & Custom Upload State
  const [templateMode, setTemplateMode] = useState<'none' | 'predefined' | 'custom'>('none');
  const [selectedPredefinedId, setSelectedPredefinedId] = useState<string>('');
  const [customTemplateFile, setCustomTemplateFile] = useState<File | null>(null);
  const [customTemplatePreview, setCustomTemplatePreview] = useState<string | null>(null);
  const [isAnalyzingTemplate, setIsAnalyzingTemplate] = useState(false);
  const [customDetectedSchema, setCustomDetectedSchema] = useState<LessonPlanTemplateSchema | null>(null);
  const [customSaveTitle, setCustomSaveTitle] = useState<string>('');
  const [shouldSaveCustomTemplate, setShouldSaveCustomTemplate] = useState<boolean>(false);

  // Review & Edit Plan Modal State
  const [reviewPlan, setReviewPlan] = useState<{
    chapterTitle: string;
    unitNumber?: number;
    totalEstimatedHours: number;
    curriculumId?: string;
    templateId?: string;
    templateName?: string;
    templateSchema?: any;
    templateSections?: any[];
    sessions: LessonSession[];
  } | null>(null);

  // View mode for published lesson plans: 'template' | 'standard'
  const [planViewModes, setPlanViewModes] = useState<Record<string, 'template' | 'standard'>>({});
  // Plan currently opened in full template layout modal
  const [viewingTemplatePlan, setViewingTemplatePlan] = useState<LessonPlan | null>(null);

  const getPlanViewMode = (plan: LessonPlan): 'template' | 'standard' => {
    if (planViewModes[plan._id]) return planViewModes[plan._id];
    // Default to 'template' view if template exists or if any session has templateSections
    const hasTemplate = Boolean(
      plan.templateName ||
      plan.templateSchema ||
      (plan.templateSections && plan.templateSections.length > 0) ||
      plan.sessions?.some((s) => s.templateSections && s.templateSections.length > 0)
    );
    return hasTemplate ? 'template' : 'standard';
  };

  // Quick fallback if teacher has no contexts yet
  const handleCreateInitialContext = async () => {
    try {
      await createContext({
        classLevel: 'Class 10',
        section: 'A',
        subject: 'Physics',
        curriculumBoard: 'CBSE',
        academicYear: '2026-2027',
        contextType: 'institution',
      });
    } catch {
      // Handled in hook
    }
  };

  const handleSaveContext = async (e: FormEvent) => {
    e.preventDefault();
    if (!newContextClass.trim() || !newContextSubject.trim()) {
      toast.error('Class and subject are required');
      return;
    }
    try {
      await createContext({
        classLevel: newContextClass.trim(),
        section: newContextSection.trim(),
        subject: newContextSubject.trim(),
        curriculumBoard: newContextBoard.trim(),
        academicYear: '2026-2027',
        contextType: 'institution',
      });
      setIsContextModalOpen(false);
      setNewContextSection('');
    } catch {
      // Handled in hook
    }
  };

  const handleSavePlan = async (e: FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) {
      toast.error('Chapter title is required');
      return;
    }

    try {
      await createPlan({
        chapterTitle: newChapterTitle.trim(),
        unitNumber: Number(newUnitNumber) || 1,
        totalEstimatedHours: Number(newTotalHours) || 3,
        status: 'active',
        sessions: [
          {
            sessionNumber: 1,
            title: newSessionTitle.trim() || `${newChapterTitle.trim()} - Introduction`,
            durationMinutes: 45,
            learningObjectives: newSessionObjectives.trim()
              ? [newSessionObjectives.trim()]
              : ['Fundamental principles and conceptual overview'],
            teachingMethod: 'Lecture & Discussion',
            keyConcepts: [newChapterTitle.trim()],
            resources: [],
            status: 'planned',
          },
        ],
      });
      setIsPlanModalOpen(false);
      setNewChapterTitle('');
      setNewSessionTitle('');
      setNewSessionObjectives('');
    } catch {
      // Handled in hook
    }
  };

  // Upload or manual curriculum submission
  const handleUploadCurriculum = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      toast.error('Please select a syllabus document (PDF, DOCX, or TXT)');
      return;
    }

    try {
      await uploadCurriculumFile(selectedUploadFile);
      setSelectedUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      // Handled in hook
    }
  };

  const handleSaveManualCurriculum = async (e: FormEvent) => {
    e.preventDefault();
    if (!manualCurriculumText.trim()) {
      toast.error('Please enter syllabus content');
      return;
    }

    try {
      await createManualCurriculum(manualCurriculumText.trim(), manualCurriculumTitle.trim() || undefined);
      setManualCurriculumTitle('');
      setManualCurriculumText('');
    } catch {
      // Handled in hook
    }
  };

  const handleProcessActiveCurriculum = async (curriculumId: string) => {
    try {
      await processCurriculum(curriculumId);
    } catch {
      // Handled in hook
    }
  };

  // Toggle teaching days
  const toggleTeachingDay = (day: string) => {
    setAiTeachingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Handle custom template file selection
  const handleCustomFileSelect = (file: File) => {
    setCustomTemplateFile(file);
    setCustomDetectedSchema(null);
    const url = URL.createObjectURL(file);
    setCustomTemplatePreview(url);
  };

  // Analyze uploaded custom template image
  const handleAnalyzeCustomTemplate = async () => {
    if (!customTemplateFile) {
      toast.error('Please select an image file first');
      return;
    }

    setIsAnalyzingTemplate(true);
    try {
      const schema = await analyzeCustomTemplate(customTemplateFile);
      setCustomDetectedSchema(schema);
      if (!customSaveTitle) {
        setCustomSaveTitle(schema.templateName || 'My Custom Template');
      }
    } catch {
      // Handled in hook toast
    } finally {
      setIsAnalyzingTemplate(false);
    }
  };

  // Generate AI Plan with Schedule Constraints & Optional Template
  const handleExecuteAiPlan = async (e: FormEvent) => {
    e.preventDefault();

    const activeCurriculum =
      curriculums.find((c) => c._id === aiSelectedCurriculumId) || selectedCurriculum;

    let targetTitle = aiChapterTitle.trim();
    if (aiSourceMode === 'curriculum' && aiSelectedChapter) {
      targetTitle = aiSelectedChapter;
    } else if (aiSourceMode === 'curriculum' && !targetTitle && activeCurriculum) {
      targetTitle = activeCurriculum.units[0]?.chapters[0]?.title || activeCurriculum.title;
    }

    if (!targetTitle) {
      toast.error('Please specify a chapter title or select a syllabus chapter');
      return;
    }

    if (templateMode === 'custom' && customTemplateFile && !customDetectedSchema) {
      toast.error('Please click "Analyze Template" to inspect your template image before generating.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const schedule: TeachingScheduleConstraints = {
        sessionsPerWeek: aiSessionsPerWeek,
        durationMinutes: aiDuration,
        teachingDays: aiTeachingDays,
        startDate: aiStartDate || undefined,
        targetCompletionDate: aiTargetDate || undefined,
      };

      let chosenTemplateId: string | undefined = undefined;
      let chosenTemplateSchema: any = undefined;

      if (templateMode === 'predefined' && selectedPredefinedId) {
        chosenTemplateId = selectedPredefinedId;
      } else if (templateMode === 'custom' && customDetectedSchema) {
        chosenTemplateSchema = customDetectedSchema;
        if (shouldSaveCustomTemplate && customSaveTitle.trim()) {
          try {
            await saveCustomTemplate(customSaveTitle.trim(), customDetectedSchema);
          } catch {
            // Handled in hook toast
          }
        }
      }

      const draft = await generateAIPlan({
        chapterTitle: targetTitle,
        curriculumId: aiSourceMode === 'curriculum' && activeCurriculum ? activeCurriculum._id : undefined,
        templateId: chosenTemplateId,
        templateSchema: chosenTemplateSchema,
        durationMinutes: aiDuration,
        teachingSchedule: schedule,
        additionalGuidelines: aiGuidelines.trim() || undefined,
      });

      if (draft) {
        setReviewPlan({
          chapterTitle: draft.chapterTitle || targetTitle,
          unitNumber: draft.unitNumber || 1,
          totalEstimatedHours: draft.totalEstimatedHours || 3,
          curriculumId: aiSourceMode === 'curriculum' && activeCurriculum ? activeCurriculum._id : undefined,
          templateId: (draft as any).templateId || chosenTemplateId,
          templateName:
            (draft as any).templateName ||
            (templateMode === 'custom'
              ? customDetectedSchema?.templateName
              : templates.find((t) => t._id === chosenTemplateId)?.name),
          templateSchema: (draft as any).templateSchema || chosenTemplateSchema,
          templateSections: (draft as any).templateSections,
          sessions: draft.sessions || [],
        });
        setIsAiModalOpen(false);
        setIsReviewModalOpen(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI generation failed';
      toast.error(msg);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save reviewed plan (Draft or Publish)
  const handleSaveReviewedPlan = async (asStatus: 'draft' | 'active') => {
    if (!reviewPlan) return;

    try {
      await createPlan({
        chapterTitle: reviewPlan.chapterTitle,
        unitNumber: reviewPlan.unitNumber || 1,
        totalEstimatedHours: reviewPlan.totalEstimatedHours,
        curriculumId: reviewPlan.curriculumId,
        templateId: reviewPlan.templateId,
        templateName: reviewPlan.templateName,
        templateSchema: reviewPlan.templateSchema,
        templateSections: reviewPlan.templateSections,
        status: asStatus,
        sessions: reviewPlan.sessions,
      });

      toast.success(
        asStatus === 'active'
          ? `Plan published for "${reviewPlan.chapterTitle}"!`
          : `Plan saved as draft for "${reviewPlan.chapterTitle}".`
      );
      setIsReviewModalOpen(false);
      setReviewPlan(null);
    } catch {
      // Handled in hook
    }
  };

  // Progress calculations
  const allSessions = plans.flatMap((p) => p.sessions || []);
  const completedSessions = allSessions.filter((s) => s.status === 'completed');
  const progressPercent = allSessions.length
    ? Math.round((completedSessions.length / allSessions.length) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* 1. Header with Title & Top Actions */}
      <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0b2d5a]">Lesson Planner & Curriculum Ingestion</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Ingest official syllabus documents, configure pacing schedules, and generate AI teaching plans.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCurriculumModalOpen(true)}
            leftIcon={<BookOpen className="w-3.5 h-3.5 text-[#0091ff]" />}
            className="text-xs font-bold"
          >
            Syllabus / Curriculum
            {curriculums.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-blue-100 text-[#006bbd] rounded-full text-[10px]">
                {curriculums.length}
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAiModalOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#0091ff]" />}
            className="text-xs font-bold"
          >
            AI Plan Generator
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPlanModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            Create Lesson Plan
          </Button>
        </div>
      </div>

      {/* 2. Teaching Context Selector Bar */}
      <div className="bg-white border border-[#e2ebf4] p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Class:
          </span>

          {isLoadingContexts ? (
            <span className="text-xs text-slate-400 font-medium">Loading classes...</span>
          ) : contexts.length === 0 ? (
            <button
              onClick={handleCreateInitialContext}
              className="text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
            >
              + Create initial class (Class 10 A - Physics)
            </button>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {contexts.map((ctx) => {
                const isSelected = selectedContext?._id === ctx._id;
                const label = `${ctx.classLevel}${ctx.section ? ` ${ctx.section}` : ''} • ${ctx.subject}`;
                return (
                  <button
                    key={ctx._id}
                    onClick={() => selectContext(ctx._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0b2d5a] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedCurriculum && (
            <span
              onClick={() => setIsCurriculumModalOpen(true)}
              className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Syllabus: {selectedCurriculum.units?.length || 0} Units Extracted</span>
            </span>
          )}

          <button
            onClick={() => setIsContextModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0091ff] hover:text-[#0070c7] cursor-pointer bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Class / Batch</span>
          </button>
        </div>
      </div>

      {/* 3. Class Pacing & Progress Banner */}
      {selectedContext && (
        <div className="bg-white border border-[#e2ebf4] p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#0b2d5a]">
              Syllabus Pacing for {selectedContext.classLevel}
              {selectedContext.section ? ` (${selectedContext.section})` : ''} - {selectedContext.subject}
            </span>
            <span className="text-slate-500">
              {completedSessions.length} / {allSessions.length} Sessions Completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* 4. Main Plans List & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isLoadingPlans ? (
            <div className="bg-white border border-[#e2ebf4] p-8 rounded-2xl text-center">
              <Loader size="md" text="Loading lesson plans for this class..." />
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white border border-[#e2ebf4] p-8 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0b2d5a] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#0b2d5a]">No lesson plans yet for this class</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a curriculum syllabus or generate an AI teaching plan draft with teaching constraints.
              </p>
              <div className="flex justify-center gap-2 pt-1 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setIsCurriculumModalOpen(true)}>
                  Upload Syllabus
                </Button>
                <Button size="sm" onClick={() => setIsAiModalOpen(true)}>
                  Generate AI Plan
                </Button>
              </div>
            </div>
          ) : (
            plans.map((p) => {
              const isDraft = p.status === 'draft';
              const hasTemplate = Boolean(
                p.templateName ||
                p.templateSchema ||
                (p.templateSections && p.templateSections.length > 0) ||
                p.sessions?.some((s) => s.templateSections && s.templateSections.length > 0)
              );
              const currentViewMode = getPlanViewMode(p);

              return (
                <div
                  key={p._id}
                  className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-xs hover:shadow-sm transition-all space-y-4"
                >
                  {/* Plan Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-[#0b2d5a] border border-[#e2ebf4] rounded uppercase">
                          Unit {p.unitNumber || 1} • {p.subject}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            p.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'active'
                              ? 'bg-blue-50 text-[#006bbd] border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                        {p.templateName && (
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-100/70 text-[#006bbd] border border-blue-200 rounded flex items-center gap-1">
                            <LayoutTemplate className="w-2.5 h-2.5 text-[#0091ff]" />
                            <span>Template: {p.templateName}</span>
                          </span>
                        )}
                        {isDraft && (
                          <button
                            onClick={() => publishPlan(p._id)}
                            className="text-[10px] font-bold text-[#0091ff] hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                          >
                            Publish Plan →
                          </button>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-[#111827]">{p.chapterTitle}</h4>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-extrabold text-[#0b2d5a]">
                          {p.sessions?.length || 0} Sessions
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          ~{p.totalEstimatedHours || 3} Hours Total
                        </p>
                      </div>

                      {/* View Mode Toggle: Template View vs Compact View */}
                      {hasTemplate && (
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              setPlanViewModes((prev) => ({ ...prev, [p._id]: 'template' }))
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              currentViewMode === 'template'
                                ? 'bg-white text-[#0b2d5a] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <LayoutTemplate className="w-3 h-3 text-[#0091ff]" />
                            <span>Template View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPlanViewModes((prev) => ({ ...prev, [p._id]: 'standard' }))
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              currentViewMode === 'standard'
                                ? 'bg-white text-[#0b2d5a] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Compact</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plan-level template sections if present (Course Overview / Pacing notes) */}
                  {currentViewMode === 'template' && p.templateSections && p.templateSections.length > 0 && (
                    <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b2d5a]">
                        <LayoutTemplate className="w-3.5 h-3.5 text-[#0091ff]" />
                        <span>{p.templateName || 'Template'} Structure & Course Guidelines</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {p.templateSections.map((ts, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded-lg border border-blue-200/60 shadow-3xs"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                              {ts.label || ts.sectionKey}
                            </span>
                            <p className="text-xs text-slate-700 font-medium">
                              {Array.isArray(ts.content)
                                ? ts.content.join(', ')
                                : String(ts.content || '')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sessions list inside this chapter */}
                  {currentViewMode === 'template' ? (
                    /* TEMPLATE VIEW: Full structured cards matching detected template sections */
                    <div className="space-y-3 pt-1">
                      {p.sessions?.map((s) => {
                        const isCompleted = s.status === 'completed';
                        const isInProgress = s.status === 'in_progress';
                        const hasQuiz = s.assessmentRecommendation?.recommended;
                        const sessionTemplateSections =
                          s.templateSections && s.templateSections.length > 0
                            ? s.templateSections
                            : null;

                        return (
                          <div
                            key={s.sessionNumber}
                            className={`p-4 rounded-xl border transition-all space-y-3 ${
                              isCompleted
                                ? 'bg-emerald-50/30 border-emerald-200'
                                : isInProgress
                                ? 'bg-blue-50/30 border-blue-200'
                                : 'bg-slate-50/70 border-slate-200'
                            }`}
                          >
                            {/* Session Top Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800">
                                  Session {s.sessionNumber}: {s.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  ({s.durationMinutes} mins)
                                </span>
                                {hasQuiz && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                                    ⚡ {s.assessmentRecommendation?.type?.toUpperCase() || 'QUIZ'} RECOMMENDED
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center flex-wrap">
                                <button
                                  onClick={() => setManagingSession({ plan: p, session: s })}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 border border-blue-200 text-[#0091ff] hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Layers className="w-3 h-3 text-[#0091ff]" />
                                  <span>Resources ({s.resources?.length || 0})</span>
                                </button>

                                <button
                                  onClick={() => navigate(`/teacher/smartboard/integrated?planId=${p._id}&sessionNum=${s.sessionNumber}`)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#214d7d] text-white hover:bg-[#183b63] transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
                                >
                                  <MonitorUp className="w-3 h-3 text-sky-300" />
                                  <span>Teach in Smart Board</span>
                                </button>

                                <button
                                  onClick={() =>
                                    updateSessionStatus(
                                      p._id,
                                      s.sessionNumber,
                                      isCompleted ? 'planned' : 'completed'
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    isCompleted
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {isCompleted ? '✓ Completed' : 'Mark Complete'}
                                </button>
                              </div>
                            </div>

                            {/* Resource Badges Row */}
                            {s.resources && s.resources.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(() => {
                                  const counts = countResourcesByType(s.resources);
                                  return (
                                    <>
                                      {counts.video && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded flex items-center gap-1">
                                          🎬 {counts.video} Video{counts.video > 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {counts.flashcard_deck && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded flex items-center gap-1">
                                          🗂 Flashcard Deck
                                        </span>
                                      )}
                                      {counts['visual/animation'] && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded flex items-center gap-1">
                                          👁 Visual
                                        </span>
                                      )}
                                      {counts.worksheet && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1">
                                          📝 Worksheet
                                        </span>
                                      )}
                                      {counts.quiz && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded flex items-center gap-1">
                                          ❓ Quiz
                                        </span>
                                      )}
                                      {counts.activity && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded flex items-center gap-1">
                                          🎯 Activity
                                        </span>
                                      )}
                                      {counts.reference && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded flex items-center gap-1">
                                          📖 {counts.reference} Reference{counts.reference > 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Render Sections in Template Layout */}
                            {sessionTemplateSections ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {sessionTemplateSections.map((ts, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-3xs space-y-1.5"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a]">
                                        {ts.label || ts.sectionKey}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-700 font-medium pl-3 whitespace-pre-line leading-relaxed">
                                      {Array.isArray(ts.content) ? (
                                        <ul className="list-disc list-inside space-y-1">
                                          {ts.content.map((item, itemIdx) => (
                                            <li key={itemIdx}>{String(item)}</li>
                                          ))}
                                        </ul>
                                      ) : typeof ts.content === 'object' && ts.content !== null ? (
                                        <div className="space-y-1">
                                          {Object.entries(ts.content).map(([k, v]) => (
                                            <div key={k} className="flex gap-1.5 text-[11px]">
                                              <span className="font-semibold text-slate-600">
                                                {k}:
                                              </span>
                                              <span className="text-slate-700">{String(v)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p>{String(ts.content || '')}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              /* Structured fallback if templateSections is not populated */
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                {s.learningObjectives?.length > 0 && (
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                      Learning Objectives
                                    </span>
                                    <p className="text-xs text-slate-700 pl-3">
                                      {s.learningObjectives.join('; ')}
                                    </p>
                                  </div>
                                )}
                                {s.teachingMethod && (
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                      Teaching Method
                                    </span>
                                    <p className="text-xs text-slate-700 pl-3">
                                      {s.teachingMethod}
                                    </p>
                                  </div>
                                )}
                                {s.activities && s.activities.length > 0 && (
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                      Activities
                                    </span>
                                    <p className="text-xs text-slate-700 pl-3">
                                      {s.activities.join(', ')}
                                    </p>
                                  </div>
                                )}
                                {s.resources && s.resources.length > 0 && (
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                      Resources
                                    </span>
                                    <p className="text-xs text-slate-700 pl-3">
                                      {s.resources.join(', ')}
                                    </p>
                                  </div>
                                )}
                                {s.assignment && (
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1 sm:col-span-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                      Assignment / Homework
                                    </span>
                                    <p className="text-xs text-slate-700 pl-3">{s.assignment}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* COMPACT VIEW: Legacy streamlined row view */
                    <div className="space-y-2 pt-1">
                      {p.sessions?.map((s) => {
                        const isCompleted = s.status === 'completed';
                        const isInProgress = s.status === 'in_progress';
                        const hasQuiz = s.assessmentRecommendation?.recommended;

                        return (
                          <div
                            key={s.sessionNumber}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                              isCompleted
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : isInProgress
                                ? 'bg-blue-50/40 border-blue-200'
                                : 'bg-slate-50/60 border-slate-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800">
                                  Session {s.sessionNumber}: {s.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  ({s.durationMinutes} mins)
                                </span>
                                {hasQuiz && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                                    ⚡ {s.assessmentRecommendation?.type?.toUpperCase() || 'QUIZ'} RECOMMENDED
                                  </span>
                                )}
                              </div>
                              {s.learningObjectives?.length > 0 && (
                                <p className="text-[11px] text-slate-500 font-medium">
                                  <strong className="text-slate-600">Goal: </strong>
                                  {s.learningObjectives[0]}
                                </p>
                              )}
                              {s.teachingMethod && (
                                <p className="text-[10px] text-slate-400 font-medium">
                                  Method: {s.teachingMethod}
                                </p>
                              )}
                            </div>

                            {/* Session Actions */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center flex-wrap">
                              <button
                                onClick={() => setManagingSession({ plan: p, session: s })}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 border border-blue-200 text-[#0091ff] hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Layers className="w-3 h-3 text-[#0091ff]" />
                                <span>Resources ({s.resources?.length || 0})</span>
                              </button>

                              <button
                                onClick={() => navigate(`/teacher/smartboard/integrated?planId=${p._id}&sessionNum=${s.sessionNumber}`)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#214d7d] text-white hover:bg-[#183b63] transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
                              >
                                <MonitorUp className="w-3 h-3 text-sky-300" />
                                <span>Teach</span>
                              </button>

                              <button
                                onClick={() =>
                                  updateSessionStatus(
                                    p._id,
                                    s.sessionNumber,
                                    isCompleted ? 'planned' : 'completed'
                                  )
                                }
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {isCompleted ? '✓ Completed' : 'Mark Complete'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Card footer actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-500 flex-wrap gap-2">
                    <span className="text-[10px] text-slate-400">Class: {p.classLevel}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingTemplatePlan(p)}
                        className="px-2.5 py-1 text-xs font-bold text-[#006bbd] bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <LayoutTemplate className="w-3.5 h-3.5 text-[#0091ff]" />
                        <span>View Full Template Plan</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/teacher/test?subject=${encodeURIComponent(
                              p.subject
                            )}&topic=${encodeURIComponent(p.chapterTitle)}`
                          )
                        }
                        className="px-2.5 py-1 text-[#0091ff] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        + Create Quiz
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. Right Sidebar: Upcoming Schedule */}
        <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#0b2d5a] uppercase tracking-wider">
              Upcoming Schedule
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              {selectedContext ? selectedContext.classLevel : 'Current'}
            </span>
          </div>

          <div className="space-y-3">
            {allSessions.filter((s) => s.status !== 'completed').slice(0, 3).map((s, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5 items-start"
              >
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800">{s.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {s.durationMinutes} mins • {s.teachingMethod || 'Lecture'}
                  </p>
                </div>
              </div>
            ))}

            {completedSessions.slice(-2).map((s, idx) => (
              <div
                key={`comp-${idx}`}
                className="p-3 bg-[#ecfcf3] border border-[#bbf3d2] rounded-xl flex gap-2.5 items-start"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-800">{s.title}</h4>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    Completed • {s.durationMinutes} mins
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: Curriculum & Syllabus Management */}
      <Modal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        title="Curriculum & Syllabus Ingestion"
        maxWidth="lg"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500 font-medium">
            Upload an official syllabus document (PDF, Word DOCX, or text file) or paste syllabus text.
            The Gemini AI parser extracts structured units, chapters, and topics without hallucination.
          </p>

          {/* Tab selector */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setCurriculumTab('upload')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                curriculumTab === 'upload'
                  ? 'border-[#0091ff] text-[#0091ff]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Upload Document (PDF / DOCX)
            </button>
            <button
              type="button"
              onClick={() => setCurriculumTab('manual')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                curriculumTab === 'manual'
                  ? 'border-[#0091ff] text-[#0091ff]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Paste Syllabus Text
            </button>
          </div>

          {curriculumTab === 'upload' ? (
            <form onSubmit={handleUploadCurriculum} className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0091ff] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 space-y-2"
              >
                <Upload className="w-8 h-8 text-[#0091ff] mx-auto" />
                <div className="text-xs font-bold text-slate-700">
                  {selectedUploadFile ? selectedUploadFile.name : 'Click to select syllabus file'}
                </div>
                <p className="text-[11px] text-slate-400">Supported formats: PDF, DOCX, TXT (up to 25MB)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="submit"
                  isLoading={isActionLoading}
                  disabled={!selectedUploadFile}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                >
                  Upload Syllabus
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveManualCurriculum} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Curriculum Title</label>
                <input
                  type="text"
                  value={manualCurriculumTitle}
                  onChange={(e) => setManualCurriculumTitle(e.target.value)}
                  placeholder="e.g. CBSE Class 10 Physics 2026-27"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Syllabus Text *</label>
                <textarea
                  rows={6}
                  required
                  value={manualCurriculumText}
                  onChange={(e) => setManualCurriculumText(e.target.value)}
                  placeholder="Paste units, chapters, and topics from syllabus..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="submit" isLoading={isActionLoading} leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Save Syllabus
                </Button>
              </div>
            </form>
          )}

          {/* Existing Curriculums for this context */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Available Curriculums for Active Class</h4>

            {isLoadingCurriculums ? (
              <Loader size="sm" text="Loading curriculums..." />
            ) : curriculums.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No curriculums ingested yet for this class.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {curriculums.map((c) => (
                  <div
                    key={c._id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0b2d5a]">{c.title}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              c.status === 'processed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'processing'
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : c.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {c.board} • {c.classLevel} • {c.subject} • {c.sourceType}
                        </p>
                      </div>

                      {c.status !== 'processed' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcessActiveCurriculum(c._id)}
                          isLoading={isActionLoading}
                          leftIcon={<Sparkles className="w-3 h-3" />}
                        >
                          Process with AI
                        </Button>
                      )}
                    </div>

                    {/* Show extracted units if processed */}
                    {c.units?.length > 0 && (
                      <div className="space-y-1.5 pt-1 bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Structured Units ({c.units.length}):
                        </span>
                        <div className="space-y-1">
                          {c.units.map((u) => (
                            <div key={u.unitNumber} className="text-xs text-slate-700">
                              <span className="font-bold text-[#0b2d5a]">Unit {u.unitNumber}:</span> {u.title}
                              <div className="pl-3 text-[11px] text-slate-500 flex flex-wrap gap-1 mt-0.5">
                                {u.chapters.map((ch, idx) => (
                                  <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {ch.title} ({ch.topics?.length || 0} topics)
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: AI Lesson Plan Generator with Teaching Constraints */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="AI Teaching Plan Generator"
        maxWidth="xl"
      >
        <form onSubmit={handleExecuteAiPlan} className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Paces your curriculum topics realistically based on weekly frequency, session duration, and calendar dates.
          </p>

          {/* Source Mode */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setAiSourceMode('curriculum')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                aiSourceMode === 'curriculum'
                  ? 'bg-white text-[#0b2d5a] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              From Syllabus Curriculum
            </button>
            <button
              type="button"
              onClick={() => setAiSourceMode('custom')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                aiSourceMode === 'custom'
                  ? 'bg-white text-[#0b2d5a] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Custom Chapter / Topic
            </button>
          </div>

          {aiSourceMode === 'curriculum' ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">
                  Select Processed Curriculum
                </label>
                {curriculums.length === 0 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <span>No syllabus uploaded yet for this class.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiModalOpen(false);
                        setIsCurriculumModalOpen(true);
                      }}
                      className="font-bold underline"
                    >
                      Upload Syllabus
                    </button>
                  </div>
                ) : (
                  <select
                    value={aiSelectedCurriculumId || selectedCurriculum?._id || ''}
                    onChange={(e) => {
                      setAiSelectedCurriculumId(e.target.value);
                      selectCurriculum(e.target.value);
                    }}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff] bg-white"
                  >
                    {curriculums.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.units?.length || 0} Units - {c.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Optional: select specific chapter if available */}
              {selectedCurriculum && selectedCurriculum.units?.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block uppercase">
                    Select Chapter / Module (Optional)
                  </label>
                  <select
                    value={aiSelectedChapter}
                    onChange={(e) => setAiSelectedChapter(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff] bg-white"
                  >
                    <option value="">All Units & Chapters in Curriculum</option>
                    {selectedCurriculum.units.map((u) =>
                      u.chapters.map((ch, idx) => (
                        <option key={`${u.unitNumber}-${idx}`} value={ch.title}>
                          Unit {u.unitNumber}: {ch.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Chapter / Topic Title *</label>
              <input
                type="text"
                required
                value={aiChapterTitle}
                onChange={(e) => setAiChapterTitle(e.target.value)}
                placeholder="e.g. Thermodynamics & Heat Transfer"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
              />
            </div>
          )}

          {/* Lesson Plan Template Section */}
          <div className="border border-slate-200 p-4 rounded-xl space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b2d5a]">
                <LayoutTemplate className="w-3.5 h-3.5 text-[#0091ff]" />
                <span>Lesson Plan Template</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Image-based structure</span>
            </div>

            {/* Template Mode Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTemplateMode('none');
                  setSelectedPredefinedId('');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  templateMode === 'none'
                    ? 'bg-white text-[#0b2d5a] shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setTemplateMode('predefined')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  templateMode === 'predefined'
                    ? 'bg-white text-[#0b2d5a] shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Predefined
                {templates.filter((t) => t.type === 'predefined').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[9px]">
                    {templates.filter((t) => t.type === 'predefined').length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTemplateMode('custom')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  templateMode === 'custom'
                    ? 'bg-white text-[#0b2d5a] shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Custom Upload
              </button>
            </div>

            {/* 1. Standard / No Template */}
            {templateMode === 'none' && (
              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Generating using standard EduPye instructional pacing (Title, Objectives, Teaching Method, Activities, Resources, Assessment).
              </p>
            )}

            {/* 2. Predefined Templates */}
            {templateMode === 'predefined' && (
              <div className="space-y-2">
                {templates.filter((t) => t.type === 'predefined').length === 0 ? (
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-[#0b2d5a]">No Predefined Templates Configured Yet</p>
                    <p className="text-[11px] text-slate-500">
                      Predefined templates are configured from actual template images. You can upload a custom template image below or proceed with standard generation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 block uppercase">
                      Select Predefined Template
                    </label>
                    <select
                      value={selectedPredefinedId}
                      onChange={(e) => setSelectedPredefinedId(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff] bg-white"
                    >
                      <option value="">Select a template...</option>
                      {templates
                        .filter((t) => t.type === 'predefined')
                        .map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} ({t.extractedSchema?.sections?.length || 0} sections)
                          </option>
                        ))}
                    </select>

                    {selectedPredefinedId && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        {(() => {
                          const chosen = templates.find((t) => t._id === selectedPredefinedId);
                          if (!chosen) return null;
                          return (
                            <>
                              <div className="font-bold text-[#0b2d5a]">{chosen.name}</div>
                              {chosen.description && (
                                <p className="text-[11px] text-slate-500">{chosen.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {chosen.extractedSchema?.sections?.map((sec, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-medium"
                                  >
                                    {sec.order}. {sec.label} ({sec.type})
                                  </span>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Custom Template Upload & Analyze */}
            {templateMode === 'custom' && (
              <div className="space-y-3">
                <input
                  ref={templateFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCustomFileSelect(f);
                  }}
                  className="hidden"
                />

                {!customTemplateFile ? (
                  <div
                    onClick={() => templateFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-[#0091ff] p-5 rounded-xl text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30 space-y-1"
                  >
                    <FileImage className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Click to upload template image</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, JPEG or WEBP (Max 10MB). Ephemeral processing (deleted after analysis).</p>
                  </div>
                ) : (
                  <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {customTemplatePreview && (
                          <img
                            src={customTemplatePreview}
                            alt="Template Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs"
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800">{customTemplateFile.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {(customTemplateFile.size / 1024).toFixed(1)} KB • Ephemeral processing
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => templateFileInputRef.current?.click()}
                          className="text-[11px] h-7"
                        >
                          Change
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomTemplateFile(null);
                            setCustomTemplatePreview(null);
                            setCustomDetectedSchema(null);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {!customDetectedSchema ? (
                      <div className="pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAnalyzeCustomTemplate}
                          isLoading={isAnalyzingTemplate}
                          leftIcon={<Sparkles className="w-3 h-3" />}
                          className="w-full text-xs font-bold"
                        >
                          {isAnalyzingTemplate ? 'Analyzing Layout with Gemini Vision...' : 'Analyze Template Structure'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{customDetectedSchema.sections.length} Structural Sections Detected</span>
                          </span>
                        </div>

                        {/* Detected sections preview */}
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {customDetectedSchema.sections.map((sec) => (
                            <div
                              key={sec.order}
                              className="text-[11px] flex items-center justify-between p-1.5 bg-white rounded border border-slate-200"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-[#006bbd] text-[9px] font-bold flex items-center justify-center">
                                  {sec.order}
                                </span>
                                <span className="font-semibold text-slate-700">{sec.label}</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                                {sec.type}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Optional save to my templates */}
                        <div className="pt-1 space-y-1.5">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                            <input
                              type="checkbox"
                              checked={shouldSaveCustomTemplate}
                              onChange={(e) => setShouldSaveCustomTemplate(e.target.checked)}
                              className="rounded border-slate-300 text-[#0091ff] focus:ring-[#0091ff]"
                            />
                            <span>Save to My Templates for future plans</span>
                          </label>

                          {shouldSaveCustomTemplate && (
                            <input
                              type="text"
                              value={customSaveTitle}
                              onChange={(e) => setCustomSaveTitle(e.target.value)}
                              placeholder="Template Name (e.g. Science Activity Template)"
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-[#0091ff] bg-white"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Teaching Schedule Constraints Section */}
          <div className="border border-slate-200 p-4 rounded-xl space-y-3 bg-slate-50/50">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b2d5a]">
              <Sliders className="w-3.5 h-3.5 text-[#0091ff]" />
              <span>Teaching Schedule Constraints</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Classes / Week</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={aiSessionsPerWeek}
                  onChange={(e) => setAiSessionsPerWeek(parseInt(e.target.value) || 4)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff] bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Minutes / Session</label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={aiDuration}
                  onChange={(e) => setAiDuration(parseInt(e.target.value) || 45)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff] bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Teaching Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = aiTeachingDays.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleTeachingDay(d.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#0b2d5a] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Start Date</label>
                <input
                  type="date"
                  value={aiStartDate}
                  onChange={(e) => setAiStartDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff] bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Target Completion</label>
                <input
                  type="date"
                  value={aiTargetDate}
                  onChange={(e) => setAiTargetDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff] bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block uppercase">Additional Guidelines</label>
            <textarea
              rows={2}
              value={aiGuidelines}
              onChange={(e) => setAiGuidelines(e.target.value)}
              placeholder="e.g. Include interactive lab demonstrations and past exam question review..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAiModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isGeneratingAi}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Generate AI Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Review and Edit AI Generated Teaching Plan */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review & Finalize AI Teaching Plan"
        maxWidth="2xl"
      >
        {reviewPlan && (
          <div className="space-y-4">
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[#0b2d5a]">{reviewPlan.chapterTitle}</h4>
                  {reviewPlan.templateName && (
                    <span className="text-[10px] font-bold text-[#006bbd] bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <LayoutTemplate className="w-3 h-3 text-[#0091ff]" />
                      <span>Template: {reviewPlan.templateName}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {reviewPlan.sessions.length} Sessions Planned • ~{reviewPlan.totalEstimatedHours} Hours Total
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                <span>Unsaved Draft</span>
              </div>
            </div>

            {/* Plan-level template sections if present */}
            {reviewPlan.templateSections && reviewPlan.templateSections.length > 0 && (
              <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-[#0b2d5a] uppercase tracking-wide flex items-center gap-1">
                  <LayoutTemplate className="w-3 h-3 text-[#0091ff]" />
                  <span>Plan Template Sections ({reviewPlan.templateSections.length})</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {reviewPlan.templateSections.map((ts, tIdx) => (
                    <div key={tIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase text-slate-500">
                        {ts.label || ts.sectionKey}
                      </span>
                      <p className="text-slate-600 mt-0.5">
                        {Array.isArray(ts.content)
                          ? ts.content.join(', ')
                          : typeof ts.content === 'object'
                          ? JSON.stringify(ts.content)
                          : String(ts.content)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {reviewPlan.sessions.map((session, idx) => (
                <div
                  key={session.sessionNumber || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Session {session.sessionNumber}: {session.title}
                      </span>
                      <span className="text-[10px] text-slate-400">({session.durationMinutes} mins)</span>
                    </div>

                    {session.assessmentRecommendation?.recommended && (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                        ⚡ {session.assessmentRecommendation.type?.toUpperCase()} RECOMMENDED
                      </span>
                    )}
                  </div>

                  {session.learningObjectives?.length > 0 && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Objectives: </strong>
                      {session.learningObjectives.join(' • ')}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1">
                    <div>
                      <strong className="text-slate-600">Method: </strong>
                      {session.teachingMethod || 'Lecture'}
                    </div>
                    {session.activities && session.activities.length > 0 && (
                      <div>
                        <strong className="text-slate-600">Activities: </strong>
                        {session.activities.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Template sections on session if present */}
                  {session.templateSections && session.templateSections.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5 mt-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <LayoutTemplate className="w-3 h-3 text-[#0091ff]" />
                        <span>Template Sections:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {session.templateSections.map((ts, tIdx) => (
                          <div key={tIdx} className="bg-white p-2 rounded border border-slate-200">
                            <span className="font-bold text-slate-700 block text-[10px] uppercase text-slate-500">
                              {ts.label || ts.sectionKey}
                            </span>
                            <p className="text-slate-600 mt-0.5 text-[10px]">
                              {Array.isArray(ts.content)
                                ? ts.content.join(', ')
                                : typeof ts.content === 'object'
                                ? JSON.stringify(ts.content)
                                : String(ts.content)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.assignment && (
                    <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>Homework / Assignment: </strong> {session.assignment}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setIsAiModalOpen(true);
                }}
              >
                Regenerate
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSaveReviewedPlan('draft')}
                  isLoading={isActionLoading}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSaveReviewedPlan('active')}
                  isLoading={isActionLoading}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Publish Plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: New Teaching Context (Class / Section / Batch) */}
      <Modal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        title="Add New Teaching Class / Batch"
        maxWidth="md"
      >
        <form onSubmit={handleSaveContext} className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Create an independent teaching context for a specific grade, section, and subject.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Class / Grade *</label>
              <input
                type="text"
                required
                value={newContextClass}
                onChange={(e) => setNewContextClass(e.target.value)}
                placeholder="e.g. Class 10"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Section / Batch</label>
              <input
                type="text"
                value={newContextSection}
                onChange={(e) => setNewContextSection(e.target.value)}
                placeholder="e.g. Section A, Batch 1"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Subject *</label>
              <input
                type="text"
                required
                value={newContextSubject}
                onChange={(e) => setNewContextSubject(e.target.value)}
                placeholder="e.g. Physics"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Curriculum Board</label>
              <input
                type="text"
                value={newContextBoard}
                onChange={(e) => setNewContextBoard(e.target.value)}
                placeholder="e.g. CBSE"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsContextModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isActionLoading}>
              Create Context
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: New Chapter Lesson Plan Manual */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={`New Chapter Plan for ${selectedContext?.classLevel || ''} ${
          selectedContext?.section ? `(${selectedContext.section})` : ''
        }`}
        maxWidth="md"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block uppercase">Chapter Title *</label>
            <input
              type="text"
              required
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="e.g. Wave Optics & Interference"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Unit Number</label>
              <input
                type="number"
                min="1"
                value={newUnitNumber}
                onChange={(e) => setNewUnitNumber(parseInt(e.target.value) || 1)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Estimated Hours</label>
              <input
                type="number"
                min="1"
                value={newTotalHours}
                onChange={(e) => setNewTotalHours(parseInt(e.target.value) || 3)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block uppercase">First Session Title</label>
            <input
              type="text"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="e.g. Wavefronts and Huygens' Principle"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block uppercase">Learning Objectives</label>
            <textarea
              rows={2}
              value={newSessionObjectives}
              onChange={(e) => setNewSessionObjectives(e.target.value)}
              placeholder="e.g. Derive Snell's law using wave optics wavefronts..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isActionLoading}>
              Save Lesson Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Full Template Plan View / Export */}
      <Modal
        isOpen={Boolean(viewingTemplatePlan)}
        onClose={() => setViewingTemplatePlan(null)}
        title={viewingTemplatePlan?.chapterTitle || 'Lesson Plan Template View'}
        maxWidth="3xl"
      >
        {viewingTemplatePlan && (
          <div className="space-y-5 print:space-y-4">
            {/* Header Document Banner */}
            <div className="bg-gradient-to-r from-[#0b2d5a] to-[#004b99] text-white p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                    Official Teaching Plan • Unit {viewingTemplatePlan.unitNumber || 1}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {viewingTemplatePlan.chapterTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold print:hidden"
                  >
                    Print / Save PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-blue-200 text-[10px] uppercase font-bold block">
                    Class / Grade
                  </span>
                  <span className="font-semibold text-white">
                    {viewingTemplatePlan.classLevel}
                  </span>
                </div>
                <div>
                  <span className="text-blue-200 text-[10px] uppercase font-bold block">
                    Subject
                  </span>
                  <span className="font-semibold text-white">{viewingTemplatePlan.subject}</span>
                </div>
                <div>
                  <span className="text-blue-200 text-[10px] uppercase font-bold block">
                    Total Duration
                  </span>
                  <span className="font-semibold text-white">
                    {viewingTemplatePlan.sessions?.length || 0} Sessions (~
                    {viewingTemplatePlan.totalEstimatedHours || 3} Hours)
                  </span>
                </div>
                <div>
                  <span className="text-blue-200 text-[10px] uppercase font-bold block">
                    Applied Template
                  </span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <LayoutTemplate className="w-3 h-3 text-blue-300" />
                    {viewingTemplatePlan.templateName || 'Custom Image Template'}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan-level template sections (Course overview / Syllabus requirements) */}
            {viewingTemplatePlan.templateSections && viewingTemplatePlan.templateSections.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-[#0b2d5a] uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-[#0091ff]" />
                  <span>Unit Overview & Course Template Guidelines</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {viewingTemplatePlan.templateSections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-slate-200 space-y-1"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        {sec.label || sec.sectionKey}
                      </span>
                      <p className="text-xs text-slate-700 font-medium whitespace-pre-line">
                        {Array.isArray(sec.content)
                          ? sec.content.join(', ')
                          : String(sec.content || '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session by Session Breakdown in Full Template Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0b2d5a] uppercase tracking-wider">
                  Pacing & Session Instructional Breakdown
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {viewingTemplatePlan.sessions?.length || 0} Scheduled Sessions
                </span>
              </div>

              <div className="space-y-4">
                {viewingTemplatePlan.sessions?.map((s) => {
                  const sessionTemplateSections =
                    s.templateSections && s.templateSections.length > 0
                      ? s.templateSections
                      : null;
                  const isCompleted = s.status === 'completed';

                  return (
                    <div
                      key={s.sessionNumber}
                      className="bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs"
                    >
                      {/* Session Header Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 bg-slate-50/70 -mx-4 -mt-4 p-4 rounded-t-2xl sm:-mx-5 sm:-mt-5 sm:p-5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#0b2d5a] text-white rounded-md">
                              Session {s.sessionNumber}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              Duration: {s.durationMinutes} Minutes
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {s.status.toUpperCase()}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-[#111827] pt-1">{s.title}</h5>
                        </div>

                        {s.assessmentRecommendation?.recommended && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg shrink-0">
                            ⚡ Recommended Assessment:{' '}
                            {s.assessmentRecommendation.topic || 'Review'}
                          </span>
                        )}
                      </div>

                      {/* Template Sections Display */}
                      {sessionTemplateSections ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {sessionTemplateSections.map((sec, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 space-y-1.5"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b2d5a]">
                                  {sec.label || sec.sectionKey}
                                </span>
                              </div>
                              <div className="text-xs text-slate-700 pl-3 font-medium whitespace-pre-line leading-relaxed">
                                {Array.isArray(sec.content) ? (
                                  <ul className="list-disc list-inside space-y-1">
                                    {sec.content.map((item, itemIdx) => (
                                      <li key={itemIdx}>{String(item)}</li>
                                    ))}
                                  </ul>
                                ) : typeof sec.content === 'object' && sec.content !== null ? (
                                  <div className="space-y-1">
                                    {Object.entries(sec.content).map(([k, v]) => (
                                      <div key={k} className="flex gap-1.5 text-xs">
                                        <span className="font-semibold text-slate-600">
                                          {k}:
                                        </span>
                                        <span>{String(v)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p>{String(sec.content || '')}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Structured standard sections */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                          {s.learningObjectives?.length > 0 && (
                            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 space-y-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                Learning Objectives
                              </span>
                              <ul className="list-disc list-inside text-slate-700 pl-2 space-y-0.5">
                                {s.learningObjectives.map((obj, oIdx) => (
                                  <li key={oIdx}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {s.teachingMethod && (
                            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 space-y-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                Teaching Method
                              </span>
                              <p className="text-slate-700 pl-2">{s.teachingMethod}</p>
                            </div>
                          )}
                          {s.activities && s.activities.length > 0 && (
                            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 space-y-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                Interactive Activities
                              </span>
                              <ul className="list-disc list-inside text-slate-700 pl-2 space-y-0.5">
                                {s.activities.map((act, aIdx) => (
                                  <li key={aIdx}>{act}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {s.resources && s.resources.length > 0 && (
                            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 space-y-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                Teaching Aids & Resources
                              </span>
                              <p className="text-slate-700 pl-2">{s.resources.join(', ')}</p>
                            </div>
                          )}
                          {s.assignment && (
                            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 space-y-1 md:col-span-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]" />
                                Assignment / Homework
                              </span>
                              <p className="text-slate-700 pl-2">{s.assignment}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 print:hidden">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingTemplatePlan(null)}
              >
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Session Resource Manager Modal */}
      {managingSession && (
        <SessionResourceManagerModal
          isOpen={Boolean(managingSession)}
          onClose={() => setManagingSession(null)}
          plan={managingSession.plan}
          session={managingSession.session}
          onAddResource={addSessionResource}
          onUpdateResource={updateSessionResource}
          onDeleteResource={deleteSessionResource}
          onToggleApproval={toggleSessionResourceApproval}
          onGenerateFlashcards={generateSessionFlashcards}
          onTeachInSmartBoard={(pId, sNum) => {
            setManagingSession(null);
            navigate(`/teacher/smartboard/integrated?planId=${pId}&sessionNum=${sNum}`);
          }}
        />
      )}
    </div>
  );
}
