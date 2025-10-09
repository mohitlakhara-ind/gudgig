'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useResponsive } from '@/hooks/useResponsive';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Check if we're on admin pages
  const isAdminPage = pathname.startsWith('/admin');
  const actualUser = (user as any)?.data || user;
  const userRole = actualUser?.role;
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-x-hidden">
          {/* Top Header */}
          <header className="bg-background border-b border-border px-3 py-2 sm:px-4 sm:py-3 lg:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex-shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Page Title */}
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  {isAdminPage && (
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  )}
                  <h1 className="text-base sm:text-lg font-semibold truncate">
                    {isAdminPage ? 'Admin Panel' : 'Dashboard'}
                  </h1>
                </div>

                {/* Search - Hidden on very small screens */}
                <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={isAdminPage ? "Search users, gigs, or bids..." : "Search gigs, skills, or keywords..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                </form>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Admin Badge - Hidden on small screens */}
                {isAdminPage && isAdmin && (
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                    <Shield className="h-3 w-3" />
                    <span className="hidden md:inline">Admin</span>
                  </div>
                )}

                {/* Search button for mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {/* TODO: Implement mobile search modal */}}
                  className="sm:hidden"
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                  onClick={() => router.push('/notifications')}
                >
                  <Bell className="h-5 w-5" />
                  {/* TODO: Add real notification count from API */}
                  {/* <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span> */}
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
