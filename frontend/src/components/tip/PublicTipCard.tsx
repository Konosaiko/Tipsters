import { Tip } from '../../types/tip.types';
import { TipResultBadge } from './TipResultBadge';

interface PublicTipCardProps {
  tip: Tip;
}

/**
 * Read-only tip card for public viewing
 * Used on tipster detail page and home page
 */
export const PublicTipCard = ({ tip }: PublicTipCardProps) => {
  return (
    <div className="className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="className="text-sm font-medium text-primary-600">{tip.event}</p>
          <p className="className="mt-1 text-sm text-neutral-900">
            <span className="font-semibold">Prediction:</span> {tip.prediction}
          </p>
          {tip.explanation && (
            <p className="className="mt-1 text-sm text-neutral-600">{tip.explanation}</p>
          )}
          <p className="className="mt-2 text-xs text-neutral-400">
            {new Date(tip.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <span className="className="px-3 py-1 text-sm font-semibold rounded-full bg-success-100 text-success-800">
            @{tip.odds}
          </span>
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
            {tip.stake}u
          </span>
          <TipResultBadge result={tip.result} />
        </div>
      </div>
    </div>
  );
};
