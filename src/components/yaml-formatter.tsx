'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { YamlInput } from '@/components/editor/yaml-input';
import { YamlOutput } from '@/components/editor/yaml-output';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTheme } from '@/components/providers/theme-provider';
import {
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  FileText,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { YamlFormatterSettings } from '@/types/formatter';

const DEFAULT_YAML = `name: John Smith
email: john@example.com
profile:
  age: 30
  city: New York
  skills:
    - JavaScript
    - Python
    - SQL
projects:
  - name: Web App
    status: completed
  - name: Mobile App
    status: in-progress`;

export function YamlFormatter() {
  const [settings] = useLocalStorage<YamlFormatterSettings>('yaml-formatter-settings', {
    indentSize: 2,
    validateYaml: true,
    showLineNumbers: true,
    theme: 'system',
    fontFamily: 'inter',
    fontSize: 14,
  });

  const [input, setInput] = useState(DEFAULT_YAML);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading] = useState(false);
  const { setTheme, theme } = useTheme();

  const formatYaml = useCallback(() => {
    try {
      setOutput(input);
      setError(null);
      setIsValid(true);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Invalid YAML');
      setIsValid(false);
    }
  }, [input]);

  useEffect(() => {
    if (input && settings.validateYaml) {
      setTimeout(() => formatYaml(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, settings.validateYaml]);

  const handleCopy = useCallback(() => {
    const textToCopy = output || input;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output, input]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    setIsValid(false);
  }, []);

  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output);
      setOutput('');
      setError(null);
      setIsValid(false);
    }
  }, [output]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-background">
      <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button variant="ghost" size="sm" onClick={formatYaml} disabled={!input.trim()} className="h-8 px-3 gap-2 text-xs font-medium rounded-lg hover:bg-accent" title="Format YAML">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Format</span>
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!input.trim()} className="h-8 w-8 p-0 rounded-lg hover:bg-accent" title={copied ? 'Copied!' : 'Copy'}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          {output && (
            <Button variant="ghost" size="sm" onClick={handleSwap} className="h-8 w-8 p-0 rounded-lg hover:bg-accent" title="Swap">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!input.trim()} className="h-8 w-8 p-0 rounded-lg hover:bg-accent" title="Clear">
            <span className="text-xs">✕</span>
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0 rounded-lg", theme === 'light' ? "bg-amber-500/20 text-amber-600" : "hover:bg-accent")} onClick={() => setTheme('light')} title="Light"><Sun className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0 rounded-lg", theme === 'dark' ? "bg-violet-500/20 text-violet-400" : "hover:bg-accent")} onClick={() => setTheme('dark')} title="Dark"><Moon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0 rounded-lg", theme === 'system' ? "bg-muted" : "hover:bg-accent")} onClick={() => setTheme('system')} title="System"><Monitor className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        <div className="flex flex-1 flex-col rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-amber-500/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
            </div>
            <span className="ml-3 text-sm font-medium text-muted-foreground">Input</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <YamlInput value={input} onChange={setInput} error={error} className="h-full" />
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-amber-500/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
            </div>
            <span className="ml-3 text-sm font-medium text-muted-foreground">Output</span>
            {isValid && <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Valid YAML</div>}
          </div>
          <div className="flex-1 overflow-hidden">
            <YamlOutput content={output} isValid={isValid} error={error} className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
