import React, { useState } from 'react';
import {
  X,
  Quote,
  Copy,
  Check,
  Download,
  BookOpen,
  Code,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  CitationPaperInput,
  CitationStyle,
  formatCitation,
  downloadFile,
} from '../../utils/citationUtils';

export interface CitePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: CitationPaperInput | null;
}

const STYLES: CitationStyle[] = [
  'APA',
  'IEEE',
  'MLA',
  'Harvard',
  'Chicago',
  'BibTeX',
  'RIS',
];

export const CitePaperModal: React.FC<CitePaperModalProps> = ({
  isOpen,
  onClose,
  paper,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('APA');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !paper) return null;

  const formatted = formatCitation(paper);

  const getStyleCitation = (style: CitationStyle): string => {
    switch (style) {
      case 'APA':
        return formatted.apa;
      case 'IEEE':
        return formatted.ieee;
      case 'MLA':
        return formatted.mla;
      case 'Harvard':
        return formatted.harvard;
      case 'Chicago':
        return formatted.chicago;
      case 'BibTeX':
        return formatted.bibtex;
      case 'RIS':
        return formatted.ris;
      default:
        return formatted.apa;
    }
  };

  const currentCitation = getStyleCitation(selectedStyle);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownload = () => {
    if (selectedStyle === 'BibTeX') {
      downloadFile(formatted.bibtex, `${formatted.citationKey}.bib`, 'application/x-bibtex');
    } else if (selectedStyle === 'RIS') {
      downloadFile(formatted.ris, `${formatted.citationKey}.ris`, 'application/x-research-info-systems');
    } else {
      downloadFile(
        currentCitation,
        `${formatted.citationKey}_${selectedStyle.toLowerCase()}.txt`,
        'text/plain'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0091ff] text-white flex items-center justify-center shadow-xs">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Cite Academic Literature
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-md">
                {paper.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Style Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto no-scrollbar">
            {STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedStyle === style
                    ? 'bg-white text-[#006bbd] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Formatted Citation Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {selectedStyle} Reference Entry
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  title="Download Reference"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentCitation, 'full')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    copiedKey === 'full'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0091ff] hover:bg-[#007cdb] text-white'
                  }`}
                >
                  {copiedKey === 'full' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Reference</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed font-mono select-all ${
                selectedStyle === 'BibTeX' || selectedStyle === 'RIS'
                  ? 'bg-slate-900 text-slate-100 border-slate-800 whitespace-pre-wrap'
                  : 'bg-slate-50 text-slate-800 border-slate-200/80 font-serif'
              }`}
            >
              {currentCitation}
            </div>
          </div>

          {/* In-Text Citation Options */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              In-Text Citations & LaTeX Keys
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Narrative In-Text */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs hover:border-blue-300 transition-all">
                <div className="min-w-0 mr-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Narrative (Parenthetical Context)
                  </div>
                  <div className="text-xs font-bold text-slate-800 truncate font-serif">
                    {formatted.inTextNarrative}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(formatted.inTextNarrative, 'narrative')}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors shrink-0"
                  title="Copy narrative citation"
                >
                  {copiedKey === 'narrative' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Parenthetical In-Text */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs hover:border-blue-300 transition-all">
                <div className="min-w-0 mr-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Parenthetical (APA / MLA / Harvard)
                  </div>
                  <div className="text-xs font-bold text-slate-800 truncate font-serif">
                    {formatted.inTextParenthetical}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(formatted.inTextParenthetical, 'parenthetical')}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors shrink-0"
                  title="Copy parenthetical citation"
                >
                  {copiedKey === 'parenthetical' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Numbered IEEE */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs hover:border-blue-300 transition-all">
                <div className="min-w-0 mr-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Numbered (IEEE / Vancouver)
                  </div>
                  <div className="text-xs font-bold text-slate-800 font-mono">
                    {formatted.inTextNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(formatted.inTextNumber, 'number')}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors shrink-0"
                  title="Copy numbered citation"
                >
                  {copiedKey === 'number' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* LaTeX \cite */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs hover:border-blue-300 transition-all">
                <div className="min-w-0 mr-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    LaTeX In-Text Command
                  </div>
                  <div className="text-xs font-bold text-[#006bbd] font-mono">
                    {formatted.latexCite}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(formatted.latexCite, 'latex')}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors shrink-0"
                  title="Copy LaTeX cite command"
                >
                  {copiedKey === 'latex' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Paper Details Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2 truncate">
              <span>Venue: <strong className="text-slate-700">{paper.venue || 'N/A'}</strong></span>
              <span>•</span>
              <span>Year: <strong className="text-slate-700">{paper.year || 'N/A'}</strong></span>
              {paper.doi && (
                <>
                  <span>•</span>
                  <span className="truncate">DOI: <strong className="text-slate-700">{paper.doi}</strong></span>
                </>
              )}
            </div>
            {paper.doi && (
              <a
                href={`https://doi.org/${paper.doi.replace(/^https?:\/\/doi\.org\//i, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#0091ff] hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Verify DOI</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <span className="text-[11px] text-slate-400">
            Citation Key: <code className="font-mono text-slate-600">{formatted.citationKey}</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitePaperModal;
