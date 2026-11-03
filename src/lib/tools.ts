import { formatCss, minifyCss } from './formatters/css';
import { formatHtml, minifyHtml } from './formatters/html';
import { formatJson, minifyJson } from './formatters/json';
import { formatSql, minifySql } from './formatters/sql';
import { formatYaml, yamlToJson } from './formatters/yaml';
import type { FormatOptions, RunResult } from './formatters/types';

export type ToolId = 'json' | 'css' | 'html' | 'sql' | 'yaml';

export interface ToolAction {
  id: string;
  label: string;
  /** Shown in the tooltip next to the label. */
  hint?: string;
  run: (input: string, o: FormatOptions) => Promise<RunResult>;
}

export interface Tool {
  id: ToolId;
  label: string;
  tagline: string;
  /** highlight.js language name. */
  language: string;
  ext: string;
  mime: string;
  accept: string;
  sample: string;
  sortLabel?: string;
  upperLabel?: string;
  /** First action is the default; the rest sit beside it. */
  actions: ToolAction[];
}

export const TOOLS: Tool[] = [
  {
    id: 'json',
    label: 'JSON',
    tagline: 'Format, validate and minify JSON',
    language: 'json',
    ext: 'json',
    mime: 'application/json',
    accept: '.json,application/json',
    sortLabel: 'Sort keys',
    sample: `{"name":"formatter-hub","version":"2.0.0","private":false,"tags":["json","css","html","sql","yaml"],"author":{"name":"Berat","links":["https://berattufekli.com.tr"]},"stats":{"tools":5,"free":true,"signup":null}}`,
    actions: [
      { id: 'format', label: 'Format', hint: 'Ctrl/⌘ + Enter', run: formatJson },
      { id: 'minify', label: 'Minify', hint: 'Ctrl/⌘ + Shift + M', run: minifyJson },
    ],
  },
  {
    id: 'css',
    label: 'CSS',
    tagline: 'Beautify and minify stylesheets',
    language: 'css',
    ext: 'css',
    mime: 'text/css',
    accept: '.css,text/css',
    sortLabel: 'Sort properties',
    sample: `/* Buttons */
.btn{padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;transition:all .3s}
.btn-primary{background:#ff5a1f;color:#fff;border:none}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(255,90,31,.4)}
@media (max-width:600px){.btn{width:100%}}`,
    actions: [
      { id: 'format', label: 'Format', hint: 'Ctrl/⌘ + Enter', run: formatCss },
      { id: 'minify', label: 'Minify', hint: 'Ctrl/⌘ + Shift + M', run: minifyCss },
    ],
  },
  {
    id: 'html',
    label: 'HTML',
    tagline: 'Prettify and compress markup',
    language: 'xml',
    ext: 'html',
    mime: 'text/html',
    accept: '.html,.htm,text/html',
    sample: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Hello</title><style>body{margin:0}</style></head><body><!-- greeting --><main class="wrap"><h1>Hello, world</h1><p>Paste your <strong>markup</strong> here.</p><ul><li>One</li><li>Two</li></ul></main></body></html>`,
    actions: [
      { id: 'format', label: 'Format', hint: 'Ctrl/⌘ + Enter', run: formatHtml },
      { id: 'minify', label: 'Minify', hint: 'Ctrl/⌘ + Shift + M', run: minifyHtml },
    ],
  },
  {
    id: 'sql',
    label: 'SQL',
    tagline: 'Format and compact SQL queries',
    language: 'sql',
    ext: 'sql',
    mime: 'application/sql',
    accept: '.sql,text/plain',
    upperLabel: 'Uppercase keywords',
    sample: `select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true and o.created_at > '2026-01-01' group by u.id, u.name having count(o.id) > 3 order by orders desc limit 20;`,
    actions: [
      { id: 'format', label: 'Format', hint: 'Ctrl/⌘ + Enter', run: formatSql },
      { id: 'minify', label: 'Minify', hint: 'Ctrl/⌘ + Shift + M', run: minifySql },
    ],
  },
  {
    id: 'yaml',
    label: 'YAML',
    tagline: 'Parse, format and convert YAML',
    language: 'yaml',
    ext: 'yaml',
    mime: 'text/yaml',
    accept: '.yaml,.yml,text/yaml',
    sample: `name:   ci
on: {push: {branches: [main]}, pull_request: {}}
jobs:
    test:
        runs-on:   ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - run: npm ci
          - run: npm test`,
    actions: [
      { id: 'format', label: 'Format', hint: 'Ctrl/⌘ + Enter', run: formatYaml },
      { id: 'json', label: 'To JSON', hint: 'Ctrl/⌘ + Shift + M', run: yamlToJson },
    ],
  },
];

export const getTool = (id: string) => TOOLS.find((t) => t.id === id);
