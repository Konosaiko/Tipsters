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
  const [isHovered, setIsHovered] = useState(false);

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

  // Change button style on hover when following
  const variantClasses = isFollowing
    ? isHovered
      ? 'bg-red-600 text-white'
      : 'bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white'
    : 'bg-indigo-600 text-white hover:bg-indigo-700';

  // Show "Unfollow" on hover when following
  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    if (isFollowing) return isHovered ? 'Unfollow' : 'Following';
    return 'Follow';
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses}`}
    >
      {getButtonText()}
    </button>
  );
};
