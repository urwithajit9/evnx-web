# evnx-web

The official website for **[evnx](https://github.com/urwithajit9/evnx)** — a Rust-powered CLI for managing `.env` files.

Live at [evnx.dev](https://evnx.dev) · Built with Next.js 15, TypeScript, Tailwind CSS, MDX.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Content Pipeline](#content-pipeline)
  - [Adding a Blog Post](#adding-a-blog-post)
  - [Adding a Guide](#adding-a-guide)
  - [Adding a Changelog Entry](#adding-a-changelog-entry)
  - [Adding an Author](#adding-an-author)
  - [Draft Workflow](#draft-workflow)
- [MDX Component Reference](#mdx-component-reference)
- [Design System](#design-system)
- [Key Architecture Decisions](#key-architecture-decisions)
- [Roadmap](#roadmap)
- [Daily Maintenance](#daily-maintenance)

---

## Project Structure

```
evnx-web/
│
├── app/                          # Next.js 15 App Router
│   ├── (auth)/login/             # Auth scaffold — Clerk, not yet wired
│   ├── (marketing)/              # Route group — shares no extra layout
│   │   ├── page.tsx              # Landing page /
│   │   ├── install/page.tsx      # /install
│   │   ├── pricing/page.tsx      # /pricing (scaffold)
│   │   └── changelog/page.tsx    # /changelog
│   ├── api/
│   │   ├── github-stars/         # Live star count from GitHub API
│   │   └── waitlist/             # Email capture for Pro plan
│   ├── blog/
│   │   ├── page.tsx              # /blog index — reads all MDX
│   │   └── [slug]/page.tsx       # /blog/:slug — renders MDX
│   ├── dashboard/page.tsx        # Protected — scaffold only
│   ├── guides/
│   │   ├── page.tsx              # /guides index — reads all MDX
│   │   └── [...slug]/page.tsx    # /guides/:section/:slug
│   ├── globals.css               # CSS variables + prose styles
│   ├── layout.tsx                # Root layout — fonts, header, footer
│   └── sitemap.ts                # Auto-generated sitemap
│
├── components/
│   ├── layout/
│   │   ├── header.tsx            # Sticky header, mobile nav
│   │   └── footer.tsx            # Footer with nav links
│   ├── marketing/                # Landing page section components
│   │   ├── hero.tsx
│   │   ├── feature-grid.tsx
│   │   ├── install-snippet.tsx
│   │   ├── command-showcase.tsx
│   │   ├── ci-cd-section.tsx
│   │   ├── origin-story.tsx
│   │   └── social-proof.tsx
│   ├── mdx/                      # Components available inside every .mdx file
│   │   ├── mdx-components.tsx    # ← Registry. All MDX components listed here.
│   │   ├── callout.tsx           # <Callout type="warning">
│   │   ├── code-tabs.tsx         # <CodeTabs><Tab label="bash">
│   │   ├── prerequisites.tsx     # <Prerequisites><Prerequisite href>
│   │   ├── version-badge.tsx     # <VersionBadge version="0.2.0" />
│   │   ├── difficulty.tsx        # <Difficulty level="beginner" time="5 min" />
│   │   ├── command-signature.tsx # <CommandSignature>evnx scan [OPTIONS]
│   │   ├── option-table.tsx      # <OptionTable><Option flag="--path">
│   │   ├── file-tree.tsx         # <FileTree>project/\n├── .env
│   │   ├── diff-block.tsx        # <DiffBlock>- OLD\n+ NEW
│   │   ├── step.tsx              # <Step number={1} title="Install">
│   │   ├── terminal-output.tsx   # <TerminalOutput>[INFO] Done
│   │   ├── author-note.tsx       # <AuthorNote>Personal note
│   │   └── command-ref.tsx       # <CommandRef command="evnx scan" />
│   └── ui/                       # shadcn/ui component library
│
├── content/                      # All MDX content — commit this, it's your CMS
│   ├── authors/
│   │   └── ajit.json             # { id, name, role, avatar, bio, github, twitter }
│   ├── blog/
│   │   └── *.mdx                 # Flat — one file per post
│   ├── guides/
│   │   ├── getting-started/      # Installation, Quick Start, Configuration
│   │   ├── commands/             # One file per command (scan, validate, convert…)
│   │   ├── integrations/         # GitHub Actions, GitLab CI, pre-commit, Docker
│   │   ├── use-cases/            # Prevent leaks, Django setup, Next.js, k8s
│   │   └── reference/            # .evnx.toml, output formats, secret patterns
│   └── changelog/
│       └── v*.mdx                # One file per release
│
├── lib/
│   ├── config.ts                 # ← Single source of truth. Version, URLs, constants.
│   ├── content.ts                # MDX file reading, frontmatter parsing, helpers
│   ├── shiki.ts                  # Syntax highlighter singleton
│   ├── search.ts                 # Pagefind integration (Phase 2)
│   └── utils.ts                  # shadcn/ui utilities
│
├── public/
│   ├── authors/                  # Author avatar images (ajit.jpg, etc.)
│   ├── fonts/                    # Self-hosted fonts if needed
│   ├── og/                       # OG image assets
│   └── robots.txt
│
├── packages/                     # Monorepo packages (future)
│   ├── config/                   # Shared ESLint + TypeScript config
│   ├── content/                  # Shared MDX types (future)
│   └── ui/                       # Shared component library (future)
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Future structure (Phase 2–3)

```
app/
├── docs/                         # Full reference docs (when Phase 3 launches)
│   └── [...slug]/page.tsx
└── api/
    ├── og/route.tsx              # Dynamic OG image generation
    └── sync/route.ts             # Cloud sync API (Phase 3)

content/
└── docs/                         # Docs MDX content

packages/
└── ui/                           # Published to npm as @evnx/ui
```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | ISR, RSC, edge-ready |
| Language | TypeScript strict | Catch content schema errors at build time |
| Styling | Tailwind CSS v4 | Design tokens via CSS variables |
| Content | `next-mdx-remote` + `gray-matter` | No build plugins, works cleanly with App Router RSC |
| Syntax | Shiki | VS Code-quality highlighting, server-side only |
| Fonts | IBM Plex Mono + Fraunces (next/font) | No FOUT, subset, preloaded |
| Deployment | Netlify (configured) / Vercel-ready | `netlify.toml` present |
| Search | Pagefind (Phase 2) | Static, zero-server, build-time indexed |
| Auth | Clerk scaffold (Phase 3) | Not yet wired |
| DB | Neon/Planetscale schema (Phase 3) | Not yet wired |

---

## Getting Started

```bash
# Clone
git clone https://github.com/urwithajit9/evnx-web
cd evnx-web

# Install dependencies
pnpm install

# Install content pipeline deps (if not already in package.json)
pnpm add next-mdx-remote gray-matter reading-time shiki
pnpm add rehype-slug rehype-autolink-headings remark-gfm

# Start dev server
pnpm dev
```

Visit `http://localhost:3000`.

---

## Content Pipeline

All content lives in `content/`. There is no CMS, no database, no admin UI. **MDX files are the CMS.** The pipeline is:

```
content/*.mdx
    ↓ gray-matter (frontmatter parsing)
    ↓ reading-time (auto read time)
    ↓ next-mdx-remote/rsc (MDX → React, server-side)
    ↓ Shiki (syntax highlighting, server-side)
    ↓ mdx-components.tsx (custom component injection)
    → Rendered page (statically generated)
```

`lib/content.ts` is the single file that reads, parses, sorts, and filters all content. **You never need to touch route files when adding content.**

---

### Adding a Blog Post

1. Create `content/blog/your-post-slug.mdx`

2. Add frontmatter at the top:

```mdx
---
title: "Your Post Title"
slug: your-post-slug
publishedAt: "2024-04-15"
excerpt: "One or two sentence summary shown in cards and OG images."
author: ajit
tags: ["security", "rust", "devops"]
category: tutorial
featured: false
draft: true
---

Your content here. All MDX components are available without importing.
```

3. Set `draft: false` when ready to publish.

4. That's it. The post appears at `/blog/your-post-slug`.

**Frontmatter fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Shown in page, OG image, cards |
| `slug` | string | ✅ | Must match filename |
| `publishedAt` | ISO 8601 | ✅ | `"2024-04-15"` |
| `excerpt` | string | ✅ | 1–2 sentences. Shown in cards |
| `author` | string | ✅ | ID from `content/authors/` |
| `tags` | string[] | ✅ | Lowercase, hyphenated |
| `category` | enum | ✅ | `tutorial \| release \| deep-dive \| opinion \| case-study` |
| `featured` | bool | ✅ | Shows in hero row on `/blog` |
| `draft` | bool | ✅ | `true` = hidden in prod |
| `updatedAt` | ISO 8601 | — | Shows "Updated" date |
| `coverImage` | string | — | Path to image in `/public/` |
| `relatedSlugs` | string[] | — | Manual related posts |
| `canonical` | URL | — | If cross-posted |

---

### Adding a Guide

1. Pick the right section:
   - `getting-started/` — Installation, first use, configuration
   - `commands/` — One file per evnx command
   - `integrations/` — GitHub Actions, Docker, pre-commit, etc.
   - `use-cases/` — "How do I solve X with evnx?"
   - `reference/` — Config file, formats list, pattern reference

2. Create `content/guides/[section]/your-guide-slug.mdx`

3. Add frontmatter:

```mdx
---
title: "Guide Title"
slug: your-guide-slug
section: commands
order: 5
publishedAt: "2024-04-15"
excerpt: "What this guide covers in one sentence."
difficulty: beginner
timeToComplete: "10 minutes"
tags: ["scan", "secrets", "ci-cd"]
evnxVersion: "0.2.0"
prerequisites:
  - getting-started/installation
draft: true
---
```

4. Set `draft: false` when ready.

5. The guide appears in the sidebar, section card, and "Start Here" strip automatically.

**The `order` field** controls position within its section. Set `order: 1` for the first guide, `order: 2` for the second, and so on. Gaps are fine — `order: 10, 20, 30` leaves room to insert later.

**Frontmatter fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | |
| `slug` | string | ✅ | Must match filename |
| `section` | enum | ✅ | `getting-started \| commands \| integrations \| use-cases \| reference` |
| `order` | number | ✅ | Position within section |
| `publishedAt` | ISO 8601 | ✅ | |
| `excerpt` | string | ✅ | |
| `difficulty` | enum | ✅ | `beginner \| intermediate \| advanced` |
| `timeToComplete` | string | ✅ | e.g. `"5 minutes"` |
| `evnxVersion` | string | ✅ | Minimum version required |
| `tags` | string[] | ✅ | |
| `draft` | bool | ✅ | |
| `prerequisites` | string[] | — | Array of guide slugs |
| `updatedAt` | ISO 8601 | — | |

---

### Adding a Changelog Entry

1. Create `content/changelog/v0.3.0.mdx`

2. Frontmatter:

```mdx
---
version: "0.3.0"
releaseDate: "2024-05-01"
type: minor
highlights:
  - "Cloud sync across machines"
  - "New `evnx push` command"
  - "Doppler integration"
---

## What's new in v0.3.0

Full release notes here...
```

3. **Also update `lib/config.ts`:**

```ts
export const EVNX_VERSION = '0.3.0'  // ← bump this
```

This is the single place that drives the version badge in the header, footer, install instructions, and all guides.

---

### Adding an Author

1. Create `content/authors/[id].json`:

```json
{
  "id": "jane",
  "name": "Jane Smith",
  "role": "Security Engineer",
  "avatar": "/authors/jane.jpg",
  "bio": "Jane writes about secrets management and zero-trust infrastructure.",
  "github": "janesmith",
  "twitter": "janesmith",
  "website": "https://janesmith.dev"
}
```

2. Add their avatar to `public/authors/jane.jpg` (any JPEG, ideally 200×200px).

3. Use `author: jane` in any blog post frontmatter.

---

### Draft Workflow

```
draft: true   → visible in `pnpm dev`, hidden in `pnpm build` / production
draft: false  → live on site
```

This means you can:
- Commit work-in-progress to `main` without it going live
- Preview drafts locally at any time
- No branch gymnastics needed for content

**Important:** `draft` is filtered in `lib/content.ts`:
```ts
.filter(post => process.env.NODE_ENV === 'development' || !post.draft)
```

---

## MDX Component Reference

All components below are available in every `.mdx` file without importing:

### Callout

```mdx
<Callout type="info" title="Pro tip">Content here.</Callout>
<Callout type="warning">Watch out for this.</Callout>
<Callout type="danger" title="Never do this">Don't commit .env.</Callout>
<Callout type="tip" title="New in v0.2.0">The add command is here.</Callout>
```

### Prerequisites

```mdx
<Prerequisites>
  <Prerequisite href="/guides/getting-started/installation">Install evnx</Prerequisite>
  <Prerequisite href="/guides/commands/scan">Understand scan output</Prerequisite>
</Prerequisites>
```

### Code with filename (fenced code blocks)

````mdx
```yaml filename=".github/workflows/scan.yml"
name: Scan
on: [push]
```
````

### Step

```mdx
<Step number={1} title="Install evnx">
  Run the install script...
</Step>
```

### VersionBadge

```mdx
<VersionBadge version="0.2.0" />
```

### Difficulty

```mdx
<Difficulty level="beginner" time="5 minutes" />
```

### CommandSignature

```mdx
<CommandSignature>
  evnx scan [OPTIONS]
  evnx scan --path DIR --format FORMAT --exit-zero
</CommandSignature>
```

### OptionTable

```mdx
<OptionTable>
  <Option flag="--path"   type="string" default=".">Directory to scan</Option>
  <Option flag="--format" type="enum"   options="pretty,json,sarif">Output format</Option>
</OptionTable>
```

### FileTree

```mdx
<FileTree>
project/
├── .env
├── .env.example
└── .evnx.toml
</FileTree>
```

### DiffBlock

```mdx
<DiffBlock>
- OLD_DATABASE_URL=postgres://localhost
+ DATABASE_URL=postgres://prod-server
</DiffBlock>
```

---

## Design System

### Color palette

All colors are CSS variables in `app/globals.css` and mapped to Tailwind in `tailwind.config.ts`. **Never hardcode hex values** — always use the token names.

```
bg-void / bg-base / bg-surface / bg-overlay  — backgrounds (darkest to lightest)
border-subtle / border-muted / border-default — borders (lightest to most visible)
text-primary / text-secondary / text-muted    — text (most to least prominent)
brand-300 / brand-400 / brand-500             — Rust Orange accent
success / warning / danger / info             — semantic colors
terminal-bg / terminal-text / terminal-prompt — terminal window colors
```

### Typography rule

- **All body text, UI, labels, code:** `font-mono` (IBM Plex Mono)
- **Headings, display, hero text:** `font-serif` (Fraunces)
- This is intentional. The fully monospace body creates terminal ethos.

### Component naming

- `components/ui/` — base primitives (shadcn/ui + custom)
- `components/mdx/` — components for MDX content only
- `components/marketing/` — landing page sections
- `components/layout/` — header, footer, sidebar

---

## Key Architecture Decisions

### Why `next-mdx-remote` over Contentlayer2

Contentlayer2 (Contentlayer's community fork) has no stable Next.js 15 App Router support as of 2024. `next-mdx-remote/rsc` runs entirely server-side in RSC — no client bundle cost, no build plugins, deterministic output.

### Why `lib/content.ts` reads from the filesystem directly

No database, no CMS API, no build-time codegen step. `content.ts` reads `.mdx` files at request time (cached by Next.js ISR). This means:
- Zero dependencies on external services
- Content is always in sync with the repo
- Works in any deployment environment
- Deploy = git push

### Why a single `lib/config.ts`

The evnx version number appears in: the header badge, footer, install commands, guide frontmatter hints, OG images, and the changelog. A single constant in `config.ts` means bumping a version requires changing exactly one line.

### Why all pages are server components

Blog and guide pages use `MDXRemote` from `next-mdx-remote/rsc`, which is a server component. This means:
- Syntax highlighting runs server-side (Shiki)
- Zero JS shipped for static content
- Pages are statically generated at build time

The only client components are the landing page (install tab state, incident animation) and the header (mobile menu).

### Why content is committed to the repo (not a headless CMS)

For a developer tool site maintained by one or two people, a headless CMS adds deployment coupling, API costs, and a separate edit/preview workflow. Git is the CMS. PRs are the review workflow. The `draft: true` flag is the staging environment.

---

## Roadmap

### Phase 1 — Complete ✅
- [x] Design system + all CSS variables
- [x] Landing page (hero, origin story, features, install, commands, CI/CD, CTA)
- [x] Blog index + post template with MDX rendering
- [x] Guides index + guide template with section sidebar + prev/next
- [x] Content pipeline (`lib/content.ts`)
- [x] Syntax highlighting (`lib/shiki.ts`)
- [x] Author system (`content/authors/`)
- [x] Origin story blog post
- [x] Installation guide
- [x] Quick start guide
- [x] scan command guide
- [x] GitHub Actions integration guide
- [x] Prevent secret leaks use-case guide
- [x] `.evnx.toml` reference guide
- [x] Header + footer

### Phase 2 — Growth
- [ ] Pagefind search (Cmd+K modal, zero-server)
- [ ] Giscus comments on blog posts and guides
- [ ] Newsletter signup via Resend
- [ ] Pricing page + waitlist form (Resend audience)
- [ ] Dynamic OG image generation (`app/api/og/route.tsx`)
- [ ] GitHub stars live counter (`app/api/github-stars/route.ts`)
- [ ] All remaining command guides (validate, convert, add, diff, sync, migrate, doctor, backup)
- [ ] All remaining integration guides (GitLab CI, pre-commit, Docker, Kubernetes)
- [ ] More use-case guides (Django, Next.js, env-to-kubernetes)

### Phase 3 — Cloud
- [ ] Auth via Clerk (`/login`)
- [ ] Dashboard scaffold (projects, secrets, team, audit log)
- [ ] Cloud sync API routes
- [ ] Team management UI
- [ ] Billing integration (Stripe)
- [ ] `/docs` full reference section

---

## Daily Maintenance

### New evnx release (e.g. v0.3.0)

1. Update `lib/config.ts`: `export const EVNX_VERSION = '0.3.0'`
2. Create `content/changelog/v0.3.0.mdx`
3. Update any guides that reference the old version in frontmatter `evnxVersion`
4. Commit + push — site rebuilds automatically

### New blog post

1. Create `content/blog/[slug].mdx` with `draft: true`
2. Write and preview locally (`pnpm dev`)
3. Change to `draft: false` in the same commit as publishing
4. Push — post is live

### New guide

1. Create `content/guides/[section]/[slug].mdx`
2. Set `order:` to position it in the sidebar
3. Set `draft: true` while writing
4. Set `draft: false` to publish

### Dependency updates

```bash
pnpm update             # minor updates
pnpm update --latest    # major updates (review changelog)
```

Critical deps to watch:
- `next` — major versions can change App Router APIs
- `next-mdx-remote` — RSC API changes with Next.js versions
- `shiki` — breaking changes in v1.x+ API
- `tailwindcss` — v4 is a significant rewrite if upgrading from v3

### Checking for broken links

```bash
pnpm build 2>&1 | grep -i "warning\|error"
# Build-time broken imports and missing MDX references surface here
```