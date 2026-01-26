import { Link } from 'react-router-dom';

interface TipLockOverlayProps {
  tipsterId: string;
  tipsterName: string;
}

export function TipLockOverlay({ tipsterId, tipsterName }: TipLockOverlayProps) {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-lg">
      <div className="text-4xl mb-3">🔒</div>
      <p className="text-gray-700 font-medium text-center mb-2">Premium Tip</p>
      <p className="text-gray-500 text-sm text-center mb-4">
        Subscribe to {tipsterName} to view this tip
      </p>
      <Link
        to={`/tipsters/${tipsterId}`}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
      >
        View Subscription Options
      </Link>
    </div>
  );
}

interface LockedTipCardProps {
  tip: {
    id: string;
    event: string;
    isLocked: boolean;
    tipster: {
      id: string;
      displayName: string;
    };
  };
}

export function LockedTipCard({ tip }: LockedTipCardProps) {
  if (!tip.isLocked) return null;

  return (
    <div className="relative bg-white rounded-lg shadow p-4 min-h-[200px]">
      <div className="opacity-30">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs text-gray-500">
              {tip.tipster.displayName}
            </span>
            <h4 className="font-medium">{tip.event}</h4>
          </div>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
            Premium
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      <TipLockOverlay
        tipsterId={tip.tipster.id}
        tipsterName={tip.tipster.displayName}
      />
    </div>
  );
}
