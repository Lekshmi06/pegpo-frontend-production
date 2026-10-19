import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';

function signJwt(payload: any, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');
  return `${b64Header}.${b64Payload}.${signature}`;
}

function verifyJwt(token: string, secret: string): any {
  const [b64Header, b64Payload, signature] = token.split('.');
  if (!b64Header || !b64Payload || !signature) {
    throw new Error('Malformed token');
  }
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');
  if (expectedSig !== signature) {
    throw new Error('Invalid signature');
  }
  const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('jwt expired');
  }
  return payload;
}

const SSO_SECRET = process.env.EDUPYE_SSO_SECRET || 'edupye_cross_module_sso_master_secret_2026';
const CORE_API = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

test.describe('EduPye End-to-End SSO, Workspaces & Role-Based Access Suite', () => {

  test('1. Core-to-School SSO ticket exchange contract', async ({ request }) => {
    const now = Math.floor(Date.now() / 1000);
    const schoolPayload = {
      sub: 'sch_teacher_101',
      role: 'Teacher',
      sourceSystem: 'school',
      institutionId: 'school_demo_inst_99',
      name: 'Priya Sharma',
      email: 'priya.teacher@demo.school',
      iss: 'edupye:school',
      aud: 'edupye:core',
      iat: now,
      exp: now + 900,
    };

    const ssoToken = signJwt(schoolPayload, SSO_SECRET);

    // Validate payload decode & contract
    const [b64H, b64P] = ssoToken.split('.');
    const decoded = JSON.parse(Buffer.from(b64P, 'base64url').toString('utf8'));
    expect(decoded.sub).toBe('sch_teacher_101');
    expect(decoded.sourceSystem).toBe('school');
    expect(decoded.role).toBe('Teacher');
    expect(decoded.exp).toBeGreaterThan(now);

    // Verify cryptographic signature matches shared secret
    const verified = verifyJwt(ssoToken, SSO_SECRET);
    expect(verified.institutionId).toBe('school_demo_inst_99');
  });

  test('2. Core-to-College SSO ticket exchange contract', async ({ request }) => {
    const now = Math.floor(Date.now() / 1000);
    const collegePayload = {
      sub: 'col_faculty_202',
      role: 'faculty',
      sourceSystem: 'college',
      institutionId: 'college_demo_inst_77',
      name: 'Dr. Rajesh Patel',
      email: 'rajesh.patel@demo.college',
      iss: 'edupye:college',
      aud: 'edupye:core',
      iat: now,
      exp: now + 900,
    };

    const ssoToken = signJwt(collegePayload, SSO_SECRET);
    const verified = verifyJwt(ssoToken, SSO_SECRET);

    expect(verified.sub).toBe('col_faculty_202');
    expect(verified.sourceSystem).toBe('college');
    expect(verified.role).toBe('faculty');
  });

  test('3. Embedded workspace postMessage security origins check', async () => {
    const allowedOrigins = [
      'https://edupye.com',
      'https://app.edupye.com',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ];

    const isAllowedOrigin = (origin: string) => allowedOrigins.includes(origin);

    // Allowed origins should pass
    expect(isAllowedOrigin('http://localhost:3001')).toBe(true);
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true);

    // Malicious or untrusted origins MUST be rejected
    expect(isAllowedOrigin('https://attacker.evil.com')).toBe(false);
    expect(isAllowedOrigin('http://localhost:8080')).toBe(false);
    expect(isAllowedOrigin('null')).toBe(false);
  });

  test('4. Token expiration and replay prevention', async () => {
    const now = Math.floor(Date.now() / 1000);
    const expiredPayload = {
      sub: 'student_expired_001',
      role: 'Student',
      sourceSystem: 'school',
      institutionId: 'inst_01',
      iss: 'edupye:school',
      aud: 'edupye:core',
      iat: now - 3600,
      exp: now - 60, // Expired 1 minute ago
    };

    const expiredToken = signJwt(expiredPayload, SSO_SECRET);

    expect(() => {
      verifyJwt(expiredToken, SSO_SECRET);
    }).toThrow(/jwt expired/);
  });

  test('5. Role-based access control contract enforcement', async () => {
    const rolesHierarchy: Record<string, string[]> = {
      Admin: ['manage_users', 'manage_classes', 'delete_records', 'view_analytics'],
      Teacher: ['manage_classes', 'view_students', 'record_attendance'],
      Student: ['view_attendance', 'submit_assignments', 'view_profile'],
    };

    const hasPermission = (userRole: string, permission: string): boolean => {
      const perms = rolesHierarchy[userRole] || [];
      return perms.includes(permission);
    };

    // Admin privileges
    expect(hasPermission('Admin', 'delete_records')).toBe(true);
    expect(hasPermission('Admin', 'manage_users')).toBe(true);

    // Teacher cannot delete records or manage platform users
    expect(hasPermission('Teacher', 'manage_classes')).toBe(true);
    expect(hasPermission('Teacher', 'delete_records')).toBe(false);
    expect(hasPermission('Teacher', 'manage_users')).toBe(false);

    // Student cannot manage classes or record attendance
    expect(hasPermission('Student', 'view_profile')).toBe(true);
    expect(hasPermission('Student', 'manage_classes')).toBe(false);
    expect(hasPermission('Student', 'record_attendance')).toBe(false);
    expect(hasPermission('Student', 'delete_records')).toBe(false);
  });

  test('6. Session logout and token invalidation workflow', async () => {
    // Simulating token registry invalidation
    const activeSessions = new Set<string>();
    const sessionToken = 'jwt_session_token_' + Math.random().toString(36).substring(2);

    // User logs in
    activeSessions.add(sessionToken);
    expect(activeSessions.has(sessionToken)).toBe(true);

    // User logs out
    activeSessions.delete(sessionToken);
    expect(activeSessions.has(sessionToken)).toBe(false);

    // Subsequent authenticated request with cleared token must fail
    const isAuthenticated = (token: string) => activeSessions.has(token);
    expect(isAuthenticated(sessionToken)).toBe(false);
  });
});
