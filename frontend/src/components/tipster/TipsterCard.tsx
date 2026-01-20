import { Link } from 'react-router-dom';
import { TipsterWithDetails } from '../../types/tipster.types';
import { TipResult } from '../../types/tip.types';
import { FollowButton } from '../follow/FollowButton';

interface TipsterCardProps {
  tipster: TipsterWithDetails;
  onFollowChange?: () => void;
  currentUserId?: string;
}

/**
 * Card component to display tipster summary
 * Used in TipstersPage to list all tipsters
 */
export const TipsterCard = ({ tipster, onFollowChange, currentUserId }: TipsterCardProps) => {
  const tipCount = tipster._count?.tips ?? 0;
  const followerCount = tipster.followerCount ?? 0;

  // Debug logging
  console.log('TipsterCard:', {
    tipsterName: tipster.displayName,
    tipsterUserId: tipster.userId,
    currentUserId,
    shouldShowButton: currentUserId !== tipster.userId,
  });

  // Calculate basic stats from tips
  const tips = tipster.tips || [];
  const settledTips = tips.filter((t) => t.result !== null);
  const wonTips = tips.filter((t) => t.result === TipResult.WON);
  const voidTips = tips.filter((t) => t.result === TipResult.VOID);

  // Calculate win rate (excluding void tips)
  const settledExcludingVoid = settledTips.length - voidTips.length;
  const winRate =
    settledExcludingVoid > 0
      ? Math.round((wonTips.length / settledExcludingVoid) * 100)
      : null;

  // Calculate ROI
  let roi: number | null = null;
  if (settledTips.length > 0) {
    let totalStake = 0;
    let totalReturns = 0;

    settledTips.forEach((tip) => {
      const stake = tip.stake || 1;
      totalStake += stake;

      if (tip.result === TipResult.WON) {
        totalReturns += stake * tip.odds;
      } else if (tip.result === TipResult.VOID) {
        totalReturns += stake;
      }
    });

    roi = totalStake > 0 ? Math.round(((totalReturns - totalStake) / totalStake) * 10000) / 100 : null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <Link to={`/tipsters/${tipster.id}`} className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600">
            {tipster.displayName}
          </h3>
          <p className="text-sm text-gray-600 mb-1">@{tipster.user.username}</p>
          <p className="text-xs text-gray-500">
            {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
          </p>
          {tipster.bio && (
            <p className="text-gray-700 mt-3 line-clamp-2">{tipster.bio}</p>
          )}
        </Link>
        {currentUserId !== tipster.userId && (
          <div onClick={(e) => e.stopPropagation()}>
            <FollowButton
              tipsterId={tipster.id}
              isFollowing={tipster.isFollowing ?? false}
              onFollowChange={onFollowChange}
              size="sm"
            />
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        {settledTips.length >= 5 ? (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-indigo-600">
                {winRate !== null ? `${winRate}%` : 'N/A'}
              </span>
              <span className="text-gray-500 mx-1">•</span>
              <span
                className={`font-semibold ${
                  roi !== null && roi > 0
                    ? 'text-green-600'
                    : roi !== null && roi < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {roi !== null ? (roi > 0 ? `+${roi}%` : `${roi}%`) : 'N/A'}
              </span>
              <span className="text-gray-500 mx-1">•</span>
              <span className="text-gray-600">{tipCount} tips</span>
            </div>
            <Link
              to={`/tipsters/${tipster.id}`}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              View Profile →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {tipCount} {tipCount === 1 ? 'tip' : 'tips'}
              {settledTips.length > 0 && settledTips.length < 5 && (
                <span className="text-xs text-gray-500 ml-2">
                  (Need 5+ settled tips for stats)
                </span>
              )}
            </div>
            <Link
              to={`/tipsters/${tipster.id}`}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              View Profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
