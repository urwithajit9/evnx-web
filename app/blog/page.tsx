import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge-status';
import Link from 'next/link';
import { Clock, User } from 'lucide-react';

const featuredPost = {
  title: 'Why I Built evnx',
  excerpt: 'The story of accidentally pushing AWS credentials to GitHub — and the tool I built to prevent it from ever happening again.',
  author: 'Ajit Kumar',
  date: '2026-02-15',
  readTime: 8,
  category: 'Opinion',
  tags: ['security', 'story', 'rust'],
};

const recentPosts = [
  {
    title: 'Getting Started with evnx',
    excerpt: 'A complete walkthrough of installing and running evnx for the first time.',
    author: 'Ajit Kumar',
    date: '2026-03-01',
    readTime: 5,
    category: 'Tutorial',
  },
  {
    title: 'evnx v0.2.0 Released',
    excerpt: 'New features include the add command for CLI variable management and 14+ format support.',
    author: 'Ajit Kumar',
    date: '2026-02-28',
    readTime: 3,
    category: 'Release',
  },
];

export const metadata = {
  title: 'Blog',
  description: 'Stories, tutorials, and updates about evnx and .env management.',
};

export default function BlogPage() {
  return (
    <div>
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Blog & Stories.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl">
            Deep dives, tutorials, and release notes from the evnx community.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base">
          {/* Featured Post */}
          <Link href="/blog/why-i-built-evnx" className="group">
            <div className="mb-16 bg-bg-surface border border-border-muted rounded-lg overflow-hidden hover:border-border-default transition-colors cursor-pointer">
              <div className="bg-gradient-to-br from-bg-overlay to-bg-surface p-8 md:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="brand">{featuredPost.category}</Badge>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 group-hover:text-brand-400 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-lg text-text-secondary mb-6">{featuredPost.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <span>•</span>
                  <span>{featuredPost.date}</span>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Recent Posts */}
          <h2 className="text-3xl font-serif font-bold mb-8">Recent Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {recentPosts.map((post, idx) => (
              <Link key={idx} href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`} className="group">
                <div className="bg-bg-surface border border-border-muted rounded-lg p-6 hover:border-border-default hover:bg-bg-overlay transition-all cursor-pointer h-full">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <Badge variant={post.category === 'Tutorial' ? 'info' : 'brand'}>
                      {post.category}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-brand-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4">{post.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <span>•</span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-mono text-sm font-semibold text-text-muted uppercase mb-6">
              Browse by Category
            </h3>
            <div className="flex flex-wrap gap-3">
              {['All', 'Tutorial', 'Release', 'Deep Dive', 'Opinion'].map(cat => (
                <Button key={cat} variant={cat === 'All' ? 'default' : 'outline'}>
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
