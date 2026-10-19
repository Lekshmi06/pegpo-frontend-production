/**
 * Configuration for EduPye Public Links & Social Media
 * Note: Per project policy, official social media links and legal content are not fabricated.
 * Channels marked with null/undefined are awaiting formal organizational approval.
 */

export interface PublicLinksConfig {
  helpUrl: string;
  privacyUrl: string;
  termsUrl: string;
  cookiesUrl: string;
  supportEmail: string;
  enterpriseEmail: string;
  phoneNumbers: string[];
  socialLinks: {
    platform: string;
    url: string | null;
    status: 'configured' | 'pending_review';
    description: string;
  }[];
}

export const publicLinksConfig: PublicLinksConfig = {
  helpUrl: '/help',
  privacyUrl: '/privacy',
  termsUrl: '/terms',
  cookiesUrl: '/cookies',
  supportEmail: 'support@edupye.com',
  enterpriseEmail: 'enterprise@edupye.com',
  phoneNumbers: ['+1 (800) 450-EDUPYE', '+91 (80) 4120-PYE'],
  socialLinks: [
    {
      platform: 'LinkedIn',
      url: null, // Pending official organizational handle verification
      status: 'pending_review',
      description: 'Official EduPye LinkedIn company page awaiting handle verification.',
    },
    {
      platform: 'Twitter / X',
      url: null, // Pending official handle verification
      status: 'pending_review',
      description: 'Official EduPye X handle awaiting handle verification.',
    },
    {
      platform: 'YouTube',
      url: null, // Pending official channel verification
      status: 'pending_review',
      description: 'Official EduPye learning broadcast channel awaiting handle verification.',
    },
    {
      platform: 'GitHub',
      url: null, // Pending official organization verification
      status: 'pending_review',
      description: 'Official EduPye open ecosystem repository awaiting handle verification.',
    },
  ],
};
