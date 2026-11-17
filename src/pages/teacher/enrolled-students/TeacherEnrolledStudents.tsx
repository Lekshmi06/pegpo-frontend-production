import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  BookOpen,
  GraduationCap,
  Clock,
  MessageSquareShare,
  Tv,
  Copy,
  Check,
  Filter,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { tuitionService } from '../../../services/tuitionService';
import { authService } from '../../../services/authService';

interface StudentRosterItem {
  _id: string;
  name: string;
  email: string;
  studentCode?: string;
  userType?: string;
  status?: string;
}

interface ProgramRosterGroup {
  programId: string;
  title: string;
  code: string;
  subject: string;
  grade?: string;
  schedule: Array<{ day: string; startTime: string; endTime: string }>;
  status: string;
  totalEnrolled: number;
  students: StudentRosterItem[];
}

export const TeacherEnrolledStudents: React.FC = () => {
  const navigate = useNavigate();
  const [rosters, setRosters] = useState<ProgramRosterGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const res = await tuitionService.getTeacherEnrolledStudents();
      if (res.success && res.programRosters) {
        setRosters(res.programRosters);
      }
    } catch (err) {
      console.error('Failed to fetch teacher enrolled students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Extract distinct subjects
  const subjects = Array.from(new Set(rosters.map((r) => r.subject).filter(Boolean)));

  // Filter programs and students
  const filteredRosters = rosters
    .filter((r) => selectedSubject === 'all' || r.subject === selectedSubject)
    .map((r) => {
      if (!searchQuery.trim()) return r;
      const q = searchQuery.toLowerCase();
      const filteredStudents = r.students.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.studentCode || '').toLowerCase().includes(q)
      );
      const programMatches =
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q);

      if (programMatches) return r;
      return { ...r, students: filteredStudents };
    })
    .filter((r) => r.students.length > 0 || !searchQuery.trim());

  const totalStudentsAcrossAll = rosters.reduce((acc, curr) => acc + (curr.totalEnrolled || curr.students.length), 0);

  return (
    <div className="flex-1 bg-[#f8fcff] min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e2ebf4] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Tuition Rosters
            </span>
            <span className="text-xs text-slate-500 font-medium">Program-Wise Distribution</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            Students Enrolled
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your program batches, inspect permanent student codes, launch live classrooms, or enter Combined Study workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400 font-medium">Total Programs</div>
            <div className="text-lg font-extrabold text-[#1c3352]">{rosters.length}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Total Students</div>
            <div className="text-lg font-extrabold text-blue-600">{totalStudentsAcrossAll}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, code (STU-...), or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#e2ebf4] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2f78c4]/30 shadow-2xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="appearance-none bg-white border border-[#e2ebf4] text-xs font-bold text-[#1c3352] px-4 py-2.5 rounded-2xl outline-none shadow-2xs cursor-pointer hover:border-slate-300"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Program-Wise Rosters List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-medium">
          Loading enrolled student rosters...
        </div>
      ) : filteredRosters.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#e2ebf4] shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No students enrolled yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            You currently have no students assigned to tuition programs, or no records matched your filter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRosters.map((group) => (
            <div
              key={group.programId}
              className="bg-white rounded-3xl border border-[#e2ebf4] shadow-xs overflow-hidden transition-all hover:shadow-md"
            >
              {/* Program Card Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#f0f6fc] via-[#f8fcff] to-white border-b border-[#e2ebf4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                      {group.subject}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {group.code}
                    </span>
                    {group.grade && (
                      <span className="text-xs font-semibold text-slate-600">
                        &bull; Grade: {group.grade}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#111827]">
                    {group.title}
                  </h2>
                  {group.schedule && group.schedule.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {group.schedule
                          .map((s) => `${s.day} ${s.startTime}-${s.endTime}`)
                          .join(' | ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Action Links for this Program */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => navigate(`/tuition-mode/program/${group.programId}`)}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                    title="Enter Combined Study Stream for this batch"
                  >
                    <MessageSquareShare className="w-3.5 h-3.5" />
                    <span>Combine Study</span>
                  </button>

                  <button
                    onClick={() => {
                      const liveRoomId = group.code || group.programId || 'tuition-live';
                      navigate(`/live/${encodeURIComponent(liveRoomId)}`);
                    }}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    title="Launch live classroom"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Live Class</span>
                  </button>
                </div>
              </div>

              {/* Students Table / Grid */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Enrolled Students ({group.students.length})</span>
                </div>

                {group.students.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No students currently assigned to this batch.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.students.map((stu) => (
                      <div
                        key={stu._id}
                        className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#111827] truncate group-hover:text-blue-600 transition-colors">
                            {stu.name || 'Student'}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{stu.email}</div>
                        </div>

                        {stu.studentCode && (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                              {stu.studentCode}
                            </span>
                            <button
                              onClick={() => handleCopy(stu.studentCode!)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
                              title="Copy Student Code"
                            >
                              {copiedCode === stu.studentCode ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TeacherEnrolledStudents;

