'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  primaryNavigation,
  jobSeekerNavigation,
  employerNavigation,
  adminNavigation,
  NavigationItem,
} from '@/config/navigation';

export function useNavigation() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if a link is active
  const isActiveLink = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Get navigation items based on user role
  const getNavigationForRole = (): NavigationItem[] => {
    if (!isAuthenticated || !user) {
      return primaryNavigation;
    }

    switch (user.role) {
      case 'jobseeker':
        return jobSeekerNavigation;
      case 'employer':
        return employerNavigation;
      case 'admin':
        return adminNavigation;
      default:
        return jobSeekerNavigation; // fallback
    }
  };

  // Get primary navigation (always available)
  const getPrimaryNavigation = (): NavigationItem[] => {
    return primaryNavigation;
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Auto-close sidebar on route change (for mobile drawer)
  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Memoized navigation items
  const navigationItems = useMemo(() => getNavigationForRole(), [user, isAuthenticated]);

  return {
    isActiveLink,
    getNavigationForRole,
    getPrimaryNavigation,
    navigationItems,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
  };
}