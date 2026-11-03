import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono, Fira_Code } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SiteHeader } from '@/components/site-header';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'] });
const firaCode = Fira_Code({ variable: '--font-fira-code', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Formatter Hub — JSON, CSS, HTML, SQL and YAML formatters', template: '%s · Formatter Hub' },
  description: 'Format, validate and minify JSON, CSS, HTML, SQL and YAML in your browser. Free, instant, and nothing is uploaded.',
};

// Set the theme class before first paint so a dark-mode user never sees a white flash.
const themeScript = `try{var t=localStorage.getItem('formatter-hub-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.add(d?'dark':'light')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${firaCode.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <ThemeProvider defaultTheme="system" storageKey="formatter-hub-theme">
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
