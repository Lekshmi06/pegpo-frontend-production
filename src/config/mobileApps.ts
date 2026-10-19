/**
 * Configuration for EduPye Mobile Applications: GeniusSpy & EduPay
 * Explicit placeholders configured for app store links awaiting publication approval.
 */

export interface MobileAppConfig {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  keyFeatures: string[];
  status: 'beta_testing' | 'store_review_pending' | 'active';
  statusLabel: string;
  playStoreUrl: string | null;
  appStoreUrl: string | null;
  directApkUrl: string | null;
  accentColor: string;
  badgeGradient: string;
}

export const mobileAppsConfig: MobileAppConfig[] = [
  {
    id: 'genius-spy',
    name: 'GeniusSpy',
    tagline: 'AI Study Proctor & Diagnostic Learning Companion',
    category: 'Learning & Diagnostics',
    description:
      'GeniusSpy puts EduPye’s adaptive AI study tutor, previous-year question solvers, and offline revision notes directly in your pocket. Track continuous conceptual mastery, solve practice tests anywhere, and get real-time revision alerts aligned with your academic syllabus.',
    keyFeatures: [
      'Offline-capable study notes and formula bookshelf',
      'AI-powered diagnostic quiz analysis and weak-spot detection',
      'Spaced repetition flashcards with automated daily review prompts',
      'Continuous streak and mock exam accuracy telemetry',
    ],
    status: 'store_review_pending',
    statusLabel: 'App Store & Google Play Review Pending',
    playStoreUrl: null, // Placeholder: https://play.google.com/store/apps/details?id=com.edupye.geniusspy
    appStoreUrl: null,  // Placeholder: https://apps.apple.com/app/geniusspy/id0000000000
    directApkUrl: null, // Placeholder for internal test distribution
    accentColor: '#0091ff',
    badgeGradient: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'edu-pay',
    name: 'EduPay',
    tagline: 'Seamless Campus Transactions & Tuition Installment Gateway',
    category: 'Finance & Campus Transactions',
    description:
      'EduPay simplifies tuition payments, examination fees, and campus facility charges for students, parents, and administrative accounts. Featuring zero-friction UPI, card, and installment billing options with instant verifiable digital receipts synced to the EduPye ERP.',
    keyFeatures: [
      'Instant tuition fee payment with automated digital receipt generation',
      'Flexible installment plans with automated parental payment reminders',
      'Integrated campus RFID cafeteria & library wallet management',
      'Direct reconciliation with institutional SIS & accounting ledgers',
    ],
    status: 'store_review_pending',
    statusLabel: 'Banking Gateway & App Store Review Pending',
    playStoreUrl: null, // Placeholder: https://play.google.com/store/apps/details?id=com.edupye.edupay
    appStoreUrl: null,  // Placeholder: https://apps.apple.com/app/edupay/id0000000000
    directApkUrl: null,
    accentColor: '#10b981',
    badgeGradient: 'from-emerald-600 to-teal-500',
  },
];
