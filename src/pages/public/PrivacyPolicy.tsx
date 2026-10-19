import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, AlertCircle, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { publicLinksConfig } from '../../config/publicLinks';

export default function PrivacyPolicy() {
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
            Privacy Policy
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
              Notice: Legal Policy Review Pending
            </div>
            <p className="text-amber-200/90 leading-relaxed">
              Formal organizational and jurisdictional legal terms are currently undergoing review by institutional legal counsel. 
              The architectural summary below outlines the current technical privacy safeguards, cryptographic protections, and data minimization protocols implemented across the EduPye platform.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>EduPye Platform Privacy Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy & Data Protection Overview
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: October 2026 • Status: Pending Institutional Approval
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              1. Information We Collect
            </h2>
            <p>
              EduPye collects only information essential for delivering personalized learning experiences, executing role-based instructional workflows, and administering institutional campus portals:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
              <li><strong className="text-white">Account Identification:</strong> Name, verified institutional or personal email, selected educational path, and encrypted authentication credentials.</li>
              <li><strong className="text-white">Academic Telemetry:</strong> Study session duration, mock test responses, quiz scores, and subject mastery indicators needed for diagnostic AI recommendations.</li>
              <li><strong className="text-white">Instructional Artifacts:</strong> Whiteboard canvases, lesson plans, teacher rubrics, and research citations created inside dedicated workspaces.</li>
              <li><strong className="text-white">Campus Administrative Records:</strong> When enrolled through an affiliated school or college, attendance records and fee schedules are processed strictly under institutional control.</li>
            </ul>
          </section>

          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              2. Technical Security & Encryption Standards
            </h2>
            <p>
              We enforce multi-layer cryptographic and authorization controls to guarantee zero unauthorized cross-tenant leakage:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
              <li><strong className="text-white">Transport Encryption:</strong> All client-server and inter-service communications enforce TLS 1.3 encryption.</li>
              <li><strong className="text-white">Role-Based Access Control (RBAC):</strong> Student, educator, researcher, and administrator spaces are isolated via cryptographic session tokens.</li>
              <li><strong className="text-white">Single Sign-On Integrity:</strong> Institutional SSO launches use short-lived, digitally signed JWT credentials with explicit audience constraints.</li>
            </ul>
          </section>

          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              3. Regulatory & Institutional Standards
            </h2>
            <p>
              EduPye is engineered in compliance with key international and educational data standards:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-white text-xs">FERPA Compliance</div>
                <div className="text-[11px] text-slate-400 mt-1">Student education records remain under parental/eligible student privacy governance.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-white text-xs">GDPR / Data Minimization</div>
                <div className="text-[11px] text-slate-400 mt-1">Users maintain rights to access, export, or request deletion of their personal learning logs.</div>
              </div>
            </div>
          </section>

          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              4. Data Inquiries & Privacy Contact
            </h2>
            <p>
              For privacy verification requests, data deletion inquiries, or institutional compliance verification, please contact our Data Protection Officer:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Email: <a href={`mailto:${publicLinksConfig.supportEmail}`} className="text-blue-400 underline">{publicLinksConfig.supportEmail}</a> (Subject: Data Privacy & Protection Inquiry)
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} EduPye Inc. All rights reserved. • <Link to="/terms" className="hover:text-slate-400 underline">Terms of Service</Link> • <Link to="/cookies" className="hover:text-slate-400 underline">Cookie Settings</Link>
      </footer>
    </div>
  );
}
