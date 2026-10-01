import React, { useState } from 'react';
import { Bookmark, FileText, Bell, Check, Sparkles } from 'lucide-react';
import {
  ResearchPreferencesData,
  CITATION_STYLES,
  CitationStyle,
} from '../../../../types/researcher';

interface ResearchPreferencesProps {
  initialData: ResearchPreferencesData;
  onSave: (data: ResearchPreferencesData) => void;
}

const OUTPUT_FORMATS = ['PDF Document', 'LaTeX Source (.tex)', 'Word Document (.docx)', 'Markdown (.md)'];

const PREF_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Japanese'];

export const ResearchPreferences: React.FC<ResearchPreferencesProps> = ({
  initialData,
  onSave,
}) => {
  const [citationStyle, setCitationStyle] = useState<CitationStyle | string>(
    initialData.citationStyle || 'APA'
  );
  const [outputFormat, setOutputFormat] = useState(
    initialData.outputFormat || 'PDF Document'
  );
  const [language, setLanguage] = useState(
    initialData.language || 'English'
  );

  const [emailAlerts, setEmailAlerts] = useState(
    initialData.notificationPreferences?.emailAlerts ?? true
  );
  const [paperRecommendations, setPaperRecommendations] = useState(
    initialData.notificationPreferences?.paperRecommendations ?? true
  );
  const [collaborationInvites, setCollaborationInvites] = useState(
    initialData.notificationPreferences?.collaborationInvites ?? true
  );

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      citationStyle,
      outputFormat,
      language,
      notificationPreferences: {
        emailAlerts,
        paperRecommendations,
        collaborationInvites,
      },
    });
  };

  return (
    <form id="step-form" onSubmit={handleNext} className="space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
          <span>Optional Step</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Citations & Formatting Preferences
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Customize default bibliographies, exported manuscript types, and periodic literature digests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preferred Citation Style */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Preferred Citation Format
          </label>
          <div className="relative">
            <Bookmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value)}
              className="w-full pl-10 pr-9 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            >
              {CITATION_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style} Style
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>

        {/* Preferred Output Format */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Default Synthesis Output Format
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full pl-10 pr-9 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            >
              {OUTPUT_FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700">
          Smart Literature Updates
        </label>

        <div className="space-y-2">
          {[
            {
              id: 'paperRecs',
              title: 'Weekly arXiv / Semantic Scholar Paper Recommendations',
              desc: 'Tailored to your research domain and specific keywords',
              value: paperRecommendations,
              setter: setPaperRecommendations,
            },
            {
              id: 'emailAlerts',
              title: 'Research Gap & Citation Alerts',
              desc: 'Notified when new papers address gaps related to your research questions',
              value: emailAlerts,
              setter: setEmailAlerts,
            },
            {
              id: 'collab',
              title: 'Peer Collaboration Inquiries',
              desc: 'Allow verified researchers working on related topics to request co-authorship',
              value: collaborationInvites,
              setter: setCollaborationInvites,
            },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-100 transition-colors cursor-pointer"
            >
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-800 block">{item.title}</span>
                <span className="text-[11px] text-slate-500 font-medium block pt-0.5">
                  {item.desc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={item.value}
                onChange={(e) => item.setter(e.target.checked)}
                className="w-4 h-4 rounded text-[#0091ff] focus:ring-[#0091ff] cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>
    </form>
  );
};
