# Pegpo EduPay — Educational & Academic Management Platform

A modern, high-performance interactive educational, teaching, and research management platform built with **React 19**, **TypeScript**, **Vite 8**, **React Router 7**, and **Tailwind CSS 4**.

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Language** | [TypeScript 7](https://www.typescriptlang.org/) (Strict TSX) |
| **UI & Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + PostCSS + [Lucide React](https://lucide.dev/) |
| **Routing** | [React Router 7](https://reactrouter.com/) (Code-Split Lazy Routes) |
| **Linter & Quality** | [Oxlint](https://oxlint.dev/) + TypeScript (`tsc --noEmit`) |

---

## 📁 Project Architecture

```
pegpo-edupay/
├── public/                  # Favicons and static SVG icons
├── src/
│   ├── assets/              # Subject cards, artwork, and profile images
│   ├── components/
│   │   ├── common/          # EdupyeLogo and shared branding
│   │   └── ui/              # Reusable UI elements (Button, Modal, Loader, Toast, StateViews)
│   ├── context/             # React Context providers (ToastContext)
│   ├── data/                # Mock data & initial application state
│   ├── hooks/               # Custom hooks (useToast, useTeacherKanban, useStudentData, etc.)
│   ├── layouts/             # Role-based root layouts (StudentLayout, TeacherLayout, ResearchLayout)
│   ├── pages/
│   │   ├── auth/            # SignUp, Onboarding
│   │   ├── student/         # Learn, Library, Notebook, ExamCracker, Courses, Projects, etc.
│   │   ├── teacher/         # Dashboard, KanbanBoard, TeacherCalendar, LessonPlanner, Assessment, etc.
│   │   └── research/        # Analyses, Synthesize, WritePaper, Bookmarks, ProjectManagement, Ask, etc.
│   ├── routes/              # AppRoutes.tsx (Lazy route definitions)
│   ├── services/            # Mock API service layer (authService, studentService, teacherService, researchService)
│   ├── types/               # TypeScript interfaces & domain types (student, teacher, research, common)
│   ├── App.tsx              # Main application root wrapper
│   ├── main.tsx             # Entry point & React DOM renderer
│   └── index.css            # Tailwind CSS 4 theme & styles
├── package.json
├── tsconfig.json            # Strict TypeScript configuration
└── vite.config.js           # Vite build & plugin configuration
```

---

## 💻 Portals & Key Features

### 🎓 Student Portal (`/student`)
- **Dashboard & Exploration**: Personalized learning overview, subject exploration, and interactive progress trackers.
- **Learn & Subject Workspaces**: Interactive video lessons, quiz module with status tracking (Attempted, Revise Later, Skipped), and subject selection.
- **Exam & Practice Suite**: Exam Cracker tool, flashcard revision decks, worksheets, and online test simulation center.
- **Resource Management**: Digital Library shelf, personal Bookshelf, study Notebook workspace, and PDF/document upload center.
- **Interactive Tools**: Live class workspace, voice recorder notes, homework folder management, and AI search indexer.

### 👩‍🏫 Teacher Portal (`/teacher`)
- **Instructional Dashboard**: Unified workspace with quick switching between lesson planners, calendars, task lists, and projects.
- **Kanban Task Manager**: Drag-and-drop styled Kanban board with category pickers (Operational, Technical, Strategic, Hiring, Financial) and December due date picker.
- **Lesson Planner & Syllabus Builder**: Syllabus design, learning objective mapping, and chapter duration managers.
- **Assessment & Scorecard**: Interactive student grade ledger with dynamic score input and status tags (Graded, Pending).
- **Interactive Teaching & Canvas**: Digital smartboard, 3D interactive physics/chemistry lab, and live class stream controls.

### 🔬 Research Portal (`/research`)
- **Research Hub**: Literature search engine, evidence synthesis (Systematic Review, Meta-Analysis, Scoping Review), and document draft assistant.
- **AI Research & Synthesis**: AI-assisted citation extraction, hypothesis comparison, and research gap identifier tools.
- **Project & Task Management**: Activity tables, milestone planners, task manager modal, online collaborator lists, and bookmark shelf folders.

---

## 🛠️ Prerequisites & Setup

### Prerequisites
- **Node.js**: `v20+` (tested on `v22.x`)
- **npm**: `v10+`

### Installation & Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/adarshh1234/edupye-React.git
   cd edupye-React
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Runs TypeScript type checking and compiles optimized production bundle into `/dist` |
| `npm run preview` | Previews the compiled production build locally |
| `npm run lint` | Runs Oxlint static code analysis across the codebase |
| `npx tsc --noEmit` | Validates TypeScript types across all `.ts` and `.tsx` files without emitting code |

---

## ⚡ Performance & Optimization

- **Single Responsibility Component Architecture**: Every page and workspace component lives in its own file under `src/pages/<role>/`.
- **Dynamic Route Code-Splitting**: Route chunks are lazy-loaded on demand via `React.lazy()` and React Router `Suspense`.
- **Stable Component Keying**: Lists and dynamic mappings use stable IDs to maximize React virtual DOM diffing efficiency.
