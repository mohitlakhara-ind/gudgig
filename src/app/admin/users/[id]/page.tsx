'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CustomLoader from '@/components/CustomLoader';
import apiClient from '@/lib/api';

export default function AdminUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<any | null>(null);
  const [freelancer, setFreelancer] = React.useState<any | null>(null);
  const [duration, setDuration] = React.useState<number>(1440);

  const load = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [u, f] = await Promise.all([
        apiClient.getUserById(userId),
        apiClient.getFreelancerProfile(userId).catch(() => null)
      ]);
      setUser((u as any)?.data || null);
      setFreelancer((f as any)?.data || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load user');
      setUser(null);
      setFreelancer(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => { load(); }, [load]);

  const toggleStatus = async () => {
    if (!user?._id) return;
    try {
      if (user.isActive) {
        await apiClient.toggleUserStatus(user._id, false, duration ? { durationMinutes: duration } : undefined);
      } else {
        await apiClient.toggleUserStatus(user._id, true);
      }
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to update status');
    }
  };

  const changeRole = async (newRole: 'freelancer' | 'employer' | 'admin') => {
    if (!user?._id) return;
    try {
      await apiClient.updateUser(user._id, { role: newRole } as any);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <CustomLoader size={32} color="var(--primary)" />
        <span className="ml-2 text-muted-foreground">Loading user...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User</CardTitle>
            <CardDescription>Admin view of user details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-destructive mb-4">{error || 'User not found'}</div>
            <Button variant="outline" className="bg-transparent" onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleBadge = (
    <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'admin' ? 'bg-primary/10 text-primary' : user.role === 'freelancer' ? 'bg-secondary text-foreground' : 'bg-muted text-muted-foreground'}`}>
      {user.role}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary">{user.name || 'User'} <span className="ml-2">{roleBadge}</span></h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-transparent" onClick={() => router.back()}>Back</Button>
          <Button variant="outline" className="bg-transparent" onClick={load}>Refresh</Button>
          {user.isActive && (
            <select
              className="border border-input rounded px-2 py-1 text-xs bg-background"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value, 10))}
              title="Deactivation duration"
            >
              <option value={60}>1 hour</option>
              <option value={1440}>1 day</option>
              <option value={4320}>3 days</option>
              <option value={10080}>7 days</option>
              <option value={43200}>30 days</option>
              <option value={0}>Until reactivated</option>
            </select>
          )}
          <Button onClick={toggleStatus}>{user.isActive ? 'Deactivate' : 'Activate'}</Button>
          {user.role !== 'admin' ? (
            <Button variant="outline" className="bg-transparent" onClick={() => changeRole('admin')}>Make Admin</Button>
          ) : (
            <Button variant="outline" className="bg-transparent" onClick={() => changeRole('freelancer')}>Remove Admin</Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={`/admin/chat?userId=${(user as any)?._id || ''}`}
          className="px-3 py-2 rounded bg-primary text-primary-foreground"
        >Message</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Key user information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{user.name || '—'}</span></div>
              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{user.email || '—'}</span></div>
              <div><span className="text-muted-foreground">Role:</span> <span className="font-medium capitalize">{user.role || '—'}</span></div>
              <div>
                <span className="text-muted-foreground">Status:</span>{' '}
                <span className={`font-medium ${user.isActive ? 'text-success' : 'text-muted-foreground'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                {!user.isActive && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {user.deactivatedUntil ? `Until ${new Date(user.deactivatedUntil as any).toLocaleString()}` : '(Until reactivated)'}
                  </span>
                )}
              </div>
              <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{user.location || '—'}</span></div>
              <div><span className="text-muted-foreground">Last Login:</span> <span className="font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</span></div>
              <div><span className="text-muted-foreground">Created At:</span> <span className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {freelancer && (
            <Card>
              <CardHeader>
                <CardTitle>Freelancer Summary</CardTitle>
                <CardDescription>Basic marketplace profile (read-only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Title:</span> <span className="font-medium">{freelancer.title || '—'}</span></div>
                <div><span className="text-muted-foreground">Tagline:</span> <span className="font-medium">{freelancer.tagline || '—'}</span></div>
                <div><span className="text-muted-foreground">Rate:</span> <span className="font-medium">{freelancer.hourlyRate?.min ?? '—'} - {freelancer.hourlyRate?.max ?? '—'} {freelancer.hourlyRate?.currency || ''}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{[freelancer.location?.city, freelancer.location?.country, freelancer.location?.timezone].filter(Boolean).join(' / ') || '—'}</span></div>
                <div>
                  <span className="text-muted-foreground">Primary Skills:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(freelancer.primarySkills || []).length > 0 ? (
                      (freelancer.primarySkills || []).map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-muted text-foreground text-xs">{s}</span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Skills:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(freelancer.skills || []).length > 0 ? (
                      (freelancer.skills || []).map((s: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded border text-xs">{typeof s === 'string' ? s : s?.name}</span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
                {freelancer.description && (
                  <div>
                    <span className="text-muted-foreground">About:</span>
                    <div className="mt-1 whitespace-pre-wrap">{freelancer.description}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


