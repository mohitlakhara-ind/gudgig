'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

type RemoteTestimonial = {
  id?: string;
  _id?: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar?: string;
};

const BACKEND_ORIGIN =
  (typeof window !== 'undefined' && (window as any).__BACKEND_URL__) ||
  (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');

async function fetchFromSources(limit = 6): Promise<RemoteTestimonial[]> {
  const sources = [
    `/api/testimonials?limit=${limit}`,
    BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api/testimonials/public?limit=${limit}` : null,
  ].filter(Boolean) as string[];

  for (const url of sources) {
    try {
      const resp = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      if (list.length > 0) {
        return list;
      }
    } catch (err) {
      console.warn(`Testimonials fetch failed for ${url}`, err);
    }
  }

  return [];
}

export default function ProfessionalTestimonials() {
  const [testimonials, setTestimonials] = useState<RemoteTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTestimonials() {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchFromSources(6);
        if (!cancelled) {
          setTestimonials(list);
        }
      } catch (err) {
        console.error('Failed to load homepage testimonials', err);
        if (!cancelled) {
          setError('Testimonials are unavailable right now.');
          setTestimonials([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTestimonials();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">What Our Users Say</h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-card-foreground">
            Join thousands of satisfied candidates and employers who have found success through our platform
          </p>
          <div className="mt-8 w-16 h-1 mx-auto rounded-full bg-primary"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {loading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={`testimonial-skeleton-${idx}`} className="border-0 bg-card animate-pulse">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}

          {!loading && error && (
            <Card className="md:col-span-2 lg:col-span-3 border-dashed border-warning bg-card">
              <CardContent className="p-8 text-center text-warning">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && testimonials.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 border-dashed border-muted-foreground/40 bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                No testimonials yet. Be the first to share your experience!
              </CardContent>
            </Card>
          )}

          {!loading &&
            !error &&
            testimonials.map((testimonial) => (
              <Card
                key={testimonial.id || testimonial._id || testimonial.name}
                className="hover:shadow-xl transition-all duration-300 border-0 group bg-card"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Avatar className="h-16 w-16 mr-4 border-2 border-accent">
                      <AvatarImage src={testimonial.avatar || '/api/placeholder/40/40'} alt={testimonial.name} />
                      <AvatarFallback className="text-secondary-foreground font-semibold text-lg bg-secondary">
                        {testimonial.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-card-foreground">{testimonial.name}</h4>
                      <p className="text-sm font-medium text-muted-foreground">
                        {testimonial.role || testimonial.company || 'Community Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-6">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                      <Star
                        key={`${testimonial.id || testimonial._id || testimonial.name}-star-${i}`}
                        className="h-5 w-5 fill-current mr-1 text-warning"
                      />
                    ))}
                  </div>

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

