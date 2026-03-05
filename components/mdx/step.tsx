/**
 * Step
 *
 * Purpose: Numbered step container for sequential how-to guides. Replaces
 * plain "## Step 1 — Do the thing" headings with a visually connected
 * timeline-style layout. The vertical line connecting steps only shows
 * when steps are placed consecutively.
 *
 * Usage in MDX:
 *   <Step number={1} title="Install evnx">
 *     Run the install script on your machine.
 *     ```bash
 *     curl -fsSL https://dotenv.space/install.sh | bash
 *     ```
 *   </Step>
 *
 *   <Step number={2} title="Run doctor">
 *     Check your environment is healthy.
 *   </Step>
 */

type Props = {
  number: number;
  title: string;
  children: React.ReactNode;
};

export function Step({ number, title, children }: Props) {
  return (
    <div className="relative flex gap-6 my-8 group">
      {/* Number column */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Circle with number */}
        <div className="w-9 h-9 rounded-full border-2 border-brand-500 bg-brand-500/10 flex items-center justify-center flex-shrink-0 z-10">
          <span className="font-mono text-sm font-bold text-brand-400">
            {number}
          </span>
        </div>
        {/* Connector line — connects to next step */}
        <div className="w-px flex-1 bg-border-muted mt-2 min-h-[24px]" />
      </div>

      {/* Content column */}
      <div className="flex-1 pb-8 min-w-0">
        <h3 className="font-serif text-xl font-bold text-text-primary mb-4 mt-1 leading-snug">
          {title}
        </h3>
        <div className="text-text-secondary leading-relaxed [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
