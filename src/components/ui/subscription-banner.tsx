"use client";
import React from 'react';
import { Button } from '@/components/ui/button';

type BannerType = 'info' | 'warning' | 'success';

export interface SubscriptionBannerProps {
  type?: BannerType;
  title: string;
  message?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  onDismiss?: () => void;
  countdownText?: string;
}

export default function SubscriptionBanner({ type = 'info', title, message, ctaLabel, onCtaClick, onDismiss, countdownText }: SubscriptionBannerProps) {
  const colors: Record<BannerType, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };
  return (
    <div className={`w-full border rounded-md px-4 py-3 flex items-start justify-between gap-4 ${colors[type]}`}>
      <div>
        <div className="font-medium">{title}</div>
        {message && <div className="text-sm opacity-90 mt-1">{message}</div>}
        {countdownText && <div className="text-xs opacity-75 mt-1">{countdownText}</div>}
      </div>
      <div className="flex items-center gap-2">
        {ctaLabel && (
          <Button size="sm" onClick={onCtaClick} className="shrink-0">
            {ctaLabel}
          </Button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="text-sm underline opacity-80">Dismiss</button>
        )}
      </div>
    </div>
  );
}


