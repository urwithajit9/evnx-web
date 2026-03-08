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

// Single typed client — safe to use in both client and server components.
// The anon key is intentionally public; RLS policies are the security boundary.
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)