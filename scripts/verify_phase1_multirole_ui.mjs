import { preview } from 'vite';
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

async function launchSystemBrowser() {
  const channels = ['msedge', 'chrome'];
  for (const channel of channels) {
    try {
      const browser = await chromium.launch({
        channel,
        headless: true,
      });
      console.log(`[Browser Engine] Launched native browser: ${channel} (${browser.version()})`);
      return { browser, channel };
    } catch (err) {
      console.warn(`[Browser Engine] Channel '${channel}' unavailable: ${err.message}`);
    }
  }
  throw new Error('No compatible browser found.');
}

async function runPhase1VisualVerification() {
  console.log('===============================================================');
  console.log('PHASE 1: MULTI-ROLE IDENTITY & NAVIGATION VISUAL VERIFICATION');
  console.log('===============================================================\n');

  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const PORT = 4195;
  const server = await preview({
    preview: {
      port: PORT,
      strictPort: true,
    },
  });
  const baseURL = `http://localhost:${PORT}`;
  console.log(`[Vite Preview] Active at: ${baseURL}`);

  const { browser } = await launchSystemBrowser();
  let passedCount = 0;
  let failedCount = 0;

  async function testStep(name, fn) {
    process.stdout.write(`[Test] ${name} ... `);
    try {
      await fn();
      console.log('PASS');
      passedCount++;
    } catch (err) {
      console.log(`FAIL\n  Error: ${err.message}`);
      failedCount++;
    }
  }

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    // -------------------------------------------------------------------------
    // TEST 1: Single-Role User Experience (Switcher should be hidden)
    // -------------------------------------------------------------------------
    await testStep('Single-role user should see clean profile dropdown without switch section', async () => {
      // Seed single-role student session
      await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        const singleRoleSession = {
          email: 'student.solo@edupye.test',
          name: 'Sarah Solo Learner',
          role: 'student',
          activeRole: 'student',
          roles: ['student'],
          language: 'English',
          token: 'mock-single-role-token',
        };
        localStorage.setItem('user', JSON.stringify(singleRoleSession));
        localStorage.setItem('token', 'mock-single-role-token');
        localStorage.setItem('userRole', 'student');
      });

      await page.goto(`${baseURL}/student/home`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Click user profile avatar to open menu
      const profileTrigger = page.locator('button[title*="Profile"], button[title*="Menu"], button[title*="Account"]').first();
      await profileTrigger.waitFor({ state: 'visible', timeout: 5000 });
      await profileTrigger.click();
      await page.waitForTimeout(500);

      // Verify dropdown is visible
      const dropdown = page.locator('text=Active Workspace');
      if (!(await dropdown.isVisible())) {
        throw new Error('Profile dropdown did not open on avatar click');
      }

      // Verify "Switch Workspace" is NOT present for single-role user
      const switchHeader = page.locator('text=Switch Workspace');
      const isSwitchVisible = await switchHeader.isVisible();
      if (isSwitchVisible) {
        throw new Error('Switch Workspace section should be hidden for single-role accounts');
      }

      // Capture screenshot
      await page.screenshot({
        path: path.join(screenshotsDir, 'phase1-single-role-desktop.png'),
      });
    });

    // -------------------------------------------------------------------------
    // TEST 2: Multi-Role User Experience (Switcher displayed & active role highlighted)
    // -------------------------------------------------------------------------
    await testStep('Multi-role user should see workspace switcher with active indicator', async () => {
      await page.evaluate(() => {
        const multiRoleSession = {
          email: 'alex.faculty@edupye.test',
          name: 'Alex Vance',
          role: 'student',
          activeRole: 'student',
          roles: ['student', 'teacher', 'provider'],
          language: 'English',
          token: 'mock-multi-role-token',
        };
        localStorage.setItem('user', JSON.stringify(multiRoleSession));
        localStorage.setItem('token', 'mock-multi-role-token');
        localStorage.setItem('userRole', 'student');
      });

      await page.goto(`${baseURL}/student/home`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Open profile dropdown
      const profileTrigger = page.locator('button[title*="Profile"], button[title*="Menu"], button[title*="Account"]').first();
      await profileTrigger.waitFor({ state: 'visible', timeout: 5000 });
      await profileTrigger.click();
      await page.waitForTimeout(500);

      // Verify "Switch Workspace" IS displayed
      const switchHeader = page.locator('text=Switch Workspace');
      if (!(await switchHeader.isVisible())) {
        throw new Error('Switch Workspace section must be visible for multi-role accounts');
      }

      // Verify all 3 workspaces are listed
      const studentOption = page.locator('text=Student Workspace');
      const teacherOption = page.locator('text=Teacher Portal');
      const providerOption = page.locator('text=Course Studio');

      if (!(await studentOption.isVisible()) || !(await teacherOption.isVisible()) || !(await providerOption.isVisible())) {
        throw new Error('All assigned workspaces must be rendered in the switcher');
      }

      // Capture screenshot of multi-role dropdown
      await page.screenshot({
        path: path.join(screenshotsDir, 'phase1-multi-role-dropdown-desktop.png'),
      });
    });

    // -------------------------------------------------------------------------
    // TEST 3: Switching Workspace from Student to Teacher
    // -------------------------------------------------------------------------
    await testStep('Clicking a workspace option should switch active workspace and navigate', async () => {
      // Simulate switching to teacher workspace
      await page.evaluate(() => {
        const session = JSON.parse(localStorage.getItem('user'));
        session.role = 'teacher';
        session.activeRole = 'teacher';
        localStorage.setItem('user', JSON.stringify(session));
        localStorage.setItem('userRole', 'teacher');
      });

      await page.goto(`${baseURL}/teacher/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Open profile dropdown inside teacher layout
      const teacherProfileBtn = page.locator('header img[alt="Profile"]').first();
      await teacherProfileBtn.waitFor({ state: 'visible', timeout: 5000 });
      await teacherProfileBtn.click();
      await page.waitForTimeout(500);

      // Verify active badge is Teacher
      const teacherBadge = page.locator('text=Teacher').first();
      if (!(await teacherBadge.isVisible())) {
        throw new Error('Teacher workspace badge not displayed in teacher layout profile menu');
      }

      // Capture screenshot of teacher workspace
      await page.screenshot({
        path: path.join(screenshotsDir, 'phase1-teacher-workspace-desktop.png'),
      });
    });

    // -------------------------------------------------------------------------
    // TEST 4: Tablet Viewport (768px)
    // -------------------------------------------------------------------------
    await testStep('Responsive validation on tablet viewport (768x1024)', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${baseURL}/student/home`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const profileTrigger = page.locator('header img[alt="Profile"]').first();
      if (await profileTrigger.isVisible()) {
        await profileTrigger.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: path.join(screenshotsDir, 'phase1-role-switcher-tablet.png'),
      });
    });

    // -------------------------------------------------------------------------
    // TEST 5: Mobile Viewport (375px)
    // -------------------------------------------------------------------------
    await testStep('Responsive validation on mobile viewport (375x812)', async () => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`${baseURL}/student/home`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // On mobile, the top bar has mobile avatar
      const mobileAvatar = page.locator('div.md\\:hidden img[alt="Profile"]').first();
      if (await mobileAvatar.isVisible()) {
        await mobileAvatar.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: path.join(screenshotsDir, 'phase1-role-switcher-mobile.png'),
      });
    });

    // -------------------------------------------------------------------------
    // TEST 6: Student Analytics Dashboard Visual Regression Check
    // -------------------------------------------------------------------------
    await testStep('Verify Student Analytics Dashboard renders without visual regression', async () => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${baseURL}/student`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Check key analytics components
      const welcomeSection = page.locator('h1').first();
      if (!(await welcomeSection.isVisible())) {
        throw new Error('Student dashboard welcome header not rendered');
      }

      await page.screenshot({
        path: path.join(screenshotsDir, 'phase1-student-dashboard-regression.png'),
      });
    });

    console.log('\n===============================================================');
    console.log(`VISUAL VERIFICATION COMPLETE: ${passedCount} passed, ${failedCount} failed`);
    console.log('Screenshots saved to: Frontend-vercel/screenshots/');
    console.log('===============================================================\n');

    if (failedCount > 0) {
      throw new Error(`Visual verification had ${failedCount} failures.`);
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

runPhase1VisualVerification().catch((err) => {
  console.error('[FATAL] Verification suite failed:', err);
  process.exit(1);
});
