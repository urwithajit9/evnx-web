#!/usr/bin/env node
// Compile the MDX files this working tree touches, so a broken guide is caught
// before it is committed rather than at `next build`.
//
// Usage:
//   node mdxcheck.mjs              # unstaged + staged + untracked .mdx
//   node mdxcheck.mjs a.mdx b.mdx  # just these
//   node mdxcheck.mjs --all        # every guide in content/
//
// ⚠️ The file set matters more than it looks. The first version read only
// `git diff --name-only`, which lists neither staged nor untracked files — so it
// went quiet exactly when you were about to commit, and never saw a new guide at
// all.
import { compileMDX } from 'next-mdx-remote/rsc';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const git = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const args = process.argv.slice(2);
let files;

if (args.includes('--all')) {
  files = walk('content').filter((f) => f.endsWith('.mdx'));
} else if (args.length) {
  files = args;
} else {
  files = [
    ...git('git diff --name-only'),
    ...git('git diff --cached --name-only'),
    ...git('git ls-files --others --exclude-standard'),
  ].filter((f) => f.endsWith('.mdx'));
}

files = [...new Set(files)].filter((f) => fs.existsSync(f)).sort();

if (!files.length) {
  console.log('  no .mdx files to check');
  process.exit(0);
}

let bad = 0;
for (const f of files) {
  const { content, data } = matter(fs.readFileSync(f, 'utf8'));
  const label = f.replace(/^content\/guides\//, '');
  try {
    await compileMDX({ source: content, options: { parseFrontmatter: false } });
    console.log(`  OK   ${label} | v${data.evnxVersion ?? '—'}`);
  } catch (e) {
    console.log(`  FAIL ${label} -> ${e.message}`);
    bad++;
  }
}

console.log(`\n  ${files.length} file(s), ${bad} failure(s)`);
process.exitCode = bad ? 1 : 0;
