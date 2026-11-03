import { tabWidth, toError, type FormatOptions, type RunResult } from './types';

const DECL = /^\s*[-\w]+\s*:.*;\s*$/;

/** Sort runs of single-line declarations by property name; comments and multi-line values break a run. */
export function sortDeclarations(css: string): string {
  const lines = css.split('\n');
  const out: string[] = [];
  let run: string[] = [];
  const flush = () => {
    out.push(...run.sort((a, b) => a.trim().localeCompare(b.trim())));
    run = [];
  };
  for (const line of lines) {
    if (DECL.test(line)) run.push(line);
    else {
      flush();
      out.push(line);
    }
  }
  flush();
  return out.join('\n');
}

export async function formatCss(input: string, o: FormatOptions): Promise<RunResult> {
  try {
    const [prettier, postcss] = await Promise.all([import('prettier/standalone'), import('prettier/plugins/postcss')]);
    const out = await prettier.format(input, { parser: 'css', plugins: [postcss.default ?? postcss], tabWidth: tabWidth(o), useTabs: o.indent === 'tab' });
    return { ok: true, output: (o.sort ? sortDeclarations(out) : out).trimEnd() };
  } catch (e) {
    return toError(e);
  }
}

/** Strip comments and whitespace, leaving quoted strings and url(...) untouched. */
export async function minifyCss(input: string, o: FormatOptions): Promise<RunResult> {
  const checked = await formatCss(input, o);
  if (!checked.ok) return checked;
  const keep: string[] = [];
  const hold = (s: string) => `\u0000${keep.push(s) - 1}\u0000`;
  let css = checked.output
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|url\([^)]*\)/g, hold);
  css = css
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>~])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
  return { ok: true, output: css.replace(/\u0000(\d+)\u0000/g, (_m, i) => keep[+i]) };
}
