'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const scalar = (v: unknown) => {
  if (typeof v === 'string') return <span style={{ color: 'var(--tok-string)' }}>{JSON.stringify(v)}</span>;
  if (typeof v === 'number') return <span style={{ color: 'var(--tok-number)' }}>{String(v)}</span>;
  if (typeof v === 'boolean') return <span style={{ color: 'var(--tok-keyword)' }}>{String(v)}</span>;
  return <span className="text-muted-foreground">null</span>;
};

function Node({ name, value, depth, last }: { name?: string; value: unknown; depth: number; last: boolean }) {
  const isObj = value !== null && typeof value === 'object';
  const [open, setOpen] = useState(depth < 2);
  const comma = last ? '' : ',';
  const key =
    name !== undefined ? (
      <>
        <span style={{ color: 'var(--tok-key)' }}>{JSON.stringify(name)}</span>
        <span className="text-muted-foreground">:&nbsp;</span>
      </>
    ) : null;

  if (!isObj) {
    return (
      <div className="pl-[22px]">
        {key}
        {scalar(value)}
        {comma}
      </div>
    );
  }
  const entries = Array.isArray(value) ? (value as unknown[]).map((v, i) => [String(i), v] as const) : Object.entries(value as object);
  const [openCh, closeCh] = Array.isArray(value) ? ['[', ']'] : ['{', '}'];
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center rounded text-left hover:bg-muted">
        <ChevronRight size={14} className={cn('mr-1 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90')} />
        {key}
        <span>{openCh}</span>
        {!open && (
          <span className="text-muted-foreground">
            &nbsp;{entries.length} {entries.length === 1 ? 'item' : 'items'}&nbsp;{closeCh}
            {comma}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="ml-[7px] border-l border-border pl-3">
            {entries.map(([k, v], i) => (
              <Node key={k} name={Array.isArray(value) ? undefined : k} value={v} depth={depth + 1} last={i === entries.length - 1} />
            ))}
          </div>
          <div className="pl-[22px]">
            {closeCh}
            {comma}
          </div>
        </>
      )}
    </div>
  );
}

/** Collapsible view of a parsed JSON value. The first two levels start open. */
export function JsonTree({ text, fontSize }: { text: string; fontSize: number }) {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  return (
    <div className="thin-scroll code min-h-0 flex-1 overflow-auto bg-surface p-4" style={{ fontSize, lineHeight: 1.7 }} data-testid="json-tree">
      <Node value={value} depth={0} last />
    </div>
  );
}
