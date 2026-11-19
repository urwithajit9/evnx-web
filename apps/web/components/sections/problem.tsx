import { docsUrl } from "@evnx/config";
import { problem } from "@evnx/content";
import { Spot } from "@/components/art/spots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandPill } from "@/components/ui/command-pill";
import { SectionHeading } from "./section-shell";

/**
 * The two failure modes — leaks and drift — each with the commands that catch
 * it. The pills are real text linking to the guides (D-V9); the spots are art.
 */
export function Problem() {
  return (
    <>
      <SectionHeading eyebrow={problem.eyebrow} heading={problem.heading} lede={problem.lede} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {problem.modes.map((m) => (
          <Card key={m.id}>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <CardTitle className="text-2xl">{m.title}</CardTitle>
              <Spot id={m.spot} size={48} className="shrink-0" />
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary leading-relaxed mb-5">{m.body}</p>
              <ul className="flex flex-wrap gap-2" aria-label={`Commands for: ${m.title.toLowerCase()}`}>
                {m.commands.map((c) => (
                  <li key={c.label}>
                    <CommandPill href={docsUrl(`commands/${c.guide}`)}>{c.label}</CommandPill>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-lg font-medium text-text-primary">{problem.close}</p>
    </>
  );
}
