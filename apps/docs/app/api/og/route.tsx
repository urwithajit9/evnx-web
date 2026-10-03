import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Share cards, generated on request.
 *
 * ⚠️ A route handler rather than Next's `opengraph-image.tsx` file convention,
 * because that convention is illegal inside a catch-all segment — Next refuses
 * with "Catch-all must be the last part of the URL". Every guide lives under
 * `/cli/[...slug]`, so the file convention can never produce a per-guide card
 * here. The route takes the title as a parameter instead.
 *
 * Per-page rather than one static image: 57 guides sharing a single card means
 * every link anyone posts looks identical, which is most of what a share card
 * is for.
 *
 * No custom font on purpose. Loading one means fetching and embedding a binary
 * on every request, and the system stack renders this layout fine. A card that
 * always works beats a prettier one that sometimes times out.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "evnx documentation").slice(0, 110);
  const kicker = (searchParams.get("kicker") ?? "Documentation").slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d1117",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 16, height: 28, background: "#f2711c", borderRadius: 2 }} />
          <div style={{ fontSize: 30, color: "#e6edf3", fontWeight: 600 }}>evnx</div>
          <div style={{ fontSize: 26, color: "#8b949e" }}>docs</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              color: "#f2711c",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 20,
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              fontSize: title.length > 44 ? 62 : 76,
              color: "#e6edf3",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#8b949e" }}>docs.evnx.dev</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
