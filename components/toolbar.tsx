'use client';

import {
  BookOpen,
  Copy,
  Download,
  EllipsisVertical,
  Languages,
  Printer,
  Sparkles,
  SquareSplitHorizontal,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';
import { useRef } from 'react';

import { ToolbarButton } from '@/components/toolbar-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { type Layout, useLanguage } from '@/lib/i18n';
import {
  TRANSLATION_TARGET_LABEL,
  type TranslationTarget,
} from '@/lib/translation';

interface ToolbarProps {
  onGenerate: () => void;
  isAnalyzing: boolean;
  canRevert: boolean;
  onRevert: () => void;
  layout: Layout;
  onToggleLayout: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onExportEpub: () => void;
  onPrint: () => void;
  onCopyRawText: () => void;
  onClear: () => void;
  title: string;
  onTitleChange: (title: string) => void;
  translationTarget: TranslationTarget;
  onTranslationTargetChange: (target: TranslationTarget) => void;
}

export function Toolbar({
  onGenerate,
  isAnalyzing,
  canRevert,
  onRevert,
  layout,
  onToggleLayout,
  onExport,
  onImport,
  onExportEpub,
  onPrint,
  onCopyRawText,
  onClear,
  title,
  onTitleChange,
  translationTarget,
  onTranslationTargetChange,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  }

  const layoutLabel =
    layout === 'both'
      ? t.hideEditor
      : layout === 'preview'
        ? t.hidePreview
        : t.showBoth;

  return (
    <>
      <div className="no-print border-border bg-background/80 border-b px-4 py-2 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2">
          <ToolbarButton onClick={onGenerate} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <span className="border-primary-foreground inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                <span className="hidden md:inline">{t.analyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden md:inline">{t.generate}</span>
              </>
            )}
          </ToolbarButton>

          <ToolbarButton
            variant="outline"
            onClick={onRevert}
            disabled={!canRevert}
            title={t.revert}
          >
            <Undo2 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline">{t.revert}</span>
          </ToolbarButton>

          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t.titlePlaceholder}
            className="mx-auto h-7 max-w-md min-w-36 flex-1 text-sm"
          />

          {/* Translation target — always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="border-input bg-background hover:bg-muted hover:text-foreground inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border px-2 text-xs"
              title={t.translation}
            >
              <Languages className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">
                {translationTarget === 'off'
                  ? t.translationOff
                  : TRANSLATION_TARGET_LABEL[translationTarget]}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={translationTarget}
                onValueChange={(v) =>
                  onTranslationTargetChange(v as TranslationTarget)
                }
              >
                <DropdownMenuRadioItem value="off">
                  {t.translationOff}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">
                  {TRANSLATION_TARGET_LABEL.en}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="zh-tw">
                  {TRANSLATION_TARGET_LABEL['zh-tw']}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout toggle — always visible */}
          <ToolbarButton
            variant="outline"
            onClick={onToggleLayout}
            title={layoutLabel}
          >
            <SquareSplitHorizontal className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline">{layoutLabel}</span>
          </ToolbarButton>

          {/* Full button row — visible on md+ */}
          <div className="hidden items-center gap-2 md:flex">
            <ToolbarButton
              variant="outline"
              onClick={onExport}
              title={t.export}
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span>{t.export}</span>
            </ToolbarButton>

            <ToolbarButton
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              title={t.import}
            >
              <Upload className="h-3.5 w-3.5 shrink-0" />
              <span>{t.import}</span>
            </ToolbarButton>

            <ToolbarButton
              variant="outline"
              onClick={onExportEpub}
              title={t.exportEpub}
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>{t.exportEpub}</span>
            </ToolbarButton>

            <ToolbarButton variant="outline" onClick={onPrint} title={t.print}>
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span>{t.print}</span>
            </ToolbarButton>

            <ToolbarButton
              variant="outline"
              onClick={onCopyRawText}
              title={t.copyRawText}
            >
              <Copy className="h-3.5 w-3.5 shrink-0" />
              <span>{t.copyRawText}</span>
            </ToolbarButton>

            <ToolbarButton
              variant="destructive"
              onClick={onClear}
              title={t.clear}
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>{t.clear}</span>
            </ToolbarButton>
          </div>

          {/* Dropdown menu — visible on < md */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-7 w-10 cursor-pointer items-center justify-center rounded-md border text-sm">
                <EllipsisVertical className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4" />
                  {t.export}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  {t.import}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportEpub}>
                  <BookOpen className="h-4 w-4" />
                  {t.exportEpub}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPrint}>
                  <Printer className="h-4 w-4" />
                  {t.print}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopyRawText}>
                  <Copy className="h-4 w-4" />
                  {t.copyRawText}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onClear}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.clear}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </>
  );
}
