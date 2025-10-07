import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DASHBOARD } from '@/lib/design-tokens';

export interface DismissibleBannerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  defaultDismissed?: boolean;
  onDismiss?: () => void;
  variant?: 'default' | 'compact';
}

const storageKeyFor = (id: string) => `dashboard-banner-dismissed-${id}`;

export default function DismissibleBanner({
  id,
  children,
  className,
  defaultDismissed = false,
  onDismiss,
  variant = 'default',
}: DismissibleBannerProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(defaultDismissed);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKeyFor(id));
        if (stored === 'true') setIsDismissed(true);
      }
    } catch {}
  }, [id]);

  const handleDismiss = () => {
    try {
      setIsDismissed(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKeyFor(id), 'true');
      }
    } catch {}
    if (onDismiss) onDismiss();
  };

  if (isDismissed) return null;

  return (
    <div
      role="region"
      aria-label="Welcome banner"
      className={cn(
        'relative overflow-hidden rounded-2xl bg-banner-gradient text-primary-foreground p-6 md:p-8 mb-8 transition-all duration-500',
        variant === 'compact' ? 'min-h-[140px] py-4 md:py-6' : 'min-h-[280px]',
        className
      )}
      style={{ maxHeight: variant === 'compact' ? undefined : DASHBOARD.welcomeBannerHeight.expanded }}
    >
      <Button
        aria-label="Dismiss banner"
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
        onClick={handleDismiss}
      >
        <X className="h-5 w-5" />
      </Button>
      <div className="pr-12">{children}</div>
    </div>
  );
}


