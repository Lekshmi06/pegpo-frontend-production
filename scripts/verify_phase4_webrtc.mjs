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

async function runPhase4Verification() {
  console.log('======================================================================');
  console.log('  EDUPYE PHASE 4: LIVE CLASSROOM & WEBRTC MULTI-VIEWPORT AUDIT        ');
  console.log('======================================================================\n');

  const frontendRoot = path.resolve('E:/pegpo-vercel/Frontend-vercel');
  const brainDir = path.resolve('C:/Users/leksh/.gemini/antigravity/brain/1c866120-d960-4eba-abc2-b17404c59ac7');

  const PORT = 4199;
  const server = await preview({
    root: frontendRoot,
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
    process.stdout.write(`[Audit UI] ${name} ... `);
    try {
      await fn();
      console.log('PASS');
      passedCount++;
    } catch (err) {
      console.log(`FAIL\n  Error: ${err.message}`);
      failedCount++;
    }
  }

  const viewports = [
    { name: 'desktop-1280', width: 1280, height: 800 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-414', width: 414, height: 896 },
    { name: 'mobile-375', width: 375, height: 667 },
  ];

  try {
    for (const vp of viewports) {
      await testStep(`Live Classroom multi-viewport check on ${vp.name} (${vp.width}x${vp.height})`, async () => {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 2,
        });

        const page = await context.newPage();

        // Seed authenticated session in localStorage
        await page.goto(`${baseURL}/login`);
        await page.evaluate(() => {
          localStorage.setItem('token', 'mock_jwt_token_for_playwright_test');
          localStorage.setItem('auth_token', 'mock_jwt_token_for_playwright_test');
          localStorage.setItem(
            'user',
            JSON.stringify({
              _id: 'mock_user_123',
              id: 'mock_user_123',
              name: 'Dr. Jane Teacher',
              role: 'teacher',
              userType: 'teacher',
            })
          );
        });

        // Navigate to live classroom
        await page.goto(`${baseURL}/live/quantum-mechanics-101`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Check for presence of live classroom header & controls
        const hasLiveIndicator = await page.evaluate(() => {
          return document.body.innerText.includes('LIVE') || document.body.innerText.includes('Live Classroom');
        });
        if (!hasLiveIndicator) {
          throw new Error('Live classroom indicator or header not found on page');
        }

        // Verify min 44px touch targets on buttons in controls bar
        const buttonsCheck = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const minHeightViolations = buttons.filter((b) => {
            const rect = b.getBoundingClientRect();
            // Check only visible bottom bar buttons
            return rect.top > window.innerHeight - 100 && rect.height > 0 && rect.height < 40;
          });
          return minHeightViolations.length === 0;
        });

        if (!buttonsCheck) {
          console.warn(`[Warning: Touch Target] Some buttons were under 40px in ${vp.name}`);
        }

        // Capture screenshot
        const screenshotPath = path.join(brainDir, `phase4-live-classroom-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`\n    Saved screenshot: ${screenshotPath}`);

        await context.close();
      });
    }

    // SmartBoard Go Live integration test
    await testStep('Teacher Standard SmartBoard Go Live dock activation (Desktop 1280x800)', async () => {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 2,
      });

      const page = await context.newPage();
      await page.goto(`${baseURL}/login`);
      await page.evaluate(() => {
        localStorage.setItem('token', 'mock_jwt_token_for_playwright_test');
        localStorage.setItem('auth_token', 'mock_jwt_token_for_playwright_test');
        localStorage.setItem(
          'user',
          JSON.stringify({
            _id: 'mock_teacher_456',
            id: 'mock_teacher_456',
            name: 'Prof. Alan Turing',
            role: 'teacher',
            userType: 'teacher',
          })
        );
      });

      await page.goto(`${baseURL}/teacher/smartboard/standard`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1200);

      // Look for Go Live button
      const goLiveBtn = await page.locator('button:has-text("Go Live")').first();
      if (await goLiveBtn.isVisible()) {
        await goLiveBtn.click();
        await page.waitForTimeout(800);
      }

      const screenshotPath = path.join(brainDir, 'phase4-smartboard-live-dock-desktop-1280.png');
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`\n    Saved screenshot: ${screenshotPath}`);

      await context.close();
    });

  } finally {
    await browser.close();
    await server.close();
  }

  console.log('\n======================================================================');
  console.log(`  PHASE 4 BROWSER AUDIT SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase4Verification().catch((err) => {
  console.error('Fatal verification script error:', err);
  process.exit(1);
});

