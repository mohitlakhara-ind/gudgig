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

  const baseClasses = `bg-white bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-gray-200 rounded-2xl shadow-md transition-all duration-300 ${
    hover ? 'hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 hover:bg-gradient-to-tr hover:from-primary/5' : ''
  } ${paddingClasses[padding]} ${className}`;

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}
