"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Testimonial = {
  id?: string;
  name: string;
  role?: string;
  company?: string;
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
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const storageKey = useMemo(() => {
    if (!user?._id) return null;
    return `testimonial-submitted-${user._id}`;
  }, [user?._id]);

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!storageKey) {
      setHasSubmitted(false);
      return;
    }
    if (typeof window === 'undefined') return;
    try {
      setHasSubmitted(localStorage.getItem(storageKey) === 'true');
    } catch {
      setHasSubmitted(false);
    }
  }, [storageKey]);

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
      setMessage('Please log in as a freelancer to share your experience.');
      return;
    }
    if (hasSubmitted) {
      setMessage('Thanks! You have already shared a testimonial for this account.');
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
        setMessage('Thanks — your testimonial was submitted for review.');
        setForm({ content: '', rating: '5' });
        if (storageKey && typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, 'true');
          } catch {}
        }
        setHasSubmitted(true);
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
              Login as a freelancer to submit a testimonial. Your profile name and email will be attached automatically.
            </div>
          ) : hasSubmitted ? (
            <div className="text-sm text-muted-foreground">
              Thanks for sharing your thoughts! You can&apos;t edit or resubmit another testimonial with this account.
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
                  disabled={submitting || hasSubmitted}
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
                        disabled={submitting || hasSubmitted}
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
                  disabled={submitting || hasSubmitted}
                  className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : 'Submit'}
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
export function ProfessionalTestimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      avatar: '/api/placeholder/40/40',
      content: 'Easy to post and manage jobs, saved me hours! The subscription system is straightforward and the candidate quality is excellent.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Software Developer',
      avatar: '/api/placeholder/40/40',
      content: 'Found my last 3 gigs through this platform. The job alerts and WhatsApp notifications keep me updated instantly.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      avatar: '/api/placeholder/40/40',
      content: 'As an employer, I love the dashboard and how easy it is to manage multiple job postings. Highly recommend!',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Content Writer',
      avatar: '/api/placeholder/40/40',
      content: 'The platform is intuitive and the support team is amazing. Got my first job within a week of subscribing.',
      rating: 5
    },
    {
      name: 'Lisa Thompson',
      role: 'Product Manager',
      avatar: '/api/placeholder/40/40',
      content: 'The user interface is clean and modern. Finding qualified candidates has never been easier.',
      rating: 5
    },
    {
      name: 'James Wilson',
      role: 'UX Designer',
      avatar: '/api/placeholder/40/40',
      content: 'Excellent platform that connects talent with opportunity seamlessly. Professional and reliable.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">What Our Users Say</h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-card-foreground">Join thousands of satisfied candidates and employers who have found success through our platform</p>
          <div className="mt-8 w-16 h-1 mx-auto rounded-full bg-primary"></div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 group bg-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Avatar className="h-16 w-16 mr-4 border-2 border-accent">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="text-secondary-foreground font-semibold text-lg bg-secondary">
                      {testimonial.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-card-foreground">{testimonial.name}</h4>
                    <p className="text-sm font-medium text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-6">{[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current mr-1 text-warning" />
                ))}</div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 text-6xl font-serif opacity-20 text-accent">&ldquo;</div>
                  <p className="text-base leading-relaxed relative z-10 text-card-foreground">{testimonial.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center justify-center space-x-12 px-12 py-8 rounded-2xl border bg-card border-accent">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1 text-primary">1,000&#43;</div>
              <div className="text-sm font-medium text-card-foreground">Happy Users</div>
            </div>

            <div className="w-px h-12 bg-accent"></div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-1 text-primary">4.9/5</div>
              <div className="text-sm font-medium text-card-foreground">Average Rating</div>
            </div>

            <div className="w-px h-12 bg-accent"></div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-1 text-primary">24/7</div>
              <div className="text-sm font-medium text-card-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}