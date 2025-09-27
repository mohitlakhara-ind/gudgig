'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function DarkModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <div className="flex items-center gap-2" aria-label="Toggle dark mode">
      <Sun className="h-4 w-4 text-muted-foreground" aria-hidden />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Dark mode"
      />
      <Moon className="h-4 w-4 text-muted-foreground" aria-hidden />
    </div>
  );
}


