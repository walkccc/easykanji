'use client';

import { useLanguage } from '@/lib/i18n';

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
}

export function EditorPane({ value, onChange, visible }: EditorPaneProps) {
  const { t } = useLanguage();

  return (
    <div className={`no-print flex h-full flex-col${visible ? '' : 'hidden'}`}>
      <textarea
        className="text-foreground placeholder:text-muted-foreground h-full min-h-64 w-full resize-none rounded-none border-0 p-4 font-mono text-sm leading-relaxed outline-none focus:ring-0 lg:min-h-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.editorPlaceholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}
