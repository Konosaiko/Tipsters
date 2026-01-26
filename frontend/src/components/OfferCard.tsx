import { SubscriptionOffer, formatPrice, getDurationText } from '../api/offer.api';

interface OfferCardProps {
  offer: SubscriptionOffer;
  onSubscribe?: () => void;
  showSubscribeButton?: boolean;
  isSubscribed?: boolean;
  loading?: boolean;
}

export function OfferCard({
  offer,
  onSubscribe,
  showSubscribeButton = true,
  isSubscribed = false,
  loading = false,
}: OfferCardProps) {
  const allSports = offer.sports.length === 0;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-lg">{offer.name}</h4>
        {!offer.isActive && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            Inactive
          </span>
        )}
      </div>

      {offer.description && (
        <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
      )}

      <div className="mb-4">
        <span className="text-2xl font-bold">
          {formatPrice(offer.price, offer.currency)}
        </span>
        <span className="text-gray-500 text-sm ml-1">
          {getDurationText(offer.duration)}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {allSports
              ? 'Access to all sports'
              : `Access to: ${offer.sports.join(', ')}`}
          </span>
        </div>

        {offer.trialDays && (
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{offer.trialDays} days free trial</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>Access to premium tips</span>
        </div>
      </div>

      {showSubscribeButton && (
        <button
          onClick={onSubscribe}
          disabled={loading || isSubscribed}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            isSubscribed
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
          }`}
        >
          {loading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      )}
    </div>
  );
}
