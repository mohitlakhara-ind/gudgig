"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Bid } from '@/types/api';

type AdminBid = Bid & { userId: string | { _id: string; name?: string } };

export default function AdminJobBidsPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id as string;
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.getJobBids(jobId);
        const list = res?.data || [];
        setBids(list as unknown as AdminBid[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bids for Job #{jobId}</h1>
      {error && <div className="text-sm text-error">{error}</div>}
      {loading ? (
        <div className="text-sm">Loading...</div>
      ) : (
        <div className="overflow-auto rounded border scrollbar-thin">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Freelancer</th>
                <th className="p-2 text-left">Quotation</th>
                <th className="p-2 text-left">Bid Fee Paid</th>
                <th className="p-2 text-left">Payment Status</th>
                <th className="p-2 text-left">Submitted</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bids.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No bids yet</td></tr>
              )}
              {bids.map((b: any, idx: number) => (
                <tr
                  key={(() => {
                    const uid = (typeof b?.userId === 'object' ? b?.userId?._id : b?.userId) || b?.freelancer?._id || b?.user?._id || 'unknown';
                    return b?._id ?? `${uid}-${b?.createdAt ?? idx}`;
                  })()}
                  className="border-t"
                >
                  <td className="p-2">{(() => {
                    if (typeof b?.userId === 'object') return b?.userId?.name || b?.userId?._id || '-';
                    if (b?.freelancer) return b?.freelancer?.name || b?.freelancer?._id || '-';
                    if (b?.user) return b?.user?.name || b?.user?._id || '-';
                    return b?.userId || '-';
                  })()}</td>
                  <td className="p-2">{b.quotation ? `₹${b.quotation}` : '-'}</td>
                  <td className="p-2">{b.bidFeePaid ? `₹${b.bidFeePaid}` : '₹0'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${b.paymentStatus === 'succeeded' ? 'bg-success/10 text-success' : b.paymentStatus === 'failed' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}`}>{b.paymentStatus}</span>
                  </td>
                  <td className="p-2">{b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'}</td>
                  <td className="p-2">
                    <a
                      className="text-sm text-primary hover:text-primary/80"
                      href={`/admin/chat?userId=${(() => {
                        const uid = (typeof b?.userId === 'object' ? b?.userId?._id : b?.userId) || b?.freelancer?._id || b?.user?._id || '';
                        return encodeURIComponent(String(uid));
                      })()}`}
                    >
                      Start Chat
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


