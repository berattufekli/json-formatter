'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { HtmlFormatterSettings } from '@/types/formatter';

interface HtmlOutputProps {
  content: string;
  isValid: boolean;
  error?: string | null;
  className?: string;
}

export function HtmlOutput({ content, isValid, error, className }: HtmlOutputProps) {
  const [settings] = useLocalStorage<HtmlFormatterSettings>('html-formatter-settings', {
    indentSize: 2,
    validateHtml: true,
    showLineNumbers: true,
    theme: 'system',
    fontFamily: 'inter',
    fontSize: 14,
  });

  const lines = content.split('\n');
  const lineCount = lines.length;

  const highlightHtml = (html: string): string => {
    return html
      .replace(/(&lt;\/?[\w]+)/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-slate-400">$1</span>')
      .replace(/(["'][^"']*["'])/g, '<span class="text-emerald-600 dark:text-emerald-400">$1</span>');
  };

  return (
    <div className={cn('relative h-full flex flex-col', className)}>
      <ScrollArea className="flex-1">
        <div className="flex h-full">
          {settings.showLineNumbers && (
            <div className="flex-shrink-0 select-none py-4 pl-4 pr-3 text-right">
              <div 
                className="font-mono text-xs leading-6 text-slate-300 dark:text-slate-600"
                style={{ fontSize: `${settings.fontSize || 14}px` }}
              >
                {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
                  <div key={i} className="h-6">{i + 1}</div>
                ))}
              </div>
            </div>
          )}
          <pre
            className={cn(
              'flex-1 p-4 font-mono text-sm whitespace-pre-wrap break-words leading-6 overflow-x-auto',
              !isValid && error ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'
            )}
            style={{
              fontSize: `${settings.fontSize || 14}px`,
              fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            }}
          >
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : content ? (
              <code dangerouslySetInnerHTML={{ __html: highlightHtml(content) }} />
            ) : (
              <span className="text-slate-300 dark:text-slate-600 italic">Formatted HTML will appear here...</span>
            )}
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
}
