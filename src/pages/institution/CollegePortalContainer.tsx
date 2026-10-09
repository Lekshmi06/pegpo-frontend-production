import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, GraduationCap, ExternalLink, RefreshCw, Maximize2, Minimize2, 
  ShieldCheck, AlertCircle, ArrowLeft, KeyRound, CheckCircle2, Terminal
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';

export default function CollegePortalContainer() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isServerUp, setIsServerUp] = useState<boolean | null>(null);
  const [subPath, setSubPath] = useState('');

  const collegeFrontendUrl = (import.meta as any).env?.VITE_COLLEGE_PORTAL_URL || 'http://localhost:3002';
  const currentUrl = `${collegeFrontendUrl}${subPath}`;

  // Check if College Frontend is accessible
  useEffect(() => {
    let isMounted = true;
    const checkService = async () => {
      try {
        const res = await fetch(collegeFrontendUrl, { mode: 'no-cors' });
        if (isMounted) setIsServerUp(true);
      } catch (err) {
        if (isMounted) setIsServerUp(false);
      }
    };

    checkService();
    const interval = setInterval(checkService, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [collegeFrontendUrl, iframeKey]);

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleQuickNavigate = (path: string) => {
    setSubPath(path);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Header & Breadcrumbs */}
      <header className="bg-slate-800/95 backdrop-blur border-b border-slate-700/80 px-5 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/institution')}
            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Institution Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <EdupyeLogo className="scale-95" />
            <span className="text-slate-500 text-xs">/</span>
            <span 
              onClick={() => navigate('/institution')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            >
              Institution
            </span>
            <span className="text-slate-500 text-xs">/</span>
            <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full text-xs font-bold border border-indigo-500/30">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>College Management System</span>
            </div>
          </div>
        </div>

        {/* Quick Route Shortcuts & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-[11px] font-semibold">
            <button
              onClick={() => handleQuickNavigate('/auth')}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleQuickNavigate('/')}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => handleQuickNavigate('/students')}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Students
            </button>
            <button
              onClick={() => handleQuickNavigate('/faculty')}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Faculty
            </button>
            <button
              onClick={() => handleQuickNavigate('/courses')}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Courses
            </button>
            <button
              onClick={() => handleQuickNavigate('/analytics')}
              className="px-2.5 py-1 rounded-lg text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 transition-colors font-bold cursor-pointer"
            >
              Analytics
            </button>
          </div>

          {/* Service Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-bold">
            <span className={`w-2 h-2 rounded-full ${isServerUp ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className={isServerUp ? 'text-emerald-400' : 'text-amber-400'}>
              {isServerUp ? 'Port 3002 Live' : 'Connecting...'}
            </span>
          </div>

          <button
            onClick={handleReload}
            className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reload College Portal Frame"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Open College Portal in Dedicated Window"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container Area */}
      <div className="flex-1 relative flex flex-col bg-slate-950">
        {isServerUp === false && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                College Frontend service is starting or not yet detected at <code>{collegeFrontendUrl}</code>. Ensure the service is running.
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-700">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>npm run dev:college</span>
            </div>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={currentUrl}
          title="EduPye College Management System (CampusIQ)"
          className="w-full flex-1 border-0"
          style={{ height: isFullscreen ? 'calc(100vh - 56px)' : 'calc(100vh - 65px)' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />

        {/* Floating Quick Credentials Bar for Testing */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-700 p-2.5 rounded-xl text-[11px] text-slate-300 shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Test Logins:</span>
          </div>
          <div>
            <span className="font-semibold text-slate-200">Admin: </span>
            <code className="text-emerald-400">demo.admin@campusiq.demo</code> / <code className="text-emerald-400">CampusIQ@Demo2026</code>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div>
            <span className="font-semibold text-slate-200">Faculty: </span>
            <code className="text-emerald-400">demo.faculty@campusiq.demo</code> / <code className="text-emerald-400">CampusIQ@Demo2026</code>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div>
            <span className="font-semibold text-slate-200">Student: </span>
            <code className="text-emerald-400">demo.student@campusiq.demo</code> / <code className="text-emerald-400">CampusIQ@Demo2026</code>
          </div>
        </div>
      </div>
    </div>
  );
}
