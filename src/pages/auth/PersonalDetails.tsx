import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';

export default function PersonalDetails() {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill existing user info if already set
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.dob) setDob(user.dob);
    }
  }, []);

  const handleContinue = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      await authService.savePersonalDetails({
        name: name.trim(),
        phone: phone.trim(),
        dob,
      });
      navigate('/onboarding');
    } catch {
      toast.error('Failed to save personal details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-8 font-sans">
      <header className="w-full flex items-center justify-start pl-4 pt-2">
        <EdupyeLogo className="scale-110" />
      </header>

      <main className="flex-1 flex items-center justify-center py-10">
        <div className="max-w-md w-full space-y-6 text-center animate-in fade-in duration-200">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
              Personal Details
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              Tell us about yourself to set up your profile.
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-4 pt-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full py-3.5"
              >
                Continue
              </Button>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full text-center text-xs font-bold text-slate-400 py-2">
        © 2026 EDUPYE. All rights reserved.
      </footer>
    </div>
  );
}
