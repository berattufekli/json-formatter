'use client';

import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { JsonFormatterSettings } from '@/types/formatter';

const defaultSettings: JsonFormatterSettings = {
  indentSize: 2,
  sortKeys: false,
  validateJson: true,
  showLineNumbers: true,
  theme: 'system',
  fontFamily: 'inter',
  fontSize: 14,
};

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [settings] = useLocalStorage<JsonFormatterSettings>('json-formatter-settings', defaultSettings);

  useEffect(() => {
    const root = document.documentElement;
    
    const fontMap: Record<string, string> = {
      'inter': 'var(--font-inter), system-ui, sans-serif',
      'plus-jakarta-sans': 'var(--font-plus-jakarta-sans), system-ui, sans-serif',
      'fira-code': 'var(--font-fira-code), ui-monospace, monospace',
      'jetbrains-mono': 'var(--font-jetbrains-mono), ui-monospace, monospace',
    };
    
    const fontFamily = fontMap[settings?.fontFamily] || fontMap['inter'];
    root.style.fontFamily = fontFamily;
    
    root.classList.remove('font-inter', 'font-plus-jakarta-sans', 'font-fira-code', 'font-jetbrains-mono');
    root.classList.add(`font-${settings?.fontFamily || 'inter'}`);
  }, [settings?.fontFamily]);

  return <>{children}</>;
}
