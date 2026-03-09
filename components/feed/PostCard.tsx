'use client';

import Avatar from '@/components/ui/Avatar';
import DropdownMenu from '@/components/ui/DropdownMenu';
import PostActions from '@/components/feed/PostActions';
import CommentSection from '@/components/feed/CommentSection';
import { Post, Comment } from '@/types';
import { ROUTES } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/utils';
import { Flag, Link2, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentOpen, setCommentOpen] = useState(false);

  const handleAddComment = async (content: string) => {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id, content }),
    });
    if (res.ok) {
      const newComment: Comment = await res.json();
      setComments((prev) => [newComment, ...prev]);
    }
  };

  const menuItems = [
    {
      label: 'Copy link',
      icon: <Link2 className="h-4 w-4" />,
      onClick: () => navigator.clipboard.writeText(`${window.location.origin}${ROUTES.POST(post.id)}`),
    },
    {
      label: 'Report',
      icon: <Flag className="h-4 w-4" />,
      onClick: () => {},
      className: 'text-red-500',
      divider: true,
    },
  ];

  return (
    <article className="flex flex-col border-b border-gray-200 pb-4 last:border-b-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/${post.user.username}`}>
            <Avatar
              src={post.user.avatar_url}
              alt={post.user.username}
              size="sm"
            />
          </Link>
          <div className="flex flex-col leading-tight">
            <Link
              href={`/${post.user.username}`}
              className="text-sm font-semibold text-gray-900 hover:text-gray-600"
            >
              {post.user.username}
            </Link>
            {post.location && (
              <span className="text-xs text-gray-500">{post.location}</span>
            )}
          </div>
        </div>
        <DropdownMenu
          trigger={
            <button aria-label="More options" className="p-1 rounded-full hover:bg-gray-100">
              <MoreHorizontal className="h-5 w-5 text-gray-700" />
            </button>
          }
          items={menuItems}
        />
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={post.image_url}
          alt={post.caption ?? 'Post image'}
          fill
          className="object-cover"
          unoptimized={post.image_url.startsWith('http')}
          sizes="(max-width: 768px) 100vw, 614px"
        />
      </div>

      {/* Actions */}
      <div className="px-3 pt-3">
        <PostActions
          postId={post.id}
          initialLiked={false}
          initialLikesCount={post.likes_count}
          initialBookmarked={false}
          onComment={() => setCommentOpen((v) => !v)}
        />
      </div>

      {/* Likes */}
      <div className="px-3 pt-2">
        <p className="text-sm font-semibold text-gray-900">
          {post.likes_count.toLocaleString()} {post.likes_count === 1 ? 'like' : 'likes'}
        </p>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-3 pt-1">
          <p className="text-sm text-gray-900">
            <Link
              href={`/${post.user.username}`}
              className="font-semibold mr-1.5 hover:text-gray-600"
            >
              {post.user.username}
            </Link>
            {post.caption}
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="px-3 pt-2">
        {post.comments_count > 0 && (
          <Link
            href={ROUTES.POST(post.id)}
            className="text-sm text-gray-500 hover:text-gray-700 block mb-1"
          >
            View all {post.comments_count} comments
          </Link>
        )}
        <CommentSection
          postId={post.id}
          comments={comments}
          onAddComment={handleAddComment}
        />
      </div>

      {/* Timestamp */}
      <div className="px-3 pt-1">
        <time className="text-[10px] uppercase tracking-wide text-gray-400">
          {formatTimeAgo(post.created_at)}
        </time>
      </div>
    </article>
  );
}
