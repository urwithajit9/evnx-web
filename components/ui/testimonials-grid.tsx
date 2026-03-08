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
import { Building2, User, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Testimonial = Database['public']['Tables']['testimonials']['Row']

async function getTestimonials(limit: number): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[TestimonialsGrid]', error.message)
    return []
  }

  // Cast needed: supabase-js v2 sometimes infers {}[] for .select('*')
  // even with a fully typed Database generic on the client.
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

function TestimonialCard({ t }: { t: Testimonial }) {
  const imageUrl = t.type === 'user' ? t.avatar_url : t.logo_url
  const linkUrl  = t.website_url ?? t.social_url ?? null

  return (
    <div className="break-inside-avoid bg-bg-surface border border-border-muted rounded-xl p-6 relative overflow-hidden hover:border-border-default transition-colors">
      <span className="absolute top-4 right-5 font-serif text-5xl text-brand-500/10 select-none leading-none">
        "
      </span>

      <p className="text-sm text-text-secondary leading-relaxed mb-6 relative z-10">
        &ldquo;{t.message}&rdquo;
      </p>

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
    </div>
  )
}