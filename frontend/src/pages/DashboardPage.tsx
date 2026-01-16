import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { CreateTipsterForm } from '../components/tipster/CreateTipsterForm';
import { CreateTipForm } from '../components/tip/CreateTipForm';
import { MyTips } from '../components/tip/MyTips';
import { tipsterApi } from '../api/tipster.api';
import { statsApi } from '../api/stats.api';
import { Tipster } from '../types/tipster.types';
import { TipsterStats, PeriodFilter } from '../types/stats.types';
import { StatsPanel } from '../components/stats/StatsPanel';

export const DashboardPage = () => {
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
      } catch (err) {
        // User doesn't have a tipster profile yet
        setTipsterProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTipsterProfile();
  }, [refreshKey]);

  const handleTipsterCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTipCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTipResultMarked = () => {
    setRefreshKey((prev) => prev + 1);
    // Re-fetch stats when result is marked
    if (tipsterProfile) {
      fetchStats();
    }
  };

  const handlePeriodChange = (newPeriod: PeriodFilter) => {
    setPeriod(newPeriod);
  };

  // Fetch stats when tipster profile exists
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

  const fetchStats = async () => {
    if (!tipsterProfile) return;

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

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.username}!</h1>
          {tipsterProfile && (
            <p className="mt-2 text-sm text-gray-600">
              Tipster: <span className="font-semibold">{tipsterProfile.displayName}</span>
            </p>
          )}
        </div>

        <div className="space-y-8">
          {!tipsterProfile ? (
            <>
              <CreateTipsterForm onSuccess={handleTipsterCreated} />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Why become a tipster?
                </h3>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>Share your sports betting expertise</li>
                  <li>Build a following of subscribers</li>
                  <li>Track your performance and ROI</li>
                  <li>Help others make informed betting decisions</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white shadow sm:rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Your Tipster Profile
                </h2>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Display Name:</span> {tipsterProfile.displayName}
                </p>
                {tipsterProfile.bio && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Bio:</span> {tipsterProfile.bio}
                  </p>
                )}
              </div>

              {stats && (
                <StatsPanel
                  stats={stats}
                  period={period}
                  onPeriodChange={handlePeriodChange}
                  isLoading={isLoadingStats}
                />
              )}

              <CreateTipForm onSuccess={handleTipCreated} />

              <MyTips key={refreshKey} onResultMarked={handleTipResultMarked} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
