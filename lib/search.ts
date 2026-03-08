/**
 * lib/search.ts — Pagefind browser API wrapper
 *
 * HOW PAGEFIND WORKS:
 * 1. You run `pnpm build` → Next.js outputs static HTML to `.next/`
 * 2. You run `pagefind --site .next/server/app` → Pagefind crawls the HTML,
 *    extracts text, and writes a search index to `public/pagefind/`
 * 3. At runtime, `pagefind.js` is loaded from `/pagefind/pagefind.js`
 *    (served as a static file from `public/`)
 * 4. This file wraps that browser API for use in React components
 *
 * IMPORTANT: Pagefind only works after a build. In `pnpm dev` there is no
 * `/pagefind/pagefind.js` file, so search will silently return no results.
 * This is expected — add a dev-mode notice in the UI if needed.
 */

export type SearchResult = {
  id:      string
  url:     string
  excerpt: string
  meta: {
    title:  string
    image?: string
  }
}

export type SearchResultWithScore = SearchResult & {
  score: number
}

// Pagefind loads itself as a global — we store the instance after first load
let pagefind: PagefindInstance | null = null

// Matches the Pagefind browser API shape
type PagefindInstance = {
  search: (query: string, options?: PagefindSearchOptions) => Promise<PagefindSearchResponse>
  preload: (query: string) => Promise<void>
  destroy: () => Promise<void>
}

type PagefindSearchOptions = {
  filters?:  Record<string, string | string[]>
  sort?:     Record<string, 'asc' | 'desc'>
  excerptLength?: number
}

type PagefindSearchResponse = {
  results: PagefindRawResult[]
  unfilteredResultCount: number
  filters: Record<string, Record<string, number>>
  totalFilters: Record<string, Record<string, number>>
  timings: { preload: number; search: number; total: number }
}

type PagefindRawResult = {
  id:    string
  score: number
  data:  () => Promise<SearchResult>
}

/**
 * Loads the Pagefind script on first call.
 * Safe to call multiple times — subsequent calls return the cached instance.
 */
async function getPagefind(): Promise<PagefindInstance | null> {
  if (pagefind) return pagefind

  try {
    // Dynamic import of the Pagefind bundle written to public/pagefind/
    // @ts-expect-error — no types for the runtime-generated pagefind.js
    const pf = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js')
    pagefind = pf as PagefindInstance
    return pagefind
  } catch {
    // Expected in `pnpm dev` — the index doesn't exist until after a build
    return null
  }
}

/**
 * Search across all indexed content (blog posts + guides).
 *
 * @param query  - Search string
 * @param limit  - Max results to return (default 8)
 * @returns      - Array of results with url, title, excerpt
 *
 * Usage:
 *   const results = await search('scan secrets')
 *   const guides  = await search('install', { section: 'guides' })
 */
export async function search(
  query: string,
  options?: { limit?: number; section?: 'blog' | 'guides' | 'all' }
): Promise<SearchResultWithScore[]> {
  if (!query.trim()) return []

  const pf = await getPagefind()
  if (!pf) return []

  const { limit = 8, section = 'all' } = options ?? {}

  const filters: Record<string, string> = {}
  if (section !== 'all') {
    // Pagefind reads data-pagefind-filter attributes from the HTML.
    // The guide and blog page templates should include:
    //   <div data-pagefind-filter="section:guides"> or "section:blog"
    filters.section = section
  }

  try {
    const response = await pf.search(query, {
      filters,
      excerptLength: 40,
    })

    // Pagefind lazily fetches result data — hydrate up to `limit` results
    const hydrated = await Promise.all(
      response.results.slice(0, limit).map(async r => {
        const data = await r.data()
        return { ...data, score: r.score }
      })
    )

    return hydrated
  } catch (err) {
    console.error('[search] pagefind.search failed:', err)
    return []
  }
}

/**
 * Preload the search index for a query string.
 * Call on keydown to reduce latency before the user finishes typing.
 *
 * Usage (debounced):
 *   <input onKeyDown={() => preload(inputValue)} />
 */
export async function preload(query: string): Promise<void> {
  const pf = await getPagefind()
  if (!pf || !query.trim()) return
  await pf.preload(query).catch(() => {})
}

/**
 * Warm up the Pagefind index without a query.
 * Call on modal open to reduce first-search latency.
 */
export async function warmup(): Promise<void> {
  await getPagefind()
}