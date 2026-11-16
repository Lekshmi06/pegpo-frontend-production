import React, { useEffect, useState } from "react";
import {
  Inbox,
  Check,
  X,
  Clock,
  User,
  DollarSign,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { tuitionService } from "../../services/tuitionService";
import { TuitionRequest } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../hooks/useToast";

export default function TuitionProviderRequests() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TuitionRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Response Modal
  const [selectedRequest, setSelectedRequest] = useState<TuitionRequest | null>(null);
  const [responseAction, setResponseAction] = useState<"accept" | "reject">("accept");
  const [responseNotes, setResponseNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const statusParam = filterStatus === "all" ? undefined : filterStatus;
      const res = await tuitionService.getProviderRequests(statusParam);
      setRequests(res.requests || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResponse = (req: TuitionRequest, action: "accept" | "reject") => {
    setSelectedRequest(req);
    setResponseAction(action);
    setResponseNotes(action === "accept" ? "Accepted. Looking forward to our classes!" : "Sorry, the cohort is currently unavailable.");
  };

  const handleConfirmResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      const res = await tuitionService.respondToRequest(
        selectedRequest._id,
        responseAction,
        responseNotes.trim()
      );
      if (res.success) {
        toast.success(`Request ${responseAction}ed successfully!`);
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${responseAction} request`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={false} text="Loading Student Requests..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Tuition Requests
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Accept or decline student enrollment requests before payment is unlocked
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          {["all", "pending", "accepted", "paid", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filterStatus === st ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((req) => {
          const studentName = typeof req.studentId === "object" ? req.studentId?.name : "Student";
          const studentEmail = typeof req.studentId === "object" ? req.studentId?.email : "";
          const offeringTitle = typeof req.offeringId === "object" ? req.offeringId?.title : "Tuition Offering";
          const batchTitle = typeof req.batchId === "object" ? req.batchId?.title : "1:1 Appointment";

          return (
            <div
              key={req._id}
              className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-900">{studentName}</span>
                  <span className="text-xs text-slate-400">&bull; {studentEmail}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
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

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{offeringTitle}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{batchTitle}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-bold text-slate-900">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>₹{req.feeAmount.toLocaleString()}</span>
                  </span>
                </div>

                {req.studentNotes && (
                  <p className="text-xs text-slate-600 bg-[#f8fafc] p-2.5 rounded-xl border border-slate-100 max-w-2xl">
                    <span className="font-bold text-slate-700">Student note:</span> {req.studentNotes}
                  </p>
                )}

                {req.providerResponseNotes && (
                  <p className="text-xs text-slate-500 italic">
                    <span className="font-semibold">Your response:</span> {req.providerResponseNotes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleOpenResponse(req, "reject")}
                      className="px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleOpenResponse(req, "accept")}
                      className="px-4 py-2 text-xs font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-xl shadow-xs transition-colors"
                    >
                      Accept Request
                    </button>
                  </>
                )}

                {req.status === "accepted" && (
                  <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                    Awaiting Student Payment
                  </span>
                )}

                {req.status === "paid" && (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                    Enrolment Active
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {requests.length === 0 && (
          <div className="py-16 text-center bg-white border border-[#e2ebf4] rounded-2xl">
            <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Requests Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filterStatus === "all"
                ? "New tuition requests from prospective students will appear here."
                : `No requests with status '${filterStatus}'.`}
            </p>
          </div>
        )}
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={`${responseAction === "accept" ? "Accept" : "Decline"} Tuition Request`}
      >
        <form onSubmit={handleConfirmResponse} className="space-y-4">
          <p className="text-xs text-slate-600">
            {responseAction === "accept"
              ? "Accepting this request generates a secure simulated payment order. Once the student completes payment, their enrollment and session schedule will become active."
              : "Declining will notify the student and cancel this booking request."}
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note to Student ({responseAction === "accept" ? "Optional Welcome Message" : "Reason for Decline"})
            </label>
            <textarea
              rows={3}
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs ${
                responseAction === "accept" ? "bg-[#0091ff] hover:bg-[#0077d6]" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {submitting ? "Processing..." : `Confirm ${responseAction === "accept" ? "Acceptance" : "Decline"}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

