import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Users,
  Calendar,
  Clock,
  Layers,
  CheckCircle,
  X,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Info,
  Check,
} from "lucide-react";
import { tuitionService } from "../../services/tuitionService";
import { TuitionOffering, TuitionBatch } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../hooks/useToast";

export default function TuitionProviderOfferings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"offerings" | "batches">("offerings");

  const [offerings, setOfferings] = useState<TuitionOffering[]>([]);
  const [batches, setBatches] = useState<TuitionBatch[]>([]);

  // Filter & Search states
  const [offeringSearch, setOfferingSearch] = useState("");
  const [offeringFormatFilter, setOfferingFormatFilter] = useState("All");
  const [offeringStatusFilter, setOfferingStatusFilter] = useState("All");

  const [batchSearch, setBatchSearch] = useState("");
  const [batchStatusFilter, setBatchStatusFilter] = useState("All");

  // Modals state
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState<TuitionOffering | null>(null);
  const [viewingOffering, setViewingOffering] = useState<TuitionOffering | null>(null);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<TuitionBatch | null>(null);
  const [viewingBatch, setViewingBatch] = useState<TuitionBatch | null>(null);
  const [selectedOfferingForBatch, setSelectedOfferingForBatch] = useState<TuitionOffering | null>(null);

  // Offering Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [description, setDescription] = useState("");
  const [teachingMode, setTeachingMode] = useState<"online" | "offline" | "hybrid">("online");
  const [classFormat, setClassFormat] = useState<"1:1" | "1:2" | "group" | "1:N">("group");
  const [scheduleModel, setScheduleModel] = useState<"fixed_batch" | "flexible_slot">("fixed_batch");
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [feeAmount, setFeeAmount] = useState(3000);
  const [billingUnit, setBillingUnit] = useState<"per_session" | "monthly" | "batch" | "hourly">("monthly");
  const [availableDays, setAvailableDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [duration, setDuration] = useState("8 Weeks");
  const [startDate, setStartDate] = useState("");
  const [offeringStatus, setOfferingStatus] = useState<"published" | "draft">("published");

  // Batch Form state
  const [batchOfferingId, setBatchOfferingId] = useState("");
  const [batchTitle, setBatchTitle] = useState("");
  const [batchDays, setBatchDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [batchStartTime, setBatchStartTime] = useState("18:00");
  const [batchEndTime, setBatchEndTime] = useState("19:30");
  const [batchCapacity, setBatchCapacity] = useState(10);
  const [batchStartDate, setBatchStartDate] = useState("");
  const [batchEndDate, setBatchEndDate] = useState("");
  const [batchStatus, setBatchStatus] = useState<"upcoming" | "active" | "completed" | "cancelled">("active");
  const [batchNotes, setBatchNotes] = useState("");

  const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offRes, batchRes] = await Promise.all([
        tuitionService.getMyOfferings(),
        tuitionService.getMyBatches(),
      ]);
      setOfferings(offRes.offerings || []);
      setBatches(batchRes.batches || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load offerings and batches");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // OFFERING HANDLERS
  // -------------------------------------------------------------
  const resetOfferingForm = () => {
    setTitle("");
    setSubject("");
    setClassLevel("");
    setDescription("");
    setTeachingMode("online");
    setClassFormat("group");
    setScheduleModel("fixed_batch");
    setMaxCapacity(10);
    setFeeAmount(3000);
    setBillingUnit("monthly");
    setAvailableDays(["Monday", "Wednesday", "Friday"]);
    setDuration("8 Weeks");
    setStartDate("");
    setOfferingStatus("published");
    setEditingOffering(null);
  };

  const handleOpenCreateOffering = () => {
    resetOfferingForm();
    setShowOfferingModal(true);
  };

  const handleOpenEditOffering = (off: TuitionOffering) => {
    setEditingOffering(off);
    setTitle(off.title || "");
    setSubject(off.subject || "");
    setClassLevel(off.classLevel || "");
    setDescription(off.description || "");
    setTeachingMode(off.teachingMode || "online");
    setClassFormat(off.classFormat || "group");
    setScheduleModel(off.scheduleModel || "fixed_batch");
    setMaxCapacity(off.maxCapacity || 10);
    setFeeAmount(off.feeAmount || 0);
    setBillingUnit(off.billingUnit || "monthly");
    setAvailableDays(off.availableDays || []);
    setDuration(off.duration || (off.durationWeeks ? `${off.durationWeeks} Weeks` : ""));
    setStartDate(off.startDate ? new Date(off.startDate).toISOString().split("T")[0] : "");
    setOfferingStatus((off.status as any) || (off.isActive ? "published" : "draft"));
    setShowOfferingModal(true);
  };

  const toggleOfferingDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !classLevel.trim()) {
      return toast.error("Title, subject, and class level are required");
    }
    if (feeAmount < 0) {
      return toast.error("Fee amount cannot be negative");
    }

    try {
      const payload: any = {
        title: title.trim(),
        subject: subject.trim(),
        classLevel: classLevel.trim(),
        description: description.trim(),
        teachingMode,
        classFormat,
        scheduleModel,
        maxCapacity:
          classFormat === "1:1"
            ? 1
            : classFormat === "1:2"
            ? 2
            : Math.max(1, Number(maxCapacity)),
        feeAmount: Number(feeAmount),
        billingUnit,
        availableDays,
        duration: duration.trim(),
        startDate: startDate ? new Date(startDate) : undefined,
        status: offeringStatus,
      };

      if (editingOffering) {
        const res = await tuitionService.updateOffering(editingOffering._id, payload);
        if (res.success) {
          toast.success("Tuition offering updated successfully!");
          setShowOfferingModal(false);
          resetOfferingForm();
          fetchData();
        }
      } else {
        const res = await tuitionService.createOffering(payload);
        if (res.success) {
          toast.success("New tuition offering published successfully!");
          setShowOfferingModal(false);
          resetOfferingForm();
          fetchData();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save offering");
    }
  };

  const handleDeleteOffering = async (offeringId: string) => {
    if (!window.confirm("Are you sure you want to archive this offering? Active batches will be safely cancelled.")) {
      return;
    }

    try {
      const res = await tuitionService.deleteOffering(offeringId);
      if (res.success) {
        toast.success("Offering archived successfully");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to archive offering");
    }
  };

  // -------------------------------------------------------------
  // BATCH HANDLERS
  // -------------------------------------------------------------
  const resetBatchForm = () => {
    setBatchOfferingId(offerings[0]?._id || "");
    setBatchTitle("");
    setBatchDays(["Monday", "Wednesday", "Friday"]);
    setBatchStartTime("18:00");
    setBatchEndTime("19:30");
    setBatchCapacity(10);
    setBatchStartDate("");
    setBatchEndDate("");
    setBatchStatus("active");
    setBatchNotes("");
    setEditingBatch(null);
    setSelectedOfferingForBatch(null);
  };

  const handleOpenCreateBatch = (offering?: TuitionOffering) => {
    resetBatchForm();
    const targetOffering = offering || offerings[0];
    if (targetOffering) {
      setSelectedOfferingForBatch(targetOffering);
      setBatchOfferingId(targetOffering._id);
      setBatchTitle(`${targetOffering.subject} Cohort ${batches.length + 1}`);
      setBatchCapacity(targetOffering.maxCapacity || 10);
    }
    setShowBatchModal(true);
  };

  const handleOpenEditBatch = (batch: TuitionBatch) => {
    setEditingBatch(batch);
    const bOffId = typeof batch.offeringId === "object" ? (batch.offeringId as any)._id : batch.offeringId;
    setBatchOfferingId(bOffId);
    setBatchTitle(batch.title || "");
    setBatchDays(batch.daysOfWeek || []);
    setBatchStartTime(batch.startTime || "18:00");
    setBatchEndTime(batch.endTime || "19:30");
    setBatchCapacity(batch.maxCapacity || 10);
    setBatchStartDate(batch.startDate ? new Date(batch.startDate).toISOString().split("T")[0] : "");
    setBatchEndDate(batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : "");
    setBatchStatus(batch.status || "active");
    setBatchNotes(batch.notes || "");
    setShowBatchModal(true);
  };

  const toggleBatchDay = (day: string) => {
    setBatchDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTitle.trim()) {
      return toast.error("Batch title is required");
    }
    if (batchDays.length === 0) {
      return toast.error("Select at least one recurring day of the week");
    }
    if (batchStartTime >= batchEndTime) {
      return toast.error("Batch start time must be earlier than end time");
    }

    try {
      const payload: any = {
        offeringId: batchOfferingId,
        title: batchTitle.trim(),
        daysOfWeek: batchDays,
        startTime: batchStartTime,
        endTime: batchEndTime,
        maxCapacity: Number(batchCapacity),
        startDate: batchStartDate ? new Date(batchStartDate) : new Date(),
        endDate: batchEndDate ? new Date(batchEndDate) : undefined,
        status: batchStatus,
        notes: batchNotes.trim(),
      };

      if (editingBatch) {
        if (Number(batchCapacity) < editingBatch.enrolledCount) {
          return toast.error(
            `Cannot set capacity below current enrolled count (${editingBatch.enrolledCount})`
          );
        }
        const res = await tuitionService.updateBatch(editingBatch._id, payload);
        if (res.success) {
          toast.success("Batch updated successfully!");
          setShowBatchModal(false);
          resetBatchForm();
          fetchData();
        }
      } else {
        const res = await tuitionService.createBatch(payload);
        if (res.success) {
          toast.success("Recurring batch created successfully!");
          setShowBatchModal(false);
          resetBatchForm();
          fetchData();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save batch");
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm("Are you sure you want to cancel this batch?")) {
      return;
    }

    try {
      const res = await tuitionService.deleteBatch(batchId);
      if (res.success) {
        toast.success("Batch cancelled successfully");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel batch");
    }
  };

  // Filtered lists
  const filteredOfferings = offerings.filter((off) => {
    const matchSearch =
      !offeringSearch.trim() ||
      off.title.toLowerCase().includes(offeringSearch.toLowerCase()) ||
      off.subject.toLowerCase().includes(offeringSearch.toLowerCase()) ||
      off.classLevel.toLowerCase().includes(offeringSearch.toLowerCase());
    const matchFormat =
      offeringFormatFilter === "All" || off.classFormat === offeringFormatFilter;
    const matchStatus =
      offeringStatusFilter === "All" ||
      (offeringStatusFilter === "published" && (off.status === "published" || !off.status) && off.isActive) ||
      (offeringStatusFilter === "draft" && off.status === "draft") ||
      (offeringStatusFilter === "archived" && (off.status === "archived" || !off.isActive));
    return matchSearch && matchFormat && matchStatus;
  });

  const filteredBatches = batches.filter((b) => {
    const matchSearch =
      !batchSearch.trim() ||
      b.title.toLowerCase().includes(batchSearch.toLowerCase()) ||
      (typeof b.offeringId === "object" && (b.offeringId as any)?.title?.toLowerCase()?.includes(batchSearch.toLowerCase()));
    const matchStatus = batchStatusFilter === "All" || b.status === batchStatusFilter;
    return matchSearch && matchStatus;
  });

  const totalCapacitySum = batches.reduce((acc, b) => acc + (b.maxCapacity || 0), 0);
  const totalEnrolledSum = batches.reduce((acc, b) => acc + (b.enrolledCount || 0), 0);
  const activeBatchesCount = batches.filter((b) => b.status === "active").length;

  if (loading) {
    return <Loader fullScreen={false} text="Loading Tuition Studio Offerings..." />;
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tuition Offerings & Batches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure 1:1, 1:2, and group cohorts with capacity limits, scheduled timing, and fee structures
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "offerings" ? (
            <button
              onClick={handleOpenCreateOffering}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Offering</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenCreateBatch()}
              disabled={offerings.length === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 ${
                offerings.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#0091ff] hover:bg-[#0077d6] text-white"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Create Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offerings</span>
            <BookOpen className="w-4 h-4 text-[#0091ff]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{offerings.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Active curriculum offerings</p>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Batches</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{activeBatchesCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{batches.length} cohorts configured</p>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Students</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{totalEnrolledSum}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all recurring batches</p>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Seats</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{totalCapacitySum}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {totalCapacitySum > 0 ? `${Math.round((totalEnrolledSum / totalCapacitySum) * 100)}% utilization` : "0% utilization"}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("offerings")}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "offerings"
              ? "border-[#0091ff] text-[#0091ff]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Offerings</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700">
            {offerings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("batches")}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "batches"
              ? "border-[#0091ff] text-[#0091ff]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Batches</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700">
            {batches.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OFFERINGS MANAGEMENT */}
      {activeTab === "offerings" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={offeringSearch}
                onChange={(e) => setOfferingSearch(e.target.value)}
                placeholder="Search offerings by title, subject, grade level..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0091ff]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={offeringFormatFilter}
                onChange={(e) => setOfferingFormatFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0091ff] bg-white text-slate-700 font-medium"
              >
                <option value="All">All Formats</option>
                <option value="1:1">1:1 Mentorship</option>
                <option value="1:2">1:2 Small Group</option>
                <option value="group">1:N Cohort</option>
              </select>

              <select
                value={offeringStatusFilter}
                onChange={(e) => setOfferingStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0091ff] bg-white text-slate-700 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Offerings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOfferings.map((offering) => {
              const linkedBatches = batches.filter((b) => {
                const bOffId = typeof b.offeringId === "object" ? (b.offeringId as any)?._id : b.offeringId;
                return bOffId === offering._id;
              });

              const isArchived = offering.status === "archived" || !offering.isActive;
              const isDraft = offering.status === "draft";

              return (
                <div
                  key={offering._id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 ${
                    isArchived ? "border-slate-200 opacity-70 bg-slate-50/50" : "border-[#e2ebf4]"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700">
                          {offering.classFormat} &bull; {offering.teachingMode}
                        </span>
                        {isArchived ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                            Archived
                          </span>
                        ) : isDraft ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700">
                            Draft
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700">
                            Published
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block">
                          ₹{offering.feeAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">/{offering.billingUnit}</span>
                      </div>
                    </div>

                    {/* Title & Metadata */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{offering.title}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {offering.subject} &bull; {offering.classLevel}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{offering.description}</p>

                    {/* Offering Attributes */}
                    <div className="bg-[#f8fafc] border border-slate-200/60 rounded-xl p-3 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Model:</span>
                        <span className="font-bold text-slate-700">
                          {offering.scheduleModel === "fixed_batch" ? "Fixed Recurring Batches" : "Flexible 1:1 Slots"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Max Capacity:</span>
                        <span className="font-bold text-slate-700">{offering.maxCapacity} students</span>
                      </div>
                      {offering.availableDays && offering.availableDays.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Days:</span>
                          <span className="font-bold text-slate-700 line-clamp-1">
                            {offering.availableDays.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Linked Batches Preview */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Cohorts ({linkedBatches.length})</span>
                        {!isArchived && offering.scheduleModel === "fixed_batch" && (
                          <button
                            onClick={() => handleOpenCreateBatch(offering)}
                            className="text-[11px] text-[#0091ff] hover:underline"
                          >
                            + Add Batch
                          </button>
                        )}
                      </div>

                      {linkedBatches.length > 0 ? (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {linkedBatches.map((b) => (
                            <div
                              key={b._id}
                              className="bg-white border border-slate-200 rounded-lg p-2 text-xs flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-slate-800 block text-[11px] truncate">{b.title}</span>
                                <span className="text-[10px] text-slate-500">
                                  {b.daysOfWeek.slice(0, 2).join(", ")} &bull; {b.startTime}-{b.endTime}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                  b.enrolledCount >= b.maxCapacity
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {b.enrolledCount}/{b.maxCapacity} seats
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No batches created for this offering</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingOffering(offering)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditOffering(offering)}
                        className="p-1.5 text-slate-500 hover:text-[#0091ff] rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Offering"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!isArchived && (
                        <button
                          onClick={() => handleDeleteOffering(offering._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Archive Offering"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOfferings.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white border border-[#e2ebf4] rounded-2xl">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No Offerings Match Filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Adjust your search terms or create a new offering to publish to the EduPye student marketplace.
                </p>
                <button
                  onClick={handleOpenCreateOffering}
                  className="px-4 py-2 bg-[#0091ff] hover:bg-[#0077d6] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Create New Offering
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BATCHES MANAGEMENT */}
      {activeTab === "batches" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                placeholder="Search batches by cohort name or linked offering..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0091ff]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={batchStatusFilter}
                onChange={(e) => setBatchStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0091ff] bg-white text-slate-700 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Batches Table / List */}
          <div className="bg-white border border-[#e2ebf4] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Batch Details</th>
                    <th className="py-3.5 px-4">Offering & Subject</th>
                    <th className="py-3.5 px-4">Schedule & Timing</th>
                    <th className="py-3.5 px-4">Seat Capacity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map((batch) => {
                    const off = typeof batch.offeringId === "object" ? (batch.offeringId as any) : null;
                    const percentFilled = Math.min(100, Math.round(((batch.enrolledCount || 0) / (batch.maxCapacity || 1)) * 100));

                    return (
                      <tr key={batch._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block text-xs">{batch.title}</span>
                          <span className="text-[10px] text-slate-400">
                            Started: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "Immediate"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block truncate max-w-[200px]">
                            {off?.title || batch.subject || "Tuition Offering"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {batch.subject || off?.subject} &bull; {batch.classLevel || off?.classLevel}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-700 block">
                            {batch.daysOfWeek.join(", ")}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {batch.startTime} - {batch.endTime}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="w-32 space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                              <span>{batch.enrolledCount} enrolled</span>
                              <span className="text-slate-400">/{batch.maxCapacity}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percentFilled >= 100
                                    ? "bg-rose-500"
                                    : percentFilled >= 75
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${percentFilled}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              batch.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : batch.status === "upcoming"
                                ? "bg-blue-50 text-blue-700"
                                : batch.status === "completed"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {batch.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingBatch(batch)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                              title="Batch Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditBatch(batch)}
                              className="p-1.5 text-slate-500 hover:text-[#0091ff] rounded-lg hover:bg-slate-100"
                              title="Edit Batch"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {batch.status !== "cancelled" && (
                              <button
                                onClick={() => handleDeleteBatch(batch._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                title="Cancel Batch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredBatches.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs italic">
                        No tuition batches found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CREATE / EDIT OFFERING                           */}
      {/* ========================================================= */}
      <Modal
        isOpen={showOfferingModal}
        onClose={() => setShowOfferingModal(false)}
        title={editingOffering ? "Edit Tuition Offering" : "Create Tuition Offering"}
      >
        <form onSubmit={handleSaveOffering} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Offering Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class 12 CBSE & JEE Physics Masterclass"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Physics"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade *</label>
              <input
                type="text"
                required
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                placeholder="Class 12"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Format *</label>
              <select
                value={classFormat}
                onChange={(e) => setClassFormat(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              >
                <option value="1:1">1:1 Mentorship</option>
                <option value="1:2">1:2 Small Group</option>
                <option value="group">1:N Cohort</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mode *</label>
              <select
                value={teachingMode}
                onChange={(e) => setTeachingMode(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Model</label>
              <select
                value={scheduleModel}
                onChange={(e) => setScheduleModel(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              >
                <option value="fixed_batch">Fixed Batches</option>
                <option value="flexible_slot">Flexible 1:1 Slots</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fee Amount (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={feeAmount}
                onChange={(e) => setFeeAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Period</label>
              <select
                value={billingUnit}
                onChange={(e) => setBillingUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              >
                <option value="monthly">Monthly</option>
                <option value="per_session">Per Session</option>
                <option value="hourly">Hourly</option>
                <option value="batch">Complete Batch</option>
              </select>
            </div>
          </div>

          {classFormat === "group" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Cohort Capacity</label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Available Days</label>
            <div className="flex flex-wrap gap-1.5">
              {daysList.map((day) => {
                const isSelected = availableDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleOfferingDay(day)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      isSelected
                        ? "bg-[#0091ff] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 Weeks or 3 Months"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={offeringStatus}
                onChange={(e) => setOfferingStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              >
                <option value="published">Published (Visible in Marketplace)</option>
                <option value="draft">Draft (Private)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Syllabus</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline syllabus milestones, key prerequisites, homework review, and test series..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowOfferingModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-lg shadow-xs"
            >
              {editingOffering ? "Update Offering" : "Publish Offering"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: OFFERING DETAILS VIEW                            */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(viewingOffering)}
        onClose={() => setViewingOffering(null)}
        title={viewingOffering?.title || "Offering Details"}
      >
        {viewingOffering && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Tuition Fee
                </span>
                <span className="text-base font-black text-slate-900">
                  ₹{viewingOffering.feeAmount.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">/{viewingOffering.billingUnit}</span>
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {viewingOffering.classFormat} &bull; {viewingOffering.teachingMode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Subject</span>
                <span className="font-bold text-slate-800">{viewingOffering.subject}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Class / Level</span>
                <span className="font-bold text-slate-800">{viewingOffering.classLevel}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Schedule Model</span>
                <span className="font-bold text-slate-800">{viewingOffering.scheduleModel}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Max Student Capacity</span>
                <span className="font-bold text-slate-800">{viewingOffering.maxCapacity} students</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Available Days</span>
              <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                {viewingOffering.availableDays?.join(", ") || "Flexible"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Syllabus & Overview</span>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {viewingOffering.description || "No description provided"}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingOffering(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: CREATE / EDIT BATCH                              */}
      {/* ========================================================= */}
      <Modal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title={editingBatch ? "Edit Tuition Batch" : "Create Recurring Batch"}
      >
        <form onSubmit={handleSaveBatch} className="space-y-4">
          {!editingBatch && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Associated Offering *</label>
              <select
                required
                value={batchOfferingId}
                onChange={(e) => {
                  setBatchOfferingId(e.target.value);
                  const off = offerings.find((o) => o._id === e.target.value);
                  if (off) {
                    setBatchCapacity(off.maxCapacity || 10);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              >
                {offerings.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.title} ({o.subject} - {o.classLevel})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Batch Cohort Name *</label>
            <input
              type="text"
              required
              value={batchTitle}
              onChange={(e) => setBatchTitle(e.target.value)}
              placeholder="e.g. Evening Masterclass Cohort A"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recurring Teaching Days *</label>
            <div className="flex flex-wrap gap-1.5">
              {daysList.map((day) => {
                const isSelected = batchDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleBatchDay(day)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      isSelected
                        ? "bg-[#0091ff] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time (24h) *</label>
              <input
                type="text"
                required
                value={batchStartTime}
                onChange={(e) => setBatchStartTime(e.target.value)}
                placeholder="18:00"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time (24h) *</label>
              <input
                type="text"
                required
                value={batchEndTime}
                onChange={(e) => setBatchEndTime(e.target.value)}
                placeholder="19:30"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Student Capacity *</label>
              <input
                type="number"
                min={editingBatch ? editingBatch.enrolledCount || 1 : 1}
                max={50}
                required
                value={batchCapacity}
                onChange={(e) => setBatchCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
              {editingBatch && (
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Current enrolled: {editingBatch.enrolledCount} students
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={batchStatus}
                onChange={(e) => setBatchStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={batchStartDate}
                onChange={(e) => setBatchStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={batchEndDate}
                onChange={(e) => setBatchEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Batch Notes</label>
            <textarea
              rows={2}
              value={batchNotes}
              onChange={(e) => setBatchNotes(e.target.value)}
              placeholder="Internal schedule notes, target syllabus progress..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowBatchModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#0091ff] hover:bg-[#0077d6] text-white rounded-lg shadow-xs"
            >
              {editingBatch ? "Update Batch" : "Create Batch"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: BATCH DETAILS VIEW                               */}
      {/* ========================================================= */}
      <Modal
        isOpen={Boolean(viewingBatch)}
        onClose={() => setViewingBatch(null)}
        title={viewingBatch?.title || "Batch Details"}
      >
        {viewingBatch && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Capacity & Enrolment
                </span>
                <span className="text-base font-black text-slate-900">
                  {viewingBatch.enrolledCount} / {viewingBatch.maxCapacity} seats filled
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  viewingBatch.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : viewingBatch.status === "upcoming"
                    ? "bg-blue-100 text-blue-800"
                    : viewingBatch.status === "completed"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {viewingBatch.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Teaching Days</span>
                <span className="font-bold text-slate-800">{viewingBatch.daysOfWeek?.join(", ")}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Timing</span>
                <span className="font-bold text-slate-800">
                  {viewingBatch.startTime} - {viewingBatch.endTime}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Start Date</span>
                <span className="font-bold text-slate-800">
                  {viewingBatch.startDate ? new Date(viewingBatch.startDate).toLocaleDateString() : "Immediate"}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">End Date</span>
                <span className="font-bold text-slate-800">
                  {viewingBatch.endDate ? new Date(viewingBatch.endDate).toLocaleDateString() : "Ongoing"}
                </span>
              </div>
            </div>

            {viewingBatch.notes && (
              <div>
                <span className="text-slate-500 font-bold block mb-1">Notes</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {viewingBatch.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingBatch(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
