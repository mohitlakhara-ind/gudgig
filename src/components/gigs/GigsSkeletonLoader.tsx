'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface GigsSkeletonLoaderProps {
  viewMode?: 'grid' | 'list';
  count?: number;
}

export default function GigsSkeletonLoader({ 
  viewMode = 'grid', 
  count = 6 
}: GigsSkeletonLoaderProps) {
  const skeletonItems = Array.from({ length: count }, (_, i) => i);

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {skeletonItems.map((_, index) => (
          <Card key={index} className="bg-card border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-10 w-24 rounded-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {skeletonItems.map((_, index) => (
        <Card key={index} className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-full mb-3" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Skills section skeleton */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-10" />
              </div>
            </div>

            {/* Gig details skeleton */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
