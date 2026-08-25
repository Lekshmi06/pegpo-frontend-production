import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function GenericStudentPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-[#e2ebf4] p-8 shadow-sm text-center max-w-xl mx-auto mt-12 space-y-4">
        <div className="w-16 h-16 bg-[#e2ebf4] text-[#0b2d5a] rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-[#0b2d5a]">{title}</h1>
        <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
        <div className="pt-2">
          <Button size="sm">
            Configure {title}
          </Button>
        </div>
      </div>
    </div>
  );
}
