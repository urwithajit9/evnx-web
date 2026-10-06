// ⚠️ ⚠️  NOTHING IN THIS FILE IS RENDERED.  ⚠️ ⚠️
//
// `nav` and `footer` below are exported and imported by **zero** files. The
// live header and footer each hardcode their own link list:
//
//     apps/web/components/layout/header.tsx
//     apps/web/components/layout/footer.tsx
//
// This cost a real mistake on 2026-10-06: a refund-policy link was added here
// to satisfy a payment processor's "your site must link to this" requirement,
// the build passed, the deploy went out, and the link was nowhere on the site.
// The two components were the only things that mattered and neither reads this.
//
// Changing a nav or footer link means editing those two components. Edit this
// file only if you are also wiring them up to it.

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
  ],
};
