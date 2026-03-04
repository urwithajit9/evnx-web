import Link from "next/link";
import {
  BookOpen,
  Zap,
  GitBranch,
  Layers,
  FileText,
  Clock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  getAllGuides,
  getGuidesBySection,
  GUIDE_SECTIONS,
  type Guide,
  type GuideSection,
} from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "From first install to production CI/CD — comprehensive evnx guides for every step.",
};

// ─── Section icons ─────────────────────────────────────────────────────────

const SECTION_ICONS: Record<GuideSection, typeof BookOpen> = {
  "getting-started": BookOpen,
  commands: Zap,
  integrations: GitBranch,
  "use-cases": Layers,
  reference: FileText,
};

// ─── Difficulty badge ──────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: Guide["difficulty"] }) {
  const styles = {
    beginner: "text-success border-success/30 bg-success/5",
    intermediate: "text-warning border-warning/30 bg-warning/5",
    advanced: "text-danger border-danger/30 bg-danger/5",
  };
  return (
    <span
      className={`font-mono text-xs px-1.5 py-0.5 rounded border ${styles[level]}`}
    >
      {level}
    </span>
  );
}

// ─── Guide card (compact list item) ───────────────────────────────────────

function GuideListItem({ guide }: { guide: Guide }) {
  return (
    <Link href={`/guides/${guide.slug}`}>
      <div className="group flex items-start justify-between gap-4 py-3 border-b border-border-subtle last:border-0 hover:bg-bg-overlay -mx-4 px-4 rounded transition-colors">
        <div className="min-w-0">
          <p className="font-mono text-sm text-text-primary group-hover:text-brand-400 transition-colors truncate">
            {guide.title}
          </p>
          <p className="text-xs text-text-muted mt-0.5 truncate">
            {guide.excerpt}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DifficultyBadge level={guide.difficulty} />
          <span className="text-xs font-mono text-text-muted whitespace-nowrap hidden sm:block">
            {guide.timeToComplete}
          </span>
          <ChevronRight className="w-3 h-3 text-text-muted group-hover:text-brand-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ─── Featured "start here" cards ──────────────────────────────────────────

function FeaturedGuideCard({ guide }: { guide: Guide }) {
  const Icon = SECTION_ICONS[guide.section];
  return (
    <Link href={`/guides/${guide.slug}`}>
      <div className="group bg-bg-surface border border-border-muted rounded-xl p-6 hover:border-brand-500/40 hover:bg-bg-overlay transition-all h-full">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-brand-500/10 rounded flex-shrink-0">
            <Icon className="w-4 h-4 text-brand-500" />
          </div>
          <span className="font-mono text-xs text-text-muted uppercase tracking-wide pt-1.5">
            {GUIDE_SECTIONS.find((s) => s.key === guide.section)?.label}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-brand-400 transition-colors leading-snug">
          {guide.title}
        </h3>
        <p className="text-sm text-text-muted mb-4 line-clamp-2 leading-relaxed">
          {guide.excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
          <DifficultyBadge level={guide.difficulty} />
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {guide.timeToComplete}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────

function SectionCard({
  sectionKey,
  guides,
}: {
  sectionKey: GuideSection;
  guides: Guide[];
}) {
  const meta = GUIDE_SECTIONS.find((s) => s.key === sectionKey)!;
  const Icon = SECTION_ICONS[sectionKey];
  const firstGuide = guides[0];

  return (
    <div className="bg-bg-surface border border-border-muted rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between p-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 rounded">
            <Icon className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-text-primary">
              {meta.label}
            </h3>
            <p className="font-mono text-xs text-text-muted">
              {guides.length} guide{guides.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {firstGuide && (
          <Link
            href={`/guides/${firstGuide.slug}`}
            className="font-mono text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            Start
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Guide list */}
      <div className="p-4">
        {guides.length === 0 ? (
          <p className="font-mono text-xs text-text-muted py-2 italic">
            Coming soon
          </p>
        ) : (
          guides.map((guide) => (
            <GuideListItem key={guide.slug} guide={guide} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function GuidesPage() {
  const allGuides = getAllGuides();
  const bySection = getGuidesBySection();
  const totalGuides = allGuides.length;

  // "Start here" — first guide from getting-started + first command + first use-case
  const startHere: Guide[] = [
    bySection["getting-started"]?.[0],
    bySection["getting-started"]?.[1],
    bySection["commands"]?.[0],
  ].filter(Boolean) as Guide[];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <p className="font-mono text-brand-500 text-sm mb-4">// guides</p>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Learn evnx.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mb-6">
            From first install to production CI/CD — comprehensive guides for
            every step.
          </p>
          <div className="flex items-center gap-4 font-mono text-sm text-text-muted">
            <span>
              {totalGuides} guide{totalGuides !== 1 ? "s" : ""}
            </span>
            <span>·</span>
            <span>{GUIDE_SECTIONS.length} sections</span>
            <span>·</span>
            <span className="text-success">evnx v0.2.0</span>
          </div>
        </div>
      </section>

      <div className="container-base py-16 space-y-16">
        {/* Start here */}
        {startHere.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
                Start Here
              </p>
              <span className="font-mono text-xs text-text-muted">
                New to evnx?
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {startHere.map((guide) => (
                <FeaturedGuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {totalGuides === 0 && (
          <div className="bg-bg-surface border border-border-muted rounded-xl p-16 text-center">
            <p className="font-mono text-text-muted text-sm mb-2">
              // no guides yet
            </p>
            <p className="text-text-secondary">
              Guides are being written. Check back soon.
            </p>
          </div>
        )}

        {/* All sections */}
        {totalGuides > 0 && (
          <section>
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6">
              Browse by Section
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GUIDE_SECTIONS.map((section) => (
                <SectionCard
                  key={section.key}
                  sectionKey={section.key}
                  guides={bySection[section.key] ?? []}
                />
              ))}
            </div>
          </section>
        )}

        {/* Quick install CTA */}
        <section className="bg-bg-surface border border-border-muted rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
                Don't have evnx yet?
              </p>
              <h2 className="font-serif text-2xl font-bold mb-2">
                Install in one command.
              </h2>
              <p className="text-text-secondary text-sm">
                evnx is a single static binary. No runtime, no dependencies.
              </p>
            </div>
            <div>
              <div className="bg-terminal-bg border border-border-subtle rounded-lg p-4 font-mono text-sm mb-3">
                <span className="text-brand-500">$ </span>
                <span className="text-terminal-text">
                  curl -fsSL https://dotenv.space/install.sh | bash
                </span>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/install"
                  className="font-mono text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  All install methods →
                </Link>
                <Link
                  href="/guides/getting-started/installation"
                  className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Installation guide →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
