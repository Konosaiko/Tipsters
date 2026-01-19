import { useState } from 'react';
import { followApi } from '../../api/follow.api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FollowButtonProps {
  tipsterId: string;
  isFollowing: boolean;
  onFollowChange?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const FollowButton = ({
  tipsterId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  size = 'md',
}: FollowButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await followApi.unfollowTipster(tipsterId);
        setIsFollowing(false);
      } else {
        await followApi.followTipster(tipsterId);
        setIsFollowing(true);
      }
      onFollowChange?.();
    } catch (error: any) {
      console.error('Follow error:', error);
      alert(error.response?.data?.error || 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseClasses =
    'font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = isFollowing
    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    : 'bg-indigo-600 text-white hover:bg-indigo-700';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses}`}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};
