'use client'
/**
 * HelpfulVote
 *
 * Shown at the bottom of every guide and blog post.
 * Stores votes in Supabase. Uses a session ID (UUID stored in localStorage)
 * so the same visitor can't vote twice on the same page.
 *
 * Usage:
 *   <HelpfulVote slug="guides/commands/scan" />
 *   <HelpfulVote slug={`blog/${post.slug}`} />
 */
import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Props = { slug: string }
type VoteCounts = { yes: number; no: number }

// Explicit type — partial selects collapse to never[] without this
type VoteRow = { vote: 'yes' | 'no'; session_id: string }

function getSessionId(): string {
  const key = 'evnx_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function HelpfulVote({ slug }: Props) {
  const [voted, setVoted]     = useState<'yes' | 'no' | null>(null)
  const [counts, setCounts]   = useState<VoteCounts>({ yes: 0, no: 0 })
  const [loading, setLoading] = useState(false)
  const [ready, setReady]     = useState(false)

  useEffect(() => {
    const sessionId = getSessionId()

    async function load() {
      const { data } = await supabase
        .from('helpful_votes')
        .select('vote, session_id')
        .eq('page_slug', slug)

      // Cast here — use `rows` everywhere below, never touch `data` again.
      // Supabase partial selects collapse to never[] without an explicit cast.
      const rows = (data ?? []) as VoteRow[]

      setCounts({
        yes: rows.filter(r => r.vote === 'yes').length,
        no:  rows.filter(r => r.vote === 'no').length,
      })

      const existing = rows.find(r => r.session_id === sessionId)
      if (existing) setVoted(existing.vote)

      setReady(true)
    }

    load()
  }, [slug])

  async function castVote(vote: 'yes' | 'no') {
    if (voted || loading) return
    setLoading(true)

    const { error } = await supabase
      .from('helpful_votes')
      .insert({ page_slug: slug, vote, session_id: getSessionId() })

    if (!error) {
      setVoted(vote)
      setCounts(prev => ({ ...prev, [vote]: prev[vote] + 1 }))
    }

    setLoading(false)
  }

  if (!ready) return null

  if (voted) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-text-muted">
          {voted === 'yes'
            ? 'Thanks! Glad it helped. 🙌'
            : "Thanks for the feedback. We'll improve this."}
        </span>
        <span className="font-mono text-xs text-text-muted">
          ({counts.yes} found this helpful)
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm text-text-muted">Was this helpful?</span>

      <button
        onClick={() => castVote('yes')}
        disabled={loading}
        className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border border-border-muted rounded hover:border-success hover:text-success hover:bg-success/5 transition-all disabled:opacity-50"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        Yes {counts.yes > 0 && <span className="text-text-muted">({counts.yes})</span>}
      </button>

      <button
        onClick={() => castVote('no')}
        disabled={loading}
        className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border border-border-muted rounded hover:border-danger hover:text-danger hover:bg-danger/5 transition-all disabled:opacity-50"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
        No {counts.no > 0 && <span className="text-text-muted">({counts.no})</span>}
      </button>
    </div>
  )
}