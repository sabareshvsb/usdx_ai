import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import {
  createSession,
  touchLogin,
  verifyPassword,
  verifyTotp,
  shapeAdmin,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const totp = typeof body?.totp === "string" ? body.totp.trim() : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`login:${email}:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("admins")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error || !data || data.status !== "active") {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (!verifyPassword(password, data.password_hash)) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (data.two_factor_enabled) {
    if (!data.two_factor_secret || !verifyTotp(data.two_factor_secret, totp)) {
      return NextResponse.json(
        { error: "Two-factor code is required or invalid." },
        { status: 401 }
      );
    }
  }

  await createSession(String(data.id), {
    userAgent: request.headers.get("user-agent") ?? undefined,
    ip,
  });
  await touchLogin(String(data.id));

  return NextResponse.json({ admin: shapeAdmin(data) });
}