import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CONSENT_TEXT } from "@/lib/testimonial-consent";

/**
 * Testimonial submission.
 *
 * ⚠️ This route exists because the form used to insert into Supabase DIRECTLY
 * from the browser with the public anon key, and `approved` is an ordinary
 * column on that table. Anyone could read the anon key out of the JS bundle —
 * it is public by design — and POST
 *
 *     {"type":"user","name":"…","message":"…","approved":true}
 *
 * to /rest/v1/testimonials, publishing arbitrary text and an arbitrary link on
 * the marketing site with no review. The same key carried an unauthenticated
 * upload into the `avatars` and `logos` buckets, whose 2MB and image/* limits
 * were enforced in the browser only.
 *
 * Everything is now decided here: `approved` is hard-coded false, the size and
 * type checks are real, and the image is uploaded with the service role. That
 * makes it safe to REVOKE the anon INSERT grant on the table and on both
 * buckets — which is the half of this fix that lives in Supabase, not in git.
 *
 * ⚠️ There is still no rate limit. A serverless in-memory counter would reset
 * per instance and only look like one, so there is deliberately none here —
 * put Vercel Firewall or a Turnstile token in front of this route instead.
 */

const MESSAGE_MIN = 30;
const MESSAGE_MAX = 500;
const NAME_MAX = 80;
const ROLE_MAX = 120;
const URL_MAX = 200;
const EMAIL_MAX = 254; // RFC 5321 maximum path length
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * ⚠️ SVG is NOT here on purpose. It is a script-bearing document, and these
 * buckets are world-readable, so accepting one means hosting attacker content
 * on a URL that belongs to us.
 */
type Signature = { offset: number; bytes: number[] };

const ALLOWED: Record<string, { ext: string; magic: Signature[] }> = {
  "image/png":  { ext: ".png",  magic: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }] },
  "image/jpeg": { ext: ".jpg",  magic: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }] },
  "image/gif":  { ext: ".gif",  magic: [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }] },
  // ⚠️ Both halves. "RIFF" alone is also a WAV and an AVI, so checking only
  // the first four bytes would accept audio and video as a profile picture.
  "image/webp": {
    ext: ".webp",
    magic: [
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
      { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    ],
  },
};

/**
 * ⚠️ Mirrors the CHECK on `testimonials.use_cases` in
 * issue_triage/testimonials-provenance.sql. An unknown value is DROPPED here
 * rather than rejected: the chips are optional garnish, and failing a
 * submission someone spent five minutes writing because a facet name drifted
 * would trade their work for a constraint they cannot see. The database still
 * refuses one if this list ever falls behind, so the honest failure mode is
 * preserved — it just is not the submitter's problem.
 */
const USE_CASES = ["scan", "validate", "cloud", "ci", "migrate", "convert", "diff"] as const;

function cleanUseCases(values: FormDataEntryValue[]): string[] {
  const seen = new Set<string>();
  for (const v of values) {
    if (typeof v === "string" && (USE_CASES as readonly string[]).includes(v)) seen.add(v);
  }
  return Array.from(seen);
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // fallback for dev

  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

/** Trim, collapse whitespace, cap length. Empty becomes null, never "". */
function clean(value: FormDataEntryValue | null, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.replace(/\s+/g, " ").trim().slice(0, max);
  return v.length > 0 ? v : null;
}

/**
 * ⚠️ Only http(s), and only an absolute URL. A `javascript:` href rendered by
 * the testimonial card would be stored XSS, and the card links this value.
 */
function cleanUrl(value: FormDataEntryValue | null): string | null {
  const raw = clean(value, URL_MAX);
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * ⚠️ Deliberately loose. The only thing this has to catch is a typo or a blank,
 * because the address is verified the way addresses are actually verified —
 * by someone mailing it and getting a reply. A stricter regex rejects valid
 * addresses and still cannot tell you whether anyone reads them.
 */
function cleanEmail(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase().slice(0, EMAIL_MAX);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

export async function POST(req: NextRequest) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const type = fd.get("type");
  if (type !== "user" && type !== "company") {
    return NextResponse.json({ error: "type must be 'user' or 'company'" }, { status: 400 });
  }

  const name = clean(fd.get("name"), NAME_MAX);
  const messageRaw = fd.get("message");
  const message =
    typeof messageRaw === "string" ? messageRaw.trim().slice(0, MESSAGE_MAX) : null;

  if (!name) {
    return NextResponse.json({ error: "A name is required" }, { status: 400 });
  }
  if (!message || message.length < MESSAGE_MIN) {
    return NextResponse.json(
      { error: `Your testimonial needs at least ${MESSAGE_MIN} characters` },
      { status: 400 },
    );
  }

  const email = cleanEmail(fd.get("email"));
  if (!email) {
    return NextResponse.json(
      { error: "A valid email address is required so we can confirm this with you" },
      { status: 400 },
    );
  }

  // ⚠️ Refused, not silently stored as false. Publishing someone's name,
  // employer, photo and words on a commercial site needs a yes, and a row
  // with consent_at NULL is one you cannot publish — so accepting it would
  // only manufacture work for whoever reviews it.
  if (fd.get("consent") !== "true") {
    return NextResponse.json(
      { error: "Please tick the box to confirm we can publish this" },
      { status: 400 },
    );
  }

  // ── Image, if there is one ─────────────────────────────────────────────────
  // ⚠️ Validated BEFORE the client is built. These checks cost nothing and
  // depend on nothing, so a deployment with no Supabase env must not answer
  // "service unavailable" to a submission that was going to be rejected for
  // carrying a WAV file renamed to .png.
  const file = fd.get("image");
  let validated: { bytes: Uint8Array; contentType: string; ext: string } | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
    }

    const spec = ALLOWED[file.type];
    if (!spec) {
      return NextResponse.json(
        { error: "Image must be a PNG, JPEG, WebP or GIF" },
        { status: 400 },
      );
    }

    // ⚠️ The declared Content-Type is attacker-controlled; the bytes are not.
    // every(): all signatures must match, because a format can need two.
    const bytes = new Uint8Array(await file.arrayBuffer());
    const matches = spec.magic.every(sig =>
      sig.bytes.every((b, i) => bytes[sig.offset + i] === b),
    );
    if (!matches) {
      return NextResponse.json(
        { error: "That file is not the image type it claims to be" },
        { status: 400 },
      );
    }

    validated = { bytes, contentType: file.type, ext: spec.ext };
  }

  let supabase: ReturnType<typeof getSupabase>;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error("[testimonials route] not configured:", err);
    return NextResponse.json({ error: "Submissions are not configured" }, { status: 503 });
  }

  let upload: { bucket: string; path: string; url: string } | null = null;
  if (validated) {
    const bucket = type === "user" ? "avatars" : "logos";
    // ⚠️ A UUID, never the original filename. The buckets are world-readable
    // and listable, and the upload happens before review — `sioux-logo.png`
    // published the name of a company that had submitted nothing yet.
    const path = `${crypto.randomUUID()}${validated.ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, validated.bytes, { contentType: validated.contentType, upsert: false });

    if (error) {
      console.error("[testimonials route] upload:", error);
      return NextResponse.json({ error: "Image upload failed" }, { status: 502 });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    upload = { bucket, path, url: data.publicUrl };
  }

  // ── The row ────────────────────────────────────────────────────────────────
  const { error } = await supabase.from("testimonials").insert({
    type,
    name,
    message,
    role: clean(fd.get("role"), ROLE_MAX),
    company: clean(fd.get("company"), ROLE_MAX),
    social_url: cleanUrl(fd.get("social_url")),
    // Optional chips. getAll, because a multi-select posts one entry per
    // value and fd.get would silently keep only the first.
    use_cases: cleanUseCases(fd.getAll("use_cases")),
    // ⚠️ PII. Never granted to anon, never rendered — see
    // issue_triage/testimonials-email-consent.sql, which revokes the
    // table-level select grant and re-issues it column by column.
    email,
    // ⚠️ Both written HERE, from the server's own constant. Taking either
    // from the request would make the record worthless: it would attest to
    // whatever the submitter's browser claimed they had been shown.
    consent_at: new Date().toISOString(),
    consent_text: CONSENT_TEXT,
    // ⚠️ Mode-scoped. The browser form only renders a website field for a
    // company, but the value used to survive a mode switch and be submitted
    // invisibly.
    website_url: type === "company" ? cleanUrl(fd.get("website_url")) : null,
    avatar_url: type === "user" ? (upload?.url ?? null) : null,
    logo_url: type === "company" ? (upload?.url ?? null) : null,
    // ⚠️ NOT taken from the request. This is the whole point of the route.
    approved: false,
    // ⚠️ Also not from the request. Anything arriving here came through the
    // form, so it carries consent_at and still needs the email round-trip
    // before `is_public` turns true. 'harvested' is a claim only the site
    // owner can make, by hand, in the dashboard — if the browser could set
    // it, the confirmation gate would be one form field away from bypassed.
    provenance: "form" as const,
  });

  if (error) {
    console.error("[testimonials route] insert:", error);
    // The service role can actually delete, so unlike the old client-side
    // path this cleanup is a guarantee rather than a hope.
    if (upload) {
      const { error: rmError } = await supabase.storage
        .from(upload.bucket)
        .remove([upload.path]);
      if (rmError) console.error("[testimonials route] orphan left:", upload.path, rmError);
    }
    return NextResponse.json({ error: "Could not save your testimonial" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
