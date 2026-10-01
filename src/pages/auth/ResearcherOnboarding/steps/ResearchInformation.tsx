import React, { useState } from 'react';
import { Sparkles, Plus, X, Layers, Lightbulb, Check } from 'lucide-react';
import {
  ResearchInformationData,
  RESEARCH_DOMAINS,
  DOMAIN_SPECIALIZATIONS,
} from '../../../../types/researcher';

interface ResearchInformationProps {
  initialData: ResearchInformationData;
  onSave: (data: ResearchInformationData) => void;
}

export const ResearchInformation: React.FC<ResearchInformationProps> = ({
  initialData,
  onSave,
}) => {
  const [primaryDomain, setPrimaryDomain] = useState(
    initialData.primaryDomain || RESEARCH_DOMAINS[0]
  );
  const [specializations, setSpecializations] = useState<string[]>(
    initialData.specializations && initialData.specializations.length > 0
      ? initialData.specializations
      : ['Artificial Intelligence', 'Machine Learning']
  );
  const [customSpecInput, setCustomSpecInput] = useState('');

  const [interests, setInterests] = useState<string[]>(
    initialData.interests && initialData.interests.length > 0
      ? initialData.interests
      : ['Computer Vision', 'Medical Imaging', 'Deep Learning', 'Image Segmentation']
  );
  const [interestInput, setInterestInput] = useState('');

  const [error, setError] = useState<string | null>(null);

  const availableSpecs = DOMAIN_SPECIALIZATIONS[primaryDomain] || [
    'General Research',
    'Applied Methodology',
    'Theoretical Analysis',
  ];

  const handleDomainChange = (domain: string) => {
    setPrimaryDomain(domain);
    // Keep existing specs that match or set default for new domain
    const newDefaults = DOMAIN_SPECIALIZATIONS[domain]?.slice(0, 2) || [];
    setSpecializations(newDefaults);
  };

  const toggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const addCustomSpecialization = () => {
    const trimmed = customSpecInput.trim();
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations((prev) => [...prev, trimmed]);
      setCustomSpecInput('');
    }
  };

  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
      setInterestInput('');
    }
  };

  const removeInterest = (item: string) => {
    setInterests((prev) => prev.filter((i) => i !== item));
  };

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (specializations.length === 0) {
      setError('Please select or specify at least one research specialization.');
      return;
    }
    if (interests.length === 0) {
      setError('Please provide at least one research interest or keyword.');
      return;
    }

    setError(null);
    onSave({
      primaryDomain,
      specializations,
      interests,
    });
  };

  return (
    <form id="step-form" onSubmit={handleNext} className="space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#006bbd] text-[11px] font-bold">
          <Sparkles className="w-3 h-3 text-[#0091ff]" />
          <span>Core Research Profile</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Domain, Specialization & Research Interests
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          This is the foundational context powering the EduPye Literature Engine, gap synthesis, and AI research assistant.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}

      {/* 1. Broad Primary Research Domain */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Primary Research Domain <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RESEARCH_DOMAINS.map((domain) => {
            const isSelected = primaryDomain === domain;
            return (
              <button
                type="button"
                key={domain}
                onClick={() => handleDomainChange(domain)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center justify-between ${
                  isSelected
                    ? 'border-[#0091ff] bg-[#0091ff] text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{domain}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Research Specializations (Multi-select) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            Research Specializations for {primaryDomain} <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] font-semibold text-slate-400">
            {specializations.length} selected (multi-choice)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableSpecs.map((spec) => {
            const isSelected = specializations.includes(spec);
            return (
              <button
                type="button"
                key={spec}
                onClick={() => toggleSpecialization(spec)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#0091ff] bg-[#d8ecfc] text-[#005299] font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-[#006bbd]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{spec}</span>
              </button>
            );
          })}
        </div>

        {/* Custom specialization adder */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customSpecInput}
            onChange={(e) => setCustomSpecInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomSpecialization();
              }
            }}
            placeholder="Add custom specialization..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff]/20 placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={addCustomSpecialization}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* 3. Research Interests (Tags / Chips) */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            Specific Research Interests & Keywords <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] font-semibold text-slate-400">
            Press Enter or click Add to add chip
          </span>
        </div>

        {/* Current chips */}
        <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 rounded-2xl bg-[#f8fbfe] border border-blue-100">
          {interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#0091ff]/30 text-xs font-bold text-[#006bbd] shadow-2xs animate-in fade-in zoom-in-95 duration-150"
            >
              <Lightbulb className="w-3 h-3 text-[#0091ff]" />
              <span>{interest}</span>
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="hover:text-rose-500 cursor-pointer p-0.5 rounded-full hover:bg-rose-50 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {interests.length === 0 && (
            <span className="text-xs text-slate-400 font-medium self-center pl-1">
              No interests added yet. Add keywords like "Medical Imaging", "Transformers", etc.
            </span>
          )}
        </div>

        {/* Input to add chips */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={handleInterestKeyDown}
              placeholder="e.g. Image Segmentation, Reinforcement Learning, CRISPR"
              className="w-full px-4 py-2.5 border border-blue-200 rounded-xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            />
          </div>
          <button
            type="button"
            onClick={addInterest}
            className="px-4 py-2.5 bg-[#0091ff] hover:bg-[#007cdb] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Interest</span>
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
          <span className="font-semibold">Suggestions:</span>
          {['Deep Learning', 'Statistical Modeling', 'Neural Networks', 'Clinical Trials'].map(
            (sugg) => (
              <button
                type="button"
                key={sugg}
                onClick={() => {
                  if (!interests.includes(sugg)) setInterests([...interests, sugg]);
                }}
                className="hover:text-[#0091ff] hover:underline cursor-pointer font-medium"
              >
                +{sugg}
              </button>
            )
          )}
        </div>
      </div>
    </form>
  );
};
