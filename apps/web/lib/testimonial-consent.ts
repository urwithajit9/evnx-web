/**
 * The exact sentence someone agrees to when they submit a testimonial.
 *
 * ⚠️ Imported by BOTH the form that displays it and the route that stores it,
 * so the text recorded against a row is guaranteed to be the text that was on
 * screen. A consent record that says only `true` is worth very little later —
 * it cannot tell you what was agreed to, and the wording on the page will
 * change. The row keeps its own copy, so editing this constant re-words the
 * form for new submissions and leaves every existing record intact.
 *
 * ⚠️ Changing it is therefore a product decision, not copy-editing. Old rows
 * keep the old sentence on purpose; that is the whole point of storing it.
 */
export const CONSENT_TEXT =
  "I'm happy for evnx to publish this on evnx.dev, together with my name and " +
  "anything else I've filled in above, and to contact me at this address about it."

/** Where the privacy policy lives, shown next to the checkbox. */
export const CONSENT_PRIVACY_HREF = "/privacy"
