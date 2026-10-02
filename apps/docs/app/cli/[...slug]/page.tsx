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
        <p className="text-lg text-text-secondary mb-10 leading-relaxed">{guide.excerpt}</p>
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
