import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  href?: string;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  illustration?: 'default' | 'search' | 'inbox' | 'calendar';
}

export default function EmptyState({ icon: Icon, title, description, action, secondaryAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)} role="status" aria-live="polite">
      <div className="relative mb-4">
        <div className="absolute inset-0 w-28 h-28 rounded-full bg-muted/30 -z-10 left-1/2 -translate-x-1/2" />
        <Icon className="w-16 h-16 text-muted-foreground opacity-50 mb-4" aria-hidden="true" />
      </div>
      <div className="text-lg font-semibold text-foreground mb-2">{title}</div>
      <div className="text-sm text-muted-foreground max-w-sm">{description}</div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6">
          {action && (
            <Button onClick={action.onClick} asChild={!!action.href}>
              {action.href ? <a href={action.href}>{action.label}</a> : <span>{action.label}</span>}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} asChild={!!secondaryAction.href}>
              {secondaryAction.href ? <a href={secondaryAction.href}>{secondaryAction.label}</a> : <span>{secondaryAction.label}</span>}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}


