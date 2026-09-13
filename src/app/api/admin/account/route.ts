import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";

/** Returns the current admin profile plus active sessions. */
export async function GET() {
  return orUnauthorized(async (admin) => {
    const client = getAdminClient();
    const { data: sessions, error } = await client
      .from("admin_sessions")
      .select("id, created_at, expires_at, user_agent, ip")
      .eq("admin_id", admin.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ admin, sessions: sessions ?? [] });
  });
}

/** Updates the admin display name. */
export async function PATCH(request: Request) {
  return orUnauthorized(async (admin) => {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    const client = getAdminClient();
    const { data, error } = await client
      .from("admins")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", admin.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      admin: {
        id: String(data.id),
        email: String(data.email),
        name: String(data.name),
      },
    });
  });
}