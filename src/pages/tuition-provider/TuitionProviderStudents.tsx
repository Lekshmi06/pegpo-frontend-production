import React, { useEffect, useState } from "react";
import { Users, Mail, BookOpen, CheckCircle, Clock } from "lucide-react";
import { tuitionService } from "../../services/tuitionService";
import { TuitionEnrollment } from "../../types/tuition";
import { Loader } from "../../components/ui/Loader";
import { useToast } from "../../hooks/useToast";

export default function TuitionProviderStudents() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await tuitionService.getProviderFinancials();
      if (res.success) {
        setStudents(res.financials.studentBreakdown || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={false} text="Loading Tuition Students..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          My Tuition Students
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View all students actively enrolled in your 1:1 and group tuition cohorts
        </p>
      </div>

      <div className="bg-white border border-[#e2ebf4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-500 border-b border-[#e2ebf4] font-bold">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Enrolment Count</th>
                <th className="py-3.5 px-4">Total Paid (₹)</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center text-xs">
                      {student.studentName.charAt(0).toUpperCase()}
                    </div>
                    <span>{student.studentName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.studentEmail || "N/A"}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">
                    {student.count} {student.count === 1 ? "Class" : "Classes"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{student.totalPaid.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active Learner
                    </span>
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No enrolled students yet.</p>
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

