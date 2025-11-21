'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import CustomLoader from '@/components/CustomLoader';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) return;
    const next = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    const actualUser = (user as any)?.data || user;
    if (!actualUser) {
      router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
      return;
    }
    const role = String((actualUser as any)?.role || '').toLowerCase();
    if (role !== 'admin') {
      router.replace('/');
    }
  }, [user, isLoading, router, pathname, searchParams]);

  const actualUser = (user as any)?.data || user;
  const role = String((actualUser as any)?.role || '').toLowerCase();
  if (isLoading || !actualUser || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CustomLoader size={32} color="#0966C2" />
        <span className="ml-2 text-muted-foreground">Loading admin...</span>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function AdminLayout(props: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size={32} color="#0966C2" />
          <span className="ml-2 text-muted-foreground">Preparing console…</span>
        </div>
      }
    >
      <AdminLayoutInner {...props} />
    </Suspense>
  );
}


