import React, { useState } from 'react';
import { User, Mail, Phone, Globe, MapPin, Languages, Camera } from 'lucide-react';
import { BasicInformationData } from '../../../../types/researcher';
import { Input } from '../../../../components/ui/Input';

interface BasicInformationProps {
  initialData: BasicInformationData;
  onSave: (data: BasicInformationData) => void;
}

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Chinese',
  'Japanese',
  'Arabic',
  'Portuguese',
  'Russian',
];

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'Other',
];

export const BasicInformation: React.FC<BasicInformationProps> = ({
  initialData,
  onSave,
}) => {
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [profileImage, setProfileImage] = useState(initialData.profileImage || '');
  const [email] = useState(initialData.email || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [country, setCountry] = useState(initialData.country || 'India');
  const [state, setState] = useState(initialData.state || '');
  const [preferredLanguage, setPreferredLanguage] = useState(
    initialData.preferredLanguage || 'English'
  );
  const [errors, setErrors] = useState<{ fullName?: string }>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrors({ fullName: 'Full name is required' });
      return;
    }
    setErrors({});
    onSave({
      fullName: fullName.trim(),
      profileImage,
      email,
      phone: phone.trim(),
      country,
      state: state.trim(),
      preferredLanguage,
    });
  };

  return (
    <form id="step-form" onSubmit={handleNext} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Basic Personal Details
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Start by setting up your primary researcher identity. Existing account info has been pre-filled.
        </p>
      </div>

      {/* Profile Avatar Upload */}
      <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#f8fbfe] border border-blue-100">
        <div className="relative">
          <div className="w-18 h-18 rounded-2xl bg-white border-2 border-blue-200 overflow-hidden flex items-center justify-center shadow-xs">
            {profileImage ? (
              <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-[#006bbd]" />
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#0091ff] hover:bg-[#007cdb] text-white cursor-pointer shadow-sm transition-transform active:scale-95">
            <Camera className="w-3.5 h-3.5" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800">Profile Photo (Optional)</h4>
          <p className="text-[11px] text-slate-500">
            JPG, PNG or GIF. Recommended size 400x400.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({});
              }}
              placeholder="e.g. Dr. Eleanor Vance"
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.fullName ? 'border-rose-400' : 'border-blue-200'
              } rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs`}
            />
          </div>
          {errors.fullName && (
            <p className="text-[11px] font-semibold text-rose-500 pl-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Email Address <span className="text-slate-400 font-normal">(Verified)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              disabled
              value={email}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-100 text-xs font-semibold text-slate-500 outline-none cursor-not-allowed shadow-2xs"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            />
          </div>
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Country <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full pl-10 pr-9 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>

        {/* State/Region */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            State / Region <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. California, Kerala, London"
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            />
          </div>
        </div>

        {/* Preferred Language */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            Preferred Language for Research AI
          </label>
          <div className="relative">
            <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full pl-10 pr-9 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>
      </div>
    </form>
  );
};
