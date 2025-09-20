'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'md'
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = `bg-white rounded-xl shadow-sm transition-all duration-300 ${
    hover ? 'hover:shadow-lg hover:-translate-y-1' : ''
  } ${paddingClasses[padding]} ${className}`;

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}
