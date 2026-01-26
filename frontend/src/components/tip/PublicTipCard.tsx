import { Tip, Sport, TipVisibility } from '../../types/tip.types';
import { TipResultBadge } from './TipResultBadge';
import { Link } from 'react-router-dom';

interface PublicTipCardProps {
  tip: Tip & { tipster?: { id: string; displayName: string } };
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
 * Read-only tip card for public viewing
 * Used on tipster detail page and home page
 * Handles locked state for premium tips
 */
export const PublicTipCard = ({ tip }: PublicTipCardProps) => {
  const isLocked = tip.isLocked;
  const isPremium = tip.visibility === TipVisibility.PREMIUM;

  // Locked premium tip view
  if (isLocked) {
    return (
      <div className="bg-white border border-purple-200 rounded-lg p-4 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            Premium
          </span>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-600">{tip.event}</p>

            {/* Locked content placeholder */}
            <div className="mt-3 p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <p className="font-medium text-purple-800 mb-1">Premium Tip</p>
              <p className="text-sm text-purple-600 mb-3">
                Subscribe to unlock this prediction
              </p>
              {tip.tipster && (
                <Link
                  to={`/tipsters/${tip.tipster.id}`}
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                  View Subscription Options
                </Link>
              )}
            </div>

            {/* Sport & Platform Tags (still visible) */}
            <div className="flex flex-wrap gap-2 mt-3">
              {tip.sport && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {formatSport(tip.sport)}
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-neutral-400">
              {new Date(tip.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Regular tip view
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
      {/* Premium badge for unlocked premium tips */}
      {isPremium && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            Premium ✓
          </span>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary-600">{tip.event}</p>
          <p className="mt-1 text-sm text-neutral-900">
            <span className="font-semibold">Prediction:</span> {tip.prediction}
          </p>
          {tip.explanation && (
            <p className="mt-1 text-sm text-neutral-600">{tip.explanation}</p>
          )}

          {/* Sport & Platform Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {tip.sport && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {formatSport(tip.sport)}
              </span>
            )}
            {tip.platform && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                {tip.platform}
              </span>
            )}
          </div>

          {/* Bet Link Button */}
          {tip.betLink && (
            <div className="mt-2">
              <a
                href={tip.betLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500"
              >
                Quick Bet →
              </a>
            </div>
          )}

          <p className="mt-2 text-xs text-neutral-400">
            {new Date(tip.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2 mt-6">
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-success-100 text-success-800">
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
