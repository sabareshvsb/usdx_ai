import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/instructions/[id]">
) {
  return orUnauthorized(async () => {
    const { id } = await ctx.params;
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    for (const field of [
      "title",
      "description",
      "image_url",
      "item_date",
      "link_text",
      "link_url",
      "sort_order",
    ]) {
      if (field in body) patch[field] = body[field];
    }
    if ("status" in body) {
      const status = body.status === "published" ? "published" : "draft";
      patch.status = status;
      if (status === "published") patch.published_at = new Date().toISOString();
    }
    patch.updated_at = new Date().toISOString();

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_instructions")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ instruction: data });
  });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/admin/instructions/[id]">
) {
  return orUnauthorized(async () => {
    const { id } = await ctx.params;
    const admin = getAdminClient();
    const { error } = await admin.from("cms_instructions").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}