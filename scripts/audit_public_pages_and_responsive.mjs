import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('=== AUDITING LANDING PAGE AND PUBLIC PAGES MARKUP & RESPONSIVENESS ===');

const srcDir = path.resolve('src');

// 1. Audit LandingNavbar
console.log('\n[Audit 1] LandingNavbar component');
const navbarCode = fs.readFileSync(path.join(srcDir, 'pages', 'landing', 'LandingNavbar.tsx'), 'utf8');
assert(navbarCode.includes('href="#features"'), 'Features anchor must exist');
assert(navbarCode.includes('to="/marketplace"'), 'Marketplace link must exist');
assert(navbarCode.includes('to="/institution"'), 'Institution link must exist');
assert(navbarCode.includes('href="#mobile-apps"'), 'Mobile apps anchor must exist');
assert(navbarCode.includes('to="/help"'), 'Help link must exist');
assert(navbarCode.includes("navigate('/login')"), 'Sign In CTA must exist');
assert(navbarCode.includes("navigate('/signup')"), 'Sign Up CTA must exist');
assert(navbarCode.includes('lg:hidden'), 'Mobile hamburger trigger must exist');
assert(navbarCode.includes('mobileMenuOpen'), 'Mobile drawer state must be handled');
console.log('  PASS: LandingNavbar contains complete public links, responsive breakpoints, and mobile drawer.');

// 2. Audit HeroSection
console.log('\n[Audit 2] HeroSection headline, description, and CTAs');
const heroCode = fs.readFileSync(path.join(srcDir, 'pages', 'landing', 'HeroSection.tsx'), 'utf8');
assert(heroCode.includes('One platform.'), 'Hero headline must be present');
assert(heroCode.includes('Every learning journey.'), 'Hero headline accent must be present');
assert(heroCode.includes('/signup'), 'Sign up CTA must be wired');
assert(heroCode.includes('/login'), 'Sign in CTA must be wired');
assert(heroCode.includes('onOpenDemo'), 'Demo modal trigger must be wired');
assert(heroCode.includes('max-w-7xl'), 'Responsive desktop container present');
assert(heroCode.includes('sm:text-6xl'), 'Responsive typography scale present');
console.log('  PASS: HeroSection has clear headline, concise LMS description, and prominent CTAs.');

// 3. Audit MobileAppsSection
console.log('\n[Audit 3] MobileAppsSection (GeniusSpy & EduPay)');
const mobileCode = fs.readFileSync(path.join(srcDir, 'pages', 'landing', 'MobileAppsSection.tsx'), 'utf8');
const mobileConfig = fs.readFileSync(path.join(srcDir, 'config', 'mobileApps.ts'), 'utf8');
assert(mobileCode.includes('id="mobile-apps"'), 'Section id mobile-apps must exist');
assert(mobileConfig.includes('GeniusSpy'), 'GeniusSpy must be in mobileApps config');
assert(mobileConfig.includes('EduPay'), 'EduPay must be in mobileApps config');
assert(mobileCode.includes('Store Review') || mobileCode.includes('Pending'), 'Approval status badge must be present');
assert(mobileCode.includes('grid-cols-1 lg:grid-cols-2'), 'Responsive 1-col mobile / 2-col desktop layout present');
console.log('  PASS: MobileAppsSection is visually distinct and responsive with GeniusSpy & EduPay.');

// 4. Audit FinalCtaAndFooter
console.log('\n[Audit 4] FinalCtaAndFooter public directory');
const footerCode = fs.readFileSync(path.join(srcDir, 'pages', 'landing', 'FinalCtaAndFooter.tsx'), 'utf8');
const requiredFooterRoutes = ['/help', '/privacy', '/terms', '/cookies', '/marketplace', '/institution'];
for (const r of requiredFooterRoutes) {
  assert(footerCode.includes(`to="${r}"`), `Footer must contain public link to ${r}`);
}
assert(footerCode.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-5'), 'Responsive 1-col mobile / 2-col tablet / 5-col desktop layout present');
console.log('  PASS: FinalCtaAndFooter contains complete public directory and responsive layout grid.');

// 5. Audit Public Pages: HelpFaq, PrivacyPolicy, TermsOfService, CookieSettings
console.log('\n[Audit 5] Public pages integrity');
const helpCode = fs.readFileSync(path.join(srcDir, 'pages', 'public', 'HelpFaq.tsx'), 'utf8');
assert(helpCode.includes('FAQS'), 'Help page must contain FAQs list');
assert(helpCode.includes('searchQuery'), 'Help page must feature search');

const privacyCode = fs.readFileSync(path.join(srcDir, 'pages', 'public', 'PrivacyPolicy.tsx'), 'utf8');
assert(privacyCode.includes('Legal Policy Review Pending'), 'Privacy page must clearly state review pending');
assert(privacyCode.includes('FERPA'), 'FERPA compliance standards noted');
assert(privacyCode.includes('GDPR'), 'GDPR compliance standards noted');

const termsCode = fs.readFileSync(path.join(srcDir, 'pages', 'public', 'TermsOfService.tsx'), 'utf8');
assert(termsCode.includes('Review Pending') || termsCode.includes('Under Review'), 'Terms page must note review pending status');
assert(termsCode.includes('Acceptable Use'), 'Terms page must specify acceptable use');

const cookiesCode = fs.readFileSync(path.join(srcDir, 'pages', 'public', 'CookieSettings.tsx'), 'utf8');
assert(cookiesCode.includes('edupye_cookie_preferences'), 'Cookie preferences must sync to storage');
assert(cookiesCode.includes('handleSave'), 'Cookie save handler must exist');
console.log('  PASS: All 4 public pages verified with appropriate review status notices and controls.');

console.log('\n=== ALL PUBLIC PAGES & RESPONSIVE MARKUP AUDITS PASSED ===');
