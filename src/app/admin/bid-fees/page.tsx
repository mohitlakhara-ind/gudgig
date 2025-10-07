'use client';

import React from 'react';
import apiClient from '@/lib/api';
import { AdminSettings } from '@/types/api';

export default function AdminBidFeesPage() {
  const [settings, setSettings] = React.useState<AdminSettings | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [newFee, setNewFee] = React.useState<string>('');

  const load = React.useCallback(async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await apiClient.getBidFees();
      setSettings(res.data || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load bid fee settings');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const activateFee = async (fee: number) => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updatedFees = [...settings.bidFeeOptions];
      const res = await apiClient.setBidFees(updatedFees, fee);
      setSettings(res.data || null);
      setMessage('Active bid fee updated successfully');
    } catch (e: any) {
      setError(e?.message || 'Failed to update active fee');
    } finally {
      setSaving(false);
    }
  };

  const addFee = async () => {
    if (!settings) return;
    const value = Number(newFee);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Please enter a valid positive number');
      return;
    }
    if (settings.bidFeeOptions.includes(value)) {
      setError('Fee already exists');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updatedFees = [...settings.bidFeeOptions, value].sort((a, b) => a - b);
      const res = await apiClient.setBidFees(updatedFees, settings.currentBidFee);
      setSettings(res.data || null);
      setNewFee('');
      setMessage('Fee option added');
    } catch (e: any) {
      setError(e?.message || 'Failed to add fee');
    } finally {
      setSaving(false);
    }
  };

  const removeFee = async (fee: number) => {
    if (!settings) return;
    if (fee === settings.currentBidFee) {
      setError('Cannot remove the currently active fee');
      return;
    }
    if (!confirm('Are you sure you want to remove this fee option?')) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updatedFees = settings.bidFeeOptions.filter(f => f !== fee);
      const res = await apiClient.setBidFees(updatedFees, settings.currentBidFee);
      setSettings(res.data || null);
      setMessage('Fee option removed');
    } catch (e: any) {
      setError(e?.message || 'Failed to remove fee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: '#0966C2' }}>Bid Fee Configuration</h1>
        <button className="border rounded px-3 py-2 text-sm" onClick={load} disabled={loading}>Refresh</button>
      </div>

      <p className="text-sm text-gray-600">Configure bid fee options used when freelancers place bids. Choose an active fee and manage available fee options.</p>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
          <div className="text-sm text-gray-500">Current Active Fee</div>
          <div className="mt-2 text-3xl font-semibold">{settings ? `₹${settings.currentBidFee}` : (loading ? '—' : 'N/A')}</div>
          <div className="mt-1 text-xs text-gray-500">Active since —</div>
          <div className="mt-2"><span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700">Active</span></div>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4 md:col-span-2">
          <div className="text-sm font-medium mb-2">Available Fee Options</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {settings?.bidFeeOptions.map(fee => {
              const isActive = fee === settings.currentBidFee;
              return (
                <button
                  key={fee}
                  className={`rounded-lg border px-3 py-3 text-sm transition ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => !isActive && activateFee(fee)}
                  disabled={saving}
                >
                  ₹{fee}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            className="border rounded px-3 py-2 text-sm w-full sm:w-64"
            type="number"
            min={1}
            placeholder="Enter new fee (₹)"
            value={newFee}
            onChange={e => setNewFee(e.target.value)}
          />
          <button className="border rounded px-3 py-2 text-sm" onClick={addFee} disabled={saving}>Add Fee Option</button>
          <div className="text-xs text-gray-500">Fee should be in rupees (₹), positive values only.</div>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
        <div className="text-sm font-medium mb-2">Fee Management</div>
        <div className="overflow-auto rounded border scrollbar-thin">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings?.bidFeeOptions.map(fee => (
                <tr key={fee} className="border-t">
                  <td className="p-2">₹{fee}</td>
                  <td className="p-2">{settings.currentBidFee === fee ? <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700">Active</span> : '-'}</td>
                  <td className="p-2">
                    <button className="text-sm text-red-600 disabled:text-gray-400" disabled={saving || settings.currentBidFee === fee} onClick={() => removeFee(fee)}>Remove</button>
                  </td>
                </tr>
              ))}
              {!settings && !loading && (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">No settings loaded</td></tr>
              )}
              {loading && (
                <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
        <div className="text-sm font-medium mb-1">Impact analysis</div>
        <div className="text-sm text-gray-600">Impact analysis coming soon</div>
        <div className="mt-2 h-28 rounded border border-dashed flex items-center justify-center text-xs text-gray-500">[Charts placeholder: bid volume vs fee amount]</div>
      </div>
    </div>
  );
}






