'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EditorPane } from '@/components/editor-pane';
import { LayoutShell } from '@/components/layout-shell';
import { PreviewPane } from '@/components/preview-pane';
import { Toolbar } from '@/components/toolbar';
import { exportEpub } from '@/lib/epub';
import {
  type Language,
  LanguageContext,
  type Layout,
  translations,
} from '@/lib/i18n';
import { exportJson, importJson } from '@/lib/io';
import { generateFurigana } from '@/lib/kuromoji-tokenizer';
import { parseToHtml } from '@/lib/parser';
import type { TranslationTarget } from '@/lib/translation';

export default function Page() {
  const [lyrics, setLyrics] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [layout, setLayout] = useState<Layout>('both');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('ja');
  const [translationTarget, setTranslationTarget] =
    useState<TranslationTarget>('off');
  const [isDragging, setIsDragging] = useState(false);
  const hydrated = useRef(false);
  const dragCounter = useRef(0);

  const { t } = useMemo(() => ({ t: translations[language] }), [language]);

  useEffect(() => {
    const storedLayout = localStorage.getItem(
      'furioke:layout',
    ) as Layout | null;
    if (
      storedLayout === 'both' ||
      storedLayout === 'editor' ||
      storedLayout === 'preview'
    ) {
      setLayout(storedLayout);
    }
    const storedTitle = localStorage.getItem('furioke:title');
    if (storedTitle !== null) setTitle(storedTitle);
    const storedLyrics = localStorage.getItem('furioke:lyrics');
    if (storedLyrics !== null) setLyrics(storedLyrics);
    const storedTarget = localStorage.getItem(
      'furioke:translationTarget',
    ) as TranslationTarget | null;
    if (
      storedTarget === 'off' ||
      storedTarget === 'en' ||
      storedTarget === 'zh-tw'
    ) {
      setTranslationTarget(storedTarget);
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem('furioke:layout', layout);
  }, [layout]);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem('furioke:title', title);
  }, [title]);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem('furioke:lyrics', lyrics);
  }, [lyrics]);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem('furioke:translationTarget', translationTarget);
  }, [translationTarget]);

  function cycleLayout() {
    setLayout((v) =>
      v === 'both' ? 'preview' : v === 'preview' ? 'editor' : 'both',
    );
  }

  const previewHtml = useMemo(() => parseToHtml(lyrics), [lyrics]);

  async function handleGenerate() {
    if (!lyrics.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await generateFurigana(lyrics);
      setLyrics(result);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleRevert() {
    setLyrics((v) => v.replace(/｜([^｜\n]+)｜[^｜\n]+｜/g, '$1'));
  }

  function handleExport() {
    exportJson(title, lyrics);
  }

  function handleExportEpub() {
    exportEpub(title, previewHtml);
  }

  const handleImportFile = useCallback(async (file: File) => {
    try {
      const data = await importJson(file);
      setTitle(data.title);
      setLyrics(data.lyrics);
    } catch (err) {
      console.error(err);
    }
  }, []);

  function handlePrint() {
    const content = document.querySelector('.print-area')?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const safeTitle = title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${safeTitle || 'Furioke'}</title>
<style>
body {
  font-family: 'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  font-size: 14pt;
  line-height: 2.8;
  color: #000;
  background: #fff;
  padding: 2rem;
  margin: 0;
}
h1 { font-size: 20pt; margin-bottom: 1rem; }
ruby rt { font-size: 0.5em; line-height: 1; }
ruby { break-inside: avoid; }
@page {
  margin-bottom: 2.5cm;
  @bottom-center {
    content: "Made with furioke.com";
    font-size: 9pt;
    color: #999;
  }
}
</style></head><body>${title ? `<h1>${safeTitle}</h1>` : ''}${content}</body></html>`);
    win.document.close();
    win.addEventListener('afterprint', () => win.close());
    win.print();
  }

  function handleCopyRawText() {
    const raw = lyrics.replace(/｜([^｜\n]+)｜[^｜\n]+｜/g, '$1');
    navigator.clipboard.writeText(raw);
  }

  function handleClear() {
    setTitle('');
    setLyrics('');
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.json')) {
      handleImportFile(file);
    }
  }

  return (
    <LanguageContext.Provider
      value={{ language, t: translations[language], setLanguage }}
    >
      <div
        className="relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <LayoutShell
          layout={layout}
          toolbar={
            <Toolbar
              onGenerate={handleGenerate}
              isAnalyzing={isAnalyzing}
              canRevert={/｜[^｜\n]+｜[^｜\n]+｜/.test(lyrics)}
              onRevert={handleRevert}
              layout={layout}
              onToggleLayout={cycleLayout}
              onExport={handleExport}
              onImport={handleImportFile}
              onExportEpub={handleExportEpub}
              onPrint={handlePrint}
              onCopyRawText={handleCopyRawText}
              onClear={handleClear}
              title={title}
              onTitleChange={setTitle}
              translationTarget={translationTarget}
              onTranslationTargetChange={setTranslationTarget}
            />
          }
          editor={
            <EditorPane
              value={lyrics}
              onChange={setLyrics}
              visible={layout !== 'preview'}
            />
          }
          preview={
            <PreviewPane
              html={previewHtml}
              raw={lyrics}
              translationTarget={translationTarget}
            />
          }
        />

        {isDragging && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="border-primary bg-background rounded-xl border-2 border-dashed px-8 py-6 text-lg font-medium shadow-lg">
              {t.dropOverlay}
            </div>
          </div>
        )}
      </div>
    </LanguageContext.Provider>
  );
}
