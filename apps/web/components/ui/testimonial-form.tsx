'use client'
/**
 * TestimonialForm
 *
 * Two-mode form: personal user OR company.
 * Uploads avatar/logo to Supabase Storage, stores metadata in testimonials table.
 * Submitted testimonials are NOT shown until approved = true (set manually in
 * Supabase dashboard or via a private admin route).
 *
 * ⚠️ Submits to POST /api/testimonials, NOT to Supabase directly. It used to
 * insert with the public anon key, which let anyone who read that key out of
 * the JS bundle set `approved: true` themselves. Validation, the size and
 * type checks and the image upload are all decided server-side now; nothing
 * here is a security boundary, and nothing here needs to be.
 *
 * Usage:
 *   <TestimonialForm />
 */

import { useId, useRef, useState } from 'react'
import { Upload, User, Building2, Check, Loader2, X } from 'lucide-react'
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

export function TestimonialForm() {
  const [mode, setMode]         = useState<Mode>('user')
  const [status, setStatus]     = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imageError, setImageError]     = useState<string | null>(null)
  const [consent, setConsent]           = useState(false)
  const consentId = useId()
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
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="w-6 h-6 text-success" />
        </div>
        <h3 className="font-serif text-xl font-bold">Thank you!</h3>
        <p className="font-mono text-sm text-text-muted max-w-sm">
          Your testimonial is in review. We&apos;ll email you at{' '}
          <span className="text-text-secondary">{form.email}</span> to confirm before
          it appears on the site — usually within 24–48 hours.
        </p>
      </div>
    )
  }

  const messageShort = form.message.trim().length > 0 && form.message.trim().length < MESSAGE_MIN

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">

      {/* Mode toggle */}
      <div
        role="radiogroup"
        aria-label="Submitting as"
        className="flex gap-2 p-1 bg-bg-surface border border-border-muted rounded-lg"
      >
        {(['user', 'company'] as const).map(m => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-mono text-sm transition-all ${
              mode === m
                ? 'bg-bg-overlay text-text-primary border border-border-muted'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {m === 'user' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            {m === 'user' ? 'Personal' : 'Company'}
          </button>
        ))}
      </div>

      {/* Image upload */}
      <div>
        <label
          htmlFor="image-upload"
          className="block font-mono text-xs text-text-muted uppercase tracking-widest mb-2"
        >
          {mode === 'user' ? 'Profile photo' : 'Company logo'} (optional)
        </label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt=""
                className="w-16 h-16 rounded-full object-cover border border-border-muted"
              />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove selected image"
                className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="w-16 h-16 rounded-full bg-bg-surface border-2 border-dashed border-border-muted flex items-center justify-center text-text-muted"
            >
              {mode === 'user' ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              aria-describedby="image-hint"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center gap-2 font-mono text-xs px-4 py-2 border border-border-muted rounded cursor-pointer hover:border-brand-500 hover:text-brand-400 transition-colors w-fit"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload image
            </label>
            <p id="image-hint" className="font-mono text-xs text-text-muted mt-1">PNG, JPG up to 2MB</p>
            {imageError && (
              <p role="alert" className="font-mono text-xs text-danger mt-1">{imageError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <Field label="Your name" required>
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
            className={INPUT}
          />
        )}
      </Field>

      {/* Email */}
      <Field label="Your email" required>
        {id => (
          <>
            <input
              id={id}
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="jane@example.com"
              required
              maxLength={EMAIL_MAX}
              autoComplete="email"
              aria-describedby={`${id}-hint`}
              className={INPUT}
            />
            <p id={`${id}-hint`} className="font-mono text-xs text-text-muted mt-1">
              Not published. We email you before this goes live, and nowhere else.
            </p>
          </>
        )}
      </Field>

      {/* Role / title */}
      <Field label={mode === 'user' ? 'Role & company' : 'Industry / tagline'}>
        {id => (
          <input
            id={id}
            type="text"
            value={form.role}
            onChange={e => set('role', e.target.value)}
            placeholder={mode === 'user' ? 'Senior Engineer at Stripe' : 'B2B SaaS · 200 employees'}
            maxLength={ROLE_MAX}
            className={INPUT}
          />
        )}
      </Field>

      {/* Website (company only) */}
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
              className={INPUT}
            />
          )}
        </Field>
      )}

      {/* Social profile */}
      <Field label={mode === 'user' ? 'GitHub / LinkedIn / Twitter URL' : 'Twitter / LinkedIn URL'}>
        {id => (
          <input
            id={id}
            type="url"
            value={form.social_url}
            onChange={e => set('social_url', e.target.value)}
            placeholder="https://github.com/janesmith"
            maxLength={URL_MAX}
            className={INPUT}
          />
        )}
      </Field>

      {/* Message */}
      <Field label="Your experience with evnx" required>
        {id => (
          <>
            <textarea
              id={id}
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="Tell us how evnx helped you or your team..."
              required
              rows={4}
              minLength={MESSAGE_MIN}
              maxLength={MESSAGE_MAX}
              aria-describedby={`${id}-count`}
              className={`${INPUT} resize-none`}
            />
            {/* ⚠️ The floor is stated, not just enforced. minLength={30} was
                silently blocking submit with a browser tooltip and the counter
                showed only "0/500" — nothing told anyone 30 was the bar. */}
            <p
              id={`${id}-count`}
              className={`font-mono text-xs mt-1 text-right ${messageShort ? 'text-danger' : 'text-text-muted'}`}
            >
              {messageShort
                ? `${MESSAGE_MIN - form.message.trim().length} more character${MESSAGE_MIN - form.message.trim().length === 1 ? '' : 's'} needed`
                : `${form.message.length}/${MESSAGE_MAX}`}
            </p>
          </>
        )}
      </Field>

      {/* ⚠️ Unticked by default, and the submit button respects it. A
          pre-ticked box is not consent, and this one is the record that we
          were allowed to publish someone's name and employer. */}
      <div className="flex gap-3 items-start pt-2">
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          required
          className="mt-0.5 w-4 h-4 flex-shrink-0 accent-brand-500 cursor-pointer"
        />
        <label htmlFor={consentId} className="font-mono text-xs text-text-secondary leading-relaxed cursor-pointer">
          {CONSENT_TEXT}{' '}
          <a href={CONSENT_PRIVACY_HREF} className="text-brand-400 hover:underline">
            Privacy policy
          </a>
          .
        </label>
      </div>

      {status === 'error' && errorMsg && (
        <p role="alert" className="font-mono text-xs text-danger">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={
          status === 'loading' ||
          !consent ||
          !form.name.trim() ||
          !form.email.trim() ||
          form.message.trim().length < MESSAGE_MIN
        }
        className="w-full flex items-center justify-center gap-2 font-mono font-semibold text-sm bg-brand-500 text-black py-3 rounded-lg hover:bg-brand-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          : 'Submit testimonial'}
      </button>

      <p className="font-mono text-xs text-text-muted text-center">
        Reviewed by a human, and confirmed with you by email, before anything appears.
      </p>
    </form>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const INPUT = 'w-full font-mono text-sm bg-bg-surface border border-border-muted rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 transition-colors'

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
 */
function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: (id: string) => React.ReactNode
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-xs text-text-muted uppercase tracking-widest mb-2">
        {label}
        {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
      </label>
      {children(id)}
    </div>
  )
}
