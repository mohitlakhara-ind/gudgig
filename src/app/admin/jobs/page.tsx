'use client';

import React from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type PendingJob = {
  _id: string;
  title: string;
  category: string;
  createdAt: string;
  employer?: { name?: string; email?: string };
  company?: { name?: string };
};

export default function AdminJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = React.useState<PendingJob[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [q, setQ] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [auditOpen, setAuditOpen] = React.useState<string | null>(null);
  const [audit, setAudit] = React.useState<{ entries: any[]; loading: boolean; error?: string }>({ entries: [], loading: false });

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      const res = await apiClient.request(`/admin/jobs/pending?${params.toString()}`);
      const data = res?.data ?? res?.data?.data ?? [];
      const pagination = res?.pagination ?? res?.data?.pagination;
      setJobs(Array.isArray(data) ? data : []);
      setPages(pagination?.pages ?? 1);
    } catch (e: any) {
      setError(e?.message || 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [page, q, category]);

  React.useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(jobs.map(j => j._id)));
  };
  const clearSelection = () => setSelected(new Set());

  const moderate = async (action: 'approve' | 'reject', ids?: string[]) => {
    const jobIds = ids || Array.from(selected);
    if (jobIds.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.request('/admin/jobs/bulk-moderate', {
        method: 'PUT',
        body: JSON.stringify({ jobIds, action }),
        headers: { 'Content-Type': 'application/json' }
      });
      clearSelection();
      await load();
    } catch (e: any) {
      setError(e?.message || `Failed to ${action}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAudit = async (jobId: string) => {
    setAudit({ entries: [], loading: true });
    try {
      const res = await apiClient.request(`/admin/audit?entity=Job&entityId=${jobId}&limit=50`);
      setAudit({ entries: res?.data ?? [], loading: false });
    } catch (e: any) {
      setAudit({ entries: [], loading: false, error: e?.message || 'Failed to load audit' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <h1 className="text-xl font-semibold">Pending Jobs</h1>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="border rounded px-3 py-2 text-sm w-48"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Marketing">Marketing</option>
          </select>
          <button onClick={() => setPage(1) || load()} className="border rounded px-3 py-2 text-sm">Filter</button>
        </div>
      </div>

      <div className="flex gap-2">
        <button disabled={selected.size===0} onClick={() => moderate('approve')} className="bg-green-600 disabled:opacity-50 text-white px-3 py-2 rounded text-sm">Approve Selected</button>
        <button disabled={selected.size===0} onClick={() => moderate('reject')} className="bg-red-600 disabled:opacity-50 text-white px-3 py-2 rounded text-sm">Reject Selected</button>
        <button onClick={selectAll} className="border px-3 py-2 rounded text-sm">Select All</button>
        <button onClick={clearSelection} className="border px-3 py-2 rounded text-sm">Clear</button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2"></th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Employer</th>
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Posted</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            )}
            {!isLoading && jobs.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">No pending jobs</td></tr>
            )}
            {!isLoading && jobs.map(job => (
              <tr key={job._id} className="border-t">
                <td className="p-2">
                  <input type="checkbox" checked={selected.has(job._id)} onChange={() => toggleSelect(job._id)} />
                </td>
                <td className="p-2">{job.title}</td>
                <td className="p-2">{job.employer?.name || '-'}</td>
                <td className="p-2">{job.company?.name || '-'}</td>
                <td className="p-2">{job.category}</td>
                <td className="p-2">{new Date(job.createdAt).toLocaleDateString()}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => moderate('approve', [job._id])} className="px-2 py-1 text-xs rounded bg-green-600 text-white">Approve</button>
                  <button onClick={() => moderate('reject', [job._id])} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Reject</button>
                  <button onClick={() => { setAuditOpen(job._id); loadAudit(job._id); }} className="px-2 py-1 text-xs rounded border">History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="border rounded px-3 py-1 text-sm">Prev</button>
        <div className="text-sm">Page {page} of {pages}</div>
        <button disabled={page>=pages} onClick={() => setPage(p => Math.min(p+1, pages))} className="border rounded px-3 py-1 text-sm">Next</button>
      </div>

      {auditOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-[600px] max-h-[80vh] rounded-t-lg sm:rounded-lg overflow-hidden shadow-lg">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="font-semibold">Moderation History</div>
              <button className="text-sm" onClick={() => setAuditOpen(null)}>Close</button>
            </div>
            <div className="p-3 overflow-auto max-h-[70vh]">
              {audit.loading && <div className="text-sm">Loading...</div>}
              {audit.error && <div className="text-sm text-red-600">{audit.error}</div>}
              {!audit.loading && audit.entries.length === 0 && <div className="text-sm text-gray-500">No history</div>}
              <ul className="space-y-2">
                {audit.entries.map((e: any) => (
                  <li key={e._id} className="border rounded p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{e.action}</span>
                      <span className="text-gray-500">{new Date(e.createdAt).toLocaleString()}</span>
                    </div>
                    {e.details?.reason && <div className="text-gray-700">Reason: {e.details.reason}</div>}
                    {e.actorId && <div className="text-gray-500">By: {e.actorId}</div>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


