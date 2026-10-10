import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { institutionService } from '../../services/institutionService';
import { useToast } from '../../hooks/useToast';

const INDUSTRIES = [
  'Technology & Software',
  'Financial Services & Banking',
  'Healthcare, Biotech & Pharma',
  'Manufacturing & Supply Chain',
  'Retail, Consumer Goods & E-Commerce',
  'Professional Consulting & Legal',
  'Telecommunications & Media',
  'Energy, Utilities & Renewables',
  'Education, Training & EdTech',
  'Hospitality & Tourism',
  'Government & Public Sector',
  'Other / Specialized Industry',
];

const COMPANY_SIZES = [
  '1–50 employees',
  '51–200 employees',
  '201–500 employees',
  '501–1,000 employees',
  '1,000+ employees',
];

const ADMIN_ROLES = [
  'Head of People / Human Resources',
  'Chief Learning Officer / VP Talent',
  'Corporate Training Director',
  'HR Business Partner (HRBP)',
  'Chief Technology Officer / VP Eng',
  'Founder / Chief Executive Officer',
  'Operations Director',
  'Team Lead / Department Manager',
];

export default function CompanyOnboarding() {
  const navigate = useNavigate();
  const toast = useToast();

  const currentUser = authService.getCurrentUser();

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [companySize, setCompanySize] = useState(COMPANY_SIZES[0]);
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Admin details (reusing existing user profile)
  const [adminName, setAdminName] = useState(currentUser?.name || '');
  const [adminEmail, setAdminEmail] = useState(currentUser?.email || '');
  const [adminPhone, setAdminPhone] = useState(currentUser?.phone || '');
  const [adminTitle, setAdminTitle] = useState(ADMIN_ROLES[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !adminName) setAdminName(currentUser.name);
      if (currentUser.email && !adminEmail) setAdminEmail(currentUser.email);
      if (currentUser.phone && !adminPhone) setAdminPhone(currentUser.phone);
    }
  }, [currentUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!companyName.trim()) {
      setErrorMessage('Please provide your Company / Organization name.');
      toast.error('Company name is required');
      return;
    }

    if (!adminName.trim()) {
      setErrorMessage('Please provide the Administrator full name.');
      toast.error('Administrator name is required');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: companyName.trim(),
        institutionType: 'company' as const,
        description: description.trim() || `${companyName.trim()} Corporate Learning & Workforce Academy`,
        website: website.trim() || undefined,
        contactEmail: adminEmail.trim().toLowerCase() || currentUser?.email,
        contactPhone: adminPhone.trim() || undefined,
        settings: {
          allowMemberInvites: true,
          defaultBatchNaming: 'Training Cohort',
          industryOrField: industry,
          companySize,
        },
        adminTitle: adminTitle.trim() || 'Company Administrator',
      };

      const result = await institutionService.createInstitution(payload);

      if (result && result.institution) {
        // Store as active institution in local session
        localStorage.setItem('activeInstitutionId', result.institution._id);
        localStorage.setItem('userRole', 'company');

        // Update local user session if name was updated
        if (currentUser && adminName.trim() !== currentUser.name) {
          currentUser.name = adminName.trim();
          localStorage.setItem('authUser', JSON.stringify(currentUser));
        }

        toast.success(`Welcome to ${result.institution.name}! Corporate workspace created.`);
        navigate('/institution/portal/dashboard');
      } else {
        throw new Error('Could not establish corporate workspace.');
      }
    } catch (err: any) {
      const errorText =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to set up company workspace. Please try again.';

      setErrorMessage(errorText);
      toast.error(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2 pb-4">
        <EdupyeLogo className="scale-105" />
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Enterprise Tenant Isolation</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8">
        <div className="max-w-2xl w-full space-y-6">
          {/* Step Banner & Headline */}
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-black uppercase tracking-wider">
              Step 2 of 2 · Company Setup
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Set Up Your Company Workspace
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-lg mx-auto">
              Configure your organization to onboard employees, structure departments, and assign learning paths.
            </p>
          </div>

          {/* Value Props Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">Workforce Hub</div>
                <div className="text-[10px] text-slate-500 truncate">Employee roster & teams</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">LMS Bundles</div>
                <div className="text-[10px] text-slate-500 truncate">Auto-provisioned courses</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">Live Analytics</div>
                <div className="text-[10px] text-slate-500 truncate">Workforce velocity & KPIs</div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
          >
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Company Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Organization Information
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Company / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Innovations Inc."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Primary Industry <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-slate-900 outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs cursor-pointer"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Company Size <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-slate-900 outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs cursor-pointer"
                  >
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Company Website (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mission or Learning Objectives (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of company focus or training priorities..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs transition-all resize-none"
                />
              </div>
            </div>

            {/* Section 2: Administrator Profile */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Company Administrator Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Administrator Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Your Role / Job Title <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-slate-900 outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs cursor-pointer"
                  >
                    {ADMIN_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      readOnly
                      value={adminEmail}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-xs font-bold text-slate-500 outline-none cursor-not-allowed shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-white text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Back to Role Selection
              </button>

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="px-8 py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Complete Company Setup</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center text-xs font-bold text-slate-400 py-2">
        © 2026 EDUPYE. All rights reserved. Enterprise Corporate Learning.
      </footer>
    </div>
  );
}
