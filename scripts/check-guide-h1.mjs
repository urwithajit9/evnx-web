#!/usr/bin/env node
// RM-W3(a). Fails when a guide's content starts with `# Title`.
//
// docs.evnx.dev renders the frontmatter `title` as the page's <h1>. A guide
// whose body also opens with `# Title` ships two <h1> (RM-W2 removed 25 of
// them). Only the first heading of the body is checked; `#` lines inside code
// fences are comments, not headings.
//
//   node scripts/check-guide-h1.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GUIDES = join(ROOT, "packages", "docs-content", "guides");

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : /\.mdx?$/.test(n) ? [p] : [];
  });
}

const bad = [];
for (const file of walk(GUIDES)) {
  const lines = readFileSync(file, "utf8").split("\n");
  let i = 0;
  if (lines[0]?.trim() === "---") {
    i = lines.findIndex((l, n) => n > 0 && l.trim() === "---") + 1;
  }
  while (i < lines.length && (!lines[i].trim() || /^(import|export)\s/.test(lines[i]))) i++;
  if (/^# /.test(lines[i] ?? "")) bad.push(`${relative(ROOT, file)}:${i + 1}: ${lines[i]}`);
}

if (bad.length) {
  console.error("✗ guides that start with an in-content `# Title` (the layout already renders the title as <h1>):");
  for (const b of bad) console.error(`    ${b}`);
  console.error("\nDelete the `# …` line and keep the frontmatter `title`.");
  process.exit(1);
}
console.log("✓ no guide starts with an in-content `# Title`");
