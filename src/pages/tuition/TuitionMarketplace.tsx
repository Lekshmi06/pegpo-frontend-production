import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Compass,
  ArrowRight,
  CheckCircle,
  SlidersHorizontal,
  X,
  Layers,
  Calendar,
  Clock,
  Users,
  Eye,
} from "lucide-react";
import userImg from "../../assets/user.png";
import { tuitionService } from "../../services/tuitionService";
import { TuitionProviderProfile, TuitionOffering, TuitionPlatformTier } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../hooks/useToast";

export default function TuitionMarketplace() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  // Discovery Mode: Offerings vs Providers
  const [viewMode, setViewMode] = useState<"offerings" | "providers">("offerings");

  // Data states
  const [offerings, setOfferings] = useState<TuitionOffering[]>([]);
  const [providers, setProviders] = useState<TuitionProviderProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedClassLevel, setSelectedClassLevel] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");
  const [minFee, setMinFee] = useState<number | undefined>(undefined);
  const [maxFee, setMaxFee] = useState<number | undefined>(undefined);
  const [selectedTier, setSelectedTier] = useState("All");
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [minExperience, setMinExperience] = useState<number | undefined>(undefined);
  const [selectedQualification, setSelectedQualification] = useState("All");

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedOfferingModal, setSelectedOfferingModal] = useState<TuitionOffering | null>(null);

  const daysList = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchMarketplace();
  }, [
    viewMode,
    selectedSubject,
    selectedClassLevel,
    selectedMode,
    selectedFormat,
    selectedDay,
    selectedTier,
    minRating,
    minExperience,
    selectedQualification,
  ]);

  const fetchMarketplace = async () => {
    try {
      setLoading(true);

      if (viewMode === "offerings") {
        const res = await tuitionService.searchOfferings({
          search: searchTerm || undefined,
          subject: selectedSubject !== "All" ? selectedSubject : undefined,
          classLevel: selectedClassLevel !== "All" ? selectedClassLevel : undefined,
          teachingMode: selectedMode !== "All" ? selectedMode : undefined,
          classFormat: selectedFormat !== "All" ? selectedFormat : undefined,
          minFee: minFee,
          maxFee: maxFee,
          day: selectedDay !== "All" ? selectedDay : undefined,
          tier: selectedTier !== "All" ? selectedTier : undefined,
          minRating,
          minExperience,
          qualification: selectedQualification !== "All" ? selectedQualification : undefined,
          page: 1,
          limit: 24,
        });

        if (res.success) {
          setOfferings(res.offerings || []);
          setTotalCount(res.pagination?.total || 0);
        }
      } else {
        const res = await tuitionService.searchProviders({
          search: searchTerm || undefined,
          subject: selectedSubject !== "All" ? selectedSubject : undefined,
          classLevel: selectedClassLevel !== "All" ? selectedClassLevel : undefined,
          teachingMode: selectedMode !== "All" ? selectedMode : undefined,
          classFormat: selectedFormat !== "All" ? selectedFormat : undefined,
          tier: selectedTier !== "All" ? selectedTier : undefined,
          minRating,
          maxFee,
          minExperience,
          qualification: selectedQualification !== "All" ? selectedQualification : undefined,
          page: 1,
          limit: 20,
        });

        if (res.success) {
          setProviders(res.providers || []);
          setTotalCount(res.pagination?.total || 0);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load tuition marketplace");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketplace();
  };

  const handleResetFilters = () => {
    setSelectedSubject("All");
    setSelectedClassLevel("All");
    setSelectedMode("All");
    setSelectedFormat("All");
    setSelectedDay("All");
    setMinFee(undefined);
    setMaxFee(undefined);
    setSelectedTier("All");
    setMinRating(undefined);
    setMinExperience(undefined);
    setSelectedQualification("All");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] font-sans pb-16">
      {/* Hero Header */}
      <section className="bg-[#1c3352] text-white py-12 px-4 sm:px-8 border-b border-[#2d4970]">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#254266] text-[#62b2fd] rounded-full text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>EduPye Verified Tuition Marketplace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Discover Verified Tuition Offerings & Expert Mentors
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Learn from credential-verified school teachers, university professors, and subject specialists.
            Explore structured batches, 1:1 mentorship slots, and interactive SmartBoard classrooms.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-3xl flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by offering title, syllabus, subject, tutor name (e.g. Physics, Class 12, JEE)..."
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-800 text-xs sm:text-sm rounded-xl focus:outline-none shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Mode Switcher Buttons */}
          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("offerings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === "offerings"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "bg-[#254266] text-slate-300 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tuition Offerings & Batches</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("providers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === "providers"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "bg-[#254266] text-slate-300 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Verified Tutors & Mentors</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#0091ff]" />
                  <span>Refine Discovery</span>
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-slate-400 hover:text-[#0091ff]"
                >
                  Reset
                </button>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                >
                  <option value="All">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="English">English</option>
                </select>
              </div>

              {/* Class Level */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Education Level
                </label>
                <select
                  value={selectedClassLevel}
                  onChange={(e) => setSelectedClassLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                >
                  <option value="All">All Levels</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="JEE Prep">JEE / NEET Prep</option>
                  <option value="Undergraduate">Undergraduate</option>
                </select>
              </div>

              {/* Format Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Class Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                >
                  <option value="All">All Formats</option>
                  <option value="1:1">1:1 Mentorship</option>
                  <option value="1:2">1:2 Small Group</option>
                  <option value="group">1:N Cohort</option>
                </select>
              </div>

              {/* Teaching Mode */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Delivery Mode
                </label>
                <div className="space-y-1.5 text-xs">
                  {["All", "online", "offline", "hybrid"].map((mode) => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="radio"
                        name="teachingMode"
                        checked={selectedMode === mode}
                        onChange={() => setSelectedMode(mode)}
                        className="text-[#0091ff] focus:ring-[#0091ff]"
                      />
                      <span className="capitalize">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Day (Offerings View) */}
              {viewMode === "offerings" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Available Day
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                  >
                    {daysList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fee Range */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Fee Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minFee || ""}
                    onChange={(e) => setMinFee(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxFee || ""}
                    onChange={(e) => setMaxFee(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                  />
                </div>
              </div>

              {/* Platform Tier */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tutor Merit Tier
                </label>
                <div className="space-y-1.5 text-xs">
                  {["All", "diamond", "platinum", "gold", "standard"].map((tier) => (
                    <label key={tier} className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="radio"
                        name="tier"
                        checked={selectedTier === tier}
                        onChange={() => setSelectedTier(tier)}
                        className="text-[#0091ff] focus:ring-[#0091ff]"
                      />
                      <span className="capitalize">{tier}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Student Rating */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Minimum Student Rating
                </label>
                <select
                  value={minRating || ""}
                  onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              {/* Minimum Teaching Experience */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Teaching Experience
                </label>
                <select
                  value={minExperience || ""}
                  onChange={(e) => setMinExperience(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                >
                  <option value="">Any Experience</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                </select>
              </div>

              {/* Qualification Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tutor Qualification
                </label>
                <select
                  value={selectedQualification}
                  onChange={(e) => setSelectedQualification(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                >
                  <option value="All">All Qualifications</option>
                  <option value="PhD">Doctorate / PhD</option>
                  <option value="Master">Master's / PG</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">
                Showing{" "}
                <strong className="text-slate-900">
                  {viewMode === "offerings" ? offerings.length : providers.length}
                </strong>{" "}
                verified {viewMode === "offerings" ? "offerings & batches" : "tuition providers"}
              </span>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>

            {loading ? (
              <Loader fullScreen={false} text="Searching Tuition Marketplace..." />
            ) : viewMode === "offerings" ? (
              /* OFFERINGS DISCOVERY GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offerings.map((offering) => {
                  const prov = offering.provider;
                  const tier = prov?.platformTier || "standard";
                  const isProvisional = prov?.isProvisionalTier ?? prov?.tierScore?.isProvisional;
                  const ratingAvg = prov?.rating?.average || 0;
                  const ratingCount = prov?.rating?.count || 0;
                  const batchesCount = offering.batches?.length || 0;

                  const tierColor =
                    tier === "diamond"
                      ? "bg-purple-50 text-purple-800 border-purple-200"
                      : tier === "platinum"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : tier === "gold"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={offering._id}
                      className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#0091ff]/60 transition-colors"
                    >
                      <div className="space-y-3.5">
                        {/* Header Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700">
                              {offering.classFormat} &bull; {offering.teachingMode}
                            </span>
                            {batchesCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700">
                                {batchesCount} {batchesCount === 1 ? "Cohort" : "Cohorts"}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-slate-900 block">
                              ₹{offering.feeAmount.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">/{offering.billingUnit}</span>
                          </div>
                        </div>

                        {/* Title & Subject */}
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{offering.title}</h3>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {offering.subject} &bull; {offering.classLevel}
                          </p>
                        </div>

                        {/* Syllabus Excerpt */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {offering.description}
                        </p>

                        {/* Schedule & Days Pill */}
                        <div className="bg-[#f8fafc] border border-slate-200/60 rounded-xl p-2.5 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {offering.availableDays && offering.availableDays.length > 0
                                ? offering.availableDays.join(", ")
                                : "Flexible 1:1 Booking"}
                            </span>
                          </div>
                          {offering.duration && (
                            <div className="text-[10px] text-slate-400">Duration: {offering.duration}</div>
                          )}
                        </div>

                        {/* Provider Identity Mini Card */}
                        {prov && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={prov.photoUrl || userImg}
                                alt={prov.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-[#e2ebf4] shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-slate-900 block truncate">
                                  {prov.fullName}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                                    <Star className="w-3 h-3 fill-amber-500" />
                                    {ratingCount >= 3 ? Number(ratingAvg).toFixed(1) : "Provisional"}
                                  </span>
                                  <span>&bull;</span>
                                  <span>{prov.experienceYears || 1}+ yrs exp</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${tierColor}`}>
                                {tier}
                              </span>
                              {isProvisional && (
                                <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 mt-0.5">
                                  Provisional
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer CTA */}
                      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOfferingModal(offering)}
                          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Syllabus</span>
                        </button>

                        <Link
                          to={`/tuition/provider/${typeof offering.providerId === "object" ? (offering.providerId as any)._id : offering.providerId}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                          <span>Tutor Profile & Batches</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {offerings.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white border border-[#e2ebf4] rounded-2xl">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <h3 className="text-sm font-bold text-slate-800">No Offerings Match Filters</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Try clearing some filters or searching for other subjects or education levels.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* PROVIDERS DISCOVERY GRID (LEGACY REUSED) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map((provider) => {
                  const minPrice = provider.pricing?.minHourlyRate || 500;
                  const tier = provider.platformTier || "standard";
                  const isProvisional = provider.isProvisionalTier ?? provider.tierScore?.isProvisional;
                  const points = provider.tierScore?.totalPoints;
                  const tierColor =
                    tier === "diamond"
                      ? "bg-purple-50 text-purple-800 border-purple-200"
                      : tier === "platinum"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : tier === "gold"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={provider._id}
                      className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#0091ff]/50 transition-colors"
                    >
                      <div className="space-y-3.5">
                        {/* Top row: Avatar & Tier Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={provider.photoUrl || userImg}
                              alt={provider.fullName}
                              className="w-12 h-12 rounded-full object-cover border border-[#e2ebf4]"
                            />
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{provider.fullName}</span>
                                <CheckCircle className="w-4 h-4 text-[#0091ff] shrink-0" />
                              </h3>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{provider.headline || "Tuition Educator"}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {provider.isOverridden && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  title={`Admin Override: ${provider.overrideDetails?.reason || ""}`}
                                >
                                  Admin Override
                                </span>
                              )}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${tierColor}`}>
                                {tier}
                              </span>
                            </div>
                            {isProvisional ? (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Provisional (Feedback Pending)
                              </span>
                            ) : (
                              points !== undefined && (
                                <span className="text-[10px] font-bold text-slate-500">
                                  Merit: {points} pts
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        {/* Experience and Rating */}
                        <div className="flex items-center gap-4 text-xs text-slate-600 bg-[#f8fafc] p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>
                              {(provider.rating?.count || 0) >= 3
                                ? Number(provider.rating.average).toFixed(1)
                                : "Provisional"}
                            </span>
                            <span className="text-slate-400 font-normal">
                              ({provider.rating?.count || 0} {(provider.rating?.count || 0) === 1 ? "review" : "reviews"})
                            </span>
                          </div>
                          <span>&bull;</span>
                          <div className="flex items-center gap-1 text-slate-700">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span>{provider.experienceYears || 1}+ yrs exp</span>
                          </div>
                          <span>&bull;</span>
                          <div className="capitalize text-slate-700">
                            {(provider.teachingMode || ["online"]).join(", ")}
                          </div>
                        </div>

                        {/* Subjects Tags */}
                        <div>
                          <div className="flex flex-wrap gap-1.5">
                            {(provider.subjects || []).slice(0, 4).map((sub) => (
                              <span
                                key={sub}
                                className="px-2 py-0.5 bg-blue-50/70 text-[#0091ff] rounded-md text-[11px] font-semibold"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bio snippet */}
                        {provider.bio && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {provider.bio}
                          </p>
                        )}
                      </div>

                      {/* Bottom Footer: Price and CTA */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Tuition Fee</span>
                          <span className="text-base font-black text-slate-900">
                            ₹{minPrice.toLocaleString()}
                            <span className="text-xs font-normal text-slate-400"> /hr approx</span>
                          </span>
                        </div>

                        <Link
                          to={`/tuition/provider/${provider._id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                          <span>View Profile & Batches</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {providers.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white border border-[#e2ebf4] rounded-2xl">
                    <Compass className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <h3 className="text-sm font-bold text-slate-800">No Verified Providers Match Filters</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Try resetting your filters or searching with broader subject terms.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK OFFERING DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedOfferingModal)}
        onClose={() => setSelectedOfferingModal(null)}
        title={selectedOfferingModal?.title || "Offering Details"}
      >
        {selectedOfferingModal && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Tuition Fee
                </span>
                <span className="text-base font-black text-slate-900">
                  ₹{selectedOfferingModal.feeAmount.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">/{selectedOfferingModal.billingUnit}</span>
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {selectedOfferingModal.classFormat} &bull; {selectedOfferingModal.teachingMode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Subject</span>
                <span className="font-bold text-slate-800">{selectedOfferingModal.subject}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Class / Level</span>
                <span className="font-bold text-slate-800">{selectedOfferingModal.classLevel}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Schedule Format</span>
                <span className="font-bold text-slate-800">{selectedOfferingModal.scheduleModel}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Max Student Capacity</span>
                <span className="font-bold text-slate-800">{selectedOfferingModal.maxCapacity} students</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Available Days</span>
              <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                {selectedOfferingModal.availableDays?.join(", ") || "Flexible Scheduling"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Syllabus & Overview</span>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedOfferingModal.description || "Comprehensive curriculum guidance and problem solving."}
              </p>
            </div>

            {selectedOfferingModal.batches && selectedOfferingModal.batches.length > 0 && (
              <div>
                <span className="text-slate-500 font-bold block mb-1.5">
                  Available Recurring Batches ({selectedOfferingModal.batches.length})
                </span>
                <div className="space-y-1.5">
                  {selectedOfferingModal.batches.map((b) => (
                    <div
                      key={b._id}
                      className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{b.title}</span>
                        <span className="text-[11px] text-slate-500">
                          {b.daysOfWeek.join(", ")} &bull; {b.startTime} - {b.endTime}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {b.enrolledCount} / {b.maxCapacity} seats
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedOfferingModal(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close
              </button>
              <Link
                to={`/tuition/provider/${typeof selectedOfferingModal.providerId === "object" ? (selectedOfferingModal.providerId as any)._id : selectedOfferingModal.providerId}`}
                className="px-4 py-2 text-xs font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-lg shadow-xs"
              >
                Go to Provider Profile
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
