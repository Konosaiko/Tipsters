import { useState, useEffect } from 'react';
import {
  getMyOffers,
  updateOffer,
  deleteOffer,
  SubscriptionOffer,
  formatPrice,
  getDurationText,
} from '../api/offer.api';
import { CreateOfferForm } from './CreateOfferForm';

export function ManageOffers() {
  const [offers, setOffers] = useState<SubscriptionOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    try {
      setLoading(true);
      const data = await getMyOffers();
      setOffers(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Failed to load offers');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(offer: SubscriptionOffer) {
    try {
      await updateOffer(offer.id, { isActive: !offer.isActive });
      loadOffers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update offer');
    }
  }

  async function handleDelete(offerId: string) {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      await deleteOffer(offerId);
      loadOffers();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete offer');
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Subscription Offers</h3>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            + New Offer
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-4">Create New Offer</h4>
          <CreateOfferForm
            onSuccess={() => {
              setShowCreateForm(false);
              loadOffers();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {offers.length === 0 && !showCreateForm ? (
        <p className="text-gray-500 text-center py-8">
          No subscription offers yet. Create your first offer to start earning!
        </p>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`border rounded-lg p-4 ${
                offer.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{offer.name}</h4>
                    {!offer.isActive && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {offer.description && (
                    <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">
                      {formatPrice(offer.price, offer.currency)}
                      {getDurationText(offer.duration)}
                    </span>
                    <span>
                      {offer.sports.length === 0
                        ? 'All sports'
                        : offer.sports.join(', ')}
                    </span>
                    {offer.trialDays && <span>{offer.trialDays}d trial</span>}
                    <span className="text-indigo-600">
                      {offer._count?.subscriptions || 0} subscribers
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(offer)}
                    className={`px-3 py-1 rounded text-sm ${
                      offer.isActive
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {offer.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
