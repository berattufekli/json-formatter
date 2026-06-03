'use client';

import { Textarea } from '@/components/ui/textarea';
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

  return (
    <div className={cn('relative h-full flex flex-col', className)}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Paste or type your JSON here...&#10;&#10;Example:&#10;{"name": "John", "age": 30, "city": "New York"}'
        spellCheck={false}
        className={cn(
          'flex-1 resize-none border-0 bg-transparent p-4 font-mono text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
          error && 'text-destructive',
          settings.showLineNumbers && 'pl-12'
        )}
        style={{
          fontSize: `${settings.fontSize || 14}px`,
          fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
        }}
      />
    </div>
  );
}
