import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getMySubscriptions,
  cancelSubscription,
  Subscription,
  getStatusColor,
  formatStatus,
} from '../api/subscription.api';
import { formatPrice, getDurationText } from '../api/offer.api';

export function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const data = await getMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(subscription: Subscription) {
    const confirmMsg = subscription.cancelAtPeriodEnd
      ? 'This subscription is already set to cancel. Do you want to cancel it immediately?'
      : 'Cancel this subscription at the end of the current period?';

    if (!confirm(confirmMsg)) return;

    try {
      setCancellingId(subscription.id);
      await cancelSubscription(
        subscription.id,
        subscription.cancelAtPeriodEnd // If already cancelling, cancel immediately
      );
      loadSubscriptions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">My Subscriptions</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No active subscriptions</p>
          <Link
            to="/tipsters"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Browse tipsters →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    to={`/tipsters/${sub.offer.tipster.id}`}
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {sub.offer.tipster.displayName}
                  </Link>
                  <p className="text-sm text-gray-600">{sub.offer.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                        sub.status
                      )}`}
                    >
                      {formatStatus(sub.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatPrice(sub.offer.price, sub.offer.currency)}
                      {getDurationText(sub.offer.duration)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {sub.currentPeriodEnd && (
                    <p className="text-sm text-gray-500">
                      {sub.cancelAtPeriodEnd ? 'Ends' : 'Renews'}:{' '}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                  {sub.trialEndsAt && sub.status === 'TRIALING' && (
                    <p className="text-sm text-blue-600">
                      Trial ends:{' '}
                      {new Date(sub.trialEndsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {(sub.status === 'ACTIVE' || sub.status === 'TRIALING') && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {sub.cancelAtPeriodEnd ? (
                    <p className="text-sm text-yellow-600">
                      Subscription will end on{' '}
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                        : 'period end'}
                    </p>
                  ) : (
                    <button
                      onClick={() => handleCancel(sub)}
                      disabled={cancellingId === sub.id}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {cancellingId === sub.id
                        ? 'Cancelling...'
                        : 'Cancel subscription'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
