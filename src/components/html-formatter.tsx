'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HtmlInput } from '@/components/editor/html-input';
import { HtmlOutput } from '@/components/editor/html-output';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTheme } from '@/components/providers/theme-provider';
import {
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  FileCode,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HtmlFormatterSettings } from '@/types/formatter';

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sample Page</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:20px}</style>
</head>
<body>
<header><h1>Welcome</h1><nav><a href="#">Home</a><a href="#">About</a></nav></header>
<main><p>This is a sample HTML page.</p></main>
<footer>&copy; 2025</footer>
</body>
</html>`;

export function HtmlFormatter() {
  const [settings] = useLocalStorage<HtmlFormatterSettings>('html-formatter-settings', {
    indentSize: 2,
    validateHtml: true,
    showLineNumbers: true,
    theme: 'system',
    fontFamily: 'inter',
    fontSize: 14,
  });

  const [input, setInput] = useState(DEFAULT_HTML);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading] = useState(false);
  const { setTheme, theme } = useTheme();

  // Format HTML function
  const formatHtml = useCallback(() => {
    try {
      // Simple HTML formatter
      let formatted = input;
      formatted = formatted.replace(/></g, '>\n<');
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentedLines = lines.map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        const indentedLine = '  '.repeat(indentLevel) + trimmed;
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.startsWith('<!--') && trimmed.endsWith('>') && !trimmed.includes('</')) {
          if (!trimmed.startsWith('<')) {
            indentLevel++;
          }
        }
        return indentedLine;
      });
      formatted = indentedLines.join('\n').trim();
      
      setOutput(formatted);
      setError(null);
      setIsValid(true);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Format error');
      setIsValid(false);
    }
  }, [input]);

  // Minify HTML function
  const minifyHtml = useCallback(() => {
    try {
      let minified = input;
      minified = minified.replace(/\s+/g, ' ');
      minified = minified.replace(/>\s+</g, '><');
      minified = minified.trim();
      setOutput(minified);
      setError(null);
      setIsValid(true);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Minify error');
      setIsValid(false);
    }
  }, [input]);

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

  const handleExport = useCallback(() => {
    const textToExport = output || input;
    if (!textToExport) return;
    const blob = new Blob([textToExport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, input]);

  const handleImport = useCallback(() => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = '.html,.htm,text/html';
    inputElement.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInput(content);
        };
        reader.readAsText(file);
      }
    };
    inputElement.click();
  }, []);

  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output);
      setOutput('');
      setError(null);
      setIsValid(false);
    }
  }, [output]);

  useEffect(() => {
    if (input && settings.validateHtml) {
      setTimeout(() => formatHtml(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, settings.validateHtml]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={formatHtml}
            disabled={!input.trim()}
            className="h-8 px-3 gap-2 text-xs font-medium rounded-lg hover:bg-accent"
            title="Beautify HTML"
          >
            <FileCode className="h-4 w-4" />
            <span className="hidden sm:inline">Format</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={minifyHtml}
            disabled={!input.trim()}
            className="h-8 px-3 gap-2 text-xs font-medium rounded-lg hover:bg-accent"
            title="Compress HTML"
          >
            <span>Minify</span>
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!input.trim()}
            className="h-8 w-8 p-0 rounded-lg hover:bg-accent"
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>

          {output && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwap}
              className="h-8 w-8 p-0 rounded-lg hover:bg-accent"
              title="Swap"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={!input.trim()}
            className="h-8 w-8 p-0 rounded-lg hover:bg-accent"
            title="Export HTML"
          >
            <span className="text-xs">↓</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleImport}
            className="h-8 w-8 p-0 rounded-lg hover:bg-accent"
            title="Import HTML"
          >
            <span className="text-xs">↑</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!input.trim()}
            className="h-8 w-8 p-0 rounded-lg hover:bg-accent"
            title="Clear"
          >
            <span className="text-xs">✕</span>
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0 rounded-lg", theme === 'light' ? "bg-amber-500/20 text-amber-600" : "hover:bg-accent")}
            onClick={() => setTheme('light')}
            title="Light"
          >
            <Sun className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0 rounded-lg", theme === 'dark' ? "bg-violet-500/20 text-violet-400" : "hover:bg-accent")}
            onClick={() => setTheme('dark')}
            title="Dark"
          >
            <Moon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0 rounded-lg", theme === 'system' ? "bg-muted" : "hover:bg-accent")}
            onClick={() => setTheme('system')}
            title="System"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Side-by-Side Editor */}
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
            <HtmlInput value={input} onChange={setInput} error={error} className="h-full" />
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
            {isValid && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Valid HTML
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <HtmlOutput content={output} isValid={isValid} error={error} className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
