'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Braces,
  FileCode2,
  FileCode,
  Database,
  FileText,
  LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatters = [
  { href: '/json', label: 'JSON', icon: Braces },
  { href: '/css', label: 'CSS', icon: FileCode2 },
  { href: '/html', label: 'HTML', icon: FileCode },
  { href: '/sql', label: 'SQL', icon: Database },
  { href: '/yaml', label: 'YAML', icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 transition-transform group-hover:scale-105">
            <Braces className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">Formatter Hub</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">Free Online Tools</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {formatters.map((formatter) => {
            const Icon = formatter.icon;
            const isActive = pathname === formatter.href || pathname === `${formatter.href}/`;
            
            return (
              <Link key={formatter.href} href={formatter.href} title={`${formatter.label} Formatter`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 gap-2 px-3 rounded-lg transition-all",
                    isActive
                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{formatter.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* GitHub */}
        <a
          href="https://github.com/berattufekli/formatters"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
          title="View on GitHub"
        >
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg">
            <LinkIcon className="h-5 w-5" />
          </Button>
        </a>
      </div>
    </header>
  );
}
