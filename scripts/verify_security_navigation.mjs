import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('src');

// 1. Verify AppRoutes configuration
const appRoutesPath = path.join(srcDir, 'routes', 'AppRoutes.tsx');
const appRoutesContent = fs.readFileSync(appRoutesPath, 'utf8');

const publicRoutes = ['/help', '/faq', '/privacy', '/terms', '/cookies', '/marketplace', '/institution'];
for (const route of publicRoutes) {
  if (!appRoutesContent.includes(`path="${route}"`)) {
    throw new Error(`Missing expected public route in AppRoutes: ${route}`);
  }
}

const protectedPortals = [
  { name: 'student', path: 'path="/student"', role: 'allowedRoles={[\'student\', \'learner\', \'personal\']}' },
  { name: 'teacher', path: 'path="/teacher"', role: 'allowedRoles={[\'teacher\']}' },
  { name: 'research', path: 'path="/research"', role: 'allowedRoles={[\'researcher\']}' },
  { name: 'institution/portal', path: 'path="/institution/portal"', role: 'allowedRoles={[\'institution\', \'company\']}' },
  { name: 'provider', path: 'path="/provider"', role: 'allowedRoles={[\'provider\', \'teacher\']}' },
  { name: 'learner', path: 'path="/learner"', role: 'allowedRoles={[\'learner\', \'student\']}' },
];

for (const p of protectedPortals) {
  if (!appRoutesContent.includes(p.path)) {
    throw new Error(`Missing route for ${p.name}`);
  }
  if (!appRoutesContent.includes(p.role)) {
    throw new Error(`Route for ${p.name} is missing expected role restriction: ${p.role}`);
  }
}

// 2. Verify LandingNavbar does not expose internal portal links
const navbarPath = path.join(srcDir, 'pages', 'landing', 'LandingNavbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
const forbiddenNavbarLinks = ['to="/student"', 'to="/teacher"', 'to="/research"', 'to="/institution/portal"'];
for (const link of forbiddenNavbarLinks) {
  if (navbarContent.includes(link)) {
    throw new Error(`LandingNavbar illegally contains internal portal link: ${link}`);
  }
}

// 3. Verify FinalCtaAndFooter does not expose internal portal links
const footerPath = path.join(srcDir, 'pages', 'landing', 'FinalCtaAndFooter.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');
const forbiddenFooterLinks = ['to="/student"', 'to="/teacher"', 'to="/research"', 'to="/institution/portal"', 'to="/student/exam-cracker"'];
for (const link of forbiddenFooterLinks) {
  if (footerContent.includes(link)) {
    throw new Error(`FinalCtaAndFooter illegally contains internal portal link: ${link}`);
  }
}

// 4. Verify MobileAppsSection exists and has GeniusSpy & EduPay
const mobileConfigPath = path.join(srcDir, 'config', 'mobileApps.ts');
const mobileConfigContent = fs.readFileSync(mobileConfigPath, 'utf8');
if (!mobileConfigContent.includes('GeniusSpy') || !mobileConfigContent.includes('EduPay')) {
  throw new Error('mobileApps.ts must contain GeniusSpy and EduPay configurations');
}

// 5. Verify PublicLinksConfig has non-fabricated social media placeholders
const publicLinksPath = path.join(srcDir, 'config', 'publicLinks.ts');
const publicLinksContent = fs.readFileSync(publicLinksPath, 'utf8');
if (!publicLinksContent.includes('pending_review')) {
  throw new Error('publicLinks.ts must identify unconfirmed channels as pending review');
}

console.log('✅ ALL LANDING PAGE & NAVIGATION SECURITY CHECKS PASSED SUCCESSFULLY!');
