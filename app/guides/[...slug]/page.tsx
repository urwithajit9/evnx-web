import { Badge } from '@/components/ui/badge-status';
import { CodeBlock } from '@/components/ui/code-block';
import { Clock, Zap, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Guide',
  description: 'Learn how to use evnx.',
};

interface GuidePageProps {
  params: {
    slug: string[];
  };
}

const guides: Record<string, any> = {
  'getting-started/installation': {
    title: 'Installation Guide',
    section: 'Getting Started',
    difficulty: 'beginner',
    time: '5 minutes',
    excerpt: 'Install evnx on macOS, Linux, or Windows and verify the installation.',
    content: `
# Installation Guide

Get evnx up and running on your system in just a few minutes.

## Prerequisites

- macOS, Linux, or Windows
- For Cargo install: Rust 1.70+ (install from rustup.rs)

## Installation Methods

### macOS & Linux (Recommended)

Use our automated installation script:

\`\`\`bash
curl -fsSL https://dotenv.space/install.sh | bash
\`\`\`

### Windows

Using Windows Package Manager:

\`\`\`powershell
winget install evnx
\`\`\`

Or use Cargo (see below).

### All Platforms with Cargo

If you have Rust installed, use Cargo:

\`\`\`bash
cargo install evnx
\`\`\`

For additional features:

\`\`\`bash
cargo install evnx --features full
\`\`\`

## Verify Installation

Check that evnx is installed correctly:

\`\`\`bash
evnx --version
# Output: evnx 0.2.0

evnx --help
# Output: Usage: evnx [COMMAND]
\`\`\`

## What's Next?

- Read the Quick Start guide
- Learn about the scan command
- Explore integration options
    `,
  },
  'getting-started/quick-start': {
    title: 'Quick Start',
    section: 'Getting Started',
    difficulty: 'beginner',
    time: '5 minutes',
    excerpt: 'Get started with evnx in just 5 minutes. Learn the essential commands.',
    content: `
# Quick Start

Let's scan your first .env file and understand what evnx can do.

## Initialize a Project

Create a basic setup:

\`\`\`bash
evnx init --project my-app
\`\`\`

This creates a .evnx.toml configuration file.

## Scan for Secrets

Run the scanner on your .env file:

\`\`\`bash
evnx scan
\`\`\`

Output example:

\`\`\`
[SCAN] Scanning .env files...
[ERROR] AWS_SECRET_ACCESS_KEY detected (high entropy)
[WARNING] DATABASE_URL contains localhost in production
[INFO] Scan complete: 1 error, 1 warning
\`\`\`

## Validate Your Configuration

Check for common mistakes:

\`\`\`bash
evnx validate --strict
\`\`\`

## Convert to Another Format

Export to Kubernetes:

\`\`\`bash
evnx convert --from .env --to kubernetes
\`\`\`

## Learn More

- Explore the scan command guide
- Learn about validation rules
- Check out CI/CD integration examples
    `,
  },
  'commands/scan': {
    title: 'Scan Command',
    section: 'Commands',
    difficulty: 'beginner',
    time: '10 minutes',
    excerpt: 'Deep dive into the evnx scan command. Detect secrets and sensitive data.',
    content: `
# Scan Command

The scan command detects secrets and sensitive data in your environment files.

## Basic Usage

\`\`\`bash
evnx scan
\`\`\`

This scans the current directory for .env files.

## Scan Specific Path

\`\`\`bash
evnx scan --path ./config
\`\`\`

## Output Formats

### Pretty (Default)

\`\`\`bash
evnx scan --format pretty
\`\`\`

### JSON

\`\`\`bash
evnx scan --format json
\`\`\`

### SARIF (for GitHub)

\`\`\`bash
evnx scan --format sarif > results.sarif
\`\`\`

## Common Detections

evnx detects:

- AWS Keys (AKIA...)
- Stripe Secrets (sk_live_...)
- GitHub Tokens
- OpenAI Keys
- High-entropy strings
- Hardcoded URLs
- Test credentials

## Exit Codes

Use --exit-code to fail CI/CD on findings:

\`\`\`bash
evnx scan --exit-code
# Exit 0 = no secrets
# Exit 1 = secrets found
\`\`\`

## Integration with CI/CD

See the CI/CD integration guide for GitHub Actions, GitLab CI, and more.
    `,
  },
};

export default function GuidePage({ params }: GuidePageProps) {
  const slug = params.slug.join('/');
  const guide = guides[slug] || {
    title: 'Guide Not Found',
    section: 'Guides',
    difficulty: 'beginner',
    time: '5 minutes',
    excerpt: 'This guide is coming soon.',
    content: 'Content for this guide is coming soon.',
  };

  const sections = [
    { id: 'getting-started', name: 'Getting Started', guides: ['installation', 'quick-start'] },
    { id: 'commands', name: 'Commands', guides: ['scan', 'validate', 'convert', 'add'] },
    { id: 'integrations', name: 'Integrations', guides: ['github-actions', 'gitlab-ci'] },
  ];

  const currentSection = sections.find(s => s.id === guide.section.toLowerCase().replace(' ', '-'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1">
        <div className="sticky top-24 bg-bg-surface border border-border-muted rounded-lg p-6">
          <h3 className="font-mono text-xs font-semibold text-text-muted uppercase mb-4">
            Navigation
          </h3>
          <nav className="space-y-6">
            {sections.map((section) => (
              <div key={section.id}>
                <h4 className="font-serif font-bold text-sm mb-2">{section.name}</h4>
                <ul className="space-y-1">
                  {section.guides.map((g) => (
                    <li key={g}>
                      <Link
                        href={`/guides/${section.id}/${g}`}
                        className="text-text-secondary hover:text-brand-500 text-sm transition-colors"
                      >
                        {g.replace(/-/g, ' ')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="lg:col-span-3">
        <article>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="info">{guide.section}</Badge>
            </div>
            <h1 className="text-5xl font-serif font-bold mb-4">{guide.title}</h1>
            <p className="text-xl text-text-secondary">{guide.excerpt}</p>
          </div>

          <div className="flex flex-wrap gap-6 mb-12 pb-12 border-b border-border-subtle">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Zap className="w-4 h-4" />
              <span className="capitalize">{guide.difficulty}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="w-4 h-4" />
              <span>{guide.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <BookOpen className="w-4 h-4" />
              <span>evnx v0.2.0+</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 mb-12">
            <div className="text-text-primary whitespace-pre-wrap leading-relaxed">
              {guide.content}
            </div>
          </div>

          <div className="border-t border-border-subtle pt-12">
            <div className="flex gap-4">
              <Link
                href="/guides"
                className="text-text-secondary hover:text-brand-500 text-sm"
              >
                ← Back to guides
              </Link>
              <a
                href={`https://github.com/urwithajit9/evnx/edit/main/docs/${slug}.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-brand-500 text-sm ml-auto"
              >
                Edit on GitHub →
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
