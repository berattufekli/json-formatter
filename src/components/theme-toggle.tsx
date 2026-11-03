'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';

const MODES = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
] as const;

/** Three-way theme switch. Rendered after mount because the stored theme is unknown on the server. */
export function ThemeToggle() {
  const { theme: stored, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const theme = mounted ? stored : 'system';
  const next = MODES[(MODES.findIndex((m) => m.id === theme) + 1) % MODES.length];
  const Current = MODES.find((m) => m.id === theme)!.Icon;

  return (
    <>
      {/* narrow screens: one button that cycles light, dark, system */}
      <button
        type="button"
        className="btn btn-ghost btn-icon sm:hidden"
        aria-label={`Theme: ${theme}. Switch to ${next.label}`}
        onClick={() => setTheme(next.id)}
      >
        <Current size={16} />
      </button>
      <div role="group" aria-label="Theme" className="hidden sm:block">
        <div className="seg">
          {MODES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={`${label} theme`}
              title={`${label} theme`}
              aria-pressed={mounted && theme === id}
              onClick={() => setTheme(id)}
              className="!px-2"
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
