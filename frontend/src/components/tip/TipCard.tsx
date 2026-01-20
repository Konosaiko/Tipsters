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
        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
          Pending
        </span>
      );
    }

    const colors = {
      [TipResult.WON]: 'bg-green-100 text-green-800',
      [TipResult.LOST]: 'bg-red-100 text-red-800',
      [TipResult.VOID]: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${colors[tip.result]}`}>
        {tip.result}
      </span>
    );
  };

  const potentialReturn = ((tip.odds - 1) * (tip.stake || 1)).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      {/* Tipster Info */}
      <div className="flex items-center mb-4">
        <Link
          to={`/tipsters/${tip.tipster.id}`}
          className="flex items-center hover:underline"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
            {tip.tipster.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{tip.tipster.displayName}</p>
            <p className="text-sm text-gray-600">@{tip.tipster.user.username}</p>
          </div>
        </Link>
        <div className="ml-auto">{getResultBadge()}</div>
      </div>

      {/* Tip Content */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.event}</h3>
        <p className="text-gray-700 font-medium mb-2">
          <span className="text-indigo-600">Prediction:</span> {tip.prediction}
        </p>
        {tip.explanation && (
          <p className="text-gray-600 text-sm mb-3">{tip.explanation}</p>
        )}
      </div>

      {/* Odds & Stake */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Odds</p>
          <p className="text-lg font-bold text-gray-900">{tip.odds.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Stake</p>
          <p className="text-lg font-bold text-gray-900">{tip.stake} {tip.stake === 1 ? 'unit' : 'units'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Potential</p>
          <p className="text-lg font-bold text-green-600">+{potentialReturn}u</p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
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
