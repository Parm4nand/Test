'use client';

import StoryViewer from '@/components/stories/StoryViewer';
import { Story } from '@/types';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StoriesPageProps {
  params: Promise<{ userId: string }>;
}

export default function StoriesPage({ params }: StoriesPageProps) {
  const { userId } = use(params);
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stories');
        if (res.ok) {
          const data = await res.json();
          // Find this user's stories from grouped response
          if (Array.isArray(data.stories)) {
            const group = data.stories.find(
              (g: { user: { id: string }; stories: Story[] }) => g.user?.id === userId
            );
            setStories(group?.stories ?? []);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleClose = () => router.back();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black text-white">
        <p>No stories available.</p>
        <button onClick={handleClose} className="text-sm text-white/70 hover:text-white underline">
          Go back
        </button>
      </div>
    );
  }

  return <StoryViewer stories={stories} initialIndex={0} onClose={handleClose} />;
}
