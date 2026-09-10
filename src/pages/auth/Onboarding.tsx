import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';

type UserRole = 'Institution' | 'Student' | 'Teacher' | 'Researcher' | 'Work' | 'Personal';

const goalOptions: Record<UserRole, string[]> = {
  Institution: ['School', 'Collage', 'University', 'Skill Development', 'Department', 'Others'],
  Student: ['School', 'Graduation', 'Post Graduation', 'Professional Course', 'Get a Coures', 'Prepare for Exam', 'Get a Certificate', 'Other Study'],
  Teacher: ['Lesson Planning', 'Improve Profession', 'Update Knowledge', 'Higher Study', 'Engage Students', 'Conduct a Class', 'Tuition', 'Other'],
  Researcher: ['A co pillot', 'PHD', 'Thisease prepation', 'Post Doctoral', 'Fellowship', 'Guide', 'Other'],
  Work: ['Explore Hobby', 'Improve My sell', 'Learn for curiosity', 'A mature learn', 'Research freelance', 'Other goals'],
  Personal: ['Skill enhancement', 'Career development', 'Get a Course', 'Get a Certificate', 'Competitive exam', 'Other goals'],
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('Institution');
  const [goal, setGoal] = useState<string>('School');
  const [language, setLanguage] = useState<string>('Select');

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value as UserRole;
    setRole(selectedRole);
    setGoal(goalOptions[selectedRole]?.[0] || '');
  };

  const handleContinue = () => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userGoal', goal);
    localStorage.setItem('userLanguage', language);

    authService.updateCurrentUser({
      role: role.toLowerCase() as any,
      goal,
      language: language === 'Select' ? 'English' : language,
    });

    if (role === 'Teacher' || role === 'Institution') {
      navigate('/teacher');
    } else if (role === 'Researcher') {
      navigate('/research');
    } else if (role === 'Student' && goal === 'School') {
      navigate('/onboarding/school');
    } else {
      navigate('/student/home');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-8 font-sans">
      <header className="w-full flex items-center justify-start pl-4 pt-2">
        <EdupyeLogo className="scale-110" />
      </header>

      <main className="flex-1 flex items-center justify-center py-10">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
              Lets start Edupy
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              Let's get you learning journey started.
            </p>
          </div>

          <div className="space-y-4 pt-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">I am a</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
                >
                  <option value="Institution">Institution</option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">▼</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Goal</label>
              <div className="relative">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
                >
                  {goalOptions[role]?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">▼</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Language</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
                >
                  <option value="Select">Select</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">▼</div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="button" onClick={handleContinue} className="w-full py-3.5">
                Continue
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full text-center text-xs font-bold text-slate-400 py-2">
        © 2026 EDUPYE. All rights reserved.
      </footer>
    </div>
  );
}
