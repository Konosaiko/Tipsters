import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { tipsterApi } from '../api/tipster.api';
import { TipsterWithDetails } from '../types/tipster.types';
import { TipsterCard } from '../components/tipster/TipsterCard';

/**
 * Public page displaying all tipsters
 * Users can browse and click to view individual tipster profiles
 */
export const TipstersPage = () => {
  const [tipsters, setTipsters] = useState<TipsterWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTipsters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tipsterApi.getAllTipsters();
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

  return (
    <Layout>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">Loading tipsters...</div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Browse Tipsters
            </h1>
            <p className="text-gray-600">
              Discover expert tipsters and their betting predictions
            </p>
          </div>

          {tipsters.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-2">No tipsters found</p>
              <p className="text-sm text-gray-500">
                Be the first to create a tipster profile!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tipsters.map((tipster) => (
                <TipsterCard
                  key={tipster.id}
                  tipster={tipster}
                  onFollowChange={handleFollowChange}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};
