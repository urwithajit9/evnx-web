import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Guide loading, beside the guides themselves.
 *
 * ⚠️ This lived in `apps/web/lib/content.ts`. It moved here because
 * `apps/docs` needs exactly the same parsing — same frontmatter, same slug
 * derivation, same draft rule — and two copies of "how a guide becomes a URL"
 * is how the two apps start serving subtly different pages during a migration
 * whose entire promise is that only the URL changes.
 *
 * `apps/web/lib/content.ts` re-exports all of this, so nothing in that app
 * changed its imports.
 */

export type GuideSection =
  | 'getting-started'
  | 'commands'
  | 'integrations'
  | 'use-cases'
  | 'reference'

export type Guide = {
  slug: string          // e.g. "getting-started/installation"
  section: GuideSection
  order: number
  title: string
  publishedAt: string
  updatedAt?: string
  excerpt: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeToComplete: string
  tags: string[]
  evnxVersion: string
  prerequisites?: string[]
  draft: boolean
  content: string
}

export const GUIDE_SECTIONS: { key: GuideSection; label: string; description: string }[] = [
  { key: 'getting-started', label: 'Getting Started',  description: 'Install evnx and run your first scan in minutes.' },
  { key: 'commands',        label: 'Commands',          description: 'Deep dive into every evnx command with real examples.' },
  { key: 'integrations',   label: 'Integrations',      description: 'GitHub Actions, pre-commit, Docker, Kubernetes and more.' },
  { key: 'use-cases',      label: 'Use Cases',         description: 'Solve specific problems with step-by-step walkthroughs.' },
  { key: 'reference',      label: 'Reference',         description: 'Complete reference for config, formats, and patterns.' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isProd() {
  return process.env.NODE_ENV === 'production'
}

// ─── Authors ─────────────────────────────────────────────────────────────────

const GUIDES_ROOT = resolveGuidesDir();

function resolveGuidesDir(): string {
  const candidates = [
    path.join(process.cwd(), "node_modules", "@evnx", "docs-content", "guides"),
    path.join(process.cwd(), "..", "..", "packages", "docs-content", "guides"),
    path.join(process.cwd(), "packages", "docs-content", "guides"),
  ];
  for (const dir of candidates) if (fs.existsSync(dir)) return dir;
  throw new Error(
    `@evnx/docs-content: could not locate guides/. Tried:\n  ${candidates.join("\n  ")}`,
  );
}

/** Absolute path to the guides directory. */
export const GUIDES_DIR = GUIDES_ROOT;

function parseGuideFile(section: GuideSection, filename: string): Guide {
  const filePath = path.join(GUIDES_ROOT, section, filename)
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const slug = `${section}/${filename.replace(/\.mdx?$/, '')}`

  // Defaults first, frontmatter overrides, computed fields always win.
  // Cast via unknown: gray-matter returns Record<string, unknown> so TypeScript
  // can't verify that required fields (title, publishedAt, excerpt, draft)
  // are present — they come from MDX frontmatter at runtime.
  return {
    title:          filename.replace(/\.mdx?$/, '').replace(/-/g, ' '),
    publishedAt:    new Date().toISOString().slice(0, 10),
    excerpt:        '',
    draft:          false,
    order:          99,
    difficulty:     'beginner' as const,
    timeToComplete: '5 minutes',
    evnxVersion:    '0.2.0',
    tags:           [] as string[],
    ...data,
    slug,
    section,
    content,
  } as unknown as Guide
}

export function getAllGuides(): Guide[] {
  const sections: GuideSection[] = [
    'getting-started',
    'commands',
    'integrations',
    'use-cases',
    'reference',
  ]
  const guides: Guide[] = []

  for (const section of sections) {
    const sectionDir = path.join(GUIDES_ROOT, section)
    if (!fs.existsSync(sectionDir)) continue

    fs.readdirSync(sectionDir)
      .filter(f => /\.mdx?$/.test(f))
      .forEach(filename => {
        guides.push(parseGuideFile(section, filename))
      })
  }

  return guides
    .filter(g => !isProd() || !g.draft)
    .sort((a, b) => a.order - b.order)
}

export function getGuide(slugParts: string[]): Guide | null {
  if (slugParts.length < 2) return null
  const section = slugParts[0] as GuideSection
  const name = slugParts.slice(1).join('/')

  const candidates = [`${name}.mdx`, `${name}.md`]
  for (const candidate of candidates) {
    const filePath = path.join(GUIDES_ROOT, section, candidate)
    if (fs.existsSync(filePath)) return parseGuideFile(section, candidate)
  }
  return null
}

export function getGuidesBySection(): Record<GuideSection, Guide[]> {
  const all = getAllGuides()
  const result = {} as Record<GuideSection, Guide[]>
  for (const guide of all) {
    if (!result[guide.section]) result[guide.section] = []
    result[guide.section].push(guide)
  }
  return result
}

export function getAdjacentGuides(
  current: Guide
): { prev: Guide | null; next: Guide | null } {
  const sectionGuides = getAllGuides().filter(
    g => g.section === current.section
  )
  const idx = sectionGuides.findIndex(g => g.slug === current.slug)
  return {
    prev: idx > 0 ? sectionGuides[idx - 1] : null,
    next: idx < sectionGuides.length - 1 ? sectionGuides[idx + 1] : null,
  }
}

// ─── Changelog ────────────────────────────────────────────────────────────────
