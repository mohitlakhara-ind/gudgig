'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LinkedInLayoutProps {
  children: ReactNode;
  className?: string;
  sidebar?: ReactNode;
  header?: ReactNode;
}

export function LinkedInLayout({ 
  children, 
  className, 
  sidebar, 
  header 
}: LinkedInLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      {/* Header */}
      {header && (
        <div className="bg-white border-b border-[#E1E5E9] sticky top-0 z-40">
          {header}
        </div>
      )}
      
      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 bg-white border-r border-[#E1E5E9] min-h-screen sticky top-0">
            <div className="p-4">
              {sidebar}
            </div>
          </aside>
        )}
        
        {/* Main Content */}
        <main className={cn(
          'flex-1 p-6',
          !sidebar && 'max-w-6xl mx-auto',
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}


