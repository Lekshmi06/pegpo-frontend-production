import React, { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  CheckCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { tuitionService } from "../../services/tuitionService";
import { TuitionTransaction } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { useToast } from "../../hooks/useToast";

export default function TuitionProviderFinancials() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<TuitionTransaction[]>([]);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const res = await tuitionService.getProviderFinancials();
      if (res.success) {
        setSummary(res.financials.summary);
        setTransactions(res.financials.transactions || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load tuition financials");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
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
    return <Loader fullScreen={false} text="Loading Financial Ledger..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tuition Earnings & Financial Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Independent ledger for tuition fees, gross earnings, and student transaction histories
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Gross Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{summary?.totalGrossEarnings?.toLocaleString() ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {summary?.transactionCount ?? 0} total transactions
          </span>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Net Received</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{summary?.netEarnings?.toLocaleString() ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active realized balance</span>
        </div>

        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Refunded</span>
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{summary?.totalRefunded?.toLocaleString() ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">0 reversals recorded</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#e2ebf4] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#e2ebf4] flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#0091ff]" />
            <span>Transaction Ledger</span>
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
    </div>
  );
}

