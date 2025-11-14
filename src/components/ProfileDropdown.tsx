'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { log } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  CreditCard, 
  Bookmark,
  ChevronDown,
  Shield,
  FileText,
  Package,
  Users,
  Briefcase,
  BarChart3,
  DollarSign
} from 'lucide-react';

export default function ProfileDropdown() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error: any) {
      log.error('logout_failed', { error: error?.message || String(error) });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Show loading state if user data is not available yet
  if (!user) {
    return (
      <div className="flex items-center gap-2 p-1 rounded-lg">
        <Avatar className="h-8 w-8 ring-1 ring-border">
          <AvatarFallback className="text-xs font-medium">
            <div className="animate-pulse bg-muted h-4 w-4 rounded"></div>
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  }

  // Handle different user object structures - check if user is nested under 'data'
  const actualUser = (user as any)?.data || user;
  const userRole = actualUser?.role;
  const isAdmin = String(userRole || '').toLowerCase() === 'admin';
  const isAdminPage = pathname.includes('/admin');
  const userName = actualUser?.name || 
                   actualUser?.fullName || 
                   actualUser?.firstName || 
                   actualUser?.displayName ||
                   actualUser?.username ||
                   actualUser?.email?.split('@')[0] || // Use email prefix as fallback
                   'User';
  const userEmail = actualUser?.email || 'No email';
  const userAvatar = actualUser?.avatar || 
                     actualUser?.profileImage || 
                     actualUser?.picture || 
                     actualUser?.photoURL ||
                     undefined;
  
  // Debug logging to help identify user object structure
  log.debug('profile_dropdown_user', { hasUser: !!user });

  // Role-based menu items
  const freelancerItems = [
    // Hide Profile entry on admin pages
    ...(!isAdminPage ? [{ label: 'Profile', href: '/profile', icon: User }] : []),
    { label: 'My Bids', href: '/bids', icon: FileText },
    { label: 'Orders', href: '/orders', icon: Package },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Saved Gigs', href: '/saved-gigs', icon: Bookmark },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminItems = [
    { label: 'Admin Dashboard', href: '/admin', icon: Shield },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Manage Gigs', href: '/admin/gigs', icon: Briefcase },
    { label: 'View Bids', href: '/admin/bids', icon: FileText },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Payment Settings', href: '/admin/payment-settings', icon: DollarSign },
    { label: 'Payment Logs', href: '/admin/payment-logs', icon: FileText },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted/80 transition-colors"
        aria-label="Profile menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Avatar className="h-8 w-8 ring-1 ring-border">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="text-xs font-medium">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-sm font-medium">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{userName}</div>
                <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
                {isAdmin && (
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-primary" />
                    <span className="text-xs text-primary font-medium">Admin</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="py-2">
            {isAdmin && isAdminPage === false && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Return to Admin</span>
              </Link>
            )}

            {(isAdmin ? [] : freelancerItems).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="border-t border-border my-2"></div>
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="text-primary">{item.label}</span>
                  </Link>
                ))}
              </>
            )}

            <div className="border-t border-border my-2"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
