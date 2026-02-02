import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { tipsterApi } from '../../api/tipster.api';
import { statsApi } from '../../api/stats.api';
import { Tipster } from '../../types/tipster.types';
import { TipsterStats, PeriodFilter } from '../../types/stats.types';
import { DashboardStatCard } from '../../components/dashboard/DashboardStatCard';
import { DashboardPeriodFilter } from '../../components/dashboard/DashboardPeriodFilter';
import { CreateTipsterForm } from '../../components/tipster/CreateTipsterForm';

export const OverviewPage = () => {
  const { user } = useAuth();
  const [tipsterProfile, setTipsterProfile] = useState<Tipster | null>(null);
  const [stats, setStats] = useState<TipsterStats | null>(null);
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
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  // Show create tipster form if no profile
  if (!tipsterProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome, {user?.username}!
          </h1>
          <p className="text-neutral-400">
            Create your tipster profile to start sharing your betting expertise.
          </p>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <CreateTipsterForm onSuccess={handleTipsterCreated} darkMode />
        </div>

        <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary-400 mb-3">
            Why become a tipster?
          </h3>
          <ul className="space-y-2 text-neutral-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              Share your sports betting expertise
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              Build a following of subscribers
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              Track your performance and ROI
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              Earn money from premium subscriptions
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
            Welcome back, {tipsterProfile.displayName}!
          </h1>
          <p className="text-neutral-400 mt-1">
            Here's an overview of your performance
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
              label="Total ROI"
              value={`${(stats.roi ?? 0) >= 0 ? '+' : ''}${(stats.roi ?? 0).toFixed(2)}%`}
              trend={roiTrend}
              icon="chart"
            />
            <DashboardStatCard
              label="Win Rate"
              value={`${(stats.winRate ?? 0).toFixed(1)}%`}
              trend={winRateTrend}
              icon="target"
            />
            <DashboardStatCard
              label="Profit/Loss"
              value={`${(stats.profit ?? 0) >= 0 ? '+' : ''}${(stats.profit ?? 0).toFixed(2)}u`}
              trend={profitTrend}
              icon="money"
            />
            <DashboardStatCard
              label="Total Bets"
              value={stats.totalTips.toString()}
              icon="bets"
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown Card */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Results Breakdown</h3>

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
                    <span className="text-neutral-400">Won</span>
                    <span className="text-white font-semibold ml-auto">{stats.wonTips}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-neutral-400">Lost</span>
                    <span className="text-white font-semibold ml-auto">{stats.lostTips}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-neutral-600 rounded" />
                    <span className="text-neutral-400">Void</span>
                    <span className="text-white font-semibold ml-auto">{stats.voidTips}</span>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-500 text-sm">Pending</p>
                    <p className="text-xl font-semibold text-white">{stats.pendingTips}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-sm">Avg Odds</p>
                    <p className="text-xl font-semibold text-white">{(stats.averageOdds ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Streaks Card */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Streaks</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-400">Longest Win Streak</span>
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
                    <span className="text-neutral-400">Longest Lose Streak</span>
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
                    <span className="text-neutral-400">Yield</span>
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
          <p className="text-neutral-400 mb-4">No statistics available yet.</p>
          <Link
            to="/dashboard/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors"
          >
            Create your first bet
          </Link>
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
          <h4 className="text-white font-semibold mb-1">Create New Bet</h4>
          <p className="text-neutral-500 text-sm">Share a new betting prediction</p>
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
          <h4 className="text-white font-semibold mb-1">View All Bets</h4>
          <p className="text-neutral-500 text-sm">Manage your published tips</p>
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
          <h4 className="text-white font-semibold mb-1">Premium Settings</h4>
          <p className="text-neutral-500 text-sm">Manage subscriptions & offers</p>
        </Link>
      </div>
    </div>
  );
};
