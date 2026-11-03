'use client';

import { Popover } from '@base-ui/react/popover';
import { Minus, Plus, SlidersHorizontal } from 'lucide-react';
import type { Tool } from '@/lib/tools';
import type { FormatOptions } from '@/lib/formatters/types';

export interface ViewSettings {
  autoRun: boolean;
  showLines: boolean;
  fontSize: number;
  font: 'geist-mono' | 'jetbrains-mono' | 'fira-code';
}

export const FONT_VAR: Record<ViewSettings['font'], string> = {
  'geist-mono': 'var(--font-geist-mono)',
  'jetbrains-mono': 'var(--font-jetbrains-mono)',
  'fira-code': 'var(--font-fira-code)',
};

const INDENTS: { value: FormatOptions['indent']; label: string }[] = [
  { value: 2, label: '2' },
  { value: 4, label: '4' },
  { value: 8, label: '8' },
  { value: 'tab', label: 'Tab' },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-2">
      <span className="text-[0.8125rem] text-foreground">{label}</span>
      {children}
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-5 w-9 shrink-0 rounded-full bg-muted transition-colors aria-checked:bg-accent"
    >
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform: checked ? 'translateX(16px)' : undefined }} />
    </button>
  );
}

export function SettingsPopover({
  tool,
  options,
  onOptions,
  view,
  onView,
}: {
  tool: Tool;
  options: FormatOptions;
  onOptions: (next: FormatOptions) => void;
  view: ViewSettings;
  onView: (next: ViewSettings) => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger className="btn" aria-label="Settings">
        <SlidersHorizontal size={15} />
        <span className="hidden sm:inline">Options</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start" className="z-50">
          <Popover.Popup className="w-[300px] rounded-lg border border-border-strong bg-surface p-4 shadow-xl outline-none" data-testid="settings">
            <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Output</p>
            <Row label="Indent">
              <div className="seg" role="group" aria-label="Indent">
                {INDENTS.map((i) => (
                  <button key={String(i.value)} type="button" aria-pressed={options.indent === i.value} onClick={() => onOptions({ ...options, indent: i.value })} className="!px-2.5">
                    {i.label}
                  </button>
                ))}
              </div>
            </Row>
            {tool.sortLabel && (
              <Row label={tool.sortLabel}>
                <Switch checked={options.sort} onChange={(sort) => onOptions({ ...options, sort })} label={tool.sortLabel} />
              </Row>
            )}
            {tool.upperLabel && (
              <Row label={tool.upperLabel}>
                <Switch checked={options.upper} onChange={(upper) => onOptions({ ...options, upper })} label={tool.upperLabel} />
              </Row>
            )}

            <div className="my-2 h-px bg-border" />
            <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Editor</p>
            <Row label="Format as you type">
              <Switch checked={view.autoRun} onChange={(autoRun) => onView({ ...view, autoRun })} label="Format as you type" />
            </Row>
            <Row label="Line numbers">
              <Switch checked={view.showLines} onChange={(showLines) => onView({ ...view, showLines })} label="Line numbers" />
            </Row>
            <Row label="Font size">
              <div className="flex items-center gap-1">
                <button type="button" className="btn btn-icon !h-7 !w-7" aria-label="Smaller text" onClick={() => onView({ ...view, fontSize: Math.max(11, view.fontSize - 1) })}>
                  <Minus size={13} />
                </button>
                <span className="w-9 text-center font-mono text-[0.8125rem] tabular-nums" data-testid="font-size">{view.fontSize}</span>
                <button type="button" className="btn btn-icon !h-7 !w-7" aria-label="Larger text" onClick={() => onView({ ...view, fontSize: Math.min(22, view.fontSize + 1) })}>
                  <Plus size={13} />
                </button>
              </div>
            </Row>
            <Row label="Font">
              <select
                value={view.font}
                onChange={(e) => onView({ ...view, font: e.target.value as ViewSettings['font'] })}
                aria-label="Font"
                className="h-8 rounded-md border border-border-strong bg-surface px-2 text-[0.8125rem]"
              >
                <option value="geist-mono">Geist Mono</option>
                <option value="jetbrains-mono">JetBrains Mono</option>
                <option value="fira-code">Fira Code</option>
              </select>
            </Row>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
