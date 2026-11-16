import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  Inbox,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Video,
  Award,
} from "lucide-react";
import { tuitionService } from "../../services/tuitionService";
import { TuitionSession, TuitionProviderProfile } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { useToast } from "../../hooks/useToast";

export default function TuitionProviderDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await tuitionService.getProviderOverview();
      if (res.success) {
        setData(res.overview);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load provider dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={false} text="Loading Tuition Studio..." />;
  }

  const profile: TuitionProviderProfile | null = data?.profile;
  const isVerified = profile?.verificationStatus === "verified";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Verification Status Banner */}
      {!isVerified ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Tuition Provider Profile: {profile ? profile.verificationStatus.toUpperCase() : "INCOMPLETE"}
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                {profile?.verificationStatus === "pending"
                  ? "Your profile is under review by EduPye Academic Compliance. Once verified, your offerings will be visible in the marketplace."
                  : "Complete your qualification, subject, and teaching mode details to activate your public tuition presence."}
              </p>
            </div>
          </div>
          <Link
            to="/tuition-provider/profile"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
          >
            {profile ? "View Onboarding Details" : "Start Onboarding"}
          </Link>
        </div>
      ) : (
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>Verified Tuition Provider &bull; {profile?.platformTier?.toUpperCase()} TIER</span>
                {profile?.tierScore?.totalPoints !== undefined && (
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-black">
                    {profile.tierScore.totalPoints} PTS
                  </span>
                )}
                {profile?.isOverridden && (
                  <span
                    className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px] font-black"
                    title={profile.overrideDetails?.reason}
                  >
                    ADMIN OVERRIDE
                  </span>
                )}
                {(profile?.isProvisionalTier || profile?.tierScore?.isProvisional) && (
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-black">
                    PROVISIONAL
                  </span>
                )}
              </span>
              <p className="text-[11px] text-emerald-700">
                Your profile and active offerings are published on the EduPye Tuition Marketplace.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-emerald-200 text-xs font-black text-emerald-800 shadow-xs">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rating: {profile?.rating?.average || 5.0} ★</span>
          </div>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {profile?.fullName || "Tuition Provider"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor batches, student bookings, session attendance, and gross earnings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/tuition-provider/offerings"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Class / Batch</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Active Offerings</span>
            <BookOpen className="w-4 h-4 text-[#0091ff]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {data?.activeOfferingsCount ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Subjects published</span>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Active Batches</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {data?.activeBatchesCount ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Cohorts running</span>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Pending Requests</span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {data?.pendingRequestsCount ?? 0}
          </div>
          <Link
            to="/tuition-provider/requests"
            className="text-[11px] font-bold text-[#0091ff] hover:underline mt-1 block"
          >
            Review requests &rarr;
          </Link>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Gross Earnings</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{data?.financialSummary?.totalGrossEarnings?.toLocaleString() ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {data?.financialSummary?.transactionsCount ?? 0} verified transactions
          </span>
        </div>
      </div>

      {/* Earned Platform Achievement Badges */}
      {profile?.badges && profile.badges.length > 0 && (
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>EduPye Platform Achievement Badges</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {profile.badges.length} Badges Awarded
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.badges.map((b) => (
              <div
                key={b.badgeId}
                className="p-3 bg-[#f8fafc] border border-slate-200/80 rounded-xl space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-white text-[#0091ff] rounded-md shadow-2xs border border-slate-100">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">{b.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{b.description}</p>
                <span className="inline-block text-[9px] font-bold text-slate-400">
                  Criteria: {b.criteria}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions Section */}
      <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upcoming Live Sessions</h3>
            <p className="text-xs text-slate-500">Scheduled for the next 7 days</p>
          </div>
          <Link
            to="/tuition-provider/schedule"
            className="text-xs font-bold text-[#0091ff] hover:underline flex items-center gap-1"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.upcomingSessions && data.upcomingSessions.length > 0 ? (
          <div className="divide-y divide-slate-100 mt-2">
            {data.upcomingSessions.map((session: TuitionSession) => (
              <div
                key={session._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{session.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        session.status === "live"
                          ? "bg-red-100 text-red-700 animate-pulse"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(session.sessionDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    &bull; {session.startTime} - {session.endTime}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={session.meetingLink || `/teacher/smartboard/integrated`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Session</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium">No sessions scheduled for the upcoming week</p>
            <Link
              to="/tuition-provider/offerings"
              className="mt-3 inline-block text-xs font-bold text-[#0091ff] hover:underline"
            >
              Configure batches to open enrolments
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

