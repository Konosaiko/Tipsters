import { useState, useEffect } from 'react';
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
        setError('Please log in to view your following feed');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {filter === 'following' ? 'Following' : 'Discover Tips'}
          </h1>
          <p className="text-gray-600">
            {filter === 'following'
              ? 'Tips from tipsters you follow'
              : 'Latest predictions from expert tipsters'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === 'all'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Tips
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === 'following'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Following
              {!user && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                  Login required
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-600">Loading tips...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : tips.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-2">
              {filter === 'following'
                ? "You haven't followed any tipsters yet"
                : 'No tips found'}
            </p>
            {filter === 'following' && (
              <a
                href="/tipsters"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Browse tipsters to follow
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
