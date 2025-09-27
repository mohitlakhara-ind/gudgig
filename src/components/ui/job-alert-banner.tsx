'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  className?: string;
};

export default function JobAlertBanner({ className }: Props) {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const onSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email');
      setStatus('error');
      return;
    }
    try {
      setStatus('loading');
      setMessage('');
      // Integrate with notifications API if available
      // await apiClient.subscribeJobAlerts({ email })
      await new Promise(r => setTimeout(r, 600));
      setStatus('success');
      setMessage('You are in! We will send you real opportunities, not noise.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className={`rounded-2xl border border-border p-4 sm:p-6 bg-card/80 backdrop-blur ${className || ''}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-primary mb-1">Job Alerts</div>
          <h3 className="text-xl font-semibold text-foreground">Get notified when someone is looking for your magic</h3>
          <p className="text-sm text-muted-foreground">Real opportunities, not noise. Join the community and get curated matches.</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full md:w-64"
            aria-label="Email address"
          />
          <Button onClick={onSubscribe} disabled={status==='loading'}>
            {status==='loading' ? 'Subscribing…' : isAuthenticated ? 'Subscribe' : 'Join & Subscribe'}
          </Button>
        </div>
      </div>
      {message && (
        <div className={`mt-2 text-sm ${status==='error' ? 'text-destructive' : 'text-muted-foreground'}`}>{message}</div>
      )}
    </div>
  );
}


