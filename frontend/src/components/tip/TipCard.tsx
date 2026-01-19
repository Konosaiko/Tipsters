import { useState } from 'react';
import { Tip, UpdateTipDto } from '../../types/tip.types';
import { tipApi } from '../../api/tip.api';
import { TipResultBadge } from './TipResultBadge';
import { MarkResultButton } from './MarkResultButton';

interface TipCardProps {
  tip: Tip;
  onUpdate: () => void;
  onDelete: () => void;
  onResultMarked?: () => void;
}

export const TipCard = ({ tip, onUpdate, onDelete, onResultMarked }: TipCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<UpdateTipDto>({
    event: tip.event,
    prediction: tip.prediction,
    odds: tip.odds,
    explanation: tip.explanation || '',
    stake: tip.stake,
  });
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setError('');
    try {
      await tipApi.updateTip(tip.id, formData);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update tip');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tip?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await tipApi.deleteTip(tip.id);
      onDelete();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete tip');
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prediction</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.prediction}
              onChange={(e) => setFormData({ ...formData, prediction: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Odds</label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.odds}
                onChange={(e) =>
                  setFormData({ ...formData, odds: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stake (units)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.stake}
                onChange={(e) =>
                  setFormData({ ...formData, stake: parseFloat(e.target.value) || 1 })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Explanation</label>
            <textarea
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">{tip.event}</p>
          <p className="mt-1 text-sm text-gray-900">
            <span className="font-semibold">Prediction:</span> {tip.prediction}
          </p>
          {tip.explanation && (
            <p className="mt-1 text-sm text-gray-600">{tip.explanation}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {new Date(tip.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
            @{tip.odds}
          </span>

          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
            {tip.stake}u
          </span>

          <TipResultBadge result={tip.result} />

          {onResultMarked && (
            <MarkResultButton tip={tip} onResultMarked={onResultMarked} />
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
