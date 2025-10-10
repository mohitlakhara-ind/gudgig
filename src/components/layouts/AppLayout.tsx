'use client';

import { useState, useEffect } from 'react';
// import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from '../Header';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useResponsive } from '@/hooks/useResponsive';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile, isDesktop } = useResponsive();
  const [socket, setSocket] = useState<any | null>(null);

  // Check if we're on admin pages
  const isAdminPage = pathname.startsWith('/admin');
  const actualUser = (user as any)?.data || user;
  const userRole = actualUser?.role;
  const isAdmin = userRole === 'admin';

  // Detect gigs routes
  const isGigsRoute = pathname === '/gigs' || pathname.startsWith('/gigs/');

  // Check if we're on public pages that don't need sidebar
  const isPublicPage = pathname === '/' || 
    pathname.startsWith('/about') || 
    pathname.startsWith('/contact') || 
    pathname.startsWith('/faq') || 
    pathname.startsWith('/terms') || 
    pathname.startsWith('/privacy') || 
    pathname.startsWith('/refund') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/categories');

  // Check if we're on dashboard pages that have their own layout
  const isDashboardPage = pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/settings') || 
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/saved-gigs') ||
    pathname.startsWith('/bids') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/gig-alerts') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/admin');

  useEffect(() => {
    // Allow guests on gigs pages; only redirect when not public and not gigs
    if (!isLoading && !isAuthenticated && !isPublicPage && !isGigsRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, isPublicPage, isGigsRoute]);

  // Socket.io notifications client
  useEffect(() => {
    if (!isAuthenticated) return;
    // const wsEnv = (process as any)?.env?.NEXT_PUBLIC_BACKEND_WS_URL;
    // const httpEnv = (process as any)?.env?.NEXT_PUBLIC_BACKEND_URL;
    // const base = wsEnv || httpEnv || (typeof window !== 'undefined' ? window.location.origin : '');
    // const origin = String(base).replace(/\/$/, '').replace('/api', '');
    // const token = (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || '';
    // const s = io(origin, { transports: ['websocket'], auth: { token } });
    // setSocket(s);
    const onNew = (payload: any) => {
      // Bubble events for sidebar badge/notifications page
      window.dispatchEvent(new CustomEvent('notification:new', { detail: payload }));
      // Opportunistic toast for important notifications
      try {
        const { default: toast } = require('react-hot-toast');
        if (payload?.title) {
          toast.success(payload.title);
        }
      } catch {}
    };
    const onUpdated = (payload: any) => {
      window.dispatchEvent(new CustomEvent('notification:updated', { detail: payload }));
    };
    // s.on('notification:new', onNew);
    // s.on('notification:updated', onUpdated);
    // Listen for bid selection typed events as notifications
    // s.on('bid:selected', (payload: any) => {
    //   try {
    //     const { default: toast } = require('react-hot-toast');
    //     toast.success('Your bid was accepted!');
    //   } catch {}
    //   window.dispatchEvent(new CustomEvent('notification:new', { detail: payload }));
    // });
    return () => {
      // s.off('notification:new', onNew);
      // s.off('notification:updated', onUpdated);
      // s.off('bid:selected');
      // s.close();
    };
  }, [isAuthenticated]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // For public pages, render with header but without sidebar
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {children}
        </main>
      </div>
    );
  }

  // Special handling for gigs pages: guests see header-only; authenticated users see sidebar
  if (isGigsRoute) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            {children}
          </main>
        </div>
      );
    }
    // Authenticated user on gigs -> show sidebar layout
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
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

  // For dashboard pages, let their own layout handle the sidebar
  if (isDashboardPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // For authenticated pages, render with sidebar
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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

