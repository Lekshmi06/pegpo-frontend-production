import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft, Check, ShieldCheck, Info } from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { useToast } from '../../hooks/useToast';

export default function CookieSettings() {
  const toast = useToast();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [preferencesEnabled, setPreferencesEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('edupye_cookie_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnalyticsEnabled(Boolean(parsed.analytics));
        setPreferencesEnabled(Boolean(parsed.preferences));
      }
    } catch {
      // ignore JSON parse error
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        'edupye_cookie_preferences',
        JSON.stringify({
          essential: true,
          analytics: analyticsEnabled,
          preferences: preferencesEnabled,
          savedAt: new Date().toISOString(),
        })
      );
      setIsSaved(true);
      toast.success('Your cookie preferences have been updated.');
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const handleAcceptAll = () => {
    setAnalyticsEnabled(true);
    setPreferencesEnabled(true);
    try {
      localStorage.setItem(
        'edupye_cookie_preferences',
        JSON.stringify({
          essential: true,
          analytics: true,
          preferences: true,
          savedAt: new Date().toISOString(),
        })
      );
      setIsSaved(true);
      toast.success('All cookie preferences accepted.');
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white/95 px-3 py-1.5 rounded-xl">
              <EdupyeLogo className="h-6" />
            </div>
          </Link>
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Cookie Policy & Settings
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
            <Cookie className="w-3.5 h-3.5" />
            <span>Privacy & Storage Preferences</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Cookie Policy & Preferences
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            EduPye uses essential cookies and local storage tokens to manage authenticated sessions, preserve your learning mode preferences, and protect against cross-site request forgery. Customize your preferences below.
          </p>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-4">
          {/* 1. Essential Cookies */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Strictly Essential Cookies & Tokens</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Always Required
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              These cryptographic tokens and session cookies are required for fundamental platform operations, including keeping you logged in securely, maintaining role isolation, and storing active test timers. These cannot be disabled.
            </p>
          </div>

          {/* 2. Functional & Learning Preferences */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Functional & Learning Preferences</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferencesEnabled}
                  onChange={(e) => setPreferencesEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Remembers your selected academic board, dark/light smartboard preferences, active workspace sidebar state, and volume levels for video courses.
            </p>
          </div>

          {/* 3. Analytics & Diagnostics */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cookie className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Anonymous Telemetry & Diagnostics</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Helps us aggregate page load times and identify broken learning paths without linking individual study session data to external tracking networks.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={handleAcceptAll}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Accept All Cookies
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
            <span>Save My Preferences</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} EduPye Inc. All rights reserved. • <Link to="/privacy" className="hover:text-slate-400 underline">Privacy Policy</Link> • <Link to="/terms" className="hover:text-slate-400 underline">Terms of Service</Link>
      </footer>
    </div>
  );
}
