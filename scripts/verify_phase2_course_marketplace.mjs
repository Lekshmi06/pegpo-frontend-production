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

async function runPhase2VisualVerification() {
  console.log('======================================================================');
  console.log('PHASE 2: COURSE MARKETPLACE ENHANCEMENT BROWSER VERIFICATION');
  console.log('======================================================================\n');

  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const PORT = 4198;
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

  const courseData = {
    _id: 'course-p2-01',
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

  let mockGraduateCompleted = false;

  try {
    const context = await browser.newContext({
      viewport: { width: 1366, height: 900 },
    });
    const page = await context.newPage();

    // Intercept only API requests (protecting HTML/JS static bundle requests)
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

      if (url.includes('/payments/provider/financials') || url.includes('/courses/provider/financials')) {
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
                    _id: 'course-p2-01',
                    title: 'Advanced Full-Stack Engineering & Cloud Systems',
                  },
                  learner: {
                    _id: 'usr-1',
                    name: 'Sarah Jenkins',
                    email: 'sarah@edupye.test',
                  },
                  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                },
                {
                  _id: 'tx-102',
                  transactionId: 'TXN-EDUPYE-9812-A2',
                  gatewayTransactionId: 'TXN-EDUPYE-9812-A2',
                  instalmentNumber: 2,
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
                    _id: 'course-p2-01',
                    title: 'Advanced Full-Stack Engineering & Cloud Systems',
                  },
                  learner: {
                    _id: 'usr-1',
                    name: 'Sarah Jenkins',
                    email: 'sarah@edupye.test',
                  },
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                  _id: 'tx-103',
                  transactionId: 'TXN-EDUPYE-8411-B1',
                  gatewayTransactionId: 'TXN-EDUPYE-8411-B1',
                  instalmentNumber: 0,
                  grossAmount: 300,
                  providerShare: 240,
                  platformShare: 60,
                  providerSharePercentage: 80,
                  platformSharePercentage: 20,
                  currency: 'USD',
                  paymentStatus: 'success',
                  settlementStatus: 'pending',
                  gatewayProvider: 'edupye_secure_gateway',
                  course: {
                    _id: 'course-p2-01',
                    title: 'Advanced Full-Stack Engineering & Cloud Systems',
                  },
                  learner: {
                    _id: 'usr-2',
                    name: 'Michael Chang',
                    email: 'michael@edupye.test',
                  },
                  createdAt: new Date(Date.now() - 1800000).toISOString(),
                },
              ],
            },
          }),
        });
      }

      if (url.includes('/learner/courses/course-p2-01')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              course: courseData,
              enrollment: {
                status: mockGraduateCompleted ? 'completed' : 'active',
                paymentStatus: 'paid',
                progressPercentage: mockGraduateCompleted ? 100 : 33,
                completedLessons: mockGraduateCompleted ? ['les-1', 'les-2', 'les-3', 'les-4'] : ['les-1'],
                lastAccessedLesson: 'les-1',
              },
              paymentPlan: {
                planType: 'instalment',
                totalAmount: 300,
                paidInstalmentsCount: mockGraduateCompleted ? 3 : 1,
                totalInstalmentsCount: 3,
                status: mockGraduateCompleted ? 'completed' : 'active',
                schedule: [
                  { instalmentNumber: 1, amount: 100, status: 'paid', paidAt: new Date().toISOString() },
                  { instalmentNumber: 2, amount: 100, status: mockGraduateCompleted ? 'paid' : 'pending', dueDate: new Date(Date.now() + 86400000 * 30).toISOString() },
                  { instalmentNumber: 3, amount: 100, status: mockGraduateCompleted ? 'paid' : 'pending', dueDate: new Date(Date.now() + 86400000 * 60).toISOString() },
                ],
              },
              certificate: mockGraduateCompleted
                ? {
                    certificateNumber: 'CERT-2026-8797-FD63A0C7',
                    recipientName: 'Alice Graduate',
                    courseTitle: 'Advanced Full-Stack Engineering & Cloud Systems',
                    issueDate: new Date().toISOString(),
                  }
                : null,
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

      if (url.includes('/reviews/course-p2-01/eligibility')) {
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

      if (url.includes('/courses/course-p2-01/certificate') || url.includes('/reviews/course-p2-01/certificate')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'cert-01',
              certificateNumber: 'CERT-2026-8797-FD63A0C7',
              course: 'course-p2-01',
              learner: 'usr-alice',
              recipientName: 'Alice Graduate',
              courseTitle: 'Advanced Full-Stack Engineering & Cloud Systems',
              issueDate: new Date().toISOString(),
            },
          }),
        });
      }

      if (url.includes('/reviews/course-p2-01')) {
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
                  comment: 'The instalment unlocking paced our team learning perfectly. Every section delivered immense production value.',
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

      if (url.includes('/courses/course-p2-01')) {
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
    // TEST 1: Provider Dashboard - Courses & Financials Tabs with 80:20 Split
    // -------------------------------------------------------------------------
    await testStep('Provider Dashboard renders 80:20 revenue split cards and transaction history ledger', async () => {
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

      await page.goto(`${baseURL}/provider/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Verify Provider Studio header
      await page.waitForSelector('text=Provider Studio');

      // Click on Revenue & Ledger Tab
      const ledgerTab = page.locator('button:has-text("Revenue & Ledger")');
      await ledgerTab.waitFor({ state: 'visible', timeout: 5000 });
      await ledgerTab.click();
      await page.waitForTimeout(800);

      // Verify 80:20 breakdown cards
      const grossCard = page.locator('text=Gross Course Revenue');
      const providerEarnings = page.locator('text=Provider Earnings (80%)').first();
      const platformShare = page.locator('text=Platform Commission (20%)');

      if (!(await grossCard.isVisible()) || !(await providerEarnings.isVisible()) || !(await platformShare.isVisible())) {
        throw new Error('80:20 revenue breakdown cards not visible in Provider Financials tab');
      }

      // Verify Transaction Ledger table has transactions
      const txRow = page.locator('text=TXN-EDUPYE-9812-A1');
      await txRow.waitFor({ state: 'visible', timeout: 5000 });

      // Capture screenshot
      const p1Path = path.join(screenshotsDir, 'phase2-provider-financials-ledger.png');
      await page.screenshot({ path: p1Path });
    });

    // -------------------------------------------------------------------------
    // TEST 2: Course Details Page - Instalment Pricing & Verified Graduate Reviews
    // -------------------------------------------------------------------------
    await testStep('Course Details displays instalment options, milestone badges, and verified reviews', async () => {
      // Ensure authenticated student/learner session exists
      await page.evaluate(() => {
        const studentSession = {
          email: 'sarah.student@edupye.test',
          name: 'Sarah Student',
          role: 'student',
          activeRole: 'student',
          roles: ['student', 'learner'],
          language: 'English',
          token: 'mock-student-jwt',
        };
        localStorage.setItem('user', JSON.stringify(studentSession));
        localStorage.setItem('token', 'mock-student-jwt');
        localStorage.setItem('userRole', 'student');
      });

      await page.goto(`${baseURL}/courses/course-p2-01`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);

      // Verify title and pricing
      await page.waitForSelector('text=Advanced Full-Stack Engineering & Cloud Systems');
      await page.waitForSelector('text=$100.00/mo (3x instalments)');

      // Verify Milestone tags on curriculum
      const milestoneTag = page.locator('text=Milestone #2').first();
      await milestoneTag.waitFor({ state: 'visible', timeout: 5000 });

      // Verify verified review with certificate badge
      const verifiedBadge = page.locator('text=Graduate').first();
      await verifiedBadge.waitFor({ state: 'visible', timeout: 5000 });

      // Click "Choose Payment Plan ($300)" to open the Payment Plan Selection Modal
      const enrollBtn = page.locator('button:has-text("Choose Payment Plan")').first();
      await enrollBtn.click();
      await page.waitForTimeout(600);

      // Verify modal opened with Full and Instalment choices
      const modalHeader = page.locator('text=Select Your Enrollment Payment Plan');
      if (!(await modalHeader.isVisible())) {
        throw new Error('Payment plan selection modal did not open');
      }

      // Capture screenshot
      const p2Path = path.join(screenshotsDir, 'phase2-course-details-instalments.png');
      await page.screenshot({ path: p2Path });

      // Close modal
      const closeBtn = page.locator('button:has-text("Cancel")');
      await closeBtn.click();
      await page.waitForTimeout(300);
    });

    // -------------------------------------------------------------------------
    // TEST 3: Course Learning Player - Progressive Access Locking
    // -------------------------------------------------------------------------
    await testStep('Course Learning Player renders locked milestone screen with pay next instalment trigger', async () => {
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

      await page.goto(`${baseURL}/learn/course-p2-01`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);

      // Verify learning player loaded
      await page.waitForSelector('text=Advanced Full-Stack Engineering & Cloud Systems');

      // Click on locked Section 2 / Lesson 3 in sidebar
      const lockedLesson = page.locator('button:has-text("2.1 Redis Clustering & Read-Through Patterns")');
      await lockedLesson.waitFor({ state: 'visible', timeout: 5000 });
      await lockedLesson.click();
      await page.waitForTimeout(800);

      // Verify locked milestone banner and action button
      const lockedBanner = page.locator('text=Milestone Content Locked');
      const payNextBtn = page.locator('button:has-text("Pay Next Instalment")');

      if (!(await lockedBanner.isVisible()) || !(await payNextBtn.isVisible())) {
        throw new Error('Locked milestone gate with pay next instalment trigger not displayed');
      }

      // Capture screenshot
      const p3Path = path.join(screenshotsDir, 'phase2-learning-player-locked-milestone.png');
      await page.screenshot({ path: p3Path });
    });

    // -------------------------------------------------------------------------
    // TEST 4: Certificate Modal & Graduate Review Eligibility
    // -------------------------------------------------------------------------
    await testStep('Graduate Learner can view Certificate with verified credentials', async () => {
      // Toggle graduate completed state
      mockGraduateCompleted = true;

      await page.goto(`${baseURL}/learn/course-p2-01`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);

      // Verify "View Certificate" button is visible
      const certBtn = page.locator('button:has-text("View Certificate")');
      await certBtn.waitFor({ state: 'visible', timeout: 5000 });
      await certBtn.click();
      await page.waitForTimeout(600);

      // Verify certificate modal content
      await page.waitForSelector('text=Official Certificate of Completion');
      await page.waitForSelector('text=CERT-2026-8797-FD63A0C7');

      // Capture screenshot
      const p4Path = path.join(screenshotsDir, 'phase2-certificate-verification-modal.png');
      await page.screenshot({ path: p4Path });
    });

  } finally {
    await browser.close();
    await server.close();
  }

  console.log('\n======================================================================');
  console.log(`PHASE 2 BROWSER VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase2VisualVerification().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
