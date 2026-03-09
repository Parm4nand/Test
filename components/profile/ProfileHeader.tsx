'use client';

import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import FollowButton from '@/components/profile/FollowButton';
import { Profile } from '@/types';
import { ROUTES } from '@/lib/constants';
import { Globe, Settings } from 'lucide-react';
import Link from 'next/link';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow?: (following: boolean) => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing,
  onFollow,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 md:flex-row md:items-start md:gap-12">
      {/* Avatar */}
      <div className="flex justify-center md:justify-start md:pl-4">
        <Avatar src={profile.avatar_url} alt={profile.username} size="xl" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Username + actions */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-light text-gray-900">{profile.username}</h1>
          {isOwnProfile ? (
            <div className="flex items-center gap-2">
              <Link href="/settings/profile">
                <Button variant="secondary" size="sm">
                  Edit Profile
                </Button>
              </Link>
              <Link href="/settings">
                <button
                  aria-label="Settings"
                  className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-700" />
                </button>
              </Link>
            </div>
          ) : (
            <FollowButton
              userId={profile.id}
              initialIsFollowing={isFollowing}
              onToggle={onFollow}
            />
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div className="flex flex-col items-center md:flex-row md:gap-1">
            <span className="font-semibold text-gray-900">
              {profile.posts_count.toLocaleString()}
            </span>
            <span className="text-gray-500">posts</span>
          </div>
          <Link href={ROUTES.PROFILE(profile.username)} className="flex flex-col items-center md:flex-row md:gap-1 hover:opacity-80">
            <span className="font-semibold text-gray-900">
              {profile.followers_count.toLocaleString()}
            </span>
            <span className="text-gray-500">followers</span>
          </Link>
          <Link href={ROUTES.PROFILE(profile.username)} className="flex flex-col items-center md:flex-row md:gap-1 hover:opacity-80">
            <span className="font-semibold text-gray-900">
              {profile.following_count.toLocaleString()}
            </span>
            <span className="text-gray-500">following</span>
          </Link>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-0.5">
          {profile.full_name && (
            <p className="text-sm font-semibold text-gray-900">{profile.full_name}</p>
          )}
          {profile.bio && (
            <p className="whitespace-pre-line text-sm text-gray-800">{profile.bio}</p>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-semibold text-blue-900 hover:underline"
            >
              <Globe className="h-3.5 w-3.5" />
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
