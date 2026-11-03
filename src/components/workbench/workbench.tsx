'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeftRight, Check, ClipboardPaste, Copy, Download, FileUp, FlaskConical, Trash2, Zap } from 'lucide-react';
import { getTool, type ToolId } from '@/lib/tools';
import { DEFAULT_OPTIONS, type FormatOptions, type RunResult } from '@/lib/formatters/types';
import { useStored } from '@/hooks/use-stored';
import { cn } from '@/lib/utils';
import { CodeInput, CodeOutput } from './code-pane';
import { JsonTree } from './json-tree';
import { FONT_VAR, SettingsPopover, type ViewSettings } from './settings-popover';

const DEFAULT_VIEW: ViewSettings = { autoRun: true, showLines: true, fontSize: 13, font: 'geist-mono' };

const bytes = (s: string) => new Blob([s]).size;
const fmtBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`);

type Pane = 'input' | 'output';

export function Workbench({ toolId }: { toolId: ToolId }) {
  const tool = getTool(toolId)!;
  const [input, setInput, ready] = useStored<string>(`fh:${toolId}:input`, tool.sample);
  const [options, setOptions] = useStored<FormatOptions>('fh:options', DEFAULT_OPTIONS);
  const [view, setView] = useStored<ViewSettings>('fh:view', DEFAULT_VIEW);
  const [split, setSplit] = useStored<number>('fh:split', 50);

  const [actionId, setActionId] = useState(tool.actions[0].id);
  const [result, setResult] = useState<RunResult | null>(null);
  const [outView, setOutView] = useState<'code' | 'tree'>('code');
  const [pane, setPane] = useState<Pane>('input');
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const runId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);

  const action = tool.actions.find((a) => a.id === actionId) ?? tool.actions[0];
  const output = result?.ok ? result.output : '';
  const error = result && !result.ok ? result : null;

  const run = async (id: string = actionId, text: string = input) => {
    const act = tool.actions.find((a) => a.id === id) ?? tool.actions[0];
    const mine = ++runId.current;
    if (!text.trim()) {
      setResult(null);
      return;
    }
    const r = await act.run(text, options);
    if (mine === runId.current) setResult(r);
  };

  // Re-run when the text, action or options change, after a short pause so typing stays smooth.
  useEffect(() => {
    if (!ready || !view.autoRun) return;
    const t = setTimeout(() => void run(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, view.autoRun, input, options, actionId, toolId]);

  const choose = (id: string) => {
    setActionId(id);
    void run(id);
    setPane('output');
  };

  // Keyboard: Ctrl/Cmd+Enter runs the first action, Ctrl/Cmd+Shift+M the second.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        choose(tool.actions[0].id);
      } else if (e.shiftKey && e.key.toLowerCase() === 'm' && tool.actions[1]) {
        e.preventDefault();
        choose(tool.actions[1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2200);
  };

  const copy = async () => {
    const text = output || input;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      flash('Copy was blocked by the browser');
    }
  };

  const download = () => {
    const text = output || input;
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: tool.mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.${action.id === 'json' ? 'json' : tool.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result ?? ''));
      flash(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const paste = async () => {
    try {
      setInput(await navigator.clipboard.readText());
      inputRef.current?.focus();
    } catch {
      flash('Allow clipboard access, or paste with Ctrl/⌘ + V');
      inputRef.current?.focus();
    }
  };

  const swap = () => {
    if (!output) return;
    setInput(output);
  };

  const jumpToError = () => {
    if (!error?.line) return;
    const el = inputRef.current;
    if (!el) return;
    setPane('input');
    const lines = input.split('\n');
    const offset = lines.slice(0, error.line - 1).reduce((n, l) => n + l.length + 1, 0) + Math.max(0, (error.column ?? 1) - 1);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(offset, offset);
      el.parentElement?.parentElement?.parentElement?.scrollTo({ top: Math.max(0, (error.line! - 4) * Math.round(view.fontSize * 1.65)) });
    });
  };

  // Resizable split (desktop).
  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const box = splitRef.current!.getBoundingClientRect();
    const move = (ev: PointerEvent) => setSplit(Math.min(75, Math.max(25, ((ev.clientX - box.left) / box.width) * 100)));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const stats = useMemo(() => {
    const a = bytes(input);
    const b = output ? bytes(output) : 0;
    return { a, b, lines: input ? input.split('\n').length : 0, delta: a && b ? Math.round(((b - a) / a) * 100) : null };
  }, [input, output]);

  const state: 'idle' | 'valid' | 'invalid' = error ? 'invalid' : output ? 'valid' : 'idle';
  const canTree = tool.id === 'json' && result?.ok && action.id === 'format';
  const showTree = canTree && outView === 'tree';
  const fontStyle = { ['--font-code' as string]: FONT_VAR[view.font] };

  return (
    <main className="flex h-[calc(100dvh-3.5rem)] flex-col" style={fontStyle}>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5 sm:px-6">
        <div className="seg" role="group" aria-label="Action">
          {tool.actions.map((a) => (
            <button key={a.id} type="button" aria-pressed={actionId === a.id} onClick={() => choose(a.id)} title={a.hint} data-testid={`action-${a.id}`}>
              {a.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => choose(actionId)} title="Run now (Ctrl/⌘ + Enter)" data-testid="run">
          <Zap size={15} />
          Run
        </button>
        <SettingsPopover tool={tool} options={options} onOptions={setOptions} view={view} onView={setView} />

        <div className="ml-auto flex items-center gap-1">
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()} title="Open a file">
            <FileUp size={15} />
            <span className="hidden lg:inline">Open</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={tool.accept}
            hidden
            aria-label="Open file"
            data-testid="file-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
              e.target.value = '';
            }}
          />
          <button type="button" className="btn btn-ghost" onClick={paste} title="Paste from clipboard">
            <ClipboardPaste size={15} />
            <span className="hidden lg:inline">Paste</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setInput(tool.sample)} title="Load a sample">
            <FlaskConical size={15} />
            <span className="hidden lg:inline">Sample</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setInput('')} title="Clear input" data-testid="clear">
            <Trash2 size={15} />
            <span className="hidden lg:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* mobile pane switch */}
      <div className="border-b border-border p-2 md:hidden">
        <div className="seg w-full" role="tablist">
          {(['input', 'output'] as Pane[]).map((p) => (
            <button key={p} role="tab" aria-selected={pane === p} onClick={() => setPane(p)} className="flex-1 capitalize">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* panes */}
      <div ref={splitRef} className="flex min-h-0 flex-1" style={{ ['--split' as string]: `${split}%` }}>
        <section className={cn('flex min-w-0 flex-col md:w-[var(--split)] md:flex-none', pane === 'input' ? 'flex-1' : 'hidden md:flex')} aria-label="Input">
          <PaneHeader title="Input" meta={`${stats.lines} lines · ${fmtBytes(stats.a)}`} />
          <CodeInput
            ref={inputRef}
            value={input}
            onChange={setInput}
            fontSize={view.fontSize}
            showLines={view.showLines}
            language={tool.language}
            errorLine={error?.line}
            placeholder={`Paste ${tool.label} here, or drop a file…`}
            onDropFile={readFile}
            ariaLabel={`${tool.label} input`}
          />
        </section>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panes"
          tabIndex={0}
          onPointerDown={startDrag}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setSplit((s) => Math.max(25, s - 3));
            if (e.key === 'ArrowRight') setSplit((s) => Math.min(75, s + 3));
          }}
          className="group relative hidden w-px shrink-0 cursor-col-resize bg-border md:block"
        >
          <span className="absolute inset-y-0 -left-1.5 -right-1.5 transition-colors group-hover:bg-accent/30 group-focus-visible:bg-accent/30" />
        </div>

        <section className={cn('flex min-w-0 flex-1 flex-col', pane === 'output' ? 'flex' : 'hidden md:flex')} aria-label="Output">
          <PaneHeader
            title="Output"
            meta={output ? `${output.split('\n').length} lines · ${fmtBytes(stats.b)}` : undefined}
            right={
              <>
                {canTree && (
                  <div className="seg mr-1" role="group" aria-label="Output view">
                    <button type="button" aria-pressed={outView === 'code'} onClick={() => setOutView('code')} className="!h-6 !px-2 !text-xs">
                      Code
                    </button>
                    <button type="button" aria-pressed={outView === 'tree'} onClick={() => setOutView('tree')} className="!h-6 !px-2 !text-xs" data-testid="tree-toggle">
                      Tree
                    </button>
                  </div>
                )}
                <button type="button" className="btn btn-ghost !h-7 !px-2" onClick={swap} disabled={!output} title="Use output as input" data-testid="swap">
                  <ArrowLeftRight size={14} />
                </button>
                <button type="button" className="btn btn-ghost !h-7 !px-2" onClick={download} disabled={!output && !input} title="Download" data-testid="download">
                  <Download size={14} />
                </button>
                <button type="button" className="btn !h-7 !px-2.5" onClick={copy} disabled={!output && !input} title="Copy output" data-testid="copy">
                  {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </>
            }
          />
          {showTree && output ? (
            <JsonTree text={output} fontSize={view.fontSize} />
          ) : (
            <CodeOutput
              value={output}
              fontSize={view.fontSize}
              showLines={view.showLines}
              language={action.id === 'json' ? 'json' : tool.language}
              empty={
                error ? (
                  <ErrorCard error={error} onJump={jumpToError} />
                ) : (
                  <p className="max-w-xs text-sm text-muted-foreground">
                    {input.trim() ? 'Working…' : <>Paste some {tool.label} on the left. The result appears here as you type.</>}
                  </p>
                )
              }
            />
          )}
        </section>
      </div>

      {/* status bar */}
      <footer className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-surface px-4 py-1.5 text-xs sm:px-6" role="status" aria-live="polite">
        <span className={cn('inline-flex items-center gap-1.5 font-medium', state === 'valid' && 'text-ok', state === 'invalid' && 'text-danger', state === 'idle' && 'text-muted-foreground')} data-testid="status" data-state={state}>
          <span className={cn('h-1.5 w-1.5 rounded-full', state === 'valid' ? 'bg-ok' : state === 'invalid' ? 'bg-danger' : 'bg-muted-foreground')} />
          {state === 'valid' ? 'Valid' : state === 'invalid' ? 'Invalid' : 'Ready'}
        </span>
        {error && (
          <button type="button" onClick={jumpToError} className="inline-flex min-w-0 items-center gap-1 truncate text-danger hover:underline" data-testid="error-line">
            <AlertCircle size={13} className="shrink-0" />
            <span className="truncate">
              {error.line ? `Line ${error.line}${error.column ? `, col ${error.column}` : ''}: ` : ''}
              {error.message}
            </span>
          </button>
        )}
        {notice && <span className="text-muted-foreground">{notice}</span>}
        <span className="ml-auto flex items-center gap-4 text-muted-foreground tabular-nums">
          {stats.delta !== null && stats.delta !== 0 && (
            <span data-testid="delta">
              {fmtBytes(stats.a)} → {fmtBytes(stats.b)} ({stats.delta > 0 ? '+' : ''}
              {stats.delta}%)
            </span>
          )}
          <span className="hidden sm:inline">
            <span className="kbd">Ctrl/⌘ ↵</span> run
          </span>
        </span>
      </footer>
    </main>
  );
}

function PaneHeader({ title, meta, right }: { title: string; meta?: string; right?: React.ReactNode }) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border px-4 sm:px-5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {meta && <span className="text-xs text-muted-foreground tabular-nums">{meta}</span>}
      </div>
      <div className="flex items-center">{right}</div>
    </div>
  );
}

function ErrorCard({ error, onJump }: { error: Extract<RunResult, { ok: false }>; onJump: () => void }) {
  return (
    <div className="max-w-sm text-left" data-testid="error-card">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-danger">
        <AlertCircle size={15} /> Can’t parse this
      </p>
      <p className="font-mono text-[0.8125rem] leading-relaxed text-foreground">{error.message}</p>
      {error.line && (
        <button type="button" onClick={onJump} className="btn mt-3 !h-8">
          Go to line {error.line}
        </button>
      )}
    </div>
  );
}
