'use client';

import { Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { LANGUAGE_CYCLE, LANGUAGE_LABEL, useLanguage } from '@/lib/i18n';

export function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLanguageCycle() {
    const idx = LANGUAGE_CYCLE.indexOf(language);
    setLanguage(LANGUAGE_CYCLE[(idx + 1) % LANGUAGE_CYCLE.length]);
  }

  function handleThemeToggle() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  return (
    <nav className="no-print border-border bg-background shrink-0 border-b px-4 py-2.5">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2.5">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.png`}
          alt="Furioke"
          width={28}
          height={28}
          className="rounded-md select-none"
        />
        <span className="text-base font-semibold tracking-tight">Furioke</span>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLanguageCycle}
            title={`Switch language (current: ${LANGUAGE_LABEL[language]})`}
          >
            <span className="text-xs font-bold">
              {LANGUAGE_LABEL[language]}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleThemeToggle}
            title={
              !mounted
                ? 'Toggle theme'
                : resolvedTheme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
            }
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
