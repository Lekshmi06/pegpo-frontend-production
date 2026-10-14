import React, { useState } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { ChooseJourneySection } from './ChooseJourneySection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { ComparisonSection } from './ComparisonSection';
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
        {/* 1. Hero Section with Interactive Dashboard Visual */}
        <HeroSection onOpenDemo={() => setIsDemoModalOpen(true)} />

        {/* 2. Choose Your Journey (4 Entry Points) */}
        <ChooseJourneySection onOpenDemo={() => setIsDemoModalOpen(true)} />

        {/* 3. Explore EduPye Features (7 Core Pillars) */}
        <FeaturesSection />

        {/* 4. How EduPye Works (The Connected Platform) */}
        <HowItWorksSection />

        {/* 5. Architectural Comparison (Why EduPye vs Fragmented Point Tools) */}
        <ComparisonSection />
      </main>

      {/* 6. Final Call to Action and SaaS Footer */}
      <FinalCtaAndFooter onOpenDemo={() => setIsDemoModalOpen(true)} />

      {/* Interactive Institutional Demo Walkthrough Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
