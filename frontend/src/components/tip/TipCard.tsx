import { Link } from 'react-router-dom';
import { useState } from 'react';
import { TipWithTipster, TipResult, Sport } from '../../types/tip.types';
import { tipApi } from '../../api/tip.api';

interface TipCardProps {
  tip: TipWithTipster;
  onUpdate?: () => void;
  onDelete?: () => void;
  onResultMarked?: () => void;
}

/**
 * Helper to format sport name for display
 */
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

/**
 * Card component to display a single tip in the feed
 */
export const TipCard = ({ tip, onUpdate, onDelete, onResultMarked }: TipCardProps) => {
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
    if (!tip.result) {
      return (
        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }

    const colors = {
      [TipResult.WON]: 'bg-success-100 text-success-800',
      [TipResult.LOST]: 'bg-red-100 text-red-800',
      [TipResult.VOID]: 'bg-neutral-100 text-neutral-800',
    };

    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${colors[tip.result]}`}>
        {tip.result}
      </span>
    );
  };

  const potentialReturn = ((tip.odds - 1) * (tip.stake || 1)).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-neutral-200">
      {/* Tipster Info */}
      <div className="flex items-center mb-4">
        <Link
          to={`/tipsters/${tip.tipster.id}`}
          className="flex items-center hover:underline"
        >
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold mr-3">
            {tip.tipster.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-neutral-900">{tip.tipster.displayName}</p>
            <p className="text-sm text-neutral-600">@{tip.tipster.user.username}</p>
          </div>
        </Link>
        <div className="ml-auto">{getResultBadge()}</div>
      </div>

      {/* Tip Content */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-neutral-900 mb-2">{tip.event}</h3>
        <p className="text-neutral-700 font-medium mb-2">
          <span className="text-primary-600">Prediction:</span> {tip.prediction}
        </p>
        {tip.explanation && (
          <p className="text-neutral-600 text-sm mb-3">{tip.explanation}</p>
        )}

        {/* Sport & Platform Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {tip.sport && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {formatSport(tip.sport)}
            </span>
          )}
          {tip.platform && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
              {tip.platform}
            </span>
          )}
        </div>

        {/* Bet Link Button */}
        {tip.betLink && (
          <div className="mt-3">
            <a
              href={tip.betLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500"
            >
              Quick Bet →
            </a>
          </div>
        )}
      </div>

      {/* Odds & Stake */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg">
        <div>
          <p className="text-xs text-neutral-500 uppercase mb-1">Odds</p>
          <p className="text-lg font-bold text-neutral-900">{tip.odds.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase mb-1">Stake</p>
          <p className="text-lg font-bold text-neutral-900">{tip.stake} {tip.stake === 1 ? 'unit' : 'units'}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase mb-1">Potential</p>
          <p className="text-lg font-bold text-success-500">+{potentialReturn}u</p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          {new Date(tip.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Owner Actions - Only show if callbacks provided */}
      {(onResultMarked || onDelete) && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex flex-wrap gap-2">
            {/* Mark Result - Only if tip not already settled */}
            {onResultMarked && !tip.result && (
              <>
                {!isMarkingResult ? (
                  <button
                    onClick={() => setIsMarkingResult(true)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Mark Result
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkResult(TipResult.WON)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-success-600 rounded-md hover:bg-success-700"
                    >
                      Won
                    </button>
                    <button
                      onClick={() => handleMarkResult(TipResult.LOST)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Lost
                    </button>
                    <button
                      onClick={() => handleMarkResult(TipResult.VOID)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-600 rounded-md hover:bg-neutral-700"
                    >
                      Void
                    </button>
                    <button
                      onClick={() => setIsMarkingResult(false)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
