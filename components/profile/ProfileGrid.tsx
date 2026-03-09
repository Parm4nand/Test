'use client';

import { Post } from '@/types';
import { ROUTES } from '@/lib/constants';
import { Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProfileGridProps {
  posts: Post[];
}

export default function ProfileGrid({ posts }: ProfileGridProps) {
  const router = useRouter();

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="rounded-full border-2 border-gray-900 p-4">
          <span className="text-4xl">📷</span>
        </div>
        <div>
          <p className="text-2xl font-thin text-gray-900">No Posts Yet</p>
          <p className="mt-1 text-sm text-gray-500">
            When posts are shared, they'll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post) => (
        <button
          key={post.id}
          className="group relative aspect-square overflow-hidden bg-gray-100"
          onClick={() => router.push(ROUTES.POST(post.id))}
          aria-label={`View post${post.caption ? `: ${post.caption}` : ''}`}
        >
          <Image
            src={post.image_url}
            alt={post.caption ?? 'Post'}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            unoptimized={post.image_url.startsWith('http')}
            sizes="(max-width: 768px) 33vw, 293px"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Heart className="h-5 w-5 fill-white" />
              <span className="text-sm">{post.likes_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <MessageCircle className="h-5 w-5 fill-white" />
              <span className="text-sm">{post.comments_count.toLocaleString()}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
