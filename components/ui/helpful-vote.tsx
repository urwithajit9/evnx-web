"use client";
/**
 * HelpfulVote
 *
 * Shown at the bottom of every guide and blog post.
 * Stores votes in Supabase. Uses a session ID (UUID stored in localStorage)
 * so the same visitor can't vote twice on the same page.
 *
 * Usage:
 *   <HelpfulVote slug="guides/commands/scan" />
 *   <HelpfulVote slug={`blog/${post.slug}`} />
 */

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  slug: string;
};

type VoteCounts = { yes: number; no: number };

// Generate or retrieve anonymous session ID
function getSessionId(): string {
  const key = "evnx_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function HelpfulVote({ slug }: Props) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const [counts, setCounts] = useState<VoteCounts>({ yes: 0, no: 0 });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Load existing vote + counts on mount
  useEffect(() => {
    const sessionId = getSessionId();

    async function load() {
      // Get all votes for this page
      const { data } = await supabase
        .from("helpful_votes")
        .select("vote, session_id")
        .eq("page_slug", slug);

      if (data) {
        const yes = data.filter((r) => r.vote === "yes").length;
        const no = data.filter((r) => r.vote === "no").length;
        setCounts({ yes, no });

        // Did this visitor already vote?
        const existing = data.find((r) => r.session_id === sessionId);
        if (existing) setVoted(existing.vote as "yes" | "no");
      }
      setReady(true);
    }

    load();
  }, [slug]);

  async function castVote(vote: "yes" | "no") {
    if (voted || loading) return;
    setLoading(true);

    const sessionId = getSessionId();

    const { error } = await supabase
      .from("helpful_votes")
      .insert({ page_slug: slug, vote, session_id: sessionId });

    if (!error) {
      setVoted(vote);
      setCounts((prev) => ({ ...prev, [vote]: prev[vote] + 1 }));
    }

    setLoading(false);
  }

  if (!ready) return null; // avoid hydration mismatch

  if (voted) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-text-muted">
          {voted === "yes"
            ? "Thanks! Glad it helped. 🙌"
            : "Thanks for the feedback. We'll improve this."}
        </span>
        <span className="font-mono text-xs text-text-muted">
          ({counts.yes} found this helpful)
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm text-text-muted">
        Was this helpful?
      </span>

      <button
        onClick={() => castVote("yes")}
        disabled={loading}
        className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border border-border-muted rounded hover:border-success hover:text-success hover:bg-success/5 transition-all disabled:opacity-50"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        Yes{" "}
        {counts.yes > 0 && (
          <span className="text-text-muted">({counts.yes})</span>
        )}
      </button>

      <button
        onClick={() => castVote("no")}
        disabled={loading}
        className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border border-border-muted rounded hover:border-danger hover:text-danger hover:bg-danger/5 transition-all disabled:opacity-50"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
        No{" "}
        {counts.no > 0 && (
          <span className="text-text-muted">({counts.no})</span>
        )}
      </button>
    </div>
  );
}
