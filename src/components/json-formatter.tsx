'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { JsonInput } from '@/components/editor/json-input';
import { JsonOutput } from '@/components/editor/json-output';
import { Toolbar } from '@/components/editor/toolbar';
import { SettingsDrawer } from '@/components/editor/settings-drawer';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTheme } from '@/components/providers/theme-provider';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  FileJson2,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JsonFormatterSettings } from '@/types/formatter';

const DEFAULT_JSON = `{
  "name": "JSON Formatter",
  "version": "1.0.0",
  "description": "A powerful tool to format, validate and minify JSON",
  "features": [
    "Format JSON with custom indentation",
    "Validate JSON syntax",
    "Minify JSON for production",
    "Sort object keys alphabetically"
  ],
  "config": {
    "theme": "dark",
    "fontSize": 14,
    "indentSize": 2
  }
}`;

// Sort object keys recursively
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>).sort().forEach(key => {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    });
    return sorted;
  }
  return obj;
}

export function JsonFormatter() {
  const [settings, setSettings] = useLocalStorage<JsonFormatterSettings>('json-formatter-settings', {
    indentSize: 2,
    sortKeys: false,
    validateJson: true,
    showLineNumbers: true,
    theme: 'system',
    fontFamily: 'inter',
    fontSize: 14,
  });

  const [input, setInput] = useState(DEFAULT_JSON);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading] = useState(false);
  const { setTheme, theme } = useTheme();

  // Validate JSON function
  const validateJson = useCallback((jsonString: string): { valid: boolean; error: string | null; parsed: unknown } => {
    if (!jsonString.trim()) {
      return { valid: false, error: null, parsed: null };
    }
    try {
      const parsed = JSON.parse(jsonString);
      return { valid: true, error: null, parsed };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
      return { valid: false, error: errorMessage, parsed: null };
    }
  }, []);

  // Format JSON function
  const formatJson = useCallback(() => {
    const result = validateJson(input);
    if (result.valid) {
      let parsed = result.parsed;
      if (settings.sortKeys) {
        parsed = sortObjectKeys(parsed);
      }
      const formatted = JSON.stringify(parsed, null, settings.indentSize);
      setOutput(formatted);
      setError(null);
      setIsValid(true);
    } else {
      setOutput('');
      setError(result.error);
      setIsValid(false);
    }
  }, [input, settings.sortKeys, settings.indentSize, validateJson]);

  // Minify JSON function
  const minifyJson = useCallback(() => {
    const result = validateJson(input);
    if (result.valid) {
      const minified = JSON.stringify(result.parsed);
      setOutput(minified);
      setError(null);
      setIsValid(true);
    } else {
      setOutput('');
      setError(result.error);
      setIsValid(false);
    }
  }, [input, validateJson]);

  // Handle copy
  const handleCopy = useCallback(() => {
    const textToCopy = output || input;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output, input]);

  // Handle clear
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    setIsValid(false);
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    const textToExport = output || input;
    if (!textToExport) return;
    const blob = new Blob([textToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, input]);

  // Handle import
  const handleImport = useCallback(() => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = '.json,application/json';
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

  // Handle sort keys toggle
  const handleSortKeys = useCallback(() => {
    setSettings(prev => ({ ...prev, sortKeys: !prev.sortKeys }));
  }, [setSettings]);

  // Swap input/output
  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output);
      setOutput('');
      setError(null);
      setIsValid(false);
    }
  }, [output]);

  // Auto-format when settings change
  useEffect(() => {
    if (input && settings.validateJson) {
      setTimeout(() => formatJson(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.sortKeys, settings.indentSize, input, settings.validateJson]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Soft Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-md px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <FileJson2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">JSON Formatter</h1>
            <p className="text-xs text-slate-500">Format, validate & minify</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="ml-4 flex items-center gap-2">
          {input.trim() && (
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
              isValid 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                : error
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}>
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                isValid ? "bg-emerald-500" : error ? "bg-red-500" : "bg-slate-400"
              )} />
              {isValid ? "Valid" : error ? "Invalid" : "Ready"}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {output && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={handleCopy}
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
            </Tooltip>
          )}

          {output && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={handleSwap}
                >
                  <ArrowRightLeft size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Swap</TooltipContent>
            </Tooltip>
          )}

          <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-lg transition-all",
                  theme === 'light' ? "bg-slate-100 text-amber-500" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                onClick={() => setTheme('light')}
              >
                <Sun size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Light</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-lg transition-all",
                  theme === 'dark' ? "bg-slate-800 text-violet-400" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dark</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-lg transition-all",
                  theme === 'system' ? "bg-slate-200 dark:bg-slate-700" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                onClick={() => setTheme('system')}
              >
                <Monitor size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>System</TooltipContent>
          </Tooltip>

          <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        onFormat={formatJson}
        onMinify={minifyJson}
        onValidate={formatJson}
        onCopy={handleCopy}
        onClear={handleClear}
        onExport={handleExport}
        onImport={handleImport}
        onSortKeys={handleSortKeys}
        sortKeys={settings.sortKeys || false}
        hasContent={!!input.trim()}
      />

      {/* Side-by-Side Editor */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Input Panel */}
        <div className="flex flex-1 flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <span className="ml-3 text-sm font-medium text-slate-500">Input</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <JsonInput
              value={input}
              onChange={setInput}
              error={error}
              className="h-full"
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-1 flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <span className="ml-3 text-sm font-medium text-slate-500">Output</span>
            {isValid && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Valid JSON
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <JsonOutput
              content={output}
              isValid={isValid}
              error={error}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}
