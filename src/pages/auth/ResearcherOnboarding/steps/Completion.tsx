import React from 'react';
import {
  CheckCircle2,
  GraduationCap,
  Building2,
  Compass,
  Lightbulb,
  Award,
  ArrowRight,
  Edit3,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { ResearcherProfileData } from '../../../../types/researcher';
import { Button } from '../../../../components/ui/Button';

interface CompletionProps {
  profile: ResearcherProfileData;
  onEdit: (stepNumber: number) => void;
  onFinish: () => void;
  isCompleting: boolean;
}

export const Completion: React.FC<CompletionProps> = ({
  profile,
  onEdit,
  onFinish,
  isCompleting,
}) => {
  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-3xl bg-[#d8ecfc] text-[#006bbd] shadow-2xs">
          <CheckCircle2 className="w-10 h-10 text-[#0091ff]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight">
          Your Researcher Profile is Ready!
        </h2>
        <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
          We've personalized your Literature Engine, Gap Synthesis, AI Copilot, and Research Workspace based on your background.
        </p>
      </div>

      {/* Summary Profile Card */}
      <div className="bg-[#f8fbfe] border border-blue-100 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-blue-100/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0091ff] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              {profile.fullName?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111827]">
                {profile.fullName || 'Researcher'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {profile.contact?.email} • {profile.location?.country || 'Global'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0091ff] hover:border-blue-200 transition-all cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Structured summary grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Academic Level & Institution */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-[#0091ff]" />
              <span>Academic Status & Institution</span>
            </div>
            <p className="text-xs font-bold text-slate-800">
              {profile.academicInfo?.currentStatus || 'Postgraduate Student'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {profile.academicInfo?.institution || 'Institution'} •{' '}
              {profile.academicInfo?.department || 'Department'}
            </p>
          </div>

          {/* Research Domain & Experience */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#0091ff]" />
              <span>Domain & Experience Level</span>
            </div>
            <p className="text-xs font-bold text-[#006bbd]">
              {profile.researchDomains?.[0] || 'Computer Science'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Level: {profile.researchExperience?.level || 'Beginner'} (
              {profile.researchExperience?.hasPublishedPaper ? 'Published Author' : 'Early Career'})
            </p>
          </div>

          {/* Specializations & Interests */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1.5 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-[#0091ff]" />
              <span>Research Interests & Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(profile.researchInterests || ['Machine Learning', 'Computer Vision']).map(
                (interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-bold text-[#006bbd]"
                  >
                    {interest}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Research Goal & Project Focus */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#0091ff]" />
              <span>Current Research Goal</span>
            </div>
            <p className="text-xs font-bold text-slate-800">
              {profile.researchGoals?.primaryGoals?.join(' • ') || 'Literature review & gap identification'}
            </p>
            {profile.researchGoals?.customGoal && (
              <p className="text-[11px] text-slate-500 italic font-medium pt-0.5">
                "{profile.researchGoals.customGoal}"
              </p>
            )}
            {profile.currentResearchProject?.title && (
              <p className="text-[11px] text-[#006bbd] font-semibold pt-1">
                Active Project: {profile.currentResearchProject.title} ({profile.currentResearchProject.currentStage})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => onEdit(1)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
        >
          Review All Details
        </button>

        <Button
          type="button"
          onClick={onFinish}
          isLoading={isCompleting}
          className="w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2"
        >
          <span>Continue to Research Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
