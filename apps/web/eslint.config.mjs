// ESLint 9 flat config for apps/web.
//
// ⚠️ Replaces .eslintrc.json and `next lint`: Next 16 removed `next lint`, and
// ESLint 9 no longer reads .eslintrc.*, so `pnpm lint` failed with "Invalid
// project directory … /apps/web/lint" before it linted anything. Same rule set
// as before (next/core-web-vitals), now loaded the flat-config way.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "public/pagefind/**", "next-env.d.ts"]),
]);
