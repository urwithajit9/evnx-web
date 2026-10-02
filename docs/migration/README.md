# Migration baseline — the before-picture

**Captured 2026-10-02**, before anything moved. Schedule [P0 / Lane A].

⚠️ **This is the only artefact in the project that cannot be recreated later.**
Once a URL moves there is no way back to what it looked like, and the
migration's effect becomes unmeasurable forever.

---

## What is here

| | |
|---|---|
| `url-inventory.csv` | All **84** live URLs, with kind, post-split destination, status, title, canonical, h1 and word count |
| `baseline/technical-baseline-*.json` | The same capture, machine-readable, for diffing |
| `../../scripts/crawl-inventory.mjs` | The crawler. Re-run after the migration with `--compare` |

```bash
# Re-capture (after `next build`)
node scripts/crawl-inventory.mjs

# After the migration — names every URL that lost its page, title or content
node scripts/crawl-inventory.mjs --compare docs/migration/baseline/technical-baseline-<stamp>.json
```

`--compare` exits non-zero if any URL broke, so it can gate the P3.3 cutover.

---

## The inventory

| Kind | Count | Moves to |
|---|---|---|
| `home` | 1 | stays |
| `docs` | **58** | `docs.evnx.dev/cli/*` — 57 guides + the `/guides` index |
| `blog` | 19 | stays on `evnx.dev` — 18 posts + the `/blog` index |
| `marketing` | 4 | stays — `/changelog` `/install` `/pricing` `/testimonials` |
| `dead-scaffold` | 2 | **delete** — `/login` `/dashboard` |
| | **84** | **58 of them move. That is 69% of the site.** |

Reconciles exactly against the source: 59 guide MDX − 2 `draft: true` = 57;
21 blog MDX − 3 `draft: true` = 18. Nothing is unaccounted for.

⚠️ The two drafts are `reference/rotating-a-vault-key` and
`reference/getting-your-secrets-out` — the two the 0.8.0 release un-drafts. If
they publish before the split, **the inventory changes** and this must be
re-captured. Re-run the crawler; it is thirty seconds.

---

## ⚠️ Three live defects the baseline found

These are costing SEO **today**, independently of the split. All three also
make the migration harder, because each one weakens the signal Google uses to
transfer ranking from an old URL to a new one.

### 1 · The sitemap lists 5 of 84 URLs

`app/sitemap.ts` is a hand-written array of five entries. **Every guide and
every blog post is missing** — 79 pages that Google can only find by crawling
links.

It is also hardcoded to `https://evnx.dev`, which is not where the content is
served from (see 2), so all five entries point at a redirect.

### 2 · The apex redirects, and the sitemap points at the apex

```
https://evnx.dev        → 307 → https://www.evnx.dev/     (Vercel)
```

So the one file whose job is to tell Google the canonical URL of every page
names a hostname that redirects. Link equity is split across two hostnames,
which is exactly what schedule 3.2 predicted — now confirmed live rather than
assumed.

### 3 · Zero canonical tags, site-wide

**0 of 84 pages emit `<link rel="canonical">`.** `metadataBase` is set in
`app/layout.tsx` but `alternates.canonical` is never populated, and
`lib/content.ts` declares a `canonical?: string` frontmatter field that
nothing reads.

⚠️ This is the one that matters most for the split. A 301 tells Google a page
moved; a canonical tells it which URL is authoritative while both are
reachable. Doing a 58-URL cross-host migration with neither is the slow,
lossy version of it.

**All three are cheap** — roughly half a day together — and none depends on the
monorepo, the docs app, or anything else. Worth doing before P3 rather than
inside it.

---

## 🔴 Still outstanding — only you can do these

The crawler captures the **technical** baseline. The **traffic** baseline needs
accounts I cannot sign into.

### A1a · Umami

`analytics.dotenv.space`, proxied at `evnx.dev/stats`.

1. Set the range to **the last 90 days**, ending yesterday.
2. Export, and save into `baseline/`:
   - `umami-pages-90d.csv` — pageviews and visitors **per URL** ⚠️ the critical one
   - `umami-referrers-90d.csv`
   - `umami-summary-90d.png` — a screenshot of the overview
3. ⚠️ **Per-URL is what matters.** A site total cannot answer "did
   `/guides/commands/scan` lose its traffic", which is the only question worth
   asking after a 58-URL move.

### A1b · Google Search Console

⚠️ **Create a Domain property for `evnx.dev`, not a URL-prefix property**, if
one does not already exist.

A Domain property covers every subdomain — including `docs.evnx.dev`, which
does not exist yet. A URL-prefix property would need a second property created
later, and it would have no history on the day you most want history.

Verification is one TXT record in Cloudflare. Do it now; it costs nothing while
the subdomain is unused, and it starts accumulating data from today.

Then export, last **16 months** (the maximum), into `baseline/`:
- `gsc-pages-16m.csv` — clicks, impressions, CTR, position **per page**
- `gsc-queries-16m.csv`
- `gsc-coverage.csv` — indexed vs excluded

⚠️ **16 months, not 3.** Search Console discards data past that window, so this
export is the only copy that will ever exist of the older half.

### A3 · Freeze slugs

From now until P3.3 passes, **no URL changes** — no renamed guide files, no
edited slugs, no moved sections. A slug that changes between the capture and
the cutover is a URL the redirect map does not know about, and it will 404
silently.

New pages are fine. Re-run the crawler when you add them.
