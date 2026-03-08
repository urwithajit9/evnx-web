'use client'
/**
 * WaitlistForm
 *
 * Collects email + optional source tag. Stores in Supabase waitlist table.
 * Handles duplicate emails gracefully (Supabase unique constraint returns
 * a 23505 error code which we translate to a friendly message).
 *
 * Usage:
 *   <WaitlistForm />                        — default hero CTA
 *   <WaitlistForm source="blog-post-cta" /> — tagged source for analytics
 *   <WaitlistForm compact />                — smaller inline version
 */

import { useState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Props = {
  source?: string
  compact?: boolean
  placeholder?: string
  buttonText?: string
}

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

export function WaitlistForm({
  source = 'unknown',
  compact = false,
  placeholder = 'you@company.com',
  buttonText = 'Join waitlist',
}: Props) {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.trim().toLowerCase(), source })

    if (!error) {
      setStatus('success')
      setEmail('')
      return
    }

    // Postgres unique violation = duplicate email
    if (error.code === '23505') {
      setStatus('duplicate')
    } else {
      console.error('[waitlist]', error)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 ${compact ? 'text-sm' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-success" />
        </div>
        <div>
          <p className="font-mono font-semibold text-text-primary">You're on the list.</p>
          <p className="font-mono text-xs text-text-muted mt-0.5">We'll email you when evnx cloud launches.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'flex gap-2' : 'space-y-3'}>
      <div className={compact ? 'flex-1' : ''}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          className={`w-full font-mono bg-bg-surface border rounded px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 transition-colors ${
            compact ? 'text-sm py-2' : 'text-sm py-3'
          } ${
            status === 'error' || status === 'duplicate'
              ? 'border-danger/50'
              : 'border-border-muted'
          }`}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading' || !email}
        className={`flex items-center justify-center gap-2 font-mono font-semibold bg-brand-500 text-black rounded hover:bg-brand-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          compact ? 'text-xs px-4 py-2 whitespace-nowrap' : 'text-sm px-6 py-3 w-full'
        }`}
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {buttonText}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Status messages */}
      {status === 'duplicate' && (
        <p className="font-mono text-xs text-warning">
          That email is already on the list — you're good. ✓
        </p>
      )}
      {status === 'error' && (
        <p className="font-mono text-xs text-danger">
          Something went wrong. Try again or email us directly.
        </p>
      )}
    </form>
  )
}