#!/usr/bin/env node
// ─── Validate every internal link in content/ ─────────────────────────────────
//
//   node scripts/check-content-links.mjs                    the MDX, as written
//   node scripts/check-content-links.mjs --built apps/docs  what a build renders
//   node scripts/check-content-links.mjs --built apps/docs --fragments
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
//
// ⚠️ AND WHY IT IS NOT ENOUGH ON ITS OWN (D-175). The default mode resolves
// `/guides/…` against the guide list — the URL space the MDX is written in. The
// docs app serves the same guides at `/cli/…`, and rendered every `/guides/…`
// link unchanged: 352 hrefs on 63 of 72 pages, each one a 404 on
// docs.evnx.dev, while this check stayed green. A link is only right in the
// app that renders it, so `--built <app>` reads that app's build output and
// checks every `<a href>` against the pages the build actually contains.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname, basename, relative } from "node:path";
import { createRequire } from "node:module";

const requireHere = createRequire(join(process.cwd(), "package.json"));

/** `/guides/:path*` → a RegExp, and the destination it would produce. */
function redirectFor(redirects, path) {
  for (const r of redirects) {
    const names = [];
    const pattern = r.source.replace(/:(\w+)(\*)?/g, (_, name, star) => {
      names.push(name);
      return star ? "(.*)" : "([^/]+)";
    });
    const m = path.match(new RegExp(`^${pattern}$`));
    if (!m) continue;
    let dest = r.destination;
    names.forEach((n, i) => (dest = dest.replace(new RegExp(`:${n}\\*?`), m[i + 1])));
    return dest;
  }
  return null;
}

async function appRedirects(appDir) {
  const config = requireHere(`./${appDir}/next.config.js`);
  return typeof config.redirects === "function" ? await config.redirects() : [];
}

// ── --built <app>: the links a reader actually gets ──────────────────────────

const builtAt = process.argv.indexOf("--built");
if (builtAt !== -1) {
  const appDir = process.argv[builtAt + 1]?.replace(/\/+$/, "");
  const checkFragments = process.argv.includes("--fragments");
  const root = join(appDir ?? "", ".next/server/app");
  if (!appDir || !existsSync(root)) {
    console.error(`no build at ${root} — run that app's \`next build\` first`);
    process.exit(2);
  }

  const walk = (dir) =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
    });

  // Route → HTML, for every page the build prerendered.
  const pages = new Map();
  for (const file of walk(root)) {
    const route = `/${relative(root, file).replace(/\.html$/, "")}`.replace(/\/index$/, "") || "/";
    if (route === "/_not-found" || route === "/_global-error") continue;
    pages.set(route === "/index" ? "/" : route, file);
  }
  // Plus every static route, prerendered or not: `/blog` and `/pricing` render
  // on request and leave no HTML behind. A dynamic route (`/cli/[...slug]`)
  // counts only through the pages it prerendered.
  const manifest = join(appDir, ".next/app-path-routes-manifest.json");
  const routes = new Set(
    existsSync(manifest)
      ? Object.values(JSON.parse(readFileSync(manifest, "utf8"))).filter((r) => !r.includes("["))
      : [],
  );
  const isPage = (path) => pages.has(path) || routes.has(path);

  const redirects = await appRedirects(appDir);
  const problems = [];
  let links = 0;
  for (const [route, file] of pages) {
    const html = readFileSync(file, "utf8");
    // Anchors only: reader-facing links, not <link rel> assets in <head>.
    for (const m of html.matchAll(/<a\s[^>]*?href="(\/(?!\/)[^"]*)"/g)) {
      const href = m[1].replace(/&amp;/g, "&");
      if (href.startsWith("/_next/")) continue;
      links++;
      const [beforeHash, fragment] = href.split("#");
      const path = beforeHash.split("?")[0].replace(/\/$/, "") || "/";
      if (isPage(path)) {
        if (checkFragments && fragment && pages.has(path)) {
          const target = readFileSync(pages.get(path), "utf8");
          if (!target.includes(`id="${fragment}"`)) {
            problems.push(`${route}: ${href} — no element with id "${fragment}"`);
          }
        }
        continue;
      }
      if (/\.[a-z0-9]{2,5}$/i.test(path) && existsSync(join(appDir, "public", path))) continue;
      const dest = redirectFor(redirects, path);
      problems.push(
        dest
          ? `${route}: ${href} — not a page here; reaches ${dest} only through a redirect`
          : `${route}: ${href} — no such page in this build`,
      );
    }
  }

  console.log(`checked ${links} internal link(s) on ${pages.size} built page(s) of ${appDir}`);
  if (problems.length === 0) {
    console.log(`✓ every internal link in ${appDir}'s build reaches a page it serves`);
    process.exit(0);
  }
  console.error(`\n✗ ${problems.length} link(s) in ${appDir}'s build do not reach a page:\n`);
  for (const p of problems.slice(0, 60)) console.error(`  ${p}`);
  if (problems.length > 60) console.error(`  … and ${problems.length - 60} more`);
  process.exit(1);
}

// ⚠️ Guides live in the shared package now; blog stayed in apps/web.
const GUIDES = "packages/docs-content/guides";
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
 * ⚠️ THIS LIST CANNOT ROT. If an entry stops being a draft, the check below
 * FAILS and names the stale line — so un-drafting a guide is what removes its
 * exception, and forgetting to remove it is not silent.
 *
 * ✅ It fired exactly that way on 2026-10-04. v0.8.0 shipped, both entries'
 * guides were un-drafted, and this check went red naming each line — which is
 * how they came to be deleted rather than left behind to quietly permit some
 * future broken link.
 *
 * Empty is the correct steady state. Add an entry only alongside a guide
 * deliberately held back, and expect this check to demand its removal on the
 * day that guide goes live.
 */
const DRAFT_LINKS_ALLOWED = new Set([]);

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
  const rel = file.replace(/^apps\/web\/content\//, "").replace(/^packages\/docs-content\//, "guides/");

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

// ── Every app that renders the guides can resolve their links ────────────────
//
// ⚠️ D-175. apps/docs serves the guides at `/cli/…` and nothing at `/guides`.
// Its page renderer rewrites the author-form links, and `--built apps/docs`
// proves that on a build; this cheap half checks the safety net is still there
// for `/guides` URLs that come from outside, without needing a build.
{
  const redirects = await appRedirects("apps/docs");
  if (redirectFor(redirects, "/guides/commands/scan") !== "/cli/commands/scan") {
    note(
      "apps/docs/next.config.js",
      "no /guides/:path* → /cli/:path* redirect — a /guides link that reaches docs.evnx.dev 404s (D-175)",
    );
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
