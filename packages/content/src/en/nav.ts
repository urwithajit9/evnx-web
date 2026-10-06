// ─── Navigation and footer ────────────────────────────────────────────────────
//
// ⚠️ `href` is left empty for anything that points at documentation. The
// renderer fills it with `docsUrl(docsSlug)` from @evnx/config, so the docs
// split is a config flip rather than an edit to every link on the site.

export interface NavItem {
  label: string;
  /** An absolute path on this site, or "" when `docsSlug` is set. */
  href?: string;
  /** A documentation slug — resolved through `docsUrl()` at render time. */
  docsSlug?: string;
  external?: boolean;
  badge?: string;
}

export const nav: {
  primary: NavItem[];
  actions: { login: NavItem; signup: NavItem; github: NavItem };
} = {
  primary: [
    { label: "Docs", docsSlug: "" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/changelog" },
  ],
  actions: {
    // `href` filled by the renderer from `appUrl()` — ADR-1, the product is a
    // different origin and must look like one.
    login: { label: "Log in", external: true },
    signup: { label: "Get started", external: true },
    github: { label: "GitHub", external: true },
  },
};

export const footer: {
  columns: { title: string; items: NavItem[] }[];
  /** The sister-site disclosure. Required — same maintainer, stated plainly. */
  disclosure: string;
  legal: NavItem[];
} = {
  columns: [
    {
      title: "Product",
      items: [
        { label: "Install", href: "/install" },
        { label: "Pricing", href: "/pricing" },
        { label: "Changelog", href: "/changelog" },
        { label: "Talks", href: "/talks" },
      ],
    },
    {
      title: "Documentation",
      items: [
        { label: "Quick start", docsSlug: "getting-started/quick-start" },
        { label: "Commands", docsSlug: "commands" },
        { label: "Cloud architecture", docsSlug: "reference/cloud-architecture" },
        { label: "CI/CD", docsSlug: "integrations" },
      ],
    },
    {
      title: "Open source",
      items: [
        { label: "evnx CLI", external: true },
        { label: "evnx-server", external: true },
        { label: "evnx-crypto", external: true },
        { label: "Discussions", external: true },
      ],
    },
    {
      title: "More",
      items: [
        { label: "dotenv.space", external: true },
        { label: "Blog", href: "/blog" },
        { label: "Security", href: "/security" },
      ],
    },
  ],

  disclosure:
    "dotenv.space is a vendor-neutral reference for how .env files behave. Same maintainer as evnx, kept separate on purpose.",

  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    // ⚠️ Linked, not merely published. Paddle's website verification requires
    // the site to LINK to its refund policy, not just host one — an unlinked
    // page can fail review even though the URL resolves.
    { label: "Refunds", href: "/refunds" },
  ],
};
