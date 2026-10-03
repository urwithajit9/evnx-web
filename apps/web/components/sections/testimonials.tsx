import { TESTIMONIALS_ENABLED } from "@evnx/config";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { TestimonialsGrid } from "@/components/ui/testimonials-grid";
import { SectionHeading } from "./section-shell";

/**
 * ⚠️ Two independent gates, and both are deliberate.
 *
 * 1. `TESTIMONIALS_ENABLED` — the editorial decision. Off until there are
 *    enough approved testimonials that showing them helps.
 * 2. `TestimonialsGrid` returns null when the query comes back empty — the
 *    data reality. The grid only ever selects `approved = true`.
 *
 * Either one alone would be enough on a good day. Together they mean the flag
 * cannot be flipped on prematurely into an empty band, and a row being
 * un-approved in Supabase cannot leave a heading with nothing under it. The
 * failure mode this prevents — "What engineers are saying" above white space —
 * is worse than not having the section at all.
 */
/**
 * Whether there is anything to show — the flag AND at least one approved row.
 *
 * ⚠️ Asked before the band is drawn, not inside it. The grid returning null
 * is too late: the section wrapper has already rendered its border and
 * padding by then.
 */
export async function hasApprovedTestimonials(): Promise<boolean> {
  if (!TESTIMONIALS_ENABLED || !isSupabaseConfigured) return false;
  const { count, error } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true })
    .eq("approved", true);
  return !error && (count ?? 0) > 0;
}

export async function Testimonials() {
  if (!TESTIMONIALS_ENABLED) return null;

  return (
    <>
      <SectionHeading
        heading="What engineers are saying"
        lede="Unedited, and only published once the person who wrote it has confirmed it."
      />
      <TestimonialsGrid limit={6} />
    </>
  );
}
