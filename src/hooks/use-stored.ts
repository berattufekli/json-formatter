'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useState backed by localStorage. The first render always uses `initial` (so server and client agree);
 * the stored value is applied right after mount and `ready` flips to true.
 */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const latest = useRef(value);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        latest.current = JSON.parse(raw) as T;
        setValue(latest.current);
      }
    } catch {
      /* corrupt or blocked storage: keep the default */
    }
    setReady(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      latest.current = next instanceof Function ? next(latest.current) : next;
      setValue(latest.current);
      try {
        window.localStorage.setItem(key, JSON.stringify(latest.current));
      } catch {
        /* quota or private mode: the value still lives in memory */
      }
    },
    [key],
  );

  return [value, set, ready] as const;
}
