import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle,
  Users,
  Check,
  X,
  AlertCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Ban,
} from "lucide-react";
import { tuitionService } from "../../services/tuitionService";
import { TuitionSession, TuitionBatch, TuitionOffering } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../hooks/useToast";

export default function TuitionProviderSchedule() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<TuitionSession[]>([]);
  const [batches, setBatches] = useState<TuitionBatch[]>([]);
  const [offerings, setOfferings] = useState<TuitionOffering[]>([]);

  // Attendance Modal
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<TuitionSession | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Array<{ studentId: string; status: string; remarks: string }>>([]);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  // Reschedule Modal
  const [reschedulingSession, setReschedulingSession] = useState<TuitionSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("18:00");
  const [rescheduleEnd, setRescheduleEnd] = useState("19:00");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Cancel Modal
  const [cancellingSession, setCancellingSession] = useState<TuitionSession | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // New Session Modal
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    offeringId: "",
    batchId: "",
    title: "",
    topic: "",
    sessionDate: new Date().toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "19:00",
  });
  const [submittingNewSession, setSubmittingNewSession] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const [res, offRes] = await Promise.all([
        tuitionService.getProviderSchedule(),
        tuitionService.getMyOfferings(),
      ]);
      setSessions(res.schedule.sessions || []);
      setBatches(res.schedule.batches || []);
      const publishedOfferings = (offRes.offerings || []).filter((o) => o.isActive && o.status !== "archived");
      setOfferings(publishedOfferings);
      if (publishedOfferings.length > 0 && !newSessionData.offeringId) {
        setNewSessionData((prev) => ({
          ...prev,
          offeringId: publishedOfferings[0]._id,
        }));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sessionId: string, status: string) => {
    try {
      const meetingLink = status === "live" ? `/teacher/smartboard/integrated?session=${sessionId}` : undefined;
      const res = await tuitionService.updateSessionStatus(sessionId, status, meetingLink);
      if (res.success) {
        toast.success(`Session status updated to '${status}'`);
        fetchSchedule();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update session status");
    }
  };

  const handleOpenAttendance = (session: TuitionSession) => {
    setSelectedSessionForAttendance(session);
    const initial = (session.studentIds || []).map((s: any) => ({
      studentId: typeof s === "object" ? s._id : s,
      status: "present",
      remarks: "",
    }));
    setAttendanceRecords(initial);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForAttendance) return;

    try {
      setSubmittingAttendance(true);
      const res = await tuitionService.markAttendance(
        selectedSessionForAttendance._id,
        attendanceRecords
      );
      if (res.success) {
        toast.success("Attendance marked and student attendance counters updated!");
        setSelectedSessionForAttendance(null);
        fetchSchedule();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to mark attendance");
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const handleOpenReschedule = (session: TuitionSession) => {
    setReschedulingSession(session);
    setRescheduleDate(new Date(session.sessionDate).toISOString().split("T")[0]);
    setRescheduleStart(session.startTime);
    setRescheduleEnd(session.endTime);
    setRescheduleReason("Rescheduling due to faculty scheduling adjustment");
  };

  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingSession) return;

    try {
      setSubmittingReschedule(true);
      const res = await tuitionService.rescheduleSession(reschedulingSession._id, {
        newDate: rescheduleDate,
        newStartTime: rescheduleStart,
        newEndTime: rescheduleEnd,
        reason: rescheduleReason.trim(),
      });
      if (res.success) {
        toast.success("Session rescheduled successfully.");
        setReschedulingSession(null);
        fetchSchedule();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reschedule session");
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleOpenCancel = (session: TuitionSession) => {
    setCancellingSession(session);
    setCancelReason("Session cancelled due to unavoidable conflict");
  };

  const handleSubmitCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSession) return;

    try {
      setSubmittingCancel(true);
      const res = await tuitionService.cancelSession(cancellingSession._id, cancelReason.trim());
      if (res.success) {
        toast.success("Session cancelled.");
        setCancellingSession(null);
        fetchSchedule();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel session");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleCreateNewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionData.offeringId || !newSessionData.title.trim()) {
      return toast.error("Offering and Title are required");
    }

    try {
      setSubmittingNewSession(true);
      const payload: any = {
        offeringId: newSessionData.offeringId,
        title: newSessionData.title.trim(),
        topic: newSessionData.topic.trim(),
        sessionDate: newSessionData.sessionDate,
        startTime: newSessionData.startTime,
        endTime: newSessionData.endTime,
      };
      if (newSessionData.batchId) {
        payload.batchId = newSessionData.batchId;
      }
      const res = await tuitionService.createSession(payload);
      if (res.success) {
        toast.success("New tuition session scheduled!");
        setShowNewSessionModal(false);
        setNewSessionData({
          offeringId: offerings[0]?._id || "",
          batchId: "",
          title: "",
          topic: "",
          sessionDate: new Date().toISOString().split("T")[0],
          startTime: "18:00",
          endTime: "19:00",
        });
        fetchSchedule();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create session");
    } finally {
      setSubmittingNewSession(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={false} text="Loading Provider Schedule..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tuition Schedule & Live Classes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage live sessions, launch EduPye SmartBoard classrooms, and record attendance
          </p>
        </div>

        <button
          onClick={() => setShowNewSessionModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* Batches Timetable Overview */}
      <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#0091ff]" />
          <span>Active Batch Timetable</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {batches.map((b) => (
            <div key={b._id} className="p-3 bg-[#f8fafc] border border-slate-200/80 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{b.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                  {b.enrolledCount}/{b.maxCapacity} Enrolled
                </span>
              </div>
              <p className="text-slate-600 font-medium">Days: {b.daysOfWeek.join(", ")}</p>
              <p className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{b.startTime} - {b.endTime} IST</span>
              </p>
            </div>
          ))}
          {batches.length === 0 && (
            <p className="col-span-full text-xs text-slate-400 italic">No recurring batches active.</p>
          )}
        </div>
      </div>

      {/* Scheduled Live Sessions Table */}
      <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0091ff]" />
          <span>Scheduled Class Sessions</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{session.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      session.status === "live"
                        ? "bg-red-100 text-red-700 animate-pulse"
                        : session.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>
                    {new Date(session.sessionDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span>&bull;</span>
                  <span>{session.startTime} - {session.endTime}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{session.studentIds?.length || 0} students enrolled</span>
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {session.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(session._id, "live")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start Class</span>
                    </button>
                    <button
                      onClick={() => handleOpenReschedule(session)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                      title="Reschedule session"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      onClick={() => handleOpenCancel(session)}
                      className="flex items-center gap-1 px-2.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors"
                      title="Cancel session"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}

                {session.status === "live" && (
                  <>
                    <Link
                      to={session.meetingLink || `/teacher/smartboard/integrated`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join SmartBoard</span>
                    </Link>
                    <button
                      onClick={() => handleUpdateStatus(session._id, "completed")}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      End Class
                    </button>
                  </>
                )}

                {session.status === "completed" && (
                  <button
                    onClick={() => handleOpenAttendance(session)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attendance Records</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium">No sessions scheduled currently.</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Modal */}
      <Modal
        isOpen={Boolean(selectedSessionForAttendance)}
        onClose={() => setSelectedSessionForAttendance(null)}
        title="Mark Session Attendance"
      >
        <form onSubmit={handleSubmitAttendance} className="space-y-4">
          <p className="text-xs text-slate-600">
            Select attendance status for each enrolled student. Present records increment the student's attended sessions.
          </p>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {attendanceRecords.map((record, index) => {
              const studentObj = (selectedSessionForAttendance?.studentIds || []).find((s: any) => {
                const sId = typeof s === "object" ? s._id : s;
                return sId === record.studentId;
              });
              const name = typeof studentObj === "object" ? (studentObj as any).name : `Student ${index + 1}`;

              return (
                <div
                  key={record.studentId}
                  className="flex items-center justify-between p-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-xs"
                >
                  <span className="font-bold text-slate-800">{name}</span>
                  <div className="flex items-center gap-1.5">
                    {["present", "absent", "late"].map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => {
                          const updated = [...attendanceRecords];
                          updated[index].status = st;
                          setAttendanceRecords(updated);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-colors ${
                          record.status === st
                            ? st === "present"
                              ? "bg-emerald-600 text-white"
                              : st === "absent"
                              ? "bg-rose-600 text-white"
                              : "bg-amber-600 text-white"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedSessionForAttendance(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAttendance}
              className="px-4 py-2 text-xs font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-lg shadow-xs"
            >
              {submittingAttendance ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={Boolean(reschedulingSession)}
        onClose={() => setReschedulingSession(null)}
        title="Reschedule Tuition Session"
      >
        <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Rescheduling will update student calendars and verify that you do not have conflicting sessions at the new interval.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">New Session Date</label>
            <input
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Time (24h)</label>
              <input
                type="time"
                required
                value={rescheduleStart}
                onChange={(e) => setRescheduleStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Time (24h)</label>
              <input
                type="time"
                required
                value={rescheduleEnd}
                onChange={(e) => setRescheduleEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Rescheduling</label>
            <textarea
              rows={2}
              required
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="e.g. Schedule adjustment or technical upgrade"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReschedulingSession(null)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReschedule}
              className="px-4 py-2 font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-lg shadow-xs"
            >
              {submittingReschedule ? "Rescheduling..." : "Confirm Reschedule"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Session Modal */}
      <Modal
        isOpen={Boolean(cancellingSession)}
        onClose={() => setCancellingSession(null)}
        title="Cancel Scheduled Session"
      >
        <form onSubmit={handleSubmitCancel} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to cancel session <strong>{cancellingSession?.title}</strong>? Students will be notified.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cancellation Reason</label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="State reason for session cancellation"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancellingSession(null)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Keep Session
            </button>
            <button
              type="submit"
              disabled={submittingCancel}
              className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
            >
              {submittingCancel ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </Modal>

      {/* New Session Modal */}
      <Modal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        title="Schedule New Tuition Session"
      >
        <form onSubmit={handleCreateNewSession} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Offering</label>
            <select
              value={newSessionData.offeringId}
              onChange={(e) => setNewSessionData({ ...newSessionData, offeringId: e.target.value, batchId: "" })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
            >
              {offerings.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.title} ({o.subject} - {o.classFormat})
                </option>
              ))}
            </select>
          </div>

          {batches.filter((b) => {
            const bOffId = typeof b.offeringId === "object" ? b.offeringId?._id : b.offeringId;
            return bOffId === newSessionData.offeringId;
          }).length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Batch (Optional)</label>
              <select
                value={newSessionData.batchId}
                onChange={(e) => setNewSessionData({ ...newSessionData, batchId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
              >
                <option value="">All Cohort / 1:1 Enrolments</option>
                {batches
                  .filter((b) => {
                    const bOffId = typeof b.offeringId === "object" ? b.offeringId?._id : b.offeringId;
                    return bOffId === newSessionData.offeringId;
                  })
                  .map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.title} ({b.daysOfWeek.join(", ")})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Session Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Masterclass: Electrostatics Field Calculations"
              value={newSessionData.title}
              onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Topic / Agenda (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Gauss's Law Applications & Numerical Drill"
              value={newSessionData.topic}
              onChange={(e) => setNewSessionData({ ...newSessionData, topic: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={newSessionData.sessionDate}
                onChange={(e) => setNewSessionData({ ...newSessionData, sessionDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={newSessionData.startTime}
                onChange={(e) => setNewSessionData({ ...newSessionData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={newSessionData.endTime}
                onChange={(e) => setNewSessionData({ ...newSessionData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewSessionModal(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingNewSession}
              className="px-4 py-2 font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-lg shadow-xs"
            >
              {submittingNewSession ? "Scheduling..." : "Schedule Session"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

