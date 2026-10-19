import React, { useState } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { ChooseJourneySection } from './ChooseJourneySection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { ComparisonSection } from './ComparisonSection';
import { MobileAppsSection } from './MobileAppsSection';
import { FinalCtaAndFooter } from './FinalCtaAndFooter';
import { DemoModal } from './DemoModal';

export default function LandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Header Navigation */}
      <LandingNavbar onOpenDemo={() => setIsDemoModalOpen(true)} />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 1. Hero Section with Clear LMS Headline & Prominent CTAs */}
        <HeroSection onOpenDemo={() => setIsDemoModalOpen(true)} />

        {/* 2. Choose Your Journey (Student, Educator, Campus ERP, Corporate) */}
        <ChooseJourneySection onOpenDemo={() => setIsDemoModalOpen(true)} />

        {/* 3. Explore Core EduPye Features */}
        <FeaturesSection />

        {/* 4. How EduPye Works (The Connected Ecosystem) */}
        <HowItWorksSection />

        {/* 5. Architectural Comparison (Unified vs Fragmented Tools) */}
        <ComparisonSection />

        {/* 6. Our Mobile Applications: GeniusSpy & EduPay */}
        <MobileAppsSection />
      </main>

      {/* 7. Final Call to Action and Public Footer */}
      <FinalCtaAndFooter onOpenDemo={() => setIsDemoModalOpen(true)} />

      {/* Interactive Institutional Demo Walkthrough Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
