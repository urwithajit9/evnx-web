import Link from "next/link";
import { BookOpen } from "lucide-react";

type PrerequisitesProps = { children: React.ReactNode };
type PrerequisiteProps = { href: string; children: React.ReactNode };

export function Prerequisites({ children }: PrerequisitesProps) {
  return (
    <div className="my-6 bg-bg-surface border border-border-muted rounded-lg p-4">
      <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
        <BookOpen className="w-3 h-3" />
        Before you start
      </p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

export function Prerequisite({ href, children }: PrerequisiteProps) {
  return (
    <li>
      <Link
        href={href}
        className="font-mono text-sm text-brand-400 hover:text-brand-300 transition-colors"
      >
        → {children}
      </Link>
    </li>
  );
}
