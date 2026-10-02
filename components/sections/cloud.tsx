import Link from "next/link";
import { appUrl, docsUrl, fillLimits } from "@evnx/config";
import { cloud } from "@evnx/content";
import { Badge } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-shell";

/**
 * ⚠️ This section describes a SHIPPED product.
 *
 * What it replaced said "coming soon" and offered a waitlist form, for a
 * feature that went live in v0.4.0 and has been through four releases since.
 * The call to action is an account, not an email box.
 */
export function Cloud() {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="success">live</Badge>
        <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
          {cloud.eyebrow}
        </span>
      </div>

      <SectionHeading heading={cloud.heading} lede={cloud.lede} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {cloud.capabilities.map((c) => (
          <div key={c.id} className="p-6 rounded-xl border border-border-muted bg-bg-base">
            <h3 className="font-serif text-lg font-bold mb-3">{c.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button asChild>
          <a href={appUrl("/register")}>{cloud.cta.primary}</a>
        </Button>
        <Link
          href={docsUrl(cloud.cta.secondaryDocsSlug)}
          className="text-brand-400 hover:underline underline-offset-4"
        >
          {cloud.cta.secondary}
        </Link>
      </div>

      {/* Real enforced numbers, from the server's own quotas. */}
      <p className="mt-5 text-sm text-text-muted">
        {fillLimits(cloud.freeTierNote, "free")}
      </p>
    </>
  );
}
