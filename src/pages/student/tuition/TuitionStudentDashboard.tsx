import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  FileText,
  DollarSign,
  Video,
  Star,
  Download,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { tuitionService } from "../../../services/tuitionService";
import {
  TuitionEnrollment,
  TuitionRequest,
  TuitionSession,
  TuitionMaterial,
  TuitionAssessment,
  TuitionTransaction,
} from "../../../types/tuition";
import { Loader } from "../../../components/ui/Loader";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../hooks/useToast";

export default function TuitionStudentDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "classes" | "schedule" | "materials" | "assessments" | "requests"
  >("overview");

  // Portal State
  const [overview, setOverview] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<TuitionEnrollment[]>([]);
  const [requests, setRequests] = useState<TuitionRequest[]>([]);
  const [sessions, setSessions] = useState<TuitionSession[]>([]);
  const [materials, setMaterials] = useState<TuitionMaterial[]>([]);
  const [assessments, setAssessments] = useState<TuitionAssessment[]>([]);
  const [payments, setPayments] = useState<TuitionTransaction[]>([]);

  // Simulated Payment Modal
  const [payingRequest, setPayingRequest] = useState<TuitionRequest | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Review Modal
  const [reviewEnrollment, setReviewEnrollment] = useState<TuitionEnrollment | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ovRes, enrRes, reqRes, sesRes, matRes, assRes, payRes] = await Promise.all([
        tuitionService.getStudentOverview(),
        tuitionService.getStudentEnrollments(),
        tuitionService.getStudentRequests(),
        tuitionService.getStudentSchedule(),
        tuitionService.getStudentMaterials(),
        tuitionService.getStudentAssessments(),
        tuitionService.getStudentPayments(),
      ]);

      setOverview(ovRes.overview);
      setEnrollments(enrRes.enrollments || []);
      setRequests(reqRes.requests || []);
      setSessions(sesRes.sessions || []);
      setMaterials(matRes.materials || []);
      setAssessments(assRes.assessments || []);
      setPayments(payRes.transactions || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load tuition portal");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!payingRequest) return;

    try {
      setProcessingPayment(true);
      const res = await tuitionService.verifyAndSettlePayment({
        requestId: payingRequest._id,
        gatewayTransactionId: payingRequest.simulationTransactionId!,
        signature: payingRequest.simulationPaymentToken!,
      });

      if (res.success) {
        toast.success("Tuition fee confirmed! You are now enrolled.");
        setPayingRequest(null);
        fetchInitialData();
        setActiveTab("classes");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment settlement failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to cancel this tuition request?")) return;
    try {
      const res = await tuitionService.cancelRequest(requestId, "Cancelled by student from dashboard");
      if (res.success) {
        toast.success("Tuition request cancelled successfully.");
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel request");
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    const reason = window.prompt("Please state your reason for withdrawing/cancelling this enrolment:");
    if (reason === null) return;
    try {
      const res = await tuitionService.cancelEnrollment(enrollmentId, reason.trim() || "Withdrawn by student");
      if (res.success) {
        toast.success("Enrolment cancelled and seat capacity safely released.");
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel enrolment");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewEnrollment) return;

    try {
      setSubmittingReview(true);
      const providerId =
        typeof reviewEnrollment.providerId === "object"
          ? reviewEnrollment.providerId._id
          : reviewEnrollment.providerId;

      const res = await tuitionService.submitReview({
        providerId,
        enrollmentId: reviewEnrollment._id,
        rating: reviewRating,
        reviewText: reviewText.trim(),
      });

      if (res.success) {
        toast.success("Thank you! Your verified review has been published.");
        setReviewEnrollment(null);
        setReviewText("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={false} text="Loading Tuition Student Portal..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-[#1c3352] text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#254266] text-[#62b2fd] rounded-full text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Tuition Student Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            My Tuition Learning Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Access your confirmed batches, attend live SmartBoard classes, review shared study materials,
            and monitor booking requests.
          </p>
        </div>

        <Link
          to="/tuition"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <span>Find More Mentors</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2ebf4] overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: "overview", label: "Overview" },
          { id: "classes", label: `My Classes (${enrollments.length})` },
          { id: "schedule", label: `Schedule (${sessions.length})` },
          { id: "materials", label: `Study Materials (${materials.length})` },
          { id: "assessments", label: `Assessments (${assessments.length})` },
          { id: "requests", label: `Requests & Payments (${requests.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-[#0091ff] border-t-2 border-t-[#0091ff] border-x border-[#e2ebf4] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Active Classes</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {overview?.activeEnrollmentsCount ?? 0}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Enrolled subjects</span>
            </div>

            <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Attendance Rate</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {overview?.attendanceRate ?? 100}%
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Live classes attended</span>
            </div>

            <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Upcoming Sessions</span>
              <div className="text-2xl sm:text-3xl font-black text-[#0091ff] mt-1">
                {sessions.filter((s) => s.status === "scheduled" || s.status === "live").length}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Next 7 days</span>
            </div>

            <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Pending Requests</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {requests.filter((r) => r.status === "pending" || r.status === "accepted").length}
              </div>
              <button
                onClick={() => setActiveTab("requests")}
                className="text-[11px] font-bold text-[#0091ff] hover:underline mt-1 block"
              >
                View status &rarr;
              </button>
            </div>
          </div>

          {/* Quick Enrolled Classes Preview */}
          <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Enrolled Tuition Classes</h3>
              <button
                onClick={() => setActiveTab("classes")}
                className="text-xs font-bold text-[#0091ff] hover:underline"
              >
                View all &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.slice(0, 2).map((enr) => {
                const pName = typeof enr.providerId === "object" ? enr.providerId?.name : "Mentor";
                return (
                  <div key={enr._id} className="p-4 bg-[#f8fafc] border border-slate-200/70 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{enr.subject}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {enr.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Mentor: {pName}</p>
                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-600">
                      <span>Attendance: {enr.sessionsAttended} sessions</span>
                      <button
                        onClick={() => setReviewEnrollment(enr)}
                        className="text-[#0091ff] font-bold hover:underline"
                      >
                        Rate Mentor ★
                      </button>
                    </div>
                  </div>
                );
              })}

              {enrollments.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  You are not currently enrolled in any tuition classes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY CLASSES */}
      {activeTab === "classes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr) => {
            const pName = typeof enr.providerId === "object" ? enr.providerId?.name : "Tuition Mentor";
            const offTitle = typeof enr.offeringId === "object" ? enr.offeringId?.title : enr.subject;

            return (
              <div
                key={enr._id}
                className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700">
                      {enr.classFormat} &bull; {enr.teachingMode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {enr.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{offTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Subject: <strong>{enr.subject}</strong> &bull; {enr.classLevel}
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8fafc] rounded-xl text-xs space-y-1 text-slate-600">
                    <p><span className="font-semibold">Mentor:</span> {pName}</p>
                    <p>
                      <span className="font-semibold">Schedule:</span>{" "}
                      {enr.scheduleDetails.daysOfWeek?.join(", ") || enr.scheduleDetails.slotDay || "Weekly"}{" "}
                      ({enr.scheduleDetails.startTime}-{enr.scheduleDetails.endTime})
                    </p>
                    <p><span className="font-semibold">Attended:</span> {enr.sessionsAttended} sessions</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setReviewEnrollment(enr)}
                      className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>Review Class</span>
                    </button>
                    {enr.status === "active" && (
                      <button
                        onClick={() => handleCancelEnrollment(enr._id)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>

                  {enr.status === "active" && (
                    <Link
                      to={`/teacher/smartboard/integrated?session=${enr._id}`}
                      className="px-3.5 py-1.5 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Enter Classroom
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {enrollments.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white border border-[#e2ebf4] rounded-2xl">
              <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Enrolled Classes</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Explore the marketplace and send a request to a verified tuition educator.
              </p>
              <Link
                to="/tuition"
                className="px-4 py-2 bg-[#0091ff] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULE */}
      {activeTab === "schedule" && (
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0091ff]" />
            <span>Class Timetable & Sessions</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {sessions.map((session) => (
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
                          : session.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
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
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors ${
                      session.status === "live"
                        ? "bg-red-600 hover:bg-red-700 animate-bounce"
                        : "bg-[#0091ff] hover:bg-[#0077d6]"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{session.status === "live" ? "Join Live Class" : "Enter Room"}</span>
                  </Link>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No sessions scheduled for your enrolled classes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MATERIALS */}
      {activeTab === "materials" && (
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0091ff]" />
            <span>Shared Study Materials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((mat) => (
              <div
                key={mat._id}
                className="p-4 bg-[#f8fafc] border border-slate-200/80 rounded-xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>{mat.fileType} Document</span>
                    <span>{mat.fileSize || "1.2 MB"}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{mat.title}</h4>
                  {mat.description && <p className="text-[11px] text-slate-500 mt-0.5">{mat.description}</p>}
                </div>

                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              </div>
            ))}

            {materials.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                No study materials uploaded for your enrolled subjects yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ASSESSMENTS */}
      {activeTab === "assessments" && (
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0091ff]" />
            <span>Class Assessments & Homework</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {assessments.map((ass) => (
              <div key={ass._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{ass.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                      Max {ass.totalMarks} Marks
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Due Date: {new Date(ass.dueDate).toLocaleDateString()}
                  </p>
                  {ass.mySubmission && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                      Submitted &bull; Score: {ass.mySubmission.marksAwarded ?? "Pending Evaluation"} / {ass.totalMarks}
                    </div>
                  )}
                </div>

                <div>
                  {!ass.mySubmission ? (
                    <button
                      onClick={async () => {
                        const note = window.prompt("Enter submission remarks or paste document URL:");
                        if (note) {
                          try {
                            await tuitionService.submitStudentAssessment(ass._id, { notes: note });
                            toast.success("Assessment submitted!");
                            fetchInitialData();
                          } catch (err: any) {
                            toast.error(err.message);
                          }
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Submit Response
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold">Submitted</span>
                  )}
                </div>
              </div>
            ))}

            {assessments.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active assessments assigned.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: REQUESTS & PAYMENTS */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {/* Booking Requests */}
          <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#0091ff]" />
              <span>My Tuition Requests & Booking Status</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {requests.map((req) => {
                const pName = typeof req.providerId === "object" ? req.providerId?.name : "Mentor";
                const offTitle = typeof req.offeringId === "object" ? req.offeringId?.title : "Tuition";

                return (
                  <div key={req._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{offTitle}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            req.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "accepted"
                              ? "bg-blue-100 text-blue-800"
                              : req.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        Mentor: <strong>{pName}</strong> &bull; Fee: ₹{req.feeAmount.toLocaleString()}
                      </p>

                      {req.providerResponseNotes && (
                        <p className="text-xs text-slate-600 italic bg-[#f8fafc] p-2 rounded-lg">
                          Mentor note: {req.providerResponseNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {req.status === "accepted" && (
                        <button
                          onClick={() => setPayingRequest(req)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay ₹{req.feeAmount.toLocaleString()} & Enrol</span>
                        </button>
                      )}

                      {req.status === "pending" && (
                        <span className="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                          Waiting for mentor review
                        </span>
                      )}

                      {(req.status === "pending" || req.status === "accepted") && (
                        <button
                          onClick={() => handleCancelRequest(req._id)}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}

                      {req.status === "paid" && (
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          Active Enrolment
                        </span>
                      )}

                      {req.status === "cancelled" && (
                        <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg">
                          Cancelled
                        </span>
                      )}

                      {req.status === "rejected" && (
                        <span className="text-xs text-rose-700 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {requests.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No tuition booking requests found.
                </div>
              )}
            </div>
          </div>

          {/* Payment Receipts */}
          <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Tuition Payment Receipts</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-500 border-b border-[#e2ebf4] font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Transaction ID</th>
                    <th className="py-2.5 px-4">Mentor</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{p.gatewayTransactionId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {typeof p.providerId === "object" ? p.providerId?.name : "Mentor"}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">₹{p.grossAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 uppercase text-[10px] text-slate-500 font-bold">{p.paymentMethod}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No tuition payments completed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Payment Modal */}
      <Modal
        isOpen={Boolean(payingRequest)}
        onClose={() => setPayingRequest(null)}
        title="Complete Tuition Payment (Simulated Gateway)"
      >
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs space-y-1.5">
            <div className="flex justify-between font-bold text-emerald-950">
              <span>Tuition Booking Fee</span>
              <span>₹{payingRequest?.feeAmount.toLocaleString()}</span>
            </div>
            <p className="text-emerald-800 text-[11px]">
              Mentor: {typeof payingRequest?.providerId === "object" ? (payingRequest?.providerId as any).name : "Mentor"}
            </p>
            <p className="text-[10px] font-mono text-emerald-700">
              Order Ref: TUITION-ORD-{payingRequest?._id}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <span className="font-bold text-slate-700 block">Development Simulation Mode</span>
            <p className="text-slate-500 text-[11px]">
              The EduPye cryptographic simulation gateway verifies the server-signed payment order token.
              Clicking below settles the transaction and immediately activates your tuition enrolment.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPayingRequest(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSimulatePayment}
              disabled={processingPayment}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs disabled:opacity-50"
            >
              {processingPayment ? "Verifying Payment..." : `Authorize Payment (₹${payingRequest?.feeAmount.toLocaleString()})`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Verified Review Modal */}
      <Modal
        isOpen={Boolean(reviewEnrollment)}
        onClose={() => setReviewEnrollment(null)}
        title={`Review Tuition: ${reviewEnrollment?.subject || ""}`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <p className="text-xs text-slate-600">
            Share feedback on your learning experience with this tuition mentor. Only verified enrolled students can review.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`p-1 text-base ${star <= reviewRating ? "text-amber-500" : "text-slate-200"}`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 ml-2">{reviewRating} Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Review Text *</label>
            <textarea
              rows={3}
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Explain how the mentor helped your understanding of concepts, problem-solving, etc..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReviewEnrollment(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 text-xs font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-lg shadow-xs"
            >
              {submittingReview ? "Submitting..." : "Publish Verified Review"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

