"use client";

// D-V6: follow the OS setting, with a manual override that next-themes keeps
// in localStorage. `attribute="class"` (not data-theme) so Tailwind's
// `darkMode: ["class"]` and mermaid's MutationObserver on <html> keep working.
// Its inline script sets the class before first paint, so there is no flash.
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
