import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '../../api/stats.api';
import { TopPerformer } from '../../types/stats.types';

/**
 * Top performing tipsters section
 */
export const TopPerformers = () => {
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        setIsLoading(true);
        const data = await statsApi.getTopPerformers('30d', 3);
        setPerformers(data);
      } catch (err) {
        setError('Failed to load top performers');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopPerformers();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Top Performers This Month
        </h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || performers.length === 0) {
    return null; // Don't show if there's an error or no performers
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        🏆 Top Performers This Month
      </h2>

      <div className="space-y-4">
        {performers.map((performer, index) => (
          <Link
            key={performer.tipsterId}
            to={`/tipsters/${performer.tipsterId}`}
            className="block border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-gray-300">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {performer.displayName}
                  </p>
                  <p className="text-xs text-gray-500">@{performer.username}</p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    performer.roi > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {performer.roi > 0 ? '+' : ''}
                  {performer.roi.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {performer.winRate.toFixed(0)}% win •{' '}
                  {performer.settledTips} tips
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <Link
          to="/tipsters"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View All Tipsters →
        </Link>
      </div>
    </div>
  );
};
