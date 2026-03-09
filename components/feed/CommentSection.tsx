'use client';

import Avatar from '@/components/ui/Avatar';
import { Comment } from '@/types';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
}

export default function CommentSection({ postId, comments, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAddComment(content);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {comments.length > 2 && (
        <Link
          href={ROUTES.POST(postId)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          View all {comments.length} comments
        </Link>
      )}

      <div className="flex flex-col gap-1.5">
        {comments.slice(0, 2).map((comment) => (
          <div key={comment.id} className="flex items-start gap-2 text-sm">
            <Avatar
              src={comment.user.avatar_url}
              alt={comment.user.username}
              size="xs"
              className="mt-0.5"
            />
            <p className="leading-snug">
              <Link
                href={`/${comment.user.username}`}
                className="font-semibold text-gray-900 hover:text-gray-600 mr-1.5"
              >
                {comment.user.username}
              </Link>
              <span className="text-gray-800">{comment.content}</span>
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 pt-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
          maxLength={2200}
        />
        {newComment.trim() && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-sm font-semibold text-blue-500 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            Post
          </button>
        )}
      </form>
    </div>
  );
}
