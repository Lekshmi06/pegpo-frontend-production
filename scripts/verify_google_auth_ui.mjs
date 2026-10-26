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
      console.log(`[Browser Engine] Initialized native browser: ${channel}`);
      return { browser, channel };
    } catch {
      // try next
    }
  }
  return { browser: await chromium.launch({ headless: true }), channel: 'bundled' };
}

async function runGoogleAuthUIVerification() {
  console.log('=== STARTING GOOGLE AUTH UI & MOCK MODE E2E VERIFICATION ===\n');

  const PORT = 4194;
  const server = await preview({
    preview: {
      port: PORT,
      strictPort: true,
    },
  });
  const baseURL = `http://localhost:${PORT}`;
  console.log(`[Vite Preview] Production bundle running at: ${baseURL}`);

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
    // Test 1: Login Page Mock Google Button & Modal Trigger
    // -------------------------------------------------------------
    await testStep('Login page displays Mock Google button and opens simulated testing dialog', async () => {
      await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });

      const heading = await page.textContent('h1');
      assert(heading.includes('Sign In to Edupye'), `Unexpected heading: ${heading}`);

      // Locate Mock Google button
      const googleBtn = page.locator('button:has-text("Sign In with Google"), button:has-text("Simulated Test Mode")');
      await googleBtn.waitFor({ state: 'visible', timeout: 5000 });
      assert(await googleBtn.isVisible(), 'Google Sign In button is visible');

      // Verify Test Mode indicator is visible
      const btnText = await googleBtn.textContent();
      assert(btnText.includes('Test Mode'), `Button should indicate Test Mode, got: "${btnText}"`);

      // Click to open mock selector modal
      await googleBtn.click();

      // Check modal appeared
      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      assert(await modal.isVisible(), 'Mock Google account selector modal is visible');

      // Verify explicit testing label
      const modalText = await modal.textContent();
      assert(modalText.includes('Testing Mode — Simulated Google Login'), 'Modal title reflects testing mode');
      assert(modalText.includes('Google has not authenticated you'), 'Modal has prominent non-authentication notice');
      assert(modalText.includes('Alex Mercer'), 'Lists predefined Student test account');
      assert(modalText.includes('Prof. Sarah Jenkins'), 'Lists predefined Teacher test account');
      assert(modalText.includes('Dr. Elena Rostova'), 'Lists predefined Researcher test account');

      // Close modal using cancel button
      const cancelBtn = modal.locator('button:has-text("Cancel")');
      await cancelBtn.click();
      await modal.waitFor({ state: 'hidden', timeout: 3000 });
    });

    // -------------------------------------------------------------
    // Test 2: Standard Login Form Remains Unaffected
    // -------------------------------------------------------------
    await testStep('Standard Email/Password fields on Login page remain fully functional', async () => {
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitBtn = page.locator('button[type="submit"]');

      assert(await emailInput.isVisible(), 'Email input is visible');
      assert(await passwordInput.isVisible(), 'Password input is visible');
      assert(await submitBtn.isVisible(), 'Submit button is visible');

      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      assert((await emailInput.inputValue()) === 'test@example.com', 'Email value updated');
    });

    // -------------------------------------------------------------
    // Test 3: SignUp Page Mock Google Button & Journey Context
    // -------------------------------------------------------------
    await testStep('SignUp page opens simulated testing modal with journey role context', async () => {
      await page.goto(`${baseURL}/signup/register?type=teacher`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });

      // Verify journey badge
      const roleText = await page.textContent('body');
      assert(roleText.includes('Teacher / Faculty'), 'Teacher journey context displayed on SignUp');

      // Locate Google button
      const googleSignUpBtn = page.locator('button:has-text("Sign Up with Google"), button:has-text("Simulated Test Mode")');
      await googleSignUpBtn.waitFor({ state: 'visible', timeout: 5000 });
      assert(await googleSignUpBtn.isVisible(), 'Google Sign Up button is visible');

      // Click to open modal
      await googleSignUpBtn.click();

      const modal = page.locator('[role="dialog"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      assert(await modal.isVisible(), 'Mock modal opened on SignUp');

      // Verify journey context in modal
      const modalText = await modal.textContent();
      assert(modalText.includes('Selected Journey Role:'), 'Modal shows journey role indicator');
      assert(modalText.includes('teacher'), 'Modal shows teacher role');
      assert(modalText.includes('Generate fresh unique ID'), 'Presents first-time onboarding simulation option');

      // Close modal
      const cancelBtn = modal.locator('button:has-text("Cancel")');
      await cancelBtn.click();
    });

    // -------------------------------------------------------------
    // Test 4: Sign Up Email & WhatsApp tabs remain unaffected
    // -------------------------------------------------------------
    await testStep('SignUp page preserves Email and WhatsApp registration modes', async () => {
      const emailTab = page.locator('button:has-text("Email ID")');
      const waTab = page.locator('button:has-text("WhatsApp")');

      assert(await emailTab.isVisible(), 'Email mode tab visible');
      assert(await waTab.isVisible(), 'WhatsApp mode tab visible');

      // Switch to WhatsApp
      await waTab.click();
      const phoneInput = page.locator('input[placeholder*="98765"]');
      assert(await phoneInput.isVisible(), 'WhatsApp phone input visible when tab selected');

      // Switch back to Email
      await emailTab.click();
      const emailInput = page.locator('input[placeholder="name@example.com"]');
      assert(await emailInput.isVisible(), 'Email input visible when tab selected');
    });

    // -------------------------------------------------------------
    // Test 5: Verify GIS script presence in DOM for production readiness
    // -------------------------------------------------------------
    await testStep('Google Identity Services script tag is present for real mode switching', async () => {
      const gsiScript = await page.$('script[src="https://accounts.google.com/gsi/client"]');
      assert(Boolean(gsiScript), 'Google Identity Services script tag exists in DOM');
    });

    console.log(`\n=============================================================`);
    console.log(`GOOGLE AUTH UI & MOCK MODE VERIFICATION COMPLETED`);
    console.log(`Passed: ${passedCount}, Failed: ${failedCount}`);
    console.log(`=============================================================`);

    if (failedCount > 0) {
      process.exit(1);
    }
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

runGoogleAuthUIVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
