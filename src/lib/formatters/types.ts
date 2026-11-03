export interface FormatOptions {
  /** Spaces per level, or "tab". */
  indent: 2 | 4 | 8 | 'tab';
  /** JSON: sort object keys. CSS: sort declarations inside a rule. */
  sort: boolean;
  /** SQL: upper-case keywords. */
  upper: boolean;
}

export type RunResult =
  | { ok: true; output: string }
  | { ok: false; message: string; line?: number; column?: number };

export const DEFAULT_OPTIONS: FormatOptions = { indent: 2, sort: false, upper: true };

export const tabWidth = (o: FormatOptions) => (o.indent === 'tab' ? 2 : o.indent);

/** Position (1-based) of a character offset inside text. */
export function positionAt(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, Math.max(0, offset));
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/** Turn a thrown parser error into a RunResult, keeping a one-line message and its line/column when known. */
export function toError(e: unknown): RunResult {
  const err = e as { message?: string; loc?: { start?: { line: number; column: number }; line?: number; column?: number }; line?: number; column?: number };
  const loc = err.loc?.start ?? err.loc ?? (err.line ? { line: err.line, column: err.column } : undefined);
  const message = (err.message ?? String(e)).split('\n')[0].replace(/\s*\(\d+:\d+\)\s*$/, '');
  return { ok: false, message, line: loc?.line, column: loc?.column };
}
