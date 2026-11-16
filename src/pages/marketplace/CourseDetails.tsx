import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  BookOpen,
  Video,
  FileText,
  FileUp,
  Globe,
  User,
  ShieldCheck,
  PlayCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  CreditCard,
  Lock,
  Award,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import {
  ICourse,
  IEnrollment,
  ICourseReview,
  PaymentPlanType,
  ReviewEligibilityResult,
} from '../../types/course';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import logoImg from '../../assets/logo.png';

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState<ICourse | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Reviews & Ratings State
  const [reviews, setReviews] = useState<ICourseReview[]>([]);
  const [eligibility, setEligibility] = useState<ReviewEligibilityResult | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Payment Plan Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<PaymentPlanType>('full');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const currentUser = authService.getCurrentUser();

  const loadReviewsAndEligibility = async (courseId: string) => {
    try {
      const revs = await courseService.getCourseReviews(courseId);
      setReviews(revs);

      if (currentUser) {
        const elig = await courseService.checkReviewEligibility(courseId);
        setEligibility(elig);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourseById(id);
        setCourse(data.course);
        setIsOwner(data.isOwner);

        // Expand first section by default
        if (data.course.sections?.length > 0 && data.course.sections[0]._id) {
          setExpandedSections({ [data.course.sections[0]._id]: true });
        }

        // Check if current user is already enrolled
        if (currentUser) {
          try {
            const enrollments = await courseService.getLearnerEnrolledCourses();
            const found = enrollments.some(
              (e: any) =>
                (e.course?._id === id || e.course === id)
            );
            setIsEnrolled(found);
          } catch {
            // Non-blocking
          }
        }

        await loadReviewsAndEligibility(id);
      } catch (err: any) {
        toast.error(err.message || 'Course not found');
        navigate('/marketplace');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const toggleSection = (secId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const handleEnrollClick = () => {
    if (!currentUser) {
      toast.info('Please log in or register to enroll in courses');
      navigate('/login');
      return;
    }

    if (!course) return;

    if (course.price > 0) {
      // Open Payment Plan selection modal
      setSelectedPlanType(course.allowInstalments ? 'instalment' : 'full');
      setPaymentModalOpen(true);
    } else {
      handleDirectEnroll();
    }
  };

  const handleDirectEnroll = async () => {
    if (!course) return;
    try {
      setIsEnrolling(true);
      const res = await courseService.enrollInCourse(course._id);
      setIsEnrolled(true);
      if (res.alreadyEnrolled) {
        toast.info('You are already enrolled in this course.');
      } else {
        toast.success(`Successfully enrolled in "${course.title}"!`);
      }
      navigate(`/learn/${course._id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete enrollment');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!course) return;
    try {
      setIsProcessingPayment(true);
      // 1. Create Payment Order (Full or Instalments)
      const orderRes = await courseService.createPaymentOrder({
        courseId: course._id,
        planType: selectedPlanType,
        numberOfInstalments: course.maxInstalments || 3,
      });

      // 2. Server-side payment verification
      const verifyRes = await courseService.verifyPayment({
        paymentPlanId: orderRes.paymentPlanId,
        instalmentNumber: 1,
        orderId: orderRes.orderId,
        gatewayTransactionId: orderRes.simulationTransactionId || `TXN-EDUPYE-${Date.now()}`,
        signature: orderRes.simulationToken,
        gatewayProvider: 'edupye_secure_gateway',
      });

      toast.success(
        selectedPlanType === 'instalment'
          ? `First instalment paid ($${orderRes.amountDueNow})! Milestone 1 unlocked.`
          : `Full course payment completed ($${orderRes.totalAmount})! All modules unlocked.`
      );

      setPaymentModalOpen(false);
      setIsEnrolled(true);
      navigate(`/learn/${course._id}`);
    } catch (err: any) {
      toast.error(err.message || 'Payment processing failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!course || !reviewComment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await courseService.submitCourseReview(course._id, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      });
      toast.success('Thank you! Your verified graduate review has been published.');
      setReviewModalOpen(false);
      setReviewComment('');
      setReviewTitle('');
      if (id) await loadReviewsAndEligibility(id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-[#f8fbfe] flex items-center justify-center">
        <Loader size="lg" text="Loading course details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbfe] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            to="/marketplace"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white rounded-xl w-8 h-8 flex items-center justify-center p-1 border border-slate-200">
              <img src={logoImg} alt="EDUPYE" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-black text-[#111827]">EDUPYE LMS</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/marketplace"
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            All Courses
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-[#1c3352] text-white py-12 px-4 sm:px-8 border-b border-[#2d4970]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0091ff]/20 text-[#62b2fd] text-xs font-bold border border-[#0091ff]/30">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold">
                {course.level}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Language: {course.language || 'English'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {course.title}
            </h1>

            {course.shortDescription && (
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {course.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 font-medium">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#62b2fd]" />
                <span>Created by <strong className="text-white">{course.providerName || 'Provider'}</strong></span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#62b2fd]" />
                <span>{course.totalDurationMinutes || 0} minutes of total content</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#62b2fd]" />
                <span>{course.totalLessons} lessons across {course.sections?.length || 0} modules</span>
              </div>
            </div>
          </div>

          {/* Floating Purchase/Enrollment Card */}
          <div className="bg-white rounded-3xl p-6 text-slate-900 border border-slate-200 shadow-xl space-y-5 lg:-mb-24 z-20">
            <div className="h-44 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1c3352] to-[#0091ff] flex items-center justify-center p-4 text-center text-white text-xs font-black">
                  {course.title}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Enrollment Price</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#111827]">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                  {course.price > 0 && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Instant Access
                    </span>
                  )}
                </div>
                {course.allowInstalments && course.price > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[#0091ff] font-bold">
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      or ${(course.price / (course.maxInstalments || 3)).toFixed(2)}/mo ({course.maxInstalments || 3}x instalments)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isOwner ? (
              <div className="space-y-2">
                <Link
                  to={`/provider/courses/${course._id}/builder`}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center block shadow-xs"
                >
                  Edit Course in Provider Studio
                </Link>
                <Link
                  to={`/learn/${course._id}`}
                  className="w-full py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all text-center block"
                >
                  Preview Learning Player
                </Link>
              </div>
            ) : isEnrolled ? (
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>You are enrolled in this course</span>
                </div>
                <button
                  onClick={() => navigate(`/learn/${course._id}`)}
                  className="w-full py-3.5 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  Continue Learning &rarr;
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnrollClick}
                disabled={isEnrolling}
                className="w-full py-3.5 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-black shadow-md transition-all cursor-pointer"
              >
                {isEnrolling
                  ? 'Enrolling...'
                  : course.price === 0
                  ? 'Enroll Now for Free'
                  : course.allowInstalments
                  ? `Choose Payment Plan ($${course.price})`
                  : `Enroll in Course ($${course.price})`}
              </button>
            )}

            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full lifetime access to course content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Access on mobile, tablet, and desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Progress tracking and resume sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-10">
        <div className="lg:w-2/3 space-y-8">
          {/* Course Description */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-[#111827]">About This Course</h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 font-normal whitespace-pre-line">
              {course.description}
            </div>
          </section>

          {/* Curriculum Accordion */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-[#111827]">Course Curriculum</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {course.sections?.length || 0} Modules • {course.totalLessons} Lessons • {course.totalDurationMinutes} mins total length
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section, sIdx) => {
                  const isExpanded = Boolean(expandedSections[section._id || '']);
                  return (
                    <div key={section._id || sIdx} className="bg-white">
                      {/* Section Header */}
                      <button
                        onClick={() => section._id && toggleSection(section._id)}
                        className="w-full p-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/60 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#1c3352] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                            {sIdx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-[#111827]">{section.title}</h3>
                              {section.requiredInstalmentNumber && section.requiredInstalmentNumber > 1 && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0091ff] font-extrabold text-[9px] border border-blue-100 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  Milestone #{section.requiredInstalmentNumber}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {section.lessons?.length || 0} lessons
                            </span>
                          </div>
                        </div>

                        <div className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {/* Section Lessons */}
                      {isExpanded && (
                        <div className="p-3 bg-white space-y-1.5 divide-y divide-slate-50">
                          {section.lessons && section.lessons.length > 0 ? (
                            section.lessons.map((lesson, lIdx) => (
                              <div
                                key={lesson._id || lIdx}
                                className="flex items-center justify-between p-2.5 text-xs rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {lesson.contentType === 'video' ? (
                                    <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  ) : lesson.contentType === 'article' ? (
                                    <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <FileUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  )}
                                  <span className="font-medium text-slate-700 truncate">
                                    {lesson.title}
                                  </span>
                                  {lesson.isPreviewFree && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                  {lesson.durationMinutes || 10}m
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-400 p-2">No lessons in this module.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Curriculum overview will be available soon.
                </div>
              )}
            </div>
          </section>

          {/* Provider Card */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-black text-[#111827]">Instructor & Provider</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1c3352] text-white flex items-center justify-center font-black text-lg">
                {course.providerName?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#111827]">
                  {course.providerName || 'Course Provider'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Author on EduPye Learning Marketplace
                </p>
              </div>
            </div>
          </section>

          {/* Course Reviews & Ratings Section */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-black text-[#111827]">Verified Reviews & Ratings</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(course.averageRating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-extrabold text-[#111827]">
                    {course.averageRating ? course.averageRating.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ({course.reviewCount || reviews.length} verified reviews)
                  </span>
                </div>
              </div>

              {/* Review CTA if eligible */}
              {eligibility?.eligible ? (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Write a Verified Review</span>
                </button>
              ) : currentUser && isEnrolled ? (
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Complete course & receive certificate to review</span>
                </div>
              ) : null}
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="divide-y divide-slate-100 space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {rev.learnerName[0]?.toUpperCase() || 'L'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#111827]">
                              {rev.learnerName}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-extrabold border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Graduate
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.title && (
                      <h4 className="text-xs font-bold text-[#111827]">{rev.title}</h4>
                    )}
                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-medium space-y-1">
                <Star className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No reviews yet. Be the first verified graduate to review this course!</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Payment Plan Selection Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Select Your Enrollment Payment Plan"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Choose how you would like to invest in "{course.title}". Both plans unlock verified certificate eligibility upon completion.
          </p>

          <div className="space-y-3">
            {/* Option 1: Full Payment */}
            <div
              onClick={() => setSelectedPlanType('full')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                selectedPlanType === 'full'
                  ? 'border-[#0091ff] bg-blue-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#111827]">Full One-Time Payment</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black">
                    Best Value
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Instant full access to all course sections and downloadable resources.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-black text-[#111827]">${course.price}</span>
                <span className="text-[10px] text-slate-400 block font-medium">One-time</span>
              </div>
            </div>

            {/* Option 2: Instalment Plan (if enabled) */}
            {course.allowInstalments && (
              <div
                onClick={() => setSelectedPlanType('instalment')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlanType === 'instalment'
                    ? 'border-[#0091ff] bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#111827]">
                      {course.maxInstalments || 3}-Part Instalment Plan
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0091ff] text-[9px] font-black">
                      Flexible
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pay instalment #1 now to unlock Milestone 1. Pay subsequent instalments to unlock remaining modules.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-[#0091ff]">
                    ${((course.price) / (course.maxInstalments || 3)).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Due today (Part 1 of {course.maxInstalments || 3})
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Secure transaction verified server-side with 80:20 provider revenue ledger.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessPayment}
              disabled={isProcessingPayment}
              className="px-6 py-2.5 rounded-xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-black shadow-md cursor-pointer transition-colors"
            >
              {isProcessingPayment
                ? 'Processing...'
                : selectedPlanType === 'instalment'
                ? `Pay First Instalment ($${((course.price) / (course.maxInstalments || 3)).toFixed(2)})`
                : `Complete Full Payment ($${course.price})`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Submission Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Write a Verified Graduate Review"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Certificate #{eligibility?.certificateNumber || 'VERIFIED'} confirmed. Your review will display as a verified course graduate.
            </span>
          </div>

          {/* Star Rating Select */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-extrabold text-slate-700 ml-2">
                {reviewRating} of 5 Stars
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Review Headline</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Excellent curriculum and pacing!"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Detailed Feedback *</label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share what you learned, how the projects helped, and advice for future students..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              {isSubmittingReview ? 'Submitting...' : 'Publish Verified Review'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500 space-y-2 mt-12">
        <div>© 2026 EDUPYE LMS & Course Marketplace. All rights reserved.</div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 font-medium">
          <Link to="/help" className="hover:text-slate-800 transition-colors">FAQs & Help</Link>
          <Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link>
          <Link to="/cookies" className="hover:text-slate-800 transition-colors">Cookie Settings</Link>
        </div>
      </footer>
    </div>
  );
}
