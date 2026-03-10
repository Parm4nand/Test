'use client';

import Avatar from '@/components/ui/Avatar';
import { Notification } from '@/types';
import { ROUTES } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
}

function notificationText(type: Notification['type']): string {
  switch (type) {
    case 'like':
      return 'liked your photo.';
    case 'comment':
      return 'commented on your photo.';
    case 'follow':
      return 'started following you.';
    default:
      return '';
  }
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const { actor, type, post, read, created_at } = notification;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
        !read ? 'bg-blue-50/40' : ''
      }`}
    >
      <Link href={`/${actor.username}`} className="shrink-0">
        <Avatar src={actor.avatar_url} alt={actor.username} size="md" />
      </Link>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-snug">
          <Link href={`/${actor.username}`} className="font-semibold hover:text-gray-600">
            {actor.username}
          </Link>{' '}
          {notificationText(type)}{' '}
          <span className="text-gray-400">{formatTimeAgo(created_at)}</span>
        </p>
      </div>

      {post && (
        <Link href={ROUTES.POST(post.id)} className="shrink-0">
          <div className="relative h-11 w-11 overflow-hidden rounded bg-gray-100">
            <Image
              src={post.image_url}
              alt="Post thumbnail"
              fill
              className="object-cover"
              unoptimized={post.image_url.startsWith('http')}
              sizes="44px"
            />
          </div>
        </Link>
      )}

      {!read && (
        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-label="Unread" />
      )}
    </div>
  );
}
