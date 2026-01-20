import { Link } from 'react-router-dom';
import { TipWithTipster, TipResult } from '../../types/tip.types';

interface TipCardProps {
  tip: TipWithTipster;
}

/**
 * Card component to display a single tip in the feed
 */
export const TipCard = ({ tip }: TipCardProps) => {
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
    </div>
  );
};
