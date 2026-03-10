'use client';

import ProfileGrid from '@/components/profile/ProfileGrid';
import Avatar from '@/components/ui/Avatar';
import { Post, Profile } from '@/types';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }
    setLoading(true);
    try {
      const [userRes, postRes] = await Promise.all([
        fetch(`/api/users?q=${encodeURIComponent(q)}&limit=10`),
        fetch(`/api/posts?limit=20`),
      ]);
      const userData = userRes.ok ? await userRes.json() : { users: [] };
      const postData = postRes.ok ? await postRes.json() : { posts: [] };
      setUsers(userData.users ?? []);
      setPosts(postData.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Load popular posts on mount (no search)
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  useEffect(() => {
    fetch('/api/posts?limit=30')
      .then((r) => r.json())
      .then((d) => setPopularPosts(d.posts ?? []))
      .catch(() => {});
  }, []);

  const isSearching = query.trim().length > 0;

  return (
    <div className="flex flex-col">
      {/* Search bar */}
      <div className="sticky top-14 md:top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg bg-gray-100 py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isSearching ? (
        <div className="flex flex-col">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
            </div>
          ) : (
            <>
              {/* User results */}
              {users.length > 0 && (
                <div className="flex flex-col">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Users
                  </p>
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Avatar src={user.avatar_url} alt={user.username} size="md" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{user.username}</span>
                        {user.full_name && (
                          <span className="text-xs text-gray-500">{user.full_name}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Post results */}
              {posts.length > 0 && (
                <div className="flex flex-col">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Posts
                  </p>
                  <ProfileGrid posts={posts} />
                </div>
              )}

              {users.length === 0 && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <ProfileGrid posts={popularPosts} />
      )}
    </div>
  );
}
