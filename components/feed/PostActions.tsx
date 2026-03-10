'use client';

import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

interface PostActionsProps {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  initialBookmarked: boolean;
  onComment?: () => void;
}

export default function PostActions({
  postId,
  initialLiked,
  initialLikesCount,
  initialBookmarked,
  onComment,
}: PostActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  const handleLike = async () => {
    if (isLikeLoading) return;
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
    setIsLikeLoading(true);
    try {
      await fetch('/api/likes', {
        method: wasLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarkLoading) return;
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);
    setIsBookmarkLoading(true);
    try {
      await fetch('/api/bookmarks', {
        method: wasBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });
    } catch {
      setBookmarked(wasBookmarked);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            aria-label={liked ? 'Unlike' : 'Like'}
            className="group -m-1 p-1 transition-transform active:scale-90"
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                liked
                  ? 'fill-red-500 stroke-red-500'
                  : 'stroke-gray-800 group-hover:stroke-gray-500'
              }`}
            />
          </button>
          <button
            onClick={onComment}
            aria-label="Comment"
            className="group -m-1 p-1 transition-transform active:scale-90"
          >
            <MessageCircle className="h-6 w-6 stroke-gray-800 group-hover:stroke-gray-500" />
          </button>
          <button
            aria-label="Share"
            className="group -m-1 p-1 transition-transform active:scale-90"
          >
            <Send className="h-6 w-6 stroke-gray-800 group-hover:stroke-gray-500" />
          </button>
        </div>

        <button
          onClick={handleBookmark}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          className="group -m-1 p-1 transition-transform active:scale-90"
        >
          <Bookmark
            className={`h-6 w-6 transition-colors ${
              bookmarked
                ? 'fill-gray-900 stroke-gray-900'
                : 'stroke-gray-800 group-hover:stroke-gray-500'
            }`}
          />
        </button>
      </div>
      <p className="text-sm font-semibold text-gray-900">
        {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
      </p>
    </div>
  );
}
