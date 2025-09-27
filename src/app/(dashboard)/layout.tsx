'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SecondaryNavigation from '@/components/SecondaryNavigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <SecondaryNavigation />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}