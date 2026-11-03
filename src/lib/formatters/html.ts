import { tabWidth, toError, type FormatOptions, type RunResult } from './types';

export async function formatHtml(input: string, o: FormatOptions): Promise<RunResult> {
  try {
    const [prettier, html] = await Promise.all([import('prettier/standalone'), import('prettier/plugins/html')]);
    const out = await prettier.format(input, { parser: 'html', plugins: [html.default ?? html], tabWidth: tabWidth(o), useTabs: o.indent === 'tab', printWidth: 100 });
    return { ok: true, output: out.trimEnd() };
  } catch (e) {
    return toError(e);
  }
}

/** Drop comments and whitespace between tags; <pre>, <textarea>, <script> and <style> bodies stay as written. */
export async function minifyHtml(input: string, o: FormatOptions): Promise<RunResult> {
  const checked = await formatHtml(input, o);
  if (!checked.ok) return checked;
  const keep: string[] = [];
  const hold = (s: string) => `\u0000${keep.push(s) - 1}\u0000`;
  const html = input
    .replace(/<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi, hold)
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    .replace(/\s*\u0000(\d+)\u0000\s*/g, '\u0000$1\u0000')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { ok: true, output: html.replace(/\u0000(\d+)\u0000/g, (_m, i) => keep[+i]) };
}
