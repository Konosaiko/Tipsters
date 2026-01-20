import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { tipApi } from '../api/tip.api';
import { TipWithTipster } from '../types/tip.types';
import { TopPerformers } from '../components/stats/TopPerformers';

export const HomePage = () => {
  const [tips, setTips] = useState<TipWithTipster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const data = await tipApi.getAllTips();
        setTips(data);
      } catch (err) {
        setError('Failed to load tips');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTips();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-neutral-900 sm:text-5xl">
            Welcome to TipsterPro
          </h1>
          <p className="mt-4 text-xl text-neutral-600">
            Get expert sports betting tips from verified tipsters
          </p>
        </div>

        <div className="mb-8">
          <TopPerformers />
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-neutral-900">Recent Tips</h2>
          </div>

          {isLoading ? (
            <div className="px-4 py-5 sm:p-6 text-center text-neutral-500">Loading tips...</div>
          ) : error ? (
            <div className="px-4 py-5 sm:p-6 text-center text-red-500">{error}</div>
          ) : tips.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center text-neutral-500">
              No tips yet. Be the first to publish!
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {tips.map((tip) => (
                <li key={tip.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-primary-600">{tip.event}</p>
                        <span className="text-neutral-400">•</span>
                        <Link
                          to={`/tipsters/${tip.tipster.id}`}
                          className="text-sm text-neutral-600 hover:text-primary-600"
                        >
                          by {tip.tipster.displayName}
                        </Link>
                      </div>
                      <p className="mt-1 text-sm text-neutral-900">
                        <span className="font-semibold">Prediction:</span> {tip.prediction}
                      </p>
                      {tip.explanation && (
                        <p className="mt-1 text-sm text-neutral-500">{tip.explanation}</p>
                      )}
                      <p className="mt-2 text-xs text-neutral-400">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                        @{tip.odds}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};
