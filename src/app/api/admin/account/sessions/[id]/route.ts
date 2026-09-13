import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";

/** Revoke one of the admin's active sessions (all devices → delete all). */
export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/admin/account/sessions/[id]">
) {
  return orUnauthorized(async (admin) => {
    const { id } = await ctx.params;
    const client = getAdminClient();
    let query = client.from("admin_sessions").delete().eq("admin_id", admin.id);
    if (id !== "all") query = query.eq("id", id);
    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}