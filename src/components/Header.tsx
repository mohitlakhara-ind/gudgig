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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isActiveLink, getPrimaryNavigation } = useNavigation();

  const navigation = getPrimaryNavigation();

  return (
    <header className="bg-background/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      {/* Skip to content for keyboard users */}
      <a href="#main" className="sr-only focus:sr-only-focusable px-3 py-2 inline-block">Skip to content</a>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FM</span>
            </div>
            <span className="text-base sm:text-xl font-bold text-foreground">Freelance Marketplace</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Primary">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors",
                  isActiveLink(item.href)
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-foreground hover:text-primary hover:bg-muted"
                )}
                aria-current={isActiveLink(item.href) ? 'page' : undefined}
              >
                <span className="relative inline-block">
                  {item.name}
                  {isActiveLink(item.href) && (
                    <span className="absolute left-0 -bottom-2 h-0.5 w-full bg-primary rounded-full" aria-hidden />
                  )}
                </span>
              </Link>
            ))}
          </nav>

          {/* Desktop Theme Toggle + CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <DarkModeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="outline" className="bg-transparent">
                  Profile
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="bg-transparent">
                  Login
                </Button>
              </Link>
            )}
            <Link href="/dashboard/services">
              <Button>
                Browse Services
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden tap-target rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

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
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent tap-target">Login</Button>
                  </Link>
                )}
                <Link href="/employer/post-job" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full tap-target">Post a Job</Button>
                </Link>
              </div>
            }
          />
      </div>
    </header>
  );
}
