import Link from 'next/link'
import { TagLink } from '@/components/ui/tag-link'
import { getAllBlogPosts, getAllBlogTags, getFeaturedBlogPosts } from '@/lib/content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts on developer security, .env management, and building Rust CLI tools.',
}

const CATEGORY_LABELS: Record<string, string> = {
  tutorial:    'Tutorial',
  release:     'Release',
  'deep-dive': 'Deep Dive',
  opinion:     'Opinion',
  'case-study':'Case Study',
  knowledge:   'Knowledge',
}

const CATEGORY_COLORS: Record<string, string> = {
  tutorial:    'bg-info/10 text-info border-info/20',
  release:     'bg-success/10 text-success border-success/20',
  'deep-dive': 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  opinion:     'bg-warning/10 text-warning border-warning/20',
  'case-study':'bg-purple-500/10 text-purple-400 border-purple-500/20',
  knowledge:   'bg-brand-500/10 text-brand-400 border-brand-500/20',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  })
}

type Props = {
  searchParams: Promise<{ tag?: string }>
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const { tag: activeTag } = await searchParams

  const allPosts = getAllBlogPosts()
  const tags     = getAllBlogTags()

  // Filter by active tag — if no tag selected, show all
  const filtered = activeTag
    ? allPosts.filter(p => p.tags.includes(activeTag))
    : allPosts

  // Featured only when no tag filter is active
  const featured = !activeTag ? getFeaturedBlogPosts(1) : []
  const rest     = filtered.filter(p => !featured.find(f => f.slug === p.slug))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <p className="font-mono text-brand-500 text-sm mb-4">// blog</p>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Writing.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl">
            Thoughts on developer security, .env management, the Rust ecosystem,
            and building tools that get out of your way.
          </p>

          {/* Active tag banner */}
          {activeTag && (
            <div className="flex items-center gap-3 mt-6">
              <span className="font-mono text-sm text-text-muted">
                Showing posts tagged
              </span>
              <span className="font-mono text-sm text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
                #{activeTag}
              </span>
              <Link
                href="/blog"
                className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
              >
                Clear filter
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="container-base py-16">

        {/* Featured post — only when not filtering */}
        {featured.length > 0 && (
          <section className="mb-16">
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6">
              Featured
            </p>
            {featured.map(post => (
              <article key={post.slug} className="group relative bg-bg-surface border border-border-muted rounded-xl p-8 hover:border-border-default hover:bg-bg-overlay transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-xs font-mono px-2 py-1 rounded border ${CATEGORY_COLORS[post.category] ?? ''}`}>
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  {post.tags.slice(0, 3).map(tag => (
                    <TagLink key={tag} tag={tag} className="relative z-10" />
                  ))}
                </div>

                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 group-hover:text-brand-400 transition-colors">
                  <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-text-secondary text-lg mb-6 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-mono">
                      {post.author.name[0]}
                    </div>
                    <span>{post.author.name}</span>
                  </div>
                  <span>·</span>
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span>·</span>
                  <span>{post.readTime} min read</span>
                </div>
              </article>
            ))}
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Post list */}
          <div className="lg:col-span-3">
            {rest.length > 0 ? (
              <>
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6">
                  {activeTag ? `Posts tagged #${activeTag}` : 'All Posts'}
                </p>
                <div className="space-y-6">
                  {rest.map(post => (
                    <article key={post.slug} className="group relative flex gap-6 bg-bg-surface border border-border-muted rounded-lg p-6 hover:border-border-default hover:bg-bg-overlay transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${CATEGORY_COLORS[post.category] ?? ''}`}>
                            {CATEGORY_LABELS[post.category] ?? post.category}
                          </span>
                          {post.tags.slice(0, 4).map(tag => (
                            <TagLink key={tag} tag={tag} active={activeTag === tag} className="relative z-10" />
                          ))}
                        </div>
                        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-brand-400 transition-colors">
                          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
                          <span>{post.author.name}</span>
                          <span>·</span>
                          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                          <span>·</span>
                          <span>{post.readTime} min read</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-bg-surface border border-border-muted rounded-lg p-12 text-center">
                <p className="font-mono text-text-muted text-sm mb-2">
                  // no posts{activeTag ? ` tagged #${activeTag}` : ''}
                </p>
                {activeTag ? (
                  <Link href="/blog" className="font-mono text-sm text-brand-400 hover:text-brand-300 transition-colors">
                    View all posts →
                  </Link>
                ) : (
                  <p className="text-text-secondary">The first post is coming soon.</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {tags.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* "All" pill to clear filter */}
                    <Link
                      href="/blog"
                      className={`font-mono text-xs px-2 py-1 rounded border transition-colors ${
                        !activeTag
                          ? 'bg-brand-500 text-black border-brand-500 font-bold'
                          : 'bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-muted'
                      }`}
                    >
                      All
                    </Link>
                    {tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${tag}`}
                        className={`font-mono text-xs px-2 py-1 rounded border transition-colors ${
                          activeTag === tag
                            ? 'bg-brand-500/15 border-brand-500/40 text-brand-400 font-semibold'
                            : 'bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-muted'
                        }`}
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-bg-surface border border-border-muted rounded-lg p-6">
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
                  Install evnx
                </p>
                <p className="text-sm text-text-secondary mb-4">
                  The CLI that started all of this. Free, open source, MIT.
                </p>
                <div className="bg-terminal-bg rounded p-3 font-mono text-xs text-terminal-text mb-4">
                  <span className="text-brand-500">$ </span>
                  curl -fsSL https://dotenv.space/install.sh | bash
                </div>
                <Link
                  href="/install"
                  className="block text-center text-sm font-mono text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View all install methods →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}