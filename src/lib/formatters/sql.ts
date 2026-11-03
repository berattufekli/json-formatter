import { tabWidth, toError, type FormatOptions, type RunResult } from './types';

export async function formatSql(input: string, o: FormatOptions): Promise<RunResult> {
  try {
    const { format } = await import('sql-formatter');
    const out = format(input, { language: 'sql', tabWidth: tabWidth(o), useTabs: o.indent === 'tab', keywordCase: o.upper ? 'upper' : 'preserve' });
    return { ok: true, output: out };
  } catch (e) {
    return toError(e);
  }
}

/** One-line SQL: comments out, whitespace collapsed, string literals untouched. */
export async function minifySql(input: string, o: FormatOptions): Promise<RunResult> {
  const checked = await formatSql(input, o);
  if (!checked.ok) return checked;
  const keep: string[] = [];
  const hold = (s: string) => `\u0000${keep.push(s) - 1}\u0000`;
  const sql = input
    .replace(/'(?:''|[^'])*'|"(?:""|[^"])*"/g, hold)
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),;])\s*/g, '$1')
    .trim();
  return { ok: true, output: sql.replace(/\u0000(\d+)\u0000/g, (_m, i) => keep[+i]) };
}
