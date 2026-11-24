import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Video,
  ShieldCheck,
  DollarSign,
  Users,
  Award,
  ArrowRight,
  Phone,
  Mail,
  Lock,
  BookOpen,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { tuitionService } from '../../services/tuitionService';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { ThemeToggle } from '../../context/ThemeContext';

const POPULAR_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'Economics',
  'Accountancy',
  'History',
  'General Science',
];

const GRADE_LEVELS = [
  'Class 6 - 8 (Middle)',
  'Class 9 - 10 (Secondary)',
  'Class 11 - 12 (Higher Secondary)',
  'JEE / NEET Competitive',
  'Undergraduate / College',
];

const COUNTRY_CODES = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+61', country: 'Australia' },
];

export default function BecomeTutorPage() {
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('2');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics']);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['Class 11 - 12 (Higher Secondary)']);
  const [customSubject, setCustomSubject] = useState('');
  const [bio, setBio] = useState('');
  const [demoLink, setDemoLink] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    phone: string;
    interviewStatus: string;
  } | null>(null);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleAddCustomSubject = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = customSubject.trim();
    if (clean && !selectedSubjects.includes(clean)) {
      setSelectedSubjects((prev) => [...prev, clean]);
      setCustomSubject('');
    }
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhoneDigits = phoneNumber.trim().replace(/\D/g, '');
    const cleanPhone = `${countryCode} ${cleanPhoneDigits}`;

    if (!cleanName) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 8) {
      setErrorMessage('Please provide a valid active phone number for interview scheduling.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (selectedSubjects.length === 0) {
      setErrorMessage('Please select at least one teaching subject.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await tuitionService.applyForTutor({
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        qualification: qualification.trim(),
        subjects: selectedSubjects,
        grades: selectedGrades,
        experienceYears: Number(experienceYears) || 0,
        bio: bio.trim(),
        demoLink: demoLink.trim(),
      });

      if (res && res.success) {
        setSubmittedData({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          interviewStatus: 'pending_interview',
        });
        setSubmissionSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(res?.message || 'Failed to submit application. Please check your details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error submitting application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-black transition-colors">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-transform group-hover:scale-105">
              <EdupyeLogo className="h-6 sm:h-7" />
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20 rounded-full">
              Tuition Network
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/tuition-mode"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Tuition Code Login
            </Link>
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-2xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {submissionSuccess && submittedData ? (
          /* ==========================================
             POST-SUBMISSION CONFIRMATION SCREEN
             ========================================== */
          <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Application Received
              </span>

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">
                Welcome to EduPye, {submittedData.name}!
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-lg mx-auto">
                Your tuition tutor profile has been recorded in our centralized registry. Our academic panel is reviewing your qualifications.
              </p>

              {/* Applicant Card */}
              <div className="mt-8 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Applicant Dossier
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Full Name:</span>
                    <div className="font-semibold text-white mt-0.5">{submittedData.name}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <div className="font-semibold text-white mt-0.5">{submittedData.email}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone for Interview:</span>
                    <div className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {submittedData.phone}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Interview Status:</span>
                    <div className="mt-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        Under Review / Interview Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps Roadmap */}
              <div className="mt-8 text-left space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  What Happens Next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Academic Screening (24h)</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Our subject coordinators review your subjects, demo link, and past teaching track record.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Interactive Video Interview</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        You will receive an interview slot via WhatsApp/Phone and email for a 15-minute live platform walkthrough.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Permanent TCH-XXXXXX Code &amp; Program Launch</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Upon interview verification, your permanent Teacher Code will be activated to access live classrooms and start teaching batches.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                >
                  Return to Home
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-colors shadow-lg shadow-emerald-500/10"
                >
                  Sign In to Your Teacher Account
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================
             RECRUITMENT HERO + APPLICATION FORM
             ========================================== */
          <div className="space-y-16">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Join the EduPye Tuition Faculty
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Be Our Tutor. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                  Teach Smart, Earn Transparently.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300">
                Deliver interactive 1:1 and small-group live sessions using our built-in WebRTC SmartBoard classroom, automatic attendance tracking, and guaranteed bi-weekly payouts.
              </p>
              <div className="pt-2">
                <a
                  href="#application-form"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20"
                >
                  <span>Apply Now as a Tutor</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Why Teach Perks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Guaranteed Payouts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct per-session earnings with zero hidden commissions and transparent admin-approved disbursements.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Dual-Dock SmartBoard</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive pens, PDF annotator, live audio/video WebRTC, and in-meeting assessments built right into your browser.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Permanent TCH Code</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive a permanent verified teacher code (TCH-XXXXXX) recognized across all enrolled student programs.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Flexible Scheduling</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose morning, evening, or weekend batches that fit your personal teaching timetable.
                </p>
              </div>
            </div>

            {/* Application Form Section */}
            <div id="application-form" className="max-w-3xl mx-auto pt-6">
              <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />

                <div className="mb-8">
                  <h2 className="text-2xl font-black text-white">
                    Tutor Application &amp; Registration
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Please provide your contact information and academic background. After submitting, our academic operations team will reach out for an interview.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Personal Details */}
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Step 1: Contact &amp; Identity</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Full Name (as per ID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Dr. Rajesh Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rajesh.sharma@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Active Phone Number (for WhatsApp &amp; Call) *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="col-span-1 px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.code} ({c.country})
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="98765 43210"
                            className="col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Create Account Password *
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Academic Background */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>Step 2: Teaching Expertise &amp; Subjects</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Highest Qualification / Degree
                        </label>
                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          placeholder="e.g. M.Sc Mathematics, B.Tech IIT Bombay"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Teaching Experience (Years)
                        </label>
                        <select
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="1">1 year or less</option>
                          <option value="2">2 - 3 years</option>
                          <option value="5">4 - 6 years</option>
                          <option value="8">7 - 10 years</option>
                          <option value="12">10+ years</option>
                        </select>
                      </div>
                    </div>

                    {/* Subjects Multi-select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">
                        Select Subjects You Teach *
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {POPULAR_SUBJECTS.map((sub) => {
                          const isSelected = selectedSubjects.includes(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => toggleSubject(sub)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              {isSelected ? `✓ ${sub}` : `+ ${sub}`}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          onKeyDown={handleAddCustomSubject}
                          placeholder="Add another subject (e.g. Vedic Math, French, Coding)..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomSubject}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Target Grades */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">
                        Preferred Student Grade Levels
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {GRADE_LEVELS.map((grade) => {
                          const isSelected = selectedGrades.includes(grade);
                          return (
                            <button
                              key={grade}
                              type="button"
                              onClick={() => toggleGrade(grade)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              {isSelected ? `✓ ${grade}` : `+ ${grade}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Bio & Demo Link */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Video className="w-4 h-4" />
                      <span>Step 3: Bio &amp; Showcase</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Short Bio / Teaching Style
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell students and our admissions panel about your pedagogical approach, key achievements, or student test scores..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-vertical"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Sample Demo Class Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={demoLink}
                        onChange={(e) => setDemoLink(e.target.value)}
                        placeholder="https://youtube.com/... or Google Drive / Loom link"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Applicants with a sample video are prioritized for immediate interview scheduling.
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Tutor Application</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-500 text-center mt-3">
                      By submitting, you agree to the EduPye Tutor Code of Conduct. Your personal contact details are securely stored and used only for interview coordination.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} EduPye Technologies. All rights reserved. Centralized Tuition Platform.</p>
        </div>
      </footer>
    </div>
  );
}
