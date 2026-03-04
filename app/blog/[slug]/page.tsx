import { Badge } from '@/components/ui/badge-status';
import { Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Blog Post',
  description: 'Read the latest articles about evnx.',
};

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostProps) {
  const post = {
    title: 'Why I Built evnx',
    slug: params.slug,
    excerpt: 'The story of accidentally pushing AWS credentials to GitHub — and the tool I built to prevent it from ever happening again.',
    author: {
      name: 'Ajit Kumar',
      role: 'Creator, evnx',
      avatar: 'https://avatars.githubusercontent.com/u/12345?v=4',
    },
    date: '2026-02-15',
    readTime: 8,
    category: 'Opinion',
    tags: ['security', 'story', 'rust'],
    content: `
# Why I Built evnx

Three years ago, I made a mistake that changed everything. I accidentally committed AWS credentials to a public GitHub repository.

## The Incident

The key was revoked in minutes. Three services went down. I had to explain the incident to my development lead. That conversation was more painful than any billing alert.

It wasn't malicious. It wasn't negligence. It was a mistake anyone could make.

But here's what bothered me: there was no tool preventing this. No safety net. No way to say "evnx, check this before I push."

## The Solution

I spent the next few months building evnx. A CLI tool that does one thing exceptionally well: keeps your secrets safe.

evnx handles:
- **Secret Scanning** — Detects AWS keys, Stripe secrets, GitHub tokens
- **Validation** — Catches placeholders and weak values
- **Format Conversion** — Works with 14+ targets
- **Cloud Migration** — Syncs to AWS Secrets Manager, Doppler, Infisical
- **Encrypted Backups** — AES-256-GCM protection

## Why This Matters

Secret management is often an afterthought. Developers are shipping code, not thinking about .env files.

evnx changes that. It's fast. It's reliable. It runs in your CI/CD pipeline and catches problems before they become incidents.

## Today

Three years and zero incidents later, evnx is used by hundreds of developers. It's open source. It's free. It's MIT licensed.

If you've been there—if you've made that mistake—evnx is the tool I wish I'd had.

## What's Next

evnx is just getting started. Cloud sync, team collaboration, and web dashboards are coming.

But the core mission remains: stop leaking secrets.

---

*Have you had a secret incident? Share your story in the comments below.*
    `,
  };

  return (
    <div>
      <article className="max-w-4xl mx-auto">
        <div className="container-base section-padding pb-12">
          <Link href="/blog" className="text-text-secondary hover:text-text-primary text-sm mb-8 inline-block">
            ← Back to blog
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="brand">{post.category}</Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-text-secondary">{post.excerpt}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary mb-12 pb-12 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>

        <div className="container-base max-w-3xl">
          <div className="prose prose-invert max-w-none mb-16">
            <div className="text-text-primary leading-relaxed space-y-6 whitespace-pre-line">
              {post.content}
            </div>
          </div>

          <div className="border-t border-border-subtle pt-12 mb-16">
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="neutral">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="bg-bg-surface border border-border-muted rounded-lg p-8">
              <div className="flex gap-6 items-start">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold mb-1">{post.author.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{post.author.role}</p>
                  <p className="text-text-secondary">
                    Creator of evnx. Rust enthusiast. Previously at AWS and Google. When not coding, you'll find me hiking or traveling.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-12">
            <h3 className="font-serif text-2xl font-bold mb-6">More from the blog</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="#" className="group">
                <div className="bg-bg-surface border border-border-muted rounded-lg p-6 hover:border-border-default transition-colors">
                  <Badge variant="brand" className="mb-3">
                    Tutorial
                  </Badge>
                  <h4 className="font-serif text-lg font-bold group-hover:text-brand-400 mb-2">
                    Getting Started with evnx
                  </h4>
                  <p className="text-text-secondary text-sm">
                    A complete walkthrough of installing and running evnx for the first time.
                  </p>
                </div>
              </Link>
              <Link href="#" className="group">
                <div className="bg-bg-surface border border-border-muted rounded-lg p-6 hover:border-border-default transition-colors">
                  <Badge variant="info" className="mb-3">
                    Release
                  </Badge>
                  <h4 className="font-serif text-lg font-bold group-hover:text-brand-400 mb-2">
                    evnx v0.2.0 Released
                  </h4>
                  <p className="text-text-secondary text-sm">
                    New features include the add command for CLI variable management.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </article>

      <section className="section-padding bg-bg-surface border-t border-border-muted mt-24">
        <div className="container-base text-center">
          <h3 className="text-3xl font-serif font-bold mb-4">Ready to secure your .env?</h3>
          <p className="text-text-secondary mb-6 max-w-xl mx-auto">
            Start using evnx today to prevent secrets from being leaked.
          </p>
          <Link href="/install" className="inline-block bg-brand-500 text-black px-6 py-3 rounded font-mono font-semibold hover:bg-brand-400 transition-colors">
            Install evnx
          </Link>
        </div>
      </section>
    </div>
  );
}
