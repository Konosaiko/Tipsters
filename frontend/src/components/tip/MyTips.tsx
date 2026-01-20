import { useEffect, useState } from 'react';
import { Tip } from '../../types/tip.types';
import { tipApi } from '../../api/tip.api';
import { TipCard } from './TipCard';

interface MyTipsProps {
  onResultMarked?: () => void;
}

export const MyTips = ({ onResultMarked }: MyTipsProps) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTips = async () => {
    try {
      setIsLoading(true);
      const allTips = await tipApi.getAllTips();
      setTips(allTips);
    } catch (err) {
      setError('Failed to load tips');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <p className="text-neutral-500 text-center">Loading your tips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-neutral-900 mb-4">My Published Tips</h3>

        {tips.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">
            You haven't published any tips yet. Create your first tip above!
          </p>
        ) : (
          <div className="space-y-4">
            {tips.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                onUpdate={fetchTips}
                onDelete={fetchTips}
                onResultMarked={() => {
                  fetchTips();
                  onResultMarked?.();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
