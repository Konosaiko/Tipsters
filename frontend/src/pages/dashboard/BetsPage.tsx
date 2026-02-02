import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TipWithTipster, TipResult } from '../../types/tip.types';
import { tipApi } from '../../api/tip.api';
import { DashboardTipCard } from '../../components/dashboard/DashboardTipCard';

export const BetsPage = () => {
  const [tips, setTips] = useState<TipWithTipster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  const fetchTips = async () => {
    try {
      setIsLoading(true);
      const allTips = await tipApi.getAllTips();
      setTips(allTips);
    } catch {
      setError('Failed to load tips');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const filteredTips = tips.filter((tip) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tip.result === null;
    if (filter === 'won') return tip.result === TipResult.WON;
    if (filter === 'lost') return tip.result === TipResult.LOST;
    return true;
  });

  const stats = {
    total: tips.length,
    pending: tips.filter((t) => t.result === null).length,
    won: tips.filter((t) => t.result === TipResult.WON).length,
    lost: tips.filter((t) => t.result === TipResult.LOST).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">Loading your bets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchTips}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Bets</h1>
          <p className="text-neutral-400 mt-1">
            Manage and track all your published betting tips
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Bet
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border transition-colors ${
            filter === 'all'
              ? 'bg-neutral-800 border-primary-500'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <p className="text-neutral-400 text-sm">All Bets</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`p-4 rounded-xl border transition-colors ${
            filter === 'pending'
              ? 'bg-neutral-800 border-yellow-500'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <p className="text-neutral-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </button>
        <button
          onClick={() => setFilter('won')}
          className={`p-4 rounded-xl border transition-colors ${
            filter === 'won'
              ? 'bg-neutral-800 border-primary-500'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <p className="text-neutral-400 text-sm">Won</p>
          <p className="text-2xl font-bold text-primary-500">{stats.won}</p>
        </button>
        <button
          onClick={() => setFilter('lost')}
          className={`p-4 rounded-xl border transition-colors ${
            filter === 'lost'
              ? 'bg-neutral-800 border-red-500'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <p className="text-neutral-400 text-sm">Lost</p>
          <p className="text-2xl font-bold text-red-500">{stats.lost}</p>
        </button>
      </div>

      {/* Bets List */}
      {filteredTips.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
          {tips.length === 0 ? (
            <>
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">No bets yet</h3>
              <p className="text-neutral-500 mb-6">Start by creating your first betting prediction.</p>
              <Link
                to="/dashboard/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors"
              >
                Create your first bet
              </Link>
            </>
          ) : (
            <>
              <p className="text-neutral-400">No bets match the selected filter.</p>
              <button
                onClick={() => setFilter('all')}
                className="mt-4 text-primary-500 hover:text-primary-400 font-medium"
              >
                Show all bets
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTips.map((tip) => (
            <DashboardTipCard
              key={tip.id}
              tip={tip}
              onUpdate={fetchTips}
              onDelete={fetchTips}
              onResultMarked={fetchTips}
            />
          ))}
        </div>
      )}
    </div>
  );
};
