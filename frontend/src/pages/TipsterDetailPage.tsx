import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { tipsterApi } from '../api/tipster.api';
import { statsApi } from '../api/stats.api';
import { TipsterWithDetails } from '../types/tipster.types';
import { TipsterStats, PeriodFilter } from '../types/stats.types';
import { PublicTipCard } from '../components/tip/PublicTipCard';
import { StatsPanel } from '../components/stats/StatsPanel';
import { TipResultBadge } from '../components/tip/TipResultBadge';
import { FollowButton } from '../components/follow/FollowButton';

/**
 * Page displaying a single tipster's profile and all their tips
 * Accessible to all users (public)
 */
export const TipsterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [tipster, setTipster] = useState<TipsterWithDetails | null>(null);
  const [stats, setStats] = useState<TipsterStats | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Layout>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="className="text-neutral-600">Loading tipster...</div>
        </div>
      ) : error || !tipster ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Tipster not found'}
          </div>
          <Link
            to="/tipsters"
            className="className="mt-4 inline-block text-primary-600 hover:text-primary-800"
          >
            ← Back to all tipsters
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/tipsters"
        className="className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
      >
        ← Back to all tipsters
      </Link>

      {/* Tipster Profile Card */}
      <div className="className="bg-white rounded-lg shadow-md p-6 mb-8 border border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="className="text-3xl font-bold text-neutral-900 mb-2">
              {tipster.displayName}
            </h1>
            <p className="className="text-neutral-600 mb-2">@{tipster.user.username}</p>
            <p className="className="text-sm text-neutral-500 mb-4">
              {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
            </p>
            {tipster.bio && (
              <p className="className="text-neutral-700 leading-relaxed">{tipster.bio}</p>
            )}
          </div>
          <FollowButton
            tipsterId={tipster.id}
            isFollowing={tipster.isFollowing ?? false}
            onFollowChange={handleFollowChange}
            size="md"
          />
        </div>

        <div className="className="mt-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-6">
            <div>
              <p className="className="text-3xl font-bold text-primary-600">{tipCount}</p>
              <p className="className="text-sm text-neutral-600">
                {tipCount === 1 ? 'Tip Published' : 'Tips Published'}
              </p>
            </div>
            <div>
              <p className="className="text-sm text-neutral-600">
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

      {/* Tips Section */}
      <div>
        <h2 className="className="text-2xl font-bold text-neutral-900 mb-4">Published Tips</h2>

        {tipCount === 0 ? (
          <div className="className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
            <p className="className="text-neutral-600">This tipster hasn't published any tips yet</p>
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
