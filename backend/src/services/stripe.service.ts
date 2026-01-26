import Stripe from 'stripe';
import { db } from '../lib/db';
import { calculatePlatformFee, SubscriptionDuration } from '../types/subscription.types';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

/**
 * Stripe Service
 *
 * Handles all Stripe-related operations:
 * - Connect account management for tipsters
 * - Product and price creation
 * - Checkout session creation
 * - Subscription management
 */
export class StripeService {
  /**
   * Create a Stripe Connect account for a tipster
   *
   * @param tipsterId - The tipster ID
   * @returns The Stripe account ID
   */
  async createConnectAccount(tipsterId: string): Promise<string> {
    const tipster = await db.tipster.findUnique({
      where: { id: tipsterId },
      include: { user: true },
    });

    if (!tipster) {
      throw new Error('Tipster not found');
    }

    // Check if tipster already has a Stripe account
    const existingAccount = await db.tipsterStripeAccount.findUnique({
      where: { tipsterId },
    });

    if (existingAccount) {
      return existingAccount.stripeAccountId;
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR', // Default to France, can be changed
      email: tipster.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        tipsterId: tipster.id,
        userId: tipster.userId,
      },
    });

    // Save to database
    await db.tipsterStripeAccount.create({
      data: {
        tipsterId,
        stripeAccountId: account.id,
        chargesEnabled: false,
        payoutsEnabled: false,
        onboardingComplete: false,
      },
    });

    return account.id;
  }

  /**
   * Generate an onboarding link for Stripe Connect
   *
   * @param tipsterId - The tipster ID
   * @param returnUrl - URL to redirect after onboarding
   * @param refreshUrl - URL to redirect if link expires
   * @returns The onboarding URL
   */
  async createOnboardingLink(
    tipsterId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<string> {
    const stripeAccount = await db.tipsterStripeAccount.findUnique({
      where: { tipsterId },
    });

    if (!stripeAccount) {
      // Create account first
      await this.createConnectAccount(tipsterId);
      const newAccount = await db.tipsterStripeAccount.findUnique({
        where: { tipsterId },
      });
      if (!newAccount) {
        throw new Error('Failed to create Stripe account');
      }
      return this.createOnboardingLink(tipsterId, returnUrl, refreshUrl);
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Create a login link to the Stripe Express Dashboard
   *
   * @param tipsterId - The tipster ID
   * @returns The dashboard login URL
   */
  async createDashboardLink(tipsterId: string): Promise<string> {
    const stripeAccount = await db.tipsterStripeAccount.findUnique({
      where: { tipsterId },
    });

    if (!stripeAccount) {
      throw new Error('No Stripe account found');
    }

    if (!stripeAccount.onboardingComplete) {
      throw new Error('Stripe onboarding not complete');
    }

    const loginLink = await stripe.accounts.createLoginLink(
      stripeAccount.stripeAccountId
    );

    return loginLink.url;
  }

  /**
   * Get Stripe Connect account status
   *
   * @param tipsterId - The tipster ID
   */
  async getAccountStatus(tipsterId: string) {
    const stripeAccount = await db.tipsterStripeAccount.findUnique({
      where: { tipsterId },
    });

    if (!stripeAccount) {
      return {
        hasAccount: false,
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        onboardingComplete: false,
      };
    }

    return {
      hasAccount: true,
      accountId: stripeAccount.stripeAccountId,
      chargesEnabled: stripeAccount.chargesEnabled,
      payoutsEnabled: stripeAccount.payoutsEnabled,
      onboardingComplete: stripeAccount.onboardingComplete,
    };
  }

  /**
   * Sync Stripe account status from Stripe API
   *
   * @param stripeAccountId - The Stripe account ID
   */
  async syncAccountStatus(stripeAccountId: string): Promise<void> {
    const account = await stripe.accounts.retrieve(stripeAccountId);

    await db.tipsterStripeAccount.update({
      where: { stripeAccountId },
      data: {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        onboardingComplete:
          account.charges_enabled && account.details_submitted,
      },
    });
  }

  /**
   * Create a Stripe Product and Price for a subscription offer
   *
   * @param offerId - The offer ID
   * @returns The Stripe product and price IDs
   */
  async createProductForOffer(offerId: string): Promise<{
    productId: string;
    priceId: string;
  }> {
    const offer = await db.subscriptionOffer.findUnique({
      where: { id: offerId },
      include: { tipster: { include: { stripeAccount: true } } },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (!offer.tipster.stripeAccount?.stripeAccountId) {
      throw new Error('Tipster has no Stripe account');
    }

    // Create product on connected account
    const product = await stripe.products.create(
      {
        name: offer.name,
        description: offer.description || undefined,
        metadata: {
          offerId: offer.id,
          tipsterId: offer.tipsterId,
        },
      },
      {
        stripeAccount: offer.tipster.stripeAccount.stripeAccountId,
      }
    );

    // Determine price configuration
    const priceData: Stripe.PriceCreateParams = {
      product: product.id,
      currency: offer.currency,
      unit_amount: offer.price,
      metadata: {
        offerId: offer.id,
      },
    };

    // Set recurring interval based on duration
    if (offer.duration !== 'LIFETIME') {
      priceData.recurring = {
        interval: this.durationToStripeInterval(offer.duration),
      };
    }

    const price = await stripe.prices.create(priceData, {
      stripeAccount: offer.tipster.stripeAccount.stripeAccountId,
    });

    // Update offer with Stripe IDs
    await db.subscriptionOffer.update({
      where: { id: offerId },
      data: {
        stripeProductId: product.id,
        stripePriceId: price.id,
      },
    });

    return {
      productId: product.id,
      priceId: price.id,
    };
  }

  /**
   * Create a Stripe Checkout session for subscription
   *
   * @param userId - The user ID
   * @param offerId - The offer ID
   * @param successUrl - URL to redirect on success
   * @param cancelUrl - URL to redirect on cancel
   * @returns The checkout session URL
   */
  async createCheckoutSession(
    userId: string,
    offerId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const offer = await db.subscriptionOffer.findUnique({
      where: { id: offerId },
      include: { tipster: { include: { stripeAccount: true } } },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (!offer.isActive) {
      throw new Error('Offer is not active');
    }

    if (!offer.tipster.stripeAccount?.stripeAccountId) {
      throw new Error('Tipster payment setup incomplete');
    }

    if (!offer.tipster.stripeAccount.chargesEnabled) {
      throw new Error('Tipster cannot receive payments yet');
    }

    // Ensure product exists in Stripe
    if (!offer.stripePriceId) {
      await this.createProductForOffer(offerId);
      // Refresh offer data
      const updatedOffer = await db.subscriptionOffer.findUnique({
        where: { id: offerId },
      });
      if (!updatedOffer?.stripePriceId) {
        throw new Error('Failed to create Stripe product');
      }
      offer.stripePriceId = updatedOffer.stripePriceId;
    }

    // Get or create Stripe customer
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Calculate platform fee
    const subscriberCount = await db.subscription.count({
      where: {
        offer: { tipsterId: offer.tipsterId },
        status: 'ACTIVE',
      },
    });
    const platformFeePercent = calculatePlatformFee(subscriberCount);

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: offer.duration === 'LIFETIME' ? 'payment' : 'subscription',
      line_items: [
        {
          price: offer.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        offerId,
        tipsterId: offer.tipsterId,
      },
      payment_intent_data:
        offer.duration === 'LIFETIME'
          ? {
              application_fee_amount: Math.round(
                (offer.price * platformFeePercent) / 100
              ),
              transfer_data: {
                destination: offer.tipster.stripeAccount.stripeAccountId,
              },
            }
          : undefined,
      subscription_data:
        offer.duration !== 'LIFETIME'
          ? {
              application_fee_percent: platformFeePercent,
              transfer_data: {
                destination: offer.tipster.stripeAccount.stripeAccountId,
              },
              trial_period_days: offer.trialDays || undefined,
              metadata: {
                userId,
                offerId,
                tipsterId: offer.tipsterId,
              },
            }
          : undefined,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return session.url;
  }

  /**
   * Cancel a Stripe subscription
   *
   * @param stripeSubscriptionId - The Stripe subscription ID
   * @param cancelImmediately - Whether to cancel immediately or at period end
   */
  async cancelSubscription(
    stripeSubscriptionId: string,
    cancelImmediately = false
  ): Promise<void> {
    if (cancelImmediately) {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    } else {
      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  /**
   * Convert duration enum to Stripe interval
   */
  private durationToStripeInterval(
    duration: SubscriptionDuration
  ): Stripe.Price.Recurring.Interval {
    switch (duration) {
      case SubscriptionDuration.WEEKLY:
        return 'week';
      case SubscriptionDuration.MONTHLY:
        return 'month';
      case SubscriptionDuration.YEARLY:
        return 'year';
      default:
        return 'month';
    }
  }

  /**
   * Get Stripe instance for webhook verification
   */
  getStripeInstance(): Stripe {
    return stripe;
  }
}

// Export singleton instance
export const stripeService = new StripeService();
