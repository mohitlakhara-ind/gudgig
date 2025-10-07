'use client';

import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
}

export function ResponsiveContainer({ 
  children, 
  className, 
  variant = 'default' 
}: ResponsiveContainerProps) {
  const variantClasses = {
    default: 'max-w-7xl mx-auto',
    narrow: 'max-w-4xl mx-auto',
    wide: 'max-w-8xl mx-auto',
    full: 'w-full'
  };

  return (
    <div className={cn(
      'w-full px-3 sm:px-4 lg:px-6',
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
}

export default ResponsiveContainer;


