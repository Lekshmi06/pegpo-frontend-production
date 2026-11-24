import React, { useState, useEffect } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { TuitionSection } from './TuitionSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { FinalCtaAndFooter } from './FinalCtaAndFooter';
import { DemoModal } from './DemoModal';
import { 
  contentService, 
  DEFAULT_SITE_CONTENT, 
  DEFAULT_LANDING_CONTENT,
  type SiteContentData,
  type LandingPageContentData 
} from '../../services/contentService';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContentData>(DEFAULT_SITE_CONTENT);
  const [landingContent, setLandingContent] = useState<LandingPageContentData>(DEFAULT_LANDING_CONTENT);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    // Parallel fetch of site content and structured landing CMS content
    Promise.all([
      contentService.getAllContent().then((data) => {
        if (data) setSiteContent(data);
      }),
      contentService.getLandingContent().then((data) => {
        if (data) setLandingContent(data);
      }),
    ]).catch(() => {
      // Defaults already loaded in initial state; zero layout flash
    });
  }, []);

  const showAnnouncement = landingContent.announcementBanner?.enabled ?? siteContent.announcements?.active;
  const announcementText = landingContent.announcementBanner?.text || siteContent.announcements?.message;
  const announcementLinkText = landingContent.announcementBanner?.linkText || siteContent.announcements?.linkText || 'Explore Programs';
  const announcementLinkUrl = landingContent.announcementBanner?.linkUrl || siteContent.announcements?.linkUrl || '/tuition-mode';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors">
      {/* Top Static Announcement Banner */}
      {showAnnouncement && announcementText && (
        <div className="bg-emerald-600 dark:bg-emerald-700 text-white py-2 px-4 text-xs sm:text-sm text-center font-medium flex items-center justify-center gap-2 relative z-50 shadow-2xs">
          <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded-full text-xs">
            {siteContent.announcements?.badge || 'New Term'}
          </span>
          <span>{announcementText}</span>
          {announcementLinkUrl && (
            <a
              href={announcementLinkUrl}
              className="underline font-bold hover:text-emerald-100 transition-colors ml-1"
            >
              {announcementLinkText} &rarr;
            </a>
          )}
        </div>
      )}

      {/* Static Header Navigation (Non-Moving) */}
      <LandingNavbar onOpenDemo={() => setIsDemoModalOpen(true)} />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 1. Bright Split Hero Section & 4-Column Trust Stats Strip */}
        <HeroSection 
          onOpenDemo={() => setIsDemoModalOpen(true)} 
          content={landingContent.hero || siteContent.hero} 
        />

        {/* 2. Dedicated Tuition Programs & Grade Categories Section + Permanent Code Gateway */}
        <TuitionSection content={siteContent.tuitionBanner} />

        {/* 3. Features ("Why EduPye") */}
        <FeaturesSection dynamicFeatures={landingContent.features} />

        {/* 4. 3-Step How It Works & "Become a Tutor" Recruitment Banner */}
        <HowItWorksSection dynamicSteps={landingContent.howItWorks} />

        {/* 5. Clean White FAQs Accordion Section */}
        {landingContent.faqs && landingContent.faqs.length > 0 && (
          <section id="faqs" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-3 mb-12">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-300 dark:border-emerald-700">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  Everything Parents &amp; Students Need to Know
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                  Clear answers about 1-on-1 batch scheduling, mentor matching, SmartBoard tools, and permanent code access.
                </p>
              </div>

              <div className="space-y-3">
                {landingContent.faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.id || index}
                      className="rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                      >
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 6. Final Call to Action & Structured Public Footer */}
      <FinalCtaAndFooter 
        onOpenDemo={() => setIsDemoModalOpen(true)} 
        footerContact={landingContent.footerContact}
      />

      {/* Institutional Demo Walkthrough Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
