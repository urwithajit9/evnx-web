import { TestimonialsGrid } from '@/components/ui/testimonials-grid'
import { TestimonialForm }  from '@/components/ui/testimonial-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What engineers are saying — evnx',
  description: 'Real feedback from developers and teams using evnx to secure their environment files.',
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen">
      {/* Approved testimonials — server-rendered, only approved=true rows */}
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