# evnx-web

The website and documentation for **[evnx](https://github.com/urwithajit9/evnx)** — a Rust CLI for `.env` security, plus the evnx cloud for zero-knowledge secret sync.

Live at [evnx.dev](https://evnx.dev) · pnpm + Turborepo monorepo · Next.js 16, React 19, TypeScript, Tailwind CSS 3, MDX.

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-evnx--action-blue?logo=github)](https://github.com/marketplace/actions/evnx-env-security-validation)

---

## Table of Contents

- [Where things live](#where-things-live)
- [Repository layout](#repository-layout)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Generated files — never edit by hand](#generated-files--never-edit-by-hand)
- [Content](#content)
- [Releasing a new evnx version](#releasing-a-new-evnx-version)
- [Checks and CI](#checks-and-ci)
- [Design system](#design-system)
- [Status and roadmap](#status-and-roadmap)

---

## Where things live

| Host | What | Source |
|---|---|---|
| `evnx.dev` | Marketing site, blog, guides (for now), changelog, pricing | `apps/web` (this repo) |
| `docs.evnx.dev` | CLI documentation at `/cli/*` — **migration in progress** | `apps/docs` (this repo) |
| `pay.evnx.dev` | One static page that loads Paddle.js for checkout | `pay/` (this repo, Cloudflare) |
| `app.evnx.dev` | Cloud web app (vaults, orgs, billing) | separate `evnx-app` repo |
| `api.evnx.dev` | evnx cloud API | separate `evnx-server` repo |

⚠️ The guides are served by `apps/web` at `/guides/*` today. `NEXT_PUBLIC_DOCS_MODE=split` repoints every docs link to `docs.evnx.dev/cli/*`; flip it only once docs.evnx.dev answers for every URL in [`docs/migration/url-inventory.csv`](docs/migration/README.md).

⚠️ Origin boundaries are deliberate (ADR-1): marketing analytics run on `evnx.dev` only, never on `app.evnx.dev` (master keys live there in a Web Worker), and `pay.evnx.dev` holds no session, cookie or analytics. Read [`pay/README.md`](pay/README.md) before adding anything to either.

---

## Repository layout

```
evnx-web/
├── apps/
│   ├── web/                    # evnx.dev — @evnx/web
│   │   ├── app/
│   │   │   ├── (marketing)/    # /, /install, /pricing, /changelog, /talks,
│   │   │   │                   # /security, /privacy, /terms, /refunds
│   │   │   ├── blog/           # /blog, /blog/[slug]
│   │   │   ├── guides/         # /guides, /guides/[...slug]  (from @evnx/docs-content)
│   │   │   ├── testimonials/   # /testimonials + submission form
│   │   │   ├── api/            # github-stars, testimonials, waitlist
│   │   │   └── sitemap.ts
│   │   ├── components/
│   │   │   ├── sections/       # Landing-page sections (copy comes from @evnx/content)
│   │   │   ├── layout/         # Header, footer
│   │   │   └── ui/             # shadcn/ui primitives + site components
│   │   ├── content/
│   │   │   ├── blog/*.mdx      # Blog posts
│   │   │   ├── authors/*.json  # Blog authors
│   │   │   └── changelog.json  # GENERATED — see below
│   │   └── lib/                # content loading, Supabase, search; config.ts is a
│   │                           # compatibility shim over @evnx/config (no new code)
│   └── docs/                   # docs.evnx.dev — @evnx/docs
│       └── app/                # /, /cli, /cli/[...slug], OG image route
├── packages/
│   ├── config/                 # @evnx/config — facts that must be TRUE:
│   │                           #   hosts, versions, plans, prices, feature flags
│   ├── content/                # @evnx/content — words that must be GOOD:
│   │                           #   every string on the marketing site
│   ├── docs-content/           # @evnx/docs-content — the CLI guides (MDX) and
│   │   ├── guides/             #   the generated command index
│   │   │   ├── getting-started/
│   │   │   ├── commands/       # one page per top-level evnx command
│   │   │   ├── integrations/
│   │   │   ├── use-cases/
│   │   │   └── reference/
│   │   └── src/                # guide loader, command-index.json (GENERATED)
│   └── mdx/                    # @evnx/mdx — MDX components shared by both apps
├── pay/                        # pay.evnx.dev (static, Cloudflare via wrangler)
├── scripts/                    # sync + check scripts (see below)
├── docs/migration/             # URL inventory and baseline for the docs split
└── .github/workflows/ci.yml
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm 9 workspaces + Turborepo |
| Framework | Next.js 16 (App Router, React Server Components), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + shadcn/ui, design tokens as CSS variables |
| Content | MDX via `next-mdx-remote` + `gray-matter`, highlighting with Shiki |
| Search | Pagefind, built after `next build` in both apps |
| Data | Supabase — testimonials, waitlist, helpful-votes (all optional) |
| Analytics | Self-hosted Umami, proxied through `/stats` — `evnx.dev` only |
| Billing | Paddle, via `pay.evnx.dev`; `NEXT_PUBLIC_BILLING_LIVE` gates self-serve checkout |
| Hosting | Vercel (`evnx.dev`), Cloudflare (`pay.evnx.dev`) |

---

## Getting started

```bash
git clone https://github.com/urwithajit9/evnx-web
cd evnx-web
pnpm install

cp apps/web/.env.example apps/web/.env.local   # optional — everything in it is optional

pnpm dev                      # both apps via turbo
pnpm --filter @evnx/web dev   # just evnx.dev  → http://localhost:3000
pnpm --filter @evnx/docs dev  # just docs
```

Node 20+ and pnpm 9 are required (`packageManager` pins the exact pnpm).

The site builds and runs with **no** environment variables set. `apps/web/.env.example` documents each one; the important ones:

| Variable | Effect when unset |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Testimonials, waitlist and votes are disabled |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, bypasses RLS. **Never** give it a `NEXT_PUBLIC_` prefix |
| `NEXT_PUBLIC_DOCS_MODE` | `inline` — guides served from `evnx.dev/guides/*` |
| `NEXT_PUBLIC_BILLING_LIVE` | Paid plans go through "talk to us" rather than checkout |
| `NEXT_PUBLIC_TESTIMONIALS_ENABLED` | Testimonials aren't promoted in nav/footer/sitemap (page still reachable) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Analytics off |
| `GITHUB_TOKEN` | Star counter uses unauthenticated GitHub API (60 req/hour) |

Several scripts compare the docs against the CLI binary. They expect a sibling clone of the CLI built with every feature:

```bash
cd .. && git clone https://github.com/urwithajit9/evnx
cd evnx && cargo build --release --all-features
```

Without it those scripts skip rather than fail. See [`scripts/README-cli-surface.md`](scripts/README-cli-surface.md).

---

## Generated files — never edit by hand

Every list of "what the CLI does" in this repo is derived from the CLI itself. Hand-kept lists drifted five times before this rule existed, and `/changelog` sat at v0.4.0 for 26 releases.

| File | Generated from | Refresh | CI check |
|---|---|---|---|
| `packages/config/src/versions.json` | crates.io, npm, PyPI | `pnpm config:sync` | `pnpm config:check` |
| `packages/config/src/plan-limits.json` | `api.evnx.dev` | `pnpm config:sync` | `pnpm config:check` |
| `packages/docs-content/src/command-index.json` | the CLI binary's clap tree | `pnpm cli:index` | `pnpm cli:index:check` |
| `commands:` in each guide's frontmatter | the `evnx …` invocations on that page | `pnpm guide:commands` | `pnpm guide:commands:check` |
| `apps/web/content/changelog.json` | the CLI's `CHANGELOG.md` | `pnpm changelog:sync` | `pnpm changelog:check` |

The sync scripts never overwrite good data with a failed fetch: if a source is unreachable, the committed file stays as it is and the script says so.

---

## Content

All content is MDX in the repo; git is the CMS and PRs are the review workflow.

### Blog post — `apps/web/content/blog/<slug>.mdx`

The slug is the filename.

```mdx
---
title: "Your Post Title"
publishedAt: "2026-10-23"
excerpt: "One or two sentences, shown in cards and OG images."
author: ajit              # an id from apps/web/content/authors/
tags: ["security", "rust"]
category: tutorial        # tutorial | release | deep-dive | opinion | case-study
featured: false
draft: true
---
```

Optional: `updatedAt`, `coverImage`, `relatedSlugs`, `canonical`. Add an author with `apps/web/content/authors/<id>.json` and an avatar in `apps/web/public/authors/`.

### Guide — `packages/docs-content/guides/<section>/<slug>.mdx`

Sections: `getting-started`, `commands`, `integrations`, `use-cases`, `reference`. Each top-level CLI command has exactly one page in `commands/`; `pnpm cli:index:check` fails if a guide documents a command that doesn't exist, and warns on a command without a guide.

```mdx
---
title: "evnx vault"
section: commands
order: 8                  # position in the sidebar; gaps are fine
publishedAt: "2026-09-16"
excerpt: "What this guide covers in one sentence."
difficulty: intermediate  # beginner | intermediate | advanced
timeToComplete: "10 minutes"
tags: ["cloud", "vault"]
evnxVersion: "0.10.18"    # the CLI release this page was last checked against
prerequisites:
  - commands/auth
draft: true
---
```

Don't write `commands:` by hand — run `pnpm guide:commands`. Every `evnx …` invocation in a guide must resolve against the binary (`pnpm cli:check`); a deliberate mention of a removed flag goes in `scripts/cli-invocations-baseline.json` with a reason.

### Drafts

`draft: true` is visible in `pnpm dev` and excluded from production builds, so work in progress can land on `main`.

### MDX components

Available in every `.mdx` file without importing, from `packages/mdx`: `Callout`, `CodeTabs`/`Tab`, `Prerequisites`/`Prerequisite`, `Step`, `VersionBadge`, `Difficulty`, `CommandSignature`, `OptionTable`/`Option`, `CommandRef`, `FileTree`, `DiffBlock`, `TerminalOutput`, `Figure`, `ExternalBadge`, plus fenced code blocks with `filename="…"`. `AuthorNote` is blog-only (`apps/web/components/mdx`).

```mdx
<Callout type="warning" title="Before you rotate">Text.</Callout>

<OptionTable>
  <Option flag="--path" type="string" default=".">Directory to scan</Option>
</OptionTable>
```

### Marketing copy

Every word on the landing page lives in `packages/content/src/en/*.ts`; section order is `sections.ts`. Edit copy there, not in components.

---

## Releasing a new evnx version

CI fails on every PR after a CLI release until steps 1–3 land, because it checks
`versions.json` and the command index against `@evnx/cli@latest`.

1. Get the **release** binary, not a local build: download the release archive and its
   `.sha256`, run `sha256sum -c`, and point `EVNX_BIN` at it. A stale `evnx` earlier on
   `PATH` is common; check `type -a evnx`.
2. `EVNX_API_URL=http://127.0.0.1:9 pnpm config:sync` — picks up the new version from the
   registries (`versions.json`). The URL keeps it from calling the production API.
3. `pnpm changelog:sync`, `pnpm cli:index` and `pnpm guide:commands`, then commit the
   generated files on their own: `chore: evnx X.Y.Z — versions.json and command index`.
4. `pnpm cli:diff vX.Y.Z` — what the release changed and which guides it touches. Update
   those guides from **real runs** of the release binary (cloud commands against a local
   evnx-server, never `api.evnx.dev`), and raise `evnxVersion` only on a page whose examples
   you re-ran on that release.
5. `pnpm cli:check`, `pnpm guide:commands:check` and `pnpm check:links`, all with
   `EVNX_BIN` set, then commit and push.

`/changelog` shows each release's summary and highlights. Releases up to v0.4.0 use hand-written highlights (`CURATED` in `apps/web/app/(marketing)/changelog/page.tsx`); never add later releases there.

---

## Checks and CI

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm check:links                 # links in the MDX as written
pnpm check:links:built           # links in the built docs app
pnpm config:check
pnpm cli:index:check
pnpm guide:commands:check
pnpm changelog:check
pnpm verify:redirects            # docs-split redirects
```

`.github/workflows/ci.yml` runs typecheck, content links, the command-index and guide-commands checks against the latest released CLI, a built-links check for `apps/docs`, and the config and changelog drift checks. Drift checks fail only when a source was reachable and disagreed; an unreachable registry or GitHub is a warning.

---

## Design system

Colors are CSS variables in each app's `globals.css`, mapped in `tailwind.config.ts`. Use token names; never hard-code hex values.

```
bg-void / bg-base / bg-surface / bg-overlay   backgrounds, darkest → lightest
border-subtle / border-muted / border-default borders
text-primary / text-secondary / text-muted    text
brand-300 / brand-400 / brand-500             Rust-orange accent
success / warning / danger / info             semantic
terminal-bg / terminal-text / terminal-prompt terminal windows
```

Typography: body, UI and code in `font-mono` (IBM Plex Mono); headings and display in `font-serif` (Fraunces). The monospace body is intentional.

---

## Status and roadmap

**Done**
- Marketing site, blog (21 posts), install, pricing, talks, security and legal pages
- Guides for all 20 top-level CLI commands, plus getting-started, integrations, use-cases and reference (65 pages)
- Generated command index, guide commands, versions and changelog, each with a CI drift check
- Pagefind search, GitHub star counter, testimonials and waitlist (Supabase), Umami analytics
- `apps/docs` with OG images and `/cli` routes; Paddle checkout page

**In progress**
- Docs split: move guides to `docs.evnx.dev/cli/*` (schedule P3), then flip `NEXT_PUBLIC_DOCS_MODE=split`
- Serve `/install.sh` from `evnx.dev` (schedule P5), then flip `NEXT_PUBLIC_INSTALL_HOST`
- Retire `apps/web/lib/config.ts` as its last consumers move to `@evnx/config`

**Not started**
- Integration guides for GitLab CI, pre-commit/prek, Docker and Kubernetes (covered in the CLI README and a blog post, not yet as guides)
- Giscus comments
- Newsletter
