'use client';

import PostCard from '@/components/feed/PostCard';
import { Post } from '@/types';

interface FeedProps {
  posts: Post[];
  loading?: boolean;
}

function PostSkeleton() {
  return (
    <div className="flex flex-col border-b border-gray-200 pb-4 animate-pulse">
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="h-3 w-28 rounded bg-gray-200" />
      </div>
      <div className="aspect-square w-full bg-gray-200" />
      <div className="px-3 pt-3 flex gap-4">
        <div className="h-6 w-6 rounded bg-gray-200" />
        <div className="h-6 w-6 rounded bg-gray-200" />
        <div className="h-6 w-6 rounded bg-gray-200" />
      </div>
      <div className="px-3 pt-2 flex flex-col gap-1.5">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-3 w-48 rounded bg-gray-200" />
        <div className="h-3 w-40 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function Feed({ posts, loading = false }: FeedProps) {
  if (loading) {
    return (
      <div className="flex flex-col">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="rounded-full bg-gray-100 p-6">
          <span className="text-5xl">📷</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Follow people to see their posts here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
