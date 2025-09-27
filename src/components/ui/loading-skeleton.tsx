import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  );
}

// Job Card Skeleton
export function JobCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 text-center">
          <Skeleton className="h-8 w-12 mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Application Card Skeleton
export function ApplicationCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <div className="flex items-center text-xs">
        <Skeleton className="h-3 w-16 mr-4" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="glass-card border-0 shadow-strong p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20 mt-1" />
        </div>
      </div>
      <Skeleton className="h-2 w-full mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 glass rounded-lg">
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center p-3 glass rounded-lg">
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Generic Skeletons
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 'w-10 h-10', className }: { size?: string; className?: string }) {
  return <Skeleton className={cn('rounded-full', size, className)} />;
}

export function SkeletonRectangle({ width = 'w-full', height = 'h-4', className }: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <Skeleton className={cn(width, height, className)} />;
}

export default Skeleton;