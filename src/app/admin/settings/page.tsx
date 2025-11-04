'use client';

import React from 'react';
import apiClient from '@/lib/api';
import { AdminSettings } from '@/types/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<AdminSettings | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newFee, setNewFee] = React.useState('');

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getBidFees();
      setSettings(res.data || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const update = async (nextFees: number[], active?: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.setBidFees(nextFees, active);
      setSettings(res.data || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-primary">Fee Settings</h1>
      {error && <div className="text-sm text-error">{error}</div>}

      <div className="rounded-xl bg-card shadow-sm ring-1 ring-border p-4">
        <div className="text-sm text-muted-foreground">Bid Fee Options</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {settings?.bidFeeOptions?.map((f) => (
            <button
              key={f}
              className={`px-3 py-1 rounded-full text-sm border ${settings.currentBidFee === f ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
              onClick={() => update(settings.bidFeeOptions, f)}
            >
              ₹{f}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input className="border border-input bg-background rounded px-3 py-2 text-sm w-40" placeholder="Add fee (₹)" value={newFee} onChange={e => setNewFee(e.target.value)} />
          <button className="border border-input rounded px-3 py-2 text-sm hover:bg-muted" onClick={() => {
            const n = Number(newFee);
            if (!Number.isFinite(n) || n <= 0) return setError('Enter a positive number');
            if (!settings) return;
            const next = Array.from(new Set([...settings.bidFeeOptions, n])).sort((a,b)=>a-b);
            update(next, settings.currentBidFee);
            setNewFee('');
          }}>Add</button>
        </div>
      </div>
    </div>
  );
}



