import { useState, FormEvent } from 'react';
import { tipsterApi } from '../../api/tipster.api';
import { CreateTipsterDto } from '../../types/tipster.types';

interface CreateTipsterFormProps {
  onSuccess: () => void;
}

export const CreateTipsterForm = ({ onSuccess }: CreateTipsterFormProps) => {
  const [formData, setFormData] = useState<CreateTipsterDto>({
    displayName: '',
    bio: '',
  });

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await tipsterApi.createTipster(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create tipster profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-neutral-900">
          Become a Tipster
        </h3>
        <div className="mt-2 max-w-xl text-sm text-neutral-500">
          <p>Create your tipster profile to start publishing tips.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700">
              Display Name *
            </label>
            <input
              type="text"
              id="displayName"
              required
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g., BetMaster Pro"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-neutral-700">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              rows={3}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Tell subscribers about your expertise..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Tipster Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
