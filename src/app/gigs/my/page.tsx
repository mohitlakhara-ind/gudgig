'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type AppliedGig = {
  id: string;
  jobId: string;
  title: string;
  company: string;
  status: string;
  appliedAt: string;
};

export default function MyGigsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gigs, setGigs] = useState<AppliedGig[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.getApplications({ limit: 50, page: 1 }).catch(() => null as any);
        const items = (res?.data || []).map((app: any) => {
          const job = app?.job || app?.jobId || {};
          return {
            id: app?._id,
            jobId: typeof app?.job === 'string' ? app.job : (job?._id || ''),
            title: job?.title || 'Untitled',
            company: job?.company || job?.employer?.name || 'Unknown',
            status: app?.status || 'pending',
            appliedAt: app?.createdAt || new Date().toISOString(),
          } as AppliedGig;
        });
        setGigs(items);
      } catch (e: any) {
        setError(e?.message || 'Failed to load your gigs');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-muted-foreground">Loading your gigs…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="text-red-600">{error}</div>
        <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Gigs (Applied)</h1>
        <Button asChild>
          <Link href="/gigs">Browse Gigs</Link>
        </Button>
      </div>

      {gigs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">You haven't applied to any gigs yet.</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {gigs.map((g) => (
            <Card key={g.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{g.title}</div>
                    <div className="text-sm text-muted-foreground">{g.company}</div>
                    <div className="text-xs text-muted-foreground mt-1">Applied on {new Date(g.appliedAt).toLocaleDateString()}</div>
                    <div className="text-xs mt-1">Status: <span className="font-medium">{g.status}</span></div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/gigs/${g.jobId}`}>View Gig</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}











