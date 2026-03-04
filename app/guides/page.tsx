import { Button } from '@/components/ui/button';
import { BookOpen, Zap, GitBranch, Layers } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn the basics of evnx and get up and running in minutes',
    guides: 5,
  },
  {
    icon: Zap,
    title: 'Commands',
    description: 'Deep dive into each evnx command with real-world examples',
    guides: 10,
  },
  {
    icon: GitBranch,
    title: 'Integrations',
    description: 'Integrate evnx with your favorite tools and platforms',
    guides: 5,
  },
  {
    icon: Layers,
    title: 'Use Cases',
    description: 'Learn how to solve specific problems with evnx',
    guides: 4,
  },
];

const featured = [
  { title: 'Installation Guide', section: 'Getting Started', icon: BookOpen },
  { title: 'Quick Start', section: 'Getting Started', icon: Zap },
  { title: 'Secret Scanning', section: 'Commands', icon: BookOpen },
];

export const metadata = {
  title: 'Guides',
  description: 'Learn how to use evnx with comprehensive guides and tutorials.',
};

export default function GuidesPage() {
  return (
    <div>
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Learn evnx.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl">
            From first install to production CI/CD — comprehensive guides for every step.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base">
          <h2 className="text-3xl font-serif font-bold mb-12">Start Here</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Link href="/guides/getting-started/installation" className="group">
              <div className="bg-bg-surface border border-border-muted rounded-lg p-6 hover:border-border-default hover:bg-bg-overlay transition-all cursor-pointer">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-brand-500 bg-opacity-10 rounded">
                    <BookOpen className="w-5 h-5 text-brand-500" />
                  </div>
                  <span className="text-xs font-mono text-text-muted uppercase tracking-wide">
                    Getting Started
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold group-hover:text-brand-400">
                  Installation Guide
                </h3>
              </div>
            </Link>
            <Link href="/guides/getting-started/quick-start" className="group">
              <div className="bg-bg-surface border border-border-muted rounded-lg p-6 hover:border-border-default hover:bg-bg-overlay transition-all cursor-pointer">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-brand-500 bg-opacity-10 rounded">
                    <Zap className="w-5 h-5 text-brand-500" />
                  </div>
                  <span className="text-xs font-mono text-text-muted uppercase tracking-wide">
                    Getting Started
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold group-hover:text-brand-400">
                  Quick Start
                </h3>
              </div>
            </Link>
            <Link href="/guides/commands/scan" className="group">
              <div className="bg-bg-surface border border-border-muted rounded-lg p-6 hover:border-border-default hover:bg-bg-overlay transition-all cursor-pointer">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-brand-500 bg-opacity-10 rounded">
                    <BookOpen className="w-5 h-5 text-brand-500" />
                  </div>
                  <span className="text-xs font-mono text-text-muted uppercase tracking-wide">
                    Commands
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold group-hover:text-brand-400">
                  Secret Scanning
                </h3>
              </div>
            </Link>
          </div>

          <h2 className="text-3xl font-serif font-bold mb-12">Browse by Topic</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div
                  key={idx}
                  className="bg-bg-surface border border-border-muted rounded-lg p-8 hover:border-border-default transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-brand-500" />
                    <span className="text-xs font-mono bg-bg-base px-2 py-1 rounded text-text-secondary">
                      {section.guides} guides
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2">{section.title}</h3>
                  <p className="text-text-secondary mb-6">{section.description}</p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="#">Explore {section.title}</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
