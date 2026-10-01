import { useState, useEffect, useCallback } from 'react';
import { TeachingContext, LessonPlan, LessonSessionStatus, LessonResource } from '../types/lessonPlan';
import { Curriculum, TeachingScheduleConstraints } from '../types/curriculum';
import { LessonPlanTemplate, LessonPlanTemplateSchema } from '../types/lessonPlanTemplate';
import { teachingContextService } from '../services/teachingContextService';
import { lessonPlanService } from '../services/lessonPlanService';
import { curriculumService } from '../services/curriculumService';
import { lessonPlanTemplateService } from '../services/lessonPlanTemplateService';
import { useToast } from './useToast';

export interface GenerateAIPlanArgs {
  chapterTitle?: string;
  curriculumId?: string;
  templateId?: string;
  templateSchema?: any;
  availableSessions?: number;
  durationMinutes?: number;
  additionalGuidelines?: string;
  teachingSchedule?: TeachingScheduleConstraints;
}

export function useLessonPlanner() {
  const toast = useToast();
  const [contexts, setContexts] = useState<TeachingContext[]>([]);
  const [selectedContext, setSelectedContext] = useState<TeachingContext | null>(null);
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [templates, setTemplates] = useState<LessonPlanTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LessonPlanTemplate | null>(null);
  const [isLoadingContexts, setIsLoadingContexts] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingCurriculums, setIsLoadingCurriculums] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load contexts on mount
  const fetchContexts = useCallback(async () => {
    setIsLoadingContexts(true);
    try {
      const data = await teachingContextService.getContexts();
      setContexts(data);
      if (data.length > 0 && !selectedContext) {
        setSelectedContext(data[0]);
      }
    } catch (err) {
      console.warn('Could not load teaching contexts:', err);
    } finally {
      setIsLoadingContexts(false);
    }
  }, [selectedContext]);

  useEffect(() => {
    fetchContexts();
  }, [fetchContexts]);

  // Load plans whenever selectedContext changes
  const fetchPlans = useCallback(async (contextId: string) => {
    setIsLoadingPlans(true);
    try {
      const data = await lessonPlanService.getPlansByContext(contextId);
      setPlans(data);
    } catch (err) {
      console.warn('Could not load plans:', err);
      setPlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  // Load curriculums whenever selectedContext changes
  const fetchCurriculums = useCallback(async (contextId: string) => {
    setIsLoadingCurriculums(true);
    try {
      const data = await curriculumService.getCurriculums(contextId);
      setCurriculums(data);
      if (data.length > 0) {
        setSelectedCurriculum(data[0]);
      } else {
        setSelectedCurriculum(null);
      }
    } catch (err) {
      console.warn('Could not load curriculums:', err);
      setCurriculums([]);
      setSelectedCurriculum(null);
    } finally {
      setIsLoadingCurriculums(false);
    }
  }, []);

  // Load templates on mount
  const fetchTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await lessonPlanTemplateService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.warn('Could not load lesson plan templates:', err);
      setTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (selectedContext?._id) {
      fetchPlans(selectedContext._id);
      fetchCurriculums(selectedContext._id);
    } else {
      setPlans([]);
      setCurriculums([]);
      setSelectedCurriculum(null);
    }
  }, [selectedContext, fetchPlans, fetchCurriculums]);

  const selectContext = (contextId: string) => {
    const found = contexts.find((c) => c._id === contextId);
    if (found) {
      setSelectedContext(found);
    }
  };

  const selectCurriculum = (curriculumId: string) => {
    const found = curriculums.find((c) => c._id === curriculumId);
    if (found) {
      setSelectedCurriculum(found);
    }
  };

  const selectTemplate = (templateId: string | null) => {
    if (!templateId) {
      setSelectedTemplate(null);
      return;
    }
    const found = templates.find((t) => t._id === templateId);
    setSelectedTemplate(found || null);
  };

  const analyzeCustomTemplate = async (file: File) => {
    setIsActionLoading(true);
    try {
      const result = await lessonPlanTemplateService.analyzeTemplateImage(file);
      toast.success(`Template analyzed: "${result.templateName}" (${result.sections.length} sections detected)`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze template image';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const saveCustomTemplate = async (
    name: string,
    schema: LessonPlanTemplateSchema,
    description?: string
  ) => {
    setIsActionLoading(true);
    try {
      const created = await lessonPlanTemplateService.createCustomTemplate({
        name,
        schema,
        description,
      });
      setTemplates((prev) => [created, ...prev]);
      setSelectedTemplate(created);
      toast.success(`Custom template "${created.name}" saved!`);
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save custom template';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const createContext = async (data: Omit<TeachingContext, '_id' | 'teacherId' | 'isArchived'>) => {
    setIsActionLoading(true);
    try {
      const newCtx = await teachingContextService.createContext(data);
      setContexts((prev) => [newCtx, ...prev]);
      setSelectedContext(newCtx);
      toast.success(`Created context: ${newCtx.classLevel} ${newCtx.section ? `(${newCtx.section}) ` : ''}- ${newCtx.subject}`);
      return newCtx;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create teaching context';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const createPlan = async (planData: Partial<LessonPlan> & { chapterTitle: string }) => {
    if (!selectedContext?._id) {
      toast.error('Please select or create a class first');
      return;
    }
    setIsActionLoading(true);
    try {
      const newPlan = await lessonPlanService.createPlan({
        ...planData,
        contextId: selectedContext._id,
      });
      setPlans((prev) => [newPlan, ...prev]);
      toast.success(`Lesson plan created for "${newPlan.chapterTitle}"`);
      return newPlan;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create lesson plan';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const updatePlan = async (planId: string, data: Partial<LessonPlan>) => {
    setIsActionLoading(true);
    try {
      const updated = await lessonPlanService.updatePlan(planId, data);
      setPlans((prev) => prev.map((p) => (p._id === planId ? updated : p)));
      toast.success(`Updated plan "${updated.chapterTitle}"`);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update plan';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const publishPlan = async (planId: string) => {
    return updatePlan(planId, { status: 'active' });
  };

  const updateSessionStatus = async (
    planId: string,
    sessionNum: number,
    status: LessonSessionStatus,
    notes?: string
  ) => {
    try {
      const updated = await lessonPlanService.updateSessionStatus(planId, sessionNum, status, notes);
      setPlans((prev) => prev.map((p) => (p._id === planId ? updated : p)));
      toast.success(`Session ${sessionNum} marked as ${status}`);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update session';
      toast.error(msg);
      throw err;
    }
  };

  const uploadCurriculumFile = async (file: File, title?: string) => {
    if (!selectedContext?._id) {
      toast.error('Please select a class first');
      return;
    }
    setIsActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('contextId', selectedContext._id);
      formData.append('file', file);
      if (title) formData.append('title', title);

      const created = await curriculumService.createCurriculumWithFile(formData);
      setCurriculums((prev) => [created, ...prev]);
      setSelectedCurriculum(created);
      toast.success(`Uploaded syllabus: ${created.originalFileName || created.title}`);
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload curriculum';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const createManualCurriculum = async (manualText: string, title?: string) => {
    if (!selectedContext?._id) {
      toast.error('Please select a class first');
      return;
    }
    setIsActionLoading(true);
    try {
      const created = await curriculumService.createCurriculumManual({
        contextId: selectedContext._id,
        manualText,
        title,
      });
      setCurriculums((prev) => [created, ...prev]);
      setSelectedCurriculum(created);
      toast.success(`Created curriculum: ${created.title}`);
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save curriculum';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const processCurriculum = async (curriculumId: string) => {
    setIsActionLoading(true);
    try {
      toast.info('Structuring curriculum with AI...');
      const processed = await curriculumService.processCurriculum(curriculumId);
      setCurriculums((prev) => prev.map((c) => (c._id === curriculumId ? processed : c)));
      if (selectedCurriculum?._id === curriculumId) {
        setSelectedCurriculum(processed);
      }
      toast.success(`Structured ${processed.units?.length || 0} units from syllabus!`);
      return processed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Curriculum extraction failed';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const generateAIPlan = async (
    argsOrTitle: string | GenerateAIPlanArgs,
    sessionsCount = 4,
    durationMinutes = 45
  ) => {
    if (!selectedContext?._id) {
      throw new Error('Please select a teaching context first');
    }
    setIsActionLoading(true);
    try {
      let params: {
        contextId: string;
        chapterTitle?: string;
        curriculumId?: string;
        templateId?: string;
        templateSchema?: any;
        availableSessions?: number;
        durationMinutes?: number;
        additionalGuidelines?: string;
        teachingSchedule?: TeachingScheduleConstraints;
      };

      if (typeof argsOrTitle === 'string') {
        params = {
          contextId: selectedContext._id,
          chapterTitle: argsOrTitle,
          availableSessions: sessionsCount,
          durationMinutes,
        };
      } else {
        params = {
          contextId: selectedContext._id,
          chapterTitle: argsOrTitle.chapterTitle,
          curriculumId: argsOrTitle.curriculumId,
          templateId: argsOrTitle.templateId,
          templateSchema: argsOrTitle.templateSchema,
          availableSessions: argsOrTitle.availableSessions,
          durationMinutes: argsOrTitle.durationMinutes,
          additionalGuidelines: argsOrTitle.additionalGuidelines,
          teachingSchedule: argsOrTitle.teachingSchedule,
        };
      }

      const draft = await lessonPlanService.generateAIPlan(params);
      return draft;
    } finally {
      setIsActionLoading(false);
    }
  };

  const addSessionResource = async (
    planId: string,
    sessionNum: number,
    resource: Partial<LessonResource>
  ) => {
    try {
      const res = await lessonPlanService.addSessionResource(planId, sessionNum, resource);
      setPlans((prev) => prev.map((p) => (p._id === planId ? res.plan : p)));
      toast.success(`Added ${resource.type || 'resource'} to session ${sessionNum}`);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add resource';
      toast.error(msg);
      throw err;
    }
  };

  const updateSessionResource = async (
    planId: string,
    sessionNum: number,
    resourceId: string,
    resourceData: Partial<LessonResource>
  ) => {
    try {
      const res = await lessonPlanService.updateSessionResource(planId, sessionNum, resourceId, resourceData);
      setPlans((prev) => prev.map((p) => (p._id === planId ? res.plan : p)));
      toast.success('Resource updated');
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update resource';
      toast.error(msg);
      throw err;
    }
  };

  const deleteSessionResource = async (
    planId: string,
    sessionNum: number,
    resourceId: string
  ) => {
    try {
      const updatedPlan = await lessonPlanService.deleteSessionResource(planId, sessionNum, resourceId);
      setPlans((prev) => prev.map((p) => (p._id === planId ? updatedPlan : p)));
      toast.success('Resource removed');
      return updatedPlan;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove resource';
      toast.error(msg);
      throw err;
    }
  };

  const toggleSessionResourceApproval = async (
    planId: string,
    sessionNum: number,
    resourceId: string,
    isApproved?: boolean
  ) => {
    try {
      const res = await lessonPlanService.toggleSessionResourceApproval(planId, sessionNum, resourceId, isApproved);
      setPlans((prev) => prev.map((p) => (p._id === planId ? res.plan : p)));
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update resource approval';
      toast.error(msg);
      throw err;
    }
  };

  const generateSessionFlashcards = async (
    planId: string,
    sessionNum: number,
    count = 5
  ) => {
    setIsActionLoading(true);
    try {
      toast.info('Generating AI study flashcards for session...');
      const res = await lessonPlanService.generateSessionFlashcards(planId, sessionNum, count);
      setPlans((prev) => prev.map((p) => (p._id === planId ? res.plan : p)));
      toast.success(`Generated ${res.resource.cards.length} flashcards for session ${sessionNum}!`);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate flashcards';
      toast.error(msg);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
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
    refetchPlans: () => selectedContext?._id && fetchPlans(selectedContext._id),
    refetchCurriculums: () => selectedContext?._id && fetchCurriculums(selectedContext._id),
  };
}
