import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ⚠️ A deliberate second copy of `cn` from apps/web/lib/utils.ts.
 *
 * It has 46 consumers there, and importing it from this package would point
 * the dependency the wrong way — a UI-primitives package should not depend on
 * the app that happens to use it most. Three lines of clsx + tailwind-merge is
 * a utility, not a fact: duplicating it costs nothing, where duplicating a
 * version number or a plan limit would be a second source of truth.
 *
 * Both collapse into packages/ui when that exists.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
