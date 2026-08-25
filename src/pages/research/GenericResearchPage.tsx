import React from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function GenericResearchPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="max-w-xl mx-auto mt-12 bg-white border border-[#e2edf7] p-8 rounded-2xl shadow-sm text-center space-y-4">
      <div className="w-16 h-16 bg-[#e2ebf4] text-[#0b2d5a] rounded-full flex items-center justify-center mx-auto">
        <Bookmark className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold text-[#0b2d5a]">{title}</h2>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      <div className="pt-2">
        <Button size="sm">
          Configure {title}
        </Button>
      </div>
    </div>
  );
}
