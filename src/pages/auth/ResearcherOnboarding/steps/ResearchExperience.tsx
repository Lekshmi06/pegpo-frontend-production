import React, { useState } from 'react';
import { Award, CheckCircle2, FileText, Presentation, Database, FlaskConical, Plus, X } from 'lucide-react';
import {
  ResearchExperienceData,
  EXPERIENCE_LEVELS,
  ExperienceLevel,
} from '../../../../types/researcher';

interface ResearchExperienceProps {
  initialData: ResearchExperienceData;
  onSave: (data: ResearchExperienceData) => void;
}

export const ResearchExperience: React.FC<ResearchExperienceProps> = ({
  initialData,
  onSave,
}) => {
  const [level, setLevel] = useState<ExperienceLevel | string>(
    initialData.level || 'Beginner'
  );
  const [hasWorkedOnProject, setHasWorkedOnProject] = useState<boolean>(
    initialData.hasWorkedOnProject ?? false
  );
  const [hasPublishedPaper, setHasPublishedPaper] = useState<boolean>(
    initialData.hasPublishedPaper ?? false
  );
  const [hasParticipatedConference, setHasParticipatedConference] = useState<boolean>(
    initialData.hasParticipatedConference ?? false
  );
  const [hasWorkedWithDatasets, setHasWorkedWithDatasets] = useState<boolean>(
    initialData.hasWorkedWithDatasets ?? false
  );
  const [hasWorkedWithDataAnalysisTools, setHasWorkedWithDataAnalysisTools] = useState<boolean>(
    initialData.hasWorkedWithDataAnalysisTools ?? false
  );

  // Optional lists
  const [previousProjects, setPreviousProjects] = useState<string[]>(
    initialData.previousProjects || []
  );
  const [projectInput, setProjectInput] = useState('');

  const [publications, setPublications] = useState<string[]>(
    initialData.publications || []
  );
  const [publicationInput, setPublicationInput] = useState('');

  const [conferences, setConferences] = useState<string[]>(
    initialData.conferences || []
  );
  const [conferenceInput, setConferenceInput] = useState('');

  const [researchLabs, setResearchLabs] = useState<string[]>(
    initialData.researchLabs || []
  );
  const [labInput, setLabInput] = useState('');

  const addProject = () => {
    const trimmed = projectInput.trim();
    if (trimmed && !previousProjects.includes(trimmed)) {
      setPreviousProjects([...previousProjects, trimmed]);
      setProjectInput('');
    }
  };

  const addPublication = () => {
    const trimmed = publicationInput.trim();
    if (trimmed && !publications.includes(trimmed)) {
      setPublications([...publications, trimmed]);
      setPublicationInput('');
    }
  };

  const addConference = () => {
    const trimmed = conferenceInput.trim();
    if (trimmed && !conferences.includes(trimmed)) {
      setConferences([...conferences, trimmed]);
      setConferenceInput('');
    }
  };

  const addLab = () => {
    const trimmed = labInput.trim();
    if (trimmed && !researchLabs.includes(trimmed)) {
      setResearchLabs([...researchLabs, trimmed]);
      setLabInput('');
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      level,
      hasWorkedOnProject,
      hasPublishedPaper,
      hasParticipatedConference,
      hasWorkedWithDatasets,
      hasWorkedWithDataAnalysisTools,
      previousProjects,
      publications,
      conferences,
      researchLabs,
    });
  };

  return (
    <form id="step-form" onSubmit={handleNext} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Research Experience & Track Record
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Gauge your research maturity to adapt AI assistance from step-by-step guidance to advanced synthesis.
        </p>
      </div>

      {/* Experience Level Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Research Experience Level <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXPERIENCE_LEVELS.map((lvl) => {
            const isSelected = level === lvl;
            const descriptions: Record<string, string> = {
              Beginner: 'First-time researcher or student starting literature study',
              Intermediate: 'Some project exposure, familiar with papers and tools',
              Experienced: 'Has published papers, drafted proposals, or led studies',
              Advanced: 'Senior investigator, PhD holder, or principal researcher',
            };
            return (
              <button
                type="button"
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0091ff] bg-[#0091ff]/5 ring-2 ring-[#0091ff]/20'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#006bbd]' : 'text-slate-800'
                    }`}
                  >
                    {lvl}
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#0091ff] bg-[#0091ff]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium pt-2 leading-relaxed">
                  {descriptions[lvl]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Targeted Yes/No Experience Questions */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-bold text-slate-700">
          Previous Research Exposure
        </label>

        <div className="space-y-2">
          {[
            {
              id: 'project',
              label: 'Have you previously worked on a research project?',
              value: hasWorkedOnProject,
              setter: setHasWorkedOnProject,
            },
            {
              id: 'paper',
              label: 'Have you published a research paper in a journal or preprint?',
              value: hasPublishedPaper,
              setter: setHasPublishedPaper,
            },
            {
              id: 'conference',
              label: 'Have you participated in or presented at an academic conference?',
              value: hasParticipatedConference,
              setter: setHasParticipatedConference,
            },
            {
              id: 'datasets',
              label: 'Have you worked with research datasets, benchmarks, or corpora?',
              value: hasWorkedWithDatasets,
              setter: setHasWorkedWithDatasets,
            },
            {
              id: 'tools',
              label: 'Have you worked with statistical or data-analysis tools (SPSS, R, etc.)?',
              value: hasWorkedWithDataAnalysisTools,
              setter: setHasWorkedWithDataAnalysisTools,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-100 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-700 pr-4">{item.label}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => item.setter(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    item.value
                      ? 'bg-[#0091ff] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => item.setter(false)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !item.value
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Details (Expanded / Optional) */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            Portfolio & Affiliations <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <span className="text-[11px] font-semibold text-slate-400">Add any you have</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Previous Projects */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              Previous Research Projects
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addProject();
                  }
                }}
                placeholder="e.g. Brain MRI Segmentation (2025)"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff]"
              />
              <button
                type="button"
                onClick={addProject}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                +
              </button>
            </div>
            {previousProjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {previousProjects.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[11px] font-semibold text-[#006bbd]"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => setPreviousProjects(previousProjects.filter((x) => x !== p))}
                      className="hover:text-rose-500"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Publications */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              Publications / Papers (Optional)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={publicationInput}
                onChange={(e) => setPublicationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPublication();
                  }
                }}
                placeholder="e.g. IEEE Access 2024 or arXiv:2401.xxx"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff]"
              />
              <button
                type="button"
                onClick={addPublication}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                +
              </button>
            </div>
            {publications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {publications.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[11px] font-semibold text-[#006bbd]"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => setPublications(publications.filter((x) => x !== p))}
                      className="hover:text-rose-500"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Conferences */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              Conferences Participated (Optional)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={conferenceInput}
                onChange={(e) => setConferenceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addConference();
                  }
                }}
                placeholder="e.g. NeurIPS 2024, ICML, CVPR"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff]"
              />
              <button
                type="button"
                onClick={addConference}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                +
              </button>
            </div>
            {conferences.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {conferences.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[11px] font-semibold text-[#006bbd]"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => setConferences(conferences.filter((x) => x !== c))}
                      className="hover:text-rose-500"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Research Labs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600">
              Research Labs / Centers (Optional)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={labInput}
                onChange={(e) => setLabInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLab();
                  }
                }}
                placeholder="e.g. Vision & Learning Lab, CERN"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff]"
              />
              <button
                type="button"
                onClick={addLab}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                +
              </button>
            </div>
            {researchLabs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {researchLabs.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[11px] font-semibold text-[#006bbd]"
                  >
                    <span>{l}</span>
                    <button
                      type="button"
                      onClick={() => setResearchLabs(researchLabs.filter((x) => x !== l))}
                      className="hover:text-rose-500"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
