'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

type NavItem = { name: string; href: string };

export default function MobileMenu({
  open,
  onClose,
  navigation,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  navigation: NavItem[];
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div aria-hidden={!open} className={`fixed inset-0 z-[60]  bg-white dark:bg-neutral-950 md:hidden ${open ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0  bg-white dark:bg-neutral-950 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="Close menu"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`absolute right-0 top-0 h-[90vh] w-[86%] max-w-[360px] bg-white dark:bg-neutral-950 shadow-strong border-l border-border transition-transform duration-200 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Sticky header with logo and close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white dark:bg-neutral-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base">GM</span>
            </div>
            <span className="text-base font-semibold text-foreground">Gigs Mint</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="touch-target p-2 rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Primary">
          <ul className="flex flex-col gap-2">
            {navigation.map((item) => (
              <li key={`${item.href}:${item.name}`}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block px-4 py-3 rounded-xl font-medium text-foreground text-base shadow-sm hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Footer actions */}
        {footer && <div className="mt-auto p-4 border-t bg-white dark:bg-neutral-950">{footer}</div>}
      </div>
    </div>
  );
}


