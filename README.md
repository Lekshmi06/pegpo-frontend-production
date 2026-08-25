# Pegpo EduPay — Educational & Academic Management Platform

Full-stack interactive educational, teaching, and research management platform ("Pegpo EduPay"), built with React, Vite, and Tailwind CSS.

---

## Tech Stack

### Web App (`pegpo-edupay`)

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 19 + Vite 8 |
| **Language** | JavaScript (JSX) / Node.js |
| **UI & Styling** | Tailwind CSS 4 + PostCSS + Lucide React |
| **Routing** | React Router 7 |
| **Linter** | Oxlint |

---

## Portals & Features

### 🎓 Student Portal (`/student`)
- **Dashboard & Exploration**: Personalized learning overview, explore feed, and progress trackers.
- **Study & Exam Preparation**: Exam Cracker tool, revision flashcards, workbooks, worksheets, and online test center.
- **Resource Management**: Digital Library, personal Bookshelf, study Notebook, and media uploads center.
- **Interactive Workspace**: Live class launcher, voice notes recorder, student project boards, and AI search finder.

### 👩‍🏫 Teacher Portal (`/teacher`)
- **Instructional Dashboard**: Teacher overview, lesson planner, course calendar, and Kanban task tracker.
- **Assessment & Examination**: Custom test/quiz creator, term examinations, and automated assessment tools.
- **Interactive Teaching**: Digital smartboard canvas, 3D interactive physics/chemistry lab, and live class stream setup.
- **Classroom Collaboration**: Project boards, tuition program management, and recorded lectures archive.

### 🔬 Research Portal (`/research`)
- **Research Hub**: Literature search engine, document synthesis, paper writer workspace, and AI research suite.
- **Project & Task Management**: Multi-stage research Kanban board, milestones calendar, task management, and saved bookmarks.

---

## Prerequisites

- **Node.js** v20+ (tested on v22)
- **npm** v10+

---

## Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Runs at [http://localhost:5173](http://localhost:5173).

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Compiles and builds optimized production bundle into `/dist` |
| `npm run preview` | Previews the compiled production build locally |
| `npm run lint` | Runs Oxlint static code analysis across the codebase |

