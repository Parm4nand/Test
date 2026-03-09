'use client';

import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function TopNav() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
        Instagram
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/notifications" aria-label="Notifications" className="text-gray-900 hover:text-gray-600 transition-colors">
          <Heart className="h-6 w-6" strokeWidth={2} />
        </Link>
        <Link href="/messages" aria-label="Messages" className="text-gray-900 hover:text-gray-600 transition-colors">
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
        </Link>
      </div>
    </header>
  );
}
