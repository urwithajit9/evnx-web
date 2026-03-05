import { createClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      helpful_votes: {
        Row: {
          id: string;
          page_slug: string;
          vote: "yes" | "no";
          session_id: string;
          created_at: string;
        };
        Insert: { page_slug: string; vote: "yes" | "no"; session_id: string };
        Update: never;
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          created_at: string;
        };
        Insert: { email: string; source?: string };
        Update: never;
      };
      testimonials: {
        Row: {
          id: string;
          type: "user" | "company";
          name: string;
          role: string | null;
          company: string | null;
          website_url: string | null;
          avatar_url: string | null;
          logo_url: string | null;
          social_url: string | null;
          message: string;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          type: "user" | "company";
          name: string;
          message: string;
          role?: string;
          company?: string;
          website_url?: string;
          avatar_url?: string;
          logo_url?: string;
          social_url?: string;
        };
        Update: never;
      };
    };
  };
};

// Uses the public anon key — safe to use in client components
// RLS policies control what each role can read/write
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
