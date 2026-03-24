'use client';

import { useMemo } from 'react';

import { LyricLine } from '@/components/lyric-line';
import { useLanguage } from '@/lib/i18n';
import { tokenizeLyrics } from '@/lib/lyrics-tokens';
import { type TranslationTarget } from '@/lib/translation';

interface PreviewPaneProps {
  html: string;
  raw: string;
  translationTarget: TranslationTarget;
}

export function PreviewPane({ html, raw, translationTarget }: PreviewPaneProps) {
  const { t } = useLanguage();
  const lines = useMemo(() => tokenizeLyrics(raw), [raw]);
  const isEmpty = !html;

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      {isEmpty ? (
        <p className="text-muted-foreground/50 text-sm select-none">
          {t.previewEmpty}
        </p>
      ) : (
        <>
          <div className="prose prose-lg max-w-none">
            {lines.map((line, idx) => (
              <LyricLine key={idx} line={line} target={translationTarget} />
            ))}
          </div>
          <div
            hidden
            className="print-area"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </>
      )}
    </div>
  );
}
