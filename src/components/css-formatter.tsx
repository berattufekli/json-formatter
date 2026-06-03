'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CssInput } from '@/components/editor/css-input';
import { CssOutput } from '@/components/editor/css-output';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTheme } from '@/components/providers/theme-provider';
import {
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  FileCode2,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CssFormatterSettings } from '@/types/formatter';

const DEFAULT_CSS = `/* Sample CSS */
.container{max-width:1200px;margin:0 auto;padding:20px}
.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px 20px;text-align:center}
.btn{padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;transition:all .3s}
.btn-primary{background:#667eea;color:white;border:none}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(102,126,234,.4)}
.title{font-size:2.5rem;font-weight:700;margin-bottom:10px}
.subtitle{font-size:1.125rem;opacity:.9}`;

// Sort properties alphabetically
function sortPropertiesFn(css: string): string {
  return css.replace(/([^{}]+)\{([^}]+)\}/g, (_match: string, selector: string, properties: string) => {
    const props = properties.trim().split(';').filter(p => p.trim());
    props.sort((a, b) => a.localeCompare(b));
    return `${selector}{ ${props.join('; ')} }`;
  });
}

export function CssFormatter() {
  const [settings, setSettings] = useLocalStorage<CssFormatterSettings>('css-formatter-settings', {
    indentSize: 2,
    sortProperties: false,
    validateCss: true,
    showLineNumbers: true,
    theme: 'system',
    fontFamily: 'inter',
    fontSize: 14,
  });

  const [input, setInput] = useState(DEFAULT_CSS);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading] = useState(false);
  const { setTheme, theme } = useTheme();

  // Validate CSS function
  const validateCss = useCallback((cssString: string): { valid: boolean; error: string | null } => {
    if (!cssString.trim()) {
      return { valid: false, error: null };
    }
    try {
      let braceCount = 0;
      for (const char of cssString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount < 0) return { valid: false, error: 'Unmatched closing brace' };
      }
      if (braceCount !== 0) return { valid: false, error: 'Unmatched opening brace' };
      return { valid: true, error: null };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : 'Invalid CSS' };
    }
  }, []);

  // Format CSS function
  const formatCss = useCallback(() => {
    const result = validateCss(input);
    if (result.valid) {
      try {
        let formatted = input;
        formatted = formatted.replace(/\{\s*/g, ' {\n');
        formatted = formatted.replace(/\s*\}/g, '\n}');
        const lines = formatted.split('\n');
        let indentLevel = 0;
        const indentedLines = lines.map((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('}')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          const indentedLine = '  '.repeat(indentLevel) + trimmed;
          if (trimmed.endsWith('{')) {
            indentLevel++;
          }
          return indentedLine;
        });
        formatted = indentedLines.join('\n').trim();
        
        if (settings.sortProperties) {
          formatted = sortPropertiesFn(formatted);
        }
        
        setOutput(formatted);
        setError(null);
        setIsValid(true);
      } catch (e) {
        setOutput('');
        setError(e instanceof Error ? e.message : 'Format error');
        setIsValid(false);
      }
    } else {
      setOutput('');
      setError(result.error);
      setIsValid(false);
    }
  }, [input, settings.sortProperties, validateCss]);

  // Minify CSS function
  const minifyCss = useCallback(() => {
    const result = validateCss(input);
    if (result.valid) {
      try {
        let minified = input;
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
        minified = minified.replace(/\s+/g, ' ');
        minified = minified.replace(/\s*\{\s*/g, '{');
        minified = minified.replace(/\s*\}\s*/g, '}');
        minified = minified.replace(/\s*:\s*/g, ':');
        minified = minified.replace(/\s*;\s*/g, ';');
        minified = minified.replace(/;}/g, '}');
        minified = minified.trim();
        setOutput(minified);
        setError(null);
        setIsValid(true);
      } catch (e) {
        setOutput('');
        setError(e instanceof Error ? e.message : 'Minify error');
        setIsValid(false);
      }
    } else {
      setOutput('');
      setError(result.error);
      setIsValid(false);
    }
  }, [input, validateCss]);

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
    const blob = new Blob([textToExport], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'styles.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, input]);

  const handleImport = useCallback(() => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = '.css,text/css';
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

  const handleSortProperties = useCallback(() => {
    setSettings(prev => ({ ...prev, sortProperties: !prev.sortProperties }));
  }, [setSettings]);

  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output);
      setOutput('');
      setError(null);
      setIsValid(false);
    }
  }, [output]);

  useEffect(() => {
    if (input && settings.validateCss) {
      setTimeout(() => formatCss(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.sortProperties, input, settings.validateCss]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
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
            onClick={formatCss}
            disabled={!input.trim()}
            className="h-8 px-3 gap-2 text-xs font-medium rounded-lg hover:bg-accent"
            title="Beautify CSS"
          >
            <FileCode2 className="h-4 w-4" />
            <span className="hidden sm:inline">Format</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={minifyCss}
            disabled={!input.trim()}
            className="h-8 px-3 gap-2 text-xs font-medium rounded-lg hover:bg-accent"
            title="Compress CSS"
          >
            <span>Minify</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSortProperties}
          className={cn(
            "h-8 px-3 gap-2 text-xs font-medium rounded-lg",
            settings.sortProperties
              ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
              : "hover:bg-accent"
          )}
          title="Sort properties alphabetically"
        >
          <span>Sort Props</span>
        </Button>

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
            title="Export CSS"
          >
            <span className="text-xs">↓</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleImport}
            className="h-8 w-8 p-0 rounded-lg hover:bg-accent"
            title="Import CSS"
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
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              theme === 'light' ? "bg-amber-500/20 text-amber-600" : "hover:bg-accent"
            )}
            onClick={() => setTheme('light')}
            title="Light"
          >
            <Sun className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              theme === 'dark' ? "bg-violet-500/20 text-violet-400" : "hover:bg-accent"
            )}
            onClick={() => setTheme('dark')}
            title="Dark"
          >
            <Moon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              theme === 'system' ? "bg-muted" : "hover:bg-accent"
            )}
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
            {error && (
              <span className="ml-auto text-xs text-red-500">Error</span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <CssInput
              value={input}
              onChange={setInput}
              error={error}
              className="h-full"
            />
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
                Valid CSS
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <CssOutput
              content={output}
              isValid={isValid}
              error={error}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
