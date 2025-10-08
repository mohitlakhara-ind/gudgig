'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  primaryNavigation,
  freelancerNavigation,
  adminNavigation,
  NavigationItem,
  NAVIGATION_SECTIONS,
} from '@/config/navigation';
// Removed notification counts import

export interface GroupedNavigationItem {
  sectionKey: keyof typeof NAVIGATION_SECTIONS | 'ungrouped';
  sectionLabel: string;
  items: NavigationItem[];
}

export function useNavigation() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Removed notification counts functionality

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

    switch (user.role as 'freelancer' | 'employer' | 'admin' | string) {
      case 'jobseeker':
      case 'freelancer':
        return freelancerNavigation;
      case 'admin':
        return adminNavigation;
      default:
        return freelancerNavigation; // fallback
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

  // Enrich items with badge counts
  const enrichNavigationWithBadges = (items: NavigationItem[], counts: Record<string, number>): NavigationItem[] => {
    return items.map(item => {
      const key = item.badgeKey;
      if (!key) return item;
      const value = counts[key] ?? 0;
      return { ...item, badgeCount: value };
    });
  };

  const groupNavigationItems = (items: NavigationItem[]): GroupedNavigationItem[] => {
    const sectionOrder: (keyof typeof NAVIGATION_SECTIONS | 'ungrouped')[] = [];
    const groups: Record<string, NavigationItem[]> = {};

    for (const item of items) {
      const key = (item.section as keyof typeof NAVIGATION_SECTIONS) || 'ungrouped';
      if (!groups[key]) {
        groups[key] = [];
        sectionOrder.push(key);
      }
      groups[key].push(item);
    }

    return sectionOrder.map((key) => ({
      sectionKey: key,
      sectionLabel: key === 'ungrouped' ? '' : NAVIGATION_SECTIONS[key as keyof typeof NAVIGATION_SECTIONS],
      items: groups[key] || [],
    }));
  };

  const enrichedItems = useMemo(() => navigationItems, [navigationItems]);
  const groupedNavigationItems = useMemo(() => groupNavigationItems(enrichedItems), [enrichedItems]);

  return {
    isActiveLink,
    getNavigationForRole,
    getPrimaryNavigation,
    navigationItems,
    groupedNavigationItems,
    // Removed notification counts
    // Removed refresh notification counts
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
  };
}