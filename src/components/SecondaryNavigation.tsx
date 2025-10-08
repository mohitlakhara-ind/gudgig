'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Drawer } from '@/components/ui/drawer';
import { Menu, LogOut, ChevronLeft, ChevronRight, Settings as SettingsIcon, HelpCircle, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import DarkModeToggle from '@/components/ui/dark-mode-toggle';
import { useTheme } from 'next-themes';

export default function SecondaryNavigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { groupedNavigationItems, isActiveLink, isSidebarOpen, toggleSidebar, closeSidebar } = useNavigation();
  const { theme, setTheme, systemTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem('sidebar-collapsed');
      return raw === 'true';
    } catch {
      return false;
    }
  });

  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const navItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const flatItems = groupedNavigationItems.flatMap(g => g.items);

  useEffect(() => {
    // Ensure focused index stays within bounds
    setFocusedIndex(prev => (flatItems.length === 0 ? 0 : Math.min(prev, flatItems.length - 1)));
  }, [flatItems.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (flatItems.length === 0) return;
    const key = e.key;
    const lastIndex = flatItems.length - 1;
    let nextIndex = focusedIndex;
    if (key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = focusedIndex >= lastIndex ? 0 : focusedIndex + 1;
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = focusedIndex <= 0 ? lastIndex : focusedIndex - 1;
    } else if (key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (key === 'End') {
      e.preventDefault();
      nextIndex = lastIndex;
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      const el = navItemsRef.current[focusedIndex];
      el?.click();
      return;
    } else {
      return;
    }
    setFocusedIndex(nextIndex);
    const el = navItemsRef.current[nextIndex];
    el?.focus();
  }, [focusedIndex, flatItems.length]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar-collapsed', String(next)); } catch {}
      return next;
    });
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  const NavigationContent = () => (
    <div className="p-0" role="presentation">
      {/* Navigation Links */}
      <nav
        className=""
        aria-label="Main navigation"
        role="navigation"
        onKeyDown={handleKeyDown}
      >
        <ul className="space-y-2" role="menu">
          {groupedNavigationItems.map((group, gi) => (
            <li key={`group-${gi}`} className="space-y-1" role="none">
              {!isCollapsed && group.sectionLabel && (
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-[opacity,transform] duration-200 ease-in-out" aria-hidden={isCollapsed}>
                  {group.sectionLabel}
                </div>
              )}
              <ul className="space-y-1" role="none">
                {group.items.map((item, idx) => {
                  const globalIndex = groupedNavigationItems
                    .slice(0, gi)
                    .reduce((acc, g) => acc + g.items.length, 0) + idx;
                  const isActive = isActiveLink(item.href);
                  const count = item.badgeCount;
                  const ariaLabel = count && count > 0
                    ? `${item.name}, ${count} unread`
                    : (item.ariaLabel || item.name);
                  return (
                    <li key={`${item.href}-${gi}-${idx}`} role="none">
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        role="menuitem"
                        tabIndex={focusedIndex === globalIndex ? 0 : -1}
                        ref={(el) => { navItemsRef.current[globalIndex] = el; }}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={ariaLabel}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                          isActive
                            ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                        )}
                      >
                        {item.icon && <item.icon className="h-5 w-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />}
                        {!isCollapsed && (
                          <span className="transition-[opacity,transform] duration-200 ease-in-out truncate">
                            {item.name}
                          </span>
                        )}
                        {item.badgeKey && !!count && count > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center animate-badge-pulse"
                            aria-live="polite"
                          >
                            {count}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {gi < groupedNavigationItems.length - 1 && (
                <Separator className="my-2" />
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile Section at bottom - hidden on admin pages */}
      {!pathname.startsWith('/admin') && (
      <div className="mt-auto pt-4 border-t border-border">
        {/* Profile Link with Avatar */}
        <Link 
          href="/dashboard/profile" 
          className={cn(
            "flex items-center hover:bg-muted/50 rounded-lg p-2 transition-colors group",
            isCollapsed ? "justify-center" : "gap-3"
          )}
          title={isCollapsed ? `${user?.name} - View Profile` : undefined}
        >
          <div className="relative">
            <Avatar className="h-10 w-10 shadow-medium rounded-2xl group-hover:scale-105 transition-transform">
              <AvatarImage src={(user as any)?.avatar} alt={user?.name} />
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-success rounded-full ring-2 ring-background" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">View Profile</p>
            </div>
          )}
        </Link>
        
        {/* Dark Mode Toggle */}
        <div className="mt-3">
          {isCollapsed ? (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const currentTheme = theme === 'system' ? systemTheme : theme;
                  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
                }}
                className="h-10 w-10 rounded-xl hover:bg-muted/80"
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <DarkModeToggle />
            </div>
          )}
        </div>
      </div>
      )}

      {/* Logout Button */}
      <div className="mt-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={loading}
          className={cn('w-full text-destructive hover:text-destructive/80 rounded-2xl', isCollapsed && 'justify-center')}
        >
          <LogOut className={cn('h-4 w-4', !isCollapsed && 'mr-2')}/>
          {!isCollapsed && (loading ? 'Logging out...' : 'Logout')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isSidebarOpen}
          aria-controls="mobile-sidebar-drawer"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:block bg-sidebar border-r border-sidebar-border h-[100dvh] overflow-y-auto sticky top-0 z-40 transition-[width] duration-300 ease-in-out scrollbar-thin',
          isCollapsed ? 'w-20' : 'w-14'
        )}
        aria-label="Sidebar"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center justify-end p-2 border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            className="rounded-full shadow-md hover:shadow-lg transition-shadow"
            title={isCollapsed ? 'Expand (Ctrl+B)' : 'Collapse (Ctrl+B)'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}
          </Button>
        </div>
        <NavigationContent />
      </aside>

      {/* Mobile Drawer */}
      <Drawer id="mobile-sidebar-drawer" title="Menu" isOpen={isSidebarOpen} onClose={closeSidebar}>
        <NavigationContent />
      </Drawer>
    </>
  );
}
