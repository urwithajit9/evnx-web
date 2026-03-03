'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg-base bg-opacity-95 backdrop-blur border-b border-border-muted">
      <nav className="container-base flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">
            e
          </div>
          <span className="font-serif text-xl font-bold">evnx</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/guides" className="text-text-secondary hover:text-text-primary transition-colors">
            Guides
          </Link>
          <Link href="/blog" className="text-text-secondary hover:text-text-primary transition-colors">
            Blog
          </Link>
          <Link href="/changelog" className="text-text-secondary hover:text-text-primary transition-colors">
            Changelog
          </Link>
          <a
            href="https://github.com/urwithajit9/evnx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            GitHub
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" asChild>
            <a href="https://crates.io/crates/evnx" target="_blank" rel="noopener noreferrer">
              Install
            </a>
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-bg-surface border-b border-border-muted md:hidden">
            <div className="flex flex-col p-4 space-y-4">
              <Link href="/guides" className="text-text-secondary hover:text-text-primary">
                Guides
              </Link>
              <Link href="/blog" className="text-text-secondary hover:text-text-primary">
                Blog
              </Link>
              <Link href="/changelog" className="text-text-secondary hover:text-text-primary">
                Changelog
              </Link>
              <a
                href="https://github.com/urwithajit9/evnx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary"
              >
                GitHub
              </a>
              <Button asChild className="w-full">
                <a href="https://crates.io/crates/evnx" target="_blank" rel="noopener noreferrer">
                  Install
                </a>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
