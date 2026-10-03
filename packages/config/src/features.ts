// ─── Feature flags ────────────────────────────────────────────────────────────
//
// Things that are BUILT and WORKING but deliberately not shown yet.
//
// ⚠️ A flag is not a TODO. Everything behind one here is finished, tested and
// deployable — the flag exists because showing it now would be worse than not
// showing it, usually because there is no content behind it yet. If something
// is unfinished, it does not get a flag; it gets left out.

/**
 * Whether testimonials appear anywhere on the site.
 *
 * ⚠️ `false` until there are approved testimonials to show. Everything is
 * built: the Supabase table, the submission form, the approval gate (the grid
 * queries `approved = true` and shows nothing otherwise), and the page itself.
 *
 * What the flag controls is **promotion** — the nav entry, the footer link,
 * the sitemap entry and the landing-page section. `/testimonials` itself stays
 * reachable while this is false, because the submission form is how you
 * collect the testimonials that let you turn it on.
 *
 * ⚠️ Promoting an empty testimonials page is actively worse than having none.
 * A "What engineers are saying" link that leads to silence reads as a product
 * nobody is saying anything about — and Google treats a thin, linked, indexed
 * page as a quality signal about the whole site.
 *
 * Turn it on when there are at least three approved rows. Two looks like a
 * favour; one looks like a mistake.
 */
export const TESTIMONIALS_ENABLED =
  process.env.NEXT_PUBLIC_TESTIMONIALS_ENABLED === "true";

/**
 * Whether the paid plans can be bought without talking to anyone.
 *
 * ⚠️ Mirrors `BILLING_LIVE` in ./plans — kept there because `checkoutUrl()`
 * needs it and that is where the plan contract lives. Re-exported here so the
 * flags are discoverable in one place.
 */
export { BILLING_LIVE } from "./plans";
