import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MonitorUp,
  Presentation,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import { teachingContextService } from '../../../services/teachingContextService';
import { lessonPlanService } from '../../../services/lessonPlanService';
import { TeachingContext, LessonPlan, LessonSession } from '../../../types/lessonPlan';
import cardSmartboard from '../../../assets/card-smartboard.png';

export default function SmartBoardHome() {
  const navigate = useNavigate();

  const [contexts, setContexts] = useState<TeachingContext[]>([]);
  const [selectedContextId, setSelectedContextId] = useState<string>('');
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedSessionNum, setSelectedSessionNum] = useState<number>(1);

  const [isLoadingContexts, setIsLoadingContexts] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Load contexts on mount
  useEffect(() => {
    async function load() {
      setIsLoadingContexts(true);
      try {
        const data = await teachingContextService.getContexts();
        setContexts(data);
        if (data.length > 0) {
          setSelectedContextId(data[0]._id);
        }
      } catch (err) {
        console.warn('Failed to load teaching contexts:', err);
      } finally {
        setIsLoadingContexts(false);
      }
    }
    load();
  }, []);

  // Load plans when context changes
  useEffect(() => {
    if (!selectedContextId) {
      setPlans([]);
      setSelectedPlanId('');
      return;
    }

    async function loadPlans() {
      setIsLoadingPlans(true);
      try {
        const data = await lessonPlanService.getPlansByContext(selectedContextId);
        setPlans(data);
        if (data.length > 0) {
          setSelectedPlanId(data[0]._id);
          setSelectedSessionNum(1);
        } else {
          setSelectedPlanId('');
        }
      } catch (err) {
        console.warn('Failed to load plans:', err);
        setPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    loadPlans();
  }, [selectedContextId]);

  const selectedPlan = plans.find((p) => p._id === selectedPlanId);
  const availableSessions = selectedPlan?.sessions || [];

  const handleStartIntegrated = () => {
    if (!selectedPlanId) return;
    navigate(`/teacher/smartboard/integrated?planId=${selectedPlanId}&sessionNum=${selectedSessionNum}`);
  };

  return (
    <div className="min-h-full bg-[#f8fcff] p-4 sm:p-8 space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5e4f2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#214d7d] text-white rounded-xl shadow-xs">
              <MonitorUp className="w-6 h-6 text-sky-300" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1c3352]">Interactive Smart Board</h1>
              <p className="text-xs text-slate-500 font-medium">
                Choose between an independent classroom canvas or teaching directly from an active lesson plan.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/teacher/lesson-plan')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0091ff] hover:text-blue-800 underline self-start sm:self-center"
        >
          <span>Open Lesson Planner Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Two Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPTION 1: STANDARD SMART BOARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0091ff] text-xs font-extrabold border border-blue-200">
                Option 1
              </span>
              <span className="text-xs font-semibold text-slate-400">Independent Canvas</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#1c3352] group-hover:text-[#0091ff] transition-colors">
                Standard Smart Board
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Launch a clean digital chalkboard canvas. Ideal for open classroom discussions, solving equations,
                freehand diagramming, student whiteboard interactions, and concept sketching.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Freehand pen & highlighter</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Shapes, arrows & text</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Image insertion & export</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Full screen presentation</span>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/teacher/smartboard/standard')}
            className="w-full bg-[#214d7d] hover:bg-[#183b63] text-white font-extrabold shadow-sm py-3 cursor-pointer"
          >
            Launch Standard Smart Board →
          </Button>
        </div>

        {/* OPTION 2: LESSON PLAN INTEGRATED SMART BOARD */}
        <div className="bg-white rounded-2xl border-2 border-[#0091ff]/30 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-2xs">
                Option 2 (Recommended)
              </span>
              <span className="text-xs font-bold text-[#0091ff]">Curriculum-Synced</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#1c3352]">
                Lesson Plan Integrated Smart Board
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Teach live with your active lesson session loaded alongside the whiteboard. Exposes learning objectives,
                teaching steps, interactive flashcard carousel, video recommendations, and student activities.
              </p>
            </div>

            {/* Selection Flow: Context -> Lesson Plan -> Session */}
            {isLoadingContexts ? (
              <div className="p-4 text-center">
                <Loader size="sm" text="Loading classes..." />
              </div>
            ) : contexts.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-bold">No Teaching Contexts Found</p>
                <p>Please configure a class in the Lesson Planner first.</p>
              </div>
            ) : (
              <div className="space-y-3 bg-[#f8fcff] p-4 rounded-xl border border-[#d5e4f2]">
                {/* 1. Select Class */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    1. Select Class & Subject
                  </label>
                  <select
                    aria-label="Select Class and Subject"
                    value={selectedContextId}
                    onChange={(e) => setSelectedContextId(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0091ff]/30"
                  >
                    {contexts.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.classLevel} {c.section ? `(${c.section}) ` : ''}- {c.subject} ({c.curriculumBoard})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Lesson Plan */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    2. Select Lesson Plan
                  </label>
                  {isLoadingPlans ? (
                    <div className="p-2 text-center text-xs text-slate-500">Loading plans...</div>
                  ) : plans.length === 0 ? (
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-500 italic">
                      No lesson plans created for this class yet.
                    </div>
                  ) : (
                    <select
                      aria-label="Select Lesson Plan"
                      value={selectedPlanId}
                      onChange={(e) => {
                        setSelectedPlanId(e.target.value);
                        setSelectedSessionNum(1);
                      }}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0091ff]/30"
                    >
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>
                          Unit {p.unitNumber || 1}: {p.chapterTitle} ({p.sessions?.length || 0} sessions)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 3. Select Session */}
                {selectedPlan && availableSessions.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      3. Select Session to Teach
                    </label>
                    <select
                      aria-label="Select Session"
                      value={selectedSessionNum}
                      onChange={(e) => setSelectedSessionNum(parseInt(e.target.value, 10))}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0091ff]/30"
                    >
                      {availableSessions.map((s) => (
                        <option key={s.sessionNumber} value={s.sessionNumber}>
                          Session {s.sessionNumber}: {s.title} ({s.durationMinutes}m) - {s.status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            size="lg"
            disabled={!selectedPlanId || availableSessions.length === 0}
            onClick={handleStartIntegrated}
            className="w-full bg-gradient-to-r from-[#0091ff] to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-black shadow-md py-3 cursor-pointer disabled:opacity-50"
          >
            Start Lesson in Smart Board →
          </Button>
        </div>
      </div>
    </div>
  );
}
