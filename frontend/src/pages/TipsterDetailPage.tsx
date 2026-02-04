import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { tipsterApi } from '../api/tipster.api';
import { statsApi } from '../api/stats.api';
import { TipsterWithDetails } from '../types/tipster.types';
import { TipsterStats, PeriodFilter } from '../types/stats.types';
import { PublicTipCard } from '../components/tip/PublicTipCard';
import { StatsPanel } from '../components/stats/StatsPanel';
import { FollowButton } from '../components/follow/FollowButton';
import { useAuth } from '../context/AuthContext';
import { getTipsterAccess, TipsterAccessSummary, syncSubscription } from '../api/subscription.api';
import { SubscriptionOffer, formatPrice, getDurationText } from '../api/offer.api';
import { SubscribeButton } from '../components/SubscribeButton';

/**
 * Page displaying a single tipster's profile and all their tips
 * Accessible to all users (public)
 */
export const TipsterDetailPage = () => {
  const { t } = useTranslation();
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
    if (subscriptionStatus === 'success' && id && user) {
      // Sync subscription from Stripe (for dev without webhooks)
      syncSubscription(id)
        .then(() => {
          // Refresh access info
          return getTipsterAccess(id);
        })
        .then((data) => {
          setAccessInfo(data);
          setSubscriptionMessage(t('tipsterDetail.subscriptionSuccess'));
        })
        .catch((err) => {
          console.error('Failed to sync subscription:', err);
          setSubscriptionMessage(t('tipsterDetail.subscriptionRefreshing'));
        });
    } else if (subscriptionStatus === 'cancelled') {
      setSubscriptionMessage(t('tipsterDetail.subscriptionCancelled'));
    }
  }, [searchParams, id, user, t]);

  // Fetch tipster profile
  useEffect(() => {
    const fetchTipster = async () => {
      if (!id) {
        setError(t('tipsterDetail.invalidTipsterId'));
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
          err instanceof Error ? err.message : t('tipsterDetail.failedToLoad')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTipster();
  }, [id, t]);

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
          <div className="text-neutral-400">{t('tipsterDetail.loadingTipster')}</div>
        </div>
      ) : error || !tipster ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
            {error || 'Tipster not found'}
          </div>
          <Link
            to="/tipsters"
            className="mt-4 inline-block text-primary-500 hover:text-primary-400"
          >
            {t('tipsterDetail.backToAll')}
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/tipsters"
        className="inline-flex items-center text-primary-500 hover:text-primary-400 mb-6"
      >
        {t('tipsterDetail.backToAll')}
      </Link>

      {/* Tipster Profile Card */}
      <div className="bg-neutral-900 rounded-lg p-6 mb-8 border border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {tipster.displayName}
            </h1>
            <p className="text-neutral-400 mb-2">@{tipster.user.username}</p>
            <p className="text-sm text-neutral-500 mb-4">
              {followerCount} {followerCount === 1 ? t('common.follower') : t('common.follower_plural')}
            </p>
            {tipster.bio && (
              <p className="text-neutral-300 leading-relaxed">{tipster.bio}</p>
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

        <div className="mt-6 pt-6 border-t border-neutral-800">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold text-primary-500">{tipCount}</p>
              <p className="text-sm text-neutral-400">
                {tipCount === 1 ? t('tipsterDetail.tipPublished') : t('tipsterDetail.tipsPublished')}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">
                {t('tipsterDetail.memberSince')}{' '}
                {new Date(tipster.createdAt).toLocaleDateString('fr-FR', {
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
          subscriptionMessage.includes('succès') || subscriptionMessage.includes('réussi')
            ? 'bg-green-900/20 border border-green-800 text-green-400'
            : 'bg-yellow-900/20 border border-yellow-800 text-yellow-400'
        }`}>
          {subscriptionMessage}
          <button
            onClick={() => setSubscriptionMessage(null)}
            className="ml-2 underline text-sm"
          >
            {t('common.dismiss')}
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
        <div className="mb-8 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-800/50 p-6">
          <h2 className="text-xl font-bold text-white mb-2">
            {accessInfo.hasAccess ? t('tipsterDetail.yourSubscription') : t('tipsterDetail.subscribeForPremium')}
          </h2>

          {accessInfo.hasAccess && accessInfo.activeSubscription ? (
            <div className="bg-neutral-900 rounded-lg p-4 border border-green-800/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-medium text-green-400">{t('tipsterDetail.activeSubscription')}</span>
              </div>
              <p className="text-neutral-300">
                {t('tipsterDetail.plan')} <span className="font-medium">{accessInfo.activeSubscription.offerName}</span>
              </p>
              {accessInfo.activeSubscription.expiresAt && (
                <p className="text-sm text-neutral-400">
                  {accessInfo.activeSubscription.cancelAtPeriodEnd ? t('tipsterDetail.ends') : t('tipsterDetail.renews')}{' '}
                  {new Date(accessInfo.activeSubscription.expiresAt).toLocaleDateString('fr-FR')}
                </p>
              )}
              <p className="mt-2 text-sm text-green-400">
                {t('tipsterDetail.accessAllPremium')}
              </p>
              {/* Manage Subscription Button */}
              <Link
                to="/dashboard/premium"
                className="mt-4 inline-flex items-center px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium"
              >
                {t('tipsterDetail.manageSubscription')}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-neutral-400 mb-4">
                {t('tipsterDetail.getAccessTo')} {accessInfo.tipCounts.premium} {t('tipsterDetail.premiumTipsAndFuture')}
              </p>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accessInfo.availableOffers.map((offer: SubscriptionOffer) => (
                  <div key={offer.id} className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                    <h3 className="font-semibold text-lg text-white mb-1">{offer.name}</h3>
                    {offer.description && (
                      <p className="text-sm text-neutral-400 mb-3">{offer.description}</p>
                    )}
                    <div className="mb-3">
                      <span className="text-2xl font-bold text-primary-500">
                        {formatPrice(offer.price, offer.currency)}
                      </span>
                      <span className="text-neutral-400 text-sm ml-1">
                        {getDurationText(offer.duration)}
                      </span>
                    </div>
                    {offer.trialDays && (
                      <p className="text-sm text-blue-400 mb-3">
                        {offer.trialDays} {t('tipsterDetail.daysFreeTrial')}
                      </p>
                    )}
                    <div className="text-xs text-neutral-500 mb-3">
                      {offer.sports.length === 0
                        ? t('tipsterDetail.allSportsIncluded')
                        : `${t('tipsterDetail.sports')} ${offer.sports.join(', ')}`}
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
        <div className="mb-4 p-3 bg-purple-900/20 border border-purple-800/50 rounded-lg text-sm text-purple-400">
          {t('tipsterDetail.tipsterHas')} {accessInfo.tipCounts.premium} {t('tipsterDetail.premiumTipsSubscribe')}
        </div>
      )}

      {/* Tips Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">{t('tipsterDetail.publishedTips')}</h2>

        {tipCount === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
            <p className="text-neutral-400">{t('tipsterDetail.noTipsYet')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tipster.tips?.map((tip) => (
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
