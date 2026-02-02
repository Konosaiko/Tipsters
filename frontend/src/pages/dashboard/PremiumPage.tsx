import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tipsterApi } from '../../api/tipster.api';
import { Tipster } from '../../types/tipster.types';
import {
  getStripeStatus,
  startStripeOnboarding,
  getStripeDashboardLink,
  refreshStripeStatus,
  StripeAccountStatus,
} from '../../api/stripe.api';
import {
  getMyOffers,
  updateOffer,
  deleteOffer,
  SubscriptionOffer,
  formatPrice,
  getDurationText,
} from '../../api/offer.api';
import {
  getMySubscriptions,
  cancelSubscription,
  Subscription,
  getStatusColor,
  formatStatus,
} from '../../api/subscription.api';
import { DashboardCreateOfferForm } from '../../components/dashboard/DashboardCreateOfferForm';

export const PremiumPage = () => {
  const [tipsterProfile, setTipsterProfile] = useState<Tipster | null>(null);
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
  const [offers, setOffers] = useState<SubscriptionOffer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      // Load tipster profile
      try {
        const profile = await tipsterApi.getMyTipsterProfile();
        setTipsterProfile(profile);

        // Only load stripe/offers if user is a tipster
        const [statusData, offersData] = await Promise.all([
          getStripeStatus().catch(() => null),
          getMyOffers().catch(() => []),
        ]);
        setStripeStatus(statusData);
        setOffers(offersData);
      } catch {
        setTipsterProfile(null);
      }

      // Load subscriptions (all users can have subscriptions)
      const subsData = await getMySubscriptions().catch(() => []);
      setSubscriptions(subsData);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartOnboarding() {
    try {
      setActionLoading(true);
      setError(null);
      const currentUrl = window.location.href;
      const { url } = await startStripeOnboarding(currentUrl, currentUrl);
      window.location.href = url;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start onboarding');
      setActionLoading(false);
    }
  }

  async function handleOpenDashboard() {
    try {
      setActionLoading(true);
      const { url } = await getStripeDashboardLink();
      window.open(url, '_blank');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to open dashboard');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefreshStatus() {
    try {
      setActionLoading(true);
      const data = await refreshStripeStatus();
      setStripeStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to refresh status');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleOffer(offer: SubscriptionOffer) {
    try {
      await updateOffer(offer.id, { isActive: !offer.isActive });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update offer');
    }
  }

  async function handleDeleteOffer(offerId: string) {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await deleteOffer(offerId);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete offer');
    }
  }

  async function handleCancelSubscription(sub: Subscription) {
    const confirmMsg = sub.cancelAtPeriodEnd
      ? 'Cancel immediately?'
      : 'Cancel at period end?';
    if (!confirm(confirmMsg)) return;

    try {
      setCancellingId(sub.id);
      await cancelSubscription(sub.id, sub.cancelAtPeriodEnd);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Premium & Subscriptions</h1>
        <p className="text-neutral-400 mt-1">
          Manage your payment setup, subscription offers, and active subscriptions
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Tipster Section - Only show if user is a tipster */}
      {tipsterProfile && (
        <>
          {/* Stripe Setup */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Payment Setup</h2>

            {!stripeStatus?.hasAccount && (
              <div>
                <p className="text-neutral-400 mb-4">
                  Connect your Stripe account to receive payments from subscribers.
                </p>
                <button
                  onClick={handleStartOnboarding}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Loading...' : 'Connect with Stripe'}
                </button>
              </div>
            )}

            {stripeStatus?.hasAccount && !stripeStatus.onboardingComplete && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-yellow-500 font-medium">Onboarding incomplete</span>
                </div>
                <p className="text-neutral-400 mb-4">
                  Please complete your Stripe account setup to start receiving payments.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleStartOnboarding}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Loading...' : 'Continue Setup'}
                  </button>
                  <button
                    onClick={handleRefreshStatus}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            )}

            {stripeStatus?.onboardingComplete && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 bg-primary-500 rounded-full" />
                  <span className="text-primary-500 font-medium">Account connected</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Charges</span>
                    <span className={stripeStatus.chargesEnabled ? 'text-primary-500' : 'text-red-500'}>
                      {stripeStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Payouts</span>
                    <span className={stripeStatus.payoutsEnabled ? 'text-primary-500' : 'text-red-500'}>
                      {stripeStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleOpenDashboard}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Loading...' : 'Open Stripe Dashboard'}
                </button>
              </div>
            )}
          </div>

          {/* Subscription Offers */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Your Subscription Offers</h2>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors"
                >
                  + New Offer
                </button>
              )}
            </div>

            {showCreateForm && (
              <div className="mb-6 p-4 bg-neutral-800/50 rounded-lg">
                <DashboardCreateOfferForm
                  onSuccess={() => {
                    setShowCreateForm(false);
                    loadData();
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            )}

            {offers.length === 0 && !showCreateForm ? (
              <p className="text-neutral-500 text-center py-8">
                No subscription offers yet. Create your first offer to start earning!
              </p>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`border rounded-lg p-4 ${
                      offer.isActive
                        ? 'border-neutral-700 bg-neutral-800/30'
                        : 'border-neutral-800 bg-neutral-800/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{offer.name}</h4>
                          {!offer.isActive && (
                            <span className="px-2 py-0.5 bg-neutral-700 text-neutral-400 text-xs rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        {offer.description && (
                          <p className="text-sm text-neutral-400 mt-1">{offer.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                          <span className="font-medium text-white">
                            {formatPrice(offer.price, offer.currency)}
                            {getDurationText(offer.duration)}
                          </span>
                          <span>
                            {offer.sports.length === 0 ? 'All sports' : offer.sports.join(', ')}
                          </span>
                          {offer.trialDays && <span>{offer.trialDays}d trial</span>}
                          <span className="text-primary-500">
                            {offer._count?.subscriptions || 0} subscribers
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleOffer(offer)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            offer.isActive
                              ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                              : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'
                          }`}
                        >
                          {offer.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* User's Subscriptions */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">My Subscriptions</h2>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">No active subscriptions</p>
            <Link
              to="/tipsters"
              className="text-primary-500 hover:text-primary-400 font-medium"
            >
              Browse tipsters →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={`/tipsters/${sub.offer.tipster.id}`}
                      className="font-medium text-primary-500 hover:text-primary-400"
                    >
                      {sub.offer.tipster.displayName}
                    </Link>
                    <p className="text-sm text-neutral-400">{sub.offer.name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(sub.status)}`}
                      >
                        {formatStatus(sub.status)}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {formatPrice(sub.offer.price, sub.offer.currency)}
                        {getDurationText(sub.offer.duration)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {sub.currentPeriodEnd && (
                      <p className="text-sm text-neutral-500">
                        {sub.cancelAtPeriodEnd ? 'Ends' : 'Renews'}:{' '}
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                    {sub.trialEndsAt && sub.status === 'TRIALING' && (
                      <p className="text-sm text-blue-400">
                        Trial ends: {new Date(sub.trialEndsAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {(sub.status === 'ACTIVE' || sub.status === 'TRIALING') && (
                  <div className="mt-4 pt-4 border-t border-neutral-700">
                    {sub.cancelAtPeriodEnd ? (
                      <p className="text-sm text-yellow-500">
                        Subscription will end on{' '}
                        {sub.currentPeriodEnd
                          ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                          : 'period end'}
                      </p>
                    ) : (
                      <button
                        onClick={() => handleCancelSubscription(sub)}
                        disabled={cancellingId === sub.id}
                        className="text-sm text-red-500 hover:text-red-400 disabled:opacity-50"
                      >
                        {cancellingId === sub.id ? 'Cancelling...' : 'Cancel subscription'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
