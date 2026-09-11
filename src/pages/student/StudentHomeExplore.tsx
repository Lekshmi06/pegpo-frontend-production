import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Trophy } from 'lucide-react';

import userImg from '../../assets/user.png';
import exploreRobot from '../../assets/explore-robot.png';
import explorePaper from '../../assets/explore-paper.png';
import exploreMan from '../../assets/explore-man.png';

export default function StudentHomeExplore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('For You');

  const categories = [
    'For You',
    'Education',
    'Arts,Design & Media',
    'Languages & Literature',
    'History & Archaeology',
    'IT',
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
    <div className="flex-1 flex flex-col min-w-0 h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-[#1c3352] tracking-tight hidden sm:block">
            Explore Courses & Materials
          </h2>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button
            className="p-1 rounded-full hover:bg-slate-100 transition-colors hidden sm:block cursor-pointer"
            title="Language"
          >
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

          <button
            className="p-1 rounded-full hover:bg-slate-100 transition-colors hidden sm:block cursor-pointer"
            title="Achievements"
          >
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

      {/* Main Content Area */}
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
  );
}
