'use client';

import { useEffect, useRef, useState } from 'react';

import { useLanguage } from '@/lib/i18n';
import {
  getCachedTranslation,
  translate,
  type TranslationTarget,
} from '@/lib/translation';

interface WordTooltipProps {
  text: string;
  target: TranslationTarget;
  children: React.ReactNode;
}

export function WordTooltip({ text, target, children }: WordTooltipProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [translation, setTranslation] = useState<string | null>(() =>
    getCachedTranslation(text, target),
  );
  const [error, setError] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    setTranslation(getCachedTranslation(text, target));
    setError(false);
  }, [text, target]);

  function handleEnter() {
    if (target === 'off') return;
    setOpen(true);
    if (translation !== null) return;
    const id = ++requestRef.current;
    setError(false);
    translate(text, target)
      .then((result) => {
        if (id !== requestRef.current) return;
        setTranslation(result);
      })
      .catch(() => {
        if (id !== requestRef.current) return;
        setError(true);
      });
  }

  function handleLeave() {
    setOpen(false);
  }

  const showTooltip = open && target !== 'off';
  const body = error
    ? t.translationError
    : (translation ?? t.translationLoading);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}
      {showTooltip && (
        <span
          role="tooltip"
          className="bg-popover text-popover-foreground ring-foreground/10 pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded-md px-2 py-1 text-xs leading-tight whitespace-nowrap shadow-md ring-1 select-none"
        >
          {body}
        </span>
      )}
    </span>
  );
}
