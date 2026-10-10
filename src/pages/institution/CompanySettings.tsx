import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Settings,
  Building2,
  Mail,
  Phone,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import { IInstitution, IInstitutionMembership } from '../../types/institution';

interface OutletContextType {
  currentInst: IInstitution | null;
  currentMembership: IInstitutionMembership | null;
  reloadInstitutions: () => Promise<void>;
}

export default function CompanySettings() {
  const { currentInst, currentMembership, reloadInstitutions } =
    useOutletContext<OutletContextType>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [defaultBatchNaming, setDefaultBatchNaming] = useState('Training Cohort');
  const [industryOrField, setIndustryOrField] = useState('');
  const [allowMemberInvites, setAllowMemberInvites] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = currentMembership?.role === 'admin';

  useEffect(() => {
    if (currentInst) {
      setName(currentInst.name || '');
      setDescription(currentInst.description || '');
      setContactEmail(currentInst.contactEmail || '');
      setContactPhone(currentInst.contactPhone || '');
      setWebsite(currentInst.website || '');
      setDefaultBatchNaming(currentInst.settings?.defaultBatchNaming || 'Training Cohort');
      setIndustryOrField(currentInst.settings?.industryOrField || '');
      setAllowMemberInvites(
        currentInst.settings?.allowMemberInvites !== undefined
          ? currentInst.settings.allowMemberInvites
          : true
      );
    }
  }, [currentInst]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInst) return;
    if (!isAdmin) {
      setErrorMsg('Only Company Administrators can update organization settings.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      await institutionService.updateInstitution(currentInst._id, {
        name: name.trim(),
        description: description.trim() || undefined,
        contactEmail: contactEmail.trim().toLowerCase() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        website: website.trim() || undefined,
      });

      await reloadInstitutions();
      setSuccessMsg('Company settings saved successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update company settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit border border-blue-200 mb-2">
            <Settings className="w-3.5 h-3.5" />
            Configuration & Branding
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Company Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your corporate profile, training defaults, and member permission settings.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Organization Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                About / Description
              </label>
              <textarea
                rows={3}
                disabled={!isAdmin}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                disabled={!isAdmin}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                disabled={!isAdmin}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Website URL
              </label>
              <input
                type="url"
                disabled={!isAdmin}
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Training & Onboarding Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            LMS & Onboarding Configurations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Default Cohort Terminology
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="Training Cohort, Batch, Class"
                value={defaultBatchNaming}
                onChange={(e) => setDefaultBatchNaming(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Industry / Sector
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="e.g. Technology, Healthcare, Finance"
                value={industryOrField}
                onChange={(e) => setIndustryOrField(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
