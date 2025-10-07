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
      <h1 className="text-xl font-semibold" style={{ color: '#0966C2' }}>Fee Settings</h1>
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
        <div className="text-sm text-gray-500">Bid Fee Options</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {settings?.bidFeeOptions?.map((f) => (
            <button
              key={f}
              className={`px-3 py-1 rounded-full text-sm border ${settings.currentBidFee === f ? 'text-white' : ''}`}
              style={settings.currentBidFee === f ? { backgroundColor: '#0966C2', borderColor: '#0966C2' } : {}}
              onClick={() => update(settings.bidFeeOptions, f)}
            >
              ₹{f}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input className="border rounded px-3 py-2 text-sm w-40" placeholder="Add fee (₹)" value={newFee} onChange={e => setNewFee(e.target.value)} />
          <button className="border rounded px-3 py-2 text-sm" onClick={() => {
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



