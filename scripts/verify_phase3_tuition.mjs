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

async function runPhase3VisualVerification() {
  console.log('======================================================================');
  console.log('  EDUPYE PHASE 3: TUITION MULTI-VIEWPORT RESPONSIVE VISUAL AUDIT     ');
  console.log('======================================================================\n');

  const frontendRoot = path.resolve('E:/pegpo-vercel/Frontend-vercel');
  const screenshotsDir = path.join(frontendRoot, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const PORT = 4198;
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

  // Mock API fixtures for browser visual verification
  const mockProviders = [
    {
      _id: 'prof-01',
      userId: 'user-01',
      fullName: 'Dr. Ananya Sharma',
      headline: 'Senior Physics Educator & Olympiad Mentor',
      bio: 'Over 12 years of coaching students for CBSE Class 11-12 and JEE Physics.',
      experienceYears: 12,
      subjects: ['Physics', 'Mechanics', 'Optics'],
      classesTaught: ['Class 11', 'Class 12', 'JEE Prep'],
      teachingMode: ['online', 'hybrid'],
      platformTier: 'platinum',
      verificationStatus: 'verified',
      rating: { average: 5.0, count: 24 },
      badges: [
        { code: 'verified_educator', name: 'Verified Educator', description: 'Identity, academic degrees, and credentials officially verified by EduPye Compliance', icon: 'ShieldCheck', awardedAt: '2026-11-10T10:00:00.000Z' },
        { code: 'experienced_tutor', name: 'Master Tutor', description: 'Over 5 years of verified professional teaching experience', icon: 'GraduationCap', awardedAt: '2026-11-10T10:00:00.000Z' },
        { code: 'top_rated', name: 'Top Rated Tutor', description: 'Maintains an average student rating of 4.8 or higher with at least 5 reviews', icon: 'Star', awardedAt: '2026-11-10T10:00:00.000Z' },
        { code: 'student_favourite', name: 'Student Favourite', description: 'Consistently receives outstanding feedback and high repeat enrolments', icon: 'Award', awardedAt: '2026-11-10T10:00:00.000Z' },
      ],
      pricing: { minHourlyRate: 750, maxHourlyRate: 1500, currency: 'INR' },
      education: [
        { degree: 'M.Sc. Physics', institution: 'IIT Madras', yearOfPassing: 2012 },
        { degree: 'Ph.D. Applied Physics', institution: 'IISc Bangalore', yearOfPassing: 2016 },
      ],
      offerings: [
        {
          _id: 'off-01',
          title: 'Class 12 CBSE & JEE Physics Masterclass',
          subject: 'Physics',
          classLevel: 'Class 12',
          description: 'Comprehensive coverage of Electrodynamics, Optics, and Modern Physics.',
          teachingMode: 'online',
          classFormat: 'group',
          scheduleModel: 'fixed_batch',
          maxCapacity: 15,
          feeAmount: 3500,
          billingUnit: 'monthly',
          currency: 'INR',
          availableDays: ['Monday', 'Wednesday', 'Friday'],
        },
      ],
    },
    {
      _id: 'prof-02',
      userId: 'user-02',
      fullName: 'Prof. Rajesh Nair',
      headline: 'Mathematics Specialist & Calculus Coach',
      bio: 'Specializing in Differential Calculus and Linear Algebra for competitive aspirants.',
      experienceYears: 15,
      subjects: ['Mathematics', 'Calculus', 'Algebra'],
      classesTaught: ['Class 11', 'Class 12'],
      teachingMode: ['online'],
      platformTier: 'diamond',
      verificationStatus: 'verified',
      rating: { average: 4.9, count: 38 },
      pricing: { minHourlyRate: 900, maxHourlyRate: 2000, currency: 'INR' },
      offerings: [],
    },
  ];

  const mockOverview = {
    profile: mockProviders[0],
    activeOfferingsCount: 3,
    activeBatchesCount: 4,
    activeEnrolledCount: 18,
    pendingRequestsCount: 2,
    upcomingSessions: [
      {
        _id: 'ses-01',
        title: 'Wave Optics & Interference',
        sessionDate: new Date().toISOString(),
        startTime: '18:00',
        endTime: '19:30',
        status: 'live',
        meetingLink: '/teacher/smartboard/integrated?session=ses-01',
      },
      {
        _id: 'ses-02',
        title: 'Electromagnetic Induction',
        sessionDate: new Date(Date.now() + 86400000).toISOString(),
        startTime: '18:00',
        endTime: '19:30',
        status: 'scheduled',
      },
    ],
    financialSummary: {
      totalGrossEarnings: 63000,
      transactionsCount: 18,
      currency: 'INR',
    },
  };

  const mockStudentOverview = {
    activeEnrollmentsCount: 2,
    attendanceRate: 96,
    activeEnrollments: [
      {
        _id: 'enr-01',
        subject: 'Physics',
        classLevel: 'Class 12',
        classFormat: 'group',
        teachingMode: 'online',
        scheduleModel: 'fixed_batch',
        scheduleDetails: {
          daysOfWeek: ['Mon', 'Wed', 'Fri'],
          startTime: '18:00',
          endTime: '19:30',
        },
        status: 'active',
        feePaid: 3500,
        currency: 'INR',
        sessionsAttended: 14,
        totalSessionsConducted: 15,
        providerId: { name: 'Dr. Ananya Sharma' },
        offeringId: { title: 'Class 12 CBSE & JEE Physics Masterclass' },
      },
    ],
    upcomingSessions: [
      {
        _id: 'ses-01',
        title: 'Wave Optics & Interference',
        sessionDate: new Date().toISOString(),
        startTime: '18:00',
        endTime: '19:30',
        status: 'live',
        meetingLink: '/teacher/smartboard/integrated?session=ses-01',
      },
    ],
    recentRequests: [],
  };

  const mockBatches = [
    {
      _id: 'b-01',
      offeringId: 'off-01',
      title: 'Weekday Evening Cohort A',
      daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
      startTime: '18:00',
      endTime: '19:30',
      maxCapacity: 15,
      enrolledCount: 12,
      status: 'active',
    },
  ];

  const mockReviews = [
    {
      _id: 'rev-01',
      studentId: { name: 'Rohan Patel' },
      subject: 'Physics',
      rating: 5,
      reviewText: 'Dr. Sharma explains complex rotational mechanics principles with crystal clarity.',
      status: 'published',
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    // 1. Desktop (1440px) - Tuition Marketplace
    await testStep('Tuition Marketplace (1440px Desktop)', async () => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.route('**/api/tuition/marketplace/offerings*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            offerings: [
              {
                ...mockProviders[0].offerings[0],
                provider: mockProviders[0],
                batches: mockBatches,
              },
            ],
            pagination: { total: 1, page: 1, limit: 24, totalPages: 1 },
          }),
        });
      });
      await page.route('**/api/tuition/marketplace*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, providers: mockProviders, pagination: { total: 2, page: 1, limit: 20, totalPages: 1 } }),
        });
      });

      await page.goto(`${baseURL}/tuition`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-marketplace-desktop-1440.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 2. Mobile (375px) - Tuition Marketplace
    await testStep('Tuition Marketplace (375px Mobile)', async () => {
      const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
      await page.route('**/api/tuition/marketplace/offerings*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            offerings: [
              {
                ...mockProviders[0].offerings[0],
                provider: mockProviders[0],
                batches: mockBatches,
              },
            ],
            pagination: { total: 1, page: 1, limit: 24, totalPages: 1 },
          }),
        });
      });
      await page.route('**/api/tuition/marketplace*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, providers: mockProviders, pagination: { total: 2, page: 1, limit: 20, totalPages: 1 } }),
        });
      });

      await page.goto(`${baseURL}/tuition`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-marketplace-mobile-375.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 3. Desktop (1280px) - Provider Public Profile with Offerings & Batches
    await testStep('Provider Public Profile (1280px Desktop)', async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.route('**/api/tuition/marketplace/providers/prof-01', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            profile: mockProviders[0],
            offerings: mockProviders[0].offerings,
            batches: mockBatches,
            reviews: mockReviews,
          }),
        });
      });

      await page.goto(`${baseURL}/tuition/provider/prof-01`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-provider-public-profile-desktop-1280.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 4. Mobile (414px) - Provider Public Profile
    await testStep('Provider Public Profile (414px Mobile)', async () => {
      const page = await browser.newPage({ viewport: { width: 414, height: 896 } });
      await page.route('**/api/tuition/marketplace/providers/prof-01', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            profile: mockProviders[0],
            offerings: mockProviders[0].offerings,
            batches: mockBatches,
            reviews: mockReviews,
          }),
        });
      });

      await page.goto(`${baseURL}/tuition/provider/prof-01`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-provider-public-profile-mobile-414.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 5. Desktop (1280px) - Tuition Student Dashboard
    await testStep('Tuition Student Dashboard (1280px Desktop)', async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-student',
          name: 'Rohan Patel',
          email: 'rohan.patel@edupye.test',
          role: 'student',
          roles: ['student'],
          activeRole: 'student',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/student/overview', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, overview: mockStudentOverview }) });
      });
      await page.route('**/api/tuition/student/enrollments', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, enrollments: mockStudentOverview.activeEnrollments }) });
      });
      await page.route('**/api/tuition/student/requests', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, requests: [] }) });
      });
      await page.route('**/api/tuition/student/schedule*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, sessions: mockStudentOverview.upcomingSessions }) });
      });
      await page.route('**/api/tuition/student/materials*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, materials: [] }) });
      });
      await page.route('**/api/tuition/student/assessments*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, assessments: [] }) });
      });
      await page.route('**/api/tuition/student/payments', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, transactions: [] }) });
      });

      await page.goto(`${baseURL}/student/tuition`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      const outPath = path.join(screenshotsDir, 'phase3-student-tuition-dashboard-desktop-1280.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 6. Tablet (768px) - Tuition Student Dashboard
    await testStep('Tuition Student Dashboard (768px Tablet)', async () => {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-student',
          name: 'Rohan Patel',
          email: 'rohan.patel@edupye.test',
          role: 'student',
          roles: ['student'],
          activeRole: 'student',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/student/overview', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, overview: mockStudentOverview }) });
      });
      await page.route('**/api/tuition/student/enrollments', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, enrollments: mockStudentOverview.activeEnrollments }) });
      });
      await page.route('**/api/tuition/student/requests', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, requests: [] }) });
      });
      await page.route('**/api/tuition/student/schedule*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, sessions: mockStudentOverview.upcomingSessions }) });
      });
      await page.route('**/api/tuition/student/materials*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, materials: [] }) });
      });
      await page.route('**/api/tuition/student/assessments*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, assessments: [] }) });
      });
      await page.route('**/api/tuition/student/payments', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, transactions: [] }) });
      });

      await page.goto(`${baseURL}/student/tuition`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      const outPath = path.join(screenshotsDir, 'phase3-student-tuition-dashboard-tablet-768.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 7. Desktop (1280px) - Tuition Provider Studio Dashboard
    await testStep('Tuition Provider Studio Dashboard (1280px Desktop)', async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-01',
          name: 'Dr. Ananya Sharma',
          email: 'ananya.sharma@edupye.test',
          role: 'tuition_provider',
          roles: ['teacher', 'tuition_provider'],
          activeRole: 'tuition_provider',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/provider/overview', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, overview: mockOverview }) });
      });

      await page.goto(`${baseURL}/tuition-provider`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-provider-dashboard-desktop-1280.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 8. Mobile (375px) - Tuition Provider Studio Dashboard
    await testStep('Tuition Provider Studio Dashboard (375px Mobile)', async () => {
      const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-01',
          name: 'Dr. Ananya Sharma',
          email: 'ananya.sharma@edupye.test',
          role: 'tuition_provider',
          roles: ['teacher', 'tuition_provider'],
          activeRole: 'tuition_provider',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/provider/overview', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, overview: mockOverview }) });
      });

      await page.goto(`${baseURL}/tuition-provider`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-provider-dashboard-mobile-375.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 9. Desktop (1280px) - Tuition Provider Classes & Batches
    await testStep('Tuition Provider Classes & Batches (1280px Desktop)', async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-01',
          name: 'Dr. Ananya Sharma',
          email: 'ananya.sharma@edupye.test',
          role: 'tuition_provider',
          roles: ['teacher', 'tuition_provider'],
          activeRole: 'tuition_provider',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/provider/offerings', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, offerings: mockProviders[0].offerings }) });
      });
      await page.route('**/api/tuition/provider/batches', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, batches: mockBatches }) });
      });

      await page.goto(`${baseURL}/tuition-provider/offerings`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-provider-offerings-desktop-1280.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 10. Desktop (1280px) - Tuition Provider Onboarding & Verification Profile
    await testStep('Tuition Provider Onboarding (1280px Desktop)', async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-01',
          name: 'Prof. Rajesh Raman',
          email: 'rajesh.raman@edupye.test',
          role: 'teacher',
          roles: ['teacher'],
          activeRole: 'teacher',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/provider/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            profile: {
              ...mockProviders[0],
              fullName: 'Prof. Rajesh Raman',
              verificationStatus: 'needs_info',
              verificationNotes: 'Please upload government-issued photo ID and doctoral degree certificate.',
              platformTier: 'platinum',
              supportingDocuments: [
                { title: 'Ph.D. Degree Certificate', documentUrl: 'https://documents.edupye.test/phd_cert.pdf' },
                { title: 'National Teaching Excellence Award', documentUrl: 'https://documents.edupye.test/award.pdf' },
              ],
              verificationAuditTrail: [
                {
                  status: 'needs_info',
                  decisionBy: 'Compliance Officer Sharma',
                  notes: 'Please upload government-issued photo ID and doctoral degree certificate.',
                  decidedAt: new Date().toISOString(),
                },
              ],
            },
          }),
        });
      });

      await page.goto(`${baseURL}/tuition-provider/onboarding`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-provider-onboarding-desktop-1280.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 11. Mobile (375px) - Tuition Provider Onboarding
    await testStep('Tuition Provider Onboarding (375px Mobile)', async () => {
      const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-01',
          name: 'Prof. Rajesh Raman',
          email: 'rajesh.raman@edupye.test',
          role: 'teacher',
          roles: ['teacher'],
          activeRole: 'teacher',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/provider/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            profile: {
              ...mockProviders[0],
              fullName: 'Prof. Rajesh Raman',
              verificationStatus: 'needs_info',
              verificationNotes: 'Please upload government-issued photo ID.',
              platformTier: 'platinum',
              supportingDocuments: [
                { title: 'Ph.D. Degree Certificate', documentUrl: 'https://documents.edupye.test/phd_cert.pdf' },
              ],
            },
          }),
        });
      });

      await page.goto(`${baseURL}/tuition-provider/onboarding`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-provider-onboarding-mobile-375.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 12. Desktop (1280px) - Tuition Provider Schedule & Calendar
    await testStep('Tuition Provider Schedule (1280px Desktop)', async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-01',
          name: 'Dr. Ananya Sharma',
          email: 'ananya.sharma@edupye.test',
          role: 'tuition_provider',
          roles: ['teacher', 'tuition_provider'],
          activeRole: 'tuition_provider',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/provider/schedule*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, sessions: mockOverview.upcomingSessions }) });
      });
      await page.route('**/api/tuition/provider/batches*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, batches: mockBatches }) });
      });

      await page.goto(`${baseURL}/tuition-provider/schedule`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-provider-schedule-desktop-1280.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // 13. Mobile (375px) - Tuition Provider Schedule & Calendar
    await testStep('Tuition Provider Schedule (375px Mobile)', async () => {
      const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
      await page.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({
          _id: 'user-01',
          name: 'Dr. Ananya Sharma',
          email: 'ananya.sharma@edupye.test',
          role: 'tuition_provider',
          roles: ['teacher', 'tuition_provider'],
          activeRole: 'tuition_provider',
        }));
        localStorage.setItem('token', 'mock_jwt_token');
      });

      await page.route('**/api/tuition/provider/schedule*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, sessions: mockOverview.upcomingSessions }) });
      });
      await page.route('**/api/tuition/provider/batches*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, batches: mockBatches }) });
      });

      await page.goto(`${baseURL}/tuition-provider/schedule`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const outPath = path.join(screenshotsDir, 'phase3-tuition-provider-schedule-mobile-375.png');
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
    });

    // Copy screenshots to brain artifact directory
    const artifactDir = 'C:/Users/leksh/.gemini/antigravity/brain/1c866120-d960-4eba-abc2-b17404c59ac7';
    if (fs.existsSync(artifactDir)) {
      const files = fs.readdirSync(screenshotsDir);
      for (const file of files) {
        if (file.startsWith('phase3-') && file.endsWith('.png')) {
          fs.copyFileSync(path.join(screenshotsDir, file), path.join(artifactDir, file));
        }
      }
      console.log(`[Artifact Sync] Synced phase3 screenshots to: ${artifactDir}`);
    }

  } finally {
    await browser.close();
    await server.close();
    console.log('\n[Visual Audit Complete]');
    console.log(`Passed: ${passedCount}, Failed: ${failedCount}`);
  }
}

runPhase3VisualVerification().catch((err) => {
  console.error('Fatal visual audit error:', err);
  process.exit(1);
});

