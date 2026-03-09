'use client';

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Post } from '@/types';
import { POSTS_PER_PAGE } from '@/lib/constants';

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  fetchFeedPosts: (userId: string) => Promise<void>;
  fetchUserPosts: (username: string) => Promise<void>;
  fetchPost: (postId: string) => Promise<Post | null>;
}

export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Ref for cursor so loadMore always reads the latest value without stale closures
  const cursorRef = useRef<string | null>(null);

  // Ref holding the current page-fetching strategy for loadMore
  const fetcherRef = useRef<(cursorValue: string | null) => Promise<void>>(async () => {});

  function applyPage(newPosts: Post[], cursorValue: string | null) {
    setPosts((prev) => (cursorValue ? [...prev, ...newPosts] : newPosts));
    setHasMore(newPosts.length === POSTS_PER_PAGE);
    if (newPosts.length > 0) {
      cursorRef.current = newPosts[newPosts.length - 1].created_at;
    }
  }

  const fetchFeedPosts = useCallback(async (userId: string) => {
    async function doFetch(cursorValue: string | null) {
      const supabase = createClient();
      setIsLoading(true);
      setError(null);
      try {
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId);

        const followingIds = (followData ?? []).map(
          (f: { following_id: string }) => f.following_id
        );
        followingIds.push(userId);

        let query = supabase
          .from('posts')
          .select('*, user:profiles(*)')
          .in('user_id', followingIds)
          .order('created_at', { ascending: false })
          .limit(POSTS_PER_PAGE);

        if (cursorValue) query = query.lt('created_at', cursorValue);

        const { data, error: queryError } = await query;
        if (queryError) throw queryError;
        applyPage((data ?? []) as Post[], cursorValue);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch feed posts');
      } finally {
        setIsLoading(false);
      }
    }

    setPosts([]);
    cursorRef.current = null;
    setHasMore(true);
    fetcherRef.current = doFetch;
    await doFetch(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserPosts = useCallback(async (username: string) => {
    async function doFetch(cursorValue: string | null) {
      const supabase = createClient();
      setIsLoading(true);
      setError(null);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;

        let query = supabase
          .from('posts')
          .select('*, user:profiles(*)')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(POSTS_PER_PAGE);

        if (cursorValue) query = query.lt('created_at', cursorValue);

        const { data, error: queryError } = await query;
        if (queryError) throw queryError;
        applyPage((data ?? []) as Post[], cursorValue);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user posts');
      } finally {
        setIsLoading(false);
      }
    }

    setPosts([]);
    cursorRef.current = null;
    setHasMore(true);
    fetcherRef.current = doFetch;
    await doFetch(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPost = useCallback(async (postId: string): Promise<Post | null> => {
    const supabase = createClient();
    try {
      const { data, error: queryError } = await supabase
        .from('posts')
        .select('*, user:profiles(*)')
        .eq('id', postId)
        .single();

      if (queryError) throw queryError;
      return data as Post;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
      return null;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    await fetcherRef.current(cursorRef.current);
  }, [isLoading, hasMore]);

  return { posts, isLoading, error, hasMore, loadMore, fetchFeedPosts, fetchUserPosts, fetchPost };
}
