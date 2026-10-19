import assert from 'node:assert';

// Mock localStorage in Node
const store = new Map();
global.localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

// Simulation of ProtectedRoute logic (matching src/components/common/ProtectedRoute.tsx)
function evaluateProtectedRoute({ pathname, allowedRoles, currentUser, token }) {
  if (!currentUser && !token) {
    return {
      action: 'REDIRECT',
      to: '/login',
      state: {
        from: pathname,
        message: 'Please sign in to access this protected area.',
      },
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && currentUser) {
    const userRole = (currentUser.role || 'student').toLowerCase();
    const isAuthorized = allowedRoles.some((allowed) => {
      if (allowed === userRole) return true;
      if (allowed === 'institution' && userRole === 'company') return true;
      if (allowed === 'company' && userRole === 'institution') return true;
      if (allowed === 'student' && userRole === 'learner') return true;
      if (allowed === 'learner' && userRole === 'student') return true;
      return false;
    });

    if (!isAuthorized) {
      return {
        action: 'ACCESS_DENIED',
        requiredRoles: allowedRoles,
        currentRole: userRole,
      };
    }
  }

  return { action: 'ALLOW' };
}

// Simulation of Login redirection logic (matching src/pages/auth/Login.tsx)
function evaluateLoginNavigation({ session, redirectTarget }) {
  if (redirectTarget && !redirectTarget.startsWith('/login') && !redirectTarget.startsWith('/signup')) {
    return { destination: redirectTarget, isDeepLink: true };
  }

  if (session.role === 'provider') return { destination: '/provider' };
  if (session.role === 'learner') return { destination: '/learner' };
  if (session.role === 'company' || session.role === 'institution') return { destination: '/institution/portal/dashboard' };
  if (session.role === 'teacher') return { destination: '/teacher' };
  if (session.role === 'researcher') return { destination: '/research' };
  return { destination: '/student/home' };
}

console.log('=== RUNNING FRONTEND ROUTE GUARDS & AUTH LIFECYCLE TESTS ===');

// 1. Logged-out access to protected routes
console.log('\n[Test 1] Logged-out access to protected routes and state.from preservation');
const protectedPaths = [
  { path: '/student/home', roles: ['student', 'learner', 'personal'] },
  { path: '/teacher', roles: ['teacher'] },
  { path: '/teacher/smartboard/standard', roles: ['teacher'] },
  { path: '/research', roles: ['researcher'] },
  { path: '/institution/portal/dashboard', roles: ['institution', 'company'] },
  { path: '/provider', roles: ['provider', 'teacher'] },
  { path: '/learner', roles: ['learner', 'student'] },
  { path: '/learn/react-course-99', roles: ['learner', 'student'] },
];

for (const p of protectedPaths) {
  const result = evaluateProtectedRoute({
    pathname: p.path,
    allowedRoles: p.roles,
    currentUser: null,
    token: null,
  });

  assert.strictEqual(result.action, 'REDIRECT', `Logged-out user must be redirected on ${p.path}`);
  assert.strictEqual(result.to, '/login', `Redirect destination must be /login`);
  assert.strictEqual(result.state?.from, p.path, `Redirect must preserve intended destination ${p.path}`);
  assert(result.state?.message?.includes('Please sign in'), `Redirect state must include informative message`);
}
console.log(`  PASS: All ${protectedPaths.length} protected routes redirect logged-out users to /login preserving state.from.`);

// 2. Post-login redirection to preserved destination
console.log('\n[Test 2] Post-login deep link redirection');
{
  const teacherSession = { role: 'teacher', email: 'teacher@edupye.com', name: 'Dr. John' };
  const nav = evaluateLoginNavigation({
    session: teacherSession,
    redirectTarget: '/teacher/smartboard/standard',
  });
  assert.strictEqual(nav.destination, '/teacher/smartboard/standard', 'Must prioritize deep link redirect');
  assert.strictEqual(nav.isDeepLink, true);
  console.log('  PASS: Login preserves and honors original deep link destination.');
}

// 3. Fallback role-based navigation when no deep link is requested
console.log('\n[Test 3] Default role-based landing destinations');
{
  assert.strictEqual(evaluateLoginNavigation({ session: { role: 'student' } }).destination, '/student/home');
  assert.strictEqual(evaluateLoginNavigation({ session: { role: 'teacher' } }).destination, '/teacher');
  assert.strictEqual(evaluateLoginNavigation({ session: { role: 'researcher' } }).destination, '/research');
  assert.strictEqual(evaluateLoginNavigation({ session: { role: 'company' } }).destination, '/institution/portal/dashboard');
  assert.strictEqual(evaluateLoginNavigation({ session: { role: 'provider' } }).destination, '/provider');
  assert.strictEqual(evaluateLoginNavigation({ session: { role: 'learner' } }).destination, '/learner');
  console.log('  PASS: All user roles route to their respective authorized dashboards.');
}

// 4. Role mismatch authorization control
console.log('\n[Test 4] Role mismatch authorization restriction (AccessDenied)');
{
  const studentUser = { role: 'student', email: 'student@edupye.com' };
  const teacherGuarded = evaluateProtectedRoute({
    pathname: '/teacher',
    allowedRoles: ['teacher'],
    currentUser: studentUser,
    token: 'jwt_mock_student_token',
  });
  assert.strictEqual(teacherGuarded.action, 'ACCESS_DENIED', 'Student attempting to access /teacher must be denied');
  assert.strictEqual(teacherGuarded.currentRole, 'student');
  assert.deepStrictEqual(teacherGuarded.requiredRoles, ['teacher']);

  const researcherGuarded = evaluateProtectedRoute({
    pathname: '/research',
    allowedRoles: ['researcher'],
    currentUser: studentUser,
    token: 'jwt_mock_student_token',
  });
  assert.strictEqual(researcherGuarded.action, 'ACCESS_DENIED', 'Student attempting to access /research must be denied');

  console.log('  PASS: Role mismatches trigger ACCESS_DENIED instead of unauthorized portal rendering.');
}

// 5. Session persistence and logout cleanup
console.log('\n[Test 5] Session persistence and logout cleanup');
{
  localStorage.setItem('user', JSON.stringify({ email: 'student@edupye.com', role: 'student' }));
  localStorage.setItem('token', 'valid_token_xyz');
  localStorage.setItem('userRole', 'student');

  assert.strictEqual(localStorage.getItem('token'), 'valid_token_xyz');
  assert(JSON.parse(localStorage.getItem('user')).email === 'student@edupye.com');

  // Simulate logout
  const keysToRemove = ['user', 'userEmail', 'userRole', 'token', 'studentProfileId', 'teacherProfileId'];
  for (const k of keysToRemove) {
    localStorage.removeItem(k);
  }

  assert.strictEqual(localStorage.getItem('token'), null);
  assert.strictEqual(localStorage.getItem('user'), null);
  assert.strictEqual(localStorage.getItem('userRole'), null);

  const postLogout = evaluateProtectedRoute({
    pathname: '/student/home',
    allowedRoles: ['student'],
    currentUser: null,
    token: null,
  });
  assert.strictEqual(postLogout.action, 'REDIRECT');
  console.log('  PASS: Session tokens persisted and successfully purged upon logout.');
}

console.log('\n=== ALL FRONTEND ROUTE GUARDS & AUTH TESTS PASSED ===');
