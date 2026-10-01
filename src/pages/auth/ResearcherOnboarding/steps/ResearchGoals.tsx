import React, { useState } from 'react';
import { Target, CheckCircle2, MessageSquareText, Sparkles, Plus } from 'lucide-react';
import {
  ResearchGoalsData,
  RESEARCH_GOAL_OPTIONS,
} from '../../../../types/researcher';

interface ResearchGoalsProps {
  initialData: ResearchGoalsData;
  onSave: (data: ResearchGoalsData) => void;
}

export const ResearchGoals: React.FC<ResearchGoalsProps> = ({
  initialData,
  onSave,
}) => {
  const [primaryGoals, setPrimaryGoals] = useState<string[]>(
    initialData.primaryGoals && initialData.primaryGoals.length > 0
      ? initialData.primaryGoals
      : ['Finding research papers', 'Literature review', 'Finding research gaps']
  );
  const [customGoal, setCustomGoal] = useState<string>(
    initialData.customGoal || ''
  );
  const [error, setError] = useState<string | null>(null);

  const toggleGoal = (goal: string) => {
    setPrimaryGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (primaryGoals.length === 0) {
      setError('Please select at least one primary research goal.');
      return;
    }

    setError(null);
    onSave({
      primaryGoals,
      customGoal: customGoal.trim(),
    });
  };

  return (
    <form id="step-form" onSubmit={handleNext} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Research Goals & EduPye Objective
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Select what tasks you plan to accomplish so EduPye can configure your workspace widgets and AI assistant prompts.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}

      {/* Goal Checkboxes / Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            What are you currently using EduPye for? <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] font-semibold text-slate-400">
            {primaryGoals.length} selected (multi-select)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {RESEARCH_GOAL_OPTIONS.map((goal) => {
            const isSelected = primaryGoals.includes(goal);
            return (
              <button
                type="button"
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#0091ff] bg-[#d8ecfc]/50 text-[#005299] shadow-2xs ring-1 ring-[#0091ff]/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-[#0091ff] bg-[#0091ff] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-bold leading-snug">{goal}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Free-text AI Objective Field */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <MessageSquareText className="w-4 h-4 text-[#0091ff]" />
          <span>What would you like EduPye to help you accomplish?</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          Express your key research mission in your own words. This is directly injected as AI context during literature synthesis.
        </p>

        <textarea
          rows={3}
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          placeholder='e.g. "I want to identify research gaps in medical image segmentation, discover benchmark datasets, and develop a comprehensive thesis proposal."'
          className="w-full p-3.5 border border-blue-200 rounded-2xl bg-white text-xs font-semibold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs leading-relaxed"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Acts as primary prompt context for Research Copilot</span>
          <span>{customGoal.length}/500 chars</span>
        </div>
      </div>
    </form>
  );
};
