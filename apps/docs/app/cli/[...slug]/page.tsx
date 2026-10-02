import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import {
  GUIDE_SECTIONS,
  getAllGuides,
  getGuide,
  getGuidesBySection,
  getAdjacentGuides,
  type GuideSection,
} from "@evnx/docs-content";
import { mdxComponents } from "@evnx/mdx";
import { HOSTS } from "@evnx/config";

const DIFFICULTY: Record<string, string> = {
  beginner: "text-success border-success/30 bg-success/5",
  intermediate: "text-warning border-warning/30 bg-warning/5",
  advanced: "text-danger border-danger/30 bg-danger/5",
};

type Props = { params: Promise<{ slug: string[] }> };

/** A one-segment slug naming a real section, e.g. `["commands"]`. */
function sectionFor(slug: string[]): GuideSection | null {
  if (slug.length !== 1) return null;
  return GUIDE_SECTIONS.find((s) => s.key === slug[0])?.key ?? null;
}

export async function generateStaticParams() {
  return [
    ...GUIDE_SECTIONS.map((s) => ({ slug: [s.key] })),
    ...getAllGuides().map((g) => ({ slug: g.slug.split("/") })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = sectionFor(slug);
  if (section) {
    const meta = GUIDE_SECTIONS.find((s) => s.key === section);
    return {
      title: meta?.label ?? section,
      description: meta?.description,
      alternates: { canonical: `${HOSTS.docs}/cli/${section}` },
    };
  }
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.excerpt,
    // ⚠️ Canonical on docs.evnx.dev, not evnx.dev. The 301s from /guides/* say
    // this URL is now authoritative; a canonical pointing back contradicts them.
    alternates: { canonical: `${HOSTS.docs}/cli/${guide.slug}` },
  };
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  const bySection = getGuidesBySection();
  const section = sectionFor(slug);

  if (section) {
    const meta = GUIDE_SECTIONS.find((s) => s.key === section);
    const guides = bySection[section] ?? [];
    return (
      <div className="container-base section-padding max-w-3xl">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-text-muted mb-6">
          <Link href="/cli" className="hover:text-text-primary">CLI</Link>
          <span aria-hidden> / </span>
          <span className="text-text-secondary">{meta?.label}</span>
        </nav>
        <h1 className="font-serif text-4xl font-bold mb-3">{meta?.label}</h1>
        {meta?.description && (
          <p className="text-lg text-text-secondary mb-10">{meta.description}</p>
        )}
        <ul className="space-y-3">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/cli/${g.slug}`}
                className="block p-5 rounded-xl border border-border-muted bg-bg-surface hover:border-brand-500 transition-colors"
              >
                <span className="font-medium block mb-1">{g.title}</span>
                <span className="text-sm text-text-secondary">{g.excerpt}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const guide = getGuide(slug);
  if (!guide) notFound();
  const { prev, next } = getAdjacentGuides(guide);

  return (
    <article className="container-base section-padding max-w-3xl">
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-text-muted mb-6">
        <Link href="/cli" className="hover:text-text-primary">CLI</Link>
        <span aria-hidden> / </span>
        <Link href={`/cli/${guide.section}`} className="hover:text-text-primary">
          {GUIDE_SECTIONS.find((s) => s.key === guide.section)?.label}
        </Link>
      </nav>

      <h1 className="font-serif text-4xl font-bold mb-4">{guide.title}</h1>
      {guide.excerpt && (
        <p className="text-lg text-text-secondary mb-6 leading-relaxed">{guide.excerpt}</p>
      )}

      {/* ⚠️ The frontmatter was already there and nothing rendered it. A guide
          that does not say how long it takes, what it assumes, or which
          version it was checked against is a guide a reader has to finish
          before knowing whether it was for them. */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-border-muted">
        <span
          className={`font-mono text-xs px-2 py-1 rounded border ${DIFFICULTY[guide.difficulty] ?? DIFFICULTY.beginner}`}
        >
          {guide.difficulty}
        </span>
        {guide.timeToComplete && (
          <span className="font-mono text-xs text-text-muted">⏱ {guide.timeToComplete}</span>
        )}
        {guide.evnxVersion && (
          <span className="font-mono text-xs text-text-muted">
            evnx v{guide.evnxVersion}+
          </span>
        )}
        {guide.updatedAt && (
          <span className="font-mono text-xs text-text-muted">
            updated {guide.updatedAt}
          </span>
        )}
      </div>

      {guide.prerequisites && guide.prerequisites.length > 0 && (
        <div className="bg-info/5 border border-info/20 rounded-lg p-4 mb-8">
          <p className="font-mono text-xs text-info uppercase tracking-widest mb-3">
            Before you start
          </p>
          <ul className="space-y-1.5">
            {guide.prerequisites.map((slug) => {
              const target = getGuide(slug.split("/"));
              return (
                <li key={slug}>
                  <Link
                    href={`/cli/${slug}`}
                    className="text-sm text-brand-400 hover:underline underline-offset-4"
                  >
                    {target?.title ?? slug}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="prose-evnx">
        <MDXRemote
          source={guide.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
            },
          }}
        />
      </div>

      <nav
        aria-label="Adjacent guides"
        className="mt-16 pt-8 border-t border-border-muted flex justify-between gap-4 text-sm"
      >
        {prev ? (
          <Link href={`/cli/${prev.slug}`} className="text-brand-400 hover:underline underline-offset-4">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/cli/${next.slug}`}
            className="text-brand-400 hover:underline underline-offset-4 text-right"
          >
            {next.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}
