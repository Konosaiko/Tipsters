import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { tipApi } from '../api/tip.api';
import { TipWithTipster } from '../types/tip.types';
import { TipCard } from '../components/tip/TipCard';
import { useAuth } from '../context/AuthContext';

type FeedFilter = 'all' | 'following';

/**
 * Tips Feed Page
 * Shows all tips or only tips from followed tipsters
 */
export const TipsFeedPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tips, setTips] = useState<TipWithTipster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FeedFilter>('all');

  const fetchTips = async (newFilter: FeedFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tipApi.getTipsFeed(newFilter);
      setTips(data);
    } catch (err: any) {
      if (err.response?.status === 401 && newFilter === 'following') {
        setError(t('tipsFeed.loginToViewFollowing'));
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load tips');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTips(filter);
  }, [filter]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {filter === 'following' ? t('tipsFeed.following') : t('tipsFeed.discoverTips')}
          </h1>
          <p className="text-neutral-400">
            {filter === 'following'
              ? t('tipsFeed.tipsFromFollowing')
              : t('tipsFeed.latestPredictions')}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-neutral-800">
          <div className="flex space-x-1">
            <button
              onClick={() => setFilter('all')}
              className={`pb-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                filter === 'all'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-600'
              }`}
            >
              {t('tipsFeed.allTips')}
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`pb-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                filter === 'following'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-600'
              }`}
            >
              {t('tipsFeed.followingTab')}
              {!user && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded">
                  {t('tipsFeed.loginRequired')}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-neutral-400">{t('tipsFeed.loadingTips')}</div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : tips.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
            <p className="text-neutral-400 mb-2">
              {filter === 'following'
                ? t('tipsFeed.noFollowedTipsters')
                : t('tipsFeed.noTipsFound')}
            </p>
            {filter === 'following' && (
              <a
                href="/tipsters"
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                {t('tipsFeed.browseTipsters')}
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
