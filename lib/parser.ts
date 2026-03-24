import { alignKanjiReadings } from '@/lib/kanji-alignment';

const RUBY_RE = /｜([^｜\n]+)｜([^｜\n]+)｜/g;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function parseToHtml(raw: string): string {
  raw = alignKanjiReadings(raw);
  const lines = raw.split('\n');
  return lines
    .map((line) => {
      let result = '';
      let lastIndex = 0;
      RUBY_RE.lastIndex = 0;

      let match: RegExpExecArray | null;
      while ((match = RUBY_RE.exec(line)) !== null) {
        result += escapeHtml(line.slice(lastIndex, match.index));
        result += `<ruby>${escapeHtml(match[1])}<rt>${escapeHtml(match[2])}</rt></ruby>`;
        lastIndex = match.index + match[0].length;
      }
      result += escapeHtml(line.slice(lastIndex));
      return result;
    })
    .join('<br />');
}
