import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle, CheckCircle, Scale, Shield } from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { publicLinksConfig } from '../../config/publicLinks';

export default function TermsOfService() {
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
            Terms of Service
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Notice of Legal Review */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex items-start gap-3.5 text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <div className="font-bold text-amber-300">
              Notice: Enterprise Terms & Agreements Under Review
            </div>
            <p className="text-amber-200/90 leading-relaxed">
              Official Master Services Agreements (MSA) and formal terms for institutional deployments are pending final legal and compliance sign-off.
              The summary below outlines the operational acceptable use standards and platform rules governing EduPye users.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>EduPye Platform Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms & Conditions of Service
          </h1>
          <p className="text-xs text-slate-400">
            Effective Date: October 2026 • Status: Pending Institutional Approval
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or creating an account on the EduPye platform, users agree to be bound by platform security policies, role authorization guidelines, and community safety expectations.
            </p>
          </section>

          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              2. Acceptable Use & Academic Integrity
            </h2>
            <p>
              EduPye is designed to empower genuine educational discovery and pedagogical instruction. Users agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
              <li>Use AI study tools for comprehension, practice, and skill reinforcement rather than unauthorized test exploitation.</li>
              <li>Respect intellectual property rights when uploading curriculum textbooks, question banks, or presentation slides.</li>
              <li>Maintain the confidentiality of login credentials and session keys; sharing administrative credentials across unauthorized individuals is strictly prohibited.</li>
            </ul>
          </section>

          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              3. Institutional & Campus Deployments
            </h2>
            <p>
              Institutions deploying EduPye for campus ERP, student information management, and faculty command tools are subject to institutional service level agreements (SLAs), dedicated tenant partitioning, and localized data governance addenda.
            </p>
          </section>

          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              4. Contact & Inquiries
            </h2>
            <p>
              For legal inquiries, copyright claims, or enterprise licensing agreements, please write to:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Email: <a href={`mailto:${publicLinksConfig.enterpriseEmail}`} className="text-blue-400 underline">{publicLinksConfig.enterpriseEmail}</a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} EduPye Inc. All rights reserved. • <Link to="/privacy" className="hover:text-slate-400 underline">Privacy Policy</Link> • <Link to="/cookies" className="hover:text-slate-400 underline">Cookie Settings</Link>
      </footer>
    </div>
  );
}
