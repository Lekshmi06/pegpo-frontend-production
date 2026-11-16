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

async function runRemediationVerificationSuite() {
  console.log('=== VERIFYING REMEDIATION OF P1, P2 & P3 STUDENT MODULE FINDINGS ===\n');

  const PORT = 4197;
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
  let passedCount = 0;
  let failedCount = 0;

  async function testScenario(id, description, fn) {
    process.stdout.write(`[Scenario ${id}] ${description} ... `);
    try {
      await fn();
      console.log('PASS');
      passedCount++;
    } catch (err) {
      console.log(`FAIL\n  --> Error: ${err.message}`);
      failedCount++;
    }
  }

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    async function initStudentSession() {
      const token = 'mock_student_remediation_token';
      const user = {
        id: '6aa29a1fe8bf422fe51b52c4',
        name: 'Alex Johnson',
        role: 'student',
        email: 'alex.student@edupye.test',
      };
      const profile = {
        _id: 'prof_remediation_123',
        userId: '6aa29a1fe8bf422fe51b52c4',
        name: 'Alex Johnson',
        learningPath: 'school',
        education: {
          level: 'school',
          board: 'CBSE',
          classLevel: 'Class 10',
          stream: 'Science',
        },
      };

      await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(({ token, user, profile }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('studentProfile', JSON.stringify(profile));
        localStorage.setItem('studentProfileId', profile._id);
        localStorage.setItem('edupye_workspace_notes', JSON.stringify([{
          _id: 'note_1',
          title: 'Physics Mechanics Notes',
          content: 'Initial physics study notes.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]));
      }, { token, user, profile });
    }

    await initStudentSession();

    // 1. Verify 3D Lab Route (P1.1 / Finding 22)
    await testScenario('P1.1', '3D Lab route loads dedicated unavailable/STEM page without redirecting to root', async () => {
      await page.goto(`${baseURL}/student/3d-lab`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text=3D Science & STEM Lab', { timeout: 8000 });
      const currentUrl = page.url();
      assert(currentUrl.includes('/student/3d-lab'), `Expected /student/3d-lab, got ${currentUrl}`);
      const pageText = await page.textContent('body');
      assert(pageText.includes('molecular structures, physics sandboxes'), 'Missing 3D lab STEM description');
    });

    // 2. Verify Games Sub-Tab Routing (P1.3 / Finding 6)
    await testScenario('P1.3', 'Clicking Games in Practice sub-sidebar loads Edu-Games view in Learn', async () => {
      await page.goto(`${baseURL}/student/practice`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1:has-text("Practice Mode")', { timeout: 8000 });

      // Click "Games" sub-tab in sub-sidebar
      const gamesButton = page.locator('aside button:has-text("Games")').first();
      await gamesButton.click();

      await page.waitForSelector('text=Interactive Edu-Games & STEM Simulations', { timeout: 8000 });
      const currentUrl = page.url();
      assert(currentUrl.includes('/student/learn?tab=Game'), `Expected /student/learn?tab=Game, got ${currentUrl}`);
    });

    // 3. Verify Keyboard Navigation in Flashcards (P2.4 / Finding 1)
    await testScenario('P2.4', 'Flashcard deck navigates with ArrowLeft, ArrowRight, and Space keys', async () => {
      await page.goto(`${baseURL}/student/practice`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1:has-text("Practice Mode")', { timeout: 8000 });

      // Select Revision mode tab
      await page.click('button:has-text("Revision")');
      await page.waitForSelector('text=Mastery Progress:', { timeout: 8000 });

      // Verify hint is rendered
      await page.waitForSelector('text=to navigate', { timeout: 5000 });
      await page.waitForSelector('text=Card 1 of', { timeout: 5000 });

      // Press ArrowRight to go to next card
      await page.keyboard.press('ArrowRight');
      await page.waitForSelector('text=Card 2 of', { timeout: 5000 });

      // Press Space to flip card
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);

      // Press ArrowLeft to return to previous card
      await page.keyboard.press('ArrowLeft');
      await page.waitForSelector('text=Card 1 of', { timeout: 5000 });
    });

    // 4. Verify Notebook Link Modal Focus & Insertion (P2.5 / Finding 9)
    await testScenario('P2.5', 'Notebook Link Modal switches to Editor, autofocuses, and inserts hyperlink', async () => {
      await page.goto(`${baseURL}/student/notebook`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('textarea', { timeout: 8000 });

      // Switch to Rendered Preview mode first
      await page.click('button[title*="Rendered Preview"]');
      await page.waitForSelector('button[title*="Markdown Source Editor"]', { timeout: 5000 });

      // Click "Insert Link" toolbar button while in Preview mode
      await page.click('button[title*="Insert Link"]');
      await page.waitForSelector('text=Insert Hyperlink', { timeout: 5000 });

      // Fill in URL input and press Enter
      const urlInput = page.locator('input[placeholder="https://example.com"]');
      await urlInput.fill('https://khanacademy.org/physics');
      await page.keyboard.press('Enter');

      // Verify modal closed and editor mode was restored with inserted link markdown
      await page.waitForSelector('textarea', { timeout: 5000 });
      const content = await page.inputValue('textarea');
      assert(content.includes('[Resource Link](https://khanacademy.org/physics)'), 'Link markdown not inserted into textarea');
    });

    // 5. Verify Workspace Placeholder Toasts & Honest Templates (P2.6 / Findings 10, 21, 30)
    await testScenario('P2.6', 'Notebook & Projects replace false AI toasts and workspace launch messages with honest previews', async () => {
      // In Notebook (already open): Click a right sidebar create action (e.g. Mind Map)
      const mindMapBtn = page.locator('aside button:has-text("Mind Map")').first();
      await mindMapBtn.click();
      await page.waitForSelector('text=Insert Mind Map Template', { timeout: 5000 });

      // Click insert template button
      await page.click('button:has-text("Insert Mind Map Template")');
      await page.waitForTimeout(300);
      const noteContent = await page.inputValue('textarea');
      assert(noteContent.includes('### [Study Notes: Mind Map]'), 'Structured template not inserted');

      // In Notebook: Click a graphic card (e.g. Smart Bord)
      const graphicCard = page.locator('aside img[alt*="Smart Bord"], aside span:has-text("Smart Bord")').first();
      await graphicCard.click();
      await page.waitForSelector('text=Interactive workspace integration for Smart Bord /Projects is currently under development.', { timeout: 5000 });
      await page.waitForSelector('button:has-text("Close Preview")', { timeout: 5000 });
      await page.click('button:has-text("Close Preview")');
    });

    // 6. Verify Quick Actions Horizontal Scroll Controls (P3.7 / Finding 27)
    await testScenario('P3.7', 'EduPye AI Chat popup provides horizontal chevron scroll controls for Quick Actions', async () => {
      await page.goto(`${baseURL}/student/courses`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('button[title="Open EduPye AI Assistant"]', { timeout: 8000 });

      // Open AI Chat
      const chatLauncher = page.locator('button[title="Open EduPye AI Assistant"]');
      await chatLauncher.click();
      await page.waitForSelector('text=Quick Actions & PYQs:', { timeout: 8000 });

      // Verify Left and Right chevron buttons exist
      const leftBtn = page.locator('button[title="Scroll suggestions left"]');
      const rightBtn = page.locator('button[title="Scroll suggestions right"]');
      await leftBtn.waitFor({ state: 'visible', timeout: 8000 });
      await rightBtn.waitFor({ state: 'visible', timeout: 8000 });

      // Click right chevron
      await rightBtn.click({ force: true });
      await page.waitForTimeout(300);
    });

    // 7. Verify AI Floating Button Clearance (P1.2 / Finding 31)
    await testScenario('P1.2', 'Scrollable containers and right sidebars have bottom clearance to avoid FAB overlap', async () => {
      await page.goto(`${baseURL}/student/courses`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1:has-text("Courses")', { timeout: 8000 });

      const rightAside = await page.$('aside.pb-24');
      assert(rightAside, 'Right aside must have pb-24 class for floating FAB clearance');

      const mainContent = await page.$('.pb-24');
      assert(mainContent, 'Main content scroll container must have pb-24 padding');
    });

    console.log('\n=== REMEDIATION SUITE SUMMARY ===');
    console.log(`Total Scenarios: ${passedCount + failedCount}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${failedCount}`);

    assert.equal(failedCount, 0, `Expected 0 failed scenarios, but ${failedCount} failed`);

  } finally {
    await browser.close();
    await server.close();
  }
}

runRemediationVerificationSuite().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
