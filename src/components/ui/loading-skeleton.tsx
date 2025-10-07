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
        <StatCardSkeleton key={i} />
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

/**
 * Skeleton for stat card loading states
 */
export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className="skeleton-circle w-12 h-12" />
        <div className="flex flex-col items-end">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton simulating a chart area
 */
export function ChartSkeleton({ height = 'h-64', className }: { height?: string; className?: string }) {
  return (
    <div className={cn('bg-card rounded-xl border border-border shadow-sm', className)}>
      <div className={cn(height, 'p-6')}>
        <div className="flex items-end gap-3 h-full">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-20 flex-1" />
          <Skeleton className="h-16 flex-1" />
          <Skeleton className="h-24 flex-1" />
          <Skeleton className="h-14 flex-1" />
          <Skeleton className="h-24 flex-1" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for recommended job card in dashboard
 */
export function RecommendedJobSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton for service card loading states
 * Matches the structure of the enhanced ServiceCard component
 */
export function ServiceCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="aspect-video w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for order card loading states
 */
export function OrderCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton for conversation list items
 */
export function ConversationListSkeleton() {
  return (
    <div className="p-3 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/**
 * Skeleton for chat messages
 */
export function MessageSkeleton({ align = 'left' }: { align?: 'left' | 'right' }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[80%] ${align === 'right' ? 'ml-auto' : ''}`}>
        <Skeleton className="h-16 w-48 rounded-2xl" />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the welcome banner during initial load
 */
export function WelcomeBannerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-muted-gradient p-6 md:p-8 mb-8">
      <div className="pr-12">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for entire dashboard section with header and list
 */
export function SectionSkeleton({ itemCount = 3, className }: { itemCount?: number; className?: string }) {
  return (
    <div className={cn('bg-card rounded-xl border border-border shadow-sm', className)}>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="px-6 py-5 space-y-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <ApplicationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}