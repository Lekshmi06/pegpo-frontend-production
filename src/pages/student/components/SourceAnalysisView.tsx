import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  Layers,
  FileCheck,
} from 'lucide-react';
import { SourceItem, DocumentAnalysisData } from '../../../types/source';
import { sourceService } from '../../../services/sourceService';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';

interface SourceAnalysisViewProps {
  source: SourceItem;
}

export const SourceAnalysisView: React.FC<SourceAnalysisViewProps> = ({ source }) => {
  const toast = useToast();
  const [analysis, setAnalysis] = useState<DocumentAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalysis = async (forceRegenerate = false) => {
    setIsLoading(true);
    try {
      const res = await sourceService.triggerAIAction(source._id, 'analyse', { forceRegenerate });
      if (res.data && typeof res.data === 'object') {
        setAnalysis(res.data);
      } else {
        toast.error('Could not run document analysis.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze document';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(false);
  }, [source._id]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-3">
        <Loader size="lg" />
        <h4 className="text-sm font-extrabold text-[#111827]">Running Deep Pedagogical Analysis...</h4>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Gemini is computing reading metrics, Bloom's taxonomy levels, prerequisites, and learning outcomes.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-4 text-center">
        <RotateCcw className="w-12 h-12 text-slate-300" />
        <h4 className="text-sm font-bold text-[#111827]">Analysis Not Available</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Run document intelligence analysis to extract cognitive metrics and prerequisite benchmarks.
        </p>
        <Button onClick={() => fetchAnalysis(true)} className="py-2.5 px-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Run Analysis
        </Button>
      </div>
    );
  }

  const overview = source.aiOverview;

  return (
    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
              <span>Document Intelligence & Pedagogical Analysis</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-100 text-sky-700">
                Cognitive Metrics
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Curriculum alignment and learning benchmarks</p>
          </div>
        </div>

        <button
          onClick={() => fetchAnalysis(true)}
          className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Re-analyze</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#f8fbfe] border border-[#e2ebf4] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
            <Clock className="w-3.5 h-3.5 text-[#0091ff]" />
            <span>Study Time</span>
          </div>
          <p className="text-sm font-extrabold text-[#111827]">
            {analysis.estimatedStudyHours ? `${analysis.estimatedStudyHours} hrs` : `${overview?.readingTimeMinutes || 2} mins`}
          </p>
          <span className="text-[10px] text-slate-400">Estimated mastery duration</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#f8fbfe] border border-[#e2ebf4] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Academic Level</span>
          </div>
          <p className="text-sm font-extrabold text-[#111827] truncate">
            {analysis.academicLevel || overview?.difficulty || 'Intermediate'}
          </p>
          <span className="text-[10px] text-slate-400">Syllabus rating</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#f8fbfe] border border-[#e2ebf4] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Bloom's Taxonomy</span>
          </div>
          <p className="text-sm font-extrabold text-[#111827] truncate">
            {analysis.bloomLevel || 'Application'}
          </p>
          <span className="text-[10px] text-slate-400">Cognitive complexity</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#f8fbfe] border border-[#e2ebf4] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
            <FileCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Density Score</span>
          </div>
          <p className="text-sm font-extrabold text-[#111827]">
            {analysis.contentDensityScore || 82}/100
          </p>
          <span className="text-[10px] text-slate-400">High informational value</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Prerequisites */}
        <div className="p-4 rounded-2xl bg-[#fafcff] border border-[#e2ebf4] space-y-3">
          <h4 className="text-xs font-extrabold text-[#111827] flex items-center gap-1.5 uppercase tracking-wide">
            <ListOrdered className="w-3.5 h-3.5 text-[#0091ff]" />
            <span>Prerequisites & Foundational Knowledge</span>
          </h4>
          <div className="space-y-2">
            {(analysis.prerequisites || ['Basic secondary school mathematics & scientific concepts']).map(
              (p, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0091ff] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{p}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="p-4 rounded-2xl bg-[#fafcff] border border-[#e2ebf4] space-y-3">
          <h4 className="text-xs font-extrabold text-[#111827] flex items-center gap-1.5 uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target Learning Outcomes</span>
          </h4>
          <div className="space-y-2">
            {(analysis.learningOutcomes || [
              'Understand core theoretical principles and foundational terminology',
              'Formulate solutions to analytical problem sets',
            ]).map((out, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{out}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vocabulary Terms */}
      {analysis.vocabularyTerms && analysis.vocabularyTerms.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
            Key Academic Vocabulary Dictionary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto">
            {analysis.vocabularyTerms.map((v, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#f8fbfe] border border-slate-200 text-xs">
                <span className="font-extrabold text-[#111827]">{v.term}: </span>
                <span className="text-slate-600 font-medium">{v.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 text-[10px] text-slate-400">
        Source analyzed: {source.originalName} ({source.mimeType})
      </div>
    </div>
  );
};
