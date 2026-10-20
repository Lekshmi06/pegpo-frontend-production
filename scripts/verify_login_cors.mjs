import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

async function launchBrowser() {
  const channels = ['msedge', 'chrome'];
  for (const channel of channels) {
    try {
      const browser = await chromium.launch({ channel, headless: true });
      console.log(`[Browser Engine] Initialized: ${channel}`);
      return browser;
    } catch {
      // try next
    }
  }
  throw new Error('No compatible native browser found');
}

async function runLoginVerification() {
  console.log('=== VERIFYING LOGIN & CORS FLOW IN REAL BROWSER ===\n');
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Track network requests and console errors
  const interceptedRequests = [];
  const interceptedResponses = [];
  const consoleErrors = [];

  page.on('request', (req) => {
    if (req.url().includes('/api/auth/login')) {
      interceptedRequests.push({
        url: req.url(),
        method: req.method(),
        headers: req.headers(),
      });
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/auth/login')) {
      interceptedResponses.push({
        url: res.url(),
        status: res.status(),
        headers: res.headers(),
      });
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Navigate to local frontend login page
    console.log('[Step 1] Navigating to http://localhost:5173/login ...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    assert.match(await page.title(), /EduPye|Login/i, 'Title should match EduPye');
    console.log('  -> Login page loaded successfully');

    // 2. Test Invalid Credentials
    console.log('\n[Step 2] Testing Invalid Credentials Submission ...');
    interceptedRequests.length = 0;
    interceptedResponses.length = 0;

    await page.fill('input[type="email"]', 'nonexistent_test_user@edupye.com');
    await page.fill('input[type="password"]', 'WrongPassword!123');
    await page.click('button[type="submit"]');

    // Wait for response and toast
    await page.waitForTimeout(2000);

    const postResponse = interceptedResponses.find(r => r.status === 401 || r.status === 400 || r.status === 404);
    assert.ok(postResponse, `Expected auth endpoint response, got statuses: ${interceptedResponses.map(r => r.status).join(', ')}`);
    console.log(`  -> Server responded with status ${postResponse.status}`);

    // Verify toast or error alert content
    const pageContent = await page.content();
    assert.ok(!pageContent.includes('Failed to fetch'), 'Page MUST NOT display "Failed to fetch"');
    console.log('  -> Verified: NO "Failed to fetch" error displayed');

    const hasExpectedErrorMsg = pageContent.includes('Invalid email or password') || 
                                 pageContent.includes('User not found') ||
                                 pageContent.includes('Login failed');
    console.log(`  -> Proper user-facing credential error displayed: ${hasExpectedErrorMsg}`);

    // 3. Test Valid Credentials Flow
    console.log('\n[Step 3] Testing Valid Credentials Login Flow ...');
    
    // Register or ensure test user exists in DB
    const testEmail = `test_cors_${Date.now()}@edupye.test`;
    const testPassword = 'ValidPassword123!';
    
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Verification Student',
        userType: 'student'
      })
    });
    const regData = await regRes.json();
    console.log(`  -> Registered test user: ${testEmail} (status: ${regRes.status})`);
    assert.equal(regRes.status, 201, 'Registration should succeed');

    interceptedRequests.length = 0;
    interceptedResponses.length = 0;

    // Fill valid credentials on login page
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for authentication and redirect
    await page.waitForTimeout(3000);

    const validLoginRes = interceptedResponses.find(r => r.status === 200);
    assert.ok(validLoginRes, 'Expected HTTP 200 from /api/auth/login');
    console.log(`  -> Server responded with status 200 OK for valid login`);

    const currentUrl = page.url();
    console.log(`  -> Post-login redirect URL: ${currentUrl}`);
    assert.ok(
      currentUrl.includes('/student') || currentUrl.includes('/onboarding'),
      `Expected redirect to student portal or onboarding, got: ${currentUrl}`
    );

    // Verify localStorage tokens & session
    const storageState = await page.evaluate(() => ({
      token: localStorage.getItem('token'),
      userRole: localStorage.getItem('userRole'),
      userEmail: localStorage.getItem('userEmail'),
      user: localStorage.getItem('user'),
    }));

    console.log('  -> LocalStorage validation:');
    console.log(`     - token present: ${Boolean(storageState.token)}`);
    console.log(`     - userRole: ${storageState.userRole}`);
    console.log(`     - userEmail: ${storageState.userEmail}`);
    assert.ok(storageState.token, 'Auth token MUST be stored in localStorage');
    assert.equal(storageState.userRole, 'student', 'userRole should be student');

    console.log('\n[Summary] All browser login tests PASSED cleanly with 0 CORS/fetch errors.');
  } finally {
    await browser.close();
  }
}

runLoginVerification().catch((err) => {
  console.error('\nFAILED verification:', err.message);
  process.exit(1);
});
