import { toHiragana } from '@/lib/katakana-to-hiragana';

function isKanji(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff)
  );
}

function isHiragana(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0x3041 && code <= 0x309f;
}

/**
 * Two-pointer character-level alignment for a single ｜Surface｜Reading｜ segment.
 *
 * Isolates each kanji with its own brackets and moves shared hiragana (okurigana)
 * outside, e.g. ｜引き換え｜ひきかえ｜ → ｜引｜ひ｜き｜換｜か｜え
 */
export function alignSegment(surface: string, reading: string): string {
  const read = toHiragana(reading);
  const surfaceChars = [...surface];
  const readChars = [...read];

  // No kanji → plain text, no brackets needed
  if (!surfaceChars.some(isKanji)) {
    return surface;
  }

  let result = '';
  let s = 0;
  let r = 0;

  while (s < surfaceChars.length && r < readChars.length) {
    const sc = surfaceChars[s];

    if (isHiragana(sc) && sc === readChars[r]) {
      // Okurigana match — move outside brackets
      result += sc;
      s++;
      r++;
      continue;
    }

    if (isKanji(sc)) {
      // Find the next hiragana anchor in surface
      let anchorIdx = -1;
      for (let i = s + 1; i < surfaceChars.length; i++) {
        if (isHiragana(surfaceChars[i])) {
          anchorIdx = i;
          break;
        }
      }

      if (anchorIdx === -1) {
        // No hiragana left in surface — assign all remaining reading here
        const kanjiStr = surfaceChars.slice(s).join('');
        const readStr = readChars.slice(r).join('');
        result += `｜${kanjiStr}｜${readStr}｜`;
        s = surfaceChars.length;
        r = readChars.length;
      } else {
        const anchor = surfaceChars[anchorIdx];
        // Find anchor kana in reading from current r
        const rMatch = readChars.indexOf(anchor, r);

        if (rMatch === -1) {
          // Alignment failed — bracket the rest as-is
          const kanjiStr = surfaceChars.slice(s).join('');
          const readStr = readChars.slice(r).join('');
          result += `｜${kanjiStr}｜${readStr}｜`;
          s = surfaceChars.length;
          r = readChars.length;
        } else {
          const kanjiStr = surfaceChars.slice(s, anchorIdx).join('');
          const readStr = readChars.slice(r, rMatch).join('');
          result += `｜${kanjiStr}｜${readStr}｜`;
          s = anchorIdx;
          r = rMatch;
        }
      }
      continue;
    }

    // Any other character (punctuation, non-matching kana) — pass through
    result += sc;
    s++;
  }

  // Flush any leftover surface characters
  while (s < surfaceChars.length) {
    result += surfaceChars[s++];
  }

  return result;
}

const RUBY_RE = /｜([^｜\n]+)｜([^｜\n]+)｜/g;

/**
 * Runs alignSegment over every ｜Surface｜Reading｜ token in the text.
 */
export function alignKanjiReadings(text: string): string {
  return text.replace(RUBY_RE, (_, surface, reading) =>
    alignSegment(surface, reading),
  );
}
