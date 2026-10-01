import React, { useState } from 'react';
import { Wrench, Code2, Plus, Check, X } from 'lucide-react';
import {
  ResearchToolsSkillsData,
  COMMON_RESEARCH_TOOLS,
  COMMON_TECHNICAL_SKILLS,
} from '../../../../types/researcher';

interface ResearchToolsSkillsProps {
  initialData: ResearchToolsSkillsData;
  onSave: (data: ResearchToolsSkillsData) => void;
}

export const ResearchToolsSkills: React.FC<ResearchToolsSkillsProps> = ({
  initialData,
  onSave,
}) => {
  const [researchTools, setResearchTools] = useState<string[]>(
    initialData.researchTools || ['Google Scholar', 'arXiv', 'Zotero']
  );
  const [customToolInput, setCustomToolInput] = useState('');

  const [technicalSkills, setTechnicalSkills] = useState<string[]>(
    initialData.technicalSkills || ['Python', 'LaTeX']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  const toggleTool = (tool: string) => {
    setResearchTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const addCustomTool = () => {
    const trimmed = customToolInput.trim();
    if (trimmed && !researchTools.includes(trimmed)) {
      setResearchTools([...researchTools, trimmed]);
      setCustomToolInput('');
    }
  };

  const toggleSkill = (skill: string) => {
    setTechnicalSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !technicalSkills.includes(trimmed)) {
      setTechnicalSkills([...technicalSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      researchTools,
      technicalSkills,
    });
  };

  return (
    <form id="step-form" onSubmit={handleNext} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Familiar Tools & Technical Stack
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Select citation managers, literature databases, and computational frameworks you utilize. <span className="text-[#006bbd] font-semibold">(Optional)</span>
        </p>
      </div>

      {/* 1. Research & Indexing Tools */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Wrench className="w-4 h-4 text-[#0091ff]" />
            <span>Research & Citation Tools</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {researchTools.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMON_RESEARCH_TOOLS.map((tool) => {
            const isSelected = researchTools.includes(tool);
            return (
              <button
                type="button"
                key={tool}
                onClick={() => toggleTool(tool)}
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
                <span>{tool}</span>
              </button>
            );
          })}
        </div>

        {/* Custom tool adder */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customToolInput}
            onChange={(e) => setCustomToolInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTool();
              }
            }}
            placeholder="Add another tool (e.g. Connected Papers, Obsidian)..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff] placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={addCustomTool}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* 2. Technical & Data Analysis Skills */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Code2 className="w-4 h-4 text-[#0091ff]" />
            <span>Technical & Computational Skills</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {technicalSkills.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMON_TECHNICAL_SKILLS.map((skill) => {
            const isSelected = technicalSkills.includes(skill);
            return (
              <button
                type="button"
                key={skill}
                onClick={() => toggleSkill(skill)}
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
                <span>{skill}</span>
              </button>
            );
          })}
        </div>

        {/* Custom skill adder */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder="Add another skill (e.g. Julia, Stata, JAX)..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff] placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
};
