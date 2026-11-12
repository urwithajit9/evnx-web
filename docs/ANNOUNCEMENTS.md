# Security notices and the announcement banner

This repository is public and `main` deploys to evnx.dev. Anything pushed to any
branch is readable by everyone immediately.

**Do not commit notice content, a notice entry, or banner text before the fix is
released and deployed.** Not on a branch, not in a draft PR, not with
`published: false`. Prepare the text elsewhere (a private gist, the private
GitHub security advisory) and bring it into the repo on deploy day.

## Publish a security notice

1. Write the body at `apps/web/content/security/<slug>.mdx` (plain MDX, no
   frontmatter; the title and summary come from the entry below).
2. Add an entry to `securityNotices` in `packages/content/src/security-notices.ts`:

   ```ts
   {
     slug: "<slug>",            // must match the MDX filename
     date: "<YYYY-MM-DD>",
     title: "<title>",
     summary: "<one or two sentences>",
     severity: "info",          // or "action-required"
     published: true,
   },
   ```

3. Open a PR. On merge the notice appears on `/security`, gets its own page at
   `/security/<slug>` and is added to the sitemap.

Entries with `published: false` render nowhere, but they are still public in the
repo, so do not use that as a place to stage content.

Check with `pnpm typecheck` and `pnpm check:links` before opening the PR.

## Turn the announcement banner on and off

Edit `ANNOUNCEMENT` in `packages/config/src/announcement.ts`:

```ts
export const ANNOUNCEMENT: Announcement = {
  id: "<unique-id>",
  enabled: true,
  message: "<one sentence>",
  href: "/security/<slug>",   // optional
  linkText: "<link label>",   // optional
  severity: "action",         // "info" or "action"
};
```

- Set `enabled: false` to turn it off. It then renders nothing.
- Visitors can dismiss it; this is remembered per `id` in their browser. Use a
  new `id` for each announcement so people who dismissed an earlier one see it.
- The banner is on evnx.dev only. `apps/docs` has its own layout and does not
  render it.
