'use client'
/**
 * TestimonialForm
 *
 * Two-mode form: personal user OR company.
 * Uploads avatar/logo to Supabase Storage, stores metadata in testimonials table.
 * Submitted testimonials are NOT shown until approved = true (set manually in
 * Supabase dashboard or via a private admin route).
 *
 * Usage:
 *   <TestimonialForm />
 */

import { useState, useRef } from 'react'
import { Upload, User, Building2, Check, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Mode     = 'user' | 'company'
type Status   = 'idle' | 'loading' | 'success' | 'error'

const MAX_FILE_SIZE = 2 * 1024 * 1024  // 2MB

export function TestimonialForm() {
  const [mode, setMode]         = useState<Mode>('user')
  const [status, setStatus]     = useState<Status>('idle')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imageError, setImageError]     = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name:        '',
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

  async function uploadImage(file: File): Promise<string | null> {
    const bucket = mode === 'user' ? 'avatars' : 'logos'
    const path   = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '-')}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false })

    if (error) {
      console.error('[testimonial] upload error:', error)
      return null
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return

    setStatus('loading')

    let imageUrl: string | null = null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    const payload = {
      type:        mode,
      name:        form.name.trim(),
      role:        form.role.trim() || undefined,
      company:     form.company.trim() || undefined,
      website_url: form.website_url.trim() || undefined,
      social_url:  form.social_url.trim() || undefined,
      message:     form.message.trim(),
      ...(mode === 'user'    ? { avatar_url: imageUrl ?? undefined } : {}),
      ...(mode === 'company' ? { logo_url:   imageUrl ?? undefined } : {}),
    }

    const { error } = await supabase.from('testimonials').insert(payload)

    if (error) {
      console.error('[testimonial] insert error:', error)
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="w-6 h-6 text-success" />
        </div>
        <h3 className="font-serif text-xl font-bold">Thank you!</h3>
        <p className="font-mono text-sm text-text-muted max-w-sm">
          Your testimonial is in review. We'll add it to the site once approved — usually within 24–48 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-bg-surface border border-border-muted rounded-lg">
        {(['user', 'company'] as const).map(m => (
          <button
            key={m}
            type="button"
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
        <label className="block font-mono text-xs text-text-muted uppercase tracking-widest mb-2">
          {mode === 'user' ? 'Profile photo' : 'Company logo'} (optional)
        </label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover border border-border-muted"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-surface border-2 border-dashed border-border-muted flex items-center justify-center text-text-muted">
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
            />
            <label
              htmlFor="image-upload"
              className="flex items-center gap-2 font-mono text-xs px-4 py-2 border border-border-muted rounded cursor-pointer hover:border-brand-500 hover:text-brand-400 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload image
            </label>
            <p className="font-mono text-xs text-text-muted mt-1">PNG, JPG up to 2MB</p>
            {imageError && <p className="font-mono text-xs text-danger mt-1">{imageError}</p>}
          </div>
        </div>
      </div>

      {/* Name */}
      <Field label="Your name *" required>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder={mode === 'user' ? 'Jane Smith' : 'Acme Corp'}
          required
          className={INPUT}
        />
      </Field>

      {/* Role / title */}
      <Field label={mode === 'user' ? 'Role & company' : 'Industry / tagline'}>
        <input
          type="text"
          value={form.role}
          onChange={e => set('role', e.target.value)}
          placeholder={mode === 'user' ? 'Senior Engineer at Stripe' : 'B2B SaaS · 200 employees'}
          className={INPUT}
        />
      </Field>

      {/* Website (company only) */}
      {mode === 'company' && (
        <Field label="Company website">
          <input
            type="url"
            value={form.website_url}
            onChange={e => set('website_url', e.target.value)}
            placeholder="https://acme.com"
            className={INPUT}
          />
        </Field>
      )}

      {/* Social profile */}
      <Field label={mode === 'user' ? 'GitHub / LinkedIn / Twitter URL' : 'Twitter / LinkedIn URL'}>
        <input
          type="url"
          value={form.social_url}
          onChange={e => set('social_url', e.target.value)}
          placeholder="https://github.com/janesmith"
          className={INPUT}
        />
      </Field>

      {/* Message */}
      <Field label="Your experience with evnx *" required>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Tell us how evnx helped you or your team..."
          required
          rows={4}
          minLength={30}
          maxLength={500}
          className={`${INPUT} resize-none`}
        />
        <p className="font-mono text-xs text-text-muted mt-1 text-right">
          {form.message.length}/500
        </p>
      </Field>

      {status === 'error' && (
        <p className="font-mono text-xs text-danger">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !form.name || !form.message}
        className="w-full flex items-center justify-center gap-2 font-mono font-semibold text-sm bg-brand-500 text-black py-3 rounded-lg hover:bg-brand-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          : 'Submit testimonial'}
      </button>

      <p className="font-mono text-xs text-text-muted text-center">
        Testimonials are reviewed before appearing on the site.
      </p>
    </form>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const INPUT = 'w-full font-mono text-sm bg-bg-surface border border-border-muted rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 transition-colors'

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block font-mono text-xs text-text-muted uppercase tracking-widest mb-2">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}