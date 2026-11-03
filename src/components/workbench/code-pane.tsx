'use client';

import { forwardRef, useMemo, type ReactNode } from 'react';
import { highlight } from '@/lib/highlight';

interface Common {
  fontSize: number;
  showLines: boolean;
  language: string;
}

export const lineHeight = (fontSize: number) => Math.round(fontSize * 1.65);

function Gutter({ count, lh, errorLine }: { count: number; lh: number; errorLine?: number }) {
  return (
    <div className="gutter sticky left-0 z-10 shrink-0 bg-surface pl-3 pr-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ height: lh, lineHeight: `${lh}px` }} className={errorLine === i + 1 ? '!text-danger font-semibold opacity-100' : undefined}>
          {i + 1}
        </div>
      ))}
    </div>
  );
}

function Frame({ children, fontSize }: { children: ReactNode; fontSize: number }) {
  return (
    <div className="thin-scroll code relative min-h-0 flex-1 overflow-auto bg-surface" style={{ fontSize }}>
      <div className="flex min-h-full w-max min-w-full py-3">{children}</div>
    </div>
  );
}

interface InputProps extends Common {
  value: string;
  onChange: (v: string) => void;
  errorLine?: number;
  placeholder: string;
  onDropFile: (file: File) => void;
  ariaLabel: string;
}

/** Editable pane: a line-number gutter next to a textarea that is exactly as tall and wide as its content, so the frame scrolls both. */
export const CodeInput = forwardRef<HTMLTextAreaElement, InputProps>(function CodeInput(
  { value, onChange, fontSize, showLines, errorLine, placeholder, onDropFile, ariaLabel },
  ref,
) {
  const lh = lineHeight(fontSize);
  const lines = value.split('\n');
  const widest = useMemo(() => lines.reduce((m, l) => Math.max(m, l.length), 0), [lines]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const file = e.dataTransfer.files?.[0];
        if (file) {
          e.preventDefault();
          onDropFile(file);
        }
      }}
    >
      <Frame fontSize={fontSize}>
        {showLines && <Gutter count={lines.length} lh={lh} errorLine={errorLine} />}
        <div className="relative flex-1 pr-6" style={{ paddingLeft: showLines ? 0 : 16 }}>
          {errorLine ? (
            <div className="pointer-events-none absolute inset-x-0 border-l-2 border-danger bg-danger/10" style={{ top: (errorLine - 1) * lh, height: lh }} />
          ) : null}
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                const el = e.currentTarget;
                const { selectionStart: s, selectionEnd: end } = el;
                onChange(value.slice(0, s) + '  ' + value.slice(end));
                requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
              }
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            aria-label={ariaLabel}
            placeholder={placeholder}
            className="block resize-none overflow-hidden whitespace-pre bg-transparent outline-none placeholder:text-muted-foreground/60"
            style={{ height: Math.max(lines.length, 1) * lh, lineHeight: `${lh}px`, width: `max(100%, ${widest + 2}ch)` }}
          />
        </div>
      </Frame>
    </div>
  );
});

interface OutputProps extends Common {
  value: string;
  empty: ReactNode;
}

export function CodeOutput({ value, fontSize, showLines, language, empty }: OutputProps) {
  const lh = lineHeight(fontSize);
  const html = useMemo(() => highlight(value, language), [value, language]);
  const count = value ? value.split('\n').length : 0;

  if (!value) return <div className="flex min-h-0 flex-1 items-center justify-center bg-surface p-6 text-center">{empty}</div>;
  return (
    <Frame fontSize={fontSize}>
      {showLines && <Gutter count={count} lh={lh} />}
      <pre
        className="hljs flex-1 whitespace-pre pr-6 font-[inherit]"
        style={{ lineHeight: `${lh}px`, paddingLeft: showLines ? 0 : 16 }}
        data-testid="output"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Frame>
  );
}
