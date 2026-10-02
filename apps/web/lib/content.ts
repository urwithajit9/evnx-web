import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const CONTENT_ROOT = path.join(process.cwd(), 'content')


/** Blog drafts are hidden in production only, so they stay visible in dev. */
function isProd() {
  return process.env.NODE_ENV === 'production'
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Author = {
  id: string
  name: string
  role: string
  avatar: string
  bio: string
  twitter?: string
  github?: string
  website?: string
}

export type BlogCategory =
  | 'tutorial'
  | 'release'
  | 'deep-dive'
  | 'opinion'
  | 'case-study'
  | 'knowledge'



export type BlogPost = {
  slug: string
  title: string
  publishedAt: string
  updatedAt?: string
  excerpt: string
  coverImage?: string
  author: Author
  tags: string[]
  category: BlogCategory
  readTime: number
  featured: boolean
  draft: boolean
  canonical?: string
  relatedSlugs?: string[]
  content: string
}

/**
 * ⚠️ Guides moved to @evnx/docs-content, parsing and all.
 *
 * Re-exported here so every existing `@/lib/content` import keeps working —
 * 20-odd call sites across pages and components — while apps/docs imports the
 * same functions directly. One definition of how a guide becomes a URL.
 */
export {
  GUIDE_SECTIONS,
  getAllGuides,
  getGuide,
  getGuidesBySection,
  getAdjacentGuides,
  GUIDES_DIR,
} from "@evnx/docs-content";
export type { Guide, GuideSection } from "@evnx/docs-content";

export function getAuthor(id: string): Author {
  const filePath = path.join(CONTENT_ROOT, 'authors', `${id}.json`)
  if (!fs.existsSync(filePath)) {
    // Return a placeholder so pages don't crash during development
    return {
      id,
      name: id,
      role: 'Contributor',
      avatar: '/authors/placeholder.jpg',
      bio: '',
    }
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Author
}

export function getAllAuthors(): Author[] {
  const dir = path.join(CONTENT_ROOT, 'authors')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Author)
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

function parseBlogFile(filename: string): BlogPost {
  const slug = filename.replace(/\.mdx?$/, '')
  const filePath = path.join(CONTENT_ROOT, 'blog', filename)
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const { minutes } = readingTime(content)
  return {
    ...data,
    slug,
    content,
    readTime: Math.ceil(minutes),
    author: getAuthor(data.author ?? 'ajit'),
  } as BlogPost
}

export function getAllBlogPosts(): BlogPost[] {
  const dir = path.join(CONTENT_ROOT, 'blog')
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter(f => /\.mdx?$/.test(f))
    .map(parseBlogFile)
    .filter(post => !isProd() || !post.draft)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}

export function getBlogPost(slug: string): BlogPost | null {
  const candidates = [`${slug}.mdx`, `${slug}.md`]
  for (const candidate of candidates) {
    const filePath = path.join(CONTENT_ROOT, 'blog', candidate)
    if (fs.existsSync(filePath)) return parseBlogFile(candidate)
  }
  return null
}

export function getFeaturedBlogPosts(limit = 3): BlogPost[] {
  return getAllBlogPosts()
    .filter(p => p.featured)
    .slice(0, limit)
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getAllBlogPosts().filter(p => p.tags.includes(tag))
}

export function getAllBlogTags(): string[] {
  const tags = new Set<string>()
  getAllBlogPosts().forEach(p => p.tags.forEach(t => tags.add(t)))
  return Array.from(tags).sort()
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  if (post.relatedSlugs?.length) {
    return post.relatedSlugs
      .map(slug => getBlogPost(slug))
      .filter(Boolean) as BlogPost[]
  }
  // Fall back to tag matching
  return getAllBlogPosts()
    .filter(
      p =>
        p.slug !== post.slug &&
        p.tags.some(tag => post.tags.includes(tag))
    )
    .slice(0, limit)
}

// ─── Guides ───────────────────────────────────────────────────────────────────

export type ChangelogEntry = {
  version: string
  releaseDate: string
  type: 'major' | 'minor' | 'patch'
  highlights: string[]
  content: string
}

export function getAllChangelogs(): ChangelogEntry[] {
  const dir = path.join(CONTENT_ROOT, 'changelog')
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter(f => /\.mdx?$/.test(f))
    .map(filename => {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf8')
      const { data, content } = matter(raw)
      return { ...data, content } as ChangelogEntry
    })
    .sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )
}