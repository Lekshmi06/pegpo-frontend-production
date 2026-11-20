import { API_BASE_URL } from './apiConfig';

export interface HeroContent {
  tagBadge?: string;
  headlineLine1?: string;
  headlineLine2Gradient?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

export interface TuitionBannerContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  feature1Title?: string;
  feature1Desc?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature3Title?: string;
  feature3Desc?: string;
  feature4Title?: string;
  feature4Desc?: string;
}

export interface FeaturedProgramItem {
  code: string;
  title: string;
  subject: string;
  grade?: string;
  badge?: string;
  schedule?: string;
}

export interface FeaturedProgramsContent {
  programs: FeaturedProgramItem[];
}

export interface AnnouncementsContent {
  active: boolean;
  badge: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
}

export interface SiteContentData {
  hero: HeroContent;
  tuitionBanner: TuitionBannerContent;
  featuredPrograms: FeaturedProgramsContent;
  announcements: AnnouncementsContent;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HowItWorksStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface LandingPageContentData {
  announcementBanner: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  hero: {
    badgeText: string;
    title: string;
    subtitle: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    heroImageUrl?: string;
  };
  features: FeatureItem[];
  howItWorks: HowItWorksStep[];
  faqs: FaqItem[];
  footerContact: {
    tagline: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    copyrightText: string;
  };
  updatedBy?: string;
  updatedAt?: string;
}

export const DEFAULT_LANDING_CONTENT: LandingPageContentData = {
  announcementBanner: {
    enabled: true,
    text: "2026 Academic Term Tuition Mode is now active with SmartBoard live classes.",
    linkText: "Explore Tuition Mode",
    linkUrl: "/tuition-mode",
  },
  hero: {
    badgeText: "Intelligent Unified LMS & Campus Platform",
    title: "One platform. Every learning journey.",
    subtitle:
      "EduPye brings students, educators, campuses, and corporate training teams into one connected cloud ecosystem. Unifying adaptive AI tutoring, smart teacher studios, verified course marketplace, and campus ERP operations.",
    primaryCtaText: "Get Started Free",
    primaryCtaLink: "/signup",
    secondaryCtaText: "Sign In to Portal",
    secondaryCtaLink: "/login",
    heroImageUrl: "",
  },
  features: [
    {
      id: "ai-learning",
      title: "AI-Powered Learning Companion",
      description: "24/7 academic tutor trained specifically on official syllabi and competitive exam question banks with step-by-step proofs.",
      icon: "Brain",
    },
    {
      id: "smartboard",
      title: "Interactive Live SmartBoard Classroom",
      description: "Phase 4 WebRTC live classroom with split-screen multi-mode docks, real-time stylus annotations, and full-duplex video.",
      icon: "Tv",
    },
    {
      id: "course-marketplace",
      title: "Course Marketplace & Verified Credentials",
      description: "Curated academic masterclasses, competitive prep modules, and verified certification programs from top educators.",
      icon: "ShoppingBag",
    },
    {
      id: "tuition-mode",
      title: "Centralized Tuition Mode Ecosystem",
      description: "Permanent Student (STU-XXXXXX) & Teacher (TCH-XXXXXX) codes for scheduled 1:1 and cohort learning with auto-attendance.",
      icon: "GraduationCap",
    },
    {
      id: "campus-erp",
      title: "Campus & Institutional ERP Hub",
      description: "Multi-branch attendance, dynamic timetable management, automated fee collection, and comprehensive student rosters.",
      icon: "Building2",
    },
    {
      id: "compliance-recordings",
      title: "1-Year Compliance Classroom Archives",
      description: "Automated session recordings with participant attendance rosters preserved for a full 365 days of on-demand replay.",
      icon: "ShieldCheck",
    },
  ],
  howItWorks: [
    {
      stepNumber: 1,
      title: "Individuals Learn",
      description: "Personalized diagnostic baselines, adaptive study drills, 24/7 AI tutor guidance, and competitive exam cracker tools.",
    },
    {
      stepNumber: 2,
      title: "Educators Teach",
      description: "1-Click AI lesson blueprint generation, zero-lag cloud SmartBoard synchronization, and automated multi-format rubric grading.",
    },
    {
      stepNumber: 3,
      title: "Institutions Manage Operations",
      description: "Unified campus governance, faculty workloads, fee reconciliation, branch management, and verifiable credential issuance.",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "What is EduPye Tuition Mode?",
      answer: "EduPye Tuition Mode provides a distraction-free, scheduled virtual tuition classroom with permanent codes (STU-XXXXXX & TCH-XXXXXX), live interactive SmartBoard, and 1-year compliance replays.",
    },
    {
      id: "faq-2",
      question: "How does the AI Learning Companion work?",
      answer: "The AI companion is conditioned strictly on accredited textbooks, official syllabus boundaries, and verified question banks with rigid verification guardrails.",
    },
    {
      id: "faq-3",
      question: "Who can access Campus ERP governance?",
      answer: "Principals, institutional department heads, and verified educators access specialized ERP dashboards for attendance rosters, timetables, and fee collections.",
    },
  ],
  footerContact: {
    tagline: "EduPye is the unified LMS platform providing adaptive AI study companions for learners, smart instructional command for educators, and enterprise-grade ERP governance for institutions.",
    supportEmail: "support@edupye.com",
    supportPhone: "+1 (800) 555-0199",
    address: "Global Innovation Hub, Technology Campus",
    copyrightText: "© 2026 EduPye Global Inc. All rights reserved.",
  },
};

export const DEFAULT_SITE_CONTENT: SiteContentData = {
  hero: {
    tagBadge: "Intelligent Unified LMS & Campus Platform",
    headlineLine1: "One platform.",
    headlineLine2Gradient: "Every learning journey.",
    subtitle:
      "EduPye brings students, educators, campuses, and corporate training teams into one connected cloud ecosystem. Unifying adaptive AI tutoring, smart teacher studios, verified course marketplace, and campus ERP operations.",
    primaryCtaText: "Get Started Free",
    secondaryCtaText: "Sign In to Portal",
  },
  tuitionBanner: {
    badge: "Centralized Tuition Ecosystem",
    title: "EduPye Tuition Mode",
    subtitle:
      "A high-focus, scheduled learning environment engineered for structured one-to-one programs, interactive SmartBoard live classes, combined study streams, and frictionless permanent code access.",
    feature1Title: "Permanent User Codes",
    feature1Desc:
      "Unique Student (STU-XXXXXX) and Teacher (TCH-XXXXXX) codes for instant tuition authentication and program verification.",
    feature2Title: "Dual-Dock SmartBoard",
    feature2Desc:
      "Phase 4 WebRTC live classroom with split-screen multi-mode docks, real-time stylus annotations, document viewing, and full-duplex video.",
    feature3Title: "Combined Study Stream",
    feature3Desc:
      "Program-specific real-time discussion rooms with PDF, image, and video exchange, backed by 1-year compliant storage and automatic archival.",
    feature4Title: "15-Min Post-Session Logout",
    feature4Desc:
      "Automated security protocols ensure student classrooms gracefully close and log out idle participants 15 minutes after class completion.",
  },
  featuredPrograms: {
    programs: [
      {
        code: "PRG-PHY12-DEMO",
        title: "Class 12 Physics - Mechanics & Electromagnetism",
        subject: "Physics",
        grade: "Class 12",
        badge: "Popular",
        schedule: "Mon, Wed, Fri (17:00 - 18:30)",
      },
      {
        code: "PRG-CHEM12",
        title: "Class 12 Chemistry - Organic & Inorganic Prep",
        subject: "Chemistry",
        grade: "Class 12",
        badge: "Top Rated",
        schedule: "Tue, Thu, Sat (16:30 - 18:00)",
      },
      {
        code: "PRG-MATH12",
        title: "Class 12 Mathematics - Calculus & Vectors",
        subject: "Mathematics",
        grade: "Class 12",
        badge: "Comprehensive",
        schedule: "Mon, Wed, Fri (18:30 - 20:00)",
      },
    ],
  },
  announcements: {
    active: true,
    badge: "Announcement",
    message:
      "2026 Academic Term Tuition Mode is now active. Verify your permanent student/teacher code in your profile to access SmartBoard classrooms.",
    linkText: "Learn More",
    linkUrl: "/tuition-mode",
  },
};

const CACHE_KEY = "edupye_site_content_cache";
const LANDING_CACHE_KEY = "edupye_landing_content_cache";

export const contentService = {
  /**
   * Retrieves full structured landing page CMS content (announcement, hero, features, howItWorks, faqs, footerContact)
   */
  async getLandingContent(): Promise<LandingPageContentData> {
    try {
      const res = await fetch(`${API_BASE_URL}/public/landing-content`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          try {
            localStorage.setItem(LANDING_CACHE_KEY, JSON.stringify(json.data));
          } catch {
            // ignore storage quota errors
          }
          return json.data;
        }
      }
    } catch {
      // offline or network error; check cache or fallback
    }

    try {
      const cached = localStorage.getItem(LANDING_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }

    return DEFAULT_LANDING_CONTENT;
  },

  /**
   * Retrieves all dynamic content sections with localStorage caching & fallback
   */
  async getAllContent(): Promise<SiteContentData> {
    try {
      const res = await fetch(`${API_BASE_URL}/content`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.content) {
          const merged: SiteContentData = {
            hero: { ...DEFAULT_SITE_CONTENT.hero, ...(json.content.hero || {}) },
            tuitionBanner: { ...DEFAULT_SITE_CONTENT.tuitionBanner, ...(json.content.tuitionBanner || {}) },
            featuredPrograms: { ...DEFAULT_SITE_CONTENT.featuredPrograms, ...(json.content.featuredPrograms || {}) },
            announcements: { ...DEFAULT_SITE_CONTENT.announcements, ...(json.content.announcements || {}) },
          };
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
          } catch {
            // ignore storage quota errors
          }
          return merged;
        }
      }
    } catch {
      // offline or network error; use fallback
    }

    // Try reading cached version
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          hero: { ...DEFAULT_SITE_CONTENT.hero, ...(parsed.hero || {}) },
          tuitionBanner: { ...DEFAULT_SITE_CONTENT.tuitionBanner, ...(parsed.tuitionBanner || {}) },
          featuredPrograms: { ...DEFAULT_SITE_CONTENT.featuredPrograms, ...(parsed.featuredPrograms || {}) },
          announcements: { ...DEFAULT_SITE_CONTENT.announcements, ...(parsed.announcements || {}) },
        };
      }
    } catch {
      // fallback to hardcoded default
    }

    return DEFAULT_SITE_CONTENT;
  },

  /**
   * Retrieves a single section by key
   */
  async getContentByKey<T>(key: keyof SiteContentData): Promise<T> {
    try {
      const res = await fetch(`${API_BASE_URL}/content/${String(key)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as T;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SITE_CONTENT[key] as unknown as T;
  },
};
