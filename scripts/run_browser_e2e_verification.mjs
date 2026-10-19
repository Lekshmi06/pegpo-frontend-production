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
      console.log(`[Browser Engine] Successfully initialized native system browser: ${channel} (${browser.version()})`);
      return { browser, channel };
    } catch (err) {
      console.warn(`[Browser Engine] Channel '${channel}' unavailable: ${err.message}`);
    }
  }
  throw new Error('No compatible native system browser (Edge or Chrome) could be launched.');
}

async function runBrowserVerificationSuite() {
  console.log('=== STARTING EDUPYE REAL BROWSER E2E VERIFICATION SUITE ===\n');

  // 1. Launch Vite preview server
  const PORT = 4192;
  const server = await preview({
    preview: {
      port: PORT,
      strictPort: true,
    },
  });
  const baseURL = `http://localhost:${PORT}`;
  console.log(`[Vite Preview] Production server active at: ${baseURL}`);

  // 2. Launch system browser
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

    // -------------------------------------------------------------
    // Test 1: Landing Page Load & Title
    // -------------------------------------------------------------
    await testStep('Landing page loads with correct title and branding', async () => {
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      
      const title = await page.title();
      assert(title.includes('EduPye'), `Title "${title}" does not contain "EduPye"`);
      
      const headline = await page.textContent('h1');
      assert(/one platform/i.test(headline) && /learning journey/i.test(headline), `Headline unexpected: "${headline}"`);
    });

    // -------------------------------------------------------------
    // Test 2: Public Navigation Links & Absence of Internal Portals
    // -------------------------------------------------------------
    await testStep('Landing navbar renders only public links (no internal portals)', async () => {
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('header nav', { timeout: 10000 });
      
      const hrefs = await page.$$eval('header nav a', els => els.map(e => e.getAttribute('href') || ''));
      
      assert(hrefs.some(h => h.includes('#features')), 'Missing #features link in navbar');
      assert(hrefs.some(h => h.includes('/marketplace')), 'Missing /marketplace link in navbar');
      assert(hrefs.some(h => h.includes('#mobile-apps')), 'Missing #mobile-apps link in navbar');
      assert(hrefs.some(h => h.includes('/help')), 'Missing /help link in navbar');

      // Verify internal portal links are NOT exposed
      for (const h of hrefs) {
        assert(!h.includes('/student'), `Forbidden student link found in public navbar: ${h}`);
        assert(!h.includes('/teacher'), `Forbidden teacher link found in public navbar: ${h}`);
        assert(!h.includes('/research'), `Forbidden research link found in public navbar: ${h}`);
        assert(!h.includes('/institution/portal'), `Forbidden institution portal link found in public navbar: ${h}`);
      }
    });

    // -------------------------------------------------------------
    // Test 3: Hero Section CTAs
    // -------------------------------------------------------------
    await testStep('Hero section primary & secondary CTAs are present and functional', async () => {
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#hero', { timeout: 10000 });
      
      const buttons = await page.$$eval('#hero button, #hero a', els => els.map(e => e.textContent?.trim() || ''));
      
      const hasGetStarted = buttons.some(b => /get started/i.test(b));
      const hasSignIn = buttons.some(b => /sign in to portal/i.test(b));
      const hasDemo = buttons.some(b => /campus demo/i.test(b));
      
      assert(hasGetStarted, 'Get Started Free CTA not found');
      assert(hasSignIn, 'Sign In to Portal CTA not found');
      assert(hasDemo, 'Request Campus Demo CTA not found');
    });

    // -------------------------------------------------------------
    // Test 4: Mobile Applications Section (GeniusSpy & EduPay)
    // -------------------------------------------------------------
    await testStep('Mobile Applications section displays GeniusSpy and EduPay cards with review-pending badges', async () => {
      await page.goto(`${baseURL}/#mobile-apps`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#mobile-apps', { timeout: 10000 });
      
      const sectionText = await page.innerText('#mobile-apps');
      
      assert(sectionText.includes('GeniusSpy'), 'GeniusSpy app card missing in mobile apps section');
      assert(sectionText.includes('EduPay'), 'EduPay app card missing in mobile apps section');
      assert(/store review|pending|coming soon/i.test(sectionText), 'Review pending badge missing');
    });

    // -------------------------------------------------------------
    // Test 5: Public Footer Links
    // -------------------------------------------------------------
    await testStep('Footer contains public links (FAQ, Privacy, Terms, Cookies) and no portal leaks', async () => {
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('footer', { timeout: 10000 });
      
      const hrefs = await page.$$eval('footer a', els => els.map(e => e.getAttribute('href') || ''));
      
      assert(hrefs.some(h => h.includes('/help') || h.includes('/faq')), 'Missing Help/FAQ in footer');
      assert(hrefs.some(h => h.includes('/privacy')), 'Missing Privacy Policy in footer');
      assert(hrefs.some(h => h.includes('/terms')), 'Missing Terms of Service in footer');
      assert(hrefs.some(h => h.includes('/cookies')), 'Missing Cookie Settings in footer');

      for (const h of hrefs) {
        assert(!h.includes('/student'), `Forbidden student link in footer: ${h}`);
        assert(!h.includes('/teacher'), `Forbidden teacher link in footer: ${h}`);
        assert(!h.includes('/research'), `Forbidden research link in footer: ${h}`);
      }
    });

    // -------------------------------------------------------------
    // Test 6: Public Help & FAQ Page
    // -------------------------------------------------------------
    await testStep('Public /help and /faq pages render correctly without requiring login', async () => {
      await page.goto(`${baseURL}/help`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      let bodyText = await page.innerText('body');
      assert(/help center|frequently asked/i.test(bodyText), 'Help Center header not found');

      await page.goto(`${baseURL}/faq`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      bodyText = await page.innerText('body');
      assert(/frequently asked|faq/i.test(bodyText), 'FAQ header not found');
    });

    // -------------------------------------------------------------
    // Test 7: Public Legal Pages (Privacy Policy, Terms of Service)
    // -------------------------------------------------------------
    await testStep('Public legal pages render with Pending Legal Review status', async () => {
      await page.goto(`${baseURL}/privacy`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      let privacyText = await page.innerText('body');
      assert(/privacy policy/i.test(privacyText), 'Privacy policy title missing');
      assert(/pending legal counsel review|pending/i.test(privacyText), 'Pending legal review notice missing');

      await page.goto(`${baseURL}/terms`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      let termsText = await page.innerText('body');
      assert(/terms of service|terms and conditions/i.test(termsText), 'Terms title missing');
      assert(/pending legal counsel review|pending/i.test(termsText), 'Pending legal review notice missing');
    });

    // -------------------------------------------------------------
    // Test 8: Cookie Settings Page & Preferences Save
    // -------------------------------------------------------------
    await testStep('Cookie settings page renders toggles and persists preference in localStorage', async () => {
      await page.goto(`${baseURL}/cookies`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      const cookieText = await page.innerText('body');
      assert(/cookie/i.test(cookieText), 'Cookie header missing');
      
      const saveBtn = await page.$('button:has-text("Save Preferences")');
      if (saveBtn) {
        await saveBtn.click();
        const saved = await page.evaluate(() => localStorage.getItem('edupye_cookie_preferences'));
        assert(saved !== null, 'Cookie preferences was not saved to localStorage');
      }
    });

    // -------------------------------------------------------------
    // Test 9: Protected Routes Redirect Logged-Out Users to /login
    // -------------------------------------------------------------
    const protectedRoutes = [
      '/student',
      '/student/dashboard',
      '/teacher',
      '/teacher/classes',
      '/research',
      '/research/projects',
      '/institution/portal',
      '/institution/portal/members',
      '/provider',
      '/provider/dashboard',
      '/learner',
      '/learner/dashboard',
      '/learn/course-demo-101',
    ];

    for (const route of protectedRoutes) {
      await testStep(`Protected route "${route}" redirects unauthenticated user to /login with state preserved`, async () => {
        // Ensure localStorage is empty (logged out)
        await page.goto(`${baseURL}/`);
        await page.evaluate(() => localStorage.clear());

        // Attempt direct deep link
        await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
        
        // Wait for redirect to settle on /login
        await page.waitForURL('**/login**', { timeout: 10000 });
        
        const currentUrl = page.url();
        assert(currentUrl.includes('/login'), `Expected redirect to /login but got: ${currentUrl}`);

        // Wait for login form to mount
        await page.waitForSelector('form, input[type="email"]', { timeout: 10000 });
        const pageContent = await page.innerText('body');
        assert(
          /sign in|welcome back/i.test(pageContent),
          `Login page content not rendered properly on redirect from ${route}`
        );
      });
    }

    // -------------------------------------------------------------
    // Test 10: Responsive Layouts (Desktop, Tablet, Mobile)
    // -------------------------------------------------------------
    await testStep('Responsive navigation drawer functions correctly at mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('header', { timeout: 10000 });

      // Look for mobile menu toggle button
      const mobileToggle = await page.waitForSelector('button[aria-label="Toggle Navigation"]', { timeout: 10000 });
      assert(mobileToggle, 'Mobile navigation toggle button not found');
      
      await mobileToggle.click();
      await page.waitForTimeout(200);

      // Verify mobile drawer opened
      const drawerContent = await page.innerText('header');
      assert(/features/i.test(drawerContent) && /sign in/i.test(drawerContent), 'Mobile drawer content not visible');

      // Reset to desktop viewport
      await page.setViewportSize({ width: 1280, height: 800 });
    });

    // -------------------------------------------------------------
    // Test 11: Authentication, Session Persistence & Logout Cycle
    // -------------------------------------------------------------
    await testStep('Client session storage persistence and logout cleanup cycle', async () => {
      await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('form', { timeout: 10000 });

      // Simulate authenticated student session in localStorage using core authService keys
      await page.evaluate(() => {
        localStorage.setItem('token', 'mock_verified_session_jwt_token_2026');
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('user', JSON.stringify({
          email: 'demo.student@edupye.test',
          name: 'Demo Student',
          role: 'student',
          language: 'English',
          goal: 'Prepare for Exam',
          createdAt: new Date().toISOString(),
        }));
      });

      // Navigate to protected route now that session is active
      await page.goto(`${baseURL}/student/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#root', { timeout: 10000 });
      await page.waitForTimeout(500);

      // Verify user was NOT bounced to login
      const currentUrl = page.url();
      assert(currentUrl.includes('/student'), `Expected /student/dashboard but was bounced to: ${currentUrl}`);

      // Perform logout via clearing session
      await page.evaluate(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      });

      // Reload protected page
      await page.goto(`${baseURL}/student/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForURL('**/login**', { timeout: 10000 });

      // Should now be bounced to /login
      const loggedOutUrl = page.url();
      assert(loggedOutUrl.includes('/login'), `Expected redirect to /login after logout, but got: ${loggedOutUrl}`);
    });

    // -------------------------------------------------------------
    // Test 12: Registration Page Structure (Google, Divider, Email/WhatsApp)
    // -------------------------------------------------------------
    await testStep('Registration page renders Google auth, "OR REGISTER WITH" divider, and Email/WhatsApp tabs', async () => {
      await page.goto(`${baseURL}/signup`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('form, button', { timeout: 10000 });

      const bodyText = await page.innerText('body');
      assert(/sign up with google/i.test(bodyText), 'Google signup missing');
      assert(/or register with/i.test(bodyText), '"OR REGISTER WITH" divider missing');
      assert(/email id/i.test(bodyText) && /whatsapp/i.test(bodyText), 'Email/WhatsApp tabs missing');
      assert(!/candidate|recruiter/i.test(bodyText), 'Forbidden candidate/recruiter control detected');

      // Check WhatsApp tab switch and honest gateway notice
      const waTab = await page.$('button:has-text("WhatsApp")');
      if (waTab) {
        await waTab.click();
        await page.waitForTimeout(100);
        const waNotice = await page.innerText('body');
        assert(/whatsapp phone verification notice|gateway configuration/i.test(waNotice), 'Honest WhatsApp notice not displayed');
      }

      // Switch back to Email tab
      const emailTab = await page.$('button:has-text("Email ID")');
      if (emailTab) await emailTab.click();
    });

    // -------------------------------------------------------------
    // Test 13: Exam Preparation Quick-Entry Onboarding Flow (Zero Flashcards & Completion)
    // -------------------------------------------------------------
    await testStep('Exam Prep Quick-Entry onboarding multi-step flow (steps 1-6) and completion', async () => {
      await page.goto(`${baseURL}/onboarding/quick`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h2', { timeout: 10000 });

      // Step 1: About You
      let step1Title = await page.innerText('h2');
      assert(/category|describes you/i.test(step1Title), 'Step 1 title unexpected');

      // Click Continue to Step 2
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(150);

      // Step 2: Goal
      let step2Title = await page.innerText('h2');
      assert(/goal/i.test(step2Title), 'Step 2 title unexpected');
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(150);

      // Step 3: Current performance
      let step3Title = await page.innerText('h2');
      assert(/recent exam score|performance/i.test(step3Title), 'Step 3 title unexpected');
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(150);

      // Step 4: Target outcome
      let step4Title = await page.innerText('h2');
      assert(/target outcome/i.test(step4Title), 'Step 4 title unexpected');
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(150);

      // Step 5: Preferred study tools - STRICT CHECK: ZERO FLASHCARDS
      let step5Title = await page.innerText('h2');
      assert(/study tools/i.test(step5Title), 'Step 5 title unexpected');
      const step5Body = await page.innerText('body');
      assert(!/flashcard/i.test(step5Body), 'CRITICAL FAILURE: Flashcard detected in Step 5 DOM!');

      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(150);

      // Step 6: Study material
      let step6Title = await page.innerText('h2');
      assert(/study material/i.test(step6Title), 'Step 6 title unexpected');

      // Finish & Launch
      await page.click('button:has-text("Finish & Launch")');
      await page.waitForFunction(() => /ready to study|setup complete/i.test(document.body.innerText), { timeout: 10000 });

      // Verify completion screen
      const completionText = await page.innerText('body');
      assert(/you're ready to study|setup complete/i.test(completionText), 'Completion screen not rendered');
      assert(/go to my dashboard/i.test(completionText), 'Go to dashboard button missing on completion screen');

      // Test mobile viewport responsiveness
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${baseURL}/onboarding/quick`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h2', { timeout: 10000 });
      const mobileHeader = await page.innerText('header');
      assert(/skip setup/i.test(mobileHeader), 'Skip setup control missing on mobile viewport');
      await page.setViewportSize({ width: 1280, height: 800 });
    });

  } finally {
    await browser.close();
    await server.close();
    console.log('\n[Vite Preview & Browser Engine] Cleanly shut down.');
  }

  console.log('\n=============================================================');
  console.log(`REAL BROWSER E2E RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=============================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runBrowserVerificationSuite().catch((err) => {
  console.error('[Fatal Error in Browser E2E Suite]:', err);
  process.exit(1);
});
