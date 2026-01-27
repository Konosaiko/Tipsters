import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { tipsterApi } from '../api/tipster.api';
import { statsApi } from '../api/stats.api';
import { TipsterWithDetails } from '../types/tipster.types';
import { TipsterStats, PeriodFilter } from '../types/stats.types';
import { PublicTipCard } from '../components/tip/PublicTipCard';
import { StatsPanel } from '../components/stats/StatsPanel';
import { FollowButton } from '../components/follow/FollowButton';
import { useAuth } from '../context/AuthContext';
import { getTipsterAccess, TipsterAccessSummary } from '../api/subscription.api';
import { SubscriptionOffer, formatPrice, getDurationText } from '../api/offer.api';
import { SubscribeButton } from '../components/SubscribeButton';

/**
 * Page displaying a single tipster's profile and all their tips
 * Accessible to all users (public)
 */
export const TipsterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [tipster, setTipster] = useState<TipsterWithDetails | null>(null);
  const [stats, setStats] = useState<TipsterStats | null>(null);
  const [accessInfo, setAccessInfo] = useState<TipsterAccessSummary | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);

  // Check for subscription success/cancel message from Stripe redirect
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      setSubscriptionMessage('Subscription successful! You now have access to premium tips.');
    } else if (subscriptionStatus === 'cancelled') {
      setSubscriptionMessage('Subscription was cancelled.');
    }
  }, [searchParams]);

  // Fetch tipster profile
  useEffect(() => {
    const fetchTipster = async () => {
      if (!id) {
        setError('Invalid tipster ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await tipsterApi.getTipsterById(id);
        setTipster(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load tipster'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTipster();
  }, [id]);

  // Fetch subscription/access info
  useEffect(() => {
    const fetchAccessInfo = async () => {
      if (!id) return;

      try {
        const data = await getTipsterAccess(id);
        setAccessInfo(data);
      } catch (err) {
        console.error('Failed to load access info:', err);
      }
    };

    fetchAccessInfo();
  }, [id, user]);

  // Fetch tipster stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!id) return;

      try {
        setIsLoadingStats(true);
        const data = await statsApi.getTipsterStats(id, period);
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
        // Don't show error for stats - they're supplementary
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [id, period]);

  const handlePeriodChange = (newPeriod: PeriodFilter) => {
    setPeriod(newPeriod);
  };

  const handleFollowChange = async () => {
    // Refetch tipster data to get updated follower count
    if (id) {
      try {
        const data = await tipsterApi.getTipsterById(id);
        setTipster(data);
      } catch (err) {
        console.error('Failed to refresh tipster data:', err);
      }
    }
  };

  const tipCount = tipster?.tips?.length ?? 0;
  const followerCount = tipster?.followerCount ?? 0;
  const isOwnProfile = user?.id === tipster?.userId;

  return (
    <Layout>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-neutral-600">Loading tipster...</div>
        </div>
      ) : error || !tipster ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Tipster not found'}
          </div>
          <Link
            to="/tipsters"
            className="mt-4 inline-block text-primary-600 hover:text-primary-800"
          >
            ← Back to all tipsters
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/tipsters"
        className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
      >
        ← Back to all tipsters
      </Link>

      {/* Tipster Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {tipster.displayName}
            </h1>
            <p className="text-neutral-600 mb-2">@{tipster.user.username}</p>
            <p className="text-sm text-neutral-500 mb-4">
              {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
            </p>
            {tipster.bio && (
              <p className="text-neutral-700 leading-relaxed">{tipster.bio}</p>
            )}
          </div>
          {!isOwnProfile && (
            <FollowButton
              tipsterId={tipster.id}
              isFollowing={tipster.isFollowing ?? false}
              onFollowChange={handleFollowChange}
              size="md"
            />
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold text-primary-600">{tipCount}</p>
              <p className="text-sm text-neutral-600">
                {tipCount === 1 ? 'Tip Published' : 'Tips Published'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">
                Member since{' '}
                {new Date(tipster.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Message */}
      {subscriptionMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          subscriptionMessage.includes('successful')
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`}>
          {subscriptionMessage}
          <button
            onClick={() => setSubscriptionMessage(null)}
            className="ml-2 underline text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Panel */}
      {stats && (
        <div className="mb-8">
          <StatsPanel
            stats={stats}
            period={period}
            onPeriodChange={handlePeriodChange}
            isLoading={isLoadingStats}
          />
        </div>
      )}

      {/* Subscription Offers Section */}
      {!isOwnProfile && accessInfo && accessInfo.availableOffers.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            {accessInfo.hasAccess ? 'Your Subscription' : 'Subscribe for Premium Tips'}
          </h2>

          {accessInfo.hasAccess && accessInfo.activeSubscription ? (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-medium text-green-700">Active Subscription</span>
              </div>
              <p className="text-gray-600">
                Plan: <span className="font-medium">{accessInfo.activeSubscription.offerName}</span>
              </p>
              {accessInfo.activeSubscription.expiresAt && (
                <p className="text-sm text-gray-500">
                  {accessInfo.activeSubscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'}:{' '}
                  {new Date(accessInfo.activeSubscription.expiresAt).toLocaleDateString()}
                </p>
              )}
              <p className="mt-2 text-sm text-green-600">
                You have access to all premium tips from this tipster.
              </p>
            </div>
          ) : (
            <>
              <p className="text-neutral-600 mb-4">
                Get access to {accessInfo.tipCounts.premium} premium tips and all future premium content.
              </p>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accessInfo.availableOffers.map((offer: SubscriptionOffer) => (
                  <div key={offer.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-lg mb-1">{offer.name}</h3>
                    {offer.description && (
                      <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                    )}
                    <div className="mb-3">
                      <span className="text-2xl font-bold text-indigo-600">
                        {formatPrice(offer.price, offer.currency)}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        {getDurationText(offer.duration)}
                      </span>
                    </div>
                    {offer.trialDays && (
                      <p className="text-sm text-blue-600 mb-3">
                        {offer.trialDays} days free trial
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mb-3">
                      {offer.sports.length === 0
                        ? 'All sports included'
                        : `Sports: ${offer.sports.join(', ')}`}
                    </div>
                    <SubscribeButton offer={offer} className="w-full" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Premium Tips Info for non-subscribers */}
      {!isOwnProfile && accessInfo && !accessInfo.hasAccess && accessInfo.tipCounts.premium > 0 && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
          This tipster has {accessInfo.tipCounts.premium} premium tips. Subscribe above to unlock them.
        </div>
      )}

      {/* Tips Section */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Published Tips</h2>

        {tipCount === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
            <p className="text-neutral-600">This tipster hasn't published any tips yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tipster.tips.map((tip) => (
              <PublicTipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}
      </div>
        </div>
      )}
    </Layout>
  );
};
