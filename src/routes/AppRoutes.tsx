import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from '../components/ui/Loader';

// Auth Pages
const SignUp = lazy(() => import('../pages/auth/SignUp'));
const Onboarding = lazy(() => import('../pages/auth/Onboarding'));

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
const GenericStudentPage = lazy(() => import('../pages/student/GenericStudentPage'));

// Teacher Layout & Pages
const TeacherLayout = lazy(() => import('../layouts/TeacherLayout'));
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'));
const KanbanBoard = lazy(() => import('../pages/teacher/KanbanBoard'));

// Teacher Other Pages
const TeacherCalendar = lazy(() => import('../pages/teacher/TeacherCalendar'));
const TeacherBlankWorkspace = lazy(() => import('../pages/teacher/TeacherBlankWorkspace'));
const GenericTeacherPage = lazy(() => import('../pages/teacher/GenericTeacherPage'));

// Research Layout & Pages
const ResearchLayout = lazy(() => import('../layouts/ResearchLayout'));
const ResearchDashboard = lazy(() => import('../pages/research/Dashboard'));

// Research Other Pages
const Analyses = lazy(() => import('../pages/research/Analyses'));
const Synthesize = lazy(() => import('../pages/research/Synthesize'));
const Ask = lazy(() => import('../pages/research/Ask'));
const WritePaper = lazy(() => import('../pages/research/WritePaper'));
const Bookmarks = lazy(() => import('../pages/research/Bookmarks'));
const ProjectManagement = lazy(() => import('../pages/research/ProjectManagement'));
const TaskManagement = lazy(() => import('../pages/research/TaskManagement'));
const GenericResearchPage = lazy(() => import('../pages/research/GenericResearchPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullScreen size="lg" text="Loading module..." />}>
      <Routes>
        {/* Auth Flows */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/onboarding" element={<Onboarding />} />

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
          <Route path="practice" element={<GenericStudentPage title="Practice Mode" desc="Practice mock templates to prepare for school exams." />} />
          <Route path="revision" element={<GenericStudentPage title="Revision Deck" desc="Interactive flashcards and AI study notes." />} />
          <Route path="exercise" element={<GenericStudentPage title="Worksheets" desc="Worksheets and classroom exercises assigned by teachers." />} />
          <Route path="workbook" element={<GenericStudentPage title="Workbooks" desc="Review online exercise solutions and formulas." />} />
          <Route path="homework" element={<NewFolder />} />
          <Route path="tests" element={<GenericStudentPage title="Online Tests" desc="Complete graded tests, timers, and assessment links." />} />
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
          <Route path="tasks" element={<KanbanBoard />} />
          <Route path="calendar" element={<TeacherCalendar />} />
          <Route path="lesson-plan" element={<TeacherBlankWorkspace />} />
          <Route path="projects" element={<GenericTeacherPage title="Teacher Projects" desc="Track group tasks and assignments." />} />
          
          <Route path="library" element={<GenericTeacherPage title="Teacher Library" desc="Reference materials, textbook sources, and answer keys." />} />
          <Route path="notebook" element={<GenericTeacherPage title="Teacher Notebook" desc="Lesson drafts, planning templates, and sync logs." />} />
          <Route path="upload" element={<GenericTeacherPage title="Content Uploads" desc="Upload slides, textbook documents, and syllabus PDFs." />} />
          <Route path="live-classes" element={<GenericTeacherPage title="Live Classes Workspace" desc="Launch live Zoom/Teams lectures and track attendee counts." />} />
          <Route path="ask" element={<GenericTeacherPage title="AI Teacher Help" desc="Chat with syllabus guidelines or generate quiz questions." />} />
          <Route path="test" element={<GenericTeacherPage title="Test Creator" desc="Design custom quizzes, exam papers, and templates." />} />
          <Route path="examination" element={<GenericTeacherPage title="Term Examinations" desc="Manage midterm/final examination schedules." />} />
          <Route path="assessment" element={<TeacherBlankWorkspace />} />
          <Route path="new-folder" element={<GenericTeacherPage title="New Folder" desc="Configure resource folders and sync pathways." />} />
          <Route path="bookshelf" element={<GenericTeacherPage title="Class Bookshelf" desc="Selected reading lists and textbooks for classes." />} />
          <Route path="collaboration" element={<TeacherBlankWorkspace />} />
          <Route path="tuition" element={<GenericTeacherPage title="Tuition Programs" desc="Manage extracurricular tuition batches." />} />
          <Route path="recorded" element={<GenericTeacherPage title="Recorded Classes Archive" desc="Manage lecture video recordings." />} />
          <Route path="smartboard" element={<GenericTeacherPage title="Interactive Canvas" desc="Load chalkboard canvas diagrams." />} />
          <Route path="project" element={<GenericTeacherPage title="Class Projects" desc="Track group tasks and assignments." />} />
          <Route path="3d-lab" element={<GenericTeacherPage title="3D Interactive Lab" desc="Explore physics simulations." />} />
          <Route path="edu-game" element={<GenericTeacherPage title="Edu Games Shelf" desc="Manage educational puzzles." />} />
          <Route path="edu-shop" element={<GenericTeacherPage title="Edu Shop" desc="Syllabus materials and classroom supplies store." />} />
        </Route>

        {/* Research Portal */}
        <Route path="/research" element={<ResearchLayout />}>
          <Route index element={<ResearchDashboard />} />
          <Route path="library" element={<GenericResearchPage title="Research Library" desc="Browse reference textbooks, journal archives, and indexes." />} />
          <Route path="notebook" element={<GenericResearchPage title="Research Notebook" desc="Draft hypotheses, research methodology, and study logs." />} />
          <Route path="ai-research" element={<GenericResearchPage title="AI Research Hub" desc="Leverage AI agents to synthesize documents." />} />
          <Route path="search" element={<GenericResearchPage title="Literature Search" desc="Run searches against local and online vector indexes." />} />
          <Route path="analyses" element={<Analyses />} />
          <Route path="synthesize" element={<Synthesize />} />
          <Route path="write" element={<WritePaper />} />
          <Route path="collaboration" element={<GenericResearchPage title="Collaboration Space" desc="Co-author articles and sync database changes." />} />
          <Route path="upload" element={<GenericResearchPage title="Document Upload Center" desc="Upload PDFs, dataset files, or slide files." />} />
          <Route path="record" element={<GenericResearchPage title="Voice Recorder Notes" desc="Record discussions and get transcripts." />} />
          <Route path="new-folder" element={<GenericResearchPage title="New Workspace Folder" desc="Organize goals and source maps." />} />
          <Route path="calendar" element={<GenericResearchPage title="Research Calendar" desc="Sync publication milestones and deadlines." />} />
          <Route path="project-mgmt" element={<ProjectManagement />} />
          <Route path="task-mgmt" element={<TaskManagement />} />
          <Route path="kanban" element={<GenericResearchPage title="Research Kanban Board" desc="Move cards between study, draft, and submit gates." />} />
          <Route path="ask" element={<Ask />} />
          <Route path="bookshelf" element={<GenericResearchPage title="Research Bookshelf" desc="Manage textbooks and manuals." />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="genius-test" element={<GenericResearchPage title="Genius Testing Center" desc="Examine study benchmarks." />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
