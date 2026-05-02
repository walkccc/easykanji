import { alignSegment } from '@/lib/kanji-alignment';

export interface RubyPair {
  surface: string;
  reading: string;
}

export interface RubyToken {
  kind: 'ruby';
  text: string;
  pairs: RubyPair[];
}

export interface PlainToken {
  kind: 'plain';
  text: string;
  translatable: boolean;
}

export type LineToken = RubyToken | PlainToken;

export interface Line {
  raw: string;
  plain: string;
  tokens: LineToken[];
}

const RUBY_RE = /｜([^｜\n]+)｜([^｜\n]+)｜/g;

function isWordLikeChar(ch: string): boolean {
  const code = ch.charCodeAt(0);
  if (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff)
  ) {
    return true;
  }
  if (code >= 0x3041 && code <= 0x309f) return true;
  if (code >= 0x30a1 && code <= 0x30ff) return true;
  if (code >= 0xff66 && code <= 0xff9f) return true;
  if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a))
    return true;
  if (code >= 0x30 && code <= 0x39) return true;
  return false;
}

function segmentPlainText(text: string): PlainToken[] {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
      const out: PlainToken[] = [];
      for (const seg of segmenter.segment(text)) {
        const isWord =
          (seg as { isWordLike?: boolean }).isWordLike ??
          isWordLikeChar(seg.segment[0] ?? '');
        out.push({
          kind: 'plain',
          text: seg.segment,
          translatable: isWord && seg.segment.trim().length > 0,
        });
      }
      return out;
    } catch {
      // fallthrough to char-level grouping
    }
  }
  return groupByCharClass(text);
}

function groupByCharClass(text: string): PlainToken[] {
  const out: PlainToken[] = [];
  let buf = '';
  let bufWord = false;
  for (const ch of text) {
    const isWord = isWordLikeChar(ch);
    if (buf && isWord !== bufWord) {
      out.push({ kind: 'plain', text: buf, translatable: bufWord });
      buf = '';
    }
    buf += ch;
    bufWord = isWord;
  }
  if (buf) out.push({ kind: 'plain', text: buf, translatable: bufWord });
  return out;
}

function parseRubyPairs(surface: string, reading: string): RubyPair[] {
  const aligned = alignSegment(surface, reading);
  const pairs: RubyPair[] = [];
  let lastIndex = 0;
  RUBY_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = RUBY_RE.exec(aligned)) !== null) {
    if (match.index > lastIndex) {
      pairs.push({
        surface: aligned.slice(lastIndex, match.index),
        reading: '',
      });
    }
    pairs.push({ surface: match[1], reading: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < aligned.length) {
    pairs.push({ surface: aligned.slice(lastIndex), reading: '' });
  }
  if (pairs.length === 0) {
    pairs.push({ surface, reading });
  }
  return pairs;
}

export function tokenizeLine(line: string): Line {
  const tokens: LineToken[] = [];
  let plain = '';
  let lastIndex = 0;
  RUBY_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = RUBY_RE.exec(line)) !== null) {
    if (match.index > lastIndex) {
      const between = line.slice(lastIndex, match.index);
      tokens.push(...segmentPlainText(between));
      plain += between;
    }
    const surface = match[1];
    const reading = match[2];
    tokens.push({
      kind: 'ruby',
      text: surface,
      pairs: parseRubyPairs(surface, reading),
    });
    plain += surface;
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    const tail = line.slice(lastIndex);
    tokens.push(...segmentPlainText(tail));
    plain += tail;
  }

  return { raw: line, plain, tokens };
}

export function tokenizeLyrics(raw: string): Line[] {
  return raw.split('\n').map(tokenizeLine);
}
