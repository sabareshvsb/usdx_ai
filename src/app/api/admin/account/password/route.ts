import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  return orUnauthorized(async (admin) => {
    const body = await request.json().catch(() => null);
    const current = typeof body?.current === "string" ? body.current : "";
    const next = typeof body?.next === "string" ? body.next : "";

    if (next.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const client = getAdminClient();
    const { data: row } = await client
      .from("admins")
      .select("*")
      .eq("id", admin.id)
      .single();
    if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });

    if (!verifyPassword(current, row.password_hash)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const { error } = await client
      .from("admins")
      .update({
        password_hash: hashPassword(next),
        updated_at: new Date().toISOString(),
      })
      .eq("id", admin.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  });
}