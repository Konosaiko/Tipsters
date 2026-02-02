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
    <div className="bg-neutral-900 rounded-xl p-6 hover:border-neutral-700 transition-colors border border-neutral-800">
      <div className="flex items-start justify-between mb-4">
        <Link to={`/tipsters/${tipster.id}`} className="flex-1 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-neutral-950 font-bold text-lg">
              {tipster.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                {tipster.displayName}
              </h3>
              <p className="text-sm text-neutral-500">@{tipster.user.username}</p>
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
          </p>
          {tipster.bio && (
            <p className="text-neutral-400 mt-3 text-sm line-clamp-2">{tipster.bio}</p>
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

      <div className="mt-4 pt-4 border-t border-neutral-800">
        {settledTips.length >= 5 ? (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold text-primary-500">
                {winRate !== null ? `${winRate}%` : 'N/A'}
              </span>
              <span className="text-neutral-600 mx-2">•</span>
              <span
                className={`font-semibold ${
                  roi !== null && roi > 0
                    ? 'text-primary-500'
                    : roi !== null && roi < 0
                    ? 'text-red-500'
                    : 'text-neutral-500'
                }`}
              >
                {roi !== null ? (roi > 0 ? `+${roi}%` : `${roi}%`) : 'N/A'}
              </span>
              <span className="text-neutral-600 mx-2">•</span>
              <span className="text-neutral-400">{tipCount} tips</span>
            </div>
            <Link
              to={`/tipsters/${tipster.id}`}
              className="text-primary-500 text-sm font-medium hover:text-primary-400 transition-colors"
            >
              View →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              {tipCount} {tipCount === 1 ? 'tip' : 'tips'}
              {settledTips.length > 0 && settledTips.length < 5 && (
                <span className="text-xs text-neutral-500 ml-2">
                  (Need 5+ for stats)
                </span>
              )}
            </div>
            <Link
              to={`/tipsters/${tipster.id}`}
              className="text-primary-500 text-sm font-medium hover:text-primary-400 transition-colors"
            >
              View →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
