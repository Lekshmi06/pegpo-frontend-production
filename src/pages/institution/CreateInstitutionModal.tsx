import React, { useState, useEffect } from 'react';
import { X, Building2, Briefcase, GraduationCap, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import { InstitutionType } from '../../types/institution';

interface CreateInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateInstitutionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInstitutionModalProps) {
  const [name, setName] = useState('');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('company');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setContactEmail('');
      setContactPhone('');
      setWebsite('');
      setCity('');
      setCountry('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Institution name is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await institutionService.createInstitution({
        name: name.trim(),
        institutionType,
        description: description.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        website: website.trim() || undefined,
        address: {
          city: city.trim() || undefined,
          country: country.trim() || undefined,
        },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create institution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create New Institution</h2>
              <p className="text-xs text-slate-500">Configure your organization or training academy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Institution Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Tech Academy, Apex Corporate Training"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Institution Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'company', label: 'Company / Corporate', icon: Briefcase },
                { id: 'training_institute', label: 'Training Institute', icon: Building2 },
                { id: 'college', label: 'College / University', icon: GraduationCap },
                { id: 'school', label: 'School', icon: BookOpen },
                { id: 'coaching_centre', label: 'Coaching Centre', icon: Building2 },
                { id: 'other', label: 'Other', icon: Building2 },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = institutionType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setInstitutionType(opt.id as InstitutionType)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief overview of programs, training goals, or academic focus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="admin@academy.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website</label>
              <input
                type="url"
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
