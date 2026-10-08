import { TestimonialsGrid } from '@/components/ui/testimonials-grid'
import { TestimonialForm }  from '@/components/ui/testimonial-form'
import type { Metadata } from 'next'
import { canonicalUrl } from "@evnx/config";

export const metadata: Metadata = {
  title: 'What engineers are saying — evnx',
  description: 'Real feedback from developers and teams using evnx to secure their environment files.',
  alternates: { canonical: canonicalUrl("/testimonials") },
}

/**
 * 1h → 5m.
 *
 * ⚠️ NOT a fix for a frozen page. Measured both ways with `next build`: with no
 * `revalidate` export this page inherits Next 16's 1h default, exactly like
 * /privacy, so an approved row did appear on its own — within the hour.
 *
 * 5m is here because approving a testimonial is a manual act in the Supabase
 * dashboard, and the very next thing anyone does is reload this page to check.
 * An hour of looking at your own approved row and not seeing it is long enough
 * to go hunting for a bug in the query instead.
 */
export const revalidate = 300

export default function TestimonialsPage() {
  return (
    <div>
      {/* ⚠️ The h1 lives here, NOT in the grid — the grid renders nothing when
          there are no approved rows, and for as long as that is true the page
          had no h1 at all. Every other page in this app has one. */}
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            What engineers are saying
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">
            Unedited, and reviewed by a human before it appears here. If evnx
            has saved you a bad afternoon, tell us about it below.
          </p>
        </div>
      </section>

      {/* Approved testimonials — server-rendered, only approved=true rows.
          Renders nothing at all while the table has none. */}
      <TestimonialsGrid limit={24} />

      {/* Submission form */}
      <section className="py-24 border-t border-border-subtle">
        <div className="container-base max-w-2xl">
          <div className="mb-10">
            <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
              Share your experience
            </p>
            <h2 className="font-serif text-3xl font-bold mb-4">
              Add your testimonial
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Tell us how evnx helped you or your team. Testimonials are reviewed
              before appearing on the site — usually within 24–48 hours.
            </p>
          </div>
          <TestimonialForm />
        </div>
      </section>
    </div>
  )
}
