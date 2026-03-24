'use client';

import { useEffect, useRef, useState } from 'react';

import { WordTooltip } from '@/components/word-tooltip';
import { useLanguage } from '@/lib/i18n';
import type { Line, LineToken, RubyToken } from '@/lib/lyrics-tokens';
import {
  getCachedTranslation,
  translate,
  type TranslationTarget,
} from '@/lib/translation';

interface LyricLineProps {
  line: Line;
  target: TranslationTarget;
}

export function LyricLine({ line, target }: LyricLineProps) {
  const { t } = useLanguage();
  const [lineTranslation, setLineTranslation] = useState<string | null>(() =>
    target === 'off' || !line.plain.trim()
      ? null
      : getCachedTranslation(line.plain, target),
  );
  const [error, setError] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    if (target === 'off' || !line.plain.trim()) {
      setLineTranslation(null);
      setError(false);
      return;
    }
    const cached = getCachedTranslation(line.plain, target);
    if (cached !== null) {
      setLineTranslation(cached);
      setError(false);
      return;
    }
    const id = ++requestRef.current;
    setLineTranslation(null);
    setError(false);
    translate(line.plain, target)
      .then((result) => {
        if (id !== requestRef.current) return;
        setLineTranslation(result);
      })
      .catch(() => {
        if (id !== requestRef.current) return;
        setError(true);
      });
  }, [line.plain, target]);

  if (line.plain === '') {
    return <div className="h-[1em]" aria-hidden />;
  }

  const showTranslationRow = target !== 'off';
  const translationText = error
    ? t.translationError
    : (lineTranslation ?? t.translationLoading);

  return (
    <div className="mb-2">
      <div className="leading-[3]">
        {line.tokens.map((token, idx) => (
          <TokenView key={idx} token={token} target={target} />
        ))}
      </div>
      {showTranslationRow && (
        <div className="text-muted-foreground/80 mt-1 text-sm leading-snug select-text">
          {translationText}
        </div>
      )}
    </div>
  );
}

interface TokenViewProps {
  token: LineToken;
  target: TranslationTarget;
}

function TokenView({ token, target }: TokenViewProps) {
  if (token.kind === 'plain') {
    if (!token.translatable || target === 'off') {
      return <span>{token.text}</span>;
    }
    return (
      <WordTooltip text={token.text} target={target}>
        <span className="hover:bg-primary/10 rounded-sm transition-colors">
          {token.text}
        </span>
      </WordTooltip>
    );
  }
  return <RubyView token={token} target={target} />;
}

interface RubyViewProps {
  token: RubyToken;
  target: TranslationTarget;
}

function RubyView({ token, target }: RubyViewProps) {
  const content = token.pairs.map((pair, idx) =>
    pair.reading ? (
      <ruby key={idx}>
        {pair.surface}
        <rt className="text-muted-foreground text-[0.55em] select-none">
          {pair.reading}
        </rt>
      </ruby>
    ) : (
      <span key={idx}>{pair.surface}</span>
    ),
  );

  if (target === 'off') return <>{content}</>;

  return (
    <WordTooltip text={token.text} target={target}>
      <span className="hover:bg-primary/10 rounded-sm transition-colors">
        {content}
      </span>
    </WordTooltip>
  );
}
