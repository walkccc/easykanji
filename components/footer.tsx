'use client';

import { useLanguage } from '@/lib/i18n';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-border bg-background text-muted-foreground shrink-0 border-t px-4 py-2 text-center text-xs">
      {t.footerText}
    </footer>
  );
}
