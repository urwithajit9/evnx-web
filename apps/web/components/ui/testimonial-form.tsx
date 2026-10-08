'use client'
/**
 * TestimonialForm
 *
 * Two-mode form: personal user OR company.
 * Uploads avatar/logo to Supabase Storage, stores metadata in testimonials table.
 * Submitted testimonials are NOT shown until `is_public` turns true, which
 * needs `approved` AND the email round-trip recorded — see
 * issue_triage/testimonials-provenance.sql.
 *
 * ⚠️ Submits to POST /api/testimonials, NOT to Supabase directly. It used to
 * insert with the public anon key, which let anyone who read that key out of
 * the JS bundle set `approved: true` themselves. Validation, the size and
 * type checks and the image upload are all decided server-side now; nothing
 * here is a security boundary, and nothing here needs to be.
 *
 * ── Layout notes, because they are not arbitrary ──────────────────────────
 *
 * ⚠️ Most people reach this from a phone, usually from a link someone sent
 * them, with no particular intention of filling in a form. Two things follow.
 *
 * 1. EVERY control is at least 16px (`text-base`). Below that, iOS Safari
 *    zooms the viewport on focus and does not zoom back out — the page jumps,
 *    the layout is suddenly too wide, and the rest of the form is filled in
 *    while panning sideways. The old form used `text-sm` (14px) throughout,
 *    so this happened on the very first tap, on every iPhone.
 *
 * 2. The required path is five things: who, where to reach you, what happened,
 *    the tick, submit. Everything else is behind a disclosure. The old form
 *    showed nine stacked fields, which on a phone is a scroll with no visible
 *    end — and the thing people abandon is not a hard form, it is a long one.
 *    Nothing was removed; the optional half just does not greet you.
 *
 * Usage:
 *   <TestimonialForm />
 */

import { useId, useRef, useState } from 'react'
import {
  Upload, User, Building2, Check, Loader2, X, Plus, Minus,
} from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { CONSENT_TEXT, CONSENT_PRIVACY_HREF } from '@/lib/testimonial-consent'

type Mode   = 'user' | 'company'
type Status = 'idle' | 'loading' | 'success' | 'error'

const MAX_FILE_SIZE  = 2 * 1024 * 1024  // 2MB
const MESSAGE_MIN    = 30
const MESSAGE_MAX    = 500
const NAME_MAX       = 80
const ROLE_MAX       = 120
const URL_MAX        = 200
const EMAIL_MAX      = 254

/**
 * ⚠️ Keys must match the CHECK on `testimonials.use_cases` in
 * issue_triage/testimonials-provenance.sql, and the mirror list in the API
 * route. Three places, because the database is the one that must not be
 * wrong and the other two are allowed to lag by a deploy.
 *
 * These are chips rather than a text field on purpose: one tap, skippable,
 * and the answers stay comparable. "CI", "ci/cd", "pipelines" and "github
 * actions" are one facet, and a free-text box collects all four.
 */
const USE_CASES = [
  { value: 'scan',     label: 'Secret scanning' },
  { value: 'validate', label: 'Validation' },
  { value: 'cloud',    label: 'Cloud sync' },
  { value: 'ci',       label: 'CI/CD' },
  { value: 'migrate',  label: 'Migration' },
  { value: 'convert',  label: 'Format conversion' },
  { value: 'diff',     label: 'Diffing' },
  { value: 'env-workflow',     label: '.env Workflow' },
] as const

export function TestimonialForm() {
  const [mode, setMode]         = useState<Mode>('user')
  const [status, setStatus]     = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imageError, setImageError]     = useState<string | null>(null)
  const [consent, setConsent]           = useState(false)
  const [useCases, setUseCases]         = useState<string[]>([])
  const [detailsOpen, setDetailsOpen]   = useState(false)
  /**
   * ⚠️ ONE useId, with the second id derived from it — not two useId calls.
   *
   * A second `useId()` in this component body made the server and the client
   * generate different ids for EVERY control on the form, and React threw a
   * hydration mismatch naming all of them. Bisected: baseline (one call) was
   * clean, adding a second broke it, replacing the second with a constant
   * fixed it again.
   *
   * Deriving is better than the constant that proved the point — it stays
   * unique if this form is ever rendered twice on one page, which a
   * hardcoded string would not. Same trick `Field` uses for its hint id.
   */
  const consentId = useId()
  const detailsId = `${consentId}-details`
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:        '',
    email:       '',
    role:        '',
    company:     '',
    website_url: '',
    social_url:  '',
    message:     '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleUseCase(value: string) {
    setUseCases(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value],
    )
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setImageError(null)

    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be under 2MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      setImageError('Must be an image file')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function fail(message: string) {
    setErrorMsg(message)
    setStatus('error')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return

    // ⚠️ This form can carry an uploaded image and several minutes of typing.
    // Refusing up front is the only acceptable behaviour when the backend is
    // not configured — a silent discard loses someone's work.
    if (!isSupabaseConfigured) {
      fail('Submissions are not configured on this deployment. Please email support@evnx.dev instead.')
      return
    }

    setErrorMsg(null)
    setStatus('loading')

    // multipart, so the image travels with the fields and the route can refuse
    // the whole submission atomically instead of leaving an orphaned upload.
    const fd = new FormData()
    fd.set('type', mode)
    fd.set('name', form.name)
    fd.set('email', form.email)
    // ⚠️ Only the tick travels. The sentence it refers to is written by the
    // route from its own constant — a browser that reported the wording would
    // be attesting to its own claim.
    fd.set('consent', String(consent))
    fd.set('role', form.role)
    fd.set('company', form.company)
    fd.set('social_url', form.social_url)
    // Mode-scoped: the website field is only rendered for a company, and the
    // value used to survive a mode switch and be submitted invisibly.
    if (mode === 'company') fd.set('website_url', form.website_url)
    fd.set('message', form.message)
    // ⚠️ append, not set — one entry per value, which is what the route's
    // fd.getAll expects. `set` in a loop would leave only the last chip.
    for (const u of useCases) fd.append('use_cases', u)
    if (imageFile) fd.set('image', imageFile)

    try {
      const res = await fetch('/api/testimonials', { method: 'POST', body: fd })

      if (!res.ok) {
        // ⚠️ The route's message is shown as-is. It is the only thing that
        // knows WHY — "image is not the type it claims to be" and "needs 30
        // characters" were both a generic "something went wrong" before.
        const body = await res.json().catch(() => null)
        fail(body?.error ?? 'Something went wrong. Please try again, or email support@evnx.dev.')
        return
      }
    } catch (err) {
      console.error('[testimonial] submit failed:', err)
      fail('Could not reach the server. Check your connection and try again.')
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="w-7 h-7 text-success" />
        </div>
        <h3 className="font-serif text-2xl font-bold">Thank you!</h3>
        <p className="text-base text-text-muted max-w-sm leading-relaxed">
          Your testimonial is in review. We&apos;ll email you at{' '}
          <span className="text-text-secondary break-all">{form.email}</span> to confirm
          before it appears on the site — usually within 24–48 hours.
        </p>
      </div>
    )
  }

  const trimmed      = form.message.trim().length
  const messageShort = trimmed > 0 && trimmed < MESSAGE_MIN
  const canSubmit =
    status !== 'loading' &&
    consent &&
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    trimmed >= MESSAGE_MIN

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* ── Mode toggle ───────────────────────────────────────────────────
          ⚠️ 48px tall. This is the first thing a thumb lands on, and the old
          one was 36px — under every platform's minimum target size. */}
      <div
        role="radiogroup"
        aria-label="Submitting as"
        className="grid grid-cols-2 gap-1.5 p-1.5 bg-bg-surface border border-border-muted rounded-xl"
      >
        {(['user', 'company'] as const).map(m => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`flex items-center justify-center gap-2 h-12 rounded-lg text-base font-medium transition-all ${
              mode === m
                ? 'bg-brand-500 text-black shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-overlay'
            }`}
          >
            {m === 'user' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            {m === 'user' ? 'Personal' : 'Company'}
          </button>
        ))}
      </div>

      {/* ── Name + email, side by side from 640px ─────────────────────────
          Two short fields in one row halve the height of the required path on
          anything wider than a phone, and stack cleanly below it. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label={mode === 'user' ? 'Your name' : 'Company name'} required>
          {id => (
            <input
              id={id}
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder={mode === 'user' ? 'Jane Smith' : 'Acme Corp'}
              required
              maxLength={NAME_MAX}
              autoComplete={mode === 'user' ? 'name' : 'organization'}
              enterKeyHint="next"
              className={INPUT}
            />
          )}
        </Field>

        <Field label="Your email" required hint="Not published. We email you before this goes live.">
          {(id, hintId) => (
            <input
              id={id}
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="jane@example.com"
              required
              maxLength={EMAIL_MAX}
              autoComplete="email"
              // ⚠️ inputMode drives the on-screen keyboard: an email layout
              // puts @ and . on the first page instead of two shifts deep.
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              aria-describedby={hintId}
              className={INPUT}
            />
          )}
        </Field>
      </div>

      {/* ── The message ───────────────────────────────────────────────────*/}
      <Field label="Your experience with evnx" required>
        {id => (
          <>
            <textarea
              id={id}
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="Tell us how evnx helped you or your team…"
              required
              rows={5}
              minLength={MESSAGE_MIN}
              maxLength={MESSAGE_MAX}
              enterKeyHint="enter"
              aria-describedby={`${id}-count`}
              className={`${INPUT} resize-y min-h-[8rem]`}
            />
            {/* ⚠️ The floor is stated, not just enforced. minLength={30} was
                silently blocking submit with a browser tooltip and the counter
                showed only "0/500" — nothing told anyone 30 was the bar. */}
            <p
              id={`${id}-count`}
              aria-live="polite"
              className={`text-xs mt-1.5 text-right tabular-nums ${messageShort ? 'text-danger' : 'text-text-muted'}`}
            >
              {messageShort
                ? `${MESSAGE_MIN - trimmed} more character${MESSAGE_MIN - trimmed === 1 ? '' : 's'} needed`
                : `${form.message.length}/${MESSAGE_MAX}`}
            </p>
          </>
        )}
      </Field>

      {/* ── Use-case chips ────────────────────────────────────────────────
          ⚠️ Real checkboxes under the styling, not buttons. The chip is the
          <label>, so a tap anywhere on it toggles, the keyboard reaches it,
          and a screen reader announces checked state — all of which a styled
          <button role="checkbox"> has to reimplement and usually gets wrong. */}
      <fieldset>
        <legend className="block text-xs text-text-muted uppercase tracking-widest mb-3">
          What did it help with?{' '}
          <span className="normal-case tracking-normal text-text-muted/70">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {USE_CASES.map(({ value, label }) => {
            const on = useCases.includes(value)
            return (
              <label
                key={value}
                className={`cursor-pointer select-none rounded-full border px-4 h-10 inline-flex items-center text-sm transition-colors ${
                  on
                    ? 'bg-brand-500/15 border-brand-500 text-brand-300'
                    : 'bg-bg-surface border-border-muted text-text-muted hover:border-border-default hover:text-text-secondary'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleUseCase(value)}
                  className="sr-only"
                />
                {label}
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* ── Everything optional, folded away ──────────────────────────────*/}
      <div className="border-t border-border-subtle pt-5">
        <button
          type="button"
          onClick={() => setDetailsOpen(o => !o)}
          aria-expanded={detailsOpen}
          aria-controls={detailsId}
          // ⚠️ items-start + text-left, and the label is ONE span. As three
          // flex children on a centred row it wrapped mid-phrase with
          // "(optional)" flung to the right margin — flex was distributing the
          // wrapped line rather than the sentence flowing.
          className="flex items-start gap-2 text-left text-sm text-text-secondary hover:text-brand-400 transition-colors"
        >
          {detailsOpen
            ? <Minus className="w-4 h-4 mt-0.5 flex-shrink-0" />
            : <Plus  className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span>
            {mode === 'user' ? 'Add a photo, your role and links' : 'Add a logo, website and links'}{' '}
            <span className="text-text-muted">(optional)</span>
          </span>
        </button>

        {/* ⚠️ Values live in `form` above, so collapsing this does NOT discard
            what is in it — and anything typed here is still submitted. The
            one exception is website_url, which handleSubmit drops outside
            company mode, because a value left behind by a mode switch was
            being submitted invisibly. */}
        {detailsOpen && (
          <div id={detailsId} className="mt-6 space-y-5">

            {/* Image — compact row, not a block */}
            <div>
              <span className="block text-xs text-text-muted uppercase tracking-widest mb-2">
                {mode === 'user' ? 'Profile photo' : 'Company logo'}
              </span>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover border border-border-muted"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      aria-label="Remove selected image"
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-danger rounded-full flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex-shrink-0 w-14 h-14 rounded-full bg-bg-surface border-2 border-dashed border-border-muted flex items-center justify-center text-text-muted"
                  >
                    {mode === 'user' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                )}
                <div className="min-w-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    aria-describedby="image-hint"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center gap-2 text-sm h-10 px-4 border border-border-muted rounded-lg cursor-pointer hover:border-brand-500 hover:text-brand-400 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {imagePreview ? 'Change' : 'Upload'}
                  </label>
                  <p id="image-hint" className="text-xs text-text-muted mt-1.5">PNG, JPG, GIF or WebP, up to 2MB</p>
                  {imageError && (
                    <p role="alert" className="text-xs text-danger mt-1">{imageError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={mode === 'user' ? 'Role & company' : 'Industry / tagline'}>
                {id => (
                  <input
                    id={id}
                    type="text"
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                    placeholder={mode === 'user' ? 'Senior Engineer at Stripe' : 'B2B SaaS · 200 employees'}
                    maxLength={ROLE_MAX}
                    enterKeyHint="next"
                    className={INPUT}
                  />
                )}
              </Field>

              <Field label={mode === 'user' ? 'GitHub / LinkedIn / X' : 'LinkedIn / X'}>
                {id => (
                  <input
                    id={id}
                    type="url"
                    value={form.social_url}
                    onChange={e => set('social_url', e.target.value)}
                    placeholder="https://github.com/janesmith"
                    maxLength={URL_MAX}
                    inputMode="url"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint={mode === 'company' ? 'next' : 'done'}
                    className={INPUT}
                  />
                )}
              </Field>

              {mode === 'company' && (
                <Field label="Company website">
                  {id => (
                    <input
                      id={id}
                      type="url"
                      value={form.website_url}
                      onChange={e => set('website_url', e.target.value)}
                      placeholder="https://acme.com"
                      maxLength={URL_MAX}
                      inputMode="url"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      className={INPUT}
                    />
                  )}
                </Field>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ⚠️ Unticked by default, and the submit button respects it. A
          pre-ticked box is not consent, and this one is the record that we
          were allowed to publish someone's name and employer.
          The whole row is the label, so the tap target is the sentence rather
          than a 16px square. */}
      <label
        htmlFor={consentId}
        className="flex gap-3 items-start p-4 bg-bg-surface border border-border-muted rounded-xl cursor-pointer hover:border-border-default transition-colors"
      >
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          required
          className="mt-0.5 w-5 h-5 flex-shrink-0 accent-brand-500 cursor-pointer"
        />
        <span className="text-sm text-text-secondary leading-relaxed">
          {CONSENT_TEXT}{' '}
          <a
            href={CONSENT_PRIVACY_HREF}
            className="text-brand-400 hover:underline"
            onClick={e => e.stopPropagation()}
          >
            Privacy policy
          </a>
          .
        </span>
      </label>

      {status === 'error' && errorMsg && (
        <p role="alert" className="text-sm text-danger">
          {errorMsg}
        </p>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 font-semibold text-base bg-brand-500 text-black h-14 rounded-xl hover:bg-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading'
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
            : 'Submit testimonial'}
        </button>

        <p className="text-xs text-text-muted text-center leading-relaxed">
          Reviewed by a human, and confirmed with you by email, before anything appears.
        </p>
      </div>
    </form>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * ⚠️ `text-base` is 16px and is load-bearing, not a style preference. iOS
 * Safari zooms the viewport whenever a focused input renders below 16px and
 * never zooms back out, so `text-sm` here meant the page jumped sideways on
 * the first tap of every iPhone visit and stayed there for the rest of the
 * form. h-12 for the same family of reasons: 48px clears every platform
 * minimum tap target.
 */
const INPUT =
  'w-full text-base bg-bg-surface border border-border-muted rounded-lg px-4 h-12 ' +
  'text-text-primary placeholder:text-text-muted/70 focus:outline-none ' +
  'focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-colors'

/**
 * ⚠️ Takes a render prop so the generated id reaches the control.
 *
 * It previously rendered `<label>{label}</label>` as a SIBLING of the field,
 * with no htmlFor and no nesting — so five of the six labels on this form were
 * associated with nothing. A screen reader announced "edit text, blank", and
 * clicking a label did not focus its field. Verified against the live page
 * before the change: 5 orphaned labels, 4 inputs with no accessible name.
 *
 * The required marker is drawn here and ONLY here. Passing `label="Your name *"`
 * alongside `required` rendered "YOUR NAME **", which was live on the site.
 *
 * `hint` renders below the control and hands its id to the render prop, so the
 * caller can wire aria-describedby without inventing a second id scheme.
 */
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: (id: string, hintId: string | undefined) => React.ReactNode
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-text-muted uppercase tracking-widest mb-2">
        {label}
        {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
      </label>
      {children(id, hintId)}
      {hint && (
        <p id={hintId} className="text-xs text-text-muted mt-1.5 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  )
}
