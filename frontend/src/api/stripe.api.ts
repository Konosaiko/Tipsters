import apiClient from './client';

export interface StripeAccountStatus {
  hasAccount: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
}

/**
 * Start Stripe Connect onboarding
 */
export async function startStripeOnboarding(
  returnUrl: string,
  refreshUrl: string
): Promise<{ url: string }> {
  const response = await apiClient.post('/stripe/connect/onboard', {
    returnUrl,
    refreshUrl,
  });
  return response.data;
}

/**
 * Get Stripe Connect account status
 */
export async function getStripeStatus(): Promise<StripeAccountStatus> {
  const response = await apiClient.get('/stripe/connect/status');
  return response.data;
}

/**
 * Get Stripe Express Dashboard link
 */
export async function getStripeDashboardLink(): Promise<{ url: string }> {
  const response = await apiClient.get('/stripe/connect/dashboard');
  return response.data;
}

/**
 * Refresh Stripe account status from Stripe API
 */
export async function refreshStripeStatus(): Promise<StripeAccountStatus> {
  const response = await apiClient.post('/stripe/connect/refresh');
  return response.data;
}
