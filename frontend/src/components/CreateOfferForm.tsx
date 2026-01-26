import { useState } from 'react';
import {
  createOffer,
  CreateOfferDto,
  SubscriptionDuration,
  Sport,
} from '../api/offer.api';

const SPORTS: Sport[] = [
  'FOOTBALL',
  'BASKETBALL',
  'TENNIS',
  'RUGBY',
  'MMA',
  'BOXING',
  'ESPORTS',
  'HOCKEY',
  'VOLLEYBALL',
  'BASEBALL',
  'AMERICAN_FOOTBALL',
  'OTHER',
];

const DURATIONS: { value: SubscriptionDuration; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'LIFETIME', label: 'Lifetime (one-time)' },
];

interface CreateOfferFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateOfferForm({ onSuccess, onCancel }: CreateOfferFormProps) {
  const [formData, setFormData] = useState<CreateOfferDto>({
    name: '',
    description: '',
    price: 999, // Default to 9.99
    duration: 'MONTHLY',
    sports: [],
    trialDays: undefined,
  });
  const [allSports, setAllSports] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (formData.price < 100) {
      setError('Price must be at least 1.00');
      return;
    }

    try {
      setLoading(true);
      await createOffer({
        ...formData,
        sports: allSports ? [] : formData.sports,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  }

  function toggleSport(sport: Sport) {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports?.includes(sport)
        ? prev.sports.filter((s) => s !== sport)
        : [...(prev.sports || []), sport],
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Offer Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Football Monthly, All Sports VIP"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe what's included..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (EUR) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">€</span>
            <input
              type="number"
              step="0.01"
              min="1"
              value={(formData.price / 100).toFixed(2)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: Math.round(parseFloat(e.target.value || '0') * 100),
                })
              }
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration *
          </label>
          <select
            value={formData.duration}
            onChange={(e) =>
              setFormData({
                ...formData,
                duration: e.target.value as SubscriptionDuration,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trial Period (days)
        </label>
        <input
          type="number"
          min="0"
          max="30"
          value={formData.trialDays || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              trialDays: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          placeholder="Leave empty for no trial"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sports Access
        </label>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={allSports}
            onChange={(e) => setAllSports(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm">All sports</span>
        </label>

        {!allSports && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {SPORTS.map((sport) => (
              <label
                key={sport}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.sports?.includes(sport) || false}
                  onChange={() => toggleSport(sport)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{sport.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Offer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
