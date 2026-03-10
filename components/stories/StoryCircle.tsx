'use client';

import Avatar from '@/components/ui/Avatar';
import { Profile } from '@/types';

interface StoryCircleProps {
  user: Profile;
  isViewed?: boolean;
  onClick: () => void;
}

export default function StoryCircle({ user, isViewed = false, onClick }: StoryCircleProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 shrink-0"
      aria-label={`${user.username}'s story`}
    >
      <div
        className={`rounded-full p-[2px] ${
          isViewed
            ? 'bg-gray-300'
            : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
        }`}
      >
        <div className="rounded-full bg-white p-[2px]">
          <Avatar src={user.avatar_url} alt={user.username} size="md" />
        </div>
      </div>
      <span className="text-xs text-gray-800 truncate max-w-[64px]">{user.username}</span>
    </button>
  );
}
