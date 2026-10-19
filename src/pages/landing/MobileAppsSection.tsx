import React, { useState } from 'react';
import { 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Bell, 
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { mobileAppsConfig, MobileAppConfig } from '../../config/mobileApps';
import { useToast } from '../../hooks/useToast';

export const MobileAppsSection: React.FC = () => {
  const toast = useToast();
  const [notifiedAppId, setNotifiedAppId] = useState<string | null>(null);

  const handleNotify = (app: MobileAppConfig) => {
    setNotifiedAppId(app.id);
    toast.info(
      `You're on the early access priority list for ${app.name}! We'll notify you once store links are approved.`,
      'Early Access Notification'
    );
  };

  return (
    <section id="mobile-apps" className="py-24 bg-slate-950 relative border-t border-slate-900 overflow-hidden">
      {/* Background radial accent glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold shadow-md">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>EduPye on Mobile</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Our Mobile Applications
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Experience EduPye on iOS and Android. Extend personalized AI diagnostic learning, smart flashcards, and instant campus tuition transactions wherever you go.
          </p>
        </div>

        {/* 2 Featured Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {mobileAppsConfig.map((app) => {
            const isGeniusSpy = app.id === 'genius-spy';

            return (
              <div
                key={app.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 p-7 sm:p-9 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all duration-300"
              >
                {/* Top Subtle Gradient Edge */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${app.badgeGradient}`}
                />

                <div className="space-y-6">
                  {/* App Header & Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-tr ${app.badgeGradient} shrink-0`}
                      >
                        <Smartphone className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                          {app.name}
                        </h3>
                        <div className="text-xs font-semibold text-slate-400 mt-0.5">
                          {app.category}
                        </div>
                      </div>
                    </div>

                    {/* Official Status Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-800 text-amber-300 border border-amber-500/30 shrink-0">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Store Review
                    </span>
                  </div>

                  {/* Tagline & Description */}
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-slate-200">
                      {app.tagline}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  {/* Verified Capabilities */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Key Capabilities:
                    </div>
                    <ul className="space-y-2">
                      {app.keyFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isGeniusSpy ? 'text-blue-400' : 'text-emerald-400'
                            }`}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* App Store Availability & Action Section */}
                <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
                  {/* Configuration Notice */}
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center gap-2.5 text-slate-400 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Official store release awaiting approval.{' '}
                      <span className="text-slate-500 font-mono text-[11px]">
                        (Target: Google Play & Apple App Store)
                      </span>
                    </span>
                  </div>

                  {/* Actions Matrix */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleNotify(app)}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {notifiedAppId === app.id ? 'Notification Requested' : 'Notify on Release'}
                      </span>
                    </button>

                    {/* Pre-configured Placeholder Badges */}
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 cursor-not-allowed select-none"
                        title="Apple App Store link awaiting production approval"
                      >
                        iOS Pending
                      </span>
                      <span
                        className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 cursor-not-allowed select-none"
                        title="Google Play Store link awaiting production approval"
                      >
                        Android Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Update Configuration Note */}
        <div className="mt-12 text-center text-xs text-slate-500 max-w-lg mx-auto">
          Need beta access or enterprise enterprise distribution for your campus?{' '}
          <a
            href="mailto:support@edupye.com?subject=EduPye%20Mobile%20Applications%20Beta%20Inquiry"
            className="text-blue-400 hover:text-blue-300 underline font-semibold"
          >
            Contact our mobile development team
          </a>
        </div>
      </div>
    </section>
  );
};
