'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { CssFormatterSettings } from '@/types/formatter';

interface CssOutputProps {
  content: string;
  isValid: boolean;
  error?: string | null;
  className?: string;
}

export function CssOutput({
  content,
  isValid,
  error,
  className,
}: CssOutputProps) {
  const [settings] = useLocalStorage<CssFormatterSettings>('css-formatter-settings', {
    indentSize: 2,
    sortProperties: false,
    validateCss: true,
    showLineNumbers: true,
    theme: 'system',
    fontFamily: 'inter',
    fontSize: 14,
  });

  const lines = content.split('\n');
  const lineCount = lines.length;

  // Simple CSS syntax highlighting
  const highlightCss = (css: string): string => {
    return css
      // Comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-400">$1</span>')
      // Selectors (before {)
      .replace(/([^{}]+)\{/g, '<span class="text-violet-600 dark:text-violet-400">$1</span>{')
      // Properties (before :)
      .replace(/([a-z-]+):/gi, '<span class="text-blue-600 dark:text-blue-400">$1</span>:')
      // Values (after :, before ; or })
      .replace(/: ([^;{}]+)/g, ': <span class="text-emerald-600 dark:text-emerald-400">$1</span>')
      // Units (px, em, %, etc)
      .replace(/(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms))/g, '<span class="text-amber-600 dark:text-amber-400">$1</span>')
      // Colors (hex)
      .replace(/(#[a-f0-9]{3,8})/gi, '<span class="text-pink-600 dark:text-pink-400">$1</span>');
  };

  return (
    <div className={cn('relative h-full flex flex-col', className)}>
      <ScrollArea className="flex-1">
        <div className="flex h-full">
          {/* Line Numbers */}
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
          
          {/* Content */}
          <pre
            className={cn(
              'flex-1 p-4 font-mono text-sm whitespace-pre-wrap break-words leading-6 overflow-x-auto',
              !isValid && error 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-slate-700 dark:text-slate-300'
            )}
            style={{
              fontSize: `${settings.fontSize || 14}px`,
              fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            }}
          >
            {error ? (
              <span className="text-red-500 dark:text-red-400">{error}</span>
            ) : content ? (
              <code 
                dangerouslySetInnerHTML={{ __html: highlightCss(content) }} 
                className="[&>span]:transition-none"
              />
            ) : (
              <span className="text-slate-300 dark:text-slate-600 italic">
                Formatted CSS will appear here...
              </span>
            )}
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
}
