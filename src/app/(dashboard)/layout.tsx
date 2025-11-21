'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import CustomLoader from '@/components/CustomLoader';

function DashboardRouteLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CustomLoader size={32} color="#1FA9FF" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function DashboardRouteLayout(props: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <CustomLoader size={32} color="#1FA9FF" />
            <p className="mt-2 text-muted-foreground">Securing dashboard…</p>
          </div>
        </div>
      }
    >
      <DashboardRouteLayoutInner {...props} />
    </Suspense>
  );
}