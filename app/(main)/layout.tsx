'use client';

import BottomNav from '@/components/layout/BottomNav';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {/* Mobile top nav */}
        <TopNav />

        {/* Page content — padded top/bottom on mobile for fixed navs */}
        <div className="flex-1 pt-14 pb-14 md:pt-0 md:pb-0">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </main>
    </div>
  );
}
