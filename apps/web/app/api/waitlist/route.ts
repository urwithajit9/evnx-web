import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side route uses the service role key (never exposed to the browser).
// This bypasses RLS so we can always insert, even if anon policy is tightened.
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // fallback for dev

  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email, source: body.source ?? "api" });

    if (error) {
      // Postgres unique violation — already on the list
      if (error.code === "23505") {
        return NextResponse.json({ status: "duplicate" }, { status: 200 });
      }
      console.error("[waitlist route]", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" }, { status: 201 });
  } catch (err) {
    console.error("[waitlist route] unexpected:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Block non-POST methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
