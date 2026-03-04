import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_ROOT = path.join(process.cwd(), "content");

// ─── Types ────────────────────────────────────────────────────────────────────

export type Author = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  twitter?: string;
  github?: string;
  website?: string;
};

export type BlogCategory =
  | "tutorial"
  | "release"
  | "deep-dive"
  | "opinion"
  | "case-study"
  | "knowledge";

export type BlogPost = {
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  coverImage?: string;
  author: Author;
  tags: string[];
  category: BlogCategory;
  readTime: number;
  featured: boolean;
  draft: boolean;
  canonical?: string;
  relatedSlugs?: string[];
  content: string;
};

export type GuideSection =
  | "getting-started"
  | "commands"
  | "integrations"
  | "use-cases"
  | "reference";

export type Guide = {
  slug: string; // e.g. "getting-started/installation"
  section: GuideSection;
  order: number;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeToComplete: string;
  tags: string[];
  evnxVersion: string;
  prerequisites?: string[];
  draft: boolean;
  content: string;
};

export const GUIDE_SECTIONS: {
  key: GuideSection;
  label: string;
  description: string;
}[] = [
  {
    key: "getting-started",
    label: "Getting Started",
    description: "Install evnx and run your first scan in minutes.",
  },
  {
    key: "commands",
    label: "Commands",
    description: "Deep dive into every evnx command with real examples.",
  },
  {
    key: "integrations",
    label: "Integrations",
    description: "GitHub Actions, pre-commit, Docker, Kubernetes and more.",
  },
  {
    key: "use-cases",
    label: "Use Cases",
    description: "Solve specific problems with step-by-step walkthroughs.",
  },
  {
    key: "reference",
    label: "Reference",
    description: "Complete reference for config, formats, and patterns.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isProd() {
  return process.env.NODE_ENV === "production";
}

// ─── Authors ─────────────────────────────────────────────────────────────────

export function getAuthor(id: string): Author {
  const filePath = path.join(CONTENT_ROOT, "authors", `${id}.json`);
  if (!fs.existsSync(filePath)) {
    // Return a placeholder so pages don't crash during development
    return {
      id,
      name: id,
      role: "Contributor",
      avatar: "/authors/placeholder.jpg",
      bio: "",
    };
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Author;
}

export function getAllAuthors(): Author[] {
  const dir = path.join(CONTENT_ROOT, "authors");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map(
      (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Author,
    );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

function parseBlogFile(filename: string): BlogPost {
  const slug = filename.replace(/\.mdx?$/, "");
  const filePath = path.join(CONTENT_ROOT, "blog", filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const { minutes } = readingTime(content);
  return {
    ...data,
    slug,
    content,
    readTime: Math.ceil(minutes),
    author: getAuthor(data.author ?? "ajit"),
  } as BlogPost;
}

export function getAllBlogPosts(): BlogPost[] {
  const dir = path.join(CONTENT_ROOT, "blog");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map(parseBlogFile)
    .filter((post) => !isProd() || !post.draft)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function getBlogPost(slug: string): BlogPost | null {
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const candidate of candidates) {
    const filePath = path.join(CONTENT_ROOT, "blog", candidate);
    if (fs.existsSync(filePath)) return parseBlogFile(candidate);
  }
  return null;
}

export function getFeaturedBlogPosts(limit = 3): BlogPost[] {
  return getAllBlogPosts()
    .filter((p) => p.featured)
    .slice(0, limit);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getAllBlogPosts().filter((p) => p.tags.includes(tag));
}

export function getAllBlogTags(): string[] {
  const tags = new Set<string>();
  getAllBlogPosts().forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  if (post.relatedSlugs?.length) {
    return post.relatedSlugs
      .map((slug) => getBlogPost(slug))
      .filter(Boolean) as BlogPost[];
  }
  // Fall back to tag matching
  return getAllBlogPosts()
    .filter(
      (p) =>
        p.slug !== post.slug && p.tags.some((tag) => post.tags.includes(tag)),
    )
    .slice(0, limit);
}

// ─── Guides ───────────────────────────────────────────────────────────────────

function parseGuideFile(section: GuideSection, filename: string): Guide {
  const filePath = path.join(CONTENT_ROOT, "guides", section, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const slug = `${section}/${filename.replace(/\.mdx?$/, "")}`;
  return {
    order: 99,
    difficulty: "beginner",
    timeToComplete: "5 minutes",
    evnxVersion: "0.2.0",
    tags: [],
    ...data,
    slug,
    section,
    content,
  } as Guide;
}

export function getAllGuides(): Guide[] {
  const sections: GuideSection[] = [
    "getting-started",
    "commands",
    "integrations",
    "use-cases",
    "reference",
  ];
  const guides: Guide[] = [];

  for (const section of sections) {
    const sectionDir = path.join(CONTENT_ROOT, "guides", section);
    if (!fs.existsSync(sectionDir)) continue;

    fs.readdirSync(sectionDir)
      .filter((f) => /\.mdx?$/.test(f))
      .forEach((filename) => {
        guides.push(parseGuideFile(section, filename));
      });
  }

  return guides
    .filter((g) => !isProd() || !g.draft)
    .sort((a, b) => a.order - b.order);
}

export function getGuide(slugParts: string[]): Guide | null {
  if (slugParts.length < 2) return null;
  const section = slugParts[0] as GuideSection;
  const name = slugParts.slice(1).join("/");

  const candidates = [`${name}.mdx`, `${name}.md`];
  for (const candidate of candidates) {
    const filePath = path.join(CONTENT_ROOT, "guides", section, candidate);
    if (fs.existsSync(filePath)) return parseGuideFile(section, candidate);
  }
  return null;
}

export function getGuidesBySection(): Record<GuideSection, Guide[]> {
  const all = getAllGuides();
  const result = {} as Record<GuideSection, Guide[]>;
  for (const guide of all) {
    if (!result[guide.section]) result[guide.section] = [];
    result[guide.section].push(guide);
  }
  return result;
}

export function getAdjacentGuides(current: Guide): {
  prev: Guide | null;
  next: Guide | null;
} {
  const sectionGuides = getAllGuides().filter(
    (g) => g.section === current.section,
  );
  const idx = sectionGuides.findIndex((g) => g.slug === current.slug);
  return {
    prev: idx > 0 ? sectionGuides[idx - 1] : null,
    next: idx < sectionGuides.length - 1 ? sectionGuides[idx + 1] : null,
  };
}

// ─── Changelog ────────────────────────────────────────────────────────────────

export type ChangelogEntry = {
  version: string;
  releaseDate: string;
  type: "major" | "minor" | "patch";
  highlights: string[];
  content: string;
};

export function getAllChangelogs(): ChangelogEntry[] {
  const dir = path.join(CONTENT_ROOT, "changelog");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const { data, content } = matter(raw);
      return { ...data, content } as ChangelogEntry;
    })
    .sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
    );
}
