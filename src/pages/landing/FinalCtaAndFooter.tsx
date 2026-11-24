import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  HelpCircle,
  UserPlus
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { publicLinksConfig } from '../../config/publicLinks';
import type { LandingPageContentData } from '../../services/contentService';

interface FinalCtaAndFooterProps {
  onOpenDemo: () => void;
  footerContact?: LandingPageContentData['footerContact'];
}

export const FinalCtaAndFooter: React.FC<FinalCtaAndFooterProps> = ({ onOpenDemo, footerContact }) => {
  const navigate = useNavigate();

  const tagline = footerContact?.tagline || "EduPye provides personalized 1-on-1 and small-batch live online tuition with interactive Dual SmartBoard tools, 24/7 AI practice, and 1-year lecture recordings.";
  const supportEmail = footerContact?.supportEmail || publicLinksConfig.supportEmail;
  const supportPhone = footerContact?.supportPhone || publicLinksConfig.phoneNumbers[0];
  const address = footerContact?.address || "Global Online Operations & Academic Command Center";
  const copyrightText = footerContact?.copyrightText || `© ${new Date().getFullYear()} EduPye Inc. All rights reserved. Personalized Online Tuition & LMS.`;

  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800">
      {/* FINAL CALL TO ACTION BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-12 border border-emerald-500/30 shadow-xs text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Start Your Child's Learning Journey
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
            Ready to experience 1-on-1 personalized tuition?
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Enroll in structured programs, unlock live Dual SmartBoard classes with permanent codes, or apply to join our verified tutor faculty.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/tuition-mode')}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore Tuition Programs</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/become-a-tutor"
              className="px-6 py-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>Be Our Tutor</span>
            </Link>

            <button
              onClick={onOpenDemo}
              className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <span>Book Free Demo</span>
            </button>
          </div>

          <div className="pt-1 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span>Free diagnostic baseline</span>
            <span>&bull;</span>
            <Link to="/login" className="underline hover:text-slate-900 dark:hover:text-white font-semibold">
              Already enrolled? Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER NAVIGATION & DETAILS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Tagline */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="inline-block">
              <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs inline-block">
                <EdupyeLogo className="h-6" />
              </div>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Programs
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/tuition-mode" className="hover:text-emerald-600 transition-colors">
                  Primary Foundation (Grades 1-5)
                </Link>
              </li>
              <li>
                <Link to="/tuition-mode" className="hover:text-emerald-600 transition-colors">
                  Middle School Concept Prep (6-8)
                </Link>
              </li>
              <li>
                <Link to="/tuition-mode" className="hover:text-emerald-600 transition-colors">
                  Board Exam Coaching (9-10 &amp; 11-12)
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-emerald-600 transition-colors">
                  Verified Video Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Careers & Tutors */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Join Us
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/become-a-tutor" className="hover:text-emerald-600 transition-colors font-semibold text-amber-700 dark:text-amber-400">
                  Be Our Tutor (Recruitment)
                </Link>
              </li>
              <li>
                <Link to="/institution" className="hover:text-emerald-600 transition-colors">
                  Campus &amp; ERP Solutions
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-emerald-600 transition-colors">
                  Help Center &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Contact Us
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {supportEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <a href={`mailto:${supportEmail}`} className="hover:underline">
                    {supportEmail}
                  </a>
                </div>
              )}
              {supportPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <a href={`tel:${supportPhone}`} className="hover:underline">
                    {supportPhone}
                  </a>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>{copyrightText}</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            <span>&bull;</span>
            <Link to="/cookies" className="hover:underline">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
