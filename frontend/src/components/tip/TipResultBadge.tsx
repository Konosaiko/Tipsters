import { TipResult } from '../../types/tip.types';

interface TipResultBadgeProps {
  result: TipResult | null;
}

/**
 * Badge component to display tip result status
 */
export const TipResultBadge = ({ result }: TipResultBadgeProps) => {
  if (result === null) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/30 text-yellow-400">
        Pending
      </span>
    );
  }

  if (result === TipResult.WON) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-success-900/30 text-success-400">
        Won
      </span>
    );
  }

  if (result === TipResult.LOST) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-900/30 text-red-400">
        Lost
      </span>
    );
  }

  if (result === TipResult.VOID) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-neutral-800 text-neutral-400">
        Cancelled
      </span>
    );
  }

  return null;
};
