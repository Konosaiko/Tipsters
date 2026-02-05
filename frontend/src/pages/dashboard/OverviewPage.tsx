import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { tipsterApi } from '../../api/tipster.api';
import { statsApi } from '../../api/stats.api';
import {
  getMySubscriptions,
  Subscription,
  getStatusColor,
  formatStatus,
} from '../../api/subscription.api';
import { formatPrice, getDurationText } from '../../api/offer.api';
import { Tipster } from '../../types/tipster.types';
import { TipsterStats, PeriodFilter } from '../../types/stats.types';
import { DashboardStatCard } from '../../components/dashboard/DashboardStatCard';
import { DashboardPeriodFilter } from '../../components/dashboard/DashboardPeriodFilter';
import { CreateTipsterForm } from '../../components/tipster/CreateTipsterForm';

export const OverviewPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tipsterProfile, setTipsterProfile] = useState<Tipster | null>(null);
  const [stats, setStats] = useState<TipsterStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTipsterProfile = async () => {
      try {
        const profile = await tipsterApi.getMyTipsterProfile();
        setTipsterProfile(profile);
      } catch {
        setTipsterProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTipsterProfile();
  }, [refreshKey]);

  // Fetch user subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subs = await getMySubscriptions();
        setSubscriptions(subs);
      } catch (err) {
        console.error('Failed to load subscriptions:', err);
        setSubscriptions([]);
      }
    };

    fetchSubscriptions();
  }, [refreshKey]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!tipsterProfile) {
        setStats(null);
        return;
      }

      try {
        setIsLoadingStats(true);
        const data = await statsApi.getTipsterStats(tipsterProfile.id, period);
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [tipsterProfile, period, refreshKey]);

  const handleTipsterCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">{t('common.loading')}</div>
      </div>
    );
  }

  // Show create tipster form if no profile
  if (!tipsterProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('dashboard.welcome')} {user?.username}!
          </h1>
          <p className="text-neutral-400">
            {t('overview.createProfilePrompt')}
          </p>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <CreateTipsterForm onSuccess={handleTipsterCreated} darkMode />
        </div>

        <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary-400 mb-3">
            {t('dashboard.whyBecomeTipster')}
          </h3>
          <ul className="space-y-2 text-neutral-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              {t('dashboard.shareExpertise')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              {t('dashboard.buildFollowing')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              {t('dashboard.trackPerformance')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              {t('dashboard.earnMoney')}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const roiTrend = (stats?.roi ?? 0) > 0 ? 'up' : (stats?.roi ?? 0) < 0 ? 'down' : 'neutral';
  const profitTrend = (stats?.profit ?? 0) > 0 ? 'up' : (stats?.profit ?? 0) < 0 ? 'down' : 'neutral';
  const winRateTrend = (stats?.winRate ?? 0) >= 50 ? 'up' : 'neutral';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t('overview.welcomeBack')} {tipsterProfile.displayName}!
          </h1>
          <p className="text-neutral-400 mt-1">
            {t('overview.performanceOverview')}
          </p>
        </div>
        <DashboardPeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Stats Loading State */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 animate-pulse">
              <div className="h-4 bg-neutral-800 rounded w-20 mb-3" />
              <div className="h-8 bg-neutral-800 rounded w-24" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Primary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatCard
              label={t('overview.totalRoi')}
              value={`${(stats.roi ?? 0) >= 0 ? '+' : ''}${(stats.roi ?? 0).toFixed(2)}%`}
              trend={roiTrend}
              icon="chart"
            />
            <DashboardStatCard
              label={t('overview.winRate')}
              value={`${(stats.winRate ?? 0).toFixed(1)}%`}
              trend={winRateTrend}
              icon="target"
            />
            <DashboardStatCard
              label={t('overview.profitLoss')}
              value={`${(stats.profit ?? 0) >= 0 ? '+' : ''}${(stats.profit ?? 0).toFixed(2)}u`}
              trend={profitTrend}
              icon="money"
            />
            <DashboardStatCard
              label={t('overview.totalBets')}
              value={stats.totalTips.toString()}
              icon="bets"
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown Card */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('overview.resultsBreakdown')}</h3>

              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="h-3 bg-neutral-800 rounded-full overflow-hidden flex">
                  {stats.settledTips > 0 && (
                    <>
                      <div
                        className="bg-primary-500 h-full transition-all duration-500"
                        style={{ width: `${(stats.wonTips / stats.settledTips) * 100}%` }}
                      />
                      <div
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{ width: `${(stats.lostTips / stats.settledTips) * 100}%` }}
                      />
                      {stats.voidTips > 0 && (
                        <div
                          className="bg-neutral-600 h-full transition-all duration-500"
                          style={{ width: `${(stats.voidTips / stats.settledTips) * 100}%` }}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary-500 rounded" />
                    <span className="text-neutral-400">{t('overview.won')}</span>
                    <span className="text-white font-semibold ml-auto">{stats.wonTips}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-neutral-400">{t('overview.lost')}</span>
                    <span className="text-white font-semibold ml-auto">{stats.lostTips}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-neutral-600 rounded" />
                    <span className="text-neutral-400">{t('overview.void')}</span>
                    <span className="text-white font-semibold ml-auto">{stats.voidTips}</span>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-500 text-sm">{t('overview.pending')}</p>
                    <p className="text-xl font-semibold text-white">{stats.pendingTips}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-sm">{t('overview.avgOdds')}</p>
                    <p className="text-xl font-semibold text-white">{(stats.averageOdds ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Streaks Card */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('overview.performanceStreaks')}</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-400">{t('overview.longestWinStreak')}</span>
                    <span className="text-2xl font-bold text-primary-500">
                      {stats.longestWinStreak}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.longestWinStreak / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-400">{t('overview.longestLoseStreak')}</span>
                    <span className="text-2xl font-bold text-red-500">
                      {stats.longestLoseStreak}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.longestLoseStreak / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Yield */}
                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">{t('overview.yield')}</span>
                    <span className={`text-xl font-bold ${(stats.yield ?? 0) >= 0 ? 'text-primary-500' : 'text-red-500'}`}>
                      {(stats.yield ?? 0) >= 0 ? '+' : ''}{(stats.yield ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8 text-center">
          <p className="text-neutral-400 mb-4">{t('overview.noStatsYet')}</p>
          <Link
            to="/dashboard/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors"
          >
            {t('overview.createFirstBet')}
          </Link>
        </div>
      )}

      {/* My Subscriptions Section */}
      {subscriptions.length > 0 && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{t('dashboard.mySubscriptions')}</h3>
            <Link
              to="/dashboard/premium"
              className="text-primary-500 hover:text-primary-400 text-sm font-medium"
            >
              {t('overview.manageSubscriptions')} →
            </Link>
          </div>

          <div className="space-y-3">
            {subscriptions.slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-500/10 rounded-full flex items-center justify-center">
                    <span className="text-primary-500 font-bold text-sm">
                      {sub.offer.tipster.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <Link
                      to={`/tipsters/${sub.offer.tipster.id}`}
                      className="font-medium text-white hover:text-primary-400"
                    >
                      {sub.offer.tipster.displayName}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-neutral-400">{sub.offer.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(sub.status)}`}>
                        {formatStatus(sub.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">
                      {formatPrice(sub.offer.price, sub.offer.currency)}
                      {getDurationText(sub.offer.duration)}
                    </p>
                    {sub.currentPeriodEnd && (
                      <p className="text-xs text-neutral-500">
                        {sub.cancelAtPeriodEnd ? t('premium.endsOn') : t('premium.renewsOn')}{' '}
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Link
                    to="/dashboard/premium"
                    className="px-3 py-1.5 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors"
                  >
                    {t('tipsterDetail.manageSubscription')}
                  </Link>
                </div>
              </div>
            ))}

            {subscriptions.length > 3 && (
              <Link
                to="/dashboard/premium"
                className="block text-center py-3 text-primary-500 hover:text-primary-400 text-sm font-medium"
              >
                {t('common.view')} {subscriptions.length - 3} {t('overview.moreSubscriptions')} →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/create"
          className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 hover:border-primary-500/50 transition-colors group"
        >
          <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h4 className="text-white font-semibold mb-1">{t('overview.createNewBet')}</h4>
          <p className="text-neutral-500 text-sm">{t('overview.shareNewPrediction')}</p>
        </Link>

        <Link
          to="/dashboard/bets"
          className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 hover:border-primary-500/50 transition-colors group"
        >
          <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h4 className="text-white font-semibold mb-1">{t('overview.viewAllBets')}</h4>
          <p className="text-neutral-500 text-sm">{t('overview.managePublishedTips')}</p>
        </Link>

        <Link
          to="/dashboard/premium"
          className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 hover:border-primary-500/50 transition-colors group"
        >
          <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h4 className="text-white font-semibold mb-1">{t('overview.premiumSettings')}</h4>
          <p className="text-neutral-500 text-sm">{t('overview.manageSubscriptions')}</p>
        </Link>
      </div>
    </div>
  );
};
