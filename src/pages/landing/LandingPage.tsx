import React, { useState, useEffect } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { ChooseJourneySection } from './ChooseJourneySection';
import { FeaturesSection } from './FeaturesSection';
import { TuitionSection } from './TuitionSection';
import { HowItWorksSection } from './HowItWorksSection';
import { ComparisonSection } from './ComparisonSection';
import { MobileAppsSection } from './MobileAppsSection';
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
  const announcementLinkText = landingContent.announcementBanner?.linkText || siteContent.announcements?.linkText || 'Learn More';
  const announcementLinkUrl = landingContent.announcementBanner?.linkUrl || siteContent.announcements?.linkUrl;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Dynamic Announcement Banner */}
      {showAnnouncement && announcementText && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white py-2 px-4 text-xs sm:text-sm text-center font-medium flex items-center justify-center gap-2 relative z-50 shadow-md">
          <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded-full text-xs">
            {siteContent.announcements?.badge || 'Announcement'}
          </span>
          <span>{announcementText}</span>
          {announcementLinkUrl && (
            <a
              href={announcementLinkUrl}
              className="underline font-semibold hover:text-cyan-200 transition-colors ml-1"
            >
              {announcementLinkText} &rarr;
            </a>
          )}
        </div>
      )}

      {/* Sticky Header Navigation */}
      <LandingNavbar onOpenDemo={() => setIsDemoModalOpen(true)} />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 1. Hero Section with Clear LMS Headline & Prominent CTAs */}
        <HeroSection 
          onOpenDemo={() => setIsDemoModalOpen(true)} 
          content={landingContent.hero || siteContent.hero} 
        />

        {/* 2. Choose Your Journey (Student, Educator, Campus ERP, Corporate) */}
        <ChooseJourneySection onOpenDemo={() => setIsDemoModalOpen(true)} />

        {/* 3. Explore Core EduPye Features */}
        <FeaturesSection dynamicFeatures={landingContent.features} />

        {/* 3.5. Dedicated Centralized Tuition Mode */}
        <TuitionSection content={siteContent.tuitionBanner} />

        {/* 4. How EduPye Works (The Connected Ecosystem) */}
        <HowItWorksSection dynamicSteps={landingContent.howItWorks} />

        {/* 5. Architectural Comparison (Unified vs Fragmented Tools) */}
        <ComparisonSection />

        {/* 6. Our Mobile Applications: GeniusSpy & EduPay */}
        <MobileAppsSection />

        {/* 6.5. Dynamic FAQs Accordion Section */}
        {landingContent.faqs && landingContent.faqs.length > 0 && (
          <section id="faqs" className="py-20 bg-slate-950 relative border-t border-slate-900 overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="text-center space-y-3 mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Everything you need to know.
                </h2>
                <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                  Answers to common questions about EduPye Tuition Mode, AI tutor guardrails, and campus ERP deployment.
                </p>
              </div>

              <div className="space-y-4">
                {landingContent.faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.id || index}
                      className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all duration-200 hover:border-slate-700"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                      >
                        <span className="text-sm sm:text-base font-bold text-slate-100">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                            isOpen ? 'rotate-180 text-blue-400' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
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

      {/* 7. Final Call to Action and Public Footer */}
      <FinalCtaAndFooter 
        onOpenDemo={() => setIsDemoModalOpen(true)} 
        footerContact={landingContent.footerContact}
      />

      {/* Interactive Institutional Demo Walkthrough Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
