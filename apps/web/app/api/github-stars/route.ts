import { NextResponse } from "next/server";

// Cache the response for 1 hour — GitHub API has rate limits
export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch("https://api.github.com/repos/urwithajit9/evnx", {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // Optional: add a token to raise rate limit from 60 to 5000 req/hr
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { stars: null, error: "GitHub API error" },
        { status: 200 },
      );
    }

    const data = await res.json();
    return NextResponse.json({ stars: data.stargazers_count ?? 0 });
  } catch {
    return NextResponse.json(
      { stars: null, error: "fetch failed" },
      { status: 200 },
    );
  }
}
