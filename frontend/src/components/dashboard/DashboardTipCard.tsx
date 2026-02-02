import { useState } from 'react';
import { TipWithTipster, TipResult, Sport } from '../../types/tip.types';
import { tipApi } from '../../api/tip.api';

interface DashboardTipCardProps {
  tip: TipWithTipster;
  onUpdate?: () => void;
  onDelete?: () => void;
  onResultMarked?: () => void;
}

// Helper to check if tip is pending (result is null)
const isPending = (result: TipResult | null): boolean => result === null;

const formatSport = (sport: Sport): string => {
  const sportNames: Record<Sport, string> = {
    [Sport.FOOTBALL]: 'Football',
    [Sport.BASKETBALL]: 'Basketball',
    [Sport.TENNIS]: 'Tennis',
    [Sport.RUGBY]: 'Rugby',
    [Sport.MMA]: 'MMA',
    [Sport.BOXING]: 'Boxing',
    [Sport.ESPORTS]: 'Esports',
    [Sport.HOCKEY]: 'Hockey',
    [Sport.VOLLEYBALL]: 'Volleyball',
    [Sport.BASEBALL]: 'Baseball',
    [Sport.AMERICAN_FOOTBALL]: 'American Football',
    [Sport.OTHER]: 'Other',
  };
  return sportNames[sport] || sport;
};

export const DashboardTipCard = ({ tip, onDelete, onResultMarked }: DashboardTipCardProps) => {
  const [isMarkingResult, setIsMarkingResult] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMarkResult = async (result: TipResult) => {
    try {
      await tipApi.markTipResult(tip.id, { result });
      setIsMarkingResult(false);
      onResultMarked?.();
    } catch (err) {
      console.error('Failed to mark result:', err);
      alert('Failed to mark result. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tip?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await tipApi.deleteTip(tip.id);
      onDelete?.();
    } catch (err) {
      console.error('Failed to delete tip:', err);
      alert('Failed to delete tip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getResultBadge = () => {
    if (isPending(tip.result)) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
          Pending
        </span>
      );
    }

    const styles: Record<TipResult, string> = {
      [TipResult.WON]: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
      [TipResult.LOST]: 'bg-red-500/10 text-red-500 border-red-500/20',
      [TipResult.VOID]: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[tip.result!]}`}>
        {tip.result}
      </span>
    );
  };

  const potentialReturn = ((tip.odds - 1) * (tip.stake || 1)).toFixed(2);

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{tip.event}</h3>
          <p className="text-primary-400 font-medium">{tip.prediction}</p>
        </div>
        {getResultBadge()}
      </div>

      {tip.explanation && (
        <p className="text-neutral-400 text-sm mb-4">{tip.explanation}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tip.sport && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-300">
            {formatSport(tip.sport)}
          </span>
        )}
        {tip.platform && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-300">
            {tip.platform}
          </span>
        )}
        {tip.visibility === 'PREMIUM' && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
            Premium
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-800/50 rounded-lg mb-4">
        <div>
          <p className="text-xs text-neutral-500 uppercase mb-1">Odds</p>
          <p className="text-lg font-bold text-white">{tip.odds.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase mb-1">Stake</p>
          <p className="text-lg font-bold text-white">{tip.stake}u</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase mb-1">Potential</p>
          <p className="text-lg font-bold text-primary-500">+{potentialReturn}u</p>
        </div>
      </div>

      {/* Bet Link */}
      {tip.betLink && (
        <a
          href={tip.betLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 mb-4 text-sm font-medium text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Bet Link
        </a>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
        <p className="text-xs text-neutral-500">
          {new Date(tip.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mark Result */}
          {onResultMarked && isPending(tip.result) && (
            <>
              {!isMarkingResult ? (
                <button
                  onClick={() => setIsMarkingResult(true)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-400 transition-colors"
                >
                  Mark Result
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMarkResult(TipResult.WON)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-400"
                  >
                    Won
                  </button>
                  <button
                    onClick={() => handleMarkResult(TipResult.LOST)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-400"
                  >
                    Lost
                  </button>
                  <button
                    onClick={() => handleMarkResult(TipResult.VOID)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-600 rounded-lg hover:bg-neutral-500"
                  >
                    Void
                  </button>
                  <button
                    onClick={() => setIsMarkingResult(false)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg hover:bg-neutral-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
