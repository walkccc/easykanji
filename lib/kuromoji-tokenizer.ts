import type kuromoji from 'kuromoji';

import { toHiragana } from '@/lib/katakana-to-hiragana';

type KuromojiModule = typeof kuromoji;
type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

let tokenizerPromise: Promise<Tokenizer> | null = null;

export function getTokenizer(): Promise<Tokenizer> {
  if (tokenizerPromise) return tokenizerPromise;

  const dicPath = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/dict`;

  tokenizerPromise = import('kuromoji').then((mod) => {
    // kuromoji uses `export =` — handle both CJS default and named interop
    const builder = (
      'default' in mod ? (mod as { default: KuromojiModule }).default : mod
    ) as KuromojiModule;
    return new Promise<Tokenizer>((resolve, reject) => {
      builder.builder({ dicPath }).build((err, tokenizer) => {
        if (err) {
          tokenizerPromise = null;
          reject(err);
        } else {
          resolve(tokenizer);
        }
      });
    });
  });

  return tokenizerPromise;
}

const KANJI_RE = /[\u4E00-\u9FFF\u3400-\u4DBF]/;

function needsFurigana(surface: string, reading: string | undefined): boolean {
  if (!reading) return false;
  if (!KANJI_RE.test(surface)) return false;
  return toHiragana(reading) !== surface;
}

export async function generateFurigana(text: string): Promise<string> {
  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(text);

  return tokens
    .map((token) => {
      const surface = token.surface_form;
      const reading = token.reading;
      if (needsFurigana(surface, reading)) {
        return `｜${surface}｜${toHiragana(reading!)}｜`;
      }
      return surface;
    })
    .join('');
}
