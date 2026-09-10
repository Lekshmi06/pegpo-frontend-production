import {
  SubscriptionPlan,
  UserSubscription,
  InvoiceItem,
  PaymentMethod,
  PlanPeriod,
} from '../types/subscription';

const STORAGE_SUBSCRIPTION_KEY = 'pegpo_user_subscription';

const AVAILABLE_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Free Starter',
    tier: 'starter',
    description: 'Essential learning tools for individual exploration and homework review.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'USD',
    features: [
      'Access to core digital textbook library',
      'Basic study notebook & bookmarks',
      '5 AI-generated quizzes per month',
      'Standard community support',
    ],
  },
  {
    id: 'plan_scholar',
    name: 'School Scholar',
    tier: 'scholar',
    description: 'Comprehensive K-12 academic suite tailored for syllabus mastery & high exam scores.',
    monthlyPrice: 12,
    yearlyPrice: 110,
    currency: 'USD',
    popular: true,
    badge: 'Most Popular',
    features: [
      'Full curriculum & syllabus alignment',
      'Unlimited AI chapter summaries & key points',
      'Interactive flashcard revision decks',
      'Visual mind map generator',
      'Unlimited AI study chats with citations',
      'Live recorded classroom replays',
      'Priority email & chat support',
    ],
  },
  {
    id: 'plan_ultimate',
    name: 'Ultimate Academic Pro',
    tier: 'ultimate',
    description: 'Complete power suite with 3D labs, tutor live guidance, and deep analytics.',
    monthlyPrice: 24,
    yearlyPrice: 220,
    currency: 'USD',
    badge: 'All-Inclusive',
    features: [
      'Everything in School Scholar',
      '3D Interactive Physics & Chemistry Lab',
      'Weekly live small-group tutor workshops',
      'Detailed exam cracker & score predictors',
      'Multi-device offline sync',
      'Dedicated academic mentor',
    ],
  },
];

const INITIAL_SUBSCRIPTION: UserSubscription = {
  id: 'sub_live_001',
  planId: 'plan_scholar',
  planName: 'School Scholar',
  tier: 'scholar',
  status: 'active',
  currentPeriodStart: new Date(Date.now() - 14 * 86400000).toISOString(),
  currentPeriodEnd: new Date(Date.now() + 16 * 86400000).toISOString(),
  cancelAtPeriodEnd: false,
  amount: 12,
  currency: 'USD',
  interval: 'monthly',
  paymentMethod: {
    id: 'pm_default_01',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2028,
    isDefault: true,
  },
};

const INVOICE_HISTORY: InvoiceItem[] = [
  {
    id: 'inv_1092',
    invoiceNumber: 'INV-2026-003',
    date: 'Feb 15, 2026',
    amount: 12,
    currency: 'USD',
    status: 'paid',
    description: 'School Scholar Plan - Monthly Billing',
  },
  {
    id: 'inv_1091',
    invoiceNumber: 'INV-2026-002',
    date: 'Jan 15, 2026',
    amount: 12,
    currency: 'USD',
    status: 'paid',
    description: 'School Scholar Plan - Monthly Billing',
  },
  {
    id: 'inv_1090',
    invoiceNumber: 'INV-2025-012',
    date: 'Dec 15, 2025',
    amount: 12,
    currency: 'USD',
    status: 'paid',
    description: 'School Scholar Plan - Monthly Billing',
  },
];

export const subscriptionService = {
  getAvailablePlans: async (): Promise<SubscriptionPlan[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return [...AVAILABLE_PLANS];
  },

  getCurrentSubscription: async (): Promise<UserSubscription> => {
    await new Promise((r) => setTimeout(r, 120));
    const saved = localStorage.getItem(STORAGE_SUBSCRIPTION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to default
      }
    }
    return { ...INITIAL_SUBSCRIPTION };
  },

  upgradePlan: async (planId: string, interval: PlanPeriod = 'monthly'): Promise<UserSubscription> => {
    await new Promise((r) => setTimeout(r, 200));
    const targetPlan = AVAILABLE_PLANS.find((p) => p.id === planId);
    if (!targetPlan) throw new Error('Selected plan not found');

    const amount = interval === 'monthly' ? targetPlan.monthlyPrice : targetPlan.yearlyPrice;
    const days = interval === 'monthly' ? 30 : 365;

    const updated: UserSubscription = {
      id: `sub_${Date.now()}`,
      planId: targetPlan.id,
      planName: targetPlan.name,
      tier: targetPlan.tier,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + days * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      amount,
      currency: targetPlan.currency,
      interval,
      paymentMethod: {
        id: 'pm_default_01',
        brand: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2028,
        isDefault: true,
      },
    };

    localStorage.setItem(STORAGE_SUBSCRIPTION_KEY, JSON.stringify(updated));
    return updated;
  },

  cancelSubscription: async (): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 150));
    const current = await subscriptionService.getCurrentSubscription();
    const updated: UserSubscription = {
      ...current,
      cancelAtPeriodEnd: true,
    };
    localStorage.setItem(STORAGE_SUBSCRIPTION_KEY, JSON.stringify(updated));
    return {
      success: true,
      message: 'Subscription will cancel at the end of the current billing cycle.',
    };
  },

  getBillingHistory: async (): Promise<InvoiceItem[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return [...INVOICE_HISTORY];
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    await new Promise((r) => setTimeout(r, 80));
    return [
      {
        id: 'pm_default_01',
        brand: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2028,
        isDefault: true,
      },
    ];
  },
};
