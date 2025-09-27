'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Drawer } from '@/components/ui/drawer';
import { Menu, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SecondaryNavigation() {
  const { user, logout } = useAuth();
  const { navigationItems, isActiveLink, isSidebarOpen, toggleSidebar, closeSidebar } = useNavigation();
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
    <div className="p-4" role="presentation">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-6">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2" aria-label="Sidebar navigation" role="navigation">
        <ul className="space-y-2" role="list">
        {navigationItems.map((item) => {
          const isActive = isActiveLink(item.href);
          return (
            <li key={item.name} role="listitem">
              <Link
                href={item.href}
                onClick={closeSidebar}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          );
        })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={loading}
          className={cn("w-full text-destructive hover:text-destructive/80", isCollapsed && "justify-center")}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")}/>
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
      <aside className={cn("hidden md:block bg-sidebar border-r border-sidebar-border h-[100dvh] overflow-y-auto sticky top-0 z-40 transition-[width] duration-200", isCollapsed ? "w-20" : "w-64")} aria-label="Sidebar">
        <div className="flex items-center justify-end p-2 border-b border-sidebar-border">
          <Button variant="ghost" size="icon" onClick={toggleCollapse} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
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
