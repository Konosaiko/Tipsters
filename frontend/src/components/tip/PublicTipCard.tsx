import { Tip } from '../../types/tip.types';

interface PublicTipCardProps {
  tip: Tip;
}

/**
 * Read-only tip card for public viewing
 * Used on tipster detail page and home page
 */
export const PublicTipCard = ({ tip }: PublicTipCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">{tip.event}</p>
          <p className="mt-1 text-sm text-gray-900">
            <span className="font-semibold">Prediction:</span> {tip.prediction}
          </p>
          {tip.explanation && (
            <p className="mt-1 text-sm text-gray-600">{tip.explanation}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {new Date(tip.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="ml-4">
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
            @{tip.odds}
          </span>
        </div>
      </div>
    </div>
  );
};
