"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Testimonial = {
  _id?: string;
  id?: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  content: string;
  rating?: number;
  createdAt?: string;
};

export default function Testimonials() {
  const { user } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ content: '', rating: '5' });
  const [message, setMessage] = useState<string | null>(null);

  const draftKey = user?._id ? `testimonial-draft-${user._id}` : null;

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!user) {
      setForm({ content: '', rating: '5' });
    }
  }, [user]);

  useEffect(() => {
    if (!draftKey || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm({
          content: typeof parsed.content === 'string' ? parsed.content : '',
          rating: parsed.rating ? String(parsed.rating) : '5'
        });
      }
    } catch {
      // ignore draft parsing issues
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || typeof window === 'undefined') return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
    } catch {
      // ignore persistence issues
    }
  }, [form, draftKey]);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setItems(data.data);
      } else if (Array.isArray(data)) {
        // fallback if proxy returned raw array
        setItems(data as any);
      }
    } catch (e) {
      console.error('Failed to load testimonials', e);
    } finally {
      setLoading(false);
    }
  }

  const ratingValue = Number(form.rating);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!user) {
      setMessage('Please log in as a freelancer to share or edit your testimonial.');
      return;
    }
    if (form.content.trim().length < 20) {
      setMessage('Please share at least 20 characters about your experience.');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: user?._id,
          name: user?.name || 'Freelancer',
          email: user?.email || '',
          role: 'Freelancer',
          company: '',
          content: form.content,
          rating: Number(form.rating)
        })
      });
      const data = await resp.json();
      if (data?.success) {
        setMessage('Saved! Your testimonial was submitted (or updated) for review.');
        fetchList();
      } else {
        setMessage(data?.message || 'Submission failed');
      }
    } catch (e) {
      console.error('Submit testimonial error', e);
      setMessage('Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Testimonials</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          {loading ? (
            <div>Loading testimonials…</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground">No testimonials yet.</div>
          ) : (
            items.map((t, idx) => (
              <div key={t.id || idx} className="p-4 border rounded-lg mb-3">
                <div className="text-sm text-card-foreground">{t.content}</div>
                <div className="mt-3 text-sm text-secondary">— {t.name}{t.role ? `, ${t.role}` : ''}{t.company ? ` @ ${t.company}` : ''}</div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-medium">Share your experience</h3>
          {!user ? (
            <div className="text-sm text-muted-foreground">
              Login as a freelancer to submit or edit your testimonial. Your profile name and email will be attached automatically.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-xs text-muted-foreground border border-dashed rounded-md p-3 bg-muted/40">
                Submissions use your profile name ({user?.name || 'Unnamed'}) and email ({user?.email || 'no email'}) automatically.
              </div>
              <label className="block space-y-2">
                <div className="text-sm font-medium">Message</div>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border rounded px-2 py-2"
                  rows={4}
                  placeholder="Tell other freelancers how unlocking gigs helped you..."
                  disabled={submitting}
                />
              </label>
              <div className="space-y-2">
                <div className="text-sm font-medium">Rating</div>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Select a star rating">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm({ ...form, rating: String(value) })}
                        className="p-1"
                        aria-label={`${value} star`}
                        disabled={submitting}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            value <= ratingValue ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              {message && <div className="text-sm text-slate-600">{message}</div>}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Save testimonial'}
                </button>
                <button
                  type="button"
                  onClick={() => fetchList()}
                  className="text-sm text-secondary"
                  disabled={submitting}
                >
                  Refresh list
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// A richer, styled testimonial grid — exported as a named component