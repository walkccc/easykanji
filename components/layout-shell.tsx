'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { type Layout } from '@/lib/i18n';

interface LayoutShellProps {
  toolbar: React.ReactNode;
  editor: React.ReactNode;
  preview: React.ReactNode;
  layout: Layout;
}

export function LayoutShell({
  toolbar,
  editor,
  preview,
  layout,
}: LayoutShellProps) {
  const [splitPct, setSplitPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.min(Math.max(pct, 15), 85));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Navbar />
      <div className="no-print shrink-0">{toolbar}</div>
      <div className="flex flex-1 justify-center">
        <div ref={containerRef} className="relative flex w-full max-w-7xl">
          <div
            className="no-print overflow-y-auto"
            style={{
              width:
                layout === 'both'
                  ? `${splitPct}%`
                  : layout === 'editor'
                    ? '100%'
                    : '0%',
            }}
          >
            {editor}
          </div>
          {layout === 'both' && (
            <div
              className="no-print bg-border hover:bg-primary/40 active:bg-primary/60 z-10 w-1 cursor-col-resize transition-colors"
              onMouseDown={onMouseDown}
            />
          )}
          <div
            className="overflow-y-auto"
            style={{ flex: layout === 'editor' ? '0 0 0%' : '1' }}
          >
            {preview}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
