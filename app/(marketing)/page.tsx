'use client';

import { Terminal } from '@/components/ui/terminal';
import { CodeBlock } from '@/components/ui/code-block';
import { Badge } from '@/components/ui/badge-status';
import { Button } from '@/components/ui/button';
import { Shield, CircleCheck as CheckCircle, GitBranch, FileJson, Zap, Eye, Lock, ChartBar as BarChart3, Settings, Github, BookOpen, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const terminalLines = [
  { type: 'prompt' as const, content: 'evnx scan' },
  { type: 'output' as const, content: '[SCAN] Scanning .env files...' },
  { type: 'error' as const, content: '[ERROR] AWS_SECRET_ACCESS_KEY detected (high entropy)' },
  { type: 'success' as const, content: '[INFO] Scan complete: 1 secret found' },
  { type: 'prompt' as const, content: 'evnx validate --strict' },
  { type: 'output' as const, content: '[VALIDATE] Checking environment configuration...' },
  { type: 'warning' as const, content: '[WARNING] localhost in production value' },
  { type: 'success' as const, content: '[OK] Validation passed with 1 warning' },
];

const features = [
  {
    icon: Shield,
    title: 'Secret Scanning',
    description: 'Detects AWS keys, Stripe secrets, GitHub tokens, and high-entropy strings',
  },
  {
    icon: CheckCircle,
    title: 'Validation',
    description: 'Catches placeholders, weak secrets, and localhost in production',
  },
  {
    icon: FileJson,
    title: '14+ Formats',
    description: 'JSON, YAML, Kubernetes, Terraform, GitHub Actions, Doppler, and more',
  },
  {
    icon: GitBranch,
    title: 'Stack Blueprints',
    description: 'Init with pre-wired templates for Django, Next.js, FastAPI, Laravel, Rust',
  },
  {
    icon: Zap,
    title: 'Bidirectional Sync',
    description: 'Keep .env and .env.example aligned automatically',
  },
  {
    icon: Eye,
    title: 'Add Variables',
    description: 'Manage .env entirely from CLI, no manual editing needed',
  },
  {
    icon: Lock,
    title: 'Cloud Migration',
    description: 'Push to AWS Secrets Manager, Doppler, Infisical, GitHub Actions',
  },
  {
    icon: BarChart3,
    title: 'CI/CD Native',
    description: 'SARIF output for GitHub Security tab, GitHub Actions annotations',
  },
  {
    icon: Settings,
    title: 'Doctor Diagnostics',
    description: 'Health checks: gitignore, permissions, project structure validation',
  },
  {
    icon: Cpu,
    title: 'Template Engine',
    description: 'Dynamic config generation with filters and transformations',
  },
  {
    icon: Lock,
    title: 'Encrypted Backups',
    description: 'AES-256-GCM + Argon2 key derivation for security',
  },
  {
    icon: Settings,
    title: 'Zero Config',
    description: 'Works out of the box; .evnx.toml for power users',
  },
];

const installSnippets = {
  macos: 'curl -fsSL https://dotenv.space/install.sh | bash',
  linux: 'curl -fsSL https://dotenv.space/install.sh | bash',
  windows: 'winget install evnx',
  cargo: 'cargo install evnx',
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('macos');

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-bg-base border-b border-border-muted">
        <div className="container-base section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Stop leaking secrets.
              </h1>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                evnx is a blazing-fast Rust CLI for validating, scanning, converting, and securing
                your environment files — before they become incidents.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button size="lg" asChild>
                  <a href="#install">Install evnx</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="https://github.com/urwithajit9/evnx" target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-text-secondary pt-8 border-t border-border-subtle">
                <span>Open source</span>
                <span>MIT License</span>
                <span>Built with Rust</span>
                <span>v0.2.0</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <Terminal lines={terminalLines} speed={30} />
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <div className="max-w-2xl">
            <blockquote className="text-lg italic text-text-secondary mb-8">
              <div className="text-brand-500 mb-4 font-mono">
                # I built this after accidentally pushing AWS credentials to GitHub.
              </div>
              <div className="text-brand-500 mb-4 font-mono">
                # The key was revoked in minutes. Three services went down.
              </div>
              <div className="text-brand-500 mb-4 font-mono">
                # I had to explain the incident to my development lead.
              </div>
              <div className="text-brand-500 mb-4 font-mono">
                # That conversation was more painful than any billing alert.
              </div>
            </blockquote>
            <p className="text-text-secondary">
              Three years and zero incidents later — evnx is the safety net I wish I'd had.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding border-b border-border-muted">
        <div className="container-base">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Everything your .env workflow needs.
          </h2>
          <p className="text-text-secondary mb-16 text-lg">
            From secret detection to cloud sync, evnx handles the entire lifecycle.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-bg-surface border border-border-muted rounded-lg p-6 hover:border-border-default hover:bg-bg-overlay transition-all hover:glow-brand"
                >
                  <Icon className="w-8 h-8 text-brand-500 mb-4" />
                  <h3 className="font-serif text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm">{feature.description}</p>
                  {feature.title === 'Add Variables' && (
                    <Badge variant="brand" className="mt-4">
                      NEW v0.2.0
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Install Section */}
      <section id="install" className="section-padding border-b border-border-muted">
        <div className="container-base">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Install in one command.
          </h2>
          <p className="text-text-secondary mb-12 text-lg">
            Choose your preferred installation method. evnx works on macOS, Linux, and Windows.
          </p>

          <div className="bg-bg-surface border border-border-muted rounded-lg overflow-hidden mb-8">
            <div className="flex border-b border-border-muted">
              {['macOS', 'Linux', 'Windows', 'Cargo'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`flex-1 px-4 py-3 font-mono text-sm transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-brand-500 text-black font-semibold'
                      : 'bg-bg-surface text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 bg-terminal-bg border border-border-muted rounded p-4 font-mono text-sm">
                <span className="text-brand-500">$</span>
                <code className="text-terminal-text flex-1 break-all">
                  {activeTab === 'macos'
                    ? installSnippets.macos
                    : activeTab === 'linux'
                      ? installSnippets.linux
                      : activeTab === 'windows'
                        ? installSnippets.windows
                        : installSnippets.cargo}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      activeTab === 'macos'
                        ? installSnippets.macos
                        : activeTab === 'linux'
                          ? installSnippets.linux
                          : activeTab === 'windows'
                            ? installSnippets.windows
                            : installSnippets.cargo
                    );
                  }}
                  className="text-text-secondary hover:text-text-primary flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="bg-terminal-bg border border-border-muted rounded-lg p-6 text-sm text-terminal-text font-mono">
            <div className="space-y-1 mb-4">
              <div>
                <span className="text-text-muted">$</span>
                <span className="ml-2 text-terminal-prompt">evnx --version</span>
              </div>
              <div className="text-success">evnx 0.2.0</div>
              <div>
                <span className="text-text-muted">$</span>
                <span className="ml-2 text-terminal-prompt">evnx --help</span>
              </div>
              <div className="text-terminal-text">Usage: evnx [COMMAND]</div>
              <div className="text-terminal-text mb-3">Commands: init, validate, scan, diff, convert, sync, add, migrate, doctor, backup, restore, template</div>
            </div>
          </div>
        </div>
      </section>

      {/* Commands Showcase */}
      <section className="section-padding border-b border-border-muted bg-bg-surface">
        <div className="container-base">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Built for your workflow.
          </h2>
          <p className="text-text-secondary mb-12 text-lg">
            evnx provides specialized commands for every .env management task.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg-base border border-border-muted rounded-lg p-6">
              <div className="font-mono font-semibold text-brand-500 mb-2">evnx scan</div>
              <p className="text-text-secondary text-sm mb-4">
                Detect secrets and sensitive data in your .env files
              </p>
              <CodeBlock
                language="bash"
                showLineNumbers={false}
              >{`evnx scan --path ./config --format json`}</CodeBlock>
            </div>

            <div className="bg-bg-base border border-border-muted rounded-lg p-6">
              <div className="font-mono font-semibold text-brand-500 mb-2">evnx validate</div>
              <p className="text-text-secondary text-sm mb-4">
                Validate environment configuration and catch common errors
              </p>
              <CodeBlock
                language="bash"
                showLineNumbers={false}
              >{`evnx validate --strict --exit-code`}</CodeBlock>
            </div>

            <div className="bg-bg-base border border-border-muted rounded-lg p-6">
              <div className="font-mono font-semibold text-brand-500 mb-2">evnx convert</div>
              <p className="text-text-secondary text-sm mb-4">
                Convert .env files to 14+ different formats
              </p>
              <CodeBlock
                language="bash"
                showLineNumbers={false}
              >{`evnx convert --from .env --to kubernetes`}</CodeBlock>
            </div>

            <div className="bg-bg-base border border-border-muted rounded-lg p-6">
              <div className="font-mono font-semibold text-brand-500 mb-2">evnx add</div>
              <p className="text-text-secondary text-sm mb-4">
                Manage environment variables directly from the CLI
              </p>
              <CodeBlock
                language="bash"
                showLineNumbers={false}
              >{`evnx add DATABASE_URL "postgres://..."`}</CodeBlock>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/guides">Explore all guides</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CI/CD Integration */}
      <section className="section-padding border-b border-border-muted">
        <div className="container-base">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Ship with confidence.
          </h2>
          <p className="text-text-secondary mb-12 text-lg">
            evnx runs everywhere. Integrate with your CI/CD pipeline in minutes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-mono font-semibold text-brand-500 mb-4">GitHub Actions</h3>
              <CodeBlock
                language="yaml"
                filename=".github/workflows/validate.yml"
                showLineNumbers={false}
              >{`- name: Validate .env
  run: |
    cargo install evnx
    evnx validate --strict`}</CodeBlock>
            </div>

            <div>
              <h3 className="font-mono font-semibold text-brand-500 mb-4">Pre-commit</h3>
              <CodeBlock
                language="yaml"
                filename=".pre-commit-config.yaml"
                showLineNumbers={false}
              >{`- repo: local
  hooks:
    - id: evnx-scan
      name: evnx scan
      entry: evnx scan
      language: system`}</CodeBlock>
            </div>

            <div>
              <h3 className="font-mono font-semibold text-brand-500 mb-4">Docker</h3>
              <CodeBlock
                language="dockerfile"
                filename="Dockerfile"
                showLineNumbers={false}
              >{`RUN cargo install evnx
COPY .env .env
RUN evnx validate --strict`}</CodeBlock>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-bg-surface border-b border-border-muted">
        <div className="container-base text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Ready to secure your .env?
          </h2>
          <p className="text-text-secondary mb-8 text-lg max-w-2xl mx-auto">
            Join developers who are protecting their secrets. Start with evnx today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="#install">Install Now</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/guides">Read Guides</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
