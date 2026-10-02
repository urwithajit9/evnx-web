/**
 * AuthorNote
 *
 * Purpose: A personal aside from the author — a first-person observation,
 * anecdote, or opinion that sits outside the main instructional content.
 * Visually distinct from <Callout> (which is informational/warning) because
 * this is conversational and human, not a system message.
 *
 * Used in the origin story blog post and opinionated guides to add
 * personality without breaking the flow of the main content.
 *
 * Usage in MDX:
 *   <AuthorNote>
 *     I spent three hours debugging this before realising the issue was a
 *     trailing space in the value. evnx validate would have caught it
 *     immediately.
 *   </AuthorNote>
 *
 *   <AuthorNote author="Ajit Kumar">
 *     Custom author name if a guest contributor wrote this section.
 *   </AuthorNote>
 */

import { getAuthor } from "@/lib/content";

type Props = {
  author?: string; // author ID from content/authors/ — defaults to "ajit"
  children: React.ReactNode;
};

export function AuthorNote({ author = "ajit", children }: Props) {
  // Read author profile — falls back gracefully if file doesn't exist
  const profile = getAuthor(author);

  return (
    <aside className="my-8 flex gap-4 bg-bg-surface border border-border-muted rounded-xl p-5 relative overflow-hidden">
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500/60 via-brand-400/30 to-transparent rounded-l-xl" />

      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center font-mono font-bold text-brand-400 text-sm">
        {profile.name[0]}
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs font-semibold text-text-primary">
            {profile.name}
          </span>
          <span className="font-mono text-xs text-text-muted">
            {profile.role}
          </span>
        </div>
        <div className="text-sm text-text-secondary leading-relaxed italic [&>p]:mb-0 [&>p]:mt-0">
          {children}
        </div>
      </div>
    </aside>
  );
}
