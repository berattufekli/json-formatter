'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { JsonFormatterSettings } from '@/types/formatter';

interface JsonOutputProps {
  content: string;
  isValid: boolean;
  error?: string | null;
  className?: string;
}

export function JsonOutput({
  content,
  isValid,
  error,
  className,
}: JsonOutputProps) {
  const [settings] = useLocalStorage<JsonFormatterSettings>('json-formatter-settings', {
    indentSize: 2,
    sortKeys: false,
    validateJson: true,
    showLineNumbers: true,
    theme: 'system',
    fontFamily: 'inter',
    fontSize: 14,
  });

  return (
    <div className={cn('relative h-full flex flex-col', className)}>
      <div className="flex items-center gap-2 border-b px-4 py-2">
        {isValid ? (
          <Badge variant="default" className="bg-green-500">Valid JSON</Badge>
        ) : error ? (
          <Badge variant="destructive">Invalid JSON</Badge>
        ) : (
          <Badge variant="secondary">Output</Badge>
        )}
      </div>
      <ScrollArea className="flex-1">
        <pre
          className={cn(
            'p-4 text-sm font-mono whitespace-pre-wrap break-words',
            !isValid && error && 'text-destructive'
          )}
          style={{
            fontSize: `${settings.fontSize || 14}px`,
            fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
          }}
        >
          {error ? error : content}
        </pre>
      </ScrollArea>
    </div>
  );
}
