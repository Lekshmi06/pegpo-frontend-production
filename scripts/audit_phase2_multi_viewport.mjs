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

async function runAuditMultiViewport() {
  console.log('======================================================================');
  console.log('  EDUPYE PHASE 2: MULTI-VIEWPORT RESPONSIVE AUDIT & SCREENSHOT SUITE  ');
  console.log('======================================================================\n');

  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const PORT = 4199;
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

  const courseData = {
    _id: 'course-audit-01',
    title: 'Advanced Full-Stack Engineering & Cloud Systems',
    description: 'Master scalable backend architectures, distributed event-driven systems, and production DevOps.',
    shortDescription: 'From microservices to high-scale cloud platforms.',
    category: 'Computer Science',
    level: 'Advanced',
    language: 'English',
    status: 'published',
    price: 300,
    currency: 'USD',
    allowInstalments: true,
    maxInstalments: 3,
    instalmentFrequencyDays: 30,
    totalLessons: 18,
    totalDurationMinutes: 540,
    enrollmentCount: 42,
    averageRating: 5.0,
    reviewCount: 1,
    providerName: 'Dr. Robert Vance, Principal Architect',
    sections: [
      {
        _id: 'sec-1',
        title: 'Phase 1: Architecture & Backend Foundations',
        order: 1,
        requiredInstalmentNumber: 1,
        isLocked: false,
        lessons: [
          { _id: 'les-1', title: '1.1 System Architecture Overview', durationMinutes: 25, contentType: 'video', isPreviewFree: true },
          { _id: 'les-2', title: '1.2 Database Schema Optimization', durationMinutes: 40, contentType: 'video' },
        ],
      },
      {
        _id: 'sec-2',
        title: 'Phase 2: High-Performance Distributed Caching',
        order: 2,
        requiredInstalmentNumber: 2,
        isLocked: true,
        lessons: [
          { _id: 'les-3', title: '2.1 Redis Clustering & Read-Through Patterns', durationMinutes: 45, contentType: 'video' },
        ],
      },
      {
        _id: 'sec-3',
        title: 'Phase 3: Production Kubernetes & Observability',
        order: 3,
        requiredInstalmentNumber: 3,
        isLocked: true,
        lessons: [
          { _id: 'les-4', title: '3.1 Multi-Cluster Deployments & Service Mesh', durationMinutes: 60, contentType: 'video' },
        ],
      },
    ],
  };

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Universal API interceptor
    await page.route('**/*', async (route) => {
      const url = route.request().url();

      if (!url.includes('/api/')) {
        return route.continue();
      }

      if (url.includes('/courses/provider/my-courses')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              courses: [courseData],
              stats: {
                totalCourses: 1,
                publishedCourses: 1,
                totalLearners: 42,
                totalGrossRevenue: 12600,
              },
            },
          }),
        });
      }

      if (url.includes('/payments/provider/financials')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              summary: {
                totalGrossRevenue: 12600,
                totalProviderEarnings: 10080,
                totalPlatformCommission: 2520,
                pendingSettlements: 10080,
                settledEarnings: 0,
                totalTransactions: 3,
                fullPaymentsCount: 1,
                totalInstalmentPaymentsCount: 2,
                activeInstalmentPlansCount: 2,
                revenueShareRule: '80% Course Provider / 20% EduPye Platform',
              },
              transactions: [
                {
                  _id: 'tx-101',
                  transactionId: 'TXN-EDUPYE-9812-A1',
                  gatewayTransactionId: 'TXN-EDUPYE-9812-A1',
                  instalmentNumber: 1,
                  grossAmount: 100,
                  providerShare: 80,
                  platformShare: 20,
                  providerSharePercentage: 80,
                  platformSharePercentage: 20,
                  currency: 'USD',
                  paymentStatus: 'success',
                  settlementStatus: 'pending',
                  gatewayProvider: 'edupye_secure_gateway',
                  course: {
                    _id: 'course-audit-01',
                    title: 'Advanced Full-Stack Engineering & Cloud Systems',
                  },
                  learner: {
                    _id: 'usr-1',
                    name: 'Sarah Jenkins',
                    email: 'sarah@edupye.test',
                  },
                  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                },
              ],
            },
          }),
        });
      }

      if (url.includes('/learner/courses/course-audit-01')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              course: courseData,
              enrollment: {
                status: 'active',
                paymentStatus: 'paid',
                progressPercentage: 33,
                completedLessons: ['les-1'],
                lastAccessedLesson: 'les-1',
              },
              paymentPlan: {
                planType: 'instalment',
                totalAmount: 300,
                paidInstalmentsCount: 1,
                totalInstalmentsCount: 3,
                status: 'active',
                schedule: [
                  { instalmentNumber: 1, amount: 100, status: 'paid', paidAt: new Date().toISOString() },
                  { instalmentNumber: 2, amount: 100, status: 'pending', dueDate: new Date(Date.now() + 86400000 * 30).toISOString() },
                  { instalmentNumber: 3, amount: 100, status: 'pending', dueDate: new Date(Date.now() + 86400000 * 60).toISOString() },
                ],
              },
              certificate: null,
            },
          }),
        });
      }

      if (url.includes('/learner/courses')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [],
          }),
        });
      }

      if (url.includes('/reviews/course-audit-01/eligibility')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              eligible: true,
              hasReviewed: false,
              progressPercentage: 100,
              hasCertificate: true,
              certificate: {
                certificateNumber: 'CERT-2026-8797-FD63A0C7',
                recipientName: 'Alice Graduate',
                courseTitle: 'Advanced Full-Stack Engineering & Cloud Systems',
                issueDate: new Date().toISOString(),
              },
            },
          }),
        });
      }

      if (url.includes('/courses/course-audit-01/certificate')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'cert-01',
              certificateNumber: 'CERT-2026-8797-FD63A0C7',
              course: 'course-audit-01',
              learner: 'usr-alice',
              recipientName: 'Alice Graduate',
              courseTitle: 'Advanced Full-Stack Engineering & Cloud Systems',
              issueDate: new Date().toISOString(),
            },
          }),
        });
      }

      if (url.includes('/reviews/course-audit-01')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              reviews: [
                {
                  _id: 'rev-01',
                  rating: 5,
                  title: 'Excellently structured modular milestones!',
                  comment: 'The instalment unlocking paced our team learning perfectly.',
                  reviewerName: 'Alice Graduate',
                  learnerName: 'Alice Graduate',
                  verifiedGraduate: true,
                  certificateNumber: 'CERT-2026-8797-FD63A0C7',
                  createdAt: new Date().toISOString(),
                },
              ],
              total: 1,
              averageRating: 5.0,
            },
          }),
        });
      }

      if (url.includes('/courses/course-audit-01')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: courseData,
            isOwner: false,
          }),
        });
      }

      return route.continue();
    });

    // -------------------------------------------------------------------------
    // TEST 1: Provider Dashboard across 3 Viewports (1280px, 768px, 375px)
    // -------------------------------------------------------------------------
    await testStep('Provider Dashboard responsive verification (1280px Desktop, 768px Tablet, 375px Mobile)', async () => {
      await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        const providerSession = {
          email: 'dr.vance@edupye.test',
          name: 'Dr. Robert Vance',
          role: 'provider',
          activeRole: 'provider',
          roles: ['teacher', 'provider'],
          language: 'English',
          token: 'mock-provider-jwt',
        };
        localStorage.setItem('user', JSON.stringify(providerSession));
        localStorage.setItem('token', 'mock-provider-jwt');
        localStorage.setItem('userRole', 'provider');
      });

      // 1280px Desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${baseURL}/provider/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const ledgerTab = page.locator('button:has-text("Revenue & Ledger")');
      await ledgerTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, 'phase2-audit-provider-dashboard-desktop.png') });

      // 768px Tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(screenshotsDir, 'phase2-audit-provider-dashboard-tablet.png') });

      // 375px Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(screenshotsDir, 'phase2-audit-provider-dashboard-mobile.png') });
    });

    // -------------------------------------------------------------------------
    // TEST 2: Course Details Responsive across Viewports
    // -------------------------------------------------------------------------
    await testStep('Course Details page responsive verification (1280px & 375px)', async () => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${baseURL}/courses/course-audit-01`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(screenshotsDir, 'phase2-audit-course-details-desktop.png') });

      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(screenshotsDir, 'phase2-audit-course-details-mobile.png') });
    });

    // -------------------------------------------------------------------------
    // TEST 3: Learning Player Locked Milestone View
    // -------------------------------------------------------------------------
    await testStep('Course Learning Player locked milestone & sidebar responsive check', async () => {
      await page.evaluate(() => {
        const learnerSession = {
          email: 'alice.graduate@edupye.test',
          name: 'Alice Graduate',
          role: 'learner',
          activeRole: 'learner',
          roles: ['learner', 'student'],
          language: 'English',
          token: 'mock-learner-jwt',
        };
        localStorage.setItem('user', JSON.stringify(learnerSession));
        localStorage.setItem('token', 'mock-learner-jwt');
        localStorage.setItem('userRole', 'learner');
      });

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${baseURL}/learn/course-audit-01`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Select locked lesson
      const lockedLesson = page.locator('button:has-text("2.1 Redis Clustering & Read-Through Patterns")');
      await lockedLesson.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, 'phase2-audit-learning-player-desktop.png') });
    });

  } finally {
    await browser.close();
    await server.close();
  }

  console.log('\n======================================================================');
  console.log(`  UI AUDIT SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAuditMultiViewport().catch((err) => {
  console.error('[Fatal Audit UI Error]', err);
  process.exit(1);
});

