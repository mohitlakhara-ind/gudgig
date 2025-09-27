// Design Tokens - Centralized design system constants
// This file serves as the single source of truth for design values

// Color Palette - Professional Colors
export const COLORS = {
  // Primary Colors
  PROFESSIONAL_BLUE: '#2563eb',
  MUTED_GRAY_BLUE: '#64748b',
  SUBTLE_ACCENT: '#10b981',

  // Semantic Colors
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  DESTRUCTIVE: '#ef4444',

  // Neutral Colors
  BACKGROUND: '#F6F7F8',
  FOREGROUND: '#0A0908',
  MUTED: '#f1f5f9',
  MUTED_FOREGROUND: '#64748b',
  BORDER: '#e2e8f0',
  INPUT: '#e2e8f0',
  RING: '#2563eb',

  // Card Colors
  CARD: '#FFFFFF',
  CARD_FOREGROUND: '#0A0908',

  // Popover
  POPOVER: '#FFFFFF',
  POPOVER_FOREGROUND: '#0A0908',

  // Dark Mode Colors
  DARK_BACKGROUND: '#0A0908',
  DARK_FOREGROUND: '#F6F7F8',
  DARK_CARD: '#1F1F1F',
  DARK_MUTED: '#334155',
  DARK_BORDER: '#475569',

  // Additional Semantic Mappings
  PRIMARY: '#2563eb',
  SECONDARY: '#64748b',
  ACCENT: '#10b981',
  
  // Emotional Semantic Colors
  TRUST: '#1e3a8a',          // deep blue
  WARMTH: '#ea580c',         // warm orange
  EMPOWERMENT: '#7c3aed',    // vibrant purple

  // Dark variants
  DARK_TRUST: '#93c5fd',
  DARK_WARMTH: '#fdba74',
  DARK_EMPOWERMENT: '#c4b5fd',
} as const;

// Spacing Scale
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    conversationalLg: '1.125rem',
    conversationalXl: '1.25rem',
    conversationalDisplay: '2.5rem'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    conversational: '1.75'
  },
} as const;

// Border Radius
export const BORDER_RADIUS = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  full: '9999px',
} as const;

// Shadows
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  soft: '0 2px 8px rgb(0 0 0 / 0.04)',
  strong: '0 4px 16px rgb(0 0 0 / 0.12)',
} as const;

// Animations
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  keyframes: {
    fadeIn: 'fade-in 0.5s ease-out',
    slideUp: 'slide-up 0.3s ease-out',
    scaleIn: 'scale-in 0.2s ease-out',
  },
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },
} as const;

// Utility Functions for Color Combinations
export const getStatusColor = (status: string) => {
  const statusColors: Record<string, { bg: string; text: string; border?: string }> = {
    pending: { bg: 'bg-muted', text: 'text-muted-foreground' },
    approved: { bg: 'bg-success/20', text: 'text-success', border: 'border-success/20' },
    rejected: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/20' },
    in_review: { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/20' },
    active: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/20' },
    inactive: { bg: 'bg-muted', text: 'text-muted-foreground' },
  };
  return statusColors[status] || statusColors.pending;
};

export const getTypeColor = (type: string) => {
  const typeColors: Record<string, { bg: string; text: string }> = {
    full_time: { bg: 'bg-primary/20', text: 'text-primary' },
    part_time: { bg: 'bg-secondary/20', text: 'text-secondary' },
    contract: { bg: 'bg-accent/20', text: 'text-accent' },
    freelance: { bg: 'bg-warning/20', text: 'text-warning' },
  };
  return typeColors[type] || typeColors.full_time;
};

export const getInteractiveStateColors = (state: 'hover' | 'focus' | 'active') => {
  const states = {
    hover: { bg: 'hover:bg-primary/10', text: 'hover:text-primary' },
    focus: { bg: 'focus:bg-primary/10', text: 'focus:text-primary', ring: 'focus:ring-primary' },
    active: { bg: 'active:bg-primary/20', text: 'active:text-primary' },
  };
  return states[state];
};

// Typography Combinations
export const TYPOGRAPHY_COMBINATIONS = {
  heading1: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  heading2: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  heading3: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  body: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  caption: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  conversationalHeading: {
    fontSize: TYPOGRAPHY.fontSize.conversationalDisplay,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  conversationalBody: {
    fontSize: TYPOGRAPHY.fontSize.conversationalLg,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    lineHeight: TYPOGRAPHY.lineHeight.conversational,
  },
} as const;

// Breakpoints (for reference)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
} as const;

// Export types for TypeScript
export type ColorKey = keyof typeof COLORS;
export type SpacingKey = keyof typeof SPACING;
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type BorderRadiusKey = keyof typeof BORDER_RADIUS;
export type ShadowKey = keyof typeof SHADOWS;
export type AnimationKey = keyof typeof ANIMATIONS;
export type BreakpointKey = keyof typeof BREAKPOINTS;
export type ZIndexKey = keyof typeof Z_INDEX;