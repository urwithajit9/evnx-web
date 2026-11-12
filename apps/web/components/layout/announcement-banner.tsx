"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ANNOUNCEMENT } from "@evnx/config";

const STORAGE_PREFIX = "evnx:announcement-dismissed:";

function isDismissed(id: string): boolean {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + id) === "1";
  } catch {
    return false; // storage blocked: show it, it just won't be remembered
  }
}

function remember(id: string) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + id, "1");
  } catch {
    /* ignore — dismissal still lasts for this page view */
  }
}

/**
 * Site-wide announcement, driven by `ANNOUNCEMENT` in @evnx/config.
 *
 * Renders nothing when `enabled` is false. When enabled it is rendered on the
 * server too (so a visitor who has not dismissed it sees no layout shift), and
 * the first client render matches the server exactly; localStorage is read only
 * in an effect, after hydration, so there is no hydration mismatch. A visitor
 * who already dismissed it sees it for one frame before it is removed.
 */
export function AnnouncementBanner() {
  const { id, enabled, message, href, linkText, severity } = ANNOUNCEMENT;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed(id)) setDismissed(true);
  }, [id]);

  if (!enabled || dismissed) return null;

  const tone =
    severity === "action"
      ? "bg-warning/10 border-warning/30 text-warning"
      : "bg-info/10 border-info/30 text-info";
  const isExternal = href ? /^https?:\/\//.test(href) : false;
  const label = linkText ?? "Learn more";

  return (
    <div
      role="region"
      aria-label="Announcement"
      className={`border-b ${tone}`}
    >
      <div className="container-base flex items-center gap-3 py-2 font-mono text-xs">
        <p className="flex-1 text-text-primary leading-relaxed">
          {message}
          {href && (
            <>
              {" "}
              {isExternal ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:no-underline"
                >
                  {label}
                </a>
              ) : (
                <Link href={href} className="underline underline-offset-2 hover:no-underline">
                  {label}
                </Link>
              )}
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            remember(id);
            setDismissed(true);
          }}
          aria-label="Dismiss announcement"
          className="p-1 rounded text-text-secondary hover:text-text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
