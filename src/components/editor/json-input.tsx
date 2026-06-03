'use client';

import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { JsonFormatterSettings } from '@/types/formatter';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  className?: string;
}

export function JsonInput({
  value,
  onChange,
  error,
  className,
}: JsonInputProps) {
  const [settings] = useLocalStorage<JsonFormatterSettings>('json-formatter-settings', {
    indentSize: 2,
    sortKeys: false,
    validateJson: true,
    showLineNumbers: true,
    theme: 'system',
    fontFamily: 'inter',
    fontSize: 14,
  });

  const lines = value.split('\n');
  const lineCount = lines.length;

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
          
          {/* Textarea */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='Paste or type your JSON here...&#10;&#10;Example:&#10;{"name": "John", "age": 30}'
            spellCheck={false}
            className={cn(
              'flex-1 resize-none border-0 bg-transparent py-4 pr-4 font-mono text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-6 placeholder:text-slate-300 dark:placeholder:text-slate-600',
              error ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
            )}
            style={{
              fontSize: `${settings.fontSize || 14}px`,
              fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            }}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
