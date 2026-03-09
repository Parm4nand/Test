'use client';

import {
  Bookmark,
  Compass,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  PlusSquare,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import DropdownMenu from '@/components/ui/DropdownMenu';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/create', icon: PlusSquare, label: 'Create' },
  { href: '/notifications', icon: Heart, label: 'Notifications' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const moreItems = [
    {
      label: 'Saved',
      icon: <Bookmark className="h-4 w-4" />,
      onClick: () => {},
    },
    {
      label: collapsed ? 'Expand sidebar' : 'Collapse sidebar',
      icon: <MoreHorizontal className="h-4 w-4" />,
      onClick: () => setCollapsed((v) => !v),
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-gray-200 bg-white h-screen sticky top-0 transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      <div className="flex flex-col flex-1 py-4 px-3 gap-1">
        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-3 mb-4 font-bold text-xl ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="text-2xl">📸</span>
          {!collapsed && <span className="font-semibold text-gray-900">Instagram</span>}
        </Link>

        {/* Nav Items */}
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-gray-100 ${
                isActive ? 'font-bold' : 'font-normal'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon
                className={`h-6 w-6 shrink-0 ${isActive ? 'fill-current' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!collapsed && (
                <span className={`text-sm ${isActive ? 'font-semibold' : ''}`}>{label}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* More menu */}
      <div className="px-3 py-4 border-t border-gray-100">
        <DropdownMenu
          trigger={
            <div
              className={`flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-100 cursor-pointer ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <MoreHorizontal className="h-6 w-6 shrink-0" />
              {!collapsed && <span className="text-sm">More</span>}
            </div>
          }
          items={moreItems}
        />
      </div>
    </aside>
  );
}
