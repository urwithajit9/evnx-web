/**
 * TestimonialsGrid — async Server Component
 *
 * Fetches approved testimonials server-side and renders them.
 * Returns null when no approved testimonials exist yet — safe to add
 * to the landing page before you have any.
 *
 * Usage:
 *   <TestimonialsGrid />          — default, up to 12
 *   <TestimonialsGrid limit={6} /> — landing page preview
 *   <TestimonialsGrid limit={24} /> — full /testimonials page
 */
import { Building2, User, ExternalLink, Link2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

/**
 * ⚠️ The columns anon is actually granted — NOT the whole Row.
 *
 * `select('*')` here used to be harmless because every column was public. It
 * stopped being harmless the moment the table grew an `email`: a table-level
 * SELECT grant covers columns added later, so `*` is how a contact address
 * reaches a public page. The grant is now per-column and this list mirrors it,
 * so adding a private column cannot silently widen what the site reads.
 *
 * Keep in step with `grant select (…)` in
 * issue_triage/testimonials-email-consent.sql.
 */
// ⚠️ ONE string literal, not a concatenation. supabase-js types the result
// by parsing this at the type level, and it can only do that for a literal —
// splitting it across a `+` makes the row type collapse to
// GenericStringError[] and the cast below stops compiling. Long line, but the
// alternative is casting through `unknown`, which would also swallow a real
// mismatch between this list and the Row type.
const PUBLIC_COLUMNS =
  'id, type, name, role, company, website_url, avatar_url, logo_url, social_url, message, created_at, headline, use_cases, provenance, source_url'

type Testimonial = Pick<
  Database['public']['Tables']['testimonials']['Row'],
  | 'id' | 'type' | 'name' | 'role' | 'company'
  | 'website_url' | 'avatar_url' | 'logo_url' | 'social_url'
  | 'message' | 'created_at'
  | 'headline' | 'use_cases' | 'provenance' | 'source_url'
>

async function getTestimonials(limit: number): Promise<Testimonial[]> {
  // ⚠️ This runs at BUILD time. Without the guard a missing env var took the
  // whole production build down — see `isSupabaseConfigured`.
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('testimonials')
    .select(PUBLIC_COLUMNS)
    // ⚠️ `is_public`, NOT `approved`. Generated in Postgres as
    // `approved AND (provenance = 'harvested' OR confirmed_at IS NOT NULL)`,
    // so ticking `approved` alone no longer publishes anything: a form
    // submission needs the email round-trip recorded, and a quote taken from
    // somewhere public needs to say so. Filtering on `confirmed_at` here
    // instead would have required granting that column to anon — PostgREST
    // needs the privilege to filter, not just to read — which would publish
    // the moment each person answered their email.
    // See issue_triage/testimonials-provenance.sql.
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[TestimonialsGrid]', error.message)
    return []
  }

  // Cast needed: supabase-js v2 sometimes infers {}[] for a string column
  // list even with a fully typed Database generic on the client.
  return (data ?? []) as Testimonial[]
}

type Props = { limit?: number }

export async function TestimonialsGrid({ limit = 12 }: Props) {
  const testimonials = await getTestimonials(limit)

  if (testimonials.length === 0) return null

  return (
    <section className="py-24 border-t border-border-subtle">
      <div className="container-base">
        <div className="mb-12 text-center">
          <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="font-serif text-3xl font-bold">
            What engineers are saying
          </h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map(t => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * ⚠️ The chips show a LABEL, never the stored value. The column is
 * constrained to this exact set in Postgres, so a value appearing here that
 * the map does not know is a schema change nobody finished — rendering the
 * raw key would quietly ship `convert` as a chip reading "convert".
 */
const USE_CASE_LABELS: Record<string, string> = {
  scan:     'Secret scanning',
  validate: 'Validation',
  cloud:    'Cloud sync',
  ci:       'CI/CD',
  migrate:  'Migration',
  convert:  'Format conversion',
  diff:     'Diffing',
  // ⚠️ A facet missing from this map is stored on the row and then never
  // rendered — the chip just does not appear on the published card, with no
  // error anywhere. `env-workflow` was added to the form alone and was missing
  // from here, from the API route, and from the database CHECK.
  'env-workflow': '.env workflow',
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const imageUrl = t.type === 'user' ? t.avatar_url : t.logo_url
  const linkUrl  = t.website_url ?? t.social_url ?? null

  return (
    <div className="break-inside-avoid bg-bg-surface border border-border-muted rounded-xl p-6 relative overflow-hidden hover:border-border-default transition-colors">
      <span className="absolute top-4 right-5 font-serif text-5xl text-brand-500/10 select-none leading-none">
        "
      </span>

      {/* A headline is written at review time, not submitted. When one exists
          it carries the card and the full quote sits under it. */}
      {t.headline && (
        <p className="font-serif text-lg font-bold text-text-primary leading-snug mb-3 relative z-10">
          {t.headline}
        </p>
      )}

      <p className="text-sm text-text-secondary leading-relaxed mb-4 relative z-10">
        &ldquo;{t.message}&rdquo;
      </p>

      {t.use_cases?.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-5 relative z-10">
          {t.use_cases.map(u =>
            USE_CASE_LABELS[u] ? (
              <li
                key={u}
                className="font-mono text-[10px] uppercase tracking-wider text-brand-400/80 bg-brand-500/10 border border-brand-500/20 rounded px-2 py-0.5"
              >
                {USE_CASE_LABELS[u]}
              </li>
            ) : null,
          )}
        </ul>
      )}

      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={t.name}
            className={`flex-shrink-0 object-cover border border-border-subtle ${
              t.type === 'user' ? 'w-10 h-10 rounded-full' : 'w-10 h-10 rounded-lg'
            }`}
          />
        ) : (
          <div className={`flex-shrink-0 w-10 h-10 bg-brand-500/10 flex items-center justify-center border border-brand-500/20 ${
            t.type === 'user' ? 'rounded-full' : 'rounded-lg'
          }`}>
            {t.type === 'user'
              ? <User className="w-4 h-4 text-brand-400" />
              : <Building2 className="w-4 h-4 text-brand-400" />
            }
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm font-semibold text-text-primary truncate">
              {t.name}
            </p>
            {linkUrl && (
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-text-muted hover:text-brand-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {t.role    && <p className="font-mono text-xs text-text-muted truncate">{t.role}</p>}
          {t.company && <p className="font-mono text-xs text-brand-500/70 truncate">{t.company}</p>}
        </div>
      </div>

      {/* ⚠️ Shown, not hidden. A harvested quote was never confirmed by email,
          so the link to where it was actually said is the only thing a reader
          can check it against. Saying nothing would make it indistinguishable
          from one the person approved directly. */}
      {t.provenance === 'harvested' && t.source_url && (
        <a
          href={t.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] text-text-muted hover:text-brand-400 transition-colors"
        >
          <Link2 className="w-3 h-3" />
          Said publicly here
        </a>
      )}
    </div>
  )
}