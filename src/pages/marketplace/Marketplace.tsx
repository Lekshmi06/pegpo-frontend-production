import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Layers,
  ArrowRight,
  Compass,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  User,
  GraduationCap,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { ICourse, CourseFilterQuery } from '../../types/course';
import { Loader } from '../../components/ui/Loader';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import logoImg from '../../assets/logo.png';

export default function Marketplace() {
  const navigate = useNavigate();
  const toast = useToast();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'popular' | 'price_asc' | 'price_desc'>('newest');

  const currentUser = authService.getCurrentUser();

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const query: CourseFilterQuery = {
        search: searchTerm.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        level: selectedLevel !== 'All' ? selectedLevel : undefined,
        sort: selectedSort,
      };
      const data = await courseService.getMarketplaceCourses(query);
      setCourses(data.courses);
      if (data.categories?.length > 0) {
        setCategories(['All', ...data.categories]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-white rounded-xl w-9 h-9 flex items-center justify-center p-1 border border-slate-200">
              <img src={logoImg} alt="EDUPYE" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-[#111827]">EDUPYE</span>
              <span className="text-[10px] font-bold text-[#0091ff] uppercase tracking-wider">
                Course Marketplace
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-600">
            <Link to="/marketplace" className="text-[#0091ff]">
              Explore Catalog
            </Link>
            <Link to="/learner" className="hover:text-slate-900 transition-colors">
              My Courses
            </Link>
            {currentUser?.role === 'provider' ? (
              <Link to="/provider" className="hover:text-slate-900 transition-colors">
                Provider Studio
              </Link>
            ) : (
              <Link to="/onboarding" className="hover:text-slate-900 transition-colors">
                Teach on EduPye
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <Link
                to={currentUser.role === 'provider' ? '/provider' : '/learner'}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
              >
                Dashboard
              </Link>
              <div className="w-8 h-8 rounded-full bg-[#1c3352] text-white flex items-center justify-center text-xs font-bold">
                {currentUser.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 rounded-xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-white to-[#f0f6fc] border-b border-slate-200/80 py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0091ff] border border-blue-200/60 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coursera & Udemy-Style Learning on EduPye</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Learn In-Demand Skills from Expert Providers
          </h1>

          <p className="text-sm text-slate-500 font-medium max-w-2xl mx-auto">
            Explore comprehensive video courses, interactive articles, and downloadable resources authored by experienced educators and industry practitioners.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-md rounded-2xl bg-white border border-slate-200 p-1.5">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="What do you want to learn? (e.g. TypeScript, Machine Learning, UI Design)..."
                className="w-full px-3 py-2 text-xs font-medium text-[#111827] outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(categories.length > 0
              ? categories
              : ['All', 'Software Engineering', 'Data Science & AI', 'Business & Finance', 'Design & UX']
            ).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1c3352] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 outline-none cursor-pointer border border-transparent hover:border-slate-300"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 outline-none cursor-pointer border border-transparent hover:border-slate-300"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900 font-extrabold">{courses.length}</span> published course{courses.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="py-20">
            <Loader size="lg" text="Loading marketplace courses..." />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0091ff] flex items-center justify-center mx-auto">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-[#111827]">No courses found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Try adjusting your search criteria or explore a different category.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#0091ff] text-white text-xs font-bold hover:bg-[#0080e6] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Course Thumbnail */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1c3352] to-[#0091ff] flex items-center justify-center p-4 text-center">
                      <span className="text-white text-xs font-extrabold line-clamp-2">
                        {course.title}
                      </span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-black uppercase text-[#1c3352] shadow-2xs">
                    {course.category}
                  </span>
                </div>

                {/* Course Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{course.level}</span>
                      <span>{course.language || 'English'}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#111827] line-clamp-2 group-hover:text-[#0091ff] transition-colors">
                      {course.title}
                    </h3>

                    {course.shortDescription && (
                      <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                        {course.shortDescription}
                      </p>
                    )}

                    <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{course.providerName || 'Provider'}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Price</span>
                      <span className="text-base font-black text-[#111827]">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                    </div>

                    <Link
                      to={`/courses/${course._id}`}
                      className="px-4 py-2 rounded-xl bg-[#1c3352] group-hover:bg-[#0091ff] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs font-bold text-slate-400">
        © 2026 EDUPYE LMS & Course Marketplace. All rights reserved.
      </footer>
    </div>
  );
}
