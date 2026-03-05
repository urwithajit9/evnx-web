import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllBlogPosts, getBlogPost, getRelatedPosts } from "@/lib/content";
import { mdxComponents } from "@/components/mdx/mdx-components";
import type { Metadata } from "next";

// ── Next.js 16: params is a Promise, must be awaited ─────────────────────────
type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // ← await
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  tutorial: "Tutorial",
  release: "Release",
  "deep-dive": "Deep Dive",
  opinion: "Opinion",
  "case-study": "Case Study",
  knowledge: "Knowledge",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── async so we can await params ──────────────────────────────────────────────
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params; // ← await
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);

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
              href="/blog"
              className="hover:text-text-primary transition-colors"
            >
              blog
            </Link>
            <span>/</span>
            <span className="text-text-secondary truncate max-w-[200px]">
              {post.slug}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-base py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main content */}
          <article className="lg:col-span-3">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="font-mono text-xs px-2 py-1 rounded border bg-brand-500/10 text-brand-400 border-brand-500/20">
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>
              {post.tags.map((tag) => (
                <span key={tag} className="font-mono text-xs text-text-muted">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author row */}
            <div className="flex items-center gap-4 pb-8 mb-8 border-b border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-mono font-bold flex-shrink-0">
                {post.author.name[0]}
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-text-primary">
                  {post.author.name}
                </p>
                <p className="font-mono text-xs text-text-muted">
                  {post.author.role}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-4 text-xs font-mono text-text-muted">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                <span>·</span>
                <span>{post.readTime} min read</span>
              </div>
            </div>

            {/* MDX body */}
            <div className="prose-evnx">
              <MDXRemote
                source={post.content}
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

            {/* Tags footer */}
            <div className="mt-12 pt-8 border-t border-border-subtle flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs px-3 py-1 bg-bg-surface border border-border-subtle rounded-full text-text-secondary"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author card */}
            <div className="mt-12 bg-bg-surface border border-border-muted rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-mono font-bold text-xl flex-shrink-0">
                  {post.author.name[0]}
                </div>
                <div>
                  <p className="font-mono font-bold text-text-primary mb-1">
                    {post.author.name}
                  </p>
                  <p className="font-mono text-xs text-text-muted mb-3">
                    {post.author.role}
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {post.author.bio}
                  </p>
                  <div className="flex gap-4 mt-4">
                    {post.author.github && (
                      <a
                        href={`https://github.com/${post.author.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        GitHub →
                      </a>
                    )}
                    {post.author.twitter && (
                      <a
                        href={`https://twitter.com/${post.author.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Twitter →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="mt-12">
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6">
                  Related Posts
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {related.map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}>
                      <div className="group bg-bg-surface border border-border-muted rounded-lg p-5 hover:border-border-default hover:bg-bg-overlay transition-all h-full">
                        <h4 className="font-serif font-bold mb-2 group-hover:text-brand-400 transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-sm text-text-muted">
                          {p.readTime} min read
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-bg-surface border border-border-muted rounded-lg p-5">
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
                  Share
                </p>
                <div className="space-y-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://evnx.dev/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-mono text-xs text-text-secondary hover:text-brand-400 transition-colors py-1"
                  >
                    Share on Twitter →
                  </a>
                  <a
                    href={`https://news.ycombinator.com/submitlink?u=https://evnx.dev/blog/${post.slug}&t=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-mono text-xs text-text-secondary hover:text-brand-400 transition-colors py-1"
                  >
                    Submit to HN →
                  </a>
                </div>
              </div>

              <div className="bg-brand-500/5 border border-brand-500/20 rounded-lg p-5">
                <p className="font-mono text-xs text-brand-400 uppercase tracking-widest mb-3">
                  Try evnx
                </p>
                <div className="bg-terminal-bg rounded p-3 font-mono text-xs text-terminal-text mb-4">
                  <span className="text-brand-500">$ </span>evnx doctor
                </div>
                <Link
                  href="/install"
                  className="block text-center text-xs font-mono bg-brand-500 text-black py-2 rounded hover:bg-brand-400 transition-colors"
                >
                  Install evnx →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
