import Link from 'next/link';
import {
  Braces,
  FileCode2,
  FileCode,
  Database,
  FileText,
  Sparkles,
  Zap,
  Shield,
  Heart,
  ArrowRight,
} from 'lucide-react';

const formatters = [
  {
    href: '/json',
    label: 'JSON Formatter',
    description: 'Format, validate and minify JSON with syntax highlighting',
    icon: Braces,
    color: 'from-amber-500 to-orange-600',
    badge: 'Popular',
  },
  {
    href: '/css',
    label: 'CSS Formatter',
    description: 'Beautify, minify and validate CSS code',
    icon: FileCode2,
    color: 'from-blue-500 to-cyan-600',
    badge: null,
  },
  {
    href: '/html',
    label: 'HTML Formatter',
    description: 'Prettify and compress HTML markup',
    icon: FileCode,
    color: 'from-red-500 to-pink-600',
    badge: null,
  },
  {
    href: '/sql',
    label: 'SQL Formatter',
    description: 'Format and beautify SQL queries',
    icon: Database,
    color: 'from-emerald-500 to-teal-600',
    badge: null,
  },
  {
    href: '/yaml',
    label: 'YAML Formatter',
    description: 'Parse and format YAML files',
    icon: FileText,
    color: 'from-violet-500 to-purple-600',
    badge: null,
  },
];

const features = [
  {
    icon: Sparkles,
    title: 'Modern UI',
    description: 'Clean, beautiful interface designed for developers',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant formatting in your browser - no server needed',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your data never leaves your browser',
  },
  {
    icon: Heart,
    title: 'Free Forever',
    description: 'No signup, no ads, no tracking - completely free',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-pink-500/20 blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 px-4 py-1.5 text-sm text-violet-600 dark:text-violet-400">
            <Sparkles className="h-4 w-4" />
            <span>100% Free & Open Source</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Developer Tools,
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              Beautifully Simple
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Format, validate and minify your code with our collection of free, fast and beautiful developer tools. No signup required.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/json"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#formatters"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              View All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Formatters Grid */}
      <section id="formatters" className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">All Formatters</h2>
            <p className="mt-2 text-muted-foreground">Choose a formatter to get started</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {formatters.map((formatter) => {
              const Icon = formatter.icon;
              return (
                <Link
                  key={formatter.href}
                  href={formatter.href}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
                >
                  {/* Badge */}
                  {formatter.badge && (
                    <div className="absolute right-4 top-4 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                      {formatter.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${formatter.color} p-3 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-semibold">{formatter.label}</h3>
                  <p className="text-sm text-muted-foreground">{formatter.description}</p>

                  {/* Arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 transition-all group-hover:opacity-100">
                    <ArrowRight className="h-5 w-5 text-violet-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why Choose Us?</h2>
            <p className="mt-2 text-muted-foreground">Built with developers in mind</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-4 rounded-2xl bg-violet-500/10 p-4">
                    <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>Built with ❤️ using Next.js, React & Tailwind CSS</p>
          <p className="mt-1">© 2025 Formatter Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
