import { Link } from 'react-router-dom';
import { TipsterWithDetails } from '../../types/tipster.types';

interface TipsterCardProps {
  tipster: TipsterWithDetails;
}

/**
 * Card component to display tipster summary
 * Used in TipstersPage to list all tipsters
 */
export const TipsterCard = ({ tipster }: TipsterCardProps) => {
  const tipCount = tipster._count?.tips ?? 0;

  return (
    <Link
      to={`/tipsters/${tipster.id}`}
      className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {tipster.displayName}
          </h3>
          <p className="text-sm text-gray-600 mb-1">@{tipster.user.username}</p>
          {tipster.bio && (
            <p className="text-gray-700 mt-3 line-clamp-2">{tipster.bio}</p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{tipCount}</p>
              <p className="text-xs text-gray-600">
                {tipCount === 1 ? 'Tip' : 'Tips'}
              </p>
            </div>
          </div>
          <span className="text-blue-600 text-sm font-medium hover:underline">
            View Profile →
          </span>
        </div>
      </div>
    </Link>
  );
};
