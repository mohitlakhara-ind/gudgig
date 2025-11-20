'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NavItem = { name: string; href: string; icon?: React.ComponentType<{ className?: string }> };

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
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" aria-hidden={!open}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close menu"
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="absolute right-0 top-0 h-full w-[min(90vw,360px)] bg-white dark:bg-background border-l border-border backdrop-blur-md shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border bg-muted/30 sticky top-0 z-10">
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                MENU
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring transition-all tap-target"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 sm:p-4" aria-label="Primary">
              <ul className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <li key={`${item.href}:${item.name}`}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-muted/60 text-sm sm:text-base font-medium transition-all hover:translate-x-1 min-h-[44px] touch-friendly"
                    >
                      {item.icon && <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />}
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            {footer && (
              <div className="p-3 sm:p-4 border-t border-border bg-gradient-to-t from-muted/10 to-transparent sticky bottom-0 z-10 max-h-fit">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}














































