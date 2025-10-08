'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';
import MobileMenu from '@/components/ui/mobile-menu';
import DarkModeToggle from '@/components/ui/dark-mode-toggle';
import ProfileDropdown from '@/components/ProfileDropdown';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { isActiveLink, getPrimaryNavigation } = useNavigation();

  const navigation = getPrimaryNavigation();

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-colors bg-background border-b border-border",
      isScrolled && "shadow-sm"
    )}
      onMouseEnter={() => setIsScrolled(true)}
      onMouseLeave={() => setIsScrolled(window.scrollY > 8)}
    >
      {/* Skip to content for keyboard users */}
      <a href="#main" className="sr-only focus:sr-only-focusable px-3 py-2 inline-block">Skip to content</a>

      {/* Top utility bar */}
      <div className="">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Professional Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">GM</span>
              </div>
              <span className="text-base sm:text-lg font-semibold text-foreground">Gigs Mint</span>
            </div>

            {/* Right utilities (minimal) */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated && <NotificationBell />}
              <DarkModeToggle />
              {isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="bg-transparent hover:bg-muted/70">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="tap-target rounded-xl">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden tap-target rounded-xl hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-haspopup="menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary navigation bar */}
      <div className="bg-background/70 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex h-12 items-center justify-between">
            <nav className="flex items-center gap-2" aria-label="Primary">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-full transition-colors text-sm",
                    isActiveLink(item.href)
                      ? "text-primary bg-primary/10 font-medium ring-1 ring-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  aria-current={isActiveLink(item.href) ? 'page' : undefined}
                >
                  <span className="relative inline-block">
                    {item.name}
                    {isActiveLink(item.href) && (
                      <span className="absolute left-0 -bottom-1 h-0.5 w-0 group-hover:w-full bg-primary rounded-full transition-all" aria-hidden />
                    )}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {isAuthenticated && (user as any)?.role === 'admin' && (
                <Link href="/admin/login" className="hidden sm:block">
                  <Button className="tap-target rounded-xl">Post a Gig</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile drawer */}
          <MobileMenu
            open={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            navigation={navigation}
            footer={
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Dark mode</span>
                  <DarkModeToggle />
                </div>
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent tap-target">Profile</Button>
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full bg-transparent tap-target">Login</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full tap-target rounded-2xl">Sign up</Button>
                    </Link>
                  </div>
                )}
                {isAuthenticated && (user as any)?.role === 'admin' && (
                  <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full tap-target rounded-2xl">Post a Gig</Button>
                  </Link>
                )}
              </div>
            }
          />
        </div>
      </div>
    </header>
  );
}
