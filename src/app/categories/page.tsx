'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';

const DEFAULT_CATEGORIES = [
  'Website Development',
  'Graphic Design',
  'Content Writing',
  'Social Media',
  'SEO',
  'App Development',
  'Video Editing',
  'Photography',
  'Data Entry',
  'Virtual Assistant',
];

export default function CategoriesPage() {
  const categories = useMemo(() => DEFAULT_CATEGORIES, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Browse Categories</h1>
            <p className="text-muted-foreground mb-10">Pick a category to see matching gigs.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((c) => {
                const slug = c.toLowerCase().replace(/\s+/g, '-');
                return (
                  <Link key={slug} href={`/gigs?category=${slug}`}>
                    <Card className="p-4 h-full hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-sm font-medium text-foreground">{c}</div>
                      <div className="text-xs text-muted-foreground">View gigs</div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



