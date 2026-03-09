'use client';

import ProfileGrid from '@/components/profile/ProfileGrid';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { createClient } from '@/lib/supabase/client';
import { Bookmark, Grid3x3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bookmark as BookmarkType, Post, Profile } from '@/types';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

type Tab = 'posts' | 'saved';

export default function ProfilePage({ params }: ProfilePageProps) {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(({ username: u }) => setUsername(u));
  }, [params]);

  useEffect(() => {
    if (!username) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // Fetch profile
        const profileRes = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
        if (!profileRes.ok) {
          setError('User not found');
          return;
        }
        const profileData = await profileRes.json();
        const profileObj: Profile = profileData.profile;
        setProfile(profileObj);

        const own = currentUser?.id === profileObj.id;
        setIsOwnProfile(own);

        // Fetch posts
        const postsRes = await fetch(`/api/posts?userId=${profileObj.id}`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts ?? []);
        }

        // Check following
        if (currentUser && !own) {
          const { data: followData } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', currentUser.id)
            .eq('following_id', profileObj.id)
            .maybeSingle();
          setIsFollowing(!!followData);
        }

        // Fetch bookmarks if own profile
        if (own) {
          const savedRes = await fetch('/api/bookmarks');
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            setSavedPosts(
              (savedData.bookmarks as BookmarkType[] ?? []).map((b) => b.post)
            );
          }
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-gray-500">{error || 'Profile not found'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollow={setIsFollowing}
      />

      {/* Tabs */}
      <div className="flex border-t border-gray-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
            activeTab === 'posts'
              ? 'border-t-2 border-gray-900 text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Grid3x3 className="h-4 w-4" />
          <span className="hidden sm:inline">Posts</span>
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
              activeTab === 'saved'
                ? 'border-t-2 border-gray-900 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
          </button>
        )}
      </div>

      {/* Grid */}
      <ProfileGrid posts={activeTab === 'posts' ? posts : savedPosts} />
    </div>
  );
}
