import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { tipsterApi } from '../api/tipster.api';
import { TipsterWithDetails } from '../types/tipster.types';
import { TipsterCard } from '../components/tipster/TipsterCard';
import { useAuth } from '../context/AuthContext';

/**
 * Public page displaying all tipsters
 * Users can browse and click to view individual tipster profiles
 */
type SortOption = 'newest' | 'followers' | 'tips';

export const TipstersPage = () => {
  const { user } = useAuth();
  const [tipsters, setTipsters] = useState<TipsterWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const fetchTipsters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tipsterApi.getAllTipsters();
      console.log('Fetched tipsters:', data.map(t => ({
        name: t.displayName,
        id: t.id,
        isFollowing: t.isFollowing,
      })));
      setTipsters(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load tipsters'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTipsters();
  }, []);

  const handleFollowChange = () => {
    // Refetch all tipsters to update follower counts
    fetchTipsters();
  };

  // Filter and sort tipsters
  const filteredAndSortedTipsters = tipsters
    .filter((tipster) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        tipster.displayName.toLowerCase().includes(query) ||
        tipster.user.username.toLowerCase().includes(query) ||
        tipster.bio?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'followers') {
        return (b.followerCount || 0) - (a.followerCount || 0);
      }
      if (sortBy === 'tips') {
        return (b._count?.tips || 0) - (a._count?.tips || 0);
      }
      // Default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <Layout>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="className="text-neutral-600">Loading tipsters...</div>
        </div>
      ) : error ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="className="text-3xl font-bold text-neutral-900 mb-2">
              Browse Tipsters
            </h1>
            <p className="className="text-neutral-600">
              Discover expert tipsters and their betting predictions
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, username, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="className="className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="className="className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="followers">Most Followers</option>
                <option value="tips">Most Tips</option>
              </select>
            </div>
          </div>

          {filteredAndSortedTipsters.length === 0 && tipsters.length > 0 ? (
            <div className="className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
              <p className="className="text-neutral-600 mb-2">No tipsters match your search</p>
              <button
                onClick={() => setSearchQuery('')}
                className="className="text-sm text-primary-600 hover:text-primary-800"
              >
                Clear search
              </button>
            </div>
          ) : tipsters.length === 0 ? (
            <div className="className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
              <p className="className="text-neutral-600 mb-2">No tipsters found</p>
              <p className="className="text-sm text-neutral-500">
                Be the first to create a tipster profile!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedTipsters.map((tipster) => (
                <TipsterCard
                  key={tipster.id}
                  tipster={tipster}
                  onFollowChange={handleFollowChange}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};
