#!/usr/bin/env node
// ─── URL inventory and pre-migration baseline ─────────────────────────────────
//
//   node scripts/crawl-inventory.mjs            crawl live, write inventory + baseline
//   node scripts/crawl-inventory.mjs --offline  enumerate from the build only
//   node scripts/crawl-inventory.mjs --compare docs/migration/baseline/<file>.json
//
// ⚠️ THIS IS THE BEFORE-PICTURE. Once a single URL moves there is no way back
// to it, and the migration's effect becomes unmeasurable forever. Schedule A1.
//
// ⚠️ The live sitemap is NOT the source of truth and must not be used as one.
// `app/sitemap.ts` is a hand-written list of five URLs; the site has eighty-
// five. Enumerating from it would silently omit every guide and every blog
// post — which is to say, everything the migration actually moves.
//
// The source of truth is the build output: `.next/server/app/**/*.html` is
// exactly the set of pages the server will serve. Run `next build` first.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const BUILD_DIR = ".next/server/app";
const OUT_DIR = "docs/migration";
const ORIGIN = process.env.CRAWL_ORIGIN ?? "https://www.evnx.dev";
const CONCURRENCY = 4;
const DELAY_MS = 120;

const offline = process.argv.includes("--offline");
const compareIdx = process.argv.indexOf("--compare");
const compareTo = compareIdx > -1 ? process.argv[compareIdx + 1] : null;

// ─── Enumerate from the build ─────────────────────────────────────────────────

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

// Next.js internals that are emitted as HTML but are not addressable pages.
// ⚠️ `/_not-found` returning 404 is CORRECT, and leaving it in makes the
// "broken URLs" count read as 2 forever — a permanently-red check is a check
// people stop reading.
const INTERNAL = new Set(["/_not-found", "/_global-error", "/favicon.ico"]);

function pathToUrl(file) {
  let p = "/" + relative(BUILD_DIR, file).replace(/\.html$/, "");
  if (p === "/index") p = "/";
  // Route-group segments like `(marketing)` are build-time only and never
  // appear in a URL. Next encodes them in the output path.
  p = p.replace(/\/\([^)]*\)/g, "").replace(/\/!\w[\w=]*/g, "");
  return p === "" ? "/" : p;
}

/** Which part of the site a URL belongs to — this is what the split moves. */
function classify(url) {
  if (url === "/") return "home";
  if (url.startsWith("/guides")) return "docs"; // → docs.evnx.dev/cli/*
  if (url.startsWith("/blog")) return "blog"; // stays on evnx.dev
  if (["/login", "/dashboard"].includes(url)) return "dead-scaffold";
  return "marketing";
}

/** The URL this page should have after the split. "" = unchanged. */
function destination(url, kind) {
  if (kind !== "docs") return "";
  const slug = url.replace(/^\/guides\/?/, "");
  return slug ? `https://docs.evnx.dev/cli/${slug}` : "https://docs.evnx.dev/";
}

// ─── Live probe ───────────────────────────────────────────────────────────────

const pick = (html, re) => (html.match(re)?.[1] ?? "").trim().replace(/\s+/g, " ");

async function probe(url) {
  const target = ORIGIN + url;
  try {
    const res = await fetch(target, { redirect: "follow" });
    const html = res.headers.get("content-type")?.includes("text/html")
      ? await res.text()
      : "";
    const body = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
    return {
      status: res.status,
      // ⚠️ A redirect here is a URL whose equity is already being split. The
      // apex 307s to www, and `app/sitemap.ts` lists the apex — so every URL
      // Google is told about is one hop from where the content lives.
      redirected: res.redirected,
      finalUrl: res.url,
      title: pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      canonical: pick(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i),
      // ⚠️ Strip inner markup. A multi-span hero h1 otherwise records as a
      // wall of Tailwind classes, which is useless for diffing — the whole
      // point is to notice when the *words* change.
      h1: pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160),
      words: body.split(/\s+/).filter(Boolean).length,
    };
  } catch (err) {
    return { status: 0, error: err.message, redirected: false, finalUrl: "", title: "", canonical: "", h1: "", words: 0 };
  }
}

async function probeAll(urls) {
  const out = new Map();
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const u = queue.shift();
        out.set(u, await probe(u));
        process.stdout.write(".");
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }),
  );
  process.stdout.write("\n");
  return out;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

if (compareTo) {
  // ⚠️ The whole point of a baseline. Run this again after the migration and
  // it names exactly which URLs lost their page, their title or their content.
  const before = JSON.parse(readFileSync(compareTo, "utf8"));
  const urls = before.pages.map((p) => p.url);
  console.log(`comparing ${urls.length} URLs against ${compareTo}`);
  const now = await probeAll(urls);
  let broken = 0, changed = 0;
  for (const p of before.pages) {
    const n = now.get(p.url);
    if (!n) continue;
    if (n.status >= 400 || n.status === 0) { console.log(`✗ ${p.url} → ${n.status || n.error}`); broken++; }
    else if (p.words > 50 && n.words < p.words * 0.5) { console.log(`⚠ ${p.url} lost ${p.words - n.words} words`); changed++; }
    else if (p.title && n.title !== p.title) { console.log(`⚠ ${p.url} title changed`); changed++; }
  }
  console.log(`\n${broken} broken, ${changed} changed, ${before.pages.length - broken - changed} intact`);
  process.exit(broken > 0 ? 1 : 0);
}

if (!existsSync(BUILD_DIR)) {
  console.error(`✗ ${BUILD_DIR} not found — run \`npx next build\` first.`);
  console.error("  Enumerating from the live sitemap is NOT a substitute: it lists 5 of 85 URLs.");
  process.exit(1);
}

// ⚠️ The `.html` walk alone is NOT complete. A DYNAMIC route (`ƒ` in the build
// output) is server-rendered on demand and emits no HTML file, so walking the
// build silently omits it — `/blog` was missing on the first run, and a URL
// absent from the inventory is a URL the migration never redirects.
//
// So: union the concrete slugs from the walk with the non-parameterised routes
// the manifest declares.
const fromBuild = (await walk(BUILD_DIR)).map(pathToUrl);

const MANIFEST = ".next/app-path-routes-manifest.json";
const fromManifest = existsSync(MANIFEST)
  ? Object.values(JSON.parse(readFileSync(MANIFEST, "utf8"))).filter(
      (r) =>
        typeof r === "string" &&
        !r.includes("[") && // parameterised — its concrete slugs come from the walk
        !r.startsWith("/api/") && // not pages
        !r.startsWith("/_") && // _not-found, _global-error
        !["/favicon.ico", "/sitemap.xml"].includes(r),
    )
  : [];
if (!existsSync(MANIFEST)) console.warn(`⚠ ${MANIFEST} missing — dynamic routes may be omitted`);

const urls = [...new Set([...fromBuild, ...fromManifest])]
  .filter((u) => !INTERNAL.has(u))
  .sort();
const prerendered = new Set(fromBuild.filter((u) => !INTERNAL.has(u)));
console.log(
  `${urls.length} URLs (${prerendered.size} prerendered, ` +
    `${urls.length - prerendered.size} dynamic-only)`,
);

const live = offline ? new Map() : await probeAll(urls);

const rows = urls.map((url) => {
  const kind = classify(url);
  const l = live.get(url) ?? {};
  return {
    url,
    kind,
    destination: destination(url, kind),
    status: l.status ?? "",
    redirected: l.redirected ?? "",
    finalUrl: l.finalUrl ?? "",
    title: l.title ?? "",
    canonical: l.canonical ?? "",
    h1: l.h1 ?? "",
    words: l.words ?? "",
  };
});

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;
const header = Object.keys(rows[0]);
writeFileSync(
  join(OUT_DIR, "url-inventory.csv"),
  [header.join(","), ...rows.map((r) => header.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n",
);

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
writeFileSync(
  join(OUT_DIR, "baseline", `technical-baseline-${stamp}.json`),
  JSON.stringify({ capturedAt: new Date().toISOString(), origin: ORIGIN, pages: rows }, null, 2) + "\n",
);

const by = (k) => rows.filter((r) => r.kind === k).length;
console.log(`\n  home ${by("home")} · docs ${by("docs")} · blog ${by("blog")} · marketing ${by("marketing")} · dead ${by("dead-scaffold")}`);
if (!offline) {
  const bad = rows.filter((r) => r.status >= 400 || r.status === 0);
  const red = rows.filter((r) => r.redirected);
  const nocanon = rows.filter((r) => r.status === 200 && !r.canonical);
  console.log(`  ${bad.length} broken · ${red.length} redirecting · ${nocanon.length} with no canonical`);
  for (const r of bad.slice(0, 10)) console.log(`    ✗ ${r.url} → ${r.status || "network error"}`);
}
console.log(`\n→ ${OUT_DIR}/url-inventory.csv`);
console.log(`→ ${OUT_DIR}/baseline/technical-baseline-${stamp}.json`);
