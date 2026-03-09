'use client';

import PostCard from '@/components/feed/PostCard';
import { Post } from '@/types';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/posts?postId=${id}`);
        if (!res.ok) { setError('Post not found'); return; }
        const data = await res.json();
        setPost(data.post ?? null);
        if (!data.post) setError('Post not found');
      } catch {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="mx-auto max-w-xl">
      {/* Back header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <Link href="/" aria-label="Back" className="text-gray-900 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold text-gray-900">Post</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
        </div>
      ) : error || !post ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="text-gray-500">{error || 'Post not found'}</p>
          <Link href="/" className="text-sm text-blue-500 hover:underline">
            Go home
          </Link>
        </div>
      ) : (
        <PostCard post={post} />
      )}
    </div>
  );
}
