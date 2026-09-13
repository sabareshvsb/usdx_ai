import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";

type Ctx = RouteContext<"/api/admin/settings/[id]">;

export async function DELETE(_request: Request, ctx: Ctx) {
  return orUnauthorized(async () => {
    const { id } = await ctx.params;
    const admin = getAdminClient();
    const { error } = await admin.from("cms_settings").delete().eq("key", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}