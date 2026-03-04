import { Info, AlertTriangle, XCircle, Lightbulb } from "lucide-react";

type CalloutType = "info" | "warning" | "danger" | "tip";

const STYLES: Record<
  CalloutType,
  { border: string; bg: string; icon: string; Icon: typeof Info }
> = {
  info: {
    border: "border-info/30",
    bg: "bg-info/5",
    icon: "text-info",
    Icon: Info,
  },
  warning: {
    border: "border-warning/30",
    bg: "bg-warning/5",
    icon: "text-warning",
    Icon: AlertTriangle,
  },
  danger: {
    border: "border-danger/30",
    bg: "bg-danger/5",
    icon: "text-danger",
    Icon: XCircle,
  },
  tip: {
    border: "border-success/30",
    bg: "bg-success/5",
    icon: "text-success",
    Icon: Lightbulb,
  },
};

type Props = {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
};

export function Callout({ type = "info", title, children }: Props) {
  const { border, bg, icon, Icon } = STYLES[type];
  return (
    <div className={`my-6 rounded-lg border ${border} ${bg} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${icon}`} />
        <div className="min-w-0">
          {title && (
            <p
              className={`font-mono text-xs font-semibold uppercase tracking-wide mb-1 ${icon}`}
            >
              {title}
            </p>
          )}
          <div className="text-sm text-text-secondary leading-relaxed [&>p]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
