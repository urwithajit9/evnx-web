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
      {/* ⚠️ Not `section-padding` (py-16 md:py-24). On a phone that is 64px of
          nothing above the title and 64px below it, and this page's whole job
          is to get someone into the form. Measured: the first input sat at
          y=823 on an 812px-tall screen — a full screen of scrolling before
          anything could be typed. */}
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base py-10 sm:py-16 md:py-24">
          {/* ⚠️ 4xl on a phone, not 5xl. "What engineers are saying" wrapped to
              four lines at 5xl/360px and pushed the form a full screen down —
              on the one device most of this page's traffic arrives on. */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4">
            What engineers are saying
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed">
            Unedited, and reviewed by a human before it appears here. If evnx
            has saved you a bad afternoon, tell us about it below.
          </p>
        </div>
      </section>

      {/* Approved testimonials — server-rendered, only approved=true rows.
          Renders nothing at all while the table has none. */}
      <TestimonialsGrid limit={24} />

      {/* Submission form */}
      {/* ⚠️ max-w-3xl, and the form no longer caps itself at max-w-xl inside
          it. The two limits used to compound into a ~36rem column of stacked
          fields sitting in the middle of a 1280px page — mostly empty space,
          and twice as tall as it needed to be. */}
      <section className="py-16 sm:py-24 border-t border-border-subtle">
        <div className="container-base max-w-3xl">
          {/* ⚠️ The eyebrow and the intro paragraph that used to sit here are
              gone, and nothing was lost. "Share your experience" said the same
              thing as the h2 directly beneath it, and the paragraph's two
              claims are both already on the page — the hero asks for the
              testimonial, and the note under the submit button states the
              review and the email confirmation. Three headings stacked above
              the first field is how a short form reads as a long one. */}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
            Add your testimonial
          </h2>
          <TestimonialForm />
        </div>
      </section>
    </div>
  )
}
