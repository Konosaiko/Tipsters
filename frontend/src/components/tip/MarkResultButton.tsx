import { useState } from 'react';
import { Tip, TipResult } from '../../types/tip.types';
import { tipApi } from '../../api/tip.api';

interface MarkResultButtonProps {
  tip: Tip;
  onResultMarked: () => void;
}

/**
 * Dropdown button to mark tip result
 * Only shown for pending tips
 */
export const MarkResultButton = ({ tip, onResultMarked }: MarkResultButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState('');

  // Don't show if tip is already settled
  if (tip.result !== null) {
    return null;
  }

  const markResult = async (result: TipResult) => {
    setError('');
    setIsMarking(true);

    try {
      await tipApi.markTipResult(tip.id, result);
      setIsOpen(false);
      onResultMarked();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark result');
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="mb-2 text-xs text-red-600">{error}</div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isMarking}
        className="className="px-3 py-1 text-sm border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
      >
        {isMarking ? 'Marking...' : 'Mark Result ▾'}
      </button>

      {isOpen && !isMarking && (
        <div className="className="absolute right-0 mt-1 w-40 bg-white border border-neutral-200 rounded-md shadow-lg z-10">
          <button
            onClick={() => markResult(TipResult.WON)}
            className="className="className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-success-50 hover:text-success-700"
          >
            Mark as Won
          </button>
          <button
            onClick={() => markResult(TipResult.LOST)}
            className="className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-700"
          >
            Mark as Lost
          </button>
          <button
            onClick={() => markResult(TipResult.VOID)}
            className="className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Mark as Cancelled
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="className="block w-full text-left px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-50 border-t border-neutral-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
