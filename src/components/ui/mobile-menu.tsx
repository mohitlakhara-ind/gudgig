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
    <div aria-hidden={!open} className={`fixed inset-0 z-[60] md:hidden ${open ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="Close menu"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`absolute right-0 top-0 h-full w-[86%] max-w-[360px] bg-background shadow-strong border-l border-border transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm text-muted-foreground">Menu</div>
          <button onClick={onClose} aria-label="Close menu" className="touch-target p-2 rounded hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4" aria-label="Primary">
          <ul className="flex flex-col gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block px-3 py-3 rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {footer && <div className="mt-auto p-4 border-t">{footer}</div>}
      </div>
    </div>
  );
}


