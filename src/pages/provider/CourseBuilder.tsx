import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  Video,
  FileText,
  FileUp,
  Clock,
  Sparkles,
  Eye,
  Layers,
  DollarSign,
  HelpCircle,
  Upload,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { ICourse, ICourseSection, ILesson, CourseLevel, LessonContentType } from '../../types/course';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { validateLessonVideoUrl } from '../../utils/youtubeUtils';

export default function CourseBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const isCreatingNew = !id || id === 'new';
  const [activeStep, setActiveStep] = useState<'basic' | 'details' | 'curriculum' | 'pricing' | 'publish'>('basic');
  const [isLoading, setIsLoading] = useState(!isCreatingNew);
  const [isSaving, setIsSaving] = useState(false);

  // Course State
  const [course, setCourse] = useState<Partial<ICourse>>({
    title: '',
    shortDescription: '',
    description: '',
    thumbnail: '',
    category: 'Software Engineering',
    level: 'All Levels',
    language: 'English',
    price: 0,
    currency: 'USD',
    status: 'draft',
    sections: [],
  });

  // Section Modal State
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');

  // Lesson Modal State
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonContentType>('video');
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonArticleContent, setLessonArticleContent] = useState('');
  const [lessonResourceName, setLessonResourceName] = useState('');
  const [lessonResourceUrl, setLessonResourceUrl] = useState('');
  const [lessonIsFree, setLessonIsFree] = useState(false);

  useEffect(() => {
    if (!isCreatingNew && id) {
      const fetchCourse = async () => {
        try {
          setIsLoading(true);
          const data = await courseService.getCourseById(id);
          setCourse(data.course);
        } catch (err: any) {
          toast.error(err.message || 'Failed to load course details');
          navigate('/provider');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id, isCreatingNew, navigate]);

  const handleSaveBasic = async () => {
    if (!course.title?.trim()) {
      toast.error('Course title is required');
      return;
    }
    if (!course.description?.trim()) {
      toast.error('Course description is required');
      return;
    }

    try {
      setIsSaving(true);
      if (isCreatingNew) {
        const created = await courseService.createCourse({
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription,
          thumbnail: course.thumbnail,
          category: course.category || 'Software Engineering',
          level: course.level || 'All Levels',
          language: course.language || 'English',
          price: course.price || 0,
        });
        toast.success('Course created! Now you can build your curriculum.');
        navigate(`/provider/courses/${created._id}/builder`);
        setCourse(created);
        setActiveStep('curriculum');
      } else if (course._id) {
        const updated = await courseService.updateCourse(course._id, course);
        setCourse(updated);
        toast.success('Course details updated successfully');
        setActiveStep('curriculum');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  // Section Handlers
  const handleOpenAddSection = () => {
    setEditingSectionId(null);
    setSectionTitle('');
    setSectionDescription('');
    setSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: ICourseSection) => {
    setEditingSectionId(sec._id || null);
    setSectionTitle(sec.title);
    setSectionDescription(sec.description || '');
    setSectionModalOpen(true);
  };

  const handleSaveSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error('Section title is required');
      return;
    }
    if (!course._id) {
      toast.error('Please save basic course info first');
      return;
    }

    try {
      setIsSaving(true);
      let updated: ICourse;
      if (editingSectionId) {
        updated = await courseService.updateSection(
          course._id,
          editingSectionId,
          sectionTitle,
          sectionDescription
        );
        toast.success('Section updated');
      } else {
        updated = await courseService.addSection(
          course._id,
          sectionTitle,
          sectionDescription
        );
        toast.success('Section added to curriculum');
      }
      setCourse(updated);
      setSectionModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (secId?: string) => {
    if (!secId || !course._id) return;
    if (!window.confirm('Delete this section and all its lessons?')) return;
    try {
      setIsSaving(true);
      const updated = await courseService.deleteSection(course._id, secId);
      setCourse(updated);
      toast.success('Section deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete section');
    } finally {
      setIsSaving(false);
    }
  };

  // Lesson Handlers
  const handleOpenAddLesson = (secId?: string) => {
    if (!secId) return;
    setTargetSectionId(secId);
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonType('video');
    setLessonDuration(15);
    setLessonVideoUrl('');
    setLessonArticleContent('');
    setLessonResourceName('');
    setLessonResourceUrl('');
    setLessonIsFree(false);
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (secId: string, les: ILesson) => {
    setTargetSectionId(secId);
    setEditingLessonId(les._id || null);
    setLessonTitle(les.title);
    setLessonType(les.contentType);
    setLessonDuration(les.durationMinutes || 15);
    setLessonVideoUrl(les.videoUrl || '');
    setLessonArticleContent(les.articleContent || '');
    setLessonResourceName(les.resourceFileName || '');
    setLessonResourceUrl(les.resourceFileUrl || '');
    setLessonIsFree(Boolean(les.isPreviewFree));
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonTitle.trim()) {
      toast.error('Lesson title is required');
      return;
    }
    if (!course._id || !targetSectionId) return;

    if (lessonType === 'video' && lessonVideoUrl.trim()) {
      const videoValidation = validateLessonVideoUrl(lessonVideoUrl.trim());
      if (!videoValidation.isValid) {
        toast.error(videoValidation.error || 'Invalid video URL. Please check the YouTube link.');
        return;
      }
    }

    const payload: Partial<ILesson> = {
      title: lessonTitle.trim(),
      contentType: lessonType,
      durationMinutes: Number(lessonDuration) || 10,
      videoUrl: lessonVideoUrl.trim() || undefined,
      articleContent: lessonArticleContent.trim() || undefined,
      resourceFileName: lessonResourceName.trim() || undefined,
      resourceFileUrl: lessonResourceUrl.trim() || undefined,
      isPreviewFree: lessonIsFree,
    };

    try {
      setIsSaving(true);
      let updated: ICourse;
      if (editingLessonId) {
        updated = await courseService.updateLesson(
          course._id,
          targetSectionId,
          editingLessonId,
          payload
        );
        toast.success('Lesson updated');
      } else {
        updated = await courseService.addLesson(
          course._id,
          targetSectionId,
          payload
        );
        toast.success('Lesson added to curriculum');
      }
      setCourse(updated);
      setLessonModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLesson = async (secId: string, lesId?: string) => {
    if (!course._id || !lesId) return;
    if (!window.confirm('Delete this lesson?')) return;
    try {
      setIsSaving(true);
      const updated = await courseService.deleteLesson(course._id, secId, lesId);
      setCourse(updated);
      toast.success('Lesson deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!course._id) return;
    try {
      setIsSaving(true);
      const target = course.status === 'published' ? 'draft' : 'published';
      const updated = await courseService.togglePublishCourse(course._id, target);
      setCourse(updated);
      toast.success(
        `Course is now ${updated.status === 'published' ? 'Published live!' : 'moved back to Drafts'}`
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to change publish status');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <Loader size="lg" text="Loading course builder..." />
      </div>
    );
  }

  const steps = [
    { id: 'basic', label: '1. Basic Info' },
    { id: 'details', label: '2. Details & Media' },
    { id: 'curriculum', label: '3. Curriculum & Lessons' },
    { id: 'pricing', label: '4. Pricing' },
    { id: 'publish', label: '5. Preview & Publish' },
  ] as const;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/provider"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#111827]">
                {course.title ? course.title : 'Create New Course'}
              </h1>
              {course._id && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    course.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {course.status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Author course curriculum, lessons, and pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {course._id && (
            <Link
              to={`/courses/${course._id}`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}
          <Button
            onClick={handleSaveBasic}
            isLoading={isSaving}
            className="px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Course</span>
          </Button>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {steps.map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveStep(st.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeStep === st.id
                ? 'bg-[#1c3352] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {activeStep === 'basic' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#111827]">Basic Information</h2>
            <p className="text-xs text-slate-500">Provide the title, summary, and core classification.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Course Title *</label>
              <input
                type="text"
                value={course.title || ''}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="e.g. Modern Full-Stack Web Development with React & Node"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Short Subtitle / Description</label>
              <input
                type="text"
                value={course.shortDescription || ''}
                onChange={(e) => setCourse({ ...course, shortDescription: e.target.value })}
                placeholder="A concise one-line summary displayed on course cards"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Category *</label>
                <select
                  value={course.category || 'Software Engineering'}
                  onChange={(e) => setCourse({ ...course, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff] cursor-pointer"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Business & Finance">Business & Finance</option>
                  <option value="Design & UX">Design & UX</option>
                  <option value="Science & Mathematics">Science & Mathematics</option>
                  <option value="Languages">Languages</option>
                  <option value="Career & Skills">Career & Skills</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Difficulty Level *</label>
                <select
                  value={course.level || 'All Levels'}
                  onChange={(e) => setCourse({ ...course, level: e.target.value as CourseLevel })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff] cursor-pointer"
                >
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Language</label>
                <input
                  type="text"
                  value={course.language || 'English'}
                  onChange={(e) => setCourse({ ...course, language: e.target.value })}
                  placeholder="English"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Full Course Description *</label>
              <textarea
                rows={5}
                value={course.description || ''}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Detailed curriculum overview, prerequisites, what learners will achieve..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleSaveBasic} isLoading={isSaving} className="px-6 py-2.5">
                Save & Continue to Details &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Details & Media */}
      {activeStep === 'details' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#111827]">Thumbnail & Visuals</h2>
            <p className="text-xs text-slate-500">Provide an attractive banner thumbnail URL for course cards.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Thumbnail Image URL</label>
              <input
                type="url"
                value={course.thumbnail || ''}
                onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                placeholder="https://images.unsplash.com/... or /uploads/courses/..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
              />
            </div>

            {course.thumbnail && (
              <div className="w-full max-w-md h-48 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-2xs">
                <img
                  src={course.thumbnail}
                  alt="Course Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep('basic')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                &larr; Back
              </button>
              <Button onClick={handleSaveBasic} isLoading={isSaving} className="px-6 py-2.5">
                Save & Continue to Curriculum &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Curriculum & Lessons */}
      {activeStep === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">Curriculum Structure</h2>
              <p className="text-xs text-slate-500 font-medium">
                Organize your course into modules/sections, each containing structured lessons.
              </p>
            </div>
            <button
              onClick={handleOpenAddSection}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>

          {/* Sections List */}
          {course.sections && course.sections.length > 0 ? (
            <div className="space-y-4">
              {course.sections.map((sec, secIdx) => (
                <div
                  key={sec._id || secIdx}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  {/* Section Header */}
                  <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#1c3352] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {secIdx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#111827]">{sec.title}</h3>
                        {sec.description && (
                          <p className="text-[11px] text-slate-500 font-medium">{sec.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAddLesson(sec._id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#0091ff] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lesson</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditSection(sec)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                        title="Edit Section"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List in Section */}
                  <div className="p-4 space-y-2">
                    {sec.lessons && sec.lessons.length > 0 ? (
                      sec.lessons.map((les, lesIdx) => (
                        <div
                          key={les._id || lesIdx}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0091ff] flex items-center justify-center shrink-0">
                              {les.contentType === 'video' ? (
                                <Video className="w-4 h-4" />
                              ) : les.contentType === 'article' ? (
                                <FileText className="w-4 h-4" />
                              ) : (
                                <FileUp className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-[#111827] truncate">
                                  {les.title}
                                </h4>
                                {les.isPreviewFree && (
                                  <span className="px-2 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {les.contentType.toUpperCase()} • {les.durationMinutes || 10} mins
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => sec._id && handleOpenEditLesson(sec._id, les)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit Lesson"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => sec._id && handleDeleteLesson(sec._id, les._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400 font-medium">
                        No lessons in this section yet. Click "Add Lesson" above.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0091ff] flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-extrabold text-[#111827]">Curriculum is empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Create sections to organize your video lessons, articles, and downloadable resources.
              </p>
              <button
                onClick={handleOpenAddSection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0091ff] text-white text-xs font-bold hover:bg-[#0080e6] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Section</span>
              </button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveStep('details')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              &larr; Back
            </button>
            <Button onClick={() => setActiveStep('pricing')} className="px-6 py-2.5">
              Continue to Pricing &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Pricing */}
      {activeStep === 'pricing' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#111827]">Course Pricing</h2>
            <p className="text-xs text-slate-500">Set the enrollment price for this course.</p>
          </div>

          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="freeCourse"
                checked={Number(course.price) === 0}
                onChange={(e) => setCourse({ ...course, price: e.target.checked ? 0 : 29.99 })}
                className="w-4 h-4 rounded text-[#0091ff] focus:ring-[#0091ff] cursor-pointer"
              />
              <label htmlFor="freeCourse" className="text-xs font-bold text-slate-700 cursor-pointer">
                Offer this course for Free ($0)
              </label>
            </div>

            {Number(course.price) > 0 && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-slate-700">Course Price (USD)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={course.price || ''}
                    onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                    placeholder="29.99"
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep('curriculum')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                &larr; Back
              </button>
              <Button onClick={handleSaveBasic} isLoading={isSaving} className="px-6 py-2.5">
                Save & Continue to Publish &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Preview & Publish */}
      {activeStep === 'publish' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#111827]">Review & Publishing</h2>
            <p className="text-xs text-slate-500">
              Verify your course details and publish when ready for marketplace discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Sections</span>
              <span className="text-lg font-black text-[#111827]">{course.sections?.length || 0}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Lessons</span>
              <span className="text-lg font-black text-[#111827]">{course.totalLessons || 0}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Pricing</span>
              <span className="text-lg font-black text-emerald-600">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#111827]">Marketplace Status</h3>
              <p className="text-xs text-slate-500 font-medium">
                {course.status === 'published'
                  ? 'Your course is currently published and visible to all learners.'
                  : 'Your course is in draft mode and only visible to you.'}
              </p>
            </div>
            <button
              onClick={handlePublishToggle}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-xs transition-colors cursor-pointer shrink-0 ${
                course.status === 'published'
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {course.status === 'published' ? 'Unpublish Course' : 'Publish Course Now'}
            </button>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep('pricing')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              &larr; Back
            </button>
            <Link
              to="/provider"
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Section Modal */}
      <Modal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        title={editingSectionId ? 'Edit Section' : 'Add Section / Module'}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Section Title *</label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="e.g. Module 1: Introduction to Architecture"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Description (Optional)</label>
            <input
              type="text"
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              placeholder="What this section covers"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSectionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <Button onClick={handleSaveSection} isLoading={isSaving} className="px-5 py-2">
              Save Section
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title={editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Lesson Title *</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="e.g. Asynchronous Control Flow"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Content Type</label>
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value as LessonContentType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
              >
                <option value="video">Video</option>
                <option value="article">Text / Article</option>
                <option value="document">PDF / Resource Document</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Estimated Duration (mins)</label>
              <input
                type="number"
                min="1"
                value={lessonDuration}
                onChange={(e) => setLessonDuration(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
              />
            </div>
          </div>

          {lessonType === 'video' && (() => {
            const validation = lessonVideoUrl.trim()
              ? validateLessonVideoUrl(lessonVideoUrl.trim())
              : null;

            return (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Video Embed / Stream URL</label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 ${
                      validation
                        ? validation.isValid
                          ? 'border-emerald-400 focus:ring-emerald-400/20'
                          : 'border-rose-400 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:ring-[#0091ff]/20 focus:border-[#0091ff]'
                    }`}
                  />
                  <p className="text-[11px] text-slate-400">
                    Supports YouTube standard links (youtube.com/watch?v=...), short links (youtu.be/...), Shorts, embeds, timestamps, or direct video streams.
                  </p>
                </div>

                {/* Validation Feedback Card */}
                {validation && (
                  <div>
                    {validation.isValid ? (
                      validation.isYouTube ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate flex-1">
                            <span>Valid YouTube Video (ID: <code className="font-mono bg-emerald-100/60 px-1 py-0.5 rounded">{validation.youtubeInfo?.videoId}</code>)</span>
                            {validation.youtubeInfo?.startTime ? (
                              <span className="text-emerald-700 font-medium"> • Starts at {Math.floor(validation.youtubeInfo.startTime / 60)}m {validation.youtubeInfo.startTime % 60}s</span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Direct video stream link (.mp4/.webm)</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{validation.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {lessonType === 'article' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Article Content / Notes</label>
              <textarea
                rows={4}
                value={lessonArticleContent}
                onChange={(e) => setLessonArticleContent(e.target.value)}
                placeholder="Markdown or formatted text content for this lesson..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
              />
            </div>
          )}

          {lessonType === 'document' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Resource File Name</label>
                <input
                  type="text"
                  value={lessonResourceName}
                  onChange={(e) => setLessonResourceName(e.target.value)}
                  placeholder="e.g. Cheat-Sheet-Guide.pdf"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Resource URL / Path</label>
                <input
                  type="text"
                  value={lessonResourceUrl}
                  onChange={(e) => setLessonResourceUrl(e.target.value)}
                  placeholder="https://... or /uploads/courses/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0091ff]/20 focus:border-[#0091ff]"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="freePreview"
              checked={lessonIsFree}
              onChange={(e) => setLessonIsFree(e.target.checked)}
              className="w-4 h-4 rounded text-[#0091ff] focus:ring-[#0091ff] cursor-pointer"
            />
            <label htmlFor="freePreview" className="text-xs font-bold text-slate-700 cursor-pointer">
              Allow Free Preview (visible before enrollment)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setLessonModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <Button onClick={handleSaveLesson} isLoading={isSaving} className="px-5 py-2">
              Save Lesson
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
