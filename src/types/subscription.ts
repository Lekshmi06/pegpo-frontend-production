export type PlanPeriod = 'monthly' | 'yearly';
export type PlanTier = 'starter' | 'scholar' | 'ultimate';
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'canceled';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: PlanTier;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  popular?: boolean;
  badge?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl?: string;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  interval: PlanPeriod;
  paymentMethod?: PaymentMethod;
}
