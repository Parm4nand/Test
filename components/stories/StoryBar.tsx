'use client';

import StoryCircle from '@/components/stories/StoryCircle';
import StoryViewer from '@/components/stories/StoryViewer';
import Avatar from '@/components/ui/Avatar';
import { Profile, Story } from '@/types';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface StoryBarProps {
  stories: Story[];
  currentUser?: Profile | null;
}

function groupStoriesByUser(stories: Story[]): Map<string, Story[]> {
  const map = new Map<string, Story[]>();
  for (const story of stories) {
    const arr = map.get(story.user_id) ?? [];
    arr.push(story);
    map.set(story.user_id, arr);
  }
  return map;
}

export default function StoryBar({ stories, currentUser }: StoryBarProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [viewerStories, setViewerStories] = useState<Story[]>([]);

  const grouped = groupStoriesByUser(stories);
  const uniqueUsers = Array.from(grouped.values());

  const handleStoryClick = (userStories: Story[], idx: number) => {
    setViewerStories(userStories);
    setViewerIndex(idx);
  };

  return (
    <>
      <div className="flex items-center gap-4 overflow-x-auto px-4 py-3 scrollbar-hide border-b border-gray-200">
        {/* Current user's story add button */}
        {currentUser && (
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="relative">
              <Avatar src={currentUser.avatar_url} alt={currentUser.username} size="md" />
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white border-2 border-white">
                <Plus className="h-3 w-3" strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs text-gray-800 truncate max-w-[64px]">Your story</span>
          </div>
        )}

        {/* Other users' stories */}
        {uniqueUsers.map((userStories) => (
          <StoryCircle
            key={userStories[0].user_id}
            user={userStories[0].user}
            isViewed={false}
            onClick={() => handleStoryClick(userStories, 0)}
          />
        ))}
      </div>

      {viewerIndex !== null && (
        <StoryViewer
          stories={viewerStories}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
