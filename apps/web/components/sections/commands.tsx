import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsUrl } from "@evnx/config";
import { commands } from "@evnx/content";
import { Spot } from "@/components/art/spots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandPill } from "@/components/ui/command-pill";
import { SectionHeading } from "./section-shell";

/**
 * The six pillars (DESIGN-BRIEF §4.5): the job as the title, the command as a
 * pill that links to its guide.
 *
 * ⚠️ The card is NOT a link any more. It used to be one big <a>, and a pill
 * inside it would be a link inside a link — invalid HTML that browsers repair
 * unpredictably and screen readers announce twice. The pill is the link.
 */
export function Commands() {
  return (
    <>
      <SectionHeading eyebrow={commands.eyebrow} heading={commands.heading} lede={commands.lede} />

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {commands.featured.map((c) => (
          <li key={c.id}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                {c.spot && <Spot id={c.spot} size={44} className="mb-2" />}
                <CardTitle className="text-lg">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-text-secondary leading-relaxed flex-1">{c.body}</p>
                {c.command && (
                  <div>
                    <CommandPill href={docsUrl(`commands/${c.command.guide}`)}>
                      {c.command.label}
                    </CommandPill>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Link
        href={docsUrl(commands.allCommandsLink.docsSlug)}
        className="inline-flex items-center gap-1 mt-8 text-brand-400 hover:underline underline-offset-4"
      >
        {commands.allCommandsLink.label}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </>
  );
}
