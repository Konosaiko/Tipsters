import { useState, FormEvent } from 'react';
import { tipApi } from '../../api/tip.api';
import { CreateTipDto, Sport } from '../../types/tip.types';

interface CreateTipFormProps {
  onSuccess: () => void;
}

// Common betting platforms
const PLATFORMS = [
  'Betclic',
  'Winamax',
  'Unibet',
  'ParionsSport',
  'PMU',
  'Bet365',
  'Other',
];

export const CreateTipForm = ({ onSuccess }: CreateTipFormProps) => {
  const [formData, setFormData] = useState<CreateTipDto>({
    event: '',
    prediction: '',
    odds: 0,
    explanation: '',
    stake: 1, // Default to 1 unit
    sport: undefined,
    platform: undefined,
    betLink: undefined,
  });

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await tipApi.createTip(formData);
      // Reset form
      setFormData({
        event: '',
        prediction: '',
        odds: 0,
        explanation: '',
        stake: 1, // Reset to default 1 unit
        sport: undefined,
        platform: undefined,
        betLink: undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create tip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-neutral-900">Publish a New Tip</h3>
        <div className="mt-2 max-w-xl text-sm text-neutral-500">
          <p>Share your betting prediction with subscribers.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="event" className="block text-sm font-medium text-neutral-700">
                Event *
              </label>
              <input
                type="text"
                id="event"
                required
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g., Lakers vs Warriors - NBA"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="prediction" className="block text-sm font-medium text-neutral-700">
                Prediction *
              </label>
              <input
                type="text"
                id="prediction"
                required
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g., Lakers to win"
                value={formData.prediction}
                onChange={(e) => setFormData({ ...formData, prediction: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="odds" className="block text-sm font-medium text-neutral-700">
                Odds *
              </label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                id="odds"
                required
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g., 2.15"
                value={formData.odds || ''}
                onChange={(e) =>
                  setFormData({ ...formData, odds: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <label htmlFor="stake" className="block text-sm font-medium text-neutral-700">
                Stake (units) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                id="stake"
                required
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g., 1"
                value={formData.stake || 1}
                onChange={(e) =>
                  setFormData({ ...formData, stake: parseFloat(e.target.value) || 1 })
                }
              />
              <p className="mt-1 text-xs text-neutral-500">
                Recommended stake in units (e.g., 1u, 2u, 0.5u)
              </p>
            </div>

            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-neutral-700">
                Sport
              </label>
              <select
                id="sport"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.sport || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sport: e.target.value ? (e.target.value as Sport) : undefined,
                  })
                }
              >
                <option value="">Select a sport</option>
                <option value={Sport.FOOTBALL}>Football</option>
                <option value={Sport.BASKETBALL}>Basketball</option>
                <option value={Sport.TENNIS}>Tennis</option>
                <option value={Sport.RUGBY}>Rugby</option>
                <option value={Sport.MMA}>MMA</option>
                <option value={Sport.BOXING}>Boxing</option>
                <option value={Sport.ESPORTS}>Esports</option>
                <option value={Sport.HOCKEY}>Hockey</option>
                <option value={Sport.VOLLEYBALL}>Volleyball</option>
                <option value={Sport.BASEBALL}>Baseball</option>
                <option value={Sport.AMERICAN_FOOTBALL}>American Football</option>
                <option value={Sport.OTHER}>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-neutral-700">
                Betting Platform
              </label>
              <select
                id="platform"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.platform || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    platform: e.target.value || undefined,
                  })
                }
              >
                <option value="">Select a platform</option>
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="betLink" className="block text-sm font-medium text-neutral-700">
                Bet Link (Optional)
              </label>
              <input
                type="url"
                id="betLink"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="https://example.com/bet/..."
                value={formData.betLink || ''}
                onChange={(e) =>
                  setFormData({ ...formData, betLink: e.target.value || undefined })
                }
              />
              <p className="mt-1 text-xs text-neutral-500">
                Direct link for subscribers to quickly place this bet
              </p>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="explanation" className="block text-sm font-medium text-neutral-700">
                Explanation (Optional)
              </label>
              <textarea
                id="explanation"
                rows={3}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Why do you recommend this bet?"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Publishing...' : 'Publish Tip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
