import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from '../components/ui/Loader';

// Auth Pages
const SignUp = lazy(() => import('../pages/auth/SignUp'));
const Login = lazy(() => import('../pages/auth/Login'));
const PersonalDetails = lazy(() => import('../pages/auth/PersonalDetails'));
const Onboarding = lazy(() => import('../pages/auth/Onboarding'));
const SchoolOnboarding = lazy(() => import('../pages/auth/SchoolOnboarding'));
const UndergraduateOnboarding = lazy(() => import('../pages/auth/UndergraduateOnboarding'));
const PostgraduateOnboarding = lazy(() => import('../pages/auth/PostgraduateOnboarding'));
const CompetitiveExamOnboarding = lazy(() => import('../pages/auth/CompetitiveExamOnboarding'));
const TeacherOnboarding = lazy(() => import('../pages/auth/TeacherOnboarding'));
const ResearcherOnboarding = lazy(() => import('../pages/auth/ResearcherOnboarding/ResearcherOnboarding'));
const CompanyOnboarding = lazy(() => import('../pages/auth/CompanyOnboarding'));

// Student Layout & Pages
const StudentLayout = lazy(() => import('../layouts/StudentLayout'));
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const StudentHomeExplore = lazy(() => import('../pages/student/StudentHomeExplore'));
const Library = lazy(() => import('../pages/student/Library'));
const Upload = lazy(() => import('../pages/student/Upload'));
const RecordPage = lazy(() => import('../pages/student/Record'));
const LiveClasses = lazy(() => import('../pages/student/LiveClasses'));
const ExamCrackerPage = lazy(() => import('../pages/student/ExamCracker'));
const NotebookPage = lazy(() => import('../pages/student/Notebook'));
const Courses = lazy(() => import('../pages/student/Courses'));
const Profile = lazy(() => import('../pages/student/Profile'));
const StudentCalendar = lazy(() => import('../pages/student/Calendar'));
const Projects = lazy(() => import('../pages/student/Projects'));
const NewFolder = lazy(() => import('../pages/student/NewFolder'));
const Bookshelf = lazy(() => import('../pages/student/Bookshelf'));

// Student Other Pages
const Learn = lazy(() => import('../pages/student/Learn'));
const Tests = lazy(() => import('../pages/student/Tests'));
const Practice = lazy(() => import('../pages/student/Practice'));
const QuizHub = lazy(() => import('../pages/student/QuizHub'));
const GenericStudentPage = lazy(() => import('../pages/student/GenericStudentPage'));

// Teacher Layout & Pages
const TeacherLayout = lazy(() => import('../layouts/TeacherLayout'));
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'));
const KanbanBoard = lazy(() => import('../pages/teacher/KanbanBoard'));

// Teacher Other Pages
const TeacherProfile = lazy(() => import('../pages/teacher/TeacherProfile'));
const LessonPlanner = lazy(() => import('../pages/teacher/LessonPlanner'));
const TeacherCalendar = lazy(() => import('../pages/teacher/TeacherCalendar'));
const TeacherBlankWorkspace = lazy(() => import('../pages/teacher/TeacherBlankWorkspace'));
const GenericTeacherPage = lazy(() => import('../pages/teacher/GenericTeacherPage'));
const SmartBoardHome = lazy(() => import('../pages/teacher/smartboard/SmartBoardHome'));
const StandardSmartBoard = lazy(() => import('../pages/teacher/smartboard/StandardSmartBoard'));
const IntegratedSmartBoard = lazy(() => import('../pages/teacher/smartboard/IntegratedSmartBoard'));
const AssessmentStudio = lazy(() => import('../pages/teacher/assessment/AssessmentStudio'));
const TeacherClasses = lazy(() => import('../pages/teacher/classes/TeacherClasses'));
const TeacherUpload = lazy(() => import('../pages/teacher/Upload'));

// Research Layout & Pages
const ResearchLayout = lazy(() => import('../layouts/ResearchLayout'));
const ResearchDashboard = lazy(() => import('../pages/research/Dashboard'));
const Discover = lazy(() => import('../pages/research/Discover'));
const ResearchLibrary = lazy(() => import('../pages/research/Library'));

// Research Other Pages
const Analyses = lazy(() => import('../pages/research/Analyses'));
const Synthesize = lazy(() => import('../pages/research/Synthesize'));
const Ask = lazy(() => import('../pages/research/Ask'));
const WritePaper = lazy(() => import('../pages/research/WritePaper'));
const Bookmarks = lazy(() => import('../pages/research/Bookmarks'));
const ProjectManagement = lazy(() => import('../pages/research/ProjectManagement'));
const ProjectWorkspace = lazy(() => import('../pages/research/ProjectWorkspace'));
const TaskManagement = lazy(() => import('../pages/research/TaskManagement'));
const ResearchNotebook = lazy(() => import('../pages/research/Notebook'));
const Citations = lazy(() => import('../pages/research/Citations'));
const Collaboration = lazy(() => import('../pages/research/Collaboration'));
const ResearchKanban = lazy(() => import('../pages/research/Kanban'));
const ResearchCalendar = lazy(() => import('../pages/research/Calendar'));
const ResearchUpload = lazy(() => import('../pages/research/Upload'));
const ResearchNewFolder = lazy(() => import('../pages/research/NewFolder'));
const GenericResearchPage = lazy(() => import('../pages/research/GenericResearchPage'));

// Institution Module Pages
const InstitutionHome = lazy(() => import('../pages/institution/InstitutionHome'));
const SchoolPortalContainer = lazy(() => import('../pages/institution/SchoolPortalContainer'));
const CollegePortalContainer = lazy(() => import('../pages/institution/CollegePortalContainer'));
const InstitutionLayout = lazy(() => import('../layouts/InstitutionLayout'));
const InstitutionDashboard = lazy(() => import('../pages/institution/InstitutionDashboard'));
const InstitutionMembers = lazy(() => import('../pages/institution/InstitutionMembers'));
const CorporatePrograms = lazy(() => import('../pages/institution/CorporatePrograms'));
const CorporateDepartments = lazy(() => import('../pages/institution/CorporateDepartments'));
const CompanySettings = lazy(() => import('../pages/institution/CompanySettings'));
const InstitutionJoin = lazy(() => import('../pages/institution/InstitutionJoin'));

// Course Marketplace & LMS Modules
const ProviderLayout = lazy(() => import('../layouts/ProviderLayout'));
const ProviderDashboard = lazy(() => import('../pages/provider/ProviderDashboard'));
const CourseBuilder = lazy(() => import('../pages/provider/CourseBuilder'));
const LearnerLayout = lazy(() => import('../layouts/LearnerLayout'));
const LearnerDashboard = lazy(() => import('../pages/learner/LearnerDashboard'));
const Marketplace = lazy(() => import('../pages/marketplace/Marketplace'));
const CourseDetails = lazy(() => import('../pages/marketplace/CourseDetails'));
const CourseLearningPlayer = lazy(() => import('../pages/learner/CourseLearningPlayer'));


export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullScreen size="lg" text="Loading module..." />}>
      <Routes>
        {/* Auth Flows */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/personal-details" element={<PersonalDetails />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/school" element={<SchoolOnboarding />} />
        <Route path="/onboarding/undergraduate" element={<UndergraduateOnboarding />} />
        <Route path="/onboarding/postgraduate" element={<PostgraduateOnboarding />} />
        <Route path="/onboarding/competitive" element={<CompetitiveExamOnboarding />} />
        <Route path="/onboarding/teacher" element={<TeacherOnboarding />} />
        <Route path="/onboarding/researcher" element={<ResearcherOnboarding />} />
        <Route path="/onboarding/company" element={<CompanyOnboarding />} />
        <Route path="/company/setup" element={<CompanyOnboarding />} />

        {/* Student Portal */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="home" element={<StudentHomeExplore />} />
          <Route path="learn" element={<Learn />} />
          <Route path="library" element={<Library />} />
          <Route path="notebook" element={<NotebookPage />} />
          <Route path="explore" element={<GenericStudentPage title="Explore Content" desc="Find courses from other schools and institutions." />} />
          <Route path="courses" element={<Courses />} />
          <Route path="exam-cracker" element={<ExamCrackerPage />} />
          <Route path="practice" element={<Practice />} />
          <Route path="revision" element={<Practice />} />
          <Route path="exercise" element={<Practice />} />
          <Route path="workbook" element={<Practice />} />
          <Route path="homework" element={<Practice />} />
          <Route path="quiz" element={<QuizHub />} />
          <Route path="tests" element={<Tests />} />
          <Route path="history" element={<GenericStudentPage title="Performance History" desc="Graph your mock grade history and study sessions." />} />
          <Route path="ai-search" element={<GenericStudentPage title="AI Search Finder" desc="AI search indexer for referencing terms." />} />
          <Route path="upload" element={<Upload />} />
          <Route path="record" element={<RecordPage />} />
          <Route path="live-classes" element={<LiveClasses />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookmarks" element={<GenericStudentPage title="Bookmarks Shelf" desc="Saved notes, clips, maps, and specific bookmarks." />} />
          <Route path="calendar" element={<StudentCalendar />} />
          <Route path="projects" element={<Projects />} />
          <Route path="bookshelf" element={<Bookshelf />} />
        </Route>

        {/* Teacher Portal */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="tasks" element={<KanbanBoard />} />
          <Route path="calendar" element={<TeacherCalendar />} />
          <Route path="lesson-plan" element={<LessonPlanner />} />
          <Route path="projects" element={<GenericTeacherPage title="Teacher Projects" desc="Track group tasks and assignments." />} />
          
          <Route path="library" element={<GenericTeacherPage title="Teacher Library" desc="Reference materials, textbook sources, and answer keys." />} />
          <Route path="notebook" element={<GenericTeacherPage title="Teacher Notebook" desc="Lesson drafts, planning templates, and sync logs." />} />
          <Route path="upload" element={<TeacherUpload />} />
          <Route path="live-classes" element={<GenericTeacherPage title="Live Classes Workspace" desc="Launch live Zoom/Teams lectures and track attendee counts." />} />
          <Route path="ask" element={<GenericTeacherPage title="AI Teacher Help" desc="Chat with syllabus guidelines or generate quiz questions." />} />
          <Route path="test" element={<AssessmentStudio />} />
          <Route path="examination" element={<GenericTeacherPage title="Term Examinations" desc="Manage midterm/final examination schedules." />} />
          <Route path="assessment" element={<AssessmentStudio />} />
          <Route path="new-folder" element={<GenericTeacherPage title="New Folder" desc="Configure resource folders and sync pathways." />} />
          <Route path="bookshelf" element={<GenericTeacherPage title="Class Bookshelf" desc="Selected reading lists and textbooks for classes." />} />
          <Route path="collaboration" element={<TeacherBlankWorkspace />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="tuition" element={<TeacherClasses />} />
          <Route path="smartboard" element={<SmartBoardHome />} />
          <Route path="project" element={<GenericTeacherPage title="Class Projects" desc="Track group tasks and assignments." />} />
          <Route path="3d-lab" element={<GenericTeacherPage title="3D Interactive Lab" desc="Explore physics simulations." />} />
          <Route path="edu-game" element={<GenericTeacherPage title="Edu Games Shelf" desc="Manage educational puzzles." />} />
          <Route path="edu-shop" element={<GenericTeacherPage title="Edu Shop" desc="Syllabus materials and classroom supplies store." />} />
        </Route>

        {/* Dedicated Full-Screen Teacher Smart Board Workspaces */}
        <Route path="/teacher/smartboard/standard" element={<StandardSmartBoard />} />
        <Route path="/teacher/smartboard/integrated" element={<IntegratedSmartBoard />} />

        {/* Research Portal */}
        <Route path="/research" element={<ResearchLayout />}>
          <Route index element={<ResearchDashboard />} />
          <Route path="discover" element={<Discover />} />
          <Route path="search" element={<Discover />} />
          <Route path="library" element={<ResearchLibrary />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="projects/:id" element={<ProjectWorkspace />} />
          <Route path="project-mgmt" element={<ProjectManagement />} />

          <Route path="notebook" element={<ResearchNotebook />} />
          <Route path="analysis" element={<Analyses />} />
          <Route path="analyses" element={<Analyses />} />
          <Route path="synthesize" element={<Synthesize />} />
          <Route path="write" element={<WritePaper />} />
          <Route path="writing" element={<WritePaper />} />
          <Route path="citations" element={<Citations />} />
          <Route path="collaboration" element={<Collaboration />} />
          <Route path="ai-research" element={<GenericResearchPage title="AI Research Hub" desc="Leverage AI agents to synthesize documents." />} />
          <Route path="upload" element={<ResearchUpload />} />
          <Route path="record" element={<GenericResearchPage title="Voice Recorder Notes" desc="Record discussions and get transcripts." />} />
          <Route path="new-folder" element={<ResearchNewFolder />} />
          <Route path="calendar" element={<ResearchCalendar />} />
          <Route path="task-mgmt" element={<ResearchKanban />} />
          <Route path="kanban" element={<ResearchKanban />} />
          <Route path="ask" element={<Ask />} />
          <Route path="bookshelf" element={<GenericResearchPage title="Research Bookshelf" desc="Manage textbooks and manuals." />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="genius-test" element={<GenericResearchPage title="Genius Testing Center" desc="Examine study benchmarks." />} />
        </Route>

        {/* Institution Module */}
        <Route path="/institution" element={<InstitutionHome />} />
        <Route path="/institution/join" element={<InstitutionJoin />} />
        <Route path="/institution/school" element={<SchoolPortalContainer />} />
        <Route path="/institution/school/*" element={<SchoolPortalContainer />} />
        <Route path="/institution/college" element={<CollegePortalContainer />} />
        <Route path="/institution/college/*" element={<CollegePortalContainer />} />

        {/* Native EduPye Corporate Learning Workspace */}
        <Route path="/institution/portal" element={<InstitutionLayout />}>
          <Route index element={<InstitutionDashboard />} />
          <Route path="dashboard" element={<InstitutionDashboard />} />
          <Route path="members" element={<InstitutionMembers />} />
          <Route path="employees" element={<InstitutionMembers />} />
          <Route path="programs" element={<CorporatePrograms />} />
          <Route path="departments" element={<CorporateDepartments />} />
          <Route path="settings" element={<CompanySettings />} />
        </Route>
        <Route path="/institution/dashboard" element={<Navigate to="/institution/portal/dashboard" replace />} />
        <Route path="/institution/members" element={<Navigate to="/institution/portal/members" replace />} />
        <Route path="/institution/employees" element={<Navigate to="/institution/portal/members" replace />} />
        <Route path="/institution/programs" element={<Navigate to="/institution/portal/programs" replace />} />
        <Route path="/institution/departments" element={<Navigate to="/institution/portal/departments" replace />} />
        <Route path="/institution/settings" element={<Navigate to="/institution/portal/settings" replace />} />

        {/* Course Marketplace (Public & Learners) */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/courses" element={<Marketplace />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/learn/:id" element={<CourseLearningPlayer />} />

        {/* Provider Studio Portal */}
        <Route path="/provider" element={<ProviderLayout />}>
          <Route index element={<ProviderDashboard />} />
          <Route path="courses/new" element={<CourseBuilder />} />
          <Route path="courses/:id/builder" element={<CourseBuilder />} />
        </Route>

        {/* Learner Portal */}
        <Route path="/learner" element={<LearnerLayout />}>
          <Route index element={<LearnerDashboard />} />
          <Route path="courses" element={<LearnerDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
