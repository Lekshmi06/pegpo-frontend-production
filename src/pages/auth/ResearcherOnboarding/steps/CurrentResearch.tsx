import React, { useState } from 'react';
import {
  FolderKanban,
  FileQuestion,
  Compass,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import {
  CurrentResearchProjectData,
  PROJECT_STAGES,
  ProjectStage,
} from '../../../../types/researcher';

interface CurrentResearchProps {
  initialData: CurrentResearchProjectData;
  onSave: (data: CurrentResearchProjectData) => void;
}

export const CurrentResearch: React.FC<CurrentResearchProps> = ({
  initialData,
  onSave,
}) => {
  const [hasProject, setHasProject] = useState<'yes' | 'no' | 'exploring'>(
    initialData.hasProject || 'exploring'
  );

  const [title, setTitle] = useState(initialData.title || '');
  const [domain, setDomain] = useState(initialData.domain || '');
  const [problemStatement, setProblemStatement] = useState(
    initialData.problemStatement || ''
  );
  const [researchObjectives, setResearchObjectives] = useState(
    initialData.researchObjectives || ''
  );
  const [researchQuestions, setResearchQuestions] = useState(
    initialData.researchQuestions || ''
  );
  const [currentStage, setCurrentStage] = useState<ProjectStage | string>(
    initialData.currentStage || 'Literature review'
  );

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      hasProject,
      title: hasProject === 'yes' ? title.trim() : undefined,
      domain: hasProject === 'yes' ? domain.trim() : undefined,
      problemStatement: hasProject === 'yes' ? problemStatement.trim() : undefined,
      researchObjectives: hasProject === 'yes' ? researchObjectives.trim() : undefined,
      researchQuestions: hasProject === 'yes' ? researchQuestions.trim() : undefined,
      currentStage: hasProject === 'yes' ? currentStage : undefined,
    });
  };

  return (
    <form id="step-form" onSubmit={handleNext} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Current Research Project
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Do you already have an ongoing thesis or paper in flight? You can initialize it directly into your workspace.
        </p>
      </div>

      {/* 3 Main State Buttons */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Do you currently have an active research project?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'yes' as const,
              title: 'Yes, I have a project',
              desc: 'I have a title or topic I am actively working on.',
              icon: FolderKanban,
            },
            {
              id: 'exploring' as const,
              title: 'I am exploring ideas',
              desc: 'Searching for potential gaps, topics, or proposals.',
              icon: Compass,
            },
            {
              id: 'no' as const,
              title: 'No, not right now',
              desc: 'Just browsing or reading literature papers for now.',
              icon: Lightbulb,
            },
          ].map((opt) => {
            const isSelected = hasProject === opt.id;
            const Icon = opt.icon;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setHasProject(opt.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0091ff] bg-[#0091ff]/5 ring-2 ring-[#0091ff]/20'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? 'text-[#0091ff]' : 'text-slate-400'
                      }`}
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#0091ff] bg-[#0091ff]'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <h4
                    className={`text-xs font-bold pt-2.5 ${
                      isSelected ? 'text-[#006bbd]' : 'text-slate-800'
                    }`}
                  >
                    {opt.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium pt-1">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* If "Yes", show detailed project fields with skip/partial flexibility */}
      {hasProject === 'yes' && (
        <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Project Specification (Fill what you know, skip any fields)
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Can be edited later anytime
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">
                Research / Project Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Robust Semantic Segmentation of Brain Tumors using Vision Transformers"
                className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
              />
            </div>

            {/* Sub Domain */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Project Specific Domain / Sub-field
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Medical Imaging & Deep Learning"
                className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
              />
            </div>

            {/* Current Stage */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Current Stage
              </label>
              <div className="relative">
                <select
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
                >
                  {PROJECT_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">
                Problem Statement (Optional)
              </label>
              <textarea
                rows={2}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Briefly state the research gap or problem you are addressing..."
                className="w-full p-3 border border-blue-200 rounded-2xl bg-white text-xs font-medium text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
              />
            </div>

            {/* Research Objectives */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Key Objectives (Optional)
              </label>
              <textarea
                rows={2}
                value={researchObjectives}
                onChange={(e) => setResearchObjectives(e.target.value)}
                placeholder="1. Benchmark CNN vs ViT...&#10;2. Evaluate dice score..."
                className="w-full p-3 border border-blue-200 rounded-2xl bg-white text-xs font-medium text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
              />
            </div>

            {/* Research Questions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Research Questions (Optional)
              </label>
              <textarea
                rows={2}
                value={researchQuestions}
                onChange={(e) => setResearchQuestions(e.target.value)}
                placeholder="Can hybrid transformer models preserve boundary sharpness on small lesions?"
                className="w-full p-3 border border-blue-200 rounded-2xl bg-white text-xs font-medium text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* If "Exploring" or "No", show helpful contextual guidance */}
      {hasProject === 'exploring' && (
        <div className="p-4 rounded-2xl bg-[#f0f7fe] border border-[#d8ecfc] flex items-start gap-3">
          <Compass className="w-5 h-5 text-[#006bbd] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#004f8c]">
              We'll set up your Research Discovery Workspace
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              EduPye will highlight trending literature, open research gap digests, and seminal papers in your domain to help you formulate a research problem and proposal.
            </p>
          </div>
        </div>
      )}

      {hasProject === 'no' && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">No project required</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              You can read, bookmark, run AI questions, and summarize papers anytime without creating a project. When you're ready to start one, click "New Project" in the dashboard.
            </p>
          </div>
        </div>
      )}
    </form>
  );
};
