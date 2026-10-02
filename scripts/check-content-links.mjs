#!/usr/bin/env node
// ─── Validate every internal link in content/ ─────────────────────────────────
//
//   node scripts/check-content-links.mjs
//
// ⚠️ WHY THIS EXISTS. An audit of the built site found 43 dead internal links
// across 22 URLs, every one of them written by hand in MDX and none of them
// detectable without clicking. Three separate causes:
//
//   • `](/commands/scan)` — the `/guides` prefix simply omitted.
//   • `prerequisites: [getting-started/sync-basics]` — copied from the file's
//     own `slug:` frontmatter, which is DEAD. `parseGuideFile` builds the slug
//     from the file path and then overrides frontmatter with it, so 58 of 59
//     guides declare a `slug` that is read by nothing and disagrees with the
//     real URL. Copying it produced a 404 every time.
//   • Links to `draft: true` guides, which do not exist in production.
//
// Fixing them once is worthless if the next guide reintroduces them. This runs
// in CI.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";

const GUIDES = "apps/web/content/guides";
const BLOG = "apps/web/content/blog";

const read = (p) => readFileSync(p, "utf8");
const isMdx = (f) => [".mdx", ".md"].includes(extname(f));
const stem = (f) => basename(f).replace(/\.mdx?$/, "");
const frontmatter = (s) => s.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const isDraft = (s) => /^draft:\s*true\s*$/m.test(frontmatter(s));

// ── The real URL space ───────────────────────────────────────────────────────

const guides = new Map(); // slug → { draft, file }
for (const section of readdirSync(GUIDES)) {
  const dir = join(GUIDES, section);
  if (!existsSync(dir) || !readdirSync(dir).length) continue;
  for (const f of readdirSync(dir).filter(isMdx)) {
    const body = read(join(dir, f));
    guides.set(`${section}/${stem(f)}`, { draft: isDraft(body), file: join(dir, f) });
  }
}

const posts = new Map();
for (const f of readdirSync(BLOG).filter(isMdx)) {
  const body = read(join(BLOG, f));
  posts.set(stem(f), { draft: isDraft(body), file: join(BLOG, f) });
}

const sections = new Set([...guides.keys()].map((s) => s.split("/")[0]));

/** Routes that exist outside the content system. */
const STATIC_ROUTES = new Set([
  "/", "/guides", "/blog", "/pricing", "/install", "/changelog", "/testimonials", "/talks",
]);

/**
 * Links to guides that are intentionally `draft: true`.
 *
 * ⚠️ These are broken on the live site right now, and that is a known,
 * deliberate trade. Both guides document commands that are merged on the
 * CLI's `main` but not yet tagged, so publishing them early would document
 * something a reader cannot run. They go live with 0.8.0.
 *
 * ⚠️ THIS LIST CANNOT ROT. If an entry stops being a draft, the check below
 * FAILS and tells you to delete the line — so un-drafting the guides is what
 * removes the exception, and forgetting to remove it is not silent.
 */
const DRAFT_LINKS_ALLOWED = new Set([
  "reference/getting-your-secrets-out", // `evnx cloud export` — ships in 0.8.0
  "reference/rotating-a-vault-key",     // `evnx vault rekey`   — ships in 0.8.0
]);

// ── Checks ───────────────────────────────────────────────────────────────────

const problems = [];
const note = (file, msg) => problems.push({ file, msg });

function resolveInternal(href) {
  const path = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
  if (STATIC_ROUTES.has(path)) return { ok: true };
  // Static assets under public/ are files, not routes.
  if (/\.[a-z0-9]{2,4}$/i.test(path)) {
    return existsSync(join("apps/web/public", path))
      ? { ok: true }
      : { ok: false, why: "no such file in public/" };
  }
  if (path.startsWith("/guides/")) {
    const slug = path.slice("/guides/".length);
    if (sections.has(slug)) return { ok: true }; // section index
    const g = guides.get(slug);
    if (!g) return { ok: false, why: "no such guide" };
    if (g.draft) {
      return DRAFT_LINKS_ALLOWED.has(slug)
        ? { ok: true }
        : { ok: false, why: "guide is draft: true" };
    }
    return { ok: true };
  }
  if (path.startsWith("/blog/")) {
    const p = posts.get(path.slice("/blog/".length));
    if (!p) return { ok: false, why: "no such post" };
    if (p.draft) return { ok: false, why: "post is draft: true" };
    return { ok: true };
  }
  // ⚠️ `/docs` is a *temporary* redirect to /guides in next.config.js. It
  // resolves today and changes twice (redirect cleanup, then the split), so
  // it is called out rather than accepted.
  if (path === "/docs" || path.startsWith("/docs/"))
    return { ok: false, why: "/docs is a temporary redirect — link the real page" };
  return { ok: false, why: "unknown route" };
}

for (const [, { file }] of [...guides, ...posts]) {
  const body = read(file);
  const rel = file.replace(/^apps\/web\/content\//, "");

  // Markdown links to internal paths.
  for (const m of body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const r = resolveInternal(m[1]);
    if (!r.ok) note(rel, `${m[1]} — ${r.why}`);
  }

  // ⚠️ JSX attributes too. MDX embeds components — <Prerequisite href="…">,
  // <CommandRef href="…"> — and checking only `](…)` missed three dead links
  // that the first pass of this very script reported as clean. A validator
  // that only sees one of two link syntaxes gives false confidence, which is
  // worse than not having run it.
  for (const m of body.matchAll(/\bhref=["'](\/[^"']*)["']/g)) {
    const r = resolveInternal(m[1]);
    if (!r.ok) note(rel, `href="${m[1]}" — ${r.why}`);
  }

  // Prerequisites: bare slugs, not paths.
  const pre = frontmatter(body).match(/^prerequisites:\s*\n((?:[ \t]*-[ \t]*.+\n?)+)/m);
  if (pre) {
    for (const line of pre[1].trim().split("\n")) {
      const slug = line.trim().replace(/^-\s*/, "").replace(/^["']|["']$/g, "");
      const g = guides.get(slug);
      if (!g) note(rel, `prerequisite "${slug}" — no such guide`);
      else if (g.draft) note(rel, `prerequisite "${slug}" — guide is draft: true`);
    }
  }
}

// ── The allowlist must expire ────────────────────────────────────────────────
//
// ⚠️ An exception that outlives its reason is worse than no exception: it
// silently permits exactly the breakage it was carved out for.
for (const slug of DRAFT_LINKS_ALLOWED) {
  const g = guides.get(slug);
  if (!g) {
    note("scripts/check-content-links.mjs", `DRAFT_LINKS_ALLOWED has "${slug}" and no such guide exists — delete the line`);
  } else if (!g.draft) {
    note("scripts/check-content-links.mjs", `"${slug}" is published now — delete it from DRAFT_LINKS_ALLOWED`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

const live = [...guides.values()].filter((g) => !g.draft).length;
console.log(
  `checked ${guides.size} guides (${live} live) and ${posts.size} posts in ${sections.size} sections`,
);

if (problems.length === 0) {
  console.log("✓ every internal link in content/ resolves");
  process.exit(0);
}

const byFile = new Map();
for (const p of problems) byFile.set(p.file, [...(byFile.get(p.file) ?? []), p.msg]);
console.error(`\n✗ ${problems.length} broken internal link(s) in ${byFile.size} file(s):\n`);
for (const [file, msgs] of [...byFile].sort()) {
  console.error(`  ${file}`);
  for (const m of msgs) console.error(`      ${m}`);
}
process.exit(1);
