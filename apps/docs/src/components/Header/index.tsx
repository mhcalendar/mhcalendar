import { useState } from 'react';

const navLinks = [
  { href: '#anatomy', label: '<Demo />' },
  { href: '#styling', label: '<Styling />' },
  { href: '#features', label: '<Features />' },
  { href: '#pricing', label: '<Pricing />' },
  { href: '/docs', label: '<Docs />' },
  { href: '/blog', label: '<Blog />' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-foreground">
            <span className="font-mono text-sm font-bold text-background">{'MH'}</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">mhcalendar</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Desktop CTA */}
          <button className="hidden font-mono md:inline-flex">
            <a href="/docs/getting-started">npm install</a>
          </button>

          {/* Burger button — mobile only */}
          <button
            className="flex h-9 w-9 items-center justify-center border-2 border-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="2" y1="2" x2="16" y2="16" />
                <line x1="16" y1="2" x2="2" y2="16" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="2" y1="4" x2="16" y2="4" />
                <line x1="2" y1="9" x2="16" y2="9" />
                <line x1="2" y1="14" x2="16" y2="14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground py-2 border-b border-dashed border-border last:border-0"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3">
              <button className="w-full font-mono">
                <a href="/docs/getting-started" onClick={() => setOpen(false)}>
                  npm install
                </a>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
