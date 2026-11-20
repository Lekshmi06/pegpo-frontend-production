import React, { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  CheckCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Video,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { tuitionService } from "../../services/tuitionService";
import { TuitionTransaction } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { useToast } from "../../hooks/useToast";

export default function TuitionProviderFinancials() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"payouts" | "transactions">("payouts");

  // Teacher Payouts state
  const [payouts, setPayouts] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [pendingAmount, setPendingAmount] = useState<number>(0);

  // Provider transactions state
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<TuitionTransaction[]>([]);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);

      // 1. Fetch Teacher Payouts
      const payoutRes = await tuitionService.getTeacherPayouts().catch(() => null);
      if (payoutRes && payoutRes.success) {
        setPayouts(payoutRes.payouts || []);
        setTotalEarned(payoutRes.totalEarned || 0);
        setPendingAmount(payoutRes.pendingAmount || 0);
      }

      // 2. Fetch Provider Financials
      const finRes = await tuitionService.getProviderFinancials().catch(() => null);
      if (finRes && finRes.success && finRes.financials) {
        setSummary(finRes.financials.summary);
        setTransactions(finRes.financials.transactions || []);
      }
    } catch (err: any) {
      console.warn("Could not load tuition financials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (activeView === "payouts") {
      if (payouts.length === 0) return toast.info("No teaching payouts to export");
      const headers = ["Session ID", "Subject", "Duration (Hrs)", "Rate", "Total (INR)", "Attendance", "Status", "Date"];
      const rows = payouts.map((p) => [
        p._id,
        p.subject || "Tuition Lecture",
        p.durationHours,
        p.payoutRate,
        p.totalAmount,
        p.attendanceVerified ? "Verified" : "Pending",
        p.status,
        new Date(p.createdAt).toLocaleDateString(),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `teacher_payouts_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Teacher payouts CSV exported");
      return;
    }

    if (transactions.length === 0) return toast.info("No transactions to export");
    const headers = ["Transaction ID", "Student", "Offering", "Amount", "Status", "Date"];
    const rows = transactions.map((t) => [
      t.gatewayTransactionId,
      typeof t.studentId === "object" ? t.studentId?.name || "Student" : t.studentId,
      typeof t.offeringId === "object" ? t.offeringId?.title || "Tuition" : t.offeringId,
      t.grossAmount,
      t.status,
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tuition_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export initiated");
  };

  if (loading) {
    return <Loader fullScreen={false} text="Loading Tuition Financials..." />;
  }

  const effectiveGross = totalEarned + (summary?.totalGrossEarnings || 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 uppercase tracking-wide">
              Centralized Tuition Ledger
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Teacher Tuition Earnings &amp; Payouts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent tracking for completed SmartBoard lectures, verified attendance, and admin disbursement status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Disbursed Earnings</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{totalEarned.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Realized &amp; paid into account
          </span>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Pending Admin Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{pendingAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            Verified attendance awaiting payout cycle
          </span>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Classes Logged</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {payouts.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Completed WebRTC SmartBoard sessions
          </span>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveView("payouts")}
          className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
            activeView === "payouts"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Teaching Sessions &amp; Payouts ({payouts.length})</span>
        </button>

        {transactions.length > 0 && (
          <button
            onClick={() => setActiveView("transactions")}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeView === "transactions"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Student Fee Transactions ({transactions.length})</span>
          </button>
        )}
      </div>

      {/* Payouts Table */}
      {activeView === "payouts" && (
        <div className="bg-white border border-[#e2ebf4] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#e2ebf4] flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Teaching Session Ledger &amp; Disbursement Status</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Standard rate: ₹600/hr</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 border-b border-[#e2ebf4] font-bold">
                <tr>
                  <th className="py-3 px-4">Session Date</th>
                  <th className="py-3 px-4">Class / Subject</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Payout Rate</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((p) => {
                  const sTitle = p.sessionId?.title || p.subject || "Live SmartBoard Class";
                  const sDate = p.sessionId?.sessionDate || p.createdAt;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {new Date(sDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                        {sTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {p.durationHours} hrs
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        ₹{p.payoutRate}/hr
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{p.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.status === "disbursed" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Disbursed
                          </span>
                        ) : p.status === "approved" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Approved by Admin
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Pending Review
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Video className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">No completed teaching payouts logged yet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Completed Live SmartBoard sessions automatically record attendance and queue payouts here for Admin approval.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {activeView === "transactions" && (
        <div className="bg-white border border-[#e2ebf4] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#e2ebf4] flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#0091ff]" />
              <span>Student Transaction Ledger</span>
            </h3>
            <span className="text-xs text-slate-500">Method: Simulated Payment Gateway</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 border-b border-[#e2ebf4] font-bold">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Offering</th>
                  <th className="py-3 px-4">Gross Fee</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const sName = typeof tx.studentId === "object" ? tx.studentId?.name : "Student";
                  const offTitle = typeof tx.offeringId === "object" ? tx.offeringId?.title : "Tuition";

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {tx.gatewayTransactionId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sName}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{offTitle}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{tx.grossAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 uppercase text-[10px] font-bold">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-medium">No financial transactions recorded yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

