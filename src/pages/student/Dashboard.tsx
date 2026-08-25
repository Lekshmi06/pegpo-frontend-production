import React from 'react';
import { Upload, FileText, Clock, Video, Mic } from 'lucide-react';
import { useStudentDashboard } from '../../hooks/useStudentData';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StateViews';

export default function StudentDashboard() {
  const { data, isLoading, error, refetch } = useStudentDashboard();
  const toast = useToast();

  const handleCardClick = (title: string) => {
    toast.info(`Opening workspace for "${title}"...`, 'Workspace');
  };

  const cards = [
    {
      id: 'upload',
      title: 'Upload File',
      desc: 'Turn PDFs and reading into interactive study guides',
      bgColor: 'bg-[#fae1ee]',
      hoverColor: 'hover:bg-[#f6d2e6]',
      icon: <Upload className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />,
    },
    {
      id: 'scratch',
      title: 'Starch from scratch',
      desc: 'Turn PDFs and reading into interactive study guides',
      bgColor: 'bg-[#dce878]',
      hoverColor: 'hover:bg-[#d4e165]',
      icon: <FileText className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />,
    },
    {
      id: 'youtube',
      title: 'You tube to Notes',
      desc: 'Turn PDFs and reading into interactive study guides',
      bgColor: 'bg-[#f0a982]',
      hoverColor: 'hover:bg-[#ea9d72]',
      icon: <Video className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />,
    },
    {
      id: 'record',
      title: 'Record lecture',
      desc: 'Turn PDFs and reading into interactive study guides',
      bgColor: 'bg-[#9fe3d7]',
      hoverColor: 'hover:bg-[#8dd9cb]',
      icon: <Mic className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />,
    },
  ];

  if (isLoading) return <Loader label="Loading student dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const documents = data?.recentDocuments || [];

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.title)}
              className={`${card.bgColor} ${card.hoverColor} rounded-3xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 transform hover:-translate-y-1 shadow-xs border border-black/5`}
            >
              <div className="bg-[#12223b] rounded-2xl h-48 flex flex-col items-center justify-center border-2 border-dashed border-[#23426e] mb-4 space-y-2 group">
                <div className="w-8 h-8 rounded-full bg-[#1e3456] flex items-center justify-center text-[#7ca4d4] group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-[#7ca4d4]">Drop PDF here</span>
              </div>

              <div className="px-2 pb-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  {card.icon}
                  <h3 className="font-extrabold text-sm text-[#111827] tracking-tight">{card.title}</h3>
                </div>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#111827] tracking-tight">Recent Document</h2>
            <button className="text-xs font-bold text-[#0091ff] hover:underline flex items-center gap-1 cursor-pointer">
              View all
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-[#f8fbfe] hover:bg-[#f0f6fc] border border-[#e2ebf4] rounded-2xl transition-all cursor-pointer shadow-2xs group"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#0091ff] transition-colors">{doc.title}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{doc.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#a3c9b8] text-[#1c3352] text-[10px] font-extrabold rounded-md shadow-2xs">
                    {doc.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
