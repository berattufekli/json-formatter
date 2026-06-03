'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
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

// Sort object keys recursively - must be defined before use
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
  const { setTheme } = useTheme();

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
      
      // Sort keys if enabled
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
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <FileJson2 size={20} className="text-primary" />
          <span className="font-semibold">JSON Formatter</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {output && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleCopy}
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme('light')}
              >
                <Sun size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Light Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dark Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme('system')}
              >
                <Monitor size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>System Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Tabs defaultValue="input" className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger
              value="input"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Input
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Output
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="flex-1 m-0">
            <JsonInput
              value={input}
              onChange={setInput}
              error={error}
              className="flex-1"
            />
          </TabsContent>

          <TabsContent value="output" className="flex-1 m-0">
            <JsonOutput
              content={output}
              isValid={isValid}
              error={error}
              className="flex-1"
            />
          </TabsContent>
        </Tabs>
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
