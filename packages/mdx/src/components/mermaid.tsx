'use client'

/**
 * Mermaid — draws a ```mermaid fence as a diagram, in the browser.
 *
 * `FencedCodeBlock` (a Server Component) renders the fence exactly as it
 * always did — Shiki-highlighted source in our code box — and hands that to
 * this component as `children`. So the source is what a reader sees before
 * hydration, with JavaScript off, and whenever a diagram cannot be drawn:
 * never a blank box, never a broken SVG.
 *
 * ⚠️ mermaid is about 1 MB of JavaScript. It is loaded with `import()` from an
 * effect, so it is a separate chunk that only a page with a diagram fetches.
 * A static import here would put it in the bundle of every guide page, since
 * every guide renders through FencedCodeBlock.
 *
 * ⚠️ `securityLevel: 'strict'` keeps labels as text (no HTML, no click
 * handlers), and `startOnLoad: false` stops mermaid scanning the page on its
 * own: this component decides what is drawn.
 */
import { useEffect, useId, useState, type ReactNode } from 'react'
import { CopyButton } from './copy-button'

type Props = {
  /** The diagram source, as written in the fence. */
  code: string
  /** The highlighted source block: the fallback. */
  children: ReactNode
}

type State =
  | { kind: 'source' }
  | { kind: 'diagram'; svg: string }
  | { kind: 'error'; message: string }

export function Mermaid({ code, children }: Props) {
  // `useId` gives ":r0:"-style ids; mermaid uses the id in a CSS selector, so
  // keep letters and digits only.
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [state, setState] = useState<State>({ kind: 'source' })
  const theme = useSiteTheme()

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          darkMode: theme.dark,
          fontFamily: theme.fontFamily,
          themeVariables: theme.variables,
          // Keep each diagram at its natural size; a wide one scrolls in its
          // own box (below) instead of shrinking until the labels are unreadable.
          flowchart: { useMaxWidth: false },
          sequence: { useMaxWidth: false },
        })
        // `parse` first: it throws on a syntax error without leaving
        // anything in the page, where a failed `render` can.
        await mermaid.parse(code)
        const { svg } = await mermaid.render(id, code)
        if (!cancelled) setState({ kind: 'diagram', svg })
      } catch (err) {
        removeLeftovers(id)
        if (!cancelled) setState({ kind: 'error', message: firstLine(err) })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [code, id, theme])

  // ⚠️ Spacing, the header background and the scroll are inline styles, not
  // classes. apps/docs' Tailwind does not scan packages/mdx, so a class that
  // appears nowhere in apps/docs is not in its CSS: `my-6`, `bg-bg-overlay`,
  // `py-2.5` and `overflow-x-auto` are missing (checked 2026-10-20), which is
  // why a long line in an ordinary code block is cut off rather than scrolled.
  if (state.kind === 'diagram') {
    return (
      <figure
        className="rounded-xl overflow-hidden border border-border-muted"
        style={{ margin: '1.5rem 0' }}
      >
        <div
          className="flex items-center justify-between border-b border-border-subtle"
          style={{ background: 'var(--bg-overlay)', padding: '0.625rem 1rem' }}
        >
          <span className="font-mono text-xs text-text-muted">Diagram</span>
          <CopyButton code={code} />
        </div>
        {/* Scrolls on its own; the page never does, at any width. */}
        <div
          tabIndex={0}
          role="group"
          aria-label="Diagram"
          style={{ overflowX: 'auto', background: 'var(--bg-base)', padding: '1.25rem' }}
        >
          {/* As wide as the diagram, and at least as wide as the box: a
              narrow diagram is centred, a wide one scrolls from its left
              edge (centring a too-wide child would cut off its left side). */}
          <div
            style={{ width: 'max-content', minWidth: '100%', display: 'flex', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: state.svg }}
          />
        </div>
      </figure>
    )
  }

  if (state.kind === 'error') {
    // The note sits above the source block. ⚠️ No negative margin to pull the
    // block up against it: the block's own `my-6` is missing from the docs CSS
    // today (see above), so the block would ride up over the note.
    return (
      <div>
        <p
          role="status"
          className="font-mono text-xs"
          style={{ color: 'var(--warning)', marginTop: '1.5rem', marginBottom: '0.5rem' }}
        >
          This diagram could not be drawn: {state.message}
        </p>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

// ─── Theme ────────────────────────────────────────────────────────────────────

type SiteTheme = {
  dark: boolean
  fontFamily: string
  variables: Record<string, string>
}

/**
 * The site's colours, read from its CSS custom properties, and redone when
 * `<html>`'s class or `data-theme` changes.
 *
 * ⚠️ docs.evnx.dev has one palette, dark, on `:root` — no theme switch and no
 * `prefers-color-scheme` rule (checked 2026-10-20). Reading the tokens rather
 * than copying them means a light palette added later reaches the diagrams
 * with no change here. Following the OS preference instead would draw light
 * diagrams on the dark page.
 */
function useSiteTheme(): SiteTheme {
  const [theme, setTheme] = useState<SiteTheme>(readTheme)

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setTheme((prev) => {
        const next = readTheme()
        return JSON.stringify(next) === JSON.stringify(prev) ? prev : next
      })
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] })
    return () => observer.disconnect()
  }, [])

  return theme
}

function readTheme(): SiteTheme {
  if (typeof document === 'undefined') {
    return { dark: true, fontFamily: 'sans-serif', variables: {} }
  }
  const css = getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback

  const bgBase = token('--bg-base', '#0D1117')
  const bgSurface = token('--bg-surface', '#161B22')
  const bgOverlay = token('--bg-overlay', '#1C2128')
  const borderMuted = token('--border-muted', '#30363D')
  const borderDefault = token('--border-default', '#484F58')
  const text = token('--text-primary', '#E6EDF3')
  const textSecondary = token('--text-secondary', '#8B949E')
  const brand = token('--brand-500', '#E8652A')

  // Mermaid needs to know whether it is drawing on dark to derive its own
  // shades; ask the background rather than assume.
  const dark = luminance(bgBase) < 0.5

  return {
    dark,
    fontFamily: getComputedStyle(document.body).fontFamily || 'sans-serif',
    variables: {
      background: bgBase,
      // Flowcharts
      primaryColor: bgSurface,
      primaryBorderColor: borderDefault,
      primaryTextColor: text,
      secondaryColor: bgOverlay,
      tertiaryColor: bgSurface,
      mainBkg: bgSurface,
      nodeBorder: borderDefault,
      clusterBkg: bgOverlay,
      clusterBorder: borderMuted,
      lineColor: textSecondary,
      textColor: text,
      edgeLabelBackground: bgBase,
      // Sequence diagrams
      actorBkg: bgSurface,
      actorBorder: borderDefault,
      actorTextColor: text,
      actorLineColor: borderDefault,
      signalColor: textSecondary,
      signalTextColor: text,
      labelBoxBkgColor: bgOverlay,
      labelBoxBorderColor: borderDefault,
      labelTextColor: text,
      loopTextColor: text,
      noteBkgColor: bgOverlay,
      noteBorderColor: brand,
      noteTextColor: text,
      activationBkgColor: bgOverlay,
      activationBorderColor: borderDefault,
      sequenceNumberColor: bgBase,
    },
  }
}

/** 0 (black) to 1 (white) for a `#rrggbb` colour; mid-grey for anything else. */
function luminance(color: string): number {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color)
  if (!m) return 0.5
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** One line of a mermaid error, for the note above the source. */
function firstLine(err: unknown): string {
  const text = err instanceof Error ? err.message : String(err)
  const line = text.split('\n').find((l) => l.trim())?.trim() ?? 'unknown error'
  // "Parse error on line 8:" — the colon introduces lines not shown here.
  return line.replace(/:$/, '')
}

/** A failed render can leave its scratch element in <body>; take it out. */
function removeLeftovers(id: string) {
  for (const el of [document.getElementById(id), document.getElementById(`d${id}`)]) {
    el?.remove()
  }
}
