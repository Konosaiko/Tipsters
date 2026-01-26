import apiClient from './client';

export type SubscriptionDuration = 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'LIFETIME';
export type Sport =
  | 'FOOTBALL'
  | 'BASKETBALL'
  | 'TENNIS'
  | 'RUGBY'
  | 'MMA'
  | 'BOXING'
  | 'ESPORTS'
  | 'HOCKEY'
  | 'VOLLEYBALL'
  | 'BASEBALL'
  | 'AMERICAN_FOOTBALL'
  | 'OTHER';

export interface SubscriptionOffer {
  id: string;
  tipsterId: string;
  name: string;
  description: string | null;
  price: number; // in cents
  currency: string;
  duration: SubscriptionDuration;
  sports: Sport[];
  trialDays: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}

export interface CreateOfferDto {
  name: string;
  description?: string;
  price: number; // in cents
  duration: SubscriptionDuration;
  sports?: Sport[];
  trialDays?: number;
}

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
 * Create a new subscription offer
 */
export async function createOffer(data: CreateOfferDto): Promise<SubscriptionOffer> {
  const response = await apiClient.post('/offers', data);
  return response.data;
}

/**
 * Get my subscription offers (tipster dashboard)
 */
export async function getMyOffers(): Promise<SubscriptionOffer[]> {
  const response = await apiClient.get('/offers');
  return response.data;
}

/**
 * Get a tipster's public offers
 */
export async function getTipsterOffers(tipsterId: string): Promise<SubscriptionOffer[]> {
  const response = await apiClient.get(`/tipsters/${tipsterId}/offers`);
  return response.data;
}

/**
 * Get a single offer by ID
 */
export async function getOfferById(offerId: string): Promise<SubscriptionOffer> {
  const response = await apiClient.get(`/offers/${offerId}`);
  return response.data;
}

/**
 * Update an offer
 */
export async function updateOffer(
  offerId: string,
  data: UpdateOfferDto
): Promise<SubscriptionOffer> {
  const response = await apiClient.patch(`/offers/${offerId}`, data);
  return response.data;
}

/**
 * Delete an offer
 */
export async function deleteOffer(offerId: string): Promise<void> {
  await apiClient.delete(`/offers/${offerId}`);
}

/**
 * Format price from cents to display string
 */
export function formatPrice(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/**
 * Get duration display text
 */
export function getDurationText(duration: SubscriptionDuration): string {
  switch (duration) {
    case 'WEEKLY':
      return '/week';
    case 'MONTHLY':
      return '/month';
    case 'YEARLY':
      return '/year';
    case 'LIFETIME':
      return 'one-time';
    default:
      return '';
  }
}
