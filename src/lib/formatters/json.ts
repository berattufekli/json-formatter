import { positionAt, tabWidth, type FormatOptions, type RunResult } from './types';

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as object)
        .sort()
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}


/**
 * Locate the first syntax error. Recent V8 messages no longer carry a position, so walk the text ourselves.
 * Returns the offset and a short message, or null when the text is valid JSON.
 */
export function findJsonError(t: string): { offset: number; message: string } | null {
  let i = 0;
  const fail = (message?: string) => {
    throw { offset: i, message: message ?? (i >= t.length ? 'Unexpected end of JSON input' : `Unexpected token '${t[i]}'`) };
  };
  const ws = () => {
    while (i < t.length && /[ \t\r\n]/.test(t[i])) i++;
  };
  const str = () => {
    i++;
    while (i < t.length && t[i] !== '"') {
      if (t[i] === '\\') i++;
      else if (t[i] === '\n') fail('Unterminated string');
      i++;
    }
    if (i >= t.length) fail('Unterminated string');
    i++;
  };
  const value = (): void => {
    ws();
    const c = t[i];
    if (c === '{') {
      i++;
      ws();
      if (t[i] === '}') return void i++;
      for (;;) {
        ws();
        if (t[i] !== '"') fail('Expected a double-quoted property name');
        str();
        ws();
        if (t[i] !== ':') fail("Expected ':' after property name");
        i++;
        value();
        ws();
        if (t[i] === ',') i++;
        else if (t[i] === '}') return void i++;
        else fail("Expected ',' or '}'");
      }
    } else if (c === '[') {
      i++;
      ws();
      if (t[i] === ']') return void i++;
      for (;;) {
        value();
        ws();
        if (t[i] === ',') i++;
        else if (t[i] === ']') return void i++;
        else fail("Expected ',' or ']'");
      }
    } else if (c === '"') str();
    else {
      const m = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(t.slice(i));
      if (!m) fail();
      else i += m[0].length;
    }
  };
  try {
    value();
    ws();
    if (i < t.length) fail();
    return null;
  } catch (e) {
    return e as { offset: number; message: string };
  }
}

/** Parse JSON and report where it broke. V8 gives either "(line X column Y)" or "at position N". */
export function parseJson(input: string): { ok: true; value: unknown } | Extract<RunResult, { ok: false }> {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e) {
    const found = findJsonError(input);
    if (found) return { ok: false, message: found.message, ...positionAt(input, found.offset) };
    return { ok: false, message: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export async function formatJson(input: string, o: FormatOptions): Promise<RunResult> {
  const r = parseJson(input);
  if (!r.ok) return r;
  const value = o.sort ? sortKeys(r.value) : r.value;
  return { ok: true, output: JSON.stringify(value, null, o.indent === 'tab' ? '\t' : tabWidth(o)) };
}

export async function minifyJson(input: string, o: FormatOptions): Promise<RunResult> {
  const r = parseJson(input);
  if (!r.ok) return r;
  return { ok: true, output: JSON.stringify(o.sort ? sortKeys(r.value) : r.value) };
}
