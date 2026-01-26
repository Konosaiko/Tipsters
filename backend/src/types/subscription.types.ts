import { Sport } from './tip.types';

/**
 * Subscription duration enum
 */
export enum SubscriptionDuration {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  LIFETIME = 'LIFETIME',
}

/**
 * Subscription status enum
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
}

/**
 * Tip visibility enum
 */
export enum TipVisibility {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

/**
 * Request body for creating a subscription offer
 */
export interface CreateOfferDto {
  name: string;
  description?: string;
  price: number; // In cents (€9.99 = 999)
  duration: SubscriptionDuration;
  sports?: Sport[]; // Empty = all sports
  trialDays?: number;
}

/**
 * Request body for updating a subscription offer
 */
export interface UpdateOfferDto {
  name?: string;
  description?: string;
  price?: number;
  duration?: SubscriptionDuration;
  sports?: Sport[];
  trialDays?: number;
  isActive?: boolean;
}

/**
 * Response shape for a subscription offer
 */
export interface OfferResponse {
  id: string;
  tipsterId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration: SubscriptionDuration;
  sports: Sport[];
  trialDays: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response shape for a subscription offer with tipster info
 */
export interface OfferWithTipster extends OfferResponse {
  tipster: {
    id: string;
    displayName: string;
  };
}

/**
 * Response shape for a user subscription
 */
export interface SubscriptionResponse {
  id: string;
  userId: string;
  offerId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  offer: OfferResponse & {
    tipster: {
      id: string;
      displayName: string;
    };
  };
}

/**
 * Stripe Connect account status
 */
export interface StripeAccountStatus {
  hasAccount: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
}

/**
 * Platform fee tiers based on subscriber count
 */
export const PLATFORM_FEE_TIERS = [
  { minSubscribers: 100, feePercent: 5 },
  { minSubscribers: 50, feePercent: 8 },
  { minSubscribers: 0, feePercent: 10 },
] as const;

/**
 * Calculate platform fee based on subscriber count
 */
export function calculatePlatformFee(subscriberCount: number): number {
  for (const tier of PLATFORM_FEE_TIERS) {
    if (subscriberCount >= tier.minSubscribers) {
      return tier.feePercent;
    }
  }
  return 10; // Default
}
