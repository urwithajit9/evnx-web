import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { canonicalUrl } from "@evnx/config";
import {
  getPublishedSecurityNotice,
  getPublishedSecurityNotices,
} from "@evnx/content";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { getSecurityNoticeBody } from "@/lib/security-notices";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // Empty while nothing is published; unknown slugs then hit notFound() below.
  return getPublishedSecurityNotices().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const notice = getPublishedSecurityNotice(slug);
  if (!notice) return {};
  return {
    title: notice.title,
    description: notice.summary,
    alternates: { canonical: canonicalUrl(`/security/${notice.slug}`) },
    openGraph: { url: canonicalUrl(`/security/${notice.slug}`) },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function SecurityNoticePage({ params }: Props) {
  const { slug } = await params;
  const notice = getPublishedSecurityNotice(slug);
  const body = notice ? getSecurityNoticeBody(slug) : null;
  if (!notice || body === null) notFound();

  return (
    <div>
      <div className="border-b border-border-subtle">
        <div className="container-base py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-text-muted">
            <Link href="/security" className="hover:text-text-primary transition-colors">
              security
            </Link>
            <span aria-hidden>/</span>
            <span className="text-text-secondary truncate max-w-[200px]">{notice.slug}</span>
          </nav>
        </div>
      </div>

      <article className="section-padding">
        <div className="container-base max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 mb-6 font-mono text-xs">
            <time dateTime={notice.date} className="text-text-muted">
              {formatDate(notice.date)}
            </time>
            {notice.severity === "action-required" && (
              <span className="px-2 py-1 rounded border border-warning/30 bg-warning/10 text-warning">
                Action required
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            {notice.title}
          </h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">{notice.summary}</p>

          <div className="prose-evnx">
            <MDXRemote
              source={body}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
            />
          </div>
        </div>
      </article>
    </div>
  );
}
