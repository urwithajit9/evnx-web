'use client'
/**
 * SearchModal — Cmd+K / Ctrl+K search powered by Pagefind
 *
 * Opens on:  Cmd+K (Mac) / Ctrl+K (Win/Linux)
 *            Clicking the search button in the header
 *
 * Usage:
 *   // In header.tsx:
 *   import { SearchModal, SearchTrigger } from '@/components/ui/search-modal'
 *
 *   <SearchTrigger />   ← the button that opens the modal
 *   <SearchModal />     ← the modal itself (renders in a portal)
 */

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { Search, X, FileText, BookOpen, Loader2, Command } from 'lucide-react'
import { search, warmup, preload } from '@/lib/search'
import type { SearchResultWithScore } from '@/lib/search'

// ── Global open/close state via a simple event ───────────────────────────────
// Avoids prop drilling through layout → header → modal
const OPEN_EVENT  = 'evnx:search:open'
const CLOSE_EVENT = 'evnx:search:close'

export function openSearch()  { window.dispatchEvent(new Event(OPEN_EVENT)) }
export function closeSearch() { window.dispatchEvent(new Event(CLOSE_EVENT)) }

// ── SearchTrigger ─────────────────────────────────────────────────────────────
// Drop this anywhere — header, sidebar, etc.
export function SearchTrigger({ className = '' }: { className?: string }) {
  return (
    <button
      onClick={openSearch}
      className={`flex items-center gap-2 font-mono text-xs text-text-muted hover:text-text-primary border border-border-muted hover:border-border-default rounded-lg px-3 py-1.5 transition-colors ${className}`}
      aria-label="Search"
    >
      <Search className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] border border-border-subtle rounded px-1 py-0.5 bg-bg-surface">
        <Command className="w-2.5 h-2.5" />K
      </kbd>
    </button>
  )
}

// ── SearchModal ────────────────────────────────────────────────────────────────
export function SearchModal() {
  const [open, setOpen]         = useState(false)
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<SearchResultWithScore[]>([])
  const [selected, setSelected] = useState(0)
  const [isPending, startTransition] = useTransition()
  const inputRef  = useRef<HTMLInputElement>(null)
  const listRef   = useRef<HTMLDivElement>(null)

  // Open/close via global events
  useEffect(() => {
    const onOpen  = () => { setOpen(true);  warmup() }
    const onClose = () => { setOpen(false); setQuery(''); setResults([]) }
    window.addEventListener(OPEN_EVENT,  onOpen)
    window.addEventListener(CLOSE_EVENT, onClose)
    return () => {
      window.removeEventListener(OPEN_EVENT,  onOpen)
      window.removeEventListener(CLOSE_EVENT, onClose)
    }
  }, [])

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? closeSearch() : openSearch()
      }
      if (e.key === 'Escape' && open) closeSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Search on input change
  const handleInput = useCallback((value: string) => {
    setQuery(value)
    setSelected(0)
    if (!value.trim()) { setResults([]); return }
    preload(value)
    startTransition(async () => {
      const hits = await search(value, { limit: 8 })
      setResults(hits)
    })
  }, [])

  // Keyboard navigation within results
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      window.location.href = results[selected].url
      closeSearch()
    }
  }

  if (!open) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeSearch() }}
    >
      {/* Dim */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-bg-surface border border-border-muted rounded-xl shadow-2xl overflow-hidden">

        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          {isPending
            ? <Loader2 className="w-4 h-4 text-text-muted animate-spin flex-shrink-0" />
            : <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search guides, blog posts…"
            className="flex-1 font-mono text-sm bg-transparent text-text-primary placeholder:text-text-muted outline-none"
          />
          <button
            onClick={closeSearch}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto">
          {query && results.length === 0 && !isPending && (
            <div className="py-12 text-center font-mono text-sm text-text-muted">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!query && (
            <div className="py-8 text-center font-mono text-xs text-text-muted">
              Type to search guides and blog posts
            </div>
          )}

          {results.length > 0 && (
            <ul className="py-2">
              {results.map((result, i) => {
                const isGuide = result.url.includes('/guides/')
                return (
                  <li key={result.id}>
                    <a
                      href={result.url}
                      onClick={closeSearch}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        i === selected
                          ? 'bg-brand-500/10 text-text-primary'
                          : 'hover:bg-bg-overlay text-text-secondary'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isGuide
                          ? <BookOpen className="w-4 h-4 text-brand-400" />
                          : <FileText className="w-4 h-4 text-text-muted" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold truncate">
                          {result.meta.title}
                        </p>
                        <p
                          className="font-mono text-xs text-text-muted mt-0.5 line-clamp-2"
                          // Pagefind wraps matched terms in <mark> — style it
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                      </div>
                      <span className={`flex-shrink-0 self-center font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        isGuide
                          ? 'border-brand-500/30 text-brand-400'
                          : 'border-border-subtle text-text-muted'
                      }`}>
                        {isGuide ? 'guide' : 'blog'}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-subtle px-4 py-2 flex items-center gap-4">
          <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
            <kbd className="border border-border-subtle rounded px-1 bg-bg-surface">↑↓</kbd>
            navigate
          </span>
          <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
            <kbd className="border border-border-subtle rounded px-1 bg-bg-surface">↵</kbd>
            open
          </span>
          <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
            <kbd className="border border-border-subtle rounded px-1 bg-bg-surface">esc</kbd>
            close
          </span>
          <span className="font-mono text-[10px] text-text-muted ml-auto">
            Powered by Pagefind
          </span>
        </div>
      </div>
    </div>
  )
}