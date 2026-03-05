import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import {
  getAllGuides,
  getGuide,
  getGuidesBySection,
  getAdjacentGuides,
  GUIDE_SECTIONS,
} from "@/lib/content";
import { mdxComponents } from "@/components/mdx/mdx-components";
import type { Metadata } from "next";
import { HelpfulVote } from "@/components/ui/helpful-vote";

// ── Next.js 16: params is a Promise, must be awaited ─────────────────────────
type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  return getAllGuides().map((guide) => ({
    slug: guide.slug.split("/"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // ← await
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.excerpt,
  };
}

const DIFFICULTY_COLORS = {
  beginner: "text-success border-success/30 bg-success/5",
  intermediate: "text-warning border-warning/30 bg-warning/5",
  advanced: "text-danger border-danger/30 bg-danger/5",
};

// ── async so we can await params ──────────────────────────────────────────────
export default async function GuidePage({ params }: Props) {
  const { slug } = await params; // ← await
  const guide = getGuide(slug);
  if (!guide) notFound();

  const bySection = getGuidesBySection();
  const { prev, next } = getAdjacentGuides(guide);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-border-subtle">
        <div className="container-base py-3">
          <nav className="flex items-center gap-2 text-xs font-mono text-text-muted">
            <Link
              href="/"
              className="hover:text-text-primary transition-colors"
            >
              evnx
            </Link>
            <span>/</span>
            <Link
              href="/guides"
              className="hover:text-text-primary transition-colors"
            >
              guides
            </Link>
            <span>/</span>
            <span className="text-text-secondary">{guide.section}</span>
            <span>/</span>
            <span className="text-text-primary truncate max-w-[200px]">
              {guide.slug.split("/").pop()}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-base py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left sidebar — section nav */}
          <aside className="lg:col-span-1 hidden lg:block">
            <nav className="sticky top-8 space-y-6">
              {GUIDE_SECTIONS.map((section) => {
                const sectionGuides = bySection[section.key] ?? [];
                if (sectionGuides.length === 0) return null;
                return (
                  <div key={section.key}>
                    <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-2">
                      {section.label}
                    </p>
                    <ul className="space-y-1">
                      {sectionGuides.map((g) => {
                        const isActive = g.slug === guide.slug;
                        return (
                          <li key={g.slug}>
                            <Link
                              href={`/guides/${g.slug}`}
                              className={`block font-mono text-xs py-1.5 px-2 rounded transition-colors border-l-2 ${
                                isActive
                                  ? "border-brand-500 text-brand-400 bg-brand-500/5"
                                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-muted"
                              }`}
                            >
                              {g.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}

              <div className="pt-4 border-t border-border-subtle">
                <p className="font-mono text-xs text-text-muted">
                  evnx v{guide.evnxVersion}+
                </p>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <article className="lg:col-span-3">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className={`font-mono text-xs px-2 py-1 rounded border ${DIFFICULTY_COLORS[guide.difficulty]}`}
              >
                {guide.difficulty}
              </span>
              <span className="font-mono text-xs text-text-muted">
                ⏱ {guide.timeToComplete}
              </span>
              {guide.evnxVersion && (
                <span className="font-mono text-xs text-text-muted">
                  evnx v{guide.evnxVersion}+
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
              {guide.title}
            </h1>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              {guide.excerpt}
            </p>

            {/* Prerequisites */}
            {guide.prerequisites && guide.prerequisites.length > 0 && (
              <div className="bg-info/5 border border-info/20 rounded-lg p-4 mb-8">
                <p className="font-mono text-xs text-info uppercase tracking-widest mb-3">
                  Prerequisites
                </p>
                <ul className="space-y-1">
                  {guide.prerequisites.map((prereqSlug) => (
                    <li key={prereqSlug}>
                      <Link
                        href={`/guides/${prereqSlug}`}
                        className="font-mono text-sm text-info hover:text-blue-300 transition-colors"
                      >
                        → {prereqSlug.split("/").pop()?.replace(/-/g, " ")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* MDX body */}
            <div className="prose-evnx">
              <MDXRemote
                source={guide.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      rehypeSlug,
                      [rehypeAutolinkHeadings, { behavior: "wrap" }],
                    ],
                  },
                }}
              />
            </div>

            {/* Feedback */}
            <div className="mt-12 pt-8 border-t border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* <p className="font-mono text-sm text-text-muted">
                  Was this helpful?
                </p> */}
                <HelpfulVote slug={`guides/${guide.slug}`} />
                {/* <button className="font-mono text-xs px-3 py-1 border border-border-muted rounded hover:border-success hover:text-success transition-colors">
                  👍 Yes
                </button>
                <button className="font-mono text-xs px-3 py-1 border border-border-muted rounded hover:border-danger hover:text-danger transition-colors">
                  👎 No
                </button> */}
              </div>
              <a
                href={`https://github.com/urwithajit9/evnx-web/blob/main/content/guides/${guide.slug}.mdx`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Edit on GitHub →
              </a>
            </div>

            {/* Prev / Next */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {prev ? (
                <Link href={`/guides/${prev.slug}`}>
                  <div className="group bg-bg-surface border border-border-muted rounded-lg p-4 hover:border-border-default transition-all">
                    <p className="font-mono text-xs text-text-muted mb-1">
                      ← Previous
                    </p>
                    <p className="font-serif text-sm font-bold group-hover:text-brand-400 transition-colors">
                      {prev.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link href={`/guides/${next.slug}`}>
                  <div className="group bg-bg-surface border border-border-muted rounded-lg p-4 hover:border-border-default transition-all text-right">
                    <p className="font-mono text-xs text-text-muted mb-1">
                      Next →
                    </p>
                    <p className="font-serif text-sm font-bold group-hover:text-brand-400 transition-colors">
                      {next.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>

          {/* Right sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-8 space-y-6">
              <div className="bg-bg-surface border border-border-muted rounded-lg p-4">
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
                  On this page
                </p>
                <p className="font-mono text-xs text-text-muted italic">
                  Scroll to navigate
                </p>
              </div>

              <div className="bg-brand-500/5 border border-brand-500/20 rounded-lg p-4">
                <p className="font-mono text-xs text-brand-400 mb-3">
                  Quick install
                </p>
                <div className="bg-terminal-bg rounded p-2 font-mono text-xs text-terminal-text mb-3">
                  <span className="text-brand-500">$ </span>curl -fsSL
                  https://dotenv.space/install.sh | bash
                </div>
                <Link
                  href="/install"
                  className="font-mono text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Full install guide →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
