import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { STAT_CARD, COLORS } from '@/lib/design-tokens';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  tooltip?: string;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export default function StatCard({ label, value, icon: Icon, iconColor, trend, tooltip, onClick, className, loading = false }: StatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (loading) {
    return (
      <div className={cn('bg-card rounded-xl border border-border shadow-sm p-6 transition-transform', className)}>
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <div className="flex flex-col items-end">
            <div className="h-8 w-16 mb-2 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const interactiveProps = onClick
    ? { role: 'button' as const, tabIndex: 0, onClick }
    : {};

  return (
    <Card
      className={cn('relative bg-card rounded-xl border border-border shadow-sm p-6 hover:scale-[1.02] transition-transform', onClick && 'cursor-pointer', className)}
      title={tooltip}
      aria-label={`${label}: ${value}`}
      {...interactiveProps}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6" style={{ color: iconColor || COLORS.PRIMARY }} />
          </div>
          <div className="flex-1 text-right">
            <div className="text-3xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground font-medium">{label}</div>
            {trend && (
              <div className={cn('text-xs mt-1 inline-flex items-center', trend.direction === 'up' ? 'text-green-600' : 'text-red-600')}>
                <span className="font-medium">{trend.direction === 'up' ? '+' : '-'}{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {tooltip && (
        <div className={cn('absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 left-1/2 -translate-x-1/2 bottom-full mb-2', showTooltip && 'opacity-100')} role="tooltip">
          {tooltip}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1" />
        </div>
      )}
    </Card>
  );
}


