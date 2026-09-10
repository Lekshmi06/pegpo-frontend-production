import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { SourceItem, MindMapNode } from '../../../types/source';
import { sourceService } from '../../../services/sourceService';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';

interface SourceMindMapViewProps {
  source: SourceItem;
}

const BRANCH_COLORS = [
  { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-900', badge: 'bg-blue-600' },
  { border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-900', badge: 'bg-emerald-600' },
  { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-900', badge: 'bg-purple-600' },
  { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-900', badge: 'bg-amber-600' },
];

export const SourceMindMapView: React.FC<SourceMindMapViewProps> = ({ source }) => {
  const toast = useToast();
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchMindMap = async (forceRegenerate = false) => {
    setIsLoading(true);
    try {
      const res = await sourceService.triggerAIAction(source._id, 'mindmap', { forceRegenerate });
      if (res.data && typeof res.data === 'object') {
        setMindMap(res.data);
      } else {
        toast.error('Could not construct mind map structure.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate mind map';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMindMap(false);
  }, [source._id]);

  const toggleBranch = (id: string) => {
    setCollapsedBranches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyStructure = () => {
    if (!mindMap) return;
    navigator.clipboard.writeText(JSON.stringify(mindMap, null, 2));
    setCopied(true);
    toast.success('Mind map hierarchy copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-3">
        <Loader size="lg" />
        <h4 className="text-sm font-extrabold text-[#111827]">Building Visual Concept Map...</h4>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Organizing topics, branches, and connections from "{source.originalName}".
        </p>
      </div>
    );
  }

  if (!mindMap) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-4 text-center">
        <Brain className="w-12 h-12 text-slate-300" />
        <h4 className="text-sm font-bold text-[#111827]">No Mind Map Available</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Click below to extract a hierarchical mind map structure from this document.
        </p>
        <Button onClick={() => fetchMindMap(true)} className="py-2.5 px-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Mind Map
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
              <span>Interactive Mind Map</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-700">
                Visual Hierarchy
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Click topic branches to expand or collapse details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyStructure}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Copy Hierarchy"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => fetchMindMap(true)}
            className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors flex items-center gap-1 cursor-pointer pl-1"
            title="Regenerate Mind Map"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Mind Map Tree Rendering */}
      <div className="py-6 flex-1 overflow-x-auto">
        <div className="min-w-[600px] flex flex-col items-center space-y-8">
          {/* Central Root Node */}
          <div className="relative group">
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0091ff] to-[#3b82f6] text-white shadow-md font-extrabold text-sm tracking-tight flex items-center gap-2 border-2 border-white ring-4 ring-[#0091ff]/20">
              <Brain className="w-4 h-4" />
              <span>{mindMap.label || source.originalName}</span>
            </div>
            {/* Center connector line */}
            <div className="w-0.5 h-6 bg-slate-300 mx-auto" />
          </div>

          {/* Primary Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {mindMap.children?.map((branch, idx) => {
              const color = BRANCH_COLORS[idx % BRANCH_COLORS.length];
              const isCollapsed = collapsedBranches[branch.id];

              return (
                <div
                  key={branch.id || idx}
                  className={`rounded-2xl border p-4 shadow-2xs transition-all space-y-3 ${color.bg} ${color.border}`}
                >
                  <div
                    onClick={() => toggleBranch(branch.id)}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${color.badge} group-hover:scale-125 transition-transform`}
                      />
                      <h4 className={`text-xs font-extrabold ${color.text}`}>{branch.label}</h4>
                    </div>

                    <button className="text-slate-400 hover:text-slate-700 p-0.5">
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Sub-children */}
                  {!isCollapsed && branch.children && branch.children.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-slate-200/60 pl-2">
                      {branch.children.map((child, cIdx) => (
                        <div
                          key={child.id || cIdx}
                          className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-white/60 shadow-2xs text-[11px] font-semibold text-slate-800 flex items-center gap-2 hover:bg-white transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>{child.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Interactive Concept Map</span>
        <span>{mindMap.children?.length || 0} primary branches</span>
      </div>
    </div>
  );
};
