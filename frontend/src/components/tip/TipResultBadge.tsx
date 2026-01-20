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
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  }

  if (result === TipResult.WON) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success-800">
        Won
      </span>
    );
  }

  if (result === TipResult.LOST) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Lost
      </span>
    );
  }

  if (result === TipResult.VOID) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-800">
        Cancelled
      </span>
    );
  }

  return null;
};
