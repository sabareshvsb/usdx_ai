import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/leaderboard/[id]">
) {
  return orUnauthorized(async () => {
    const { id } = await ctx.params;
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    for (const field of ["name", "business_volume", "rank", "change_24h", "avatar_url"]) {
      if (field in body) {
        const value = body[field];
        if ((field === "business_volume" || field === "change_24h") && value !== null) {
          patch[field] = Number(value);
        } else if (field === "rank" && value !== null) {
          patch[field] = Math.max(1, Math.round(Number(value)));
        } else {
          patch[field] = value;
        }
      }
    }
    if ("enabled" in body) patch.enabled = !!body.enabled;
    if ("status" in body) {
      const status = body.status === "published" ? "published" : "draft";
      patch.status = status;
      if (status === "published") patch.published_at = new Date().toISOString();
    }
    patch.updated_at = new Date().toISOString();

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_leaderboard")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entry: data });
  });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/admin/leaderboard/[id]">
) {
  return orUnauthorized(async () => {
    const { id } = await ctx.params;
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_leaderboard")
      .delete()
      .eq("id", id)
      .select("rank");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Close the gap: renumber remaining ranks so the board stays contiguous.
    if (data?.[0]) {
      const { data: rest } = await admin
        .from("cms_leaderboard")
        .select("id, rank")
        .order("rank", { ascending: true });
      for (const [i, row] of (rest ?? []).entries()) {
        if (row.rank !== i + 1) {
          await admin.from("cms_leaderboard").update({ rank: i + 1 }).eq("id", row.id);
        }
      }
    }
    return NextResponse.json({ ok: true });
  });
}