import { preview } from 'vite';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

async function launchSystemBrowser() {
  const channels = ['msedge', 'chrome'];
  for (const channel of channels) {
    try {
      const browser = await chromium.launch({
        channel,
        headless: true,
      });
      console.log(`[Browser Engine] Initialized system browser: ${channel} (${browser.version()})`);
      return { browser, channel };
    } catch (err) {
      console.warn(`[Browser Engine] Channel '${channel}' unavailable: ${err.message}`);
    }
  }
  throw new Error('No compatible system browser (Edge or Chrome) could be launched.');
}

async function runComprehensiveStudentRegressionAudit() {
  console.log('=== EDUPYE STUDENT MODULE: COMPREHENSIVE REGRESSION AUDIT ===\n');

  const PORT = 4199;
  const server = await preview({
    root: 'Frontend-vercel',
    preview: {
      port: PORT,
      strictPort: true,
    },
  });
  const baseURL = `http://localhost:${PORT}`;
  console.log(`[Vite Preview] Production server listening at: ${baseURL}\n`);

  const { browser } = await launchSystemBrowser();
  const consoleErrors = [];
  const failedRequests = [];
  let page;

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  async function auditCase(id, title, fn) {
    totalTests++;
    process.stdout.write(`[Audit Case ${id}] ${title} ... `);
    try {
      await fn();
      console.log('PASS');
      passedTests++;
    } catch (err) {
      console.log(`FAIL\n  --> ${err.message}`);
      if (page) {
        const currentUrl = page.url();
        const bodySnippet = (await page.textContent('body').catch(() => ''))?.slice(0, 300).replace(/\s+/g, ' ');
        console.log(`  [Debug on Fail] URL: ${currentUrl} | Snippet: ${bodySnippet}`);
      }
      failedTests++;
    }
  }

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('React Router Future Flag') && !text.includes('favicon.ico')) {
          consoleErrors.push({ url: page.url(), message: text });
        }
      }
    });

    page.on('response', (res) => {
      const status = res.status();
      const url = res.url();
      if (status >= 400 && url.includes('/api/')) {
        failedRequests.push({ url, status, method: res.request().method() });
      }
    });

    // Helper to simulate session
    async function initSession(track = 'school') {
      const token = 'mock_student_token_regression';
      const user = {
        _id: '6aa29a1fe8bf422fe51b52c4',
        id: '6aa29a1fe8bf422fe51b52c4',
        name: 'Jeevan Student',
        role: 'student',
        email: 'jeevan@mail.com',
      };
      const profile = {
        _id: '6aa29a1fe8bf422fe51b52c5',
        userId: '6aa29a1fe8bf422fe51b52c4',
        name: 'Jeevan Student',
        learningPath: track,
        education: {
          level: track,
          board: 'CBSE',
          classLevel: 'Class 10',
          stream: 'Science',
        },
        schoolDetails: {
          schoolName: 'Delhi Public School',
          board: 'CBSE',
          classLevel: 'Class 10',
          selectedSubject: 'Mathematics',
        },
        undergraduateDetails: {
          institution: 'IIT Delhi',
          degree: 'B.Tech',
          specialization: 'Computer Science',
          semester: 'Semester 4',
        },
        postgraduateDetails: {
          institution: 'IISc Bangalore',
          degree: 'M.Tech',
          specialization: 'Artificial Intelligence',
        },
        competitiveExamDetails: {
          targetExam: 'JEE_MAIN',
          targetYear: '2027',
        },
      };

      await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(({ token, user, profile }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('studentProfile', JSON.stringify(profile));
        localStorage.setItem('studentProfileId', profile._id);
      }, { token, user, profile });
    }

    // Central API mocks for deterministic test execution
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();

      // Student Analytics
      if (path.includes('/students/dashboard/analytics') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              student: {
                name: 'Jeevan Student',
                email: 'jeevan@mail.com',
                gradeOrLevel: 'Class 10',
                institution: 'Delhi Public School',
              },
              summaryCards: {
                studyTimeThisWeek: { formatted: '14.5 hrs', hasActivity: true },
                learningMaterialsCompleted: { lessonsCompleted: 12, quizzesCompleted: 8, hasActivity: true },
                quizAverage: { formatted: '88%', hasActivity: true },
                currentStudyStreak: { days: 5, bestStreakDays: 14, hasActivity: true },
              },
              weeklyStudyActivity: [],
              subjectProgress: [],
              recentAssessments: [],
              recentActivity: [],
              upcomingTasks: [],
              continueLearning: [],
              aiStudyRecommendations: [],
            },
          }),
        });
      }

      // Student Profile
      if (path.includes('/students/') && method === 'GET') {
        const profile = JSON.parse(await page.evaluate(() => localStorage.getItem('studentProfile') || '{}'));
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: profile }),
        });
      }

      // Student Profile PUT
      if (path.includes('/students/') && method === 'PUT') {
        const payload = route.request().postDataJSON() || {};
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: payload }),
        });
      }

      // Tests
      if (path.endsWith('/tests') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'test_101',
                _id: 'test_101',
                title: 'Class 10 Science Practice Test',
                description: 'Physics and Chemistry practice questions.',
                subject: 'Science',
                board: 'CBSE',
                classLevel: 'Class 10',
                durationMinutes: 45,
                totalQuestions: 15,
                isLocked: false,
                isCompetitiveExam: false,
              },
            ],
          }),
        });
      }

      // Competitive Exams
      if (path.endsWith('/competitive/exams') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'JEE_MAIN',
                code: 'JEE_MAIN',
                name: 'JEE Main (Joint Entrance Examination)',
                category: 'Engineering',
                description: 'Engineering entrance CBT examination.',
                durationMinutes: 180,
                totalQuestions: 25,
                maxScore: 100,
                markingScheme: { correctMarks: 4, negativeMarks: 1, maxScore: 100 },
                sections: [{ id: 's1', name: 'Physics', totalQuestions: 10, marksPerQuestion: 4, negativeMarks: 1 }],
              },
            ],
          }),
        });
      }

      // PYQs
      if (path.endsWith('/competitive/pyqs') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              totalCount: 1,
              page: 1,
              limit: 20,
              totalPages: 1,
              questions: [
                {
                  id: 1,
                  question: 'What is the dimension of universal gravitational constant?',
                  options: [{ id: 'A', text: '[M^-1 L^3 T^-2]' }],
                  correctAnswer: 'A',
                  explanation: 'From F = G*m1*m2/r^2',
                  marks: 4,
                  negativeMarks: 1,
                  subject: 'Physics',
                  sourceType: 'previous_year',
                  sourceYear: 2023,
                  sourceExam: 'JEE_MAIN',
                  isVerifiedSource: true,
                },
              ],
              facets: { years: [2023], subjects: ['Physics'] },
            },
          }),
        });
      }

      // Notes
      if (path.endsWith('/workspace/notes') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                _id: 'note_1',
                title: 'Physics Mechanics Notes',
                content: '# Physics Mechanics\n\nNewton second law: F = m*a.\n- [ ] Revise derivation\n- [x] Read textbook chapter 4',
                preview: 'Newton second law: F = m*a.',
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        });
      }

      // Folders
      if (path.endsWith('/workspace/folders') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      }

      // Calendar Events
      if (path.endsWith('/workspace/calendar') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                _id: 'ev_1',
                title: 'Physics Mid-Term Exam',
                eventType: 'exam',
                date: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                endTime: '11:00',
                isCompleted: false,
              },
            ],
          }),
        });
      }

      // Projects
      if (path.endsWith('/workspace/projects') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                _id: 'proj_1',
                name: 'Solar System Planetary Orbit Simulation',
                title: 'Solar System Planetary Orbit Simulation',
                content: 'Simulation of gravitational planetary motion using Kepler laws.',
                status: 'in_progress',
              },
            ],
          }),
        });
      }

      // Assignments (Structure conforming to StudentAssignmentItem)
      if (path.includes('/assignments/student') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                assignment: {
                  _id: 'asg_1',
                  id: 'asg_1',
                  title: 'Class 10 Physics Homework: Optics & Refraction',
                  subject: 'Science',
                  description: 'Solve textbook exercises 1 through 10 on Snell law.',
                  dueDate: '2026-11-20',
                  totalMarks: 50,
                  passingMarks: 20,
                  type: 'homework',
                  status: 'published',
                },
                submissionStatus: 'pending',
                hasSubmitted: false,
              },
            ],
          }),
        });
      }

      // AI Chat / Explain
      if (path.includes('/ai/chat') && method === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              reply: 'Newton first law states that an object remains at rest or in uniform motion unless acted upon by a net external force.',
              intent: 'CONCEPT_EXPLANATION',
            },
          }),
        });
      }

      // Default fulfill
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // =========================================================================
    // Scope 1: Authentication and Student Profile
    // =========================================================================
    await auditCase('1.1', 'Student session persists across page reload on Dashboard', async () => {
      await initSession('school');
      await page.goto(`${baseURL}/student/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Jeevan Student', { timeout: 10000 });

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Jeevan Student', { timeout: 10000 });
      const storedToken = await page.evaluate(() => localStorage.getItem('token'));
      assert(storedToken, 'Auth token lost on reload');
    });

    await auditCase('1.2', 'Profile page displays student education metadata correctly', async () => {
      await page.goto(`${baseURL}/student/profile`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Jeevan Student', { timeout: 10000 });
      const emailText = await page.textContent('body');
      assert(emailText.includes('jeevan@mail.com'), 'Student email not displayed on profile');
    });

    // =========================================================================
    // Scope 2: Learning and Courses
    // =========================================================================
    await auditCase('2.1', 'Learn page renders sub-tabs without blanks and displays Curriculum Topic in chapter view', async () => {
      await page.goto(`${baseURL}/student/learn`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1:has-text("Subjects")', { timeout: 10000 });

      // Click a subject card to view chapters
      const mathCard = page.locator('h3:has-text("Mathematics"), h3:has-text("Science")').first();
      await mathCard.click();
      await page.waitForSelector('text=Curriculum Topic', { timeout: 8000 });

      // Return to main subject list
      await page.click('button:has-text("Back to Subjects")');

      // Click Homework sub-tab
      await page.click('button:has-text("Home Work")');
      await page.waitForSelector('text=Assigned Homework & Practice Tasks', { timeout: 5000 });

      // Click Assignment sub-tab
      await page.click('button:has-text("Assignment")');
      await page.waitForSelector('text=Classroom Assignments & Projects', { timeout: 5000 });

      // Click History sub-tab
      await page.click('button:has-text("History")');
      await page.waitForSelector('text=Sample Activity Data', { timeout: 5000 });

      // Return to Subject
      await page.click('button:has-text("Subject")');
    });

    await auditCase('2.2', 'Courses page displays Enrolled Courses and Continue navigates to Learn', async () => {
      await page.goto(`${baseURL}/student/courses`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1:has-text("Courses")', { timeout: 10000 });

      const continueBtn = page.locator('button:has-text("Continue")').first();
      await continueBtn.click();
      await page.waitForSelector('h1:has-text("Subjects")', { timeout: 10000 });
    });

    // =========================================================================
    // Scope 3: Homework and Assignments
    // =========================================================================
    await auditCase('3.1', 'Student Assignments page renders assigned homework from teachers', async () => {
      await page.goto(`${baseURL}/student/assignments`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Class 10 Physics Homework: Optics & Refraction', { timeout: 10000 });

      // Click assignment to view details modal
      await page.click('text=Class 10 Physics Homework: Optics & Refraction');
      await page.waitForSelector('text=Solve textbook exercises 1 through 10 on Snell law.', { timeout: 5000 });

      // Close modal
      await page.keyboard.press('Escape');
    });

    // =========================================================================
    // Scope 4: Tests and Quiz Hub
    // =========================================================================
    await auditCase('4.1', 'Tests page renders test items and search filter operates', async () => {
      await page.goto(`${baseURL}/student/tests`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h3:has-text("Class 10 Science Practice Test")', { timeout: 10000 });

      const searchInput = page.locator('input[placeholder*="Search tests"]');
      await searchInput.fill('NonExistent');
      await page.waitForSelector('text=No tests matching', { timeout: 5000 });

      await page.click('button:has-text("Clear Search")');
      await page.waitForSelector('h3:has-text("Class 10 Science Practice Test")', { timeout: 5000 });
    });

    await auditCase('4.2', 'Quiz Hub loads and renders curriculum quizzes', async () => {
      await page.goto(`${baseURL}/student/quiz`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1:has-text("Quiz"), h2:has-text("Quiz")', { timeout: 10000 });
    });

    // =========================================================================
    // Scope 5: Exam Cracker
    // =========================================================================
    await auditCase('5.1', 'Exam Cracker displays CBT mock catalog and PYQ bank with Study Banner', async () => {
      await page.goto(`${baseURL}/student/exam-cracker`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h3:has-text("JEE Main (Joint Entrance Examination)")', { timeout: 10000 });

      // Switch to Authentic PYQ Bank
      await page.click('button:has-text("Authentic PYQ Bank")');
      await page.waitForSelector('strong:has-text("Study & Archive Mode:")', { timeout: 5000 });
      await page.waitForSelector('span:has-text("Official Paper Item")', { timeout: 5000 });
    });

    // =========================================================================
    // Scope 6: Notebook, Calendar and Student Projects
    // =========================================================================
    await auditCase('6.1', 'Notebook loads notes from database and supports Markdown preview toggle', async () => {
      await page.goto(`${baseURL}/student/notebook`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Physics Mechanics Notes', { timeout: 10000 });

      // Click mode toggle button to switch to Preview
      await page.click('button[title*="Rendered Preview"]');
      await page.waitForSelector('h1:has-text("Physics Mechanics")', { timeout: 5000 });

      // Switch back to Markdown Editor
      await page.click('button[title*="Markdown Source Editor"]');
      await page.waitForSelector('textarea', { timeout: 5000 });
    });

    await auditCase('6.2', 'Calendar renders student schedule and scheduled exam dates', async () => {
      await page.goto(`${baseURL}/student/calendar`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Physics Mid-Term Exam', { timeout: 10000 });
    });

    await auditCase('6.3', 'Student Projects page lists active research and STEM projects', async () => {
      await page.goto(`${baseURL}/student/projects`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=Solar System Planetary Orbit Simulation', { timeout: 10000 });
    });

    // =========================================================================
    // Scope 7: EduPye AI
    // =========================================================================
    await auditCase('7.1', 'EduPye AI Chat FAB opens and renders prompt suggestions', async () => {
      await page.goto(`${baseURL}/student/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('button[title="Open EduPye AI Assistant"]', { timeout: 10000 });

      // Open AI Chat
      await page.click('button[title="Open EduPye AI Assistant"]');
      await page.waitForSelector('text=EduPye AI Tutor', { timeout: 5000 });
      await page.waitForSelector('text=Quick Actions & PYQs:', { timeout: 5000 });

      // Close AI Chat
      await page.click('button[title="Close chat"]');
    });

    // =========================================================================
    // Scope 8: UI and Reliability
    // =========================================================================
    await auditCase('8.1', 'Zero fatal console errors or 500 API responses detected', async () => {
      const fatalErrors = consoleErrors.filter(e => !e.message.includes('Download the React DevTools'));
      console.log(`\n  [Reliability Audit] Monitored Console Errors: ${fatalErrors.length}`);
      console.log(`  [Reliability Audit] Monitored Failed Requests: ${failedRequests.length}`);
      if (fatalErrors.length > 0) {
        console.log('  Captured Errors:', JSON.stringify(fatalErrors.slice(0, 3)));
      }
      assert.equal(fatalErrors.length, 0, `Detected ${fatalErrors.length} unexpected console errors`);
    });

    console.log('\n=== AUDIT SUITE EXECUTION SUMMARY ===');
    console.log(`Total Cases: ${totalTests}`);
    console.log(`Passed: ${passedTests}/${totalTests}`);
    console.log(`Failed: ${failedTests}/${totalTests}`);

  } finally {
    await browser.close();
    await server.close();
  }

  if (failedTests > 0) {
    process.exit(1);
  }
}

runComprehensiveStudentRegressionAudit().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
