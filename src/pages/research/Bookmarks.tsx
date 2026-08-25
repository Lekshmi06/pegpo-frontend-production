import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';

export default function Bookmarks() {
  const toast = useToast();
  const [viewState, setViewState] = useState<'list' | 'folders'>('list');
  const [folders, setFolders] = useState([
    { id: 1, title: 'Book Mark', count: 0 },
    { id: 2, title: 'Book Mark', count: 0 },
    { id: 3, title: 'Book Mark', count: 0 },
  ]);

  const bookmarkItems = [
    { id: 'bm-1', title: 'Identify strategic research gaps' },
    { id: 'bm-2', title: 'Document Creation Assistant' },
    { id: 'bm-3', title: 'Identify strategic research gaps' },
    { id: 'bm-4', title: 'Document Creation Assistant' },
    { id: 'bm-5', title: 'Identify strategic research gaps' },
    { id: 'bm-6', title: 'Document Creation Assistant' },
    { id: 'bm-7', title: 'Identify strategic research gaps' },
    { id: 'bm-8', title: 'Document Creation Assistant' },
  ];

  const handleAddFolder = () => {
    if (viewState === 'list') {
      setViewState('folders');
    } else {
      setFolders([...folders, { id: Date.now(), title: 'Book Mark', count: 0 }]);
      toast.success('Added new bookmark folder');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
          {viewState === 'folders' ? 'All Book Marks' : 'Book Marks'}
        </h1>
        <div className="flex items-center gap-4 text-slate-500 text-xs font-bold">
          <button className="flex items-center gap-1.5 hover:text-slate-800 cursor-pointer">
            <span className="font-semibold">Newest</span>
            <span className="text-sm font-extrabold">≡</span>
          </button>
          <button 
            onClick={() => setViewState(viewState === 'list' ? 'folders' : 'list')}
            className={`p-1 transition-colors cursor-pointer ${viewState === 'folders' ? 'text-[#0091ff]' : 'hover:text-slate-800'}`}
            title="Toggle View"
          >
            <span className="text-sm font-extrabold">▤</span>
          </button>
        </div>
      </div>

      <div className="relative w-full">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#8ba3c1]" />
        </span>
        <input
          type="text"
          placeholder="Search bookmarks..."
          className="w-full pl-11 pr-4 py-3 border-none rounded-xl text-sm bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#3f88c5]/30"
        />
      </div>

      {viewState === 'list' && (
        <div className="space-y-6">
          <div>
            <Button size="sm" onClick={handleAddFolder} leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}>
              New Folder
            </Button>
          </div>

          <div className="space-y-4">
            {bookmarkItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-slate-800 hover:text-[#0091ff] cursor-pointer group transition-colors">
                <span className="text-[#264973] font-extrabold text-base group-hover:text-[#0091ff] transition-colors">↗</span>
                <span className="text-sm font-bold text-[#111827] group-hover:text-[#0091ff] transition-colors">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewState === 'folders' && (
        <div className="space-y-6">
          <div className="space-y-4 pt-2">
            {folders.map((f) => (
              <div key={f.id} className="flex items-center gap-5 cursor-pointer group">
                <div className="w-14 h-12 bg-[#d0e3f7] group-hover:bg-[#c1d9f4] rounded-xl flex flex-col justify-between p-2 shadow-2xs transition-colors relative">
                  <span className="text-xs font-extrabold text-[#264973]">📁</span>
                  <span className="text-[10px] font-extrabold text-[#264973] self-end">{f.count}</span>
                </div>
                <span className="text-base font-bold text-[#111827] group-hover:text-[#0091ff] transition-colors">{f.title}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-4">
            <Button size="sm" onClick={handleAddFolder} leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}>
              New Folder
            </Button>
            <button
              onClick={() => setViewState('list')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              View Bookmarks List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
