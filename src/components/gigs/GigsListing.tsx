"use client";

import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowRight, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { JobsResponse, Job } from '@/types/api';

const GM_CATEGORIES = [
  'website development',
  'graphic design',
  'content writing',
  'social media management',
  'seo',
  'app development',
  'game development',
];

function GigsListingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialCategory = params.get('category') || '';

  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.getGigs({ category: selectedCategory || undefined, query: searchTerm || undefined } as any);
        const data = (res as any)?.data as JobsResponse;
        setJobs((data as any)?.jobs || (Array.isArray(res?.data) ? (res.data as any) : []));
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
    return () => controller.abort();
  }, [selectedCategory, searchTerm]);

  const visibleJobs = (() => {
    const list = [...jobs];
    list.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sortBy === 'newest' ? db - da : da - db;
    });
    return list;
  })();

  return (
    <>
      <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Card className="shadow-sm bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Browse Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {GM_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mb-6 p-3 text-sm rounded border border-destructive/30 text-destructive bg-destructive/10">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading projects…</div>
      ) : visibleJobs.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No projects found.</div>
      ) : (
        <div className="space-y-4">
          {visibleJobs.map((job) => (
            <Card key={job._id} className="bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      {job.category && <Badge variant="outline" className="border-primary text-primary bg-transparent">{job.category}</Badge>}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-foreground mb-2">{job.title}</div>
                    <p className="text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
                    {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {job.requirements.slice(0, 3).map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <Button className="rounded-2xl" onClick={() => router.push(`/gigs/${job._id}`)}>
                      View & Bid
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function GigsListing() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading projects…</div>}>
      <GigsListingContent />
    </Suspense>
  );
}