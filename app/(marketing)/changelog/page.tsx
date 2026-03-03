import { Badge } from '@/components/ui/badge-status';

const releases = [
  {
    version: '0.2.0',
    date: '2024-01-15',
    type: 'minor',
    highlights: [
      'NEW: `evnx add` command for CLI variable management',
      'FEATURE: Support for 14+ format conversions (JSON, YAML, Kubernetes, Terraform, etc.)',
      'IMPROVEMENT: Enhanced secret pattern detection with AI-powered scanning',
      'BUGFIX: Fixed false positives in GitHub token detection',
      'PERFORMANCE: 3x faster validation on large .env files',
    ],
  },
  {
    version: '0.1.5',
    date: '2023-12-20',
    type: 'patch',
    highlights: [
      'BUGFIX: Corrected Windows path handling',
      'IMPROVEMENT: Better error messages for validation failures',
      'DOCS: Expanded CLI documentation',
    ],
  },
  {
    version: '0.1.0',
    date: '2023-11-01',
    type: 'minor',
    highlights: [
      'INITIAL: First public release of evnx',
      'FEATURE: Core scanning functionality',
      'FEATURE: Validation engine with 50+ rules',
      'FEATURE: Basic format conversion support',
    ],
  },
];

export const metadata = {
  title: 'Changelog',
  description: 'Release notes and changelog for evnx.',
};

function getReleaseTypeBadge(type: string) {
  switch (type) {
    case 'major':
      return <Badge variant="danger">MAJOR</Badge>;
    case 'minor':
      return <Badge variant="info">MINOR</Badge>;
    case 'patch':
      return <Badge variant="success">PATCH</Badge>;
    default:
      return <Badge>RELEASE</Badge>;
  }
}

export default function ChangelogPage() {
  return (
    <div>
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Changelog.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl">
            All releases and updates to evnx. Track new features, improvements, and bug fixes.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base max-w-3xl">
          <div className="space-y-12">
            {releases.map((release, idx) => (
              <div key={idx} className="pb-12 border-b border-border-subtle last:border-0">
                <div className="flex items-start gap-6 mb-6">
                  <div className="pt-1">
                    <h2 className="font-serif text-3xl font-bold mb-2">
                      v{release.version}
                    </h2>
                    <div className="flex items-center gap-3">
                      {getReleaseTypeBadge(release.type)}
                      <span className="text-text-secondary text-sm">{release.date}</span>
                    </div>
                  </div>
                  <a
                    href={`https://github.com/urwithajit9/evnx/releases/tag/v${release.version}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-brand-500 hover:text-brand-400 transition-colors text-sm whitespace-nowrap"
                  >
                    View on GitHub →
                  </a>
                </div>

                <div className="bg-bg-surface border border-border-muted rounded-lg p-6">
                  <ul className="space-y-3">
                    {release.highlights.map((highlight, hIdx) => {
                      const [label, ...rest] = highlight.split(': ');
                      const text = rest.join(': ');

                      let color = 'text-text-secondary';
                      if (label.includes('NEW')) color = 'text-success';
                      else if (label.includes('FEATURE')) color = 'text-info';
                      else if (label.includes('IMPROVEMENT')) color = 'text-brand-400';
                      else if (label.includes('BUGFIX')) color = 'text-warning';
                      else if (label.includes('PERFORMANCE')) color = 'text-brand-500';

                      return (
                        <li key={hIdx} className="flex gap-3 text-sm">
                          <span className={`font-mono font-semibold ${color} whitespace-nowrap`}>
                            {label}
                          </span>
                          <span className="text-text-secondary">{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-bg-surface border border-border-muted rounded-lg p-8 text-center">
            <p className="text-text-secondary mb-4">
              Want to stay updated with the latest releases?
            </p>
            <a
              href="https://github.com/urwithajit9/evnx/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:text-brand-400 font-mono text-sm"
            >
              Watch on GitHub →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
