'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, NotificationBadge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api';
import {
  Home,
  Search,
  Bookmark,
  CreditCard,
  MessageSquare,
  Settings,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Briefcase,
  TrendingUp,
  Users,
  BarChart3,
  FileText,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isMobile: responsiveMobile, isTablet } = useResponsive();

  // Handle different user object structures
  const actualUser: any = (user as any)?.data ?? (user as any);
  const userName = actualUser?.name || actualUser?.email?.split('@')[0] || 'User';
  const userEmail = actualUser?.email || 'No email';
  const userAvatar = actualUser?.avatar || actualUser?.profileImage || undefined;
  const userRole = actualUser?.role;

  const isAdmin = userRole === 'admin';

  // Check if we're on admin pages
  const isAdminPage = pathname.startsWith('/admin');

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiClient.getUnreadNotificationCount();
        if (response.success && response.data) {
          setUnreadCount(response.data.count || 0);
        }
      } catch (error) {
        // Silently fail - notifications are not critical for sidebar
        console.log('Failed to fetch notification count:', error);
      }
    };

    if (!user) return;

    // Initial fetch
    fetchUnreadCount();

    // Refresh on interval (every 60s)
    const intervalId = setInterval(fetchUnreadCount, 60000);

    // Refresh when tab becomes visible
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Basic custom event hook (in-app triggers can dispatch window event)
    const onNotify = () => fetchUnreadCount();
    window.addEventListener('notification:new', onNotify as any);
    window.addEventListener('notification:updated', onNotify as any);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('notification:new', onNotify as any);
      window.removeEventListener('notification:updated', onNotify as any);
    };
  }, [user]);

  // Navigation items based on user role and current page
  const getNavigationItems = () => {
    // If on admin pages, show admin navigation
    if (isAdminPage && isAdmin) {
      return [
        {
          title: 'Administration',
          items: [
            {
              name: 'Admin Dashboard',
              href: '/admin',
              icon: Home,
              description: 'Admin overview'
            },
            {
              name: 'Analytics',
              href: '/admin/analytics',
              icon: TrendingUp,
              description: 'Platform insights'
            },
            {
              name: 'User Management',
              href: '/admin/users',
              icon: Users,
              description: 'User accounts'
            },
            {
              name: 'Manage Gigs',
              href: '/admin/gigs',
              icon: Briefcase,
              description: 'Job postings'
            },
            {
              name: 'Bid Management',
              href: '/admin/bids',
              icon: BarChart3,
              description: 'All bids management'
            },
            {
              name: 'Bid Fees',
              href: '/admin/bid-fees',
              icon: CreditCard,
              description: 'Payment settings'
            },
            {
              name: 'Payment Logs',
              href: '/admin/payment-logs',
              icon: FileText,
              description: 'Transaction history'
            },
            // Chat removed
            {
              name: 'Settings',
              href: '/admin/settings',
              icon: Settings,
              description: 'Admin settings'
            }
          ]
        },
        {
          title: 'Admin Tools',
          items: [
            {
              name: 'Notifications',
              href: '/admin/notifications',
              icon: Bell,
              description: 'Send notifications'
            },
            {
              name: 'Payment Settings',
              href: '/admin/payment-settings',
              icon: CreditCard,
              description: 'Configure payments'
            }
          ]
        }
      ];
    }

    // Regular user navigation
    const baseItems = [
      {
        title: 'Overview',
        items: [
          {
            name: 'My Orders',
            href: '/orders',
            icon: Briefcase,
            description: 'Your orders'
          },
          {
            name: 'Browse Gigs',
            href: '/gigs',
            icon: Search,
            description: 'Find opportunities'
          },
          {
            name: 'Saved Gigs',
            href: '/saved-gigs',
            icon: Bookmark,
            description: 'Your saved jobs'
          }
        ]
      },
      // Work section removed (Gig Alerts deprecated)
      {
        title: 'Activity',
        items: [
          {
            name: 'Payments',
            href: '/payments',
            icon: CreditCard,
            description: 'Payment history'
          },
          // Chat removed
          {
            name: 'Notifications',
            href: '/notifications',
            icon: Bell,
            description: 'Updates and alerts',
            badge: unreadCount > 0 ? unreadCount : undefined
          }
        ]
      }
    ];

    // Intentionally do not include full admin navigation in the regular sidebar
    // for admins when not on admin pages. Provide a quick link back to admin.
    if (isAdmin && !isAdminPage) {
      baseItems.push({
        title: 'Admin',
        items: [
          {
            name: 'Return to Admin',
            href: '/admin',
            icon: Shield,
            description: 'Switch back to admin view'
          }
        ]
      });
    }

    baseItems.push({
      title: 'Account',
      items: [
        // Profile hidden on admin pages
        ...(!isAdminPage
          ? [{
              name: 'Profile',
              href: '/profile',
              icon: User,
              description: 'Your profile'
            }]
          : []),
        {
          name: 'Settings',
          href: '/settings',
          icon: Settings,
          description: 'Preferences'
        },
          // Removed Help & Support as the route is nested under dashboard
      ]
    });

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href: string) => {
    // Exact match for root dashboard and admin root to avoid double-highlighting parents
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    if (href === '/admin') return pathname === '/admin';

    // Known nested routes that should highlight on subpaths
    if (href === '/gigs') return pathname === '/gigs' || pathname.startsWith('/gigs/');
    if (href === '/notifications') return pathname === '/notifications' || pathname === '/dashboard/notifications';
    if (href === '/settings') return pathname === '/settings' || pathname === '/dashboard/settings';
    if (href === '/help') return pathname === '/help' || pathname === '/support';
    if (href === '/orders') return pathname === '/orders' || pathname === '/dashboard/orders';
    if (href === '/payments') return pathname === '/payments' || pathname === '/dashboard/payments';
    if (href === '/services') return pathname === '/services' || pathname === '/dashboard/services';
    if (href === '/gig-alerts') return pathname === '/gig-alerts' || pathname === '/dashboard/gig-alerts';
    if (href === '/saved-gigs') return pathname === '/saved-gigs' || pathname === '/dashboard/saved-gigs';
    if (href === '/chat') return pathname === '/chat' || pathname === '/dashboard/chat';
    if (href === '/profile') return pathname === '/profile' || pathname === '/dashboard/profile';

    // Admin subpages should match their own subtree, but not activate the admin root
    if (href.startsWith('/admin/')) return pathname.startsWith(href);

    // Default to exact match to prevent parent items activating on all children
    return pathname === href;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">GM</span>
            </div>
            <span className="font-semibold text-base sm:text-lg truncate">Gigs Mint</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isMobile && !responsiveMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
          
          {(isMobile || responsiveMobile) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* User Profile - hidden on admin pages */}
      {!isAdminPage && (
        <div className="p-2 sm:p-3">
          <div className={cn(
            "flex items-center gap-2 sm:gap-3",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="text-xs sm:text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs sm:text-sm truncate">{userName}</div>
                <div className="text-xs text-muted-foreground truncate hidden sm:block">{userEmail}</div>
                {isAdmin && (
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-xs text-primary font-medium">Admin</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-3 px-2">
          {navigationItems.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 sm:gap-3 rounded-lg py-2 text-xs sm:text-sm transition-colors",
                        "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                        isActive && "bg-primary/10 text-primary font-medium",
                        isCollapsed ? "justify-center px-1" : "px-2"
                      )}
                    >
                      <div className="relative">
                        <item.icon className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isActive && "text-primary"
                        )} />
                        {/* Collapsed notification count */}
                        {isCollapsed && item.href === '/notifications' && (
                          <NotificationBadge count={unreadCount} className="absolute -top-2 -right-2 min-w-[18px] h-5 px-1.5 text-[10px]" />
                        )}
                      </div>
                      
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{item.name}</span>
                            {item.href === '/notifications' && (
                              <NotificationBadge count={unreadCount} />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate hidden sm:block">
                            {item.description}
                          </div>
                        </div>
                      )}
                      
                      {isActive && !isCollapsed && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Logout */}
      <div className="px-2 py-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs sm:text-sm",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2 truncate">Sign out</span>}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-72 max-w-[85vw] bg-white dark:bg-neutral-950 border-r shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden overflow-hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent />
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "hidden lg:flex h-full bg-background border-r transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
        isCollapsed ? "w-16" : "w-47"
      )}
    >
      <SidebarContent />
    </div>
  );
}
