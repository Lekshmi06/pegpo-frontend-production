import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Trophy } from 'lucide-react';

import userImg from '../../assets/user.png';
import exploreRobot from '../../assets/explore-robot.png';
import explorePaper from '../../assets/explore-paper.png';
import exploreMan from '../../assets/explore-man.png';

export default function StudentHomeExplore() {
  const navigate = useNavigate();
  const [board, setBoard] = useState('CBSE');
  const [cbseClass, setCbseClass] = useState('Class 9');
  const [activeCategory, setActiveCategory] = useState('For You');
  const [activeSubTab, setActiveSubTab] = useState('Subject');

  const categories = [
    'For You',
    'Education',
    'Arts,Design & Media',
    'Languages & Literature',
    'History & Archaeology',
    'IT',
  ];

  const subSidebarItems = [
    'Subject',
    'Practice',
    'Test',
    'Quiz',
    'History',
    'Search',
    'Game',
    'Home Work',
    'Assignment',
    'Tuition',
    'Combine Study',
  ];

  const exploreCards = [
    { id: 1, title: 'Artificial Intelligence', date: '2 Months ago', sections: 20, img: exploreRobot },
    { id: 2, title: 'Artificial Intelligence', date: '2 Months ago', sections: 20, img: explorePaper },
    { id: 3, title: 'Artificial Intelligence', date: '2 Months ago', sections: 20, img: exploreMan },
    { id: 4, title: 'Artificial Intelligence', date: '2 Months ago', sections: 20, img: exploreRobot },
    { id: 5, title: 'Artificial Intelligence', date: '2 Months ago', sections: 20, img: explorePaper },
    { id: 6, title: 'Artificial Intelligence', date: '2 Months ago', sections: 20, img: exploreMan },
  ];

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      <aside className="w-44 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto hidden sm:flex">
        <div className="h-14 flex items-center px-4 flex-shrink-0">
          <span className="text-xs font-extrabold text-[#1c3352] tracking-wide">
            Learn
          </span>
        </div>

        <div className="px-2 space-y-1.5 pb-4">
          {subSidebarItems.map((item) => {
            const isActive = activeSubTab === item;
            return (
              <button
                key={item}
                onClick={() => {
                  setActiveSubTab(item);
                  if (item === 'Subject') {
                    navigate('/student/learn');
                  }
                }}
                className={`h-9 w-full text-left px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0091ff] shadow-xs'
                    : 'text-[#1c3352] hover:bg-white/40'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="bg-[#d8eaf8] text-[#1c3352] text-xs font-extrabold px-3.5 py-2 rounded-xl border-none outline-none cursor-pointer appearance-none pr-7 shadow-2xs"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State">State Board</option>
              </select>
              <span className="absolute right-2.5 top-2.5 text-[10px] text-[#1c3352] pointer-events-none font-bold">∨</span>
            </div>

            <div className="relative">
              <select
                value={cbseClass}
                onChange={(e) => setCbseClass(e.target.value)}
                className="bg-[#d8eaf8] text-[#1c3352] text-xs font-extrabold px-3.5 py-2 rounded-xl border-none outline-none cursor-pointer appearance-none pr-7 shadow-2xs"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
              <span className="absolute right-2.5 top-2.5 text-[10px] text-[#1c3352] pointer-events-none font-bold">∨</span>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-1 rounded-full hover:bg-slate-100 transition-colors hidden sm:block">
              <Globe className="w-6 h-6 text-[#1c3352] stroke-[2.2]" />
            </button>

            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button className="p-1 rounded-full hover:bg-slate-100 transition-colors hidden sm:block">
              <Trophy className="w-6 h-6 text-[#1c3352] stroke-[2.2]" />
            </button>

            <div className="relative">
              <button
                onClick={() => navigate('/student/profile')}
                className="flex items-center gap-2 focus:outline-none cursor-pointer hover:ring-2 hover:ring-[#0091ff]/30 rounded-full transition-all"
                title="Student Profile"
              >
                <img
                  src={userImg}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#d0e3f7] hover:border-[#1c3352] transition-all shadow-2xs cursor-pointer"
                />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#f8fbfe]">
          <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
                Explore
              </h1>
              <button className="text-xs font-bold text-[#111827] hover:underline cursor-pointer">
                View all
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#4392e6] text-white shadow-xs'
                        : 'bg-white border border-[#cbd5e1]/60 text-[#111827] hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
              {exploreCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 border border-[#e2ebf4]/60 bg-white"
                  onClick={() => navigate('/student/learn')}
                >
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-auto object-contain group-hover:scale-[1.01] transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
