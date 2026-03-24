'use client';

import { createContext, useContext } from 'react';

export type Language = 'en' | 'zh-tw' | 'ja';
export type Layout = 'both' | 'editor' | 'preview';

export const LANGUAGE_CYCLE: Language[] = ['en', 'zh-tw', 'ja'];

export const LANGUAGE_LABEL: Record<Language, string> = {
  en: 'EN',
  'zh-tw': '中文',
  ja: '日本語',
};

export interface Translations {
  generate: string;
  analyzing: string;
  revert: string;
  hideEditor: string;
  hidePreview: string;
  showBoth: string;
  export: string;
  exportEpub: string;
  import: string;
  print: string;
  copyRawText: string;
  clear: string;
  titlePlaceholder: string;
  editorPlaceholder: string;
  previewEmpty: string;
  footerText: string;
  dropOverlay: string;
  translation: string;
  translationOff: string;
  translationLoading: string;
  translationError: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    generate: 'Generate Furigana',
    analyzing: 'Analyzing…',
    revert: 'Revert',
    hideEditor: 'Hide Editor',
    hidePreview: 'Hide Preview',
    showBoth: 'Show Both',
    export: 'Export',
    exportEpub: 'EPUB',
    import: 'Import',
    print: 'Print',
    copyRawText: 'Copy Text',
    clear: 'Clear',
    titlePlaceholder: 'Song title',
    editorPlaceholder:
      'Paste lyrics here, then click Generate ✨\n\nOr use the markup directly:\n｜漢字｜かな｜\n\nExample:\n｜今日｜きょう｜は｜良｜よ｜い｜天気｜てんき｜です',
    previewEmpty: 'Preview will appear here...',
    footerText: '© 2026 Furioke — Japanese lyrics with furigana (振り仮名)',
    dropOverlay: 'Drop JSON file to import',
    translation: 'Translation',
    translationOff: 'Off',
    translationLoading: 'Translating…',
    translationError: 'Translation unavailable',
  },
  'zh-tw': {
    generate: '生成振假名',
    analyzing: '分析中…',
    revert: '還原',
    hideEditor: '隱藏編輯器',
    hidePreview: '隱藏預覽',
    showBoth: '顯示兩者',
    export: '匯出',
    exportEpub: 'EPUB',
    import: '匯入',
    print: '列印',
    copyRawText: '複製文字',
    clear: '清除',
    titlePlaceholder: '歌曲標題',
    editorPlaceholder:
      '在此貼上歌詞，然後點擊生成 ✨\n\n或直接使用標記：\n｜漢字｜かな｜\n\n示例：\n｜今日｜きょう｜は｜良｜よ｜い｜天気｜てんき｜です',
    previewEmpty: '預覽將顯示在此處⋯⋯',
    footerText: '© 2026 Furioke — 帶振り仮名的日語歌詞',
    dropOverlay: '拖放 JSON 檔案以匯入',
    translation: '翻譯',
    translationOff: '關閉',
    translationLoading: '翻譯中⋯',
    translationError: '無法翻譯',
  },
  ja: {
    generate: '振り仮名を生成',
    analyzing: '解析中…',
    revert: '元に戻す',
    hideEditor: '編集を隠す',
    hidePreview: 'プレビューを隠す',
    showBoth: '両方を表示',
    export: '書き出す',
    exportEpub: 'EPUB',
    import: '読み込む',
    print: '印刷',
    copyRawText: 'テキストをコピー',
    clear: 'クリア',
    titlePlaceholder: '曲名',
    editorPlaceholder:
      'ここに歌詞を貼り付けて、生成をクリック ✨\n\nまたは直接マークアップを使用：\n｜漢字｜かな｜\n\n例：\n｜今日｜きょう｜は｜良｜よ｜い｜天気｜てんき｜です',
    previewEmpty: 'プレビューがここに表示されます⋯',
    footerText: '© 2026 Furioke — 振り仮名付き日本語歌詞',
    dropOverlay: 'JSON ファイルをドロップして読み込む',
    translation: '翻訳',
    translationOff: 'オフ',
    translationLoading: '翻訳中⋯',
    translationError: '翻訳できません',
  },
};

interface LanguageContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  t: translations.en,
  setLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}
