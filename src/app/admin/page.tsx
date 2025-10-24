'use client';

import React from 'react';
import apiClient from '@/lib/api';
import { AdminStats } from '@/types/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getAdminStats();
      setStats(res.data || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-primary">Dashboard</h1>
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: stats?.totalJobs ?? 0 },
          { label: 'Total Bids', value: stats?.totalBids ?? 0 },
          { label: 'Revenue Generated', value: stats ? `₹${stats.totalRevenue}` : '₹0' },
          { label: 'Active Freelancers', value: stats?.activeFreelancers ?? 0 },
        ].map((c) => (
          <div key={c.label} className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
            <div className="text-sm text-muted-foreground">{c.label}</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{loading ? '—' : c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-foreground">Recent Jobs</h2>
            <a href="/admin/gigs" className="text-sm text-primary hover:text-primary/80 transition-colors">Manage Gigs</a>
          </div>
          <div className="mt-3 divide-y divide-border">
            {loading && <div className="py-6 text-sm text-muted-foreground">Loading...</div>}
            {!loading && (stats?.recentJobs?.length ? stats.recentJobs.map(j => (
              <div key={j._id} className="py-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{j.title}</div>
                  <div className="text-muted-foreground">{new Date(j.createdAt).toLocaleString()}</div>
                </div>
                <a href={`/admin/gigs/${j._id}/bids`} className="text-sm text-primary hover:text-primary/80 transition-colors">View bids</a>
              </div>
            )) : <div className="py-6 text-sm text-muted-foreground">No recent jobs</div>)}
          </div>
        </div>

        <div className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-foreground">Recent Bids</h2>
            <a href="/admin/bids" className="text-sm text-primary hover:text-primary/80 transition-colors">View All</a>
          </div>
          <div className="mt-3 divide-y divide-border">
            {loading && <div className="py-6 text-sm text-muted-foreground">Loading...</div>}
            {!loading && (stats?.recentBids?.length ? stats.recentBids.map(b => (
              <div key={b._id} className="py-3 text-sm">
                <div className="font-medium text-foreground">{b.user?.name || 'Freelancer'} placed a bid</div>
                <div className="text-muted-foreground">{b.job?.title || 'Job'} • {new Date(b.createdAt).toLocaleString()}</div>
              </div>
            )) : <div className="py-6 text-sm text-muted-foreground">No recent bids</div>)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a href="/admin/gigs" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Post New Gig</a>
        <a href="/admin/bids" className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors">View All Bids</a>
      </div>
    </div>
  );
}



