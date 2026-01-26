import apiClient from './client';
import { SubscriptionOffer } from './offer.api';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PAST_DUE'
  | 'TRIALING';

export interface Subscription {
  id: string;
  userId: string;
  offerId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  offer: SubscriptionOffer & {
    tipster: {
      id: string;
      displayName: string;
    };
  };
}

export interface TipsterAccessSummary {
  isOwner: boolean;
  hasAccess: boolean;
  activeSubscription: {
    id: string;
    offerName: string;
    expiresAt: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  availableOffers: SubscriptionOffer[];
  tipCounts: {
    free: number;
    premium: number;
    total: number;
  };
}

/**
 * Create a checkout session to subscribe to an offer
 */
export async function createCheckout(
  offerId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string }> {
  const response = await apiClient.post('/subscriptions/checkout', {
    offerId,
    successUrl,
    cancelUrl,
  });
  return response.data;
}

/**
 * Get my subscriptions
 */
export async function getMySubscriptions(): Promise<Subscription[]> {
  const response = await apiClient.get('/subscriptions');
  return response.data;
}

/**
 * Check subscription to a specific tipster
 */
export async function getSubscriptionToTipster(tipsterId: string): Promise<{
  hasSubscription: boolean;
  subscription: Subscription | null;
}> {
  const response = await apiClient.get(`/subscriptions/tipster/${tipsterId}`);
  return response.data;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<{ message: string }> {
  const response = await apiClient.post(`/subscriptions/${subscriptionId}/cancel`, {
    immediately,
  });
  return response.data;
}

/**
 * Get access summary for a tipster (public, optional auth)
 */
export async function getTipsterAccess(tipsterId: string): Promise<TipsterAccessSummary> {
  const response = await apiClient.get(`/tipsters/${tipsterId}/access`);
  return response.data;
}

/**
 * Get my subscribers (tipster dashboard)
 */
export async function getMySubscribers(): Promise<
  Array<{
    id: string;
    user: { id: string; username: string };
    offer: { id: string; name: string; price: number };
    createdAt: string;
  }>
> {
  const response = await apiClient.get('/subscriptions/subscribers');
  return response.data;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'TRIALING':
      return 'bg-blue-100 text-blue-800';
    case 'PAST_DUE':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Format subscription status for display
 */
export function formatStatus(status: SubscriptionStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'TRIALING':
      return 'Trial';
    case 'PAST_DUE':
      return 'Past Due';
    case 'CANCELLED':
      return 'Cancelled';
    case 'EXPIRED':
      return 'Expired';
    default:
      return status;
  }
}
