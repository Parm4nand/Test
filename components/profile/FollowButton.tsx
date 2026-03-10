'use client';

import { useState } from 'react';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  onToggle?: (isFollowing: boolean) => void;
}

export default function FollowButton({ userId, initialIsFollowing, onToggle }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;
    const wasFollowing = isFollowing;
    // Optimistic update
    setIsFollowing(!wasFollowing);
    onToggle?.(!wasFollowing);
    setIsLoading(true);
    try {
      await fetch('/api/follow', {
        method: wasFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: userId }),
      });
    } catch {
      // Revert on error
      setIsFollowing(wasFollowing);
      onToggle?.(wasFollowing);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
        isFollowing
          ? 'border border-gray-300 text-gray-900 hover:border-red-400 hover:text-red-500'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
