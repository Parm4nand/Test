'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type CleanupFn = () => void;

export function useRealtime() {
  const channelsRef = useRef<RealtimeChannel[]>([]);

  function trackChannel(channel: RealtimeChannel) {
    channelsRef.current.push(channel);
  }

  function removeChannel(channel: RealtimeChannel) {
    const supabase = createClient();
    supabase.removeChannel(channel);
    channelsRef.current = channelsRef.current.filter((c) => c !== channel);
  }

  useEffect(() => {
    return () => {
      const supabase = createClient();
      channelsRef.current.forEach((channel) => supabase.removeChannel(channel));
      channelsRef.current = [];
    };
  }, []);

  function subscribeToLikes(
    postId: string,
    callback: (payload: Record<string, unknown>) => void
  ): CleanupFn {
    const supabase = createClient();
    const channel = supabase
      .channel(`likes:post:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => callback(payload as Record<string, unknown>)
      )
      .subscribe();

    trackChannel(channel);
    return () => removeChannel(channel);
  }

  function subscribeToComments(
    postId: string,
    callback: (payload: Record<string, unknown>) => void
  ): CleanupFn {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:post:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => callback(payload as Record<string, unknown>)
      )
      .subscribe();

    trackChannel(channel);
    return () => removeChannel(channel);
  }

  function subscribeToNotifications(
    userId: string,
    callback: (payload: Record<string, unknown>) => void
  ): CleanupFn {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => callback(payload as Record<string, unknown>)
      )
      .subscribe();

    trackChannel(channel);
    return () => removeChannel(channel);
  }

  function subscribeToMessages(
    conversationId: string,
    callback: (payload: Record<string, unknown>) => void
  ): CleanupFn {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => callback(payload as Record<string, unknown>)
      )
      .subscribe();

    trackChannel(channel);
    return () => removeChannel(channel);
  }

  return {
    subscribeToLikes,
    subscribeToComments,
    subscribeToNotifications,
    subscribeToMessages,
  };
}
