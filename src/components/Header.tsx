'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';
import MobileMenu from '@/components/ui/mobile-menu';
import DarkModeToggle from '@/components/ui/dark-mode-toggle';
import ProfileDropdown from '@/components/ProfileDropdown';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { isActiveLink, getPrimaryNavigation } = useNavigation();
  const pathname = usePathname();

  const navigation = getPrimaryNavigation();

  return (
    <header className={cn(
      "sticky top-0 z-50 max-w-screen m-0 p-0 overflow-hidden transition-colors bg-background border-b border-border",
      isScrolled && "shadow-sm"
    )}
      onMouseEnter={() => setIsScrolled(true)}
      onMouseLeave={() => setIsScrolled(window.scrollY > 8)}
    >
      {/* Skip to content for keyboard users */}
      <a href="#main" className="sr-only focus:sr-only-focusable px-3 py-2 inline-block">Skip to content</a>

      {/* Top utility bar */}
      <div className="">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-12 sm:h-12 md:h-14 items-center justify-between gap-2">
            {/* Professional Logo */}
            <Link href="/" className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 dark:bg-accent-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <Image src="/logo.png" height={32} width={32} alt='gigsmint logo' />
              </div>
              <span className="text-sm sm:text-sm lg:text-base font-semibold text-foreground truncate">Gigs Mint</span>
            </Link>

            {/* Right utilities (minimal) */}
            <div className="hidden md:flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <DarkModeToggle />
              {isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="bg-transparent hover:bg-muted/70 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="tap-target rounded-xl text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden tap-target rounded-xl hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus:outline-none p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-haspopup="menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary navigation bar */}
      <div className="bg-background/70 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
          <div className="hidden md:flex h-10 items-center justify-between gap-4 overflow-x-hidden">
            <nav className="flex items-center gap-1 overflow-x-hidden" aria-label="Primary">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-2.5 py-1 rounded-full transition-colors text-xs sm:text-sm whitespace-nowrap flex-shrink-0",
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
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated && String(((user as any)?.role || '')).toLowerCase() === 'admin' && (
                <Link href="/admin/login" className="hidden sm:block">
                  <Button className="tap-target rounded-xl text-xs sm:text-sm h-8 px-2.5">Post a Gig</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile drawer - rendered at header level to avoid overflow clipping */}
      <MobileMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navigation={navigation}
        footer={
          <div className="flex flex-col gap-3">
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
            {isAuthenticated && String(((user as any)?.role || '')).toLowerCase() === 'admin' && (
              <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full tap-target rounded-2xl">Post a Gig</Button>
              </Link>
            )}
          </div>
        }
      />
    </header>
  );
}
