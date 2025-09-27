'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading admin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r bg-white dark:bg-gray-900 p-4 space-y-4 sticky top-0 h-screen hidden md:block">
        <div className="text-lg font-semibold">Admin</div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/admin/jobs" className="hover:underline">Job Moderation</Link>
          <Link href="/admin/users" className="hover:underline">User Management</Link>
          <Link href="/admin/subscriptions" className="hover:underline">Subscription Analytics</Link>
          <Link href="/admin/settings" className="hover:underline">System Settings</Link>
        </nav>
      </aside>
      <div className="flex flex-col min-h-screen">
        <header className="border-b bg-white dark:bg-gray-900 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">Admin Dashboard</div>
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:block">{user?.name}</div>
            <div className="text-gray-400">Role: Admin</div>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}


