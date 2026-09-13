import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";

export async function GET() {
  return orUnauthorized(async () => {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_leaderboard")
      .select("*")
      .order("rank", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ leaderboard: data });
  });
}

export async function POST(request: Request) {
  return orUnauthorized(async () => {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Participant name is required." }, { status: 400 });
    }

    const admin = getAdminClient();
    // Default rank to one past the current max so the entry lands at the bottom.
    const { data: maxRank } = await admin
      .from("cms_leaderboard")
      .select("rank")
      .order("rank", { ascending: false })
      .limit(1);
    const rank =
      typeof body.rank === "number"
        ? Math.max(1, Math.round(body.rank))
        : Number(maxRank?.[0]?.rank ?? 0) + 1;

    const { data, error } = await admin
      .from("cms_leaderboard")
      .insert({
        name,
        business_volume: Number(body.business_volume ?? 0),
        rank,
        change_24h: body.change_24h === undefined ? 0 : Number(body.change_24h),
        avatar_url: body.avatar_url ?? "",
        status: body.status === "published" ? "published" : "draft",
        enabled: body.enabled !== false,
        published_at: body.status === "published" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entry: data });
  });
}