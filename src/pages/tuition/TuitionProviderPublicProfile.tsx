import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  Star,
  Award,
  BookOpen,
  Calendar,
  Briefcase,
  GraduationCap,
  Clock,
  ArrowLeft,
  Users,
  MessageSquare,
  DollarSign,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import userImg from "../../assets/user.png";
import { tuitionService } from "../../services/tuitionService";
import {
  TuitionProviderProfile,
  TuitionOffering,
  TuitionBatch,
  TuitionReview,
} from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService";

export default function TuitionProviderPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = authService.getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TuitionProviderProfile | null>(null);
  const [offerings, setOfferings] = useState<TuitionOffering[]>([]);
  const [batches, setBatches] = useState<TuitionBatch[]>([]);
  const [reviews, setReviews] = useState<TuitionReview[]>([]);

  // Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<TuitionOffering | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [requestedDay, setRequestedDay] = useState("Monday");
  const [requestedStartTime, setRequestedStartTime] = useState("18:00");
  const [requestedEndTime, setRequestedEndTime] = useState("19:00");
  const [studentNotes, setStudentNotes] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await tuitionService.getProviderPublicProfile(id!);
      if (res.success) {
        setProfile(res.profile);
        setOfferings(res.offerings || []);
        setBatches(res.batches || []);
        setReviews(res.reviews || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load provider profile");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = (offering: TuitionOffering) => {
    if (!currentUser) {
      toast.info("Please log in as a student to request tuition");
      return navigate("/login");
    }
    setSelectedOffering(offering);
    const availableBatches = batches.filter((b) => {
      const bOffId = typeof b.offeringId === "object" ? b.offeringId?._id : b.offeringId;
      return bOffId === offering._id;
    });
    if (availableBatches.length > 0) {
      setSelectedBatchId(availableBatches[0]._id);
    }
    setShowRequestModal(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering) return;

    try {
      setSubmittingRequest(true);
      const payload: any = {
        offeringId: selectedOffering._id,
        classFormat: selectedOffering.classFormat,
        teachingMode: selectedOffering.teachingMode,
        studentNotes: studentNotes.trim(),
      };

      if (selectedOffering.scheduleModel === "fixed_batch") {
        if (!selectedBatchId) return toast.error("Please select a batch");
        payload.batchId = selectedBatchId;
      } else {
        payload.requestedSlot = {
          day: requestedDay,
          startTime: requestedStartTime,
          endTime: requestedEndTime,
        };
      }

      const res = await tuitionService.createRequest(payload);
      if (res.success) {
        toast.success("Tuition request sent! The mentor will review your booking.");
        setShowRequestModal(false);
        navigate("/student/tuition");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send tuition request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={true} text="Loading Tuition Provider Profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">Tuition Provider Not Found</p>
          <Link to="/tuition" className="mt-2 inline-block text-xs text-[#0091ff] hover:underline">
            &larr; Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const tier = profile.platformTier || "standard";
  const isProvisional = profile.isProvisionalTier ?? profile.tierScore?.isProvisional;
  const score = profile.tierScore;
  const tierColor =
    tier === "diamond"
      ? "bg-purple-100 text-purple-900 border-purple-300"
      : tier === "platinum"
      ? "bg-blue-100 text-blue-900 border-blue-300"
      : tier === "gold"
      ? "bg-amber-100 text-amber-900 border-amber-300"
      : "bg-slate-100 text-slate-800 border-slate-300";

  return (
    <div className="min-h-screen bg-[#f8fbfe] font-sans pb-16">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-[#e2ebf4] px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <Link to="/tuition" className="hover:text-[#0091ff] flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tuition Marketplace</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-800 font-bold">{profile.fullName}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white border border-[#e2ebf4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={profile.photoUrl || userImg}
              alt={profile.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{profile.fullName}</h1>
                <CheckCircle className="w-5 h-5 text-[#0091ff] shrink-0" />
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${tierColor}`}>
                  {tier} Tier
                </span>
                {profile.isOverridden && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200">
                    Admin Override
                  </span>
                )}
                {isProvisional ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200">
                    Provisional (Feedback Pending)
                  </span>
                ) : (
                  score?.totalPoints !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200">
                      Merit: {score.totalPoints} pts
                    </span>
                  )
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">{profile.headline || "Tuition Educator"}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>
                    {(profile.rating?.count || 0) >= 3
                      ? Number(profile.rating.average).toFixed(1)
                      : "Provisional Rating"}
                  </span>
                  <span className="text-slate-400 font-normal">
                    ({profile.rating?.count || 0} {(profile.rating?.count || 0) === 1 ? "review" : "reviews"})
                  </span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.experienceYears} Years Experience</span>
                </span>
                <span>&bull;</span>
                <span className="capitalize">{(profile.teachingMode || ["online"]).join(", ")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 uppercase font-bold">Standard Tuition Fee</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{profile.pricing?.minHourlyRate || 500}
              <span className="text-xs font-normal text-slate-400"> /hr approx</span>
            </span>
          </div>
        </div>

        {/* Two Column Layout: Left Details, Right Offerings & Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">About the Educator & Methodology</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Platform-Awarded Achievement Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Platform Achievement Badges</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Objective badges awarded by EduPye based on verified credentials, experience, and student satisfaction.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {profile.badges.length} Earned
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.badges.map((b) => (
                    <div
                      key={b.badgeId}
                      className="p-3.5 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-slate-200 rounded-xl space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-white text-[#0091ff] rounded-lg shadow-2xs border border-slate-100">
                          {b.badgeId === "verified_educator" && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                          {b.badgeId === "experienced_tutor" && <Briefcase className="w-4 h-4 text-blue-600" />}
                          {b.badgeId === "top_rated" && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          {b.badgeId === "student_favourite" && <Star className="w-4 h-4 text-rose-500 fill-rose-500" />}
                          {b.badgeId === "consistent_performer" && <Award className="w-4 h-4 text-indigo-600" />}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                          <span className="text-[10px] text-slate-400 block">
                            Awarded: {new Date(b.awardedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal pl-8">{b.description}</p>
                      <div className="pt-1 pl-8">
                        <span className="inline-block text-[9px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Criteria: {b.criteria}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transparent 100-Point Quality Evaluation */}
            {score && (
              <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#0091ff]" />
                      <span>Transparent Quality Evaluation</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      System Calculated Merit:{" "}
                      <strong className="text-slate-800 uppercase">
                        {profile.calculatedTier || "standard"} Tier
                      </strong>{" "}
                      ({score.totalPoints} / 100 points)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      Score: {score.totalPoints} / 100
                    </span>
                    {score.isProvisional && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Provisional
                      </span>
                    )}
                  </div>
                </div>

                {/* Overridden Tier Notice */}
                {profile.isOverridden && (
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-indigo-900 block">
                      Admin Override Active &bull; {profile.platformTier.toUpperCase()} TIER
                    </span>
                    <p className="text-[11px] text-indigo-700">
                      Reason: {profile.overrideDetails?.reason || "Administrative review adjustment"}.
                      Underlying merit score and verified credential evaluations remain immutable.
                    </p>
                  </div>
                )}

                {/* Provisional Status Explanation */}
                {score.isProvisional && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                    <span className="font-bold text-amber-900 block">
                      Provisional Status &bull; Awaiting Student Reputation Validation
                    </span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      {profile.provisionalReason ||
                        "Academic qualifications and teaching experience are authenticated. Full tier confirmation requires minimum verified student feedback with acceptable ratings."}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Education</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      {score.educationPoints} / 30 pts
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {score.educationLevelMatched || "Pending Review"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Experience</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      {score.experiencePoints} / 25 pts
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {score.verifiedExperienceYears ?? profile.experienceYears} Years
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Rating</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      {score.ratingPoints} / 25 pts
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {(score.verifiedRatingCount || 0) >= 3 && Number(profile.rating?.average) >= 3.0
                        ? `${Number(profile.rating?.average).toFixed(1)} ★`
                        : "Provisional"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Verified Reviews</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      {score.reviewPoints} / 20 pts
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {score.verifiedReviewCount ?? profile.rating?.count ?? 0} Completed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Qualifications & Degrees */}
            <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#0091ff]" />
                <span>Education & Qualifications</span>
              </h3>
              <div className="space-y-2">
                {(profile.education || []).map((edu, i) => (
                  <div key={i} className="flex items-start justify-between text-xs p-2.5 bg-[#f8fafc] rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 block">{edu.degree}</span>
                      <span className="text-slate-500">{edu.institution}</span>
                    </div>
                    {edu.yearOfPassing && (
                      <span className="text-slate-400 font-medium">{edu.yearOfPassing}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects and Classes */}
            <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0091ff]" />
                <span>Subjects & Education Levels</span>
              </h3>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Subjects Taught
                </span>
                <div className="flex flex-wrap gap-2">
                  {(profile.subjects || []).map((sub) => (
                    <span key={sub} className="px-3 py-1 bg-blue-50 text-[#0091ff] rounded-lg text-xs font-bold">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Grades & Classes
                </span>
                <div className="flex flex-wrap gap-2">
                  {(profile.classesTaught || []).map((cls) => (
                    <span key={cls} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Verified Student Reviews */}
            <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Verified Student Reviews ({reviews.length})</span>
                </h3>
                <span className="text-xs font-bold text-amber-600">
                  {profile.rating?.average || 5.0} / 5.0 Average
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {reviews.map((rev) => {
                  const studentName = typeof rev.studentId === "object" ? rev.studentId?.name : "Verified Student";
                  return (
                    <div key={rev._id} className="py-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{studentName}</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.reviewText}</p>
                      <span className="text-[10px] text-slate-400 block">
                        Subject: {rev.subject} &bull; {new Date(rev.createdAt || "").toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}

                {reviews.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-4">No student reviews published yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Active Offerings & Book Tuition */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Available Tuition Classes</h3>

            {offerings.map((offering) => {
              const offeringBatches = batches.filter((b) => {
                const bOffId = typeof b.offeringId === "object" ? b.offeringId?._id : b.offeringId;
                return bOffId === offering._id;
              });

              return (
                <div
                  key={offering._id}
                  className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#0091ff]/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700">
                      {offering.classFormat} &bull; {offering.teachingMode}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{offering.feeAmount.toLocaleString()}{" "}
                      <span className="text-[10px] font-normal text-slate-400">/{offering.billingUnit}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{offering.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {offering.subject} &bull; {offering.classLevel}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{offering.description}</p>

                  {/* Batches indicator */}
                  {offeringBatches.length > 0 && (
                    <div className="text-[11px] text-slate-500 bg-[#f8fafc] p-2 rounded-lg">
                      <span className="font-semibold">{offeringBatches.length} batch available:</span>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside text-[10px]">
                        {offeringBatches.map((b) => (
                          <li key={b._id}>
                            {b.title} ({b.enrolledCount}/{b.maxCapacity} seats)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenRequest(offering)}
                    className="w-full py-2 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Request Tuition
                  </button>
                </div>
              );
            })}

            {offerings.length === 0 && (
              <div className="bg-white border border-[#e2ebf4] rounded-2xl p-6 text-center text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">No active offerings available at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tuition Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={`Request Tuition: ${selectedOffering?.title || ""}`}
      >
        <form onSubmit={handleSendRequest} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs space-y-1">
            <div className="flex justify-between font-bold text-blue-900">
              <span>{selectedOffering?.subject} ({selectedOffering?.classFormat})</span>
              <span>₹{selectedOffering?.feeAmount.toLocaleString()} /{selectedOffering?.billingUnit}</span>
            </div>
            <p className="text-blue-700 text-[11px]">
              Mentor: {profile.fullName} &bull; Delivery: {selectedOffering?.teachingMode}
            </p>
          </div>

          {selectedOffering?.scheduleModel === "fixed_batch" ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Choose Recurring Batch *</label>
              <select
                required
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              >
                {batches
                  .filter((b) => {
                    const bOffId = typeof b.offeringId === "object" ? b.offeringId?._id : b.offeringId;
                    return bOffId === selectedOffering._id;
                  })
                  .map((b) => (
                    <option key={b._id} value={b._id} disabled={b.enrolledCount >= b.maxCapacity}>
                      {b.title} - {b.daysOfWeek.join("/")} ({b.startTime}-{b.endTime}) [{b.enrolledCount}/{b.maxCapacity} seats{b.enrolledCount >= b.maxCapacity ? " - FULL" : ""}]
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Preferred 1:1 Slot *</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={requestedDay}
                  onChange={(e) => setRequestedDay(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={requestedStartTime}
                  onChange={(e) => setRequestedStartTime(e.target.value)}
                  placeholder="18:00"
                  className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                />
                <input
                  type="text"
                  value={requestedEndTime}
                  onChange={(e) => setRequestedEndTime(e.target.value)}
                  placeholder="19:00"
                  className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Learning Goals / Notes for Mentor</label>
            <textarea
              rows={3}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="e.g. Preparing for CBSE Board examinations. Need focus on Thermodynamics."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowRequestModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRequest}
              className="px-4 py-2 text-xs font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-lg shadow-xs"
            >
              {submittingRequest ? "Sending..." : "Submit Booking Request"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

