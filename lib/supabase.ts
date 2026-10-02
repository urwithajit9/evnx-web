import { createClient } from '@supabase/supabase-js'

/**
 * Database type for supabase-js v2.x
 *
 * The SDK requires ALL of these fields to be present on each schema:
 *   Tables, Views, Functions, Enums, CompositeTypes
 * AND each Table entry must have a Relationships array.
 *
 * Without them, supabase-js v2.50+ collapses table types to `never`,
 * causing "No overload matches this call" errors on .insert() / .select().
 */
export type Database = {
  public: {
    Tables: {
      helpful_votes: {
        Row: {
          id:         string
          page_slug:  string
          vote:       'yes' | 'no'
          session_id: string
          created_at: string
        }
        Insert: {
          page_slug:  string
          vote:       'yes' | 'no'
          session_id: string
          id?:        string
          created_at?: string
        }
        Update: {
          page_slug?:  string
          vote?:       'yes' | 'no'
          session_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          id:         string
          email:      string
          source:     string | null
          created_at: string
        }
        Insert: {
          email:       string
          source?:     string | null
          id?:         string
          created_at?: string
        }
        Update: {
          email?:  string
          source?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id:          string
          type:        'user' | 'company'
          name:        string
          role:        string | null
          company:     string | null
          website_url: string | null
          avatar_url:  string | null
          logo_url:    string | null
          social_url:  string | null
          message:     string
          approved:    boolean
          created_at:  string
        }
        Insert: {
          type:         'user' | 'company'
          name:         string
          message:      string
          role?:        string | null
          company?:     string | null
          website_url?: string | null
          avatar_url?:  string | null
          logo_url?:    string | null
          social_url?:  string | null
          approved?:    boolean
          id?:          string
          created_at?:  string
        }
        Update: {
          type?:        'user' | 'company'
          name?:        string
          message?:     string
          role?:        string | null
          company?:     string | null
          website_url?: string | null
          avatar_url?:  string | null
          logo_url?:    string | null
          social_url?:  string | null
          approved?:    boolean
        }
        Relationships: []
      }
    }
    Views:          Record<string, never>
    Functions:      Record<string, never>
    Enums:          Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Whether Supabase is configured in this environment.
 *
 * ⚠️ **Every entry point below must check this before touching the client.**
 *
 * The two `!` assertions that used to be here were a lie: the variables are
 * genuinely absent on a fresh clone, so `createClient` threw at module-eval
 * time and `next build` died collecting page data for `/testimonials`. The
 * whole production build of a marketing site failed because a testimonials
 * widget could not reach a database — and it failed on a clean checkout, so
 * nobody could build the repo without credentials.
 *
 * There is a joke in a `.env` tool shipping that, and it is not a good one.
 *
 * Supabase here backs four optional widgets: testimonials, the waitlist, the
 * helpful-vote control and the testimonial form. None of them is load-bearing
 * for a single page of content, so none of them may take the build down.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Single typed client. The anon key is intentionally public; RLS policies are
 * the security boundary.
 *
 * ⚠️ When unconfigured this points at `.invalid` — a reserved TLD that is
 * guaranteed never to resolve, so a missed guard fails instantly and loudly
 * instead of hanging or, worse, reaching something real. Typed non-nullable
 * deliberately: nine call sites across four components would each need a null
 * check, and a forgotten one would be a crash rather than a disabled widget.
 * The flag is the guard; this value exists only to satisfy the type.
 */
export const supabase = createClient<Database>(
  url ?? 'https://unconfigured.invalid',
  anonKey ?? 'unconfigured',
)

if (!isSupabaseConfigured && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are not set — ' +
      'testimonials, waitlist and vote widgets are disabled. See .env.example.',
  )
}