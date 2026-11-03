import { tabWidth, toError, type FormatOptions, type RunResult } from './types';

export async function formatYaml(input: string, o: FormatOptions): Promise<RunResult> {
  try {
    const [prettier, yaml] = await Promise.all([import('prettier/standalone'), import('prettier/plugins/yaml')]);
    const out = await prettier.format(input, { parser: 'yaml', plugins: [yaml.default ?? yaml], tabWidth: tabWidth(o) });
    return { ok: true, output: out.trimEnd() };
  } catch (e) {
    return toError(e);
  }
}

/** YAML to JSON; the YAML parser reports line and column for a bad document. */
export async function yamlToJson(input: string, o: FormatOptions): Promise<RunResult> {
  try {
    const { parse } = await import('yaml');
    return { ok: true, output: JSON.stringify(parse(input), null, o.indent === 'tab' ? '\t' : tabWidth(o)) ?? 'null' };
  } catch (e) {
    const err = e as { message?: string; linePos?: { line: number; col: number }[] };
    const pos = err.linePos?.[0];
    return { ok: false, message: (err.message ?? 'Invalid YAML').split('\n')[0].replace(/\sat line.*$/, ''), line: pos?.line, column: pos?.col };
  }
}
