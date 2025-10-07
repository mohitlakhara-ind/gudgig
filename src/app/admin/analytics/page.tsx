'use client';

import React from 'react';
import apiClient from '@/lib/api';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { log } from "@/lib/logger";

type TodayMetrics = { date: string; errors: number; pageViews: number; uniqueVisitors: number; alertSent: boolean };

export default function AdminAnalyticsPage() {
  const [today, setToday] = useState<TodayMetrics | null>(null);
  const [recent, setRecent] = useState<TodayMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [t, r] = await Promise.all([
          apiClient.getAdminTodayMetrics(),
          apiClient.getAdminRecentMetrics(14)
        ]);
        if (!mounted) return;
        setToday((t as any)?.data || (t as any)?.data?.data || (t as any)?.data?.data?.data || (t as any)?.data?.data?.data?.data || (t as any)?.data);
        setRecent((r as any)?.data || []);
      } catch (e: any) {
        log.error('admin_analytics_fetch_failed', { error: e?.message || String(e) });
        setError(e?.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const MetricCard = ({ title, value, description }: { title: string; value: string | number; description?: string }) => (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold mt-4">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">Daily viewers, unique visitors, and error trends</p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading analytics…</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Page Views (Today)" value={today?.pageViews ?? 0} />
            <MetricCard title="Unique Visitors (Today)" value={today?.uniqueVisitors ?? 0} />
            <MetricCard title="Errors (Today)" value={today?.errors ?? 0} description={today?.alertSent ? 'Alert sent' : undefined} />
            <MetricCard title="Date" value={today?.date ?? '-'} />
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Recent Trends (Last 14 days)</CardTitle>
              <CardDescription>Page views, unique visitors, and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Page Views</th>
                      <th className="py-2 pr-4">Unique Visitors</th>
                      <th className="py-2 pr-4">Errors</th>
                      <th className="py-2 pr-4">Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((row) => (
                      <tr key={row.date} className="border-t border-border">
                        <td className="py-2 pr-4">{row.date}</td>
                        <td className="py-2 pr-4">{row.pageViews}</td>
                        <td className="py-2 pr-4">{row.uniqueVisitors}</td>
                        <td className="py-2 pr-4">{row.errors}</td>
                        <td className="py-2 pr-4">{row.alertSent ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}






