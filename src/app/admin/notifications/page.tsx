'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AdminNotificationsPage() {
  const [userIds, setUserIds] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string>('');

  const onSend = async () => {
    setSending(true);
    setResult('');
    try {
      const ids = userIds.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await apiClient.adminSendNotifications({ userIds: ids, title, message });
      if (res.success) setResult(`Sent to ${res.data?.count ?? 0} users`);
      else setResult(res.message || 'Failed');
    } catch (e: any) {
      setResult(e?.message || 'Failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl p-4 space-y-4">
      <h1 className="text-xl font-semibold">Admin: Send Notifications</h1>
      <div className="space-y-2">
        <label className="text-sm font-medium">User IDs (comma-separated)</label>
        <Input value={userIds} onChange={(e) => setUserIds(e.target.value)} placeholder="uid1, uid2" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
      </div>
      <Button onClick={onSend} disabled={sending || !title || !message}>Send</Button>
      {result && <div className="text-sm text-muted-foreground">{result}</div>}
    </div>
  );
}



