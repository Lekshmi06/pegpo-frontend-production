import React, { useEffect, useState } from "react";
import {
  UserCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { tuitionService } from "../../services/tuitionService";
import { TuitionProviderProfile } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { useToast } from "../../hooks/useToast";

export default function TuitionProviderOnboarding() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<TuitionProviderProfile | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [subjectsText, setSubjectsText] = useState("");
  const [classesText, setClassesText] = useState("");
  const [teachingMode, setTeachingMode] = useState<string[]>(["online"]);
  const [availableHours, setAvailableHours] = useState("");
  const [minRate, setMinRate] = useState(500);
  const [maxRate, setMaxRate] = useState(1500);
  const [educationList, setEducationList] = useState<Array<{ degree: string; institution: string; yearOfPassing?: number }>>([
    { degree: "", institution: "" },
  ]);
  const [docList, setDocList] = useState<Array<{ title: string; documentUrl: string }>>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await tuitionService.getMyProviderProfile();
      if (res.profile) {
        setProfile(res.profile);
        setFullName(res.profile.fullName || "");
        setHeadline(res.profile.headline || "");
        setBio(res.profile.bio || "");
        setExperienceYears(res.profile.experienceYears || 1);
        setSubjectsText((res.profile.subjects || []).join(", "));
        setClassesText((res.profile.classesTaught || []).join(", "));
        setTeachingMode(res.profile.teachingMode || ["online"]);
        setAvailableHours(res.profile.availableHours || "");
        setMinRate(res.profile.pricing?.minHourlyRate || 500);
        setMaxRate(res.profile.pricing?.maxHourlyRate || 1500);
        if (res.profile.education?.length) {
          setEducationList(res.profile.education);
        }
        if (res.profile.supportingDocuments?.length) {
          setDocList(res.profile.supportingDocuments.map((d: any) => ({ title: d.title, documentUrl: d.documentUrl })));
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load onboarding info");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = (mode: string) => {
    setTeachingMode((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleAddEducation = () => {
    setEducationList((prev) => [...prev, { degree: "", institution: "" }]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDoc = () => {
    setDocList((prev) => [...prev, { title: "", documentUrl: "" }]);
  };

  const handleRemoveDoc = (index: number) => {
    setDocList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Full name is required");
    const subjects = subjectsText.split(",").map((s) => s.trim()).filter(Boolean);
    const classesTaught = classesText.split(",").map((s) => s.trim()).filter(Boolean);

    if (subjects.length === 0) return toast.error("Please provide at least one subject");
    if (classesTaught.length === 0) return toast.error("Please provide at least one class or level");
    if (teachingMode.length === 0) return toast.error("Please select at least one teaching mode");

    try {
      setSubmitting(true);
      const validEdu = educationList.filter((e) => e.degree.trim() && e.institution.trim());
      const validDocs = docList.filter((d) => d.title.trim() && d.documentUrl.trim());
      const payload = {
        fullName: fullName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        experienceYears: Number(experienceYears),
        subjects,
        classesTaught,
        teachingMode,
        availableHours: availableHours.trim(),
        education: validEdu,
        supportingDocuments: validDocs,
        pricing: {
          minHourlyRate: Number(minRate),
          maxHourlyRate: Number(maxRate),
          currency: "INR",
        },
      };

      const res = await tuitionService.submitOnboarding(payload);
      if (res.success) {
        toast.success("Tuition profile saved and submitted for verification!");
        setProfile(res.profile);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit tuition onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={false} text="Loading Tuition Profile..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Verification Status Header */}
      <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Tuition Provider Verification</h2>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
                profile?.verificationStatus === "verified"
                  ? "bg-emerald-100 text-emerald-800"
                  : profile?.verificationStatus === "rejected"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {profile?.verificationStatus || "NOT SUBMITTED"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {profile?.verificationStatus === "verified"
              ? "Your credentials have been verified by EduPye. Your profile is active on the public marketplace."
              : profile?.verificationStatus === "rejected"
              ? `Verification rejected: ${profile?.verificationNotes || "Please review your credentials."}`
              : "Review will be completed within 24-48 business hours after profile submission."}
          </p>
        </div>

        {profile?.platformTier && (
          <div className="px-3.5 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-center shrink-0">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Platform Tier</span>
            <span className="text-sm font-black text-amber-900">{profile.platformTier.toUpperCase()}</span>
            {profile.tierScore?.totalPoints !== undefined && (
              <span className="text-[10px] font-bold text-slate-600 block">
                {profile.tierScore.totalPoints} pts
              </span>
            )}
            {(profile.isProvisionalTier || profile.tierScore?.isProvisional) && (
              <span className="text-[9px] font-bold text-amber-700 uppercase block">Provisional</span>
            )}
          </div>
        )}
      </div>

      {/* Onboarding Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#0091ff]" />
            <span>Personal & Professional Identity</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">How students will identify you in the marketplace</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Ananya Sharma"
              className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior CBSE & JEE Physics Educator"
              className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Bio & Methodology</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your teaching philosophy, approach to conceptual problem-solving, and student achievements..."
            className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
          />
        </div>

        {/* Education & Qualifications */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#0091ff]" />
                <span>Degrees & Qualifications</span>
              </h3>
              <p className="text-xs text-slate-500">Add relevant undergraduate and postgraduate degrees</p>
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="flex items-center gap-1 text-xs font-bold text-[#0091ff] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Degree</span>
            </button>
          </div>

          <div className="space-y-3">
            {educationList.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-[#f8fafc] p-3 rounded-xl border border-slate-100">
                <input
                  type="text"
                  placeholder="Degree (e.g. M.Sc Physics)"
                  value={edu.degree}
                  onChange={(e) => {
                    const list = [...educationList];
                    list[index].degree = e.target.value;
                    setEducationList(list);
                  }}
                  className="px-3 py-2 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
                />
                <input
                  type="text"
                  placeholder="Institution / University"
                  value={edu.institution}
                  onChange={(e) => {
                    const list = [...educationList];
                    list[index].institution = e.target.value;
                    setEducationList(list);
                  }}
                  className="px-3 py-2 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Year (e.g. 2018)"
                    value={edu.yearOfPassing || ""}
                    onChange={(e) => {
                      const list = [...educationList];
                      list[index].yearOfPassing = Number(e.target.value) || undefined;
                      setEducationList(list);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
                  />
                  {educationList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects & Modes */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0091ff]" />
            <span>Subjects & Pedagogical Modes</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subjects Offered (comma separated) *</label>
              <input
                type="text"
                required
                value={subjectsText}
                onChange={(e) => setSubjectsText(e.target.value)}
                placeholder="Physics, Mechanics, Optics"
                className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Classes / Education Levels *</label>
              <input
                type="text"
                required
                value={classesText}
                onChange={(e) => setClassesText(e.target.value)}
                placeholder="Class 10, Class 11, Class 12, JEE Prep"
                className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Teaching Modes Supported *</label>
              <div className="flex items-center gap-3">
                {["online", "offline", "hybrid"].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={teachingMode.includes(mode)}
                      onChange={() => handleToggleMode(mode)}
                      className="rounded text-[#0091ff] focus:ring-[#0091ff]"
                    />
                    <span className="capitalize">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Supporting Documents & Certifications */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0091ff]" />
                <span>Supporting Documents & Credentials</span>
              </h3>
              <p className="text-xs text-slate-500">Add URLs to degree certificates, ID proof, or teaching portfolio</p>
            </div>
            <button
              type="button"
              onClick={handleAddDoc}
              className="flex items-center gap-1 text-xs font-bold text-[#0091ff] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </button>
          </div>

          <div className="space-y-3">
            {docList.map((doc, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-[#f8fafc] p-3 rounded-xl border border-slate-100">
                <input
                  type="text"
                  placeholder="Document Title (e.g. Master's Degree Certificate)"
                  value={doc.title}
                  onChange={(e) => {
                    const list = [...docList];
                    list[index].title = e.target.value;
                    setDocList(list);
                  }}
                  className="px-3 py-2 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Document URL (https://drive.google.com/...)"
                    value={doc.documentUrl}
                    onChange={(e) => {
                      const list = [...docList];
                      list[index].documentUrl = e.target.value;
                      setDocList(list);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {docList.length === 0 && (
              <p className="text-xs text-slate-400 italic">No supporting documents attached yet.</p>
            )}
          </div>
        </div>

        {/* Pricing & Hours */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#0091ff]" />
            <span>Pricing & Preferred Availability</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Hourly Rate (₹)</label>
              <input
                type="number"
                min={100}
                value={minRate}
                onChange={(e) => setMinRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Hourly Rate (₹)</label>
              <input
                type="number"
                min={100}
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Available Hours</label>
              <input
                type="text"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                placeholder="e.g. Weekdays 5 PM - 9 PM"
                className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0091ff] focus:ring-1 focus:ring-[#0091ff] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving & Submitting..." : "Save & Submit for Verification"}
          </button>
        </div>
      </form>

      {/* Verification Audit History */}
      {profile?.verificationAuditTrail && profile.verificationAuditTrail.length > 0 && (
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0091ff]" />
            <span>Verification Audit History</span>
          </h3>
          <div className="space-y-2">
            {profile.verificationAuditTrail.map((entry: any, i: number) => (
              <div key={i} className="flex items-start justify-between p-3 bg-[#f8fafc] border border-slate-100 rounded-xl text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 uppercase">{entry.status}</span>
                    <span className="text-[11px] text-slate-400">by {entry.decisionBy}</span>
                  </div>
                  {entry.notes && <p className="text-slate-600 mt-1">{entry.notes}</p>}
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(entry.decidedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

