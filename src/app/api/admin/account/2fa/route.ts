import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";
import { verifyPassword, verifyTotp } from "@/lib/auth";

/** Enable 2FA — requires the code produced by the just-generated secret. */
export async function POST(request: Request) {
  return orUnauthorized(async (admin) => {
    const body = await request.json().catch(() => null);
    const secret = typeof body?.secret === "string" ? body.secret : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!secret || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Enter the 6-digit code from your authenticator app." },
        { status: 400 }
      );
    }
    if (!verifyTotp(secret, code)) {
      return NextResponse.json(
        { error: "That code is invalid or expired. Try again." },
        { status: 400 }
      );
    }

    const client = getAdminClient();
    const { error } = await client
      .from("admins")
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret,
        updated_at: new Date().toISOString(),
      })
      .eq("id", admin.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}

/** Disable 2FA — requires current password + a valid TOTP code. */
export async function DELETE(request: Request) {
  return orUnauthorized(async (admin) => {
    const body = await request.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    const client = getAdminClient();
    const { data: row } = await client
      .from("admins")
      .select("*")
      .eq("id", admin.id)
      .single();
    if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });

    if (!verifyPassword(password, row.password_hash)) {
      return NextResponse.json(
        { error: "Password is incorrect." },
        { status: 400 }
      );
    }
    if (!row.two_factor_secret || !verifyTotp(row.two_factor_secret, code)) {
      return NextResponse.json(
        { error: "Two-factor code is invalid." },
        { status: 400 }
      );
    }

    const { error } = await client
      .from("admins")
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", admin.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}