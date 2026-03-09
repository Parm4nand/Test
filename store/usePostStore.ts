import { create } from "zustand";
import { Post } from "@/types";

interface PostState {
  posts: Post[];
  feedPosts: Post[];
  setPosts: (posts: Post[]) => void;
  setFeedPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  toggleLike: (postId: string, liked: boolean) => void;
  toggleBookmark: (postId: string) => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  feedPosts: [],

  setPosts: (posts) => set({ posts }),

  setFeedPosts: (feedPosts) => set({ feedPosts }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
      feedPosts: [post, ...state.feedPosts],
    })),

  updatePost: (id, updates) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      feedPosts: state.feedPosts.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  deletePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
      feedPosts: state.feedPosts.filter((p) => p.id !== id),
    })),

  toggleLike: (postId, liked) =>
    set((state) => {
      const delta = liked ? 1 : -1;
      const update = (p: Post) =>
        p.id === postId
          ? { ...p, likes_count: Math.max(0, p.likes_count + delta) }
          : p;
      return {
        posts: state.posts.map(update),
        feedPosts: state.feedPosts.map(update),
      };
    }),

  toggleBookmark: (_postId) => {
    // Bookmark state is managed server-side; this can trigger UI optimistic updates if needed.
  },
}));
