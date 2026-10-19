import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== RUNNING EXAM PREP ONBOARDING & PROFILE PICTURE VALIDATION SUITE ===\n');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  process.stdout.write(`[Test] ${name} ... `);
  try {
    fn();
    console.log('PASS');
    passed++;
  } catch (err) {
    console.log(`FAIL\n  Error: ${err.message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// Test 1: Verify SignUp.tsx Registration Architecture
// -------------------------------------------------------------
runTest('SignUp.tsx contains Google auth, "OR REGISTER WITH" divider, and Email/WhatsApp tabs', () => {
  const signUpContent = fs.readFileSync('src/pages/auth/SignUp.tsx', 'utf8');

  // Verify Google sign-up present
  assert(signUpContent.includes('Sign Up with Google'), 'Google sign-up button missing');

  // Verify "OR REGISTER WITH" divider
  assert(signUpContent.includes('OR REGISTER WITH'), 'Divider "OR REGISTER WITH" missing');

  // Verify Email and WhatsApp options
  assert(signUpContent.includes('Email ID') && signUpContent.includes('WhatsApp'), 'Email/WhatsApp mode buttons missing');

  // Verify prominent Candidate/Recruiter role-selection control is removed
  assert(!signUpContent.includes('Candidate') && !signUpContent.includes('Recruiter'), 'Candidate/Recruiter controls still present');
  assert(!signUpContent.includes('selectedRole === \'provider\''), 'Provider role selector still active in registration UI');

  // Verify permitted default role assignment is strictly 'student'
  assert(signUpContent.includes("'student'"), "Default student role not specified");
  assert(!signUpContent.includes("'teacher'") && !signUpContent.includes("'researcher'"), 'Forbidden elevated roles present');

  // Verify WhatsApp honest pending notice
  assert(
    signUpContent.includes('WhatsApp phone verification is awaiting') ||
    signUpContent.includes('gateway configuration'),
    'Honest WhatsApp gateway configuration notice missing'
  );

  // Verify password confirmation
  assert(signUpContent.includes('Confirm Password'), 'Confirm Password field missing');
  assert(signUpContent.includes('confirmPassword'), 'Confirm password state binding missing');
});

// -------------------------------------------------------------
// Test 2: Verify ExamPrepQuickOnboarding Component Structure & Zero Flashcards
// -------------------------------------------------------------
runTest('ExamPrepQuickOnboarding contains 6 steps, warm cream/orange design tokens, and ZERO flashcards', () => {
  const onboardingContent = fs.readFileSync('src/pages/auth/ExamPrepQuickOnboarding.tsx', 'utf8');

  // 1. Strict constraint: NO FLASHCARDS ANYWHERE
  const flashcardRegex = /flashcard/i;
  assert(!flashcardRegex.test(onboardingContent), 'CRITICAL FAILURE: Flashcard reference detected in ExamPrepQuickOnboarding!');

  // 2. Step 1: Categories
  assert(onboardingContent.includes('School Student'), 'School category missing');
  assert(onboardingContent.includes('College / University'), 'College category missing');
  assert(onboardingContent.includes('Competitive Exam Aspirant'), 'Competitive category missing');

  // 3. Step 2: Goals
  assert(onboardingContent.includes('Prepare for an upcoming exam'), 'Exam goal missing');
  assert(onboardingContent.includes('Improve semester-exam performance'), 'Semester goal missing');
  assert(onboardingContent.includes('Understand difficult topics'), 'Concept goal missing');
  assert(onboardingContent.includes('Complete assignments faster'), 'Assignment goal missing');
  assert(onboardingContent.includes('Build a consistent study routine'), 'Routine goal missing');

  // 4. Step 3: Current performance
  assert(onboardingContent.includes('Recent Exam Score'), 'Recent exam score input missing');
  assert(onboardingContent.includes("haven't taken a mock or board exam yet") || onboardingContent.includes("haven't taken"), 'No-exam-taken option missing');

  // 5. Step 4: Target outcome
  assert(onboardingContent.includes('Score 90%+'), 'Score 90%+ target missing');
  assert(onboardingContent.includes('Top 1% Percentile'), 'Top 1% target missing');

  // 6. Step 5: Preferred study tools (Quizzes, Practice papers, Summary notes, Mind maps, Ask an AI question, Videos, Exam-prep plan)
  assert(onboardingContent.includes('Quizzes'), 'Quizzes tool missing');
  assert(onboardingContent.includes('Practice papers'), 'Practice papers tool missing');
  assert(onboardingContent.includes('Summary notes'), 'Summary notes tool missing');
  assert(onboardingContent.includes('Mind maps'), 'Mind maps tool missing');
  assert(onboardingContent.includes('Ask an AI question'), 'Ask an AI question tool missing');
  assert(onboardingContent.includes('Videos'), 'Videos tool missing');
  assert(onboardingContent.includes('Exam-preparation plan'), 'Exam plan tool missing');

  // 7. Step 6: Study material upload
  assert(onboardingContent.includes('Add study material to get started'), 'Study material upload step missing');

  // 8. Completion screen and navigation
  assert(onboardingContent.includes("You're ready to study!"), 'Completion screen missing');
  assert(onboardingContent.includes('Go to My Dashboard'), 'Go to dashboard button missing');
  assert(onboardingContent.includes('/student/dashboard'), 'Dashboard target link missing');
  assert(onboardingContent.includes('edupye_exam_onboarding_draft'), 'LocalStorage draft key missing');
});

// -------------------------------------------------------------
// Test 3: Verify Profile Picture Bug Fix & User Isolation
// -------------------------------------------------------------
runTest('Profile picture update: upload validation, authentication, persistence and user isolation', () => {
  const profileContent = fs.readFileSync('src/pages/student/Profile.tsx', 'utf8');
  const serverContent = fs.readFileSync('../Backend-vercel/src/server.ts', 'utf8');
  const routesContent = fs.readFileSync('../Backend-vercel/src/routes/student_routes.ts', 'utf8');
  const controllerContent = fs.readFileSync('../Backend-vercel/src/controllers/student_controller.ts', 'utf8');

  // 1. Profile.tsx interactive file picker & validation
  assert(profileContent.includes('accept="image/jpeg,image/png,image/webp,image/gif"'), 'Image accept attribute missing');
  assert(profileContent.includes('handleAvatarChange'), 'handleAvatarChange handler missing');
  assert(profileContent.includes('profile?.avatar') || profileContent.includes('currentUser?.avatar'), 'Real dynamic avatar src not bound in Profile.tsx');
  assert(profileContent.includes('Profile photo must be smaller than 3MB'), 'File size validation missing');

  // 2. Server 10MB limit for base64 / image payloads
  assert(serverContent.includes('limit: "10mb"') || serverContent.includes("limit: '10mb'"), 'Express 10MB limit missing');

  // 3. Backend PUT /:id authentication & user isolation
  assert(routesContent.includes('router.put("/:id", authenticateStudent, updateStudentController)'), 'authenticateStudent missing on PUT /:id');
  assert(controllerContent.includes('req.studentProfile._id.toString() !== id'), 'User isolation check missing in updateStudentController');
  assert(controllerContent.includes('Forbidden: You cannot update another student\'s profile'), '403 Forbidden message missing');
});

// -------------------------------------------------------------
// Test 4: Verify AppRoutes.tsx Registration
// -------------------------------------------------------------
runTest('AppRoutes.tsx registers /onboarding/quick and /onboarding/exam-prep without breaking protected routes', () => {
  const routesContent = fs.readFileSync('src/routes/AppRoutes.tsx', 'utf8');

  assert(routesContent.includes('/onboarding/quick'), '/onboarding/quick route missing');
  assert(routesContent.includes('/onboarding/exam-prep'), '/onboarding/exam-prep route missing');
  assert(routesContent.includes('ExamPrepQuickOnboarding'), 'ExamPrepQuickOnboarding lazy import missing');

  // Ensure /student and protected routes remain guarded
  assert(routesContent.includes('<ProtectedRoute allowedRoles={[\'student\', \'learner\', \'personal\']}>'), 'Student protected route altered');
});

console.log('\n=============================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('=============================================================');

if (failed > 0) {
  process.exit(1);
}
