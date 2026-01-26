import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripeService } from '../services/stripe.service';
import { subscriptionService } from '../services/subscription.service';
import { db } from '../lib/db';
import { SubscriptionStatus } from '../types/subscription.types';

const stripe = stripeService.getStripeInstance();

/**
 * Stripe Webhook Handler
 *
 * Processes Stripe events for:
 * - Checkout session completion (new subscriptions)
 * - Subscription updates (renewals, cancellations)
 * - Account updates (Connect onboarding)
 */
export async function handleStripeWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).json({ error: 'Missing signature or webhook secret' });
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, // Must be raw body
      sig as string,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  console.log(`Received Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error processing ${event.type}:`, error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Handle checkout.session.completed
 * Creates the subscription record when payment succeeds
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, offerId } = session.metadata || {};

  if (!userId || !offerId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const offer = await db.subscriptionOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    console.error('Offer not found:', offerId);
    return;
  }

  // For one-time payments (lifetime subscriptions)
  if (session.mode === 'payment') {
    await subscriptionService.createSubscription(
      userId,
      offerId,
      null, // No Stripe subscription ID for one-time payments
      SubscriptionStatus.ACTIVE,
      null, // Lifetime = no end date
      null
    );
    console.log(`Created lifetime subscription for user ${userId}`);
    return;
  }

  // For recurring subscriptions, the subscription.created event will handle it
  console.log(`Checkout complete for subscription mode - waiting for subscription.created`);
}

/**
 * Handle customer.subscription.created/updated
 * Updates subscription status and period dates
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { userId, offerId } = subscription.metadata || {};

  // Map Stripe status to our status
  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    trialing: SubscriptionStatus.TRIALING,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELLED,
    unpaid: SubscriptionStatus.PAST_DUE,
  };

  const status = statusMap[subscription.status] || SubscriptionStatus.ACTIVE;
  const periodEnd = new Date((subscription as any).current_period_end * 1000);
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;

  // Check if subscription exists
  const existing = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (existing) {
    // Update existing subscription
    await subscriptionService.updateSubscription(
      subscription.id,
      status,
      periodEnd,
      subscription.cancel_at_period_end
    );
    console.log(`Updated subscription ${subscription.id}`);
  } else if (userId && offerId) {
    // Create new subscription
    await subscriptionService.createSubscription(
      userId,
      offerId,
      subscription.id,
      status,
      periodEnd,
      trialEnd
    );
    console.log(`Created subscription ${subscription.id} for user ${userId}`);
  } else {
    console.error('Cannot create subscription - missing userId or offerId in metadata');
  }
}

/**
 * Handle customer.subscription.deleted
 * Marks subscription as cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existing = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (existing) {
    await db.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: SubscriptionStatus.CANCELLED },
    });
    console.log(`Cancelled subscription ${subscription.id}`);
  }
}

/**
 * Handle invoice.paid
 * Updates subscription period on successful renewal
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription;
  if (!subscriptionId) return;

  const stripeSubId =
    typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id;

  const existing = await db.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubId },
  });

  if (existing) {
    // Get updated subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubId);

    await subscriptionService.updateSubscription(
      stripeSubId,
      SubscriptionStatus.ACTIVE,
      new Date((stripeSubscription as any).current_period_end * 1000),
      stripeSubscription.cancel_at_period_end
    );
    console.log(`Invoice paid - updated subscription ${stripeSubId}`);
  }
}

/**
 * Handle invoice.payment_failed
 * Marks subscription as past due
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription;
  if (!subscriptionId) return;

  const stripeSubId =
    typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id;

  const existing = await db.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubId },
  });

  if (existing) {
    await db.subscription.update({
      where: { stripeSubscriptionId: stripeSubId },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
    console.log(`Payment failed - marked subscription ${stripeSubId} as past due`);
  }
}

/**
 * Handle account.updated
 * Updates Connect account status when onboarding completes
 */
async function handleAccountUpdated(account: Stripe.Account) {
  const stripeAccount = await db.tipsterStripeAccount.findUnique({
    where: { stripeAccountId: account.id },
  });

  if (stripeAccount) {
    await db.tipsterStripeAccount.update({
      where: { stripeAccountId: account.id },
      data: {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        onboardingComplete: account.charges_enabled && (account.details_submitted ?? false),
      },
    });
    console.log(`Updated Stripe account status for ${account.id}`);
  }
}
