'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { User } from '@/types/api';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);
  const [role, setRole] = React.useState<string>('');
  const [isActive, setIsActive] = React.useState<string>('');
  const [search, setSearch] = React.useState('');
  const [durationByUser, setDurationByUser] = React.useState<Record<string, number>>({});

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus === true) {
        const durationMinutes = durationByUser[userId];
        await apiClient.toggleUserStatus(userId, false, durationMinutes ? { durationMinutes } : undefined);
      } else {
        await apiClient.toggleUserStatus(userId, true);
      }
      // Refresh the list after successful toggle
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle user status');
    }
  };

  const changeRole = async (userId: string, role: User['role']) => {
    try {
      await apiClient.updateUser(userId, { role });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to update role');
    }
  };

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (role) params.role = role;
      if (search) params.search = search;
      if (isActive !== '') params.isActive = isActive === 'active';

      const res = await apiClient.getAllUsers(params);
      setUsers(res.data?.users || []);
      setTotalPages(res.data?.pages || 1);
      setTotalUsers(res.data?.total || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, role, isActive, search]);

  React.useEffect(() => { load(); }, [load]);

  const stats = React.useMemo(() => {
    const total = totalUsers; // Use total from API response instead of current page
    const active = users.filter(u => u.isActive).length;
    const freelancers = users.filter(u => u.role === 'freelancer').length;
    const admins = users.filter(u => u.role === 'admin').length;
    return { total, active, freelancers, admins };
  }, [users, totalUsers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">User Management</h1>
      </div>

      <div className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border border-input rounded px-3 py-2 text-sm bg-background"
            placeholder="Search name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="border border-input rounded px-3 py-2 text-sm bg-background" value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="freelancer">Freelancer</option>
            <option value="admin">Admin</option>
          </select>
          <select className="border border-input rounded px-3 py-2 text-sm bg-background" value={isActive} onChange={e => setIsActive(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="border border-input rounded px-3 py-2 text-sm hover:bg-muted" onClick={() => { setPage(1); load(); }}>Apply Filters</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
          <div className="text-sm text-muted-foreground">Total Users</div>
          <div className="text-2xl font-semibold">{loading ? '—' : stats.total}</div>
        </div>
        <div className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
          <div className="text-sm text-muted-foreground">Active Users</div>
          <div className="text-2xl font-semibold">{loading ? '—' : stats.active}</div>
        </div>
        <div className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
          <div className="text-sm text-muted-foreground">Freelancers</div>
          <div className="text-2xl font-semibold">{loading ? '—' : stats.freelancers}</div>
        </div>
        <div className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
          <div className="text-sm text-muted-foreground">Admins</div>
          <div className="text-2xl font-semibold">{loading ? '—' : stats.admins}</div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/20 bg-error/10 text-error p-3 text-sm">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={load}
              className="text-error underline text-sm hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto rounded border scrollbar-thin">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Last Login</th>
              <th className="p-2 text-left">Created At</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading users...</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No users found. Try adjusting your filters.
                </td>
              </tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-2">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-muted-foreground text-xs">{u.email}</div>
                </td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'}`}>{u.role}</span>
                </td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="p-2">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</td>
                <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-sm text-primary hover:text-primary/80" 
                      disabled={false} 
                      title="View details"
                      onClick={() => router.push(`/admin/users/${u._id}`)}
                    >
                      View Details
                    </button>
                    {u.role !== 'admin' ? (
                      <button
                        className="text-sm text-primary hover:text-primary/80"
                        onClick={() => changeRole(u._id, 'admin')}
                        title="Promote to admin"
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => changeRole(u._id, 'freelancer')}
                        title="Demote to freelancer"
                      >
                        Remove Admin
                      </button>
                    )}
                    {u.isActive ? (
                      <>
                        <select
                          className="border border-input rounded px-2 py-1 text-xs bg-background"
                          value={durationByUser[u._id] ?? 1440}
                          onChange={e => setDurationByUser(prev => ({ ...prev, [u._id]: parseInt(e.target.value, 10) }))}
                          title="Deactivation duration"
                        >
                          <option value={60}>1 hour</option>
                          <option value={1440}>1 day</option>
                          <option value={4320}>3 days</option>
                          <option value={10080}>7 days</option>
                          <option value={43200}>30 days</option>
                          <option value={0}>Until reactivated</option>
                        </select>
                        <button 
                          className="text-sm text-warning hover:text-warning" 
                          onClick={() => toggleUserStatus(u._id, u.isActive)}
                          title="Deactivate user"
                        >
                          Deactivate
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground">
                          {u.deactivatedUntil ? `Until ${new Date(u.deactivatedUntil as any).toLocaleString()}` : 'Until reactivated'}
                        </span>
                        <button 
                          className="text-sm text-success hover:text-success" 
                          onClick={() => toggleUserStatus(u._id, u.isActive)}
                          title="Activate user"
                        >
                          Activate
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {users.length} of {totalUsers} users
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            className="border rounded px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="text-sm">Page {page} of {totalPages}</div>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)} 
            className="border rounded px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}






