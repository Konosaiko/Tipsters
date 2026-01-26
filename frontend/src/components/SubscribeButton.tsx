import { useState } from 'react';
import { createCheckout } from '../api/subscription.api';
import { SubscriptionOffer, formatPrice, getDurationText } from '../api/offer.api';

interface SubscribeButtonProps {
  offer: SubscriptionOffer;
  isSubscribed?: boolean;
  className?: string;
}

export function SubscribeButton({
  offer,
  isSubscribed = false,
  className = '',
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    try {
      setLoading(true);
      setError(null);

      const currentUrl = window.location.href;
      const { url } = await createCheckout(
        offer.id,
        `${currentUrl}?subscription=success`,
        `${currentUrl}?subscription=cancelled`
      );

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start checkout');
      setLoading(false);
    }
  }

  if (isSubscribed) {
    return (
      <button
        disabled
        className={`px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-default ${className}`}
      >
        Subscribed
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 ${className}`}
      >
        {loading ? (
          'Redirecting...'
        ) : (
          <>
            Subscribe - {formatPrice(offer.price, offer.currency)}
            {getDurationText(offer.duration)}
          </>
        )}
      </button>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
