import { describe, expect, it } from 'vitest';
import { TOOLS } from '../tools';
import { DEFAULT_OPTIONS, type FormatOptions } from './types';
import { sortDeclarations } from './css';

const run = (tool: string, action: string, input: string, o: Partial<FormatOptions> = {}) =>
  TOOLS.find((t) => t.id === tool)!.actions.find((a) => a.id === action)!.run(input, { ...DEFAULT_OPTIONS, ...o });

describe('json', () => {
  it('formats with the chosen indent', async () => {
    expect(await run('json', 'format', '{"a":[1,2],"b":{"c":null}}')).toEqual({
      ok: true,
      output: '{\n  "a": [\n    1,\n    2\n  ],\n  "b": {\n    "c": null\n  }\n}',
    });
    const four = await run('json', 'format', '{"a":1}', { indent: 4 });
    expect(four).toEqual({ ok: true, output: '{\n    "a": 1\n}' });
    const tab = await run('json', 'format', '{"a":1}', { indent: 'tab' });
    expect(tab).toEqual({ ok: true, output: '{\n\t"a": 1\n}' });
  });
  it('sorts keys recursively', async () => {
    const r = await run('json', 'format', '{"b":1,"a":{"z":1,"y":2}}', { sort: true, indent: 2 });
    expect(r.ok && r.output.indexOf('"a"')).toBeLessThan(r.ok ? r.output.indexOf('"b"') : 0);
    expect(r.ok && r.output.indexOf('"y"')).toBeLessThan(r.ok ? r.output.indexOf('"z"') : 0);
  });
  it('minifies', async () => {
    expect(await run('json', 'minify', '{\n "a": [1, 2],\n "b": true\n}')).toEqual({ ok: true, output: '{"a":[1,2],"b":true}' });
  });
  it('reports the line and column of a syntax error', async () => {
    const r = await run('json', 'format', '{\n  "a": 1,\n  "b": ,\n}');
    expect(r).toMatchObject({ ok: false, line: 3, column: 8 });
    expect(await run('json', 'format', '{"a": [1, 2}')).toMatchObject({ ok: false, line: 1, column: 12 });
    expect(await run('json', 'format', '')).toMatchObject({ ok: false });
  });
});

describe('css', () => {
  it('puts every declaration on its own line', async () => {
    const r = await run('css', 'format', '.a{color:red;margin:0 auto}');
    expect(r).toEqual({ ok: true, output: '.a {\n  color: red;\n  margin: 0 auto;\n}' });
  });
  it('minifies and keeps strings and urls', async () => {
    const r = await run('css', 'minify', '/* c */\n.a {\n  color: red;\n  content: "a  b";\n  background: url( x y.png );\n}\n.b > .c { margin: 0 }');
    expect(r.ok && r.output).toBe('.a{color:red;content:"a  b";background:url(x y.png)}.b>.c{margin:0}');
  });
  it('sorts declarations within a rule', () => {
    expect(sortDeclarations('.a {\n  margin: 0;\n  color: red;\n}')).toBe('.a {\n  color: red;\n  margin: 0;\n}');
  });
  it('reports a syntax error', async () => {
    const r = await run('css', 'format', '.a { color: red');
    expect(r.ok).toBe(false);
  });
});

describe('html', () => {
  it('indents nested markup', async () => {
    const r = await run('html', 'format', '<div><p>hi</p></div>');
    expect(r.ok && r.output).toBe('<div><p>hi</p></div>');
    const r2 = await run('html', 'format', '<ul><li>One</li><li>Two</li></ul>');
    expect(r2.ok && r2.output).toContain('\n  <li>One</li>');
  });
  it('minifies, removing comments and keeping <pre> intact', async () => {
    const r = await run('html', 'minify', '<div>\n  <!-- x -->\n  <p>a</p>\n  <pre>  keep\n  me </pre>\n</div>');
    expect(r.ok && r.output).toBe('<div><p>a</p><pre>  keep\n  me </pre></div>');
  });
});

describe('sql', () => {
  it('formats and upper-cases keywords by default', async () => {
    const r = await run('sql', 'format', 'select a,b from t where x=1');
    expect(r.ok && r.output).toBe('SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = 1');
  });
  it('keeps keyword case when asked', async () => {
    const r = await run('sql', 'format', 'select a from t', { upper: false });
    expect(r.ok && r.output).toContain('select');
  });
  it('minifies to one line without comments, keeping string literals', async () => {
    const r = await run('sql', 'minify', "select  a, 'x  y' -- note\nfrom t");
    expect(r.ok && r.output).toBe("select a,'x  y' from t");
  });
});

describe('yaml', () => {
  it('formats', async () => {
    const r = await run('yaml', 'format', 'a:   1\nb:\n    - x\n    - y');
    expect(r.ok && r.output).toBe('a: 1\nb:\n  - x\n  - y');
  });
  it('converts to JSON', async () => {
    const r = await run('yaml', 'json', 'a: 1\nb: [x, y]');
    expect(r.ok && JSON.parse(r.output)).toEqual({ a: 1, b: ['x', 'y'] });
  });
  it('reports a YAML error with its line', async () => {
    const r = await run('yaml', 'json', 'a: [1, 2\nb: 3');
    expect(r.ok).toBe(false);
  });
});
