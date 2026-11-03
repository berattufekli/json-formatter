import Link from 'next/link';
import { ArrowUpRight, Keyboard, ShieldCheck, Timer, Infinity as Free } from 'lucide-react';
import { TOOLS } from '@/lib/tools';
import { highlight } from '@/lib/highlight';

const BEFORE = `{"user":{"id":42,"name":"Ada","roles":["admin","dev"]},"active":true,"score":9.5,"tags":null}`;
const AFTER = `{
  "user": {
    "id": 42,
    "name": "Ada",
    "roles": ["admin", "dev"]
  },
  "active": true,
  "score": 9.5,
  "tags": null
}`;

const PROMISES = [
  { Icon: ShieldCheck, title: 'Stays in your browser', text: 'Nothing is uploaded. Paste a production config without a second thought.' },
  { Icon: Timer, title: 'Formats as you type', text: 'Results appear after a short pause. No button to hunt for.' },
  { Icon: Keyboard, title: 'Keyboard first', text: 'Ctrl/⌘ + Enter formats, Ctrl/⌘ + Shift + M minifies. Drag a file onto the editor to load it.' },
  { Icon: Free, title: 'Free, no account', text: 'No signup, no ads, no tracking. Your last input is remembered on this device only.' },
];

function Snippet({ code, language, label }: { code: string; language: string; label: string }) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
      <figcaption className="border-b border-border px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">{label}</figcaption>
      <pre className="code hljs overflow-x-auto p-4 text-[0.8125rem] leading-6" dangerouslySetInnerHTML={{ __html: highlight(code, language) }} />
    </figure>
  );
}

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-6xl flex-col px-4 sm:px-6">
      <section className="pb-14 pt-16 sm:pt-24">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Five formatters, one workbench
        </p>
        <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          Paste messy code.
          <br />
          <span className="text-accent">Get clean code.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Format, validate and minify JSON, CSS, HTML, SQL and YAML. It runs in your browser, so your data never leaves it.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/json" className="btn btn-primary !h-11 !rounded-[11px] !px-5 !text-sm">
            Open the JSON formatter
            <ArrowUpRight size={16} />
          </Link>
          <a href="#tools" className="btn !h-11 !rounded-[11px] !px-5 !text-sm">
            All tools
          </a>
        </div>
      </section>

      <section aria-label="Example" className="grid gap-4 pb-20 md:grid-cols-2">
        <Snippet code={BEFORE} language="json" label="Before" />
        <Snippet code={AFTER} language="json" label="After" />
      </section>

      <section id="tools" className="scroll-mt-20 pb-20">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tools</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t, i) => (
            <li key={t.id}>
              <Link
                href={`/${t.id}`}
                className="group flex h-full flex-col justify-between gap-8 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  <ArrowUpRight size={18} className="text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{t.label} formatter</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-x-10 gap-y-8 border-t border-border py-14 sm:grid-cols-2">
        {PROMISES.map(({ Icon, title, text }) => (
          <div key={title} className="flex gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-accent-soft text-accent">
              <Icon size={18} />
            </span>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-auto border-t border-border py-8 text-sm text-muted-foreground">
        Formatter Hub · open source on{' '}
        <a className="underline underline-offset-4 hover:text-foreground" href="https://github.com/berattufekli/json-formatter" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  );
}
