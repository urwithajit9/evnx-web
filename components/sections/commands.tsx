import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsUrl } from "@evnx/config";
import { commands } from "@evnx/content";
import { SectionHeading } from "./section-shell";

export function Commands() {
  return (
    <>
      <SectionHeading heading={commands.heading} lede={commands.lede} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {commands.featured.map((c) => (
          <Link
            key={c.id}
            href={docsUrl(`commands/${c.id}`)}
            className="group p-5 rounded-xl border border-border-muted bg-bg-surface hover:border-brand-500 transition-colors"
          >
            <h3 className={c.mono ? "font-mono text-sm text-brand-400 mb-2" : "font-medium mb-2"}>
              {c.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">{c.body}</p>
          </Link>
        ))}
      </div>

      <Link
        href={docsUrl(commands.allCommandsLink.docsSlug)}
        className="inline-flex items-center gap-1 mt-8 text-brand-400 hover:underline underline-offset-4"
      >
        {commands.allCommandsLink.label}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </>
  );
}
