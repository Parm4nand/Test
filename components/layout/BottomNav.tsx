'use client';

import { Compass, Heart, Home, PlusSquare, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/create', icon: PlusSquare, label: 'Create' },
  { href: '/notifications', icon: Heart, label: 'Activity' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-gray-200 bg-white px-2">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex flex-col items-center justify-center p-2 transition-colors ${
              isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon
              className="h-6 w-6"
              strokeWidth={isActive ? 2.5 : 2}
              fill={isActive ? 'currentColor' : 'none'}
            />
          </Link>
        );
      })}
    </nav>
  );
}
