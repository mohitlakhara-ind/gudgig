'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient, { AdminGaInsights, AdminMetricPoint } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { log } from '@/lib/logger';

const unwrapResponse = <T,>(payload: any): T | null => {
  let current = payload;
  let guard = 0;
  while (current && typeof current === 'object' && 'data' in current && guard < 5) {
    current = current.data;
    guard += 1;
  }
  return current ?? null;
};

const formatPercent = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
};

const formatDuration = (seconds?: number) => {
  if (!seconds || Number.isNaN(seconds)) return '0s';
  const wholeSeconds = Math.max(0, Math.round(seconds));
  const mins = Math.floor(wholeSeconds / 60);
  const secs = wholeSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const formatNumber = (value?: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value ?? 0);

type MetricPoint = AdminMetricPoint;

export default function AdminAnalyticsPage() {
  const [today, setToday] = useState<MetricPoint | null>(null);
  const [recent, setRecent] = useState<MetricPoint[]>([]);
  const [insights, setInsights] = useState<AdminGaInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [t, r, ga] = await Promise.all([
          apiClient.getAdminTodayMetrics(),
          apiClient.getAdminRecentMetrics(14),
          apiClient.getAdminGaInsights(30),
        ]);
        if (!mounted) return;
        setToday(unwrapResponse<MetricPoint>(t) as MetricPoint);
        setRecent((unwrapResponse<MetricPoint[]>(r) as MetricPoint[]) || []);
        setInsights(unwrapResponse<AdminGaInsights>(ga));
      } catch (e: any) {
        log.error('admin_analytics_fetch_failed', { error: e?.message || String(e) });
        setError(e?.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const MetricCard = ({
    title,
    value,
    description,
  }: {
    title: string;
    value: string | number;
    description?: string;
  }) => (
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

  const gaOverview = insights?.overview;

  const secondaryMetrics = useMemo(
    () => [
      {
        title: 'Sessions (Today)',
        value: formatNumber(today?.sessions),
        description: 'Total GA4 sessions captured today',
      },
      {
        title: 'Engaged Sessions',
        value: formatNumber(today?.engagedSessions),
        description: 'Sessions lasting >10s, conversion, or 2+ views',
      },
      {
        title: 'Avg. Session Duration',
        value: formatDuration(today?.averageSessionDuration),
        description: 'Engagement time per session',
      },
      {
        title: 'Engagement Rate',
        value: formatPercent(today?.engagementRate),
        description: 'Engaged sessions / total sessions',
      },
    ],
    [today],
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">
          Real-time job portal analytics from Google Analytics 4 and platform telemetry
        </p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading analytics…</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Page Views (Today)" value={formatNumber(today?.pageViews)} />
            <MetricCard title="Unique Visitors (Today)" value={formatNumber(today?.uniqueVisitors)} />
            <MetricCard
              title="Errors (Today)"
              value={today?.errors ?? 0}
              description={today?.alertSent ? 'Alert sent' : undefined}
            />
            <MetricCard title="Date" value={today?.date ?? '-'} />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {secondaryMetrics.map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                description={metric.description}
              />
            ))}
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Recent Trends (Last 14 days)</CardTitle>
              <CardDescription>
                Combined platform + GA4 signals for reach, engagement, and stability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Page Views</th>
                      <th className="py-2 pr-4">Unique Visitors</th>
                      <th className="py-2 pr-4">Sessions</th>
                      <th className="py-2 pr-4">Engaged</th>
                      <th className="py-2 pr-4">Engagement Rate</th>
                      <th className="py-2 pr-4">Avg. Duration</th>
                      <th className="py-2 pr-4">Errors</th>
                      <th className="py-2 pr-4">Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((row) => (
                      <tr key={row.date} className="border-t border-border">
                        <td className="py-2 pr-4 whitespace-nowrap">{row.date}</td>
                        <td className="py-2 pr-4">{formatNumber(row.pageViews)}</td>
                        <td className="py-2 pr-4">{formatNumber(row.uniqueVisitors)}</td>
                        <td className="py-2 pr-4">{formatNumber(row.sessions)}</td>
                        <td className="py-2 pr-4">{formatNumber(row.engagedSessions)}</td>
                        <td className="py-2 pr-4">{formatPercent(row.engagementRate)}</td>
                        <td className="py-2 pr-4">{formatDuration(row.averageSessionDuration)}</td>
                        <td className="py-2 pr-4">{row.errors}</td>
                        <td className="py-2 pr-4">{row.alertSent ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {gaOverview && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>GA4 Overview (Last {insights?.range.days ?? 30} days)</CardTitle>
                  <CardDescription>
                    Page Views {formatNumber(gaOverview.pageViews)} • Sessions{' '}
                    {formatNumber(gaOverview.sessions)} • Avg. session{' '}
                    {formatDuration(gaOverview.averageSessionDuration)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-semibold">{formatNumber(gaOverview.uniqueVisitors)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engaged Sessions</p>
                    <p className="text-2xl font-semibold">{formatNumber(gaOverview.engagedSessions)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-semibold">{formatPercent(gaOverview.engagementRate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Event Count</p>
                    <p className="text-2xl font-semibold">{formatNumber(gaOverview.eventCount)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Top Countries</CardTitle>
                  <CardDescription>Where engaged sessions originate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(insights?.locations || []).map((location) => (
                    <div
                      key={location.label}
                      className="flex items-center justify-between border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{location.label}</p>
                        <p className="text-muted-foreground">
                          {formatNumber(location.users)} users · {formatNumber(location.sessions)} sessions
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{formatPercent(location.engagementRate)}</span>
                    </div>
                  ))}
                  {(insights?.locations || []).length === 0 && (
                    <p className="text-muted-foreground">No GA4 location data yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {(insights?.topPages?.length || insights?.trafficSources?.length) && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Top Content</CardTitle>
                  <CardDescription>Most viewed site sections (last {insights?.range.days ?? 30} days)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(insights?.topPages || []).map((page) => (
                    <div
                      key={page.label}
                      className="flex items-center justify-between border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{page.label}</p>
                        <p className="text-muted-foreground">
                          {formatNumber(page.pageViews)} views · {formatNumber(page.engagedSessions)} engaged
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatNumber(page.users)} users
                      </span>
                    </div>
                  ))}
                  {(insights?.topPages || []).length === 0 && (
                    <p className="text-muted-foreground">No GA4 page data available.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Sessions by source / medium</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(insights?.trafficSources || []).map((source) => (
                    <div
                      key={source.label}
                      className="flex items-center justify-between border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{source.label}</p>
                        <p className="text-muted-foreground">
                          {formatNumber(source.sessions)} sessions · {formatNumber(source.engagedSessions)} engaged
                        </p>
                      </div>
                      <span className="text-xs font-semibold">{formatPercent(source.engagementRate)}</span>
                    </div>
                  ))}
                  {(insights?.trafficSources || []).length === 0 && (
                    <p className="text-muted-foreground">No GA4 source data available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}






