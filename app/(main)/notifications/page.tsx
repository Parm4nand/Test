'use client';

import NotificationItem from '@/components/notifications/NotificationItem';
import { Notification } from '@/types';
import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <h1 className="text-base font-semibold text-gray-900">Notifications</h1>
        {hasUnread && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <span className="text-5xl">🔔</span>
          <div>
            <p className="font-semibold text-gray-900">No notifications yet</p>
            <p className="mt-1 text-sm text-gray-500">
              When someone likes or comments on your posts, you&apos;ll see it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
