'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      // Placeholder endpoint — replace with your real subscription API
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || 'Subscription failed');
      }

      setMessage({ type: 'success', text: 'Thanks — you are subscribed!' });
      setEmail('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Subscription failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-surface-gradient relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-secondary/10 blur-2xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl border border-border bg-card/70 backdrop-blur-md shadow-xl overflow-hidden px-6 py-10">
            <div className="absolute inset-0 bg-card-sheen" />
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 border border-border text-xs uppercase tracking-wider text-muted-foreground mb-4">
                <Mail className="w-3 h-3 text-primary" />
                Stay Updated
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
                Join our mailing list
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Get curated leads and platform updates straight to your inbox. No spam — unsubscribe anytime.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <input
                  aria-label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full sm:flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />

                <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
                  Subscribe
                </Button>
              </form>

              {message && (
                <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-destructive'}`}>
                  {message.text}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
