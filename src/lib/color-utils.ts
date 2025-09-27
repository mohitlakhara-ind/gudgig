// Color Utilities - Semantic color mappings and status functions
// This file provides centralized color logic for consistent theming

import { COLORS } from './design-tokens';

// TypeScript types for color variants
export type StatusType = 'pending' | 'approved' | 'rejected' | 'in_review' | 'active' | 'inactive';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'freelance';
export type ColorVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'muted';

// Status color mappings - returns Tailwind class combinations
export const getStatusColor = (status: StatusType): { bg: string; text: string; border?: string } => {
  const statusColors: Record<StatusType, { bg: string; text: string; border?: string }> = {
    pending: { bg: 'bg-muted', text: 'text-muted-foreground' },
    approved: { bg: 'bg-success/20', text: 'text-success', border: 'border-success/20' },
    rejected: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/20' },
    in_review: { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/20' },
    active: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/20' },
    inactive: { bg: 'bg-muted', text: 'text-muted-foreground' },
  };
  return statusColors[status] || statusColors.pending;
};

// Job type color mappings
export const getTypeColor = (type: JobType): { bg: string; text: string } => {
  const typeColors: Record<JobType, { bg: string; text: string }> = {
    full_time: { bg: 'bg-primary/20', text: 'text-primary' },
    part_time: { bg: 'bg-secondary/20', text: 'text-secondary' },
    contract: { bg: 'bg-accent/20', text: 'text-accent' },
    freelance: { bg: 'bg-warning/20', text: 'text-warning' },
  };
  return typeColors[type] || typeColors.full_time;
};

// Generic variant color mappings
export const getVariantColor = (variant: ColorVariant): { bg: string; text: string; border?: string } => {
  const variantColors: Record<ColorVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/20' },
    secondary: { bg: 'bg-secondary/20', text: 'text-secondary', border: 'border-secondary/20' },
    accent: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/20' },
    success: { bg: 'bg-success/20', text: 'text-success', border: 'border-success/20' },
    warning: { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/20' },
    error: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/20' },
    muted: { bg: 'bg-muted', text: 'text-muted-foreground' },
  };
  return variantColors[variant] || variantColors.primary;
};

// Interactive state colors
export const getInteractiveColors = (baseColor: ColorVariant = 'primary') => {
  const base = getVariantColor(baseColor);
  return {
    hover: {
      bg: `hover:${base.bg}`,
      text: `hover:${base.text}`,
      border: base.border ? `hover:${base.border}` : undefined,
    },
    focus: {
      bg: `focus:${base.bg}`,
      text: `focus:${base.text}`,
      border: base.border ? `focus:${base.border}` : undefined,
      ring: `focus:ring-${baseColor}`,
    },
    active: {
      bg: `active:${base.bg.replace('/20', '/30')}`,
      text: `active:${base.text}`,
    },
  };
};

// Priority color mappings
export const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'urgent'): { bg: string; text: string } => {
  const priorities = {
    low: { bg: 'bg-muted', text: 'text-muted-foreground' },
    medium: { bg: 'bg-warning/20', text: 'text-warning' },
    high: { bg: 'bg-primary/20', text: 'text-primary' },
    urgent: { bg: 'bg-destructive/20', text: 'text-destructive' },
  };
  return priorities[priority] || priorities.medium;
};

// Notification type colors
export const getNotificationColor = (type: 'info' | 'success' | 'warning' | 'error'): { bg: string; text: string; border: string } => {
  const types = {
    info: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
    error: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
  };
  return types[type] || types.info;
};